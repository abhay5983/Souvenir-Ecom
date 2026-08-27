from datetime import timedelta
from decimal import Decimal
from urllib.parse import urlencode
from django.conf import settings
from django.core.cache import cache
from django.db import transaction
from django.utils import timezone
from django.utils.dateparse import parse_date
from .exceptions import IntegrationError, IntegrationNotConfigured
from .http import json_request
from store.models import GuestOrder


TOKEN_CACHE_KEY = 'shiprocket:api-token'


def shipping_configured():
    return all([
        settings.SHIPROCKET_API_EMAIL,
        settings.SHIPROCKET_API_PASSWORD,
        settings.SHIPROCKET_PICKUP_LOCATION,
        settings.SHIPROCKET_PICKUP_POSTCODE,
    ])


class ShiprocketClient:
    def __init__(self):
        self.base_url = settings.SHIPROCKET_API_BASE_URL.rstrip('/')

    def token(self):
        if not shipping_configured():
            raise IntegrationNotConfigured('Shiprocket Shipping credentials are not configured.')
        token = cache.get(TOKEN_CACHE_KEY)
        if token:
            return token
        response = json_request(
            f'{self.base_url}/auth/login', method='POST',
            payload={'email': settings.SHIPROCKET_API_EMAIL, 'password': settings.SHIPROCKET_API_PASSWORD},
        )
        token = response.get('token')
        if not token:
            raise IntegrationError('Shiprocket authentication did not return a token.', details=response)
        cache.set(TOKEN_CACHE_KEY, token, timeout=9 * 24 * 60 * 60)
        return token

    def request(self, path, *, method='GET', payload=None, query=None, retry_auth=True):
        url = f'{self.base_url}/{path.lstrip("/")}'
        if query:
            url = f'{url}?{urlencode(query)}'
        try:
            return json_request(url, method=method, payload=payload, headers={'Authorization': f'Bearer {self.token()}'})
        except IntegrationError as exc:
            if retry_auth and exc.details and str(exc.details).lower().find('token') >= 0:
                cache.delete(TOKEN_CACHE_KEY)
                return self.request(path, method=method, payload=payload, query=query, retry_auth=False)
            raise

    def serviceability(self, *, delivery_postcode, weight, declared_value, length, breadth, height):
        return self.request('courier/serviceability/', query={
            'pickup_postcode': settings.SHIPROCKET_PICKUP_POSTCODE,
            'delivery_postcode': delivery_postcode,
            'cod': 0,
            'weight': f'{weight:.3f}',
            'declared_value': declared_value,
            'length': f'{length:.2f}', 'breadth': f'{breadth:.2f}', 'height': f'{height:.2f}',
        })

    def create_order(self, payload):
        return self.request('orders/create/adhoc', method='POST', payload=payload)

    def assign_awb(self, shipment_id, courier_id=None):
        payload = {'shipment_id': shipment_id}
        if courier_id:
            payload['courier_id'] = courier_id
        return self.request('courier/assign/awb', method='POST', payload=payload)

    def request_pickup(self, shipment_id):
        return self.request('courier/generate/pickup', method='POST', payload={'shipment_id': [shipment_id]})

    def track_awb(self, awb):
        return self.request(f'courier/track/awb/{awb}')


def package_for_products(products_with_quantities):
    weight = sum((product.weight_kg * quantity for product, quantity in products_with_quantities), Decimal('0'))
    length = max([product.length_cm for product, _ in products_with_quantities] + [Decimal(str(settings.SHIPROCKET_DEFAULT_PACKAGE_LENGTH_CM))])
    breadth = max([product.breadth_cm for product, _ in products_with_quantities] + [Decimal(str(settings.SHIPROCKET_DEFAULT_PACKAGE_BREADTH_CM))])
    book_height = sum((product.height_cm * quantity for product, quantity in products_with_quantities), Decimal('0'))
    height = max(book_height, Decimal(str(settings.SHIPROCKET_DEFAULT_PACKAGE_HEIGHT_CM)))
    return weight, length, breadth, height


def best_courier_quote(response):
    couriers = response.get('data', {}).get('available_courier_companies', [])
    usable = [item for item in couriers if item.get('rate') is not None or item.get('freight_charge') is not None]
    if not usable:
        raise IntegrationError('No prepaid courier is available for this PIN code.', code='NOT_SERVICEABLE', status=400, details=response)
    selected = min(usable, key=lambda item: float(item.get('rate', item.get('freight_charge', 999999))))
    rate = float(selected.get('rate', selected.get('freight_charge', 0)))
    return {
        'courierId': selected.get('courier_company_id'),
        'courierName': selected.get('courier_name', ''),
        'shippingCharge': round(rate),
        'estimatedDeliveryDays': selected.get('estimated_delivery_days', ''),
        'etd': selected.get('etd', ''),
    }


def quote_for_lines(postal_code, products_with_quantities, declared_value):
    weight, length, breadth, height = package_for_products(products_with_quantities)
    if not shipping_configured():
        return {
            'configured': False, 'serviceable': True,
            'shippingCharge': 0 if declared_value >= 1000 else 75,
            'message': 'Live Shiprocket serviceability will activate after credentials are configured.',
            'package': {'weight': float(weight), 'length': float(length), 'breadth': float(breadth), 'height': float(height)},
        }
    response = ShiprocketClient().serviceability(
        delivery_postcode=postal_code, weight=weight, declared_value=declared_value,
        length=length, breadth=breadth, height=height,
    )
    quote = best_courier_quote(response)
    return {'configured': True, 'serviceable': True, **quote,
            'package': {'weight': float(weight), 'length': float(length), 'breadth': float(breadth), 'height': float(height)}}


def shiprocket_order_payload(order):
    items = list(order.items.select_related('product'))
    product_quantities = [(item.product, item.quantity) for item in items]
    weight, length, breadth, height = package_for_products(product_quantities)
    address = order.address
    names = order.customer_name.split(maxsplit=1)
    return {
        'order_id': order.order_number,
        'order_date': order.created_at.strftime('%Y-%m-%d %H:%M'),
        'pickup_location': settings.SHIPROCKET_PICKUP_LOCATION,
        'billing_customer_name': names[0],
        'billing_last_name': names[1] if len(names) > 1 else '',
        'billing_address': address.get('line1', ''),
        'billing_address_2': address.get('line2', ''),
        'billing_city': address.get('city', ''),
        'billing_pincode': address.get('postal_code', ''),
        'billing_state': address.get('state', ''),
        'billing_country': address.get('country', 'India'),
        'billing_email': order.email,
        'billing_phone': order.mobile,
        'shipping_is_billing': True,
        'order_items': [{'name': item.title, 'sku': item.sku, 'units': item.quantity,
                         'selling_price': item.unit_price, 'discount': 0, 'tax': 0,
                         'hsn': item.product.hsn_code} for item in items],
        'payment_method': 'Prepaid',
        'sub_total': order.subtotal,
        'length': float(length), 'breadth': float(breadth), 'height': float(height), 'weight': float(weight),
    }


def create_shipment_for_paid_order(order_id):
    with transaction.atomic():
        order = GuestOrder.objects.select_for_update().get(id=order_id)
        if order.payment_status != 'PAID':
            raise IntegrationError('Shipment creation requires a verified paid order.', code='ORDER_NOT_PAID', status=409)
        if order.shiprocket_order_id:
            return order
        order.shipment_status = 'CREATION_PENDING'
        order.integration_error = ''
        order.save(update_fields=['shipment_status', 'integration_error', 'updated_at'])

    try:
        client = ShiprocketClient()
        created = client.create_order(shiprocket_order_payload(order))
        shipment_id = created.get('shipment_id')
        provider_order_id = created.get('order_id')
        if not shipment_id or not provider_order_id:
            raise IntegrationError('Shiprocket order creation returned incomplete identifiers.', details=created)
        awb_response = client.assign_awb(shipment_id, order.courier_id or None)
        awb_data = awb_response.get('response', {}).get('data', {})
        awb = awb_data.get('awb_code', '')
        courier_name = awb_data.get('courier_name', '')
        pickup_response = client.request_pickup(shipment_id) if awb else {}
        with transaction.atomic():
            order = GuestOrder.objects.select_for_update().get(id=order_id)
            order.shiprocket_order_id = str(provider_order_id)
            order.shiprocket_shipment_id = str(shipment_id)
            order.shiprocket_awb = str(awb)
            order.courier_name = courier_name or order.courier_name
            order.shipment_status = 'PICKUP_SCHEDULED' if pickup_response else ('AWB_ASSIGNED' if awb else 'CREATED')
            order.order_status = 'PROCESSING'
            order.integration_error = ''
            order.save()
        return order
    except IntegrationError as exc:
        GuestOrder.objects.filter(id=order_id).update(shipment_status='CREATION_FAILED', integration_error=str(exc))
        raise
