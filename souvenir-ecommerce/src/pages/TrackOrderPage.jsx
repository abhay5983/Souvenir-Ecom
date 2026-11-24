import { useState } from "react";
import { ecommerceService } from "../services/ecommerceService.js";

function TrackOrderPage() {
  const [form, setForm] = useState({ orderNumber: "", mobile: "" });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    try { setResult(await ecommerceService.trackOrder({ order_number: form.orderNumber, mobile: form.mobile })); setError(""); }
    catch (requestError) { setResult(null); setError(requestError.message); }
  }
  const pretty = (value) => value?.replaceAll("_", " ") ?? "";
  const dateLabel = (value) => new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  return <section className="section compact"><div className="container"><div className="form-shell"><form className="form-card" onSubmit={submit}>
    <p className="eyebrow">Order tracking</p><h1>Track your order</h1><p>Enter the order number and mobile number used during checkout.</p>
    {error && <div className="notice danger">{error}</div>}
    <div className="form-field"><label>Order number</label><input value={form.orderNumber} onChange={(event) => setForm((current) => ({ ...current, orderNumber: event.target.value }))} required /></div>
    <div className="form-field"><label>Mobile number</label><input type="tel" inputMode="numeric" maxLength="10" value={form.mobile} onChange={(event) => setForm((current) => ({ ...current, mobile: event.target.value }))} required /></div>
    <button className="button" type="submit">Track order</button>
  </form>{result && <aside className="summary-card tracking-result"><p className="eyebrow">{result.orderNumber}</p><h2>{pretty(result.shipmentStatus)}</h2><p className="tracking-lead">Your payment is confirmed. Follow each delivery update below.</p><dl className="detail-meta"><div><dt>Payment</dt><dd>{pretty(result.paymentStatus)}</dd></div><div><dt>Delivery</dt><dd>{result.deliveryLabel} · {result.deliveryTimeline}</dd></div>{result.courierName && <div><dt>Courier</dt><dd>{result.courierName}</dd></div>}{result.trackingNumber && <div><dt>Tracking / AWB</dt><dd>{result.trackingNumber}</dd></div>}{result.estimatedDeliveryDate && <div><dt>Expected by</dt><dd>{new Date(`${result.estimatedDeliveryDate}T00:00:00`).toLocaleDateString("en-IN", { dateStyle: "medium" })}</dd></div>}<div><dt>Total</dt><dd>₹{result.total.toLocaleString("en-IN")}</dd></div></dl>{result.courierTrackingUrl && <div className="courier-track-action"><a className="button" href={result.courierTrackingUrl} target="_blank" rel="noopener noreferrer">Track on Trackon website</a><small>Use AWB number {result.trackingNumber} on the Trackon page.</small></div>}<div className="customer-timeline"><h3>Delivery updates</h3>{result.statusHistory?.length ? [...result.statusHistory].reverse().map((entry, index) => <article className={index === 0 ? "current" : ""} key={`${entry.status}-${entry.updatedAt}`}><span aria-hidden="true" /><div><strong>{entry.label}</strong><small>{dateLabel(entry.updatedAt)}</small>{entry.message && <p>{entry.message}</p>}</div></article>) : <article className="current"><span aria-hidden="true" /><div><strong>{pretty(result.shipmentStatus)}</strong><small>{dateLabel(result.createdAt)}</small><p>Your order has been received and is being prepared.</p></div></article>}</div></aside>}</div></div></section>;
}

export default TrackOrderPage;
