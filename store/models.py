import secrets
from django.db import models


class Product(models.Model):
    sku = models.CharField(max_length=80, unique=True)
    title = models.CharField(max_length=180)
    series_code = models.SlugField(max_length=100, db_index=True, default='')
    series_title = models.CharField(max_length=180, default='')
    series_slug = models.SlugField(max_length=180, db_index=True, default='')
    isbn = models.CharField(max_length=20, blank=True, db_index=True)
    level = models.CharField(max_length=80, blank=True)
    imprint = models.CharField(max_length=120, default='Souvenir')
    subject = models.CharField(max_length=120, blank=True)
    category = models.CharField(max_length=120, default='Textbooks')
    stage = models.CharField(max_length=120, blank=True)
    grade_range = models.CharField(max_length=120, blank=True)
    description = models.TextField(blank=True)
    digital_features = models.JSONField(default=list, blank=True)
    cover_image_url = models.URLField(max_length=500, blank=True)
    cover_tone = models.CharField(max_length=40, default='cover-blue')
    featured = models.BooleanField(default=False)
    public_visibility = models.BooleanField(default=True)
    price_inr = models.PositiveIntegerField()
    active = models.BooleanField(default=True)
    stock_quantity = models.PositiveIntegerField(default=100)
    hsn_code = models.CharField(max_length=20, blank=True)
    weight_kg = models.DecimalField(max_digits=7, decimal_places=3, default=0.300)
    length_cm = models.DecimalField(max_digits=7, decimal_places=2, default=24)
    breadth_cm = models.DecimalField(max_digits=7, decimal_places=2, default=18)
    height_cm = models.DecimalField(max_digits=7, decimal_places=2, default=1)

    def __str__(self):
        return f"{self.title} ({self.sku})"


class GuestOrder(models.Model):
    ORDER_STATUSES = [(value, value.replace('_', ' ').title()) for value in [
        'AWAITING_PAYMENT', 'PAID', 'PROCESSING', 'READY_TO_SHIP', 'CANCELLED', 'COMPLETED'
    ]]
    PAYMENT_STATUSES = [(value, value.replace('_', ' ').title()) for value in [
        'NOT_CONFIGURED', 'PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'REFUND_PENDING', 'REFUNDED'
    ]]
    SHIPMENT_STATUSES = [(value, value.replace('_', ' ').title()) for value in [
        'NOT_CREATED', 'CREATION_PENDING', 'CREATION_FAILED', 'CREATED', 'AWB_ASSIGNED',
        'PICKUP_SCHEDULED', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED',
        'DELAYED', 'UNDELIVERED', 'RTO_INITIATED', 'RTO_DELIVERED', 'RETURNED'
    ]]

    order_number = models.CharField(max_length=40, unique=True, blank=True)
    customer_name = models.CharField(max_length=120)
    mobile = models.CharField(max_length=10, db_index=True)
    email = models.EmailField()
    address = models.JSONField(default=dict)
    subtotal = models.PositiveIntegerField()
    shipping_charge = models.PositiveIntegerField(default=0)
    total = models.PositiveIntegerField()
    order_status = models.CharField(max_length=40, choices=ORDER_STATUSES, default='AWAITING_PAYMENT')
    payment_status = models.CharField(max_length=40, choices=PAYMENT_STATUSES, default='NOT_CONFIGURED')
    shipment_status = models.CharField(max_length=40, choices=SHIPMENT_STATUSES, default='NOT_CREATED')
    tracking_token = models.CharField(max_length=64, unique=True, blank=True)
    payment_provider = models.CharField(max_length=30, default='FASTRR')
    payment_session_id = models.CharField(max_length=120, blank=True)
    payment_order_id = models.CharField(max_length=120, blank=True)
    payment_transaction_id = models.CharField(max_length=120, blank=True)
    payment_verified_at = models.DateTimeField(null=True, blank=True)
    checkout_idempotency_key = models.CharField(max_length=80, unique=True, null=True, blank=True)
    shiprocket_order_id = models.CharField(max_length=80, blank=True)
    shiprocket_shipment_id = models.CharField(max_length=80, blank=True)
    shiprocket_awb = models.CharField(max_length=80, blank=True)
    courier_id = models.CharField(max_length=40, blank=True)
    courier_name = models.CharField(max_length=120, blank=True)
    estimated_delivery_date = models.DateField(null=True, blank=True)
    label_url = models.URLField(blank=True)
    manifest_url = models.URLField(blank=True)
    last_tracking_update = models.DateTimeField(null=True, blank=True)
    integration_error = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.order_number:
            from django.utils import timezone
            self.order_number = f"SE-{timezone.now():%Y%m%d}-{secrets.token_hex(3).upper()}"
        if not self.tracking_token:
            self.tracking_token = secrets.token_urlsafe(24)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.order_number


class OrderItem(models.Model):
    order = models.ForeignKey(GuestOrder, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    sku = models.CharField(max_length=80)
    title = models.CharField(max_length=180)
    unit_price = models.PositiveIntegerField()
    quantity = models.PositiveIntegerField()
    line_total = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.order.order_number}: {self.title} x {self.quantity}"


class PaymentAttempt(models.Model):
    order = models.ForeignKey(GuestOrder, on_delete=models.CASCADE, related_name='payment_attempts')
    provider = models.CharField(max_length=30, default='FASTRR')
    session_id = models.CharField(max_length=120, blank=True)
    transaction_id = models.CharField(max_length=120, blank=True)
    status = models.CharField(max_length=40, default='PENDING')
    amount = models.PositiveIntegerField(help_text='Amount in INR paise')
    provider_response = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class IntegrationEvent(models.Model):
    PROVIDERS = [('FASTRR', 'Fastrr'), ('SHIPROCKET', 'Shiprocket')]
    provider = models.CharField(max_length=30, choices=PROVIDERS)
    event_key = models.CharField(max_length=128)
    event_type = models.CharField(max_length=100, blank=True)
    order = models.ForeignKey(GuestOrder, null=True, blank=True, on_delete=models.SET_NULL, related_name='integration_events')
    payload = models.JSONField(default=dict)
    status = models.CharField(max_length=20, default='RECEIVED')
    error = models.TextField(blank=True)
    received_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['provider', 'event_key'], name='unique_provider_event')]


class ShipmentEvent(models.Model):
    order = models.ForeignKey(GuestOrder, on_delete=models.CASCADE, related_name='shipment_events')
    provider_status = models.CharField(max_length=120)
    normalized_status = models.CharField(max_length=40)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=180, blank=True)
    event_time = models.DateTimeField()
    payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['event_time']
