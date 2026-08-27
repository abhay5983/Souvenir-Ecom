import hashlib
import hmac
from django.conf import settings
from .exceptions import IntegrationError, IntegrationNotConfigured
from .http import json_request


def payments_configured():
    return all([settings.FASTRR_CREATE_SESSION_URL, settings.FASTRR_MERCHANT_ID, settings.FASTRR_PUBLIC_KEY, settings.FASTRR_SECRET_KEY])


class FastrrClient:
    """Merchant-contract adapter. Update only this file if Fastrr's issued field names differ."""

    def create_session(self, order):
        if not payments_configured():
            raise IntegrationNotConfigured('Fastrr Checkout credentials are not configured.')
        response = json_request(
            settings.FASTRR_CREATE_SESSION_URL,
            method='POST',
            headers={
                'X-Merchant-Id': settings.FASTRR_MERCHANT_ID,
                'X-Api-Key': settings.FASTRR_SECRET_KEY,
            },
            payload={
                'merchantOrderId': order.order_number,
                'amount': order.total * 100,
                'currency': 'INR',
                'customer': {'name': order.customer_name, 'phone': order.mobile, 'email': order.email},
                'shippingAddress': order.address,
                'successUrl': settings.FASTRR_SUCCESS_URL,
                'cancelUrl': settings.FASTRR_CANCEL_URL,
            },
        )
        session_id = response.get('sessionId') or response.get('session_id') or response.get('id')
        checkout_url = response.get('checkoutUrl') or response.get('checkout_url') or response.get('redirectUrl')
        if not session_id:
            raise IntegrationError('Fastrr session response did not contain a session identifier.', details=response)
        return {'sessionId': str(session_id), 'checkoutUrl': checkout_url, 'publicKey': settings.FASTRR_PUBLIC_KEY, 'raw': response}


def verify_webhook(raw_body, received_signature):
    if not settings.FASTRR_WEBHOOK_SECRET:
        raise IntegrationNotConfigured('Fastrr webhook secret is not configured.')
    if not received_signature:
        return False
    expected = hmac.new(settings.FASTRR_WEBHOOK_SECRET.encode(), raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, received_signature.strip())
