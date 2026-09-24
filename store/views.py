import hashlib
import hmac
import json
import re
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db import transaction
from django.http import JsonResponse
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST
from .integrations.exceptions import IntegrationError, IntegrationNotConfigured
from .integrations.fastrr import FastrrClient, payments_configured, verify_webhook
from .integrations.shiprocket import (
    ShiprocketClient, create_shipment_for_paid_order, quote_for_lines, shipping_configured,
)
from .models import DigitalLearningRequest, GuestOrder, IntegrationEvent, OrderItem, PaymentAttempt, Product, PublicOutreachRequest, ShipmentEvent
from .resource_import import normalize_isbn

DELIVERY_OPTIONS = {
    'STANDARD': {'shippingCharge': 200, 'deliveryLabel': 'Standard delivery', 'deliveryTimeline': '6–8 working days'},
    'PRIORITY': {'shippingCharge': 500, 'deliveryLabel': 'Priority delivery', 'deliveryTimeline': '2–3 working days'},
}


def delivery_option(value):
    return DELIVERY_OPTIONS.get(str(value or 'STANDARD').strip().upper())


OUTREACH_FORMS = {
    'GENERAL_ENQUIRY': ('General Enquiry', 'General Support', 'Customer Care'),
    'EDITORIAL_FEEDBACK': ('Teacher & Editorial Feedback', 'Academic Support', 'Academic Editorial'),
    'SAMPLE_REQUEST': ('Sample Book Enquiry', 'Samples', 'Sample Desk'),
    'ORDER_DISCREPANCY': ('Order or Delivery Issue', 'Orders', 'Order Operations'),
    'DIGITAL_SUPPORT': ('Digital Resource Support', 'Digital Learning', 'Digital Support'),
    'AUTHOR_SUBMISSION': ('Author & Manuscript Enquiry', 'Publishing', 'Author Acquisition'),
    'SCHOOL_REQUIREMENT': ('School Requirement', 'Schools', 'Academic Support'),
    'ACCESSIBILITY_SUPPORT': ('Accessibility Support', 'Accessibility', 'Accessibility Review'),
    'BUSINESS_PARTNERSHIP': ('Business Partnership', 'Partnerships', 'Business Development'),
    'RIGHTS_PERMISSIONS': ('Rights and Permissions', 'Rights & Permissions', 'Rights and Legal'),
    'REPORT_PIRACY': ('Report Suspected Piracy', 'Rights Protection', 'Anti-Piracy'),
}
OUTREACH_REQUIRED = {
    'GENERAL_ENQUIRY': {'fullName', 'email', 'mobile', 'city', 'state', 'pincode', 'topic', 'description'},
    'EDITORIAL_FEEDBACK': {'fullName', 'organisationName', 'email', 'mobile', 'city', 'state', 'pincode', 'designation', 'board', 'issueType', 'description'},
    'SAMPLE_REQUEST': {'fullName', 'organisationName', 'email', 'mobile', 'city', 'state', 'pincode', 'designation', 'evaluationPurpose', 'description'},
    'ORDER_DISCREPANCY': {'fullName', 'email', 'mobile', 'city', 'state', 'pincode', 'affectedTitle', 'issueType', 'description'},
    'DIGITAL_SUPPORT': {'fullName', 'email', 'mobile', 'city', 'state', 'pincode', 'supportIntent', 'description'},
    'AUTHOR_SUBMISSION': {'fullName', 'email', 'mobile', 'city', 'state', 'pincode', 'qualification', 'expertise', 'proposedRole', 'proposedTitle', 'description', 'rightsDeclaration'},
    'SCHOOL_REQUIREMENT': {'fullName', 'organisationName', 'email', 'mobile', 'city', 'state', 'pincode', 'designation', 'board', 'classes', 'subjects', 'requirementType'},
    'ACCESSIBILITY_SUPPORT': {'fullName', 'email', 'mobile', 'city', 'state', 'pincode', 'requirementType', 'description'},
    'BUSINESS_PARTNERSHIP': {'legalBusinessName', 'fullName', 'email', 'mobile', 'businessType', 'territory', 'description'},
    'RIGHTS_PERMISSIONS': {'fullName', 'email', 'mobile', 'city', 'state', 'pincode', 'contentRequested', 'intendedUse', 'territory', 'duration'},
    'REPORT_PIRACY': {'issueType', 'bookOrSeries', 'description'},
}
@require_GET
def catalogue(request):
    products = Product.objects.filter(active=True, public_visibility=True).order_by(
        'series_title', 'level', 'title',
    )
    grouped = {}
    for product in products:
        series = grouped.setdefault(product.series_code, {
            'id': product.series_code,
            'slug': product.series_slug,
            'title': product.series_title,
            'imprint': product.imprint,
            'subject': product.subject,
            'category': product.category,
            'stage': product.stage,
            'gradeRange': product.grade_range,
            'description': product.description,
            'digitalFeatures': product.digital_features,
            'coverImageUrl': product.cover_image_url,
            'coverTone': product.cover_tone,
            'featured': product.featured,
            'publicVisibility': product.public_visibility,
            'variants': [],
        })
        series['variants'].append({
            'id': product.sku,
            'sku': product.sku,
            'isbn': product.isbn,
            'title': product.title,
            'level': product.level,
            'coverImageUrl': product.cover_image_url,
            'priceINR': product.price_inr,
            'stockQuantity': product.stock_quantity,
            'available': product.stock_quantity > 0,
        })
    series_list = list(grouped.values())
    values = lambda field: sorted({item[field] for item in series_list if item[field]})
    features = sorted({feature for item in series_list for feature in item['digitalFeatures']})
    return JsonResponse({
        'catalogue': series_list,
        'meta': {
            'title': 'Souvenir Publishers Catalogue',
            'seriesCount': len(series_list),
            'publicSeriesCount': len(series_list),
            'variantCount': sum(len(item['variants']) for item in series_list),
        },
        'filters': {
            'imprints': values('imprint'), 'subjects': values('subject'),
            'categories': values('category'), 'stages': values('stage'), 'features': features,
        },
    })


@require_GET
def student_resources(request):
    products = Product.objects.filter(
        active=True, public_visibility=True, digital_resource__student_url__gt='',
    ).select_related('digital_resource').order_by('series_title', 'title')
    return JsonResponse({'books': [{
        'isbn': product.isbn,
        'title': product.title,
        'series': product.series_title,
        'subject': product.subject,
        'digitalFeatures': product.digital_features,
        'coverPhotoLink': product.cover_image_url,
    } for product in products]})


@csrf_exempt
@require_POST
def student_resource_access(request):
    payload = parse_json(request)
    if payload is None:
        return error('Invalid JSON body.')
    isbn = normalize_isbn(payload.get('isbn'))
    book_isbn = normalize_isbn(payload.get('book_isbn'))
    if not isbn or not book_isbn or not hmac.compare_digest(isbn, book_isbn):
        return error('The ISBN does not match this book.', 403, 'INVALID_BOOK_ACCESS')
    product = Product.objects.filter(
        active=True, public_visibility=True, isbn=book_isbn,
    ).select_related('digital_resource').first()
    resource = getattr(product, 'digital_resource', None) if product else None
    if not resource or not resource.student_url:
        return error('Student resources are not available for this book.', 404, 'RESOURCE_NOT_AVAILABLE')
    return JsonResponse({'resourceUrl': resource.student_url})


@csrf_exempt
@require_POST
def teacher_resource(request):
    payload = parse_json(request)
    if payload is None:
        return error('Invalid JSON body.')
    isbn = normalize_isbn(payload.get('isbn'))
    password = normalize_isbn(payload.get('password'))
    bypass_code = normalize_isbn(settings.TEACHER_RESOURCE_BYPASS_CODE)
    if (bypass_code and isbn and password
            and hmac.compare_digest(isbn, bypass_code)
            and hmac.compare_digest(password, bypass_code)):
        products = Product.objects.filter(
            active=True, public_visibility=True, digital_resource__teacher_url__gt='',
        ).select_related('digital_resource').order_by('series_title', 'title')
        return JsonResponse({'accessMode': 'CATALOGUE', 'books': [{
            'isbn': product.isbn, 'title': product.title, 'series': product.series_title,
            'subject': product.subject, 'digitalFeatures': product.digital_features,
            'coverPhotoLink': product.cover_image_url,
            'resourceUrl': product.digital_resource.teacher_url,
        } for product in products]})
    if not isbn or not password or not hmac.compare_digest(isbn, password):
        return error('The ISBN or password is incorrect.', 403, 'INVALID_TEACHER_ACCESS')
    product = Product.objects.filter(active=True, isbn=isbn).select_related('digital_resource').first()
    if not product:
        return error('No active book was found for this ISBN.', 404, 'BOOK_NOT_FOUND')
    resource = getattr(product, 'digital_resource', None)
    if not resource or not resource.teacher_url:
        return error('Teacher resources are not available for this book yet.', 404, 'RESOURCE_NOT_AVAILABLE')
    return JsonResponse({
        'accessMode': 'DIRECT',
        'isbn': product.isbn, 'title': product.title, 'series': product.series_title,
        'resourceUrl': resource.teacher_url,
    })


@csrf_exempt
@require_POST
def create_digital_learning_request(request):
    payload = parse_json(request)
    if payload is None:
        return error('Invalid JSON body.')
    allowed_roles = {
        'STUDENT', 'TEACHER_SCHOOL_ADMIN', 'AUTHORIZED_SALES_PERSON',
        'AUTHORIZED_BOOKSELLER_DISTRIBUTOR',
    }
    requester_role = str(payload.get('requesterRole', '')).strip().upper()
    if requester_role not in allowed_roles:
        return error('Choose a valid requester role.')
    series_code = str(payload.get('seriesId', '')).strip()
    selected_skus = payload.get('classIds')
    if not series_code or not isinstance(selected_skus, list) or not selected_skus:
        return error('Choose a valid catalogue series and at least one book.')
    products = list(Product.objects.filter(
        active=True, public_visibility=True, sku__in=selected_skus, series_code=series_code,
    ).order_by('title'))
    if len(products) != len(set(str(item) for item in selected_skus)):
        return error('One or more selected books are unavailable or do not belong to this series.')
    resource_codes = payload.get('resourceCodes')
    if not isinstance(resource_codes, list) or not resource_codes or any(not str(code).strip() for code in resource_codes):
        return error('Select at least one resource.')
    teacher_codes = {'TEACHER_RESOURCE', 'QUESTION_PAPER_GENERATOR', 'EXAM_PRO', 'ANSWER_KEY'}
    if requester_role == 'STUDENT' and teacher_codes.intersection(resource_codes):
        return error('Teacher-only resources cannot be requested by a student.', 403, 'FORBIDDEN')
    requester_name = str(payload.get('requesterName') or payload.get('recipientName') or '').strip()
    school_name = str(payload.get('schoolInstitutionName', '')).strip()
    state_code = str(payload.get('stateCode', '')).strip().upper()
    pin_code = str(payload.get('pinCode', '')).strip()
    purpose = str(payload.get('purpose', '')).strip()
    usage_details = str(payload.get('usageDetails', '')).strip()
    if not requester_name or not school_name or not state_code or not re.fullmatch(r'[1-9]\d{5}', pin_code):
        return error('Requester, school, state and a valid six-digit PIN code are required.')
    if not purpose or len(usage_details) < 20:
        return error('Choose a purpose and provide at least 20 characters explaining the use.')
    if not payload.get('authorisedConfirmed') or not payload.get('privacyAcknowledged'):
        return error('Authorisation and privacy confirmation are required.')
    email = str(payload.get('email') or payload.get('recipientEmail') or '').strip().lower()
    mobile = clean_mobile(payload.get('mobile') or payload.get('recipientMobile'))
    guardian_contact = str(payload.get('guardianContact', '')).strip()
    if requester_role == 'STUDENT':
        if '@' in guardian_contact:
            email = guardian_contact.lower()
        else:
            mobile = clean_mobile(guardian_contact)
    if email:
        try:
            validate_email(email)
        except ValidationError:
            return error('Enter a valid contact email address.')
    if requester_role == 'STUDENT':
        if not email and not mobile:
            return error('Enter a valid parent or guardian email or Indian mobile number.')
    elif not email or not mobile:
        return error('A valid contact email and ten-digit Indian mobile number are required.')
    item = DigitalLearningRequest.objects.create(
        requester_role=requester_role,
        requester_name=requester_name,
        requester_designation=str(payload.get('requesterDesignation', '')).strip(),
        requester_organisation=str(payload.get('requesterOrganisation', '')).strip(),
        school_name=school_name,
        school_board=str(payload.get('schoolBoard', '')).strip(),
        email=email or '', mobile=mobile or '', state_code=state_code, pin_code=pin_code,
        subject=products[0].subject, series_code=products[0].series_code,
        series_title=products[0].series_title,
        selected_books=[{'sku': product.sku, 'isbn': product.isbn, 'title': product.title} for product in products],
        resource_codes=[str(code).strip() for code in resource_codes],
        purpose=purpose, usage_details=usage_details,
        additional_details={
            'parentGuardianName': str(payload.get('parentGuardianName', '')).strip(),
            'guardianContact': guardian_contact,
            'recipientName': str(payload.get('recipientName', '')).strip(),
            'recipientDesignation': str(payload.get('recipientDesignation', '')).strip(),
            'recipientEmail': str(payload.get('recipientEmail', '')).strip(),
            'recipientMobile': str(payload.get('recipientMobile', '')).strip(),
            'partnerKey': str(payload.get('partnerKey', '')).strip(),
        },
    )
    return JsonResponse({'reference': item.reference, 'status': item.status}, status=201)


@require_POST
def create_outreach_request(request):
    payload = parse_json(request)
    if payload is None:
        return error('Invalid JSON body.')
    form_type = str(payload.get('formType', '')).strip().upper()
    definition, values = OUTREACH_FORMS.get(form_type), payload.get('values')
    attachments = payload.get('files') or []
    if not definition or not isinstance(values, dict):
        return error('Choose a valid outreach form.')
    if payload.get('honeypot'):
        return error('The submission could not be accepted.')
    if not isinstance(attachments, list) or len(attachments) > 10:
        return error('A maximum of 10 attachment references is allowed.')
    missing = [field for field in OUTREACH_REQUIRED[form_type] if values.get(field) in (None, '', False)]
    if missing:
        return error('Complete all required fields before submitting.')
    email = str(values.get('email') or '').strip().lower()
    if email:
        try:
            validate_email(email)
        except ValidationError:
            return error('Enter a valid email address.')
    mobile_value = values.get('mobile')
    if mobile_value and not clean_mobile(mobile_value):
        return error('Enter a valid ten-digit Indian mobile number.')
    pincode = str(values.get('pincode') or '').strip()
    if pincode and not re.fullmatch(r'[1-9]\d{5}', pincode):
        return error('Enter a valid six-digit Indian PIN code.')
    title, category, team = definition
    item = PublicOutreachRequest.objects.create(
        form_type=form_type, form_title=title, category=category,
        requester_name=str(values.get('fullName') or values.get('legalBusinessName') or '').strip(),
        organisation=str(values.get('organisationName') or values.get('legalBusinessName') or '').strip(),
        email=str(values.get('email') or values.get('adultEmail') or '').strip().lower(),
        mobile=str(values.get('mobile') or '').strip(), state=str(values.get('state') or '').strip(),
        payload=values, attachments=attachments,
        confidential=form_type == 'REPORT_PIRACY' or bool(values.get('confidential')),
        assigned_team=team,
        history=[{'action': 'SUBMITTED', 'status': 'NEW', 'actor': 'Public visitor', 'at': timezone.now().isoformat()}],
    )
    return JsonResponse({'publicReference': item.reference, 'status': item.status}, status=201)


def serialize_hub_outreach(item):
    return {'id': item.id, 'source': 'OUTREACH', 'reference': item.reference,
            'requestType': item.form_type, 'title': item.form_title, 'category': item.category,
            'status': item.status, 'requesterName': item.requester_name, 'organisation': item.organisation,
            'email': item.email, 'mobile': item.mobile, 'state': item.state, 'confidential': item.confidential,
            'assignedTeam': item.assigned_team, 'assignedTo': item.assigned_to,
            'payload': item.payload, 'attachments': item.attachments, 'notes': item.internal_notes,
            'history': item.history, 'createdAt': item.created_at.isoformat(), 'updatedAt': item.updated_at.isoformat()}


def serialize_hub_digital(item):
    details = item.additional_details or {}
    return {'id': item.id, 'source': 'DIGITAL', 'reference': item.reference,
            'requestType': 'DIGITAL_RESOURCE_REQUEST', 'title': 'Digital Resource Request',
            'category': 'Digital Learning', 'status': item.status,
            'requesterName': item.requester_name, 'organisation': item.school_name or item.requester_organisation,
            'email': item.email, 'mobile': item.mobile, 'state': item.state_code, 'confidential': False,
            'assignedTeam': details.get('_assignedTeam', 'Digital Support'), 'assignedTo': details.get('_assignedTo', ''),
            'payload': {'requesterRole': item.requester_role, 'designation': item.requester_designation,
                        'schoolBoard': item.school_board, 'subject': item.subject, 'series': item.series_title,
                        'selectedBooks': item.selected_books, 'resourceCodes': item.resource_codes,
                        'purpose': item.purpose, 'usageDetails': item.usage_details},
            'attachments': [], 'notes': details.get('_internalNotes', []), 'history': details.get('_history', []),
            'createdAt': item.created_at.isoformat(), 'updatedAt': item.updated_at.isoformat()}


def serialize_hub_order(order):
    address = order.address or {}
    delivery = DELIVERY_OPTIONS.get(order.delivery_type, {})
    return {
        'id': order.id, 'source': 'ORDER', 'reference': order.order_number,
        'requestType': 'CUSTOMER_ORDER', 'title': 'Book Order', 'category': 'E-commerce Order',
        'status': order.order_status, 'requesterName': order.customer_name, 'organisation': '',
        'email': order.email, 'mobile': order.mobile, 'state': str(address.get('state') or ''),
        'confidential': False, 'assignedTeam': 'Order Operations', 'assignedTo': '',
        'payload': {
            'items': [{'sku': item.sku, 'title': item.title, 'quantity': item.quantity,
                       'unitPrice': f'₹{item.unit_price:,}', 'lineTotal': f'₹{item.line_total:,}'}
                      for item in order.items.all()],
            'deliveryAddress': address, 'deliveryType': delivery.get('deliveryLabel', order.delivery_type),
            'deliveryTimeline': delivery.get('deliveryTimeline', ''),
            'subtotal': f'₹{order.subtotal:,}', 'shippingCharge': f'₹{order.shipping_charge:,}',
            'orderTotal': f'₹{order.total:,}', 'paymentStatus': order.payment_status,
            'shipmentStatus': order.shipment_status, 'courier': order.courier_name,
            'trackingAwb': order.shiprocket_awb,
        },
        'attachments': [], 'notes': [], 'history': [],
        'createdAt': order.created_at.isoformat(), 'updatedAt': order.updated_at.isoformat(),
    }


@require_GET
def request_hub(request):
    items = [serialize_hub_outreach(item) for item in PublicOutreachRequest.objects.all()]
    items += [serialize_hub_digital(item) for item in DigitalLearningRequest.objects.all()]
    items += [serialize_hub_order(item) for item in GuestOrder.objects.prefetch_related('items').all()]
    items.sort(key=lambda item: item['createdAt'], reverse=True)
    return JsonResponse({'requests': items})


@require_POST
def update_hub_request(request, source, request_id):
    if source.upper() not in {'OUTREACH', 'DIGITAL', 'ORDER'}:
        return error('Unknown request source.', 400, 'INVALID_SOURCE')
    payload = parse_json(request)
    if payload is None:
        return error('Invalid JSON body.')
    status = str(payload.get('status', '')).strip().upper()
    team, assignee = str(payload.get('assignedTeam', '')).strip()[:120], str(payload.get('assignedTo', '')).strip()[:160]
    note = str(payload.get('note', '')).strip()[:2000]
    actor, now = 'Request dashboard', timezone.now().isoformat()
    if source.upper() == 'ORDER':
        item = GuestOrder.objects.prefetch_related('items').filter(pk=request_id).first()
        if not item:
            return error('Order not found.', 404, 'NOT_FOUND')
        if status and status not in dict(GuestOrder.ORDER_STATUSES):
            return error('Choose a valid order status.')
        item.order_status = status or item.order_status
        item.save(update_fields=['order_status', 'updated_at'])
        return JsonResponse(serialize_hub_order(item))
    if source.upper() == 'OUTREACH':
        item = PublicOutreachRequest.objects.filter(pk=request_id).first()
        if not item:
            return error('Request not found.', 404, 'NOT_FOUND')
        if status and status not in dict(PublicOutreachRequest.STATUS_CHOICES):
            return error('Choose a valid status.')
        item.status = status or item.status
        item.assigned_team, item.assigned_to = team, assignee
        notes, history = list(item.internal_notes), list(item.history)
        if note:
            notes.append({'text': note, 'actor': actor, 'at': now})
        history.append({'action': 'UPDATED', 'status': item.status, 'actor': actor, 'at': now})
        item.internal_notes, item.history = notes, history
        item.save()
        return JsonResponse(serialize_hub_outreach(item))
    item = DigitalLearningRequest.objects.filter(pk=request_id).first()
    if not item:
        return error('Request not found.', 404, 'NOT_FOUND')
    if status and status not in dict(DigitalLearningRequest.STATUS_CHOICES):
        return error('Choose a valid status.')
    item.status = status or item.status
    details = dict(item.additional_details or {})
    details['_assignedTeam'], details['_assignedTo'] = team, assignee
    notes, history = list(details.get('_internalNotes', [])), list(details.get('_history', []))
    if note:
        notes.append({'text': note, 'actor': actor, 'at': now})
    history.append({'action': 'UPDATED', 'status': item.status, 'actor': actor, 'at': now})
    details['_internalNotes'], details['_history'] = notes, history
    item.additional_details = details
    item.save()
    return JsonResponse(serialize_hub_digital(item))


def error(message, status=400, code='INVALID_REQUEST'):
    return JsonResponse({'detail': message, 'code': code}, status=status)


def parse_json(request):
    try:
        return json.loads(request.body or '{}')
    except json.JSONDecodeError:
        return None


def clean_mobile(value):
    digits = ''.join(character for character in str(value or '') if character.isdigit())
    if len(digits) == 12 and digits.startswith('91'):
        digits = digits[2:]
    return digits if re.fullmatch(r'[6-9]\d{9}', digits) else None


def public_order(order):
    selected_delivery = DELIVERY_OPTIONS[order.delivery_type]
    return {
        'orderNumber': order.order_number, 'orderStatus': order.order_status,
        'paymentStatus': order.payment_status, 'shipmentStatus': order.shipment_status,
        'subtotal': order.subtotal, 'shippingCharge': order.shipping_charge, 'total': order.total,
        'deliveryType': order.delivery_type, 'deliveryLabel': selected_delivery['deliveryLabel'],
        'deliveryTimeline': selected_delivery['deliveryTimeline'],
        'trackingToken': order.tracking_token, 'awb': order.shiprocket_awb,
        'courierName': order.courier_name,
        'estimatedDeliveryDate': order.estimated_delivery_date.isoformat() if order.estimated_delivery_date else None,
    }


def resolve_lines(lines):
    if not isinstance(lines, list) or not lines:
        raise ValidationError('At least one book is required.')
    resolved = []
    subtotal = 0
    for line in lines:
        sku = str(line.get('product_id', '')).strip()
        try:
            quantity = int(line.get('quantity', 0))
        except (TypeError, ValueError):
            quantity = 0
        if quantity < 1 or quantity > 20:
            raise ValidationError('Book quantity must be between 1 and 20.')
        product = Product.objects.filter(sku=sku, active=True).first()
        if not product:
            raise ValidationError(f'Unknown or unavailable product: {sku}')
        if quantity > product.stock_quantity:
            raise ValidationError(f'Only {product.stock_quantity} copies of {product.title} are available.')
        line_total = product.price_inr * quantity
        subtotal += line_total
        resolved.append((product, quantity, line_total))
    return resolved, subtotal


def payment_session_for_order(order):
    if not payments_configured():
        return {'configured': False, 'status': 'NOT_CONFIGURED'}
    session = FastrrClient().create_session(order)
    order.payment_status = 'PENDING'
    order.payment_session_id = session['sessionId']
    order.save(update_fields=['payment_status', 'payment_session_id', 'updated_at'])
    PaymentAttempt.objects.create(
        order=order, session_id=session['sessionId'], status='PENDING', amount=order.total * 100,
        provider_response=session['raw'],
    )
    return {key: value for key, value in session.items() if key != 'raw'} | {'configured': True}


@require_GET
def integration_status(request):
    return JsonResponse({'shippingConfigured': shipping_configured(), 'paymentsConfigured': payments_configured()})


@csrf_exempt
@require_POST
def shipping_quote(request):
    payload = parse_json(request)
    if payload is None:
        return error('Invalid JSON body.')
    postal_code = str(payload.get('postal_code', '')).strip()
    selected_delivery = delivery_option(payload.get('delivery_type'))
    if not selected_delivery:
        return error('Choose a valid delivery option.')
    if not re.fullmatch(r'\d{6}', postal_code):
        return error('Enter a valid 6-digit PIN code.')
    try:
        resolved, subtotal = resolve_lines(payload.get('lines'))
        quote = quote_for_lines(postal_code, [(product, quantity) for product, quantity, _ in resolved], subtotal)
        return JsonResponse({**quote, **selected_delivery})
    except ValidationError as exc:
        return error(exc.messages[0])
    except IntegrationError as exc:
        return error(str(exc), exc.status, exc.code)


@csrf_exempt
@require_POST
def create_order(request):
    payload = parse_json(request)
    if payload is None:
        return error('Invalid JSON body.')
    name = str(payload.get('customer_name', '')).strip()
    mobile = clean_mobile(payload.get('mobile'))
    email = str(payload.get('email', '')).strip().lower()
    address = payload.get('address') or {}
    idempotency_key = str(payload.get('idempotency_key', '')).strip() or None
    delivery_type = str(payload.get('delivery_type') or 'STANDARD').strip().upper()
    selected_delivery = delivery_option(delivery_type)
    if not selected_delivery:
        return error('Choose a valid delivery option.')

    if idempotency_key:
        existing = GuestOrder.objects.filter(checkout_idempotency_key=idempotency_key).first()
        if existing:
            response = public_order(existing)
            try:
                response['payment'] = payment_session_for_order(existing) if not existing.payment_session_id else {
                    'configured': payments_configured(), 'sessionId': existing.payment_session_id,
                }
            except IntegrationError as exc:
                response['payment'] = {'configured': True, 'error': str(exc), 'code': exc.code}
            return JsonResponse(response)

    if len(name) < 2:
        return error('Enter the customer’s full name.')
    if not mobile:
        return error('Enter a valid Indian mobile number.')
    try:
        validate_email(email)
    except ValidationError:
        return error('Enter a valid email address.')
    required_address = {'line1', 'city', 'state', 'postal_code'}
    if not isinstance(address, dict) or any(not str(address.get(field, '')).strip() for field in required_address):
        return error('Complete all required delivery address fields.')
    postal_code = str(address.get('postal_code', '')).strip()
    if not re.fullmatch(r'\d{6}', postal_code):
        return error('Enter a valid 6-digit PIN code.')

    try:
        resolved, subtotal = resolve_lines(payload.get('lines'))
        quote = quote_for_lines(postal_code, [(product, quantity) for product, quantity, _ in resolved], subtotal)
    except ValidationError as exc:
        return error(exc.messages[0])
    except IntegrationError as exc:
        return error(str(exc), exc.status, exc.code)

    with transaction.atomic():
        order = GuestOrder.objects.create(
            customer_name=name, mobile=mobile, email=email, address=address, subtotal=subtotal,
            shipping_charge=selected_delivery['shippingCharge'],
            total=subtotal + selected_delivery['shippingCharge'], delivery_type=delivery_type,
            checkout_idempotency_key=idempotency_key,
            courier_id=str(quote.get('courierId') or ''), courier_name=quote.get('courierName', ''),
        )
        OrderItem.objects.bulk_create([
            OrderItem(order=order, product=product, sku=product.sku, title=product.title,
                      unit_price=product.price_inr, quantity=quantity, line_total=line_total)
            for product, quantity, line_total in resolved
        ])

    response = public_order(order)
    try:
        response['payment'] = payment_session_for_order(order)
    except IntegrationError as exc:
        order.integration_error = str(exc)
        order.save(update_fields=['integration_error', 'updated_at'])
        response['payment'] = {'configured': True, 'error': str(exc), 'code': exc.code}
    response['message'] = 'Order details saved. Payment is pending.'
    return JsonResponse(response, status=201)


@csrf_exempt
@require_POST
def retry_payment_session(request, order_number):
    payload = parse_json(request) or {}
    mobile = clean_mobile(payload.get('mobile'))
    order = GuestOrder.objects.filter(order_number__iexact=order_number, mobile=mobile).first()
    if not order:
        return error('Order not found.', 404, 'NOT_FOUND')
    if order.payment_status == 'PAID':
        return error('This order is already paid.', 409, 'ALREADY_PAID')
    try:
        return JsonResponse(payment_session_for_order(order))
    except IntegrationError as exc:
        return error(str(exc), exc.status, exc.code)


def payload_value(payload, *names):
    for name in names:
        value = payload.get(name)
        if value not in (None, ''):
            return value
    data = payload.get('data') if isinstance(payload.get('data'), dict) else {}
    for name in names:
        value = data.get(name)
        if value not in (None, ''):
            return value
    return None


@csrf_exempt
@require_POST
def payment_webhook(request):
    raw = request.body
    signature = request.headers.get(settings.FASTRR_WEBHOOK_SIGNATURE_HEADER, '')
    try:
        if not verify_webhook(raw, signature):
            return error('Invalid payment webhook signature.', 401, 'INVALID_SIGNATURE')
    except IntegrationNotConfigured as exc:
        return error(str(exc), 503, exc.code)
    payload = parse_json(request)
    if payload is None:
        return error('Invalid JSON body.')
    event_key = str(payload_value(payload, 'eventId', 'event_id', 'id') or hashlib.sha256(raw).hexdigest())
    event, created = IntegrationEvent.objects.get_or_create(
        provider='FASTRR', event_key=event_key,
        defaults={'event_type': str(payload_value(payload, 'event', 'eventType', 'type') or ''), 'payload': payload},
    )
    if not created and event.status == 'PROCESSED':
        return JsonResponse({'ok': True, 'duplicate': True})
    order_number = str(payload_value(payload, 'merchantOrderId', 'orderNumber', 'order_id') or '')
    order = GuestOrder.objects.filter(order_number__iexact=order_number).first()
    if not order:
        event.status, event.error, event.processed_at = 'FAILED', 'Order not found.', timezone.now()
        event.save()
        return error('Order not found.', 404, 'NOT_FOUND')
    status = str(payload_value(payload, 'paymentStatus', 'status') or '').upper()
    transaction_id = str(payload_value(payload, 'transactionId', 'paymentId', 'payment_id') or '')
    event.order = order
    if status in {'PAID', 'SUCCESS', 'CAPTURED', 'COMPLETED'}:
        with transaction.atomic():
            locked = GuestOrder.objects.select_for_update().get(id=order.id)
            locked.payment_status = 'PAID'
            locked.order_status = 'PAID'
            locked.payment_transaction_id = transaction_id
            locked.payment_verified_at = timezone.now()
            locked.save()
        PaymentAttempt.objects.filter(order=order, session_id=order.payment_session_id).update(
            status='PAID', transaction_id=transaction_id, provider_response=payload,
        )
        try:
            create_shipment_for_paid_order(order.id)
        except IntegrationError:
            pass  # Stored on the order and retried by the management command.
    elif status in {'FAILED', 'CANCELLED', 'CANCELED'}:
        GuestOrder.objects.filter(id=order.id).update(payment_status='FAILED')
        PaymentAttempt.objects.filter(order=order, session_id=order.payment_session_id).update(status='FAILED', provider_response=payload)
    event.status, event.processed_at = 'PROCESSED', timezone.now()
    event.save()
    return JsonResponse({'ok': True})


SHIPMENT_STATUS_MAP = {
    'SHIPPED': 'SHIPPED', 'IN TRANSIT': 'IN_TRANSIT', 'IN_TRANSIT': 'IN_TRANSIT',
    'OUT FOR DELIVERY': 'OUT_FOR_DELIVERY', 'OUT_FOR_DELIVERY': 'OUT_FOR_DELIVERY',
    'DELIVERED': 'DELIVERED', 'DELAYED': 'DELAYED', 'UNDELIVERED': 'UNDELIVERED',
    'RTO INITIATED': 'RTO_INITIATED', 'RTO_INITIATED': 'RTO_INITIATED',
    'RTO DELIVERED': 'RTO_DELIVERED', 'RTO_DELIVERED': 'RTO_DELIVERED',
}


@csrf_exempt
@require_POST
def logistics_webhook(request):
    configured_token = settings.SHIPROCKET_WEBHOOK_TOKEN
    received_token = request.headers.get('x-api-key', '')
    if not configured_token or not hmac.compare_digest(configured_token, received_token):
        return error('Invalid logistics webhook token.', 401, 'INVALID_SIGNATURE')
    payload = parse_json(request)
    if payload is None:
        return error('Invalid JSON body.')
    raw = request.body
    awb = str(payload_value(payload, 'awb', 'awb_code') or '')
    provider_status = str(payload_value(payload, 'current_status', 'shipment_status', 'status') or 'UNKNOWN')
    event_key = str(payload_value(payload, 'event_id', 'id') or hashlib.sha256(raw).hexdigest())
    event, created = IntegrationEvent.objects.get_or_create(
        provider='SHIPROCKET', event_key=event_key,
        defaults={'event_type': provider_status, 'payload': payload},
    )
    if not created and event.status == 'PROCESSED':
        return JsonResponse({'ok': True, 'duplicate': True})
    order = GuestOrder.objects.filter(shiprocket_awb=awb).first()
    if not order:
        event.status, event.error, event.processed_at = 'FAILED', 'AWB not found.', timezone.now()
        event.save()
        return JsonResponse({'ok': True})  # Provider requires 200; retain failure for reconciliation.
    normalized = SHIPMENT_STATUS_MAP.get(provider_status.upper().replace('-', ' '), order.shipment_status)
    event_time = parse_datetime(str(payload_value(payload, 'event_time', 'timestamp', 'updated_at') or '')) or timezone.now()
    ShipmentEvent.objects.get_or_create(
        order=order, provider_status=provider_status, event_time=event_time,
        defaults={'normalized_status': normalized, 'description': str(payload_value(payload, 'activity', 'description') or ''),
                  'location': str(payload_value(payload, 'location') or ''), 'payload': payload},
    )
    order.shipment_status = normalized
    order.last_tracking_update = event_time
    if normalized == 'DELIVERED':
        order.order_status = 'COMPLETED'
    order.save(update_fields=['shipment_status', 'last_tracking_update', 'order_status', 'updated_at'])
    event.order, event.status, event.processed_at = order, 'PROCESSED', timezone.now()
    event.save()
    return JsonResponse({'ok': True})


@csrf_exempt
@require_POST
def track_order(request):
    payload = parse_json(request)
    if payload is None:
        return error('Invalid JSON body.')
    order_number = str(payload.get('order_number', '')).strip()
    mobile = clean_mobile(payload.get('mobile'))
    if not mobile:
        return error('Enter a valid Indian mobile number.')
    order = GuestOrder.objects.prefetch_related('items', 'shipment_events').filter(
        order_number__iexact=order_number, mobile=mobile,
    ).first()
    if not order:
        return error('Order not found. Check the order number and mobile number.', 404)
    response = public_order(order)
    response.update({
        'createdAt': order.created_at.isoformat(),
        'items': [{'productId': item.sku, 'title': item.title, 'unitPrice': item.unit_price,
                   'quantity': item.quantity, 'lineTotal': item.line_total} for item in order.items.all()],
        'trackingEvents': [{'status': item.normalized_status, 'providerStatus': item.provider_status,
                            'description': item.description, 'location': item.location,
                            'eventTime': item.event_time.isoformat()} for item in order.shipment_events.all()],
    })
    return JsonResponse(response)
