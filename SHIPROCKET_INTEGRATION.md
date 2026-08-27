# Shiprocket shipping and Fastrr checkout setup

The code is credential-ready. Until credentials are present, checkout uses the existing delivery estimate (free from ₹1,000, otherwise ₹75), saves the order with payment not configured, and makes no external API call.

## 1. Create the accounts and API credentials

In Shiprocket, configure the pickup address, then create a separate API user under **Settings → API → Add New API User**. Do not put the main merchant password in this project.

Complete Fastrr/Shiprocket Checkout onboarding and request the create-session endpoint, merchant ID, public key, secret key, webhook secret, signature header, exact request schema, and test credentials. Fastrr's custom merchant contract is isolated in `store/integrations/fastrr.py`; compare that adapter with the onboarding document before enabling production payments.

Copy `.env.example` to your deployment's secret/environment configuration and fill the values. Django reads operating-system environment variables; it intentionally does not read or commit a local `.env` automatically.

## 2. Configure provider callbacks

Use public HTTPS URLs (localhost will not work):

- Payment callback: `https://YOUR_DOMAIN/api/hooks/payment/events`
- Shipping/tracking callback: `https://YOUR_DOMAIN/api/hooks/logistics/events`

Set the shipping webhook security token equal to `SHIPROCKET_WEBHOOK_TOKEN`. The shipping endpoint validates `x-api-key`. Set the payment webhook secret and signature header exactly as supplied in onboarding. Do not include Shiprocket brand keywords in the shipping callback hostname/path if their dashboard rejects them; the supplied path is deliberately neutral.

## 3. Prepare catalogue and database

For every product, set SKU, HSN, weight (kg), dimensions (cm), selling price, and stock in Django admin. Then run:

```powershell
.\ram\Scripts\python.exe manage.py migrate
.\ram\Scripts\python.exe manage.py createsuperuser
```

## 4. Runtime flow

Checkout checks PIN-code serviceability and pricing server-side. After Fastrr confirms payment through the signed webhook, Django creates the prepaid Shiprocket order, assigns an AWB, and requests pickup. Tracking webhooks update the guest tracking page. Browser success redirects never mark an order paid; only a verified server webhook does.

Run this periodically (for example every five minutes) to retry transient shipment-creation failures:

```powershell
.\ram\Scripts\python.exe manage.py process_shiprocket_orders --limit 50
```

Before going live, perform one low-value test order in the provider test environment, verify payment signature data, serviceability, AWB, pickup, tracking webhook, cancellation/refund behavior, and then replace all test credentials with production secrets.
