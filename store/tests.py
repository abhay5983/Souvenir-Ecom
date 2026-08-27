import json
from io import BytesIO
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from openpyxl import load_workbook
from .catalog_import import HEADERS, import_catalogue, template_bytes
from .models import GuestOrder, Product


class GuestOrderApiTests(TestCase):
    def setUp(self):
        Product.objects.create(sku='book-1', title='Test Book', price_inr=300, stock_quantity=10)

    def post(self, path, body):
        return self.client.post(path, json.dumps(body), content_type='application/json')

    def test_guest_can_create_and_track_order(self):
        response = self.post('/api/orders', {
            'customer_name': 'Test Buyer', 'mobile': '9876543210', 'email': 'buyer@example.com',
            'address': {'line1': '12 Test Road', 'city': 'Delhi', 'state': 'Delhi', 'postal_code': '110001'},
            'lines': [{'product_id': 'book-1', 'quantity': 2}],
        })
        self.assertEqual(response.status_code, 201, response.content)
        created = response.json()
        self.assertEqual(created['subtotal'], 600)
        self.assertEqual(created['shippingCharge'], 75)
        tracked = self.post('/api/orders/track', {'order_number': created['orderNumber'], 'mobile': '9876543210'})
        self.assertEqual(tracked.status_code, 200)
        self.assertEqual(tracked.json()['items'][0]['title'], 'Test Book')

    def test_frontend_price_is_not_accepted(self):
        response = self.post('/api/orders', {
            'customer_name': 'Test Buyer', 'mobile': '9876543210', 'email': 'buyer@example.com',
            'address': {'line1': '12 Test Road', 'city': 'Delhi', 'state': 'Delhi', 'postal_code': '110001'},
            'lines': [{'product_id': 'book-1', 'quantity': 1, 'unit_price': 1}],
        })
        self.assertEqual(response.json()['subtotal'], 300)

    def test_shipping_quote_uses_safe_fallback_before_credentials_exist(self):
        response = self.post('/api/shipping/serviceability', {
            'postal_code': '110001',
            'lines': [{'product_id': 'book-1', 'quantity': 1}],
        })
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.json()['configured'])
        self.assertEqual(response.json()['shippingCharge'], 75)

    def test_checkout_idempotency_does_not_create_duplicate_orders(self):
        body = {
            'idempotency_key': 'browser-attempt-123',
            'customer_name': 'Test Buyer', 'mobile': '9876543210', 'email': 'buyer@example.com',
            'address': {'line1': '12 Test Road', 'city': 'Delhi', 'state': 'Delhi', 'postal_code': '110001'},
            'lines': [{'product_id': 'book-1', 'quantity': 1}],
        }
        first = self.post('/api/orders', body)
        second = self.post('/api/orders', body)
        self.assertEqual(first.status_code, 201)
        self.assertEqual(second.status_code, 200)
        self.assertEqual(first.json()['orderNumber'], second.json()['orderNumber'])
        self.assertEqual(GuestOrder.objects.filter(checkout_idempotency_key='browser-attempt-123').count(), 1)


class CatalogueImportTests(TestCase):
    def workbook_upload(self, values):
        workbook = load_workbook(BytesIO(template_bytes()))
        workbook['Books'].append(values)
        output = BytesIO()
        workbook.save(output)
        return SimpleUploadedFile('books.xlsx', output.getvalue(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

    def test_excel_import_creates_product_and_public_catalogue(self):
        row = {header: '' for header in HEADERS}
        row.update({
            'book': 'Real Book 1', 'series': 'Real Series', 'isbn': '9781234567890',
            'subject': 'English', 'description': 'A real series.',
            'digital features': 'Audio Book|Videos', 'price': 399,
        })
        result = import_catalogue(self.workbook_upload([row[header] for header in HEADERS]))
        self.assertEqual(result['created'], 1)
        response = self.client.get('/api/catalogue')
        self.assertEqual(response.status_code, 200)
        series = response.json()['catalogue'][0]
        self.assertEqual(series['title'], 'Real Series')
        self.assertEqual(series['variants'][0]['id'], '9781234567890')
        self.assertEqual(series['digitalFeatures'], ['Audio Book', 'Videos'])
