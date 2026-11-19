from django.contrib import admin
from django.contrib import messages
from django.conf import settings
from django.core.management import call_command
from django.core.exceptions import PermissionDenied, ValidationError
from django.db import transaction
from django.db.models import Count, Q
from django.http import HttpResponse
from django.shortcuts import redirect, render
from django.urls import path, reverse
from django.utils import timezone
from django.utils.html import format_html
from datetime import timedelta
from io import StringIO
from .catalog_import import import_catalogue, template_bytes
from .resource_import import import_resources, template_bytes as resource_template_bytes
from .models import DigitalLearningRequest, DigitalResource, GuestOrder, IntegrationEvent, OrderBackgroundJob, OrderEmailDelivery, OrderItem, OrderNotificationRecipient, PaymentAttempt, Product, PublicOutreachRequest


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'sku', 'title', 'unit_price', 'quantity', 'line_total')


@admin.register(GuestOrder)
class GuestOrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'customer_name', 'mobile', 'delivery_type', 'total', 'order_status', 'payment_status', 'shipment_status', 'created_at')
    list_filter = ('delivery_type', 'order_status', 'payment_status', 'shipment_status')
    search_fields = ('order_number', 'customer_name', 'mobile', 'email')
    readonly_fields = ('order_number', 'tracking_token', 'payment_verified_at', 'created_at', 'updated_at')
    inlines = [OrderItemInline]
    actions = ['resend_order_confirmation']

    @admin.action(description='Send/retry order confirmation email')
    def resend_order_confirmation(self, request, queryset):
        paid_orders = queryset.filter(payment_status='PAID')
        for order_id in paid_orders.values_list('id', flat=True):
            OrderEmailDelivery.objects.filter(order_id=order_id, status='SENT').update(status='PENDING')
            OrderBackgroundJob.objects.update_or_create(
                order_id=order_id, job_type='SEND_CONFIRMATION_EMAILS',
                defaults={'status': 'PENDING', 'attempts': 0, 'error': '', 'locked_at': None, 'available_at': timezone.now()},
            )
        self.message_user(request, f'Confirmation email queued for {paid_orders.count()} paid order(s).')

# Product catalogue operations intentionally live in the dedicated, staff-only
# /catalogue-manager/ workspace rather than the generic Django admin index.
class ProductAdmin(admin.ModelAdmin):
    change_list_template = 'admin/store/product/change_list.html'
    list_display = (
        'cover_preview', 'sku', 'title', 'series_title', 'subject', 'price_inr',
        'stock_quantity', 'has_online_features', 'has_resource_links',
        'public_visibility', 'active',
    )
    list_editable = ('price_inr', 'stock_quantity', 'public_visibility', 'active')
    list_filter = ('active', 'public_visibility', 'featured', 'imprint', 'subject', 'category', 'stage')
    search_fields = ('sku', 'isbn', 'title', 'series_title')
    list_select_related = ('digital_resource',)
    list_per_page = 50
    ordering = ('series_title', 'title')
    actions = ('make_active', 'make_inactive', 'hide_from_store', 'show_in_store')

    @admin.display(description='Cover')
    def cover_preview(self, obj):
        if not obj.cover_image_url:
            return '—'
        return format_html(
            '<img src="{}" alt="" style="width:42px;height:56px;object-fit:cover;border-radius:4px">',
            obj.cover_image_url,
        )

    @admin.display(boolean=True, description='Online features')
    def has_online_features(self, obj):
        return bool(obj.digital_features)

    @admin.display(boolean=True, description='Resource links')
    def has_resource_links(self, obj):
        try:
            resource = obj.digital_resource
        except DigitalResource.DoesNotExist:
            return False
        return bool(resource.student_url or resource.teacher_url)

    @admin.action(description='Activate selected books')
    def make_active(self, request, queryset):
        count = queryset.update(active=True)
        self.message_user(request, f'Activated {count} book(s).')

    @admin.action(description='Deactivate selected books')
    def make_inactive(self, request, queryset):
        count = queryset.update(active=False)
        self.message_user(request, f'Deactivated {count} book(s).')

    @admin.action(description='Hide selected books from public store')
    def hide_from_store(self, request, queryset):
        count = queryset.update(public_visibility=False)
        self.message_user(request, f'Hidden {count} book(s) from the public store.')

    @admin.action(description='Show selected books in public store')
    def show_in_store(self, request, queryset):
        count = queryset.update(public_visibility=True, active=True)
        self.message_user(request, f'Published {count} book(s) in the public store.')

    def get_urls(self):
        return [
            path('import/', self.admin_site.admin_view(self.import_view), name='store_product_import'),
            path('template/', self.admin_site.admin_view(self.template_view), name='store_product_template'),
            path('clear/', self.admin_site.admin_view(self.clear_view), name='store_product_clear'),
        ] + super().get_urls()

    def changelist_view(self, request, extra_context=None):
        totals = Product.objects.aggregate(
            total=Count('id'),
            active=Count('id', filter=Q(active=True, public_visibility=True)),
        )
        totals['without_features'] = Product.objects.filter(digital_features=[]).count()
        resources = DigitalResource.objects.filter(
            Q(student_url__gt='') | Q(teacher_url__gt=''),
        ).count()
        return super().changelist_view(request, {
            **(extra_context or {}),
            'catalogue_totals': totals,
            'resource_book_count': resources,
        })

    def template_view(self, request):
        response = HttpResponse(
            template_bytes(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        )
        response['Content-Disposition'] = 'attachment; filename="souvenir_books_catalogue_template.xlsx"'
        return response

    def import_view(self, request):
        if request.method == 'POST':
            upload = request.FILES.get('catalogue_file')
            if not upload:
                messages.error(request, 'Choose an Excel file to upload.')
            else:
                try:
                    result = import_catalogue(upload, replace_catalogue=request.POST.get('replace_catalogue') == 'on')
                    messages.success(
                        request,
                        f"Import complete: {result['created']} created, {result['updated']} updated, "
                        f"{result['deactivated']} deactivated.",
                    )
                    return redirect(reverse('admin:store_product_changelist'))
                except ValidationError as exc:
                    for error_message in exc.messages:
                        messages.error(request, error_message)
        context = {
            **self.admin_site.each_context(request),
            'title': 'Import books catalogue',
            'opts': self.model._meta,
            'template_url': reverse('admin:store_product_template'),
        }
        return render(request, 'admin/store/product/import.html', context)

    def clear_view(self, request):
        if not self.has_delete_permission(request):
            raise PermissionDenied
        total = Product.objects.count()
        if request.method == 'POST':
            confirmation = request.POST.get('confirmation', '').strip()
            if confirmation != 'DELETE ALL BOOKS':
                messages.error(request, 'Enter DELETE ALL BOOKS exactly to confirm.')
            else:
                with transaction.atomic():
                    deleted = Product.objects.count()
                    Product.objects.all().delete()
                messages.success(
                    request,
                    f'Catalogue cleared: {deleted} book(s) deleted. Existing order lines were retained.',
                )
                return redirect(reverse('admin:store_product_changelist'))
        context = {
            **self.admin_site.each_context(request),
            'title': 'Clear the complete catalogue',
            'opts': self.model._meta,
            'total': total,
        }
        return render(request, 'admin/store/product/clear.html', context)


@admin.register(DigitalResource)
class DigitalResourceAdmin(admin.ModelAdmin):
    change_list_template = 'admin/store/digitalresource/change_list.html'
    list_display = ('product', 'isbn', 'has_student_link', 'has_teacher_link', 'updated_at')
    search_fields = ('product__isbn', 'product__title', 'product__series_title')
    readonly_fields = ('updated_at',)

    @admin.display(description='ISBN')
    def isbn(self, obj):
        return obj.product.isbn

    @admin.display(boolean=True, description='Student link')
    def has_student_link(self, obj):
        return bool(obj.student_url)

    @admin.display(boolean=True, description='Teacher link')
    def has_teacher_link(self, obj):
        return bool(obj.teacher_url)

    def get_urls(self):
        return [
            path('import/', self.admin_site.admin_view(self.import_view), name='store_digitalresource_import'),
            path('template/', self.admin_site.admin_view(self.template_view), name='store_digitalresource_template'),
        ] + super().get_urls()

    def template_view(self, request):
        response = HttpResponse(
            resource_template_bytes(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        )
        response['Content-Disposition'] = 'attachment; filename="souvenir_resource_links_template.xlsx"'
        return response

    def import_view(self, request):
        if request.method == 'POST':
            upload = request.FILES.get('resource_file')
            if not upload:
                messages.error(request, 'Choose a resource-links Excel file to upload.')
            else:
                try:
                    result = import_resources(upload)
                    messages.success(
                        request,
                        f"Resource import complete: {result['created']} created and {result['updated']} updated.",
                    )
                    return redirect(reverse('admin:store_digitalresource_changelist'))
                except ValidationError as exc:
                    for error_message in exc.messages:
                        messages.error(request, error_message)
        context = {
            **self.admin_site.each_context(request),
            'title': 'Import digital resource links',
            'opts': self.model._meta,
            'template_url': reverse('admin:store_digitalresource_template'),
        }
        return render(request, 'admin/store/digitalresource/import.html', context)


@admin.register(DigitalLearningRequest)
class DigitalLearningRequestAdmin(admin.ModelAdmin):
    list_display = ('reference', 'requester_name', 'requester_role', 'school_name', 'series_title', 'status', 'created_at')
    list_filter = ('status', 'requester_role', 'state_code', 'subject')
    search_fields = ('reference', 'requester_name', 'school_name', 'email', 'mobile', 'series_title')
    readonly_fields = ('reference', 'created_at', 'updated_at', 'selected_books', 'resource_codes', 'additional_details')


@admin.register(PublicOutreachRequest)
class PublicOutreachRequestAdmin(admin.ModelAdmin):
    list_display = ('reference', 'form_title', 'requester_name', 'status', 'assigned_team', 'confidential', 'created_at')
    list_filter = ('status', 'form_type', 'assigned_team', 'confidential')
    search_fields = ('reference', 'requester_name', 'organisation', 'email', 'mobile')
    readonly_fields = ('reference', 'payload', 'attachments', 'internal_notes', 'history', 'created_at', 'updated_at')


@admin.register(PaymentAttempt)
class PaymentAttemptAdmin(admin.ModelAdmin):
    list_display = ('order', 'provider', 'session_id', 'transaction_id', 'amount', 'status', 'created_at')
    search_fields = ('order__order_number', 'session_id', 'transaction_id')
    readonly_fields = ('created_at', 'updated_at', 'provider_response')


@admin.register(OrderBackgroundJob)
class OrderBackgroundJobAdmin(admin.ModelAdmin):
    list_display = ('order', 'job_type', 'status', 'attempts', 'available_at', 'completed_at')
    list_filter = ('job_type', 'status')
    search_fields = ('order__order_number',)
    readonly_fields = ('order', 'job_type', 'status', 'attempts', 'error', 'available_at', 'locked_at', 'completed_at', 'created_at', 'updated_at')


@admin.register(OrderNotificationRecipient)
class OrderNotificationRecipientAdmin(admin.ModelAdmin):
    list_display = ('email', 'name', 'is_active', 'updated_at')
    list_filter = ('is_active',)
    search_fields = ('email', 'name')
    list_editable = ('is_active',)
    ordering = ('email',)


@admin.register(OrderEmailDelivery)
class OrderEmailDeliveryAdmin(admin.ModelAdmin):
    change_list_template = 'admin/store/orderemaildelivery/change_list.html'
    list_display = ('order', 'recipient_email', 'recipient_type', 'status', 'sent_at', 'created_at')
    list_filter = ('status', 'recipient_type')
    search_fields = ('order__order_number', 'recipient_email')
    readonly_fields = (
        'order', 'recipient_email', 'recipient_type', 'status', 'error',
        'sent_at', 'created_at', 'updated_at',
    )

    def has_add_permission(self, request):
        return False

    def get_urls(self):
        return [
            path(
                'monitor/', self.admin_site.admin_view(self.monitor_view),
                name='store_orderemaildelivery_monitor',
            ),
        ] + super().get_urls()

    def monitor_view(self, request):
        if request.method == 'POST':
            action = request.POST.get('action')
            if action == 'process_now':
                output = StringIO()
                call_command(
                    'process_order_jobs', limit=10, retry_failed_now=True,
                    stdout=output,
                )
                messages.success(request, output.getvalue().strip() or 'Mail queue processed.')
            elif action == 'retry_job':
                job = OrderBackgroundJob.objects.filter(pk=request.POST.get('job_id')).first()
                if job:
                    OrderEmailDelivery.objects.filter(
                        order=job.order, status__in=('FAILED', 'SENDING'),
                    ).update(status='PENDING', error='', sent_at=None, updated_at=timezone.now())
                    job.status = 'PENDING'
                    job.error = ''
                    job.locked_at = None
                    job.available_at = timezone.now()
                    job.completed_at = None
                    job.save(update_fields=[
                        'status', 'error', 'locked_at', 'available_at',
                        'completed_at', 'updated_at',
                    ])
                    messages.success(request, f'{job.order.order_number} was queued for retry.')
            elif action == 'queue_missing':
                created = 0
                paid_orders = GuestOrder.objects.filter(payment_status='PAID')
                for order in paid_orders:
                    _, was_created = OrderBackgroundJob.objects.get_or_create(
                        order=order, job_type='SEND_CONFIRMATION_EMAILS',
                    )
                    created += int(was_created)
                messages.success(request, f'Queued {created} missing paid-order job(s).')
            return redirect(reverse('admin:store_orderemaildelivery_monitor'))

        now = timezone.now()
        jobs = list(
            OrderBackgroundJob.objects.select_related('order')
            .prefetch_related('order__email_deliveries')
            .order_by('-created_at')[:100]
        )
        counts = {
            row['status']: row['total']
            for row in OrderBackgroundJob.objects.values('status').annotate(total=Count('id'))
        }
        oldest_pending = OrderBackgroundJob.objects.filter(
            status__in=('PENDING', 'PROCESSING'),
        ).order_by('created_at').first()
        worker_stalled = bool(
            oldest_pending and oldest_pending.created_at < now - timedelta(minutes=2)
        )
        recent_deliveries = OrderEmailDelivery.objects.select_related('order').order_by('-created_at')[:100]
        context = {
            **self.admin_site.each_context(request),
            'title': 'Mail delivery monitor',
            'opts': self.model._meta,
            'jobs': jobs,
            'counts': counts,
            'recent_deliveries': recent_deliveries,
            'worker_stalled': worker_stalled,
            'oldest_pending': oldest_pending,
            'smtp': {
                'backend': settings.EMAIL_BACKEND,
                'host': settings.EMAIL_HOST,
                'port': settings.EMAIL_PORT,
                'tls': settings.EMAIL_USE_TLS,
                'sender': settings.DEFAULT_FROM_EMAIL,
            },
            'active_recipient_count': OrderNotificationRecipient.objects.filter(is_active=True).count(),
        }
        return render(request, 'admin/store/orderemaildelivery/monitor.html', context)


@admin.register(IntegrationEvent)
class IntegrationEventAdmin(admin.ModelAdmin):
    list_display = ('provider', 'event_type', 'event_key', 'order', 'status', 'received_at')
    list_filter = ('provider', 'status')
    search_fields = ('event_key', 'order__order_number')
    readonly_fields = ('payload', 'received_at', 'processed_at')

