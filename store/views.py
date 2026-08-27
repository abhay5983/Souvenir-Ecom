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
from .models import GuestOrder, IntegrationEvent, OrderItem, PaymentAttempt, Product, ShipmentEvent


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
    return {
        'orderNumber': order.order_number, 'orderStatus': order.order_status,
        'paymentStatus': order.payment_status, 'shipmentStatus': order.shipment_status,
        'subtotal': order.subtotal, 'shippingCharge': order.shipping_charge, 'total': order.total,
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
    if not re.fullmatch(r'\d{6}', postal_code):
        return error('Enter a valid 6-digit PIN code.')
    try:
        resolved, subtotal = resolve_lines(payload.get('lines'))
        quote = quote_for_lines(postal_code, [(product, quantity) for product, quantity, _ in resolved], subtotal)
        return JsonResponse(quote)
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
            shipping_charge=quote['shippingCharge'], total=subtotal + quote['shippingCharge'],
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
