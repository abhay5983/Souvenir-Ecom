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
  return <section className="section compact"><div className="container"><div className="form-shell"><form className="form-card" onSubmit={submit}>
    <p className="eyebrow">Order tracking</p><h1>Track your order</h1><p>Enter the order number and mobile number used during checkout.</p>
    {error && <div className="notice danger">{error}</div>}
    <div className="form-field"><label>Order number</label><input value={form.orderNumber} onChange={(event) => setForm((current) => ({ ...current, orderNumber: event.target.value }))} required /></div>
    <div className="form-field"><label>Mobile number</label><input type="tel" value={form.mobile} onChange={(event) => setForm((current) => ({ ...current, mobile: event.target.value }))} required /></div>
    <button className="button" type="submit">Track order</button>
  </form>{result && <aside className="summary-card"><p className="eyebrow">{result.orderNumber}</p><h2>{result.orderStatus.replaceAll("_", " ")}</h2><dl className="detail-meta"><div><dt>Payment</dt><dd>{result.paymentStatus.replaceAll("_", " ")}</dd></div><div><dt>Shipment</dt><dd>{result.shipmentStatus.replaceAll("_", " ")}</dd></div><div><dt>Delivery</dt><dd>{result.deliveryLabel} · {result.deliveryTimeline}</dd></div><div><dt>Total</dt><dd>₹{result.total.toLocaleString("en-IN")}</dd></div></dl></aside>}</div></div></section>;
}

export default TrackOrderPage;
