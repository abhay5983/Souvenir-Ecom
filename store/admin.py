from django.contrib import admin
from django.contrib import messages
from django.core.exceptions import ValidationError
from django.http import HttpResponse
from django.shortcuts import redirect, render
from django.urls import path, reverse
from .catalog_import import import_catalogue, template_bytes
from .models import GuestOrder, IntegrationEvent, OrderItem, PaymentAttempt, Product, ShipmentEvent


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'sku', 'title', 'unit_price', 'quantity', 'line_total')


@admin.register(GuestOrder)
class GuestOrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'customer_name', 'mobile', 'total', 'order_status', 'payment_status', 'shipment_status', 'created_at')
    list_filter = ('order_status', 'payment_status', 'shipment_status')
    search_fields = ('order_number', 'customer_name', 'mobile', 'email', 'shiprocket_awb')
    readonly_fields = ('order_number', 'tracking_token', 'payment_verified_at', 'created_at', 'updated_at')
    inlines = [OrderItemInline]


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    change_list_template = 'admin/store/product/change_list.html'
    list_display = ('sku', 'title', 'series_title', 'level', 'price_inr', 'stock_quantity', 'public_visibility', 'active')
    list_filter = ('active', 'public_visibility', 'featured', 'imprint', 'subject', 'category', 'stage')
    search_fields = ('sku', 'isbn', 'title', 'series_title')

    def get_urls(self):
        return [
            path('import/', self.admin_site.admin_view(self.import_view), name='store_product_import'),
            path('template/', self.admin_site.admin_view(self.template_view), name='store_product_template'),
        ] + super().get_urls()

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


@admin.register(PaymentAttempt)
class PaymentAttemptAdmin(admin.ModelAdmin):
    list_display = ('order', 'provider', 'session_id', 'transaction_id', 'amount', 'status', 'created_at')
    search_fields = ('order__order_number', 'session_id', 'transaction_id')
    readonly_fields = ('created_at', 'updated_at', 'provider_response')


@admin.register(IntegrationEvent)
class IntegrationEventAdmin(admin.ModelAdmin):
    list_display = ('provider', 'event_type', 'event_key', 'order', 'status', 'received_at')
    list_filter = ('provider', 'status')
    search_fields = ('event_key', 'order__order_number')
    readonly_fields = ('payload', 'received_at', 'processed_at')


@admin.register(ShipmentEvent)
class ShipmentEventAdmin(admin.ModelAdmin):
    list_display = ('order', 'normalized_status', 'provider_status', 'location', 'event_time')
    search_fields = ('order__order_number', 'provider_status', 'location')
    readonly_fields = ('payload', 'created_at')
