import { useState } from "react";
import { Link } from "react-router-dom";
import { ecommerceService } from "../services/ecommerceService.js";

function TrackOrderPage() {
  const [form, setForm] = useState({ orderNumber: "", mobile: "" });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    try {
      setResult(await ecommerceService.trackOrder({ order_number: form.orderNumber, mobile: form.mobile }));
      setError("");
    } catch (requestError) {
      setResult(null);
      setError(requestError.message);
    }
  }

  const pretty = (value) => value?.replaceAll("_", " ") ?? "";
  const dateLabel = (value) => new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium", timeStyle: "short",
  }).format(new Date(value));
  const paymentConfirmed = result?.paymentStatus === "PAID";
  const paymentFailed = result?.paymentStatus === "FAILED";

  return <section className="section compact"><div className="container"><div className="form-shell">
    <form className="form-card" onSubmit={submit}>
      <p className="eyebrow">Order tracking</p>
      <h1>Track your order</h1>
      <p>Enter the order number and mobile number used during checkout.</p>
      {error && <div className="notice danger">{error}</div>}
      <div className="form-field"><label>Order number</label><input value={form.orderNumber} onChange={(event) => setForm((current) => ({ ...current, orderNumber: event.target.value }))} required /></div>
      <div className="form-field"><label>Mobile number</label><input type="tel" inputMode="numeric" maxLength="10" value={form.mobile} onChange={(event) => setForm((current) => ({ ...current, mobile: event.target.value }))} required /></div>
      <button className="button" type="submit">Track order</button>
    </form>

    {result && <aside className={`summary-card tracking-result${paymentConfirmed ? "" : " payment-incomplete"}`}>
      <p className="eyebrow">{result.orderNumber}</p>
      <h2>{paymentConfirmed ? pretty(result.shipmentStatus) : paymentFailed ? "Payment failed" : "Payment pending"}</h2>
      {paymentConfirmed
        ? <p className="tracking-lead">Your payment is confirmed. Follow each delivery update below.</p>
        : <div className={`notice ${paymentFailed ? "danger" : "warning"}`}>
            <strong>{paymentFailed ? "This order was not confirmed." : "Payment has not been confirmed yet."}</strong>
            <p>{paymentFailed ? "No successful payment was recorded. Return to your cart to try again." : "If you completed payment, please wait a moment and check again. Otherwise, return to your cart to complete payment."}</p>
          </div>}

      <dl className="detail-meta">
        <div><dt>Payment</dt><dd>{pretty(result.paymentStatus)}</dd></div>
        {paymentConfirmed && <div><dt>Delivery</dt><dd>{result.deliveryLabel} · {result.deliveryTimeline}</dd></div>}
        {paymentConfirmed && result.courierName && <div><dt>Courier</dt><dd>{result.courierName}</dd></div>}
        {paymentConfirmed && result.trackingNumber && <div><dt>Tracking / AWB</dt><dd>{result.trackingNumber}</dd></div>}
        {paymentConfirmed && result.estimatedDeliveryDate && <div><dt>Expected by</dt><dd>{new Date(`${result.estimatedDeliveryDate}T00:00:00`).toLocaleDateString("en-IN", { dateStyle: "medium" })}</dd></div>}
        <div><dt>Total</dt><dd>₹{result.total.toLocaleString("en-IN")}</dd></div>
      </dl>

      {!paymentConfirmed && <Link className="button" to="/cart">Return to cart</Link>}
      {paymentConfirmed && result.courierTrackingUrl && <div className="courier-track-action"><a className="button" href={result.courierTrackingUrl} target="_blank" rel="noopener noreferrer">Track on Trackon website</a><small>Use AWB number {result.trackingNumber} on the Trackon page.</small></div>}

      {paymentConfirmed && <div className="customer-timeline"><h3>Delivery updates</h3>{result.statusHistory?.length
        ? [...result.statusHistory].reverse().map((entry, index) => <article className={index === 0 ? "current" : ""} key={`${entry.status}-${entry.updatedAt}`}><span aria-hidden="true" /><div><strong>{entry.label}</strong><small>{dateLabel(entry.updatedAt)}</small>{entry.message && <p>{entry.message}</p>}</div></article>)
        : <article className="current"><span aria-hidden="true" /><div><strong>Order received</strong><small>{dateLabel(result.createdAt)}</small><p>Your payment is confirmed and your order is awaiting fulfilment.</p></div></article>}
      </div>}
    </aside>}
  </div></div></section>;
}

export default TrackOrderPage;
