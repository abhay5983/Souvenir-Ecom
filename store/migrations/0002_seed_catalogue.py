from django.db import migrations


PRODUCTS = [
    ('roots-nursery', 'Roots Nursery', 295), ('roots-lkg', 'Roots LKG', 325), ('roots-ukg', 'Roots UKG', 350),
    ('oakwood-english-1', 'Oakwood English 1', 345), ('oakwood-english-2', 'Oakwood English 2', 365), ('oakwood-english-3', 'Oakwood English 3', 385),
    ('numerica-1', 'Numerica 1', 360), ('numerica-2', 'Numerica 2', 380), ('numerica-3', 'Numerica 3', 410),
    ('explorer-science-3', 'Explorer Science 3', 395), ('explorer-science-4', 'Explorer Science 4', 425), ('explorer-science-5', 'Explorer Science 5', 455),
    ('kalpvriksh-hindi-1', 'Kalpvriksh Hindi 1', 330), ('kalpvriksh-hindi-2', 'Kalpvriksh Hindi 2', 350), ('kalpvriksh-hindi-3', 'Kalpvriksh Hindi 3', 375),
    ('social-world-3', 'Social World 3', 390), ('social-world-4', 'Social World 4', 420), ('social-world-5', 'Social World 5', 445),
]


def seed_products(apps, schema_editor):
    Product = apps.get_model('store', 'Product')
    for sku, title, price in PRODUCTS:
        Product.objects.update_or_create(sku=sku, defaults={'title': title, 'price_inr': price, 'active': True, 'stock_quantity': 100})


def remove_products(apps, schema_editor):
    Product = apps.get_model('store', 'Product')
    Product.objects.filter(sku__in=[item[0] for item in PRODUCTS]).delete()


class Migration(migrations.Migration):
    dependencies = [('store', '0001_initial')]
    operations = [migrations.RunPython(seed_products, remove_products)]
