import razorpay
from django.conf import settings
from razorpay.errors import BadRequestError, GatewayError, ServerError

from .exceptions import IntegrationError, IntegrationNotConfigured


def payments_configured():
    return bool(settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET)


def _client():
    if not payments_configured():
        raise IntegrationNotConfigured('Razorpay credentials are not configured.')
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


def create_payment_order(order):
    amount = order.total * 100
    if amount < 100:
        raise IntegrationError(
            'Payment amount must be at least INR 1.00.', code='INVALID_AMOUNT', status=400,
        )

    try:
        attempt_number = order.payment_attempts.filter(provider='RAZORPAY').count() + 1
        response = _client().order.create({
            'amount': amount,
            'currency': 'INR',
            'receipt': f'{order.order_number}-{attempt_number}',
            'notes': {'souvenir_order_number': order.order_number},
        })
    except BadRequestError as exc:
        message = str(exc) or 'Razorpay rejected the order request.'
        is_auth_error = any(word in message.lower() for word in ('auth', 'key', 'credential'))
        raise IntegrationError(
            message,
            code='RAZORPAY_AUTH_FAILED' if is_auth_error else 'RAZORPAY_ORDER_FAILED',
            status=401 if is_auth_error else 500,
        ) from exc
    except (GatewayError, ServerError) as exc:
        raise IntegrationError(
            str(exc) or 'Razorpay could not create the payment order.',
            code='RAZORPAY_ORDER_FAILED', status=500,
        ) from exc
    except Exception as exc:
        raise IntegrationError(
            'Razorpay could not be reached. Please try again.',
            code='RAZORPAY_UNAVAILABLE', status=500,
        ) from exc

    razorpay_order_id = str(response.get('id') or '')
    if not razorpay_order_id:
        raise IntegrationError(
            'Razorpay returned an incomplete order response.',
            code='RAZORPAY_ORDER_FAILED', status=500, details=response,
        )

    return {
        'orderId': razorpay_order_id,
        'order_id': razorpay_order_id,
        'amount': int(response.get('amount') or amount),
        'currency': response.get('currency') or 'INR',
        'keyId': settings.RAZORPAY_KEY_ID,
        'raw': response,
    }


def fetch_payment(payment_id):
    try:
        return _client().payment.fetch(payment_id)
    except BadRequestError as exc:
        raise IntegrationError(
            str(exc) or 'Razorpay could not verify this payment.',
            code='RAZORPAY_PAYMENT_NOT_FOUND', status=400,
        ) from exc
    except (GatewayError, ServerError) as exc:
        raise IntegrationError(
            str(exc) or 'Razorpay payment verification is temporarily unavailable.',
            code='RAZORPAY_VERIFICATION_FAILED', status=502,
        ) from exc
    except Exception as exc:
        raise IntegrationError(
            'Razorpay could not be reached to verify the payment.',
            code='RAZORPAY_UNAVAILABLE', status=502,
        ) from exc
