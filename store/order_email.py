import logging

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.db import transaction
from django.template.loader import render_to_string
from django.utils import timezone

from .models import GuestOrder, OrderEmailDelivery, OrderNotificationRecipient

logger = logging.getLogger(__name__)


def _claim_delivery(order, email, recipient_type):
    with transaction.atomic():
        delivery, _ = OrderEmailDelivery.objects.select_for_update().get_or_create(
            order=order,
            recipient_email=email,
            defaults={'recipient_type': recipient_type},
        )
        if delivery.status in {'SENT', 'SENDING'}:
            return None
        delivery.recipient_type = recipient_type
        delivery.status = 'SENDING'
        delivery.error = ''
        delivery.save(update_fields=['recipient_type', 'status', 'error', 'updated_at'])
        return delivery


def send_order_confirmation_emails(order_id):
    try:
        order = GuestOrder.objects.prefetch_related('items').get(id=order_id)
        if order.payment_status != 'PAID':
            return False

        recipients = {}
        customer_email = order.email.strip().lower()
        if customer_email:
            recipients[customer_email] = 'CUSTOMER'
        for email in OrderNotificationRecipient.objects.filter(is_active=True).values_list('email', flat=True):
            recipients.setdefault(email.strip().lower(), 'INTERNAL')

        context = {
            'order': order,
            'items': order.items.all(),
            'tracking_url': f'{settings.PUBLIC_SITE_URL}/track-order',
            'delivery_timeline': '2–3 working days' if order.delivery_type == 'PRIORITY' else '6–8 working days',
            'total_quantity': sum(item.quantity for item in order.items.all()),
            'order_time': timezone.localtime(order.created_at),
        }

        for email, recipient_type in recipients.items():
            delivery = _claim_delivery(order, email, recipient_type)
            if not delivery:
                continue
            try:
                if recipient_type == 'CUSTOMER':
                    subject = f'Your Souvenir order has been received — {order.order_number}'
                    text_body = render_to_string('email/order_confirmation.txt', context)
                    html_body = render_to_string('email/order_confirmation.html', context)
                else:
                    subject = f'New paid order for processing — {order.order_number}'
                    text_body = render_to_string('email/internal_order_notification.txt', context)
                    html_body = render_to_string('email/internal_order_notification.html', context)
                message = EmailMultiAlternatives(
                    subject=subject,
                    body=text_body,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[email],
                )
                message.attach_alternative(html_body, 'text/html')
                if message.send(fail_silently=False) != 1:
                    raise RuntimeError('Email backend did not confirm delivery.')
            except Exception as exc:
                OrderEmailDelivery.objects.filter(id=delivery.id).update(
                    status='FAILED', error=str(exc)[:2000], updated_at=timezone.now(),
                )
                logger.exception('Order confirmation email failed for order %s', order.order_number)
            else:
                OrderEmailDelivery.objects.filter(id=delivery.id).update(
                    status='SENT', error='', sent_at=timezone.now(), updated_at=timezone.now(),
                )
        return not OrderEmailDelivery.objects.filter(order=order, status='FAILED').exists()
    except Exception:
        logger.exception('Order confirmation email processing failed for order id %s', order_id)
        return False
