from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('store', '0008_guestorder_delivery_type')]
    operations = [
        migrations.CreateModel(
            name='PublicOutreachRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('reference', models.CharField(blank=True, max_length=32, unique=True)),
                ('form_type', models.CharField(db_index=True, max_length=60)),
                ('form_title', models.CharField(max_length=180)),
                ('category', models.CharField(max_length=120)),
                ('requester_name', models.CharField(blank=True, max_length=160)),
                ('organisation', models.CharField(blank=True, max_length=200)),
                ('email', models.EmailField(blank=True, max_length=254)),
                ('mobile', models.CharField(blank=True, max_length=20)),
                ('state', models.CharField(blank=True, max_length=100)),
                ('payload', models.JSONField(default=dict)),
                ('attachments', models.JSONField(blank=True, default=list)),
                ('confidential', models.BooleanField(default=False)),
                ('status', models.CharField(choices=[('NEW', 'New'), ('IN_REVIEW', 'In Review'), ('WAITING_FOR_CUSTOMER', 'Waiting For Customer'), ('RESOLVED', 'Resolved'), ('CLOSED', 'Closed')], db_index=True, default='NEW', max_length=30)),
                ('assigned_team', models.CharField(blank=True, max_length=120)),
                ('assigned_to', models.CharField(blank=True, max_length=160)),
                ('internal_notes', models.JSONField(blank=True, default=list)),
                ('history', models.JSONField(blank=True, default=list)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
