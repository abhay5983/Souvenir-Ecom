from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('store', '0007_digitallearningrequest')]

    operations = [
        migrations.AddField(
            model_name='guestorder',
            name='delivery_type',
            field=models.CharField(
                choices=[('STANDARD', 'Standard delivery'), ('PRIORITY', 'Priority delivery')],
                default='STANDARD',
                max_length=20,
            ),
        ),
    ]
