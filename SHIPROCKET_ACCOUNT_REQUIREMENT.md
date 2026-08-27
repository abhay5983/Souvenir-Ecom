# Shiprocket Merchant Account Requirement

## Purpose

Create a Shiprocket merchant account for shipping book orders received through the company’s e-commerce website. The account must be registered under the company’s existing legal entity, not under an employee or individual.

## Account ownership

- Use the exact legal company name and entity type shown on company records.
- Use a company-controlled email, preferably `shipping@companydomain.com`.
- Use an authorised company representative’s mobile number for OTP and verification.
- The company must retain ownership of the primary login, recovery email and mobile number.

## Documents and information required

- Company PAN card
- Complete GST registration certificate
- Certificate of incorporation or applicable business-registration document
- Registered office address
- Pickup/warehouse address with six-digit PIN code
- Company bank-account details and cancelled cheque, if requested
- Authorised representative’s PAN/Aadhaar, photograph/selfie and authority letter, if requested
- Company/brand name, website and logo
- Approximate monthly shipment volume
- Product category: Books/Publications

All names, addresses and bank details should match the company’s PAN, GST and incorporation records.

## Services to activate

- Domestic prepaid shipping
- API access
- Shipment tracking webhooks
- Fastrr/Shiprocket Checkout for online payments, if available for the account
- COD may remain disabled unless the company decides to offer it later

## Details required by the technical team

After KYC and account activation, please provide securely:

- Separate Shiprocket API-user email and password—not the primary merchant password
- Exact pickup-location name configured in Shiprocket
- Pickup PIN code
- Shipping webhook security token
- Fastrr merchant ID, public key, secret key and webhook secret
- Fastrr session/API URL and integration document
- Test credentials, if provided

Secrets must be shared through an approved secure channel and must not be sent in ordinary email or WhatsApp.

## Required callback URLs

- Payment: `https://OUR_DOMAIN/api/hooks/payment/events`
- Shipment tracking: `https://OUR_DOMAIN/api/hooks/logistics/events`

The final production domain will be supplied by the technical team before webhook activation.
