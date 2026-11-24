from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [('store', '0014_coordinator_order_tracking')]
    operations = [
        migrations.RemoveConstraint(model_name='orderbackgroundjob', name='unique_order_background_job'),
        migrations.AddField(
            model_name='orderbackgroundjob', name='status_history',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='background_job', to='store.orderstatushistory'),
        ),
        migrations.AlterField(
            model_name='orderbackgroundjob', name='job_type',
            field=models.CharField(choices=[('SEND_CONFIRMATION_EMAILS', 'Send confirmation emails'), ('SEND_STATUS_EMAIL', 'Send customer status email')], max_length=40),
        ),
        migrations.AddConstraint(
            model_name='orderbackgroundjob',
            constraint=models.UniqueConstraint(condition=models.Q(status_history__isnull=True), fields=('order', 'job_type'), name='unique_order_background_job'),
        ),
        migrations.CreateModel(
            name='OrderStatusNotification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('recipient_email', models.EmailField(max_length=254)),
                ('status', models.CharField(choices=[('PENDING', 'Pending'), ('SENDING', 'Sending'), ('SENT', 'Sent'), ('FAILED', 'Failed')], db_index=True, default='PENDING', max_length=20)),
                ('attempts', models.PositiveSmallIntegerField(default=0)),
                ('error', models.TextField(blank=True)),
                ('sent_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('status_history', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='customer_notification', to='store.orderstatushistory')),
            ],
        ),
    ]
