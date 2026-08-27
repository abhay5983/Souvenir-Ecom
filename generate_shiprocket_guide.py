from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer


OUTPUT = Path(__file__).with_name('Shiprocket_Account_and_Configuration_Guide.pdf')
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name='GuideTitle', parent=styles['Title'], fontName='Helvetica-Bold', fontSize=19,
    leading=23, textColor=colors.HexColor('#17365D'), alignment=TA_CENTER, spaceAfter=10,
))
styles.add(ParagraphStyle(
    name='GuideHeading', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=12,
    leading=15, textColor=colors.HexColor('#17365D'), spaceBefore=7, spaceAfter=4,
))
styles.add(ParagraphStyle(
    name='GuideBody', parent=styles['BodyText'], fontName='Helvetica', fontSize=9.5,
    leading=13, textColor=colors.HexColor('#222222'), spaceAfter=4,
))
styles.add(ParagraphStyle(
    name='GuideNote', parent=styles['BodyText'], fontName='Helvetica-Bold', fontSize=9,
    leading=12, backColor=colors.HexColor('#EAF2F8'), borderColor=colors.HexColor('#9CC2E5'),
    borderWidth=0.5, borderPadding=7, spaceBefore=6, spaceAfter=7,
))


def step(number, text):
    return Paragraph(f'<b>{number}.</b> {text}', styles['GuideBody'])


story = [
    Paragraph('Shiprocket Merchant Account Setup', styles['GuideTitle']),
    Paragraph('Simple guide for the company director / authorised person', styles['GuideBody']),
    Spacer(1, 3 * mm),
    Paragraph('A. Keep these items ready', styles['GuideHeading']),
    Paragraph('Company PAN, complete GST certificate, incorporation/registration certificate, company bank details, registered office address, pickup address, company email and an authorised person’s mobile number for OTP.', styles['GuideBody']),
    Paragraph('<b>Important:</b> Register the account in the company’s existing legal name—not in an employee’s personal name.', styles['GuideNote']),
    Paragraph('B. Create and verify the account', styles['GuideHeading']),
    step(1, 'Visit <b>www.shiprocket.in</b> and select <b>Sign Up for Free</b>.'),
    step(2, 'Choose <b>I am a Seller</b>. Enter the company-controlled email and authorised mobile number.'),
    step(3, 'Verify the mobile number using OTP and create the password.'),
    step(4, 'Enter the company’s exact legal name, registered address and pickup/warehouse address.'),
    step(5, 'Open <b>Settings → KYC</b>. Select the correct company type and complete GSTIN OTP verification, or upload Company PAN plus GST/incorporation documents.'),
    step(6, 'Add and verify the company bank account. Add the pickup location and wait for KYC approval.'),
    Paragraph('C. Create credentials for the website', styles['GuideHeading']),
    step(1, 'In the Shiprocket panel, open <b>Settings → API → Add New API User</b>.'),
    step(2, 'Create a separate API email and password. Do not share the main Shiprocket login with developers.'),
    step(3, 'Note the exact <b>Pickup Location Name</b> and its six-digit PIN code.'),
    step(4, 'Open the webhook/API settings and add the tracking callback supplied by the technical team. Create a strong webhook token.'),
    Paragraph('Tracking callback: <b>https://OUR_DOMAIN/api/hooks/logistics/events</b>', styles['GuideNote']),
    Paragraph('D. Online payment / Fastrr Checkout', styles['GuideHeading']),
    Paragraph('Ask the Shiprocket account manager or support team to enable <b>Fastrr / Shiprocket Checkout</b>. Shipping-account activation alone may not activate online payments.', styles['GuideBody']),
    Paragraph('Request the Merchant ID, Public Key, Secret Key, Webhook Secret, Create-Session API URL, payment webhook instructions, and test credentials.', styles['GuideBody']),
    Paragraph('Payment callback: <b>https://OUR_DOMAIN/api/hooks/payment/events</b>', styles['GuideNote']),
    Paragraph('E. Send these details securely to the technical team', styles['GuideHeading']),
    Paragraph('1. API-user email and password<br/>2. Pickup location name and PIN<br/>3. Shipping webhook token<br/>4. Fastrr merchant ID and keys<br/>5. Fastrr API URL and integration document<br/>6. Test credentials, if provided', styles['GuideBody']),
    Paragraph('Never send passwords or secret keys through ordinary email or WhatsApp. Use the company-approved password manager or another secure channel.', styles['GuideNote']),
]

document = SimpleDocTemplate(
    str(OUTPUT), pagesize=A4, rightMargin=18 * mm, leftMargin=18 * mm,
    topMargin=14 * mm, bottomMargin=14 * mm, title='Shiprocket Account and Configuration Guide',
    author='Souvenir Ecommerce',
)
document.build(story)
print(OUTPUT)
