import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useCatalogue } from "../context/CatalogueContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { ecommerceService } from "../services/ecommerceService.js";

const CHECKOUT_STORAGE_KEY = "souvenir-guest-checkout";
const IDEMPOTENCY_STORAGE_KEY = "souvenir-checkout-attempt";
const EMPTY_FORM = {
  customerName: "", mobile: "", email: "", line1: "", line2: "", landmark: "",
  city: "", state: "", postalCode: "", country: "India",
};
const REQUIRED_FIELDS = ["customerName", "mobile", "email", "line1", "city", "state", "postalCode"];

function loadCheckoutForm() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(CHECKOUT_STORAGE_KEY) ?? "null");
    return saved && typeof saved === "object" ? { ...EMPTY_FORM, ...saved } : EMPTY_FORM;
  } catch {
    return EMPTY_FORM;
  }
}

function detailsFor(item, catalogue) {
  const series = catalogue.find((entry) => entry.id === item.seriesId);
  const variant = series?.variants?.find((entry) => entry.id === item.variantId);
  return variant ? { title: variant.title, price: variant.priceINR } : null;
}

function money(value) {
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function validateField(name, value) {
  const clean = String(value ?? "").trim();
  if (REQUIRED_FIELDS.includes(name) && !clean) return "This field is required.";
  if (name === "customerName" && clean.length < 2) return "Enter your full name.";
  if (name === "mobile" && !/^\d{10}$/.test(clean)) return "Mobile number must have 10 digits.";
  if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return "Email format is invalid.";
  if (name === "postalCode" && !/^\d{6}$/.test(clean)) return "PIN code must have 6 digits.";
  if (name === "line1" && clean.length < 5) return "Enter a complete delivery address.";
  return "";
}

function CheckoutField({ name, label, value, error, onChange, onBlur, type = "text", optional = false, inputMode, autoComplete, full = false, maxLength }) {
  return (
    <div className={`form-field${full ? " full" : ""}${error ? " invalid" : ""}`}>
      <label htmlFor={name}>{label} {optional && <span className="field-help">Optional</span>}</label>
      <input
        id={name}
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        maxLength={maxLength}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {error && <small className="field-error" id={`${name}-error`} role="alert">{error}</small>}
    </div>
  );
}

function CheckoutPage() {
  const { catalogue, loading: catalogueLoading } = useCatalogue();
  const { cart, clearCart } = useCart();
  const [form, setForm] = useState(loadCheckoutForm);
  const [touched, setTouched] = useState({});
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [shippingQuote, setShippingQuote] = useState(null);
  const [checkingDelivery, setCheckingDelivery] = useState(false);

  const items = useMemo(
    () => (cart ?? []).map((item) => ({ item, details: detailsFor(item, catalogue) })).filter((entry) => entry.details),
    [cart, catalogue],
  );
  const subtotal = items.reduce((sum, entry) => sum + entry.details.price * entry.item.quantity, 0);
  const estimatedShipping = shippingQuote?.shippingCharge ?? (subtotal >= 1000 ? 0 : 75);
  const total = subtotal + estimatedShipping;

  useEffect(() => {
    try { sessionStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(form)); }
    catch { /* The form remains available in component memory. */ }
  }, [form]);

  useEffect(() => {
    if (!/^\d{6}$/.test(form.postalCode) || !items.length) return undefined;
    const timer = window.setTimeout(async () => {
      setCheckingDelivery(true);
      try {
        setShippingQuote(await ecommerceService.shippingQuote({
          postal_code: form.postalCode,
          lines: items.map(({ item }) => ({ product_id: item.variantId, quantity: item.quantity })),
        }));
      } catch (requestError) {
        setShippingQuote({ serviceable: false, message: requestError.message });
      } finally {
        setCheckingDelivery(false);
      }
    }, 400);
    return () => window.clearTimeout(timer);
  }, [form.postalCode, items]);

  if (catalogueLoading) return <section className="section compact"><div className="container"><div className="notice neutral">Loading checkout...</div></div></section>;
  if (!items.length && !order) return <Navigate to="/cart" replace />;

  function update(event) {
    const { name, value } = event.target;
    const normalized = ["mobile", "postalCode"].includes(name) ? value.replace(/\D/g, "") : value;
    setForm((current) => ({ ...current, [name]: normalized }));
    if (name === "postalCode") setShippingQuote(null);
    setError("");
  }

  function blur(event) {
    setTouched((current) => ({ ...current, [event.target.name]: true }));
  }

  function fieldError(name) {
    return touched[name] ? validateField(name, form[name]) : "";
  }

  async function submit(event) {
    event.preventDefault();
    const allTouched = Object.fromEntries(REQUIRED_FIELDS.map((name) => [name, true]));
    setTouched(allTouched);
    const firstInvalid = REQUIRED_FIELDS.find((name) => validateField(name, form[name]));
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      setError("Check the highlighted details before continuing.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      let idempotencyKey = sessionStorage.getItem(IDEMPOTENCY_STORAGE_KEY);
      if (!idempotencyKey) {
        idempotencyKey = crypto.randomUUID();
        sessionStorage.setItem(IDEMPOTENCY_STORAGE_KEY, idempotencyKey);
      }
      const created = await ecommerceService.createOrder({
        idempotency_key: idempotencyKey,
        customer_name: form.customerName.trim(),
        mobile: form.mobile,
        email: form.email.trim(),
        address: {
          line1: form.line1.trim(), line2: form.line2.trim(), landmark: form.landmark.trim(),
          city: form.city.trim(), state: form.state.trim(), postal_code: form.postalCode, country: form.country,
        },
        lines: items.map(({ item }) => ({ product_id: item.variantId, quantity: item.quantity })),
      });
      if (created.payment?.configured && created.payment?.checkoutUrl) {
        window.location.assign(created.payment.checkoutUrl);
        return;
      }
      if (created.payment?.configured && created.payment?.error) throw new Error(created.payment.error);
      setOrder(created);
      clearCart();
      sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
      sessionStorage.removeItem(IDEMPOTENCY_STORAGE_KEY);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (order) {
    return (
      <section className="section compact checkout-page"><div className="container"><div className="card checkout-card checkout-complete">
        <p className="eyebrow">Order received</p><h1>Thank you for your order</h1>
        <p>Your order number is <strong>{order.orderNumber}</strong>.</p>
        <div className="notice neutral">Payment is pending. You can use your order number and mobile number to check its status.</div>
        <dl className="success-summary"><div><dt>Order total</dt><dd>{money(order.total)}</dd></div><div><dt>Status</dt><dd>{order.orderStatus.replaceAll("_", " ")}</dd></div></dl>
        <div className="actions-row"><Link className="button" to="/track-order">Track order</Link><Link className="button secondary" to="/books">Continue shopping</Link></div>
      </div></div></section>
    );
  }

  return (
    <section className="section compact checkout-page"><div className="container">
      <nav className="breadcrumbs"><Link to="/cart">Cart</Link><span>/</span><span>Guest checkout</span></nav>
      <div className="checkout-layout">
        <form className="checkout-card card" onSubmit={submit} noValidate>
          <p className="eyebrow">Guest checkout</p><h1>Delivery details</h1><p>No account or login is required.</p>
          {error && <div className="notice danger" role="alert">{error}</div>}
          <div className="form-grid">
            <CheckoutField name="customerName" label="Full name" value={form.customerName} error={fieldError("customerName")} onChange={update} onBlur={blur} autoComplete="name" />
            <CheckoutField name="mobile" label="Mobile number" value={form.mobile} error={fieldError("mobile")} onChange={update} onBlur={blur} type="tel" inputMode="numeric" autoComplete="tel" maxLength={10} />
            <CheckoutField name="email" label="Email address" value={form.email} error={fieldError("email")} onChange={update} onBlur={blur} type="email" inputMode="email" autoComplete="email" full />
            <CheckoutField name="line1" label="Address line 1" value={form.line1} error={fieldError("line1")} onChange={update} onBlur={blur} autoComplete="address-line1" full />
            <CheckoutField name="line2" label="Address line 2" value={form.line2} error="" onChange={update} onBlur={blur} autoComplete="address-line2" optional full />
            <CheckoutField name="landmark" label="Landmark" value={form.landmark} error="" onChange={update} onBlur={blur} optional full />
            <CheckoutField name="city" label="City" value={form.city} error={fieldError("city")} onChange={update} onBlur={blur} autoComplete="address-level2" />
            <CheckoutField name="state" label="State" value={form.state} error={fieldError("state")} onChange={update} onBlur={blur} autoComplete="address-level1" />
            <CheckoutField name="postalCode" label="PIN code" value={form.postalCode} error={fieldError("postalCode")} onChange={update} onBlur={blur} inputMode="numeric" autoComplete="postal-code" maxLength={6} />
            <div className="form-field"><label htmlFor="country">Country</label><input id="country" name="country" value={form.country} readOnly /></div>
          </div>
          {checkingDelivery && <div className="notice neutral">Checking delivery availability...</div>}
          {shippingQuote && <div className={`notice ${shippingQuote.serviceable ? "neutral" : "danger"}`}>
            {shippingQuote.serviceable
              ? `Delivery available${shippingQuote.courierName ? ` via ${shippingQuote.courierName}` : ""}${shippingQuote.etd ? `. Expected ${shippingQuote.etd}` : ""}.`
              : shippingQuote.message}
          </div>}
          <div className="checkout-submit-bar">
            <span><small>Total</small><strong>{money(total)}</strong></span>
            <button className="button" type="submit" disabled={submitting || shippingQuote?.serviceable === false}>{submitting ? "Preparing payment..." : "Continue to payment"}</button>
          </div>
        </form>
        <aside className="checkout-summary card"><p className="eyebrow">Order summary</p><h2>{items.reduce((sum, entry) => sum + entry.item.quantity, 0)} books</h2>
          <ul>{items.map(({ item, details }) => <li key={item.id}><span>{details.title} × {item.quantity}</span><strong>{money(details.price * item.quantity)}</strong></li>)}</ul>
          <dl className="detail-meta"><div><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div><div><dt>Delivery</dt><dd>{estimatedShipping ? money(estimatedShipping) : "Free"}</dd></div><div><dt>Total</dt><dd><strong>{money(total)}</strong></dd></div></dl>
        </aside>
      </div>
    </div></section>
  );
}

export default CheckoutPage;
