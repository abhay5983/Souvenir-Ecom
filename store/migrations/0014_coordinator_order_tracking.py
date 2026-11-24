from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


def populate_delivery_states(apps, schema_editor):
    aliases = {
        'ap': 'Andhra Pradesh', 'ar': 'Arunachal Pradesh', 'as': 'Assam', 'br': 'Bihar',
        'cg': 'Chhattisgarh', 'ct': 'Chhattisgarh', 'ch': 'Chandigarh', 'dl': 'Delhi',
        'new delhi': 'Delhi', 'ga': 'Goa', 'gj': 'Gujarat', 'hr': 'Haryana',
        'hp': 'Himachal Pradesh', 'jk': 'Jammu and Kashmir', 'jh': 'Jharkhand',
        'ka': 'Karnataka', 'kl': 'Kerala', 'mp': 'Madhya Pradesh', 'mh': 'Maharashtra',
        'od': 'Odisha', 'orissa': 'Odisha', 'py': 'Puducherry', 'pondicherry': 'Puducherry',
        'pb': 'Punjab', 'rj': 'Rajasthan', 'tn': 'Tamil Nadu', 'ts': 'Telangana',
        'tg': 'Telangana', 'up': 'Uttar Pradesh', 'uk': 'Uttarakhand', 'ua': 'Uttarakhand',
        'wb': 'West Bengal',
    }
    GuestOrder = apps.get_model('store', 'GuestOrder')
    for order in GuestOrder.objects.only('id', 'address').iterator():
        address = order.address if isinstance(order.address, dict) else {}
        state = ' '.join(str(address.get('state') or '').strip().split())
        state = aliases.get(state.casefold(), state)
        if state:
            GuestOrder.objects.filter(pk=order.pk).update(delivery_state=state)


class Migration(migrations.Migration):
    dependencies = [('store', '0013_product_sort_order'), migrations.swappable_dependency(settings.AUTH_USER_MODEL)]
    operations = [
        migrations.AddField(
            model_name='guestorder', name='delivery_state',
            field=models.CharField(blank=True, db_index=True, max_length=100),
        ),
        migrations.CreateModel(
            name='CoordinatorProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('states', models.JSONField(blank=True, default=list)),
                ('mobile', models.CharField(blank=True, max_length=10)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='coordinator_profile', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='OrderStatusHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('shipment_status', models.CharField(choices=[('NOT_CREATED', 'Not Created'), ('CREATION_PENDING', 'Creation Pending'), ('CREATION_FAILED', 'Creation Failed'), ('CREATED', 'Created'), ('AWB_ASSIGNED', 'Awb Assigned'), ('PICKUP_SCHEDULED', 'Pickup Scheduled'), ('SHIPPED', 'Shipped'), ('IN_TRANSIT', 'In Transit'), ('OUT_FOR_DELIVERY', 'Out For Delivery'), ('DELIVERED', 'Delivered'), ('DELAYED', 'Delayed'), ('UNDELIVERED', 'Undelivered'), ('RTO_INITIATED', 'Rto Initiated'), ('RTO_DELIVERED', 'Rto Delivered'), ('RETURNED', 'Returned')], max_length=40)),
                ('customer_message', models.CharField(blank=True, max_length=240)),
                ('internal_note', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('changed_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='order_status_changes', to=settings.AUTH_USER_MODEL)),
                ('order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='status_history', to='store.guestorder')),
            ],
            options={'ordering': ('created_at', 'id')},
        ),
        migrations.RunPython(populate_delivery_states, migrations.RunPython.noop),
    ]
