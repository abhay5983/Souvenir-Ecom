from django.core.management.base import BaseCommand
from store.integrations.exceptions import IntegrationError
from store.integrations.shiprocket import create_shipment_for_paid_order
from store.models import GuestOrder


class Command(BaseCommand):
    help = 'Retry Shiprocket creation for paid orders that do not yet have a provider order.'

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, default=50)

    def handle(self, *args, **options):
        orders = GuestOrder.objects.filter(
            payment_status='PAID', shiprocket_order_id='',
            shipment_status__in=['NOT_CREATED', 'CREATION_FAILED'],
        ).order_by('created_at')[:options['limit']]
        succeeded = failed = 0
        for order in orders:
            try:
                create_shipment_for_paid_order(order.id)
                succeeded += 1
                self.stdout.write(self.style.SUCCESS(f'{order.order_number}: shipment created'))
            except IntegrationError as exc:
                failed += 1
                self.stderr.write(f'{order.order_number}: {exc}')
        self.stdout.write(f'Processed {succeeded + failed}; succeeded {succeeded}; failed {failed}.')
