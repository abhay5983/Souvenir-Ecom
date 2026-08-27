import json

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import Q
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.http import require_GET, require_http_methods, require_POST

from .models import Account, Profile, RequestEvent, WorkflowRequest


def body_json(request):
    try:
        return json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return None


def error(message, status=400, code="INVALID_REQUEST"):
    return JsonResponse({"ok": False, "error": {"code": code, "message": message}}, status=status)


def user_data(user):
    profile = user.profile
    account = profile.account
    return {
        "id": str(user.id), "name": user.get_full_name() or user.username,
        "email": user.email, "role": profile.role, "state": profile.state,
        "accountId": str(account.id) if account else None,
        "accountName": account.name if account else None,
        "partnerKey": account.partner_key if account else None,
        "warehouseIds": [profile.warehouse_id] if profile.warehouse_id else [],
    }


def serialize_request(item, include_events=False):
    data = {
        "id": item.id, "reference": item.reference, "requestType": item.request_type,
        "status": item.status, "accountId": item.account_id, "accountName": item.account.name,
        "state": item.account.state, "createdBy": item.created_by.get_full_name() or item.created_by.username,
        "assignedBm": item.assigned_bm.get_full_name() if item.assigned_bm else None,
        "assignedCoordinator": item.assigned_coordinator.get_full_name() if item.assigned_coordinator else None,
        "lines": item.lines, "deliveryAddress": item.delivery_address, "notes": item.notes,
        "transporter": item.transporter, "consignmentNumber": item.consignment_number,
        "trackingUrl": item.tracking_url, "createdAt": item.created_at.isoformat(),
        "updatedAt": item.updated_at.isoformat(),
    }
    if include_events:
        data["events"] = [{
            "action": event.action, "fromStatus": event.from_status, "toStatus": event.to_status,
            "actor": event.actor.get_full_name() or event.actor.username, "note": event.note,
            "createdAt": event.created_at.isoformat(),
        } for event in item.events.select_related("actor").order_by("created_at")]
    return data


def visible_requests(user):
    profile = user.profile
    role = profile.role
    qs = WorkflowRequest.objects.select_related("account", "created_by", "assigned_bm", "assigned_coordinator")
    if role in {"SUPER_ADMIN", "MANAGEMENT_SUPER_MASTER", "AUDITOR"}:
        return qs
    if role in {"SCHOOL_ADMIN", "SCHOOL_TEACHER", "DISTRIBUTOR_ADMIN"}:
        return qs.filter(account=profile.account)
    if role in {"BUSINESS_MANAGER", "SALES_REP", "SALES_MANAGER"}:
        return qs.filter(Q(assigned_bm=user) | Q(created_by=user))
    if role == "COORDINATOR":
        return qs.filter(assigned_coordinator=user, account__state=profile.state)
    if role == "COORDINATOR_HEAD":
        return qs.filter(account__state=profile.state)
    if role == "INVENTORY":
        return qs.filter(status__in=["READY_FOR_INVENTORY", "PACKING_IN_PROGRESS"])
    if role == "INVENTORY_SUPERVISOR":
        return qs.filter(status="PENDING_SUPERVISOR_VERIFICATION")
    if role == "DISPATCH":
        return qs.filter(status__in=["READY_FOR_DISPATCH", "DISPATCHED", "DELIVERED"])
    return qs.none()


@require_GET
def csrf_token(request):
    return JsonResponse({"csrfToken": get_token(request)})


@require_POST
def login_view(request):
    payload = body_json(request)
    if payload is None:
        return error("Invalid JSON.")
    identity = str(payload.get("identity", "")).strip()
    password = str(payload.get("password", ""))
    candidate = User.objects.filter(Q(username__iexact=identity) | Q(email__iexact=identity)).first()
    user = authenticate(request, username=candidate.username if candidate else identity, password=password)
    if not user or not hasattr(user, "profile"):
        return error("The email, mobile or password is incorrect.", 401, "INVALID_CREDENTIALS")
    login(request, user)
    return JsonResponse({"ok": True, "value": user_data(user)})


@require_POST
def logout_view(request):
    logout(request)
    return JsonResponse({"ok": True})


@require_GET
def me_view(request):
    if not request.user.is_authenticated or not hasattr(request.user, "profile"):
        return error("Authentication required.", 401, "UNAUTHENTICATED")
    return JsonResponse({"ok": True, "value": user_data(request.user)})


@require_POST
def verify_partner(request):
    if not request.user.is_authenticated:
        return error("Authentication required.", 401, "UNAUTHENTICATED")
    payload = body_json(request) or {}
    account = Account.objects.filter(partner_key__iexact=str(payload.get("partnerKey", "")).strip(), active=True).first()
    if not account:
        return error("PartnerKey could not be verified.", 404, "PARTNER_NOT_FOUND")
    profile = request.user.profile
    allowed = profile.role in {"SUPER_ADMIN", "BUSINESS_MANAGER", "SALES_REP", "SALES_MANAGER"} or profile.account_id == account.id
    if not allowed:
        return error("This account is outside your assigned scope.", 403, "FORBIDDEN")
    return JsonResponse({"ok": True, "value": {"id": account.id, "code": account.partner_key, "accountName": account.name, "state": account.state}})


@require_http_methods(["GET", "POST"])
def requests_view(request):
    if not request.user.is_authenticated or not hasattr(request.user, "profile"):
        return error("Authentication required.", 401, "UNAUTHENTICATED")
    if request.method == "GET":
        items = visible_requests(request.user).order_by("-created_at")
        return JsonResponse({"ok": True, "value": [serialize_request(item) for item in items]})

    payload = body_json(request)
    if payload is None:
        return error("Invalid JSON.")
    profile = request.user.profile
    request_type = str(payload.get("requestType", "")).upper()
    allowed_types = {
        "SCHOOL_ADMIN": {"SAMPLE"}, "BUSINESS_MANAGER": {"ORDER", "SAMPLE"},
        "SALES_REP": {"ORDER", "SAMPLE"}, "SALES_MANAGER": {"ORDER", "SAMPLE"},
        "DISTRIBUTOR_ADMIN": {"ORDER"},
    }.get(profile.role, set())
    if request_type not in allowed_types:
        return error("Your role cannot create this request type.", 403, "FORBIDDEN")
    account = profile.account
    partner_key = str(payload.get("partnerKey", "")).strip()
    if partner_key and profile.role in {"BUSINESS_MANAGER", "SALES_REP", "SALES_MANAGER"}:
        account = Account.objects.filter(partner_key__iexact=partner_key, active=True, business_manager=request.user).first()
    if not account or not account.active:
        return error("An active assigned account is required.", 403, "ACCOUNT_REQUIRED")
    lines = payload.get("lines")
    if not isinstance(lines, list) or not lines or any(int(line.get("quantity", 0)) < 1 for line in lines):
        return error("At least one valid request line is required.")
    if request_type == "SAMPLE" and any(int(line.get("quantity", 0)) > 2 for line in lines):
        return error("Samples are limited to two copies per title.")
    status = "SUBMITTED_TO_BM" if profile.role == "SCHOOL_ADMIN" else "PENDING_COORDINATOR_REVIEW"
    item = WorkflowRequest.objects.create(
        request_type=request_type, status=status, account=account, created_by=request.user,
        assigned_bm=account.business_manager, assigned_coordinator=account.coordinator,
        lines=lines, delivery_address=payload.get("deliveryAddress") or {}, notes=str(payload.get("notes", "")),
    )
    RequestEvent.objects.create(request=item, actor=request.user, action="CREATED", to_status=status)
    return JsonResponse({"ok": True, "value": serialize_request(item, True)}, status=201)


@require_GET
def request_detail(request, request_id):
    if not request.user.is_authenticated or not hasattr(request.user, "profile"):
        return error("Authentication required.", 401, "UNAUTHENTICATED")
    item = visible_requests(request.user).filter(id=request_id).first()
    if not item:
        return error("Request not found in your assigned scope.", 404, "NOT_FOUND")
    return JsonResponse({"ok": True, "value": serialize_request(item, True)})


TRANSITIONS = {
    "bm_forward": ({"BUSINESS_MANAGER", "SALES_REP", "SALES_MANAGER"}, "SUBMITTED_TO_BM", "PENDING_COORDINATOR_REVIEW"),
    "coordinator_forward": ({"COORDINATOR"}, "PENDING_COORDINATOR_REVIEW", "PENDING_HEAD_APPROVAL"),
    "head_approve": ({"COORDINATOR_HEAD"}, "PENDING_HEAD_APPROVAL", "READY_FOR_INVENTORY"),
    "head_reject": ({"COORDINATOR_HEAD"}, "PENDING_HEAD_APPROVAL", "REJECTED"),
    "inventory_start": ({"INVENTORY"}, "READY_FOR_INVENTORY", "PACKING_IN_PROGRESS"),
    "inventory_complete": ({"INVENTORY"}, "PACKING_IN_PROGRESS", "PENDING_SUPERVISOR_VERIFICATION"),
    "supervisor_release": ({"INVENTORY_SUPERVISOR"}, "PENDING_SUPERVISOR_VERIFICATION", "READY_FOR_DISPATCH"),
    "dispatch": ({"DISPATCH"}, "READY_FOR_DISPATCH", "DISPATCHED"),
    "deliver": ({"DISPATCH"}, "DISPATCHED", "DELIVERED"),
}


@require_POST
@transaction.atomic
def request_action(request, request_id):
    if not request.user.is_authenticated or not hasattr(request.user, "profile"):
        return error("Authentication required.", 401, "UNAUTHENTICATED")
    payload = body_json(request) or {}
    action = payload.get("action")
    rule = TRANSITIONS.get(action)
    if not rule:
        return error("Unknown workflow action.")
    roles, required_status, next_status = rule
    if request.user.profile.role not in roles:
        return error("Your role cannot perform this action.", 403, "FORBIDDEN")
    item = visible_requests(request.user).select_for_update().filter(id=request_id).first()
    if not item:
        return error("Request not found in your assigned scope.", 404, "NOT_FOUND")
    if item.status != required_status:
        return error(f"Request must be {required_status.replace('_', ' ').lower()}.", 409, "INVALID_STATUS")
    if action == "dispatch":
        item.transporter = str(payload.get("transporter", "")).strip()
        item.consignment_number = str(payload.get("consignmentNumber", "")).strip()
        item.tracking_url = str(payload.get("trackingUrl", "")).strip()
        if not item.transporter or not item.consignment_number:
            return error("Transporter and consignment number are required.")
    old_status = item.status
    item.status = next_status
    item.save()
    RequestEvent.objects.create(request=item, actor=request.user, action=action.upper(), from_status=old_status, to_status=next_status, note=str(payload.get("note", "")))
    return JsonResponse({"ok": True, "value": serialize_request(item, True)})
