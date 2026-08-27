from django.contrib.auth.models import User
from django.db import models


class Account(models.Model):
    name = models.CharField(max_length=180)
    account_type = models.CharField(max_length=20, choices=[("SCHOOL", "School"), ("DISTRIBUTOR", "Distributor")])
    partner_key = models.CharField(max_length=40, unique=True)
    state = models.CharField(max_length=80)
    active = models.BooleanField(default=True)
    business_manager = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name="managed_accounts")
    coordinator = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name="coordinated_accounts")

    def __str__(self):
        return self.name


class Profile(models.Model):
    ROLE_VALUES = [
        "SCHOOL_ADMIN", "SCHOOL_TEACHER", "DISTRIBUTOR_ADMIN", "BUSINESS_MANAGER",
        "SALES_REP", "SALES_MANAGER", "CATALOGUE_ADMIN", "ORDER_OPERATIONS", "FINANCE",
        "DIGITAL_RESOURCE_ADMIN", "SUPER_ADMIN", "MANAGEMENT_SUPER_MASTER", "TECH_MASTER",
        "PARTNER_NETWORK_ADMIN", "COORDINATOR", "COORDINATOR_HEAD", "INVENTORY",
        "INVENTORY_SUPERVISOR", "DISPATCH", "AUDITOR",
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    role = models.CharField(max_length=40, choices=[(role, role.replace("_", " ").title()) for role in ROLE_VALUES])
    account = models.ForeignKey(Account, null=True, blank=True, on_delete=models.SET_NULL, related_name="users")
    state = models.CharField(max_length=80, blank=True)
    warehouse_id = models.CharField(max_length=40, blank=True)

    def __str__(self):
        return f"{self.user.username} ({self.role})"


class WorkflowRequest(models.Model):
    STATUS_VALUES = [
        "SUBMITTED_TO_BM", "PENDING_COORDINATOR_REVIEW", "PENDING_HEAD_APPROVAL",
        "CHANGES_REQUIRED", "REJECTED", "READY_FOR_INVENTORY", "PACKING_IN_PROGRESS",
        "PENDING_SUPERVISOR_VERIFICATION", "READY_FOR_DISPATCH", "DISPATCHED", "DELIVERED",
    ]
    reference = models.CharField(max_length=32, unique=True, blank=True)
    request_type = models.CharField(max_length=10, choices=[("ORDER", "Order"), ("SAMPLE", "Sample")])
    status = models.CharField(max_length=50, choices=[(value, value.replace("_", " ").title()) for value in STATUS_VALUES])
    account = models.ForeignKey(Account, on_delete=models.PROTECT, related_name="requests")
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="created_requests")
    assigned_bm = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name="bm_requests")
    assigned_coordinator = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name="coordinator_requests")
    lines = models.JSONField(default=list)
    delivery_address = models.JSONField(default=dict, blank=True)
    notes = models.TextField(blank=True)
    transporter = models.CharField(max_length=120, blank=True)
    consignment_number = models.CharField(max_length=120, blank=True)
    tracking_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.reference:
            prefix = "SMP" if self.request_type == "SAMPLE" else "ORD"
            latest = WorkflowRequest.objects.order_by("-id").values_list("id", flat=True).first() or 0
            self.reference = f"{prefix}-{latest + 1:06d}"
        super().save(*args, **kwargs)


class RequestEvent(models.Model):
    request = models.ForeignKey(WorkflowRequest, on_delete=models.CASCADE, related_name="events")
    actor = models.ForeignKey(User, on_delete=models.PROTECT)
    action = models.CharField(max_length=60)
    from_status = models.CharField(max_length=50, blank=True)
    to_status = models.CharField(max_length=50)
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
