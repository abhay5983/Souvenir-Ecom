from datetime import timedelta
import time

from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from store.models import OrderBackgroundJob
from store.order_email import send_order_confirmation_emails, send_order_status_email


class Command(BaseCommand):
    help = 'Process durable order background jobs.'

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, default=50)
        parser.add_argument('--watch', action='store_true')
        parser.add_argument('--poll-interval', type=float, default=5.0)
        parser.add_argument(
            '--retry-failed-now', action='store_true',
            help='Make failed jobs immediately eligible instead of waiting for backoff.',
        )

    def handle(self, *args, **options):
        if options['retry_failed_now']:
            now = timezone.now()
            OrderBackgroundJob.objects.filter(status='FAILED').update(
                available_at=now, locked_at=None, updated_at=now,
            )
        while True:
            processed = self._process_batch(options['limit'])
            if not options['watch']:
                self.stdout.write(self.style.SUCCESS(f'Processed {processed} order job(s).'))
                return
            if not processed:
                time.sleep(max(0.5, min(options['poll_interval'], 60)))

    def _process_batch(self, limit):
        processed = 0
        for _ in range(max(1, min(limit, 500))):
            job = self._claim()
            if not job:
                break
            if job.job_type == 'SEND_STATUS_EMAIL' and job.status_history_id:
                succeeded = send_order_status_email(job.status_history.customer_notification.id)
                failure_message = 'Customer status email failed.'
            else:
                succeeded = send_order_confirmation_emails(job.order_id)
                failure_message = 'One or more confirmation emails failed.'
            now = timezone.now()
            if succeeded:
                OrderBackgroundJob.objects.filter(pk=job.pk).update(
                    status='COMPLETED', error='', completed_at=now, locked_at=None, updated_at=now,
                )
            else:
                delay_minutes = min(2 ** min(job.attempts, 6), 60)
                OrderBackgroundJob.objects.filter(pk=job.pk).update(
                    status='FAILED', error=failure_message,
                    available_at=now + timedelta(minutes=delay_minutes), locked_at=None, updated_at=now,
                )
            processed += 1
        return processed

    @staticmethod
    def _claim():
        now = timezone.now()
        stale_before = now - timedelta(minutes=15)
        with transaction.atomic():
            job = OrderBackgroundJob.objects.select_for_update().filter(
                status__in=('PENDING', 'FAILED', 'PROCESSING'), available_at__lte=now,
            ).filter(
                Q(locked_at__isnull=True) | Q(locked_at__lt=stale_before)
            ).order_by('available_at', 'id').first()
            if not job:
                return None
            job.status = 'PROCESSING'
            job.attempts += 1
            job.locked_at = now
            job.save(update_fields=['status', 'attempts', 'locked_at', 'updated_at'])
            return job
