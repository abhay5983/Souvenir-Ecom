# Souvenir public ecommerce foundation

The current customer flow is public and requires no registration, login, or PartnerKey.

## Start Django

```powershell
.\ram\Scripts\Activate.ps1
python manage.py runserver
```

Django runs at `http://127.0.0.1:8000`. Guest ecommerce orders are handled by the Django `store` app. The existing partner module is retained for future work but is not part of public checkout.

## Start React

In another terminal:

```powershell
cd souvenir-ecommerce
npm run dev
```

Open `http://127.0.0.1:5173`.

## Current flow

`Browse books → Cart → Guest delivery details → Test order confirmation → Track by order number and mobile`

Orders are stored in Django's `db.sqlite3`. Django recalculates book prices and applies ₹75 delivery below ₹1,000, with free delivery from ₹1,000. Products and guest orders can be reviewed through Django Admin.

Payment and shipment are intentionally marked unconfigured. Shiprocket Checkout, payment webhooks, shipment creation, AWB generation, and tracking webhooks will be added after merchant credentials and sandbox access are available.
