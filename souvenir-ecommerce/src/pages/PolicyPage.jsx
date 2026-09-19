import { Link } from "react-router-dom";

const POLICIES = {
  returns: {
    eyebrow: "Customer care",
    title: "Return, replacement and cancellation policy",
    intro: "We want every Souvenir book to reach you in good condition and match what you ordered. This policy explains how we handle damaged, defective or incorrect items.",
    sections: [
      ["When you can request help", "Contact us within 7 calendar days of delivery if a book is damaged in transit, has a printing or binding defect, or is different from the title or edition shown in your order. Keep the book, invoice and original packaging until the request is resolved."],
      ["Items that cannot be returned", "Returns are not available for change of mind, minor colour differences, books that have been written in or damaged after delivery, or digital resources that have already been accessed. A complete book set must be returned together when the issue affects a set."],
      ["How resolution works", "After reviewing your order details and photographs, we will normally arrange a replacement. If the same book is unavailable, we may offer an equivalent title or refund the amount paid for the affected item. Approved return pickup is arranged at no additional cost."],
      ["Cancellations", "You may request cancellation before an order is packed or handed to the courier. Once dispatched, the order can only be considered under the return conditions above. Payment reversals are sent to the original payment method and processing time depends on the bank or payment provider."],
    ],
  },
  privacy: {
    eyebrow: "Your information",
    title: "Privacy policy",
    intro: "This policy describes how Souvenir Publishers handles information provided while browsing the catalogue, placing an order, requesting digital resources or contacting support.",
    sections: [
      ["Information we collect", "We may collect your name, mobile number, email address, delivery address, order details, support messages and limited technical information needed to operate and protect the website. Payment credentials are handled by the authorised payment provider and are not stored as complete card details on this platform."],
      ["How information is used", "Information is used to process orders, arrange delivery, provide order updates, respond to enquiries, prevent misuse and improve customer service. We do not sell customer information."],
      ["Sharing and retention", "Only information required to fulfil a service may be shared with payment, courier, hosting and support providers. Records are retained for operational, accounting and legal requirements, then deleted or anonymised when no longer required."],
      ["Your choices", "You may ask us to correct inaccurate contact details or raise a privacy question through the Help Centre. Certain order and invoice records may need to be retained where required by law."],
    ],
  },
  terms: {
    eyebrow: "Website terms",
    title: "Terms and conditions",
    intro: "These terms apply when you use the Souvenir Publishers website, browse the catalogue, access digital resources or place an order.",
    sections: [
      ["Catalogue and availability", "Book descriptions, prices and availability may be updated without notice. An order is accepted after successful payment and confirmation. If an item becomes unavailable, we will contact you about replacement or refund options."],
      ["Orders and delivery", "You are responsible for providing accurate contact and delivery information. Delivery estimates are working-day estimates and may be affected by serviceability, public holidays or events outside reasonable control."],
      ["Digital resources", "Digital materials are provided for the eligible book and intended user. Links, teacher materials and access details must not be copied, resold, published or shared outside the permitted classroom or personal-learning use."],
      ["Content and acceptable use", "All website, book and digital-resource content remains protected by applicable intellectual-property rights. You must not interfere with the website, attempt unauthorised access or use the service for unlawful activity."],
    ],
  },
};

function PolicyPage({ policy }) {
  const content = POLICIES[policy] ?? POLICIES.terms;
  return (
    <main className="policy-page">
      <section className="page-hero policy-hero"><div className="container"><p className="eyebrow">{content.eyebrow}</p><h1>{content.title}</h1><p className="lede">{content.intro}</p><p className="policy-updated">Last updated: 18 September 2026</p></div></section>
      <section className="section compact"><div className="container policy-layout">
        <article className="card policy-content">
          {content.sections.map(([title, body], index) => <section key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h2>{title}</h2><p>{body}</p></div></section>)}
        </article>
        <aside className="card policy-help"><p className="eyebrow">Need assistance?</p><h2>We’re here to help</h2><p>Include your order number and registered mobile number so our team can locate the purchase quickly.</p><Link className="button full-width" to="/help/forms/general-enquiry">Contact customer support</Link><Link className="text-link" to="/track-order">Track an existing order →</Link></aside>
      </div></section>
    </main>
  );
}

export default PolicyPage;
