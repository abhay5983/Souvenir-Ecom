import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useCatalogue } from "../context/CatalogueContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { ecommerceService } from "../services/ecommerceService.js";
import { getDeliveryOption } from "../services/deliveryOptions.js";

const CHECKOUT_STORAGE_KEY = "souvenir-guest-checkout";
const IDEMPOTENCY_STORAGE_KEY = "souvenir-checkout-attempt";
const EMPTY_FORM = {
  customerName: "", mobile: "", email: "", line1: "", line2: "", landmark: "",
  city: "", state: "", postalCode: "", country: "India",
};
const REQUIRED_FIELDS = ["customerName", "mobile", "email", "line1", "city", "state", "postalCode"];

function checkoutAttemptKey(fingerprint) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(IDEMPOTENCY_STORAGE_KEY) ?? "null");
    if (saved?.fingerprint === fingerprint && saved?.key) return saved.key;
  } catch { /* Old checkout keys are replaced below. */ }
  const key = crypto.randomUUID();
  sessionStorage.setItem(IDEMPOTENCY_STORAGE_KEY, JSON.stringify({ key, fingerprint }));
  return key;
}

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

function openRazorpayCheckout(payment, customer, onPaymentAuthorized) {
  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error("Secure payment could not be loaded. Check your connection and try again."));
      return;
    }

    let settled = false;
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      callback(value);
    };
    let paymentAuthorized = false;
    const checkout = new window.Razorpay({
      key: payment.keyId,
      amount: payment.amount,
      currency: payment.currency,
      name: "Souvenir Publishers",
      description: "Book order payment",
      order_id: payment.orderId,
      prefill: {
        name: customer.customerName.trim(),
        email: customer.email.trim(),
        contact: customer.mobile,
      },
      theme: { color: "#1f6b4f" },
      handler: async (result) => {
        paymentAuthorized = true;
        onPaymentAuthorized?.();
        try {
          const verified = await ecommerceService.verifyPayment(result);
          finish(resolve, verified);
        } catch (verificationError) {
          finish(reject, verificationError);
        }
      },
      modal: {
        ondismiss: () => {
          if (!paymentAuthorized) {
            finish(reject, new Error("Payment was cancelled. Your cart and details have been saved."));
          }
        },
      },
    });
    checkout.on("payment.failed", (response) => {
      const message = response?.error?.description || "Payment failed. Please try again or use another payment method.";
      finish(reject, new Error(message));
    });
    checkout.open();
  });
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
  const { cart, clearCart, deliveryOption } = useCart();
  const [form, setForm] = useState(loadCheckoutForm);
  const [touched, setTouched] = useState({});
  const [order, setOrder] = useState(null);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const items = useMemo(
    () => (cart ?? []).map((item) => ({ item, details: detailsFor(item, catalogue) })).filter((entry) => entry.details),
    [cart, catalogue],
  );
  const subtotal = items.reduce((sum, entry) => sum + entry.details.price * entry.item.quantity, 0);
  const selectedDelivery = getDeliveryOption(deliveryOption);
  const estimatedShipping = selectedDelivery.charge;
  const total = subtotal + estimatedShipping;
  const checkoutFingerprint = JSON.stringify({
    deliveryOption,
    total,
    lines: items.map(({ item, details }) => ({
      productId: item.variantId,
      quantity: item.quantity,
      price: details.price,
    })).sort((left, right) => String(left.productId).localeCompare(String(right.productId))),
  });

  useEffect(() => {
    try { sessionStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(form)); }
    catch { /* The form remains available in component memory. */ }
  }, [form]);

  useEffect(() => {
    if (!processingPayment) return undefined;
    const warnBeforeLeaving = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [processingPayment]);

  if (catalogueLoading) return <section className="section compact"><div className="container"><div className="notice neutral">Loading checkout...</div></div></section>;
  if (!items.length && !order) return <Navigate to="/cart" replace />;

  function update(event) {
    const { name, value } = event.target;
    const normalized = ["mobile", "postalCode"].includes(name) ? value.replace(/\D/g, "") : value;
    setForm((current) => ({ ...current, [name]: normalized }));
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
      let payableOrder = pendingOrder;
      if (payableOrder) {
        const payment = await ecommerceService.retryPayment(
          payableOrder.orderNumber,
          payableOrder.checkoutMobile,
        );
        payableOrder = { ...payableOrder, payment };
      } else {
        const idempotencyKey = checkoutAttemptKey(checkoutFingerprint);
        const created = await ecommerceService.createOrder({
          idempotency_key: idempotencyKey,
          customer_name: form.customerName.trim(),
          mobile: form.mobile,
          email: form.email.trim(),
          address: {
            line1: form.line1.trim(), line2: form.line2.trim(), landmark: form.landmark.trim(),
            city: form.city.trim(), state: form.state.trim(), postal_code: form.postalCode, country: form.country,
          },
          delivery_type: deliveryOption,
          lines: items.map(({ item }) => ({ product_id: item.variantId, quantity: item.quantity })),
        });
        payableOrder = { ...created, checkoutMobile: form.mobile };
      }
      setPendingOrder(payableOrder);
      if (!payableOrder.payment?.configured) {
        throw new Error("Online payment is temporarily unavailable. Please try again later.");
      }
      const backendTotal = Number(payableOrder.total);
      const paymentTotal = Number(payableOrder.payment.amount) / 100;
      if (backendTotal !== total || paymentTotal !== backendTotal) {
        sessionStorage.removeItem(IDEMPOTENCY_STORAGE_KEY);
        setPendingOrder(null);
        throw new Error("The book price changed before payment. Refresh the cart and review the updated total before paying.");
      }
      const verified = await openRazorpayCheckout(
        payableOrder.payment,
        form,
        () => setProcessingPayment(true),
      );
      setOrder(verified);
      setPendingOrder(null);
      clearCart();
      sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
      sessionStorage.removeItem(IDEMPOTENCY_STORAGE_KEY);
    } catch (requestError) {
      if (requestError.code === "STALE_CHECKOUT") {
        sessionStorage.removeItem(IDEMPOTENCY_STORAGE_KEY);
        setPendingOrder(null);
      }
      setError(requestError.message);
    } finally {
      setProcessingPayment(false);
      setSubmitting(false);
    }
  }

  if (order) {
    return (
      <section className="section compact checkout-page"><div className="container"><div className="card checkout-card checkout-complete">
        <p className="eyebrow">Payment successful</p><h1>Thank you for your order</h1>
        <p>Your order number is <strong>{order.orderNumber}</strong>.</p>
        <div className="notice neutral">Your payment has been verified and your order has been received. Keep your order number for future reference.</div>
        <dl className="success-summary"><div><dt>Order total</dt><dd>{money(order.total)}</dd></div><div><dt>Delivery</dt><dd>{order.deliveryLabel} · {order.deliveryTimeline}</dd></div><div><dt>Status</dt><dd>{order.orderStatus.replaceAll("_", " ")}</dd></div></dl>
        <div className="actions-row"><Link className="button" to="/books">Continue shopping</Link></div>
      </div></div></section>
    );
  }

  return (
    <section className="section compact checkout-page"><div className="container">
      {processingPayment && (
        <div className="payment-processing-backdrop" role="presentation">
          <section
            className="payment-processing-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-processing-title"
            aria-describedby="payment-processing-description"
          >
            <span className="payment-processing-spinner" aria-hidden="true" />
            <p className="eyebrow">Payment received</p>
            <h2 id="payment-processing-title">Processing your order…</h2>
            <p id="payment-processing-description">Please keep this page open while we securely verify your payment and confirm your order.</p>
            <small>Do not refresh the page or press the payment button again.</small>
          </section>
        </div>
      )}
      <nav className="breadcrumbs"><Link to="/cart">Cart</Link><span>/</span><span>Guest checkout</span></nav>
      <ol className="checkout-progress" aria-label="Checkout progress">
        <li className="complete"><span>✓</span>Review cart</li>
        <li className="current" aria-current="step"><span>2</span>Delivery details</li>
        <li><span>3</span>Secure payment</li>
      </ol>
      <div className="checkout-layout">
        <form className="checkout-card card" onSubmit={submit} noValidate>
          <p className="eyebrow">Guest checkout</p><h1>Delivery details</h1><p>No account or login is required.</p>
          {error && <div className="notice danger" role="alert">{error}</div>}
          {pendingOrder && <div className="notice neutral" role="status">
            Order <strong>{pendingOrder.orderNumber}</strong> is saved. Retry payment below; a fresh secure payment attempt will be created automatically.
          </div>}
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
          <div className="checkout-submit-bar">
            <span><small>Total</small><strong>{money(total)}</strong></span>
            <button className="button" type="submit" disabled={submitting}>{submitting ? "Opening secure payment..." : pendingOrder ? "Retry secure payment" : "Pay securely"}</button>
          </div>
        </form>
        <aside className="checkout-summary card"><p className="eyebrow">Order summary</p><h2>{items.reduce((sum, entry) => sum + entry.item.quantity, 0)} books</h2>
          <ul>{items.map(({ item, details }) => <li key={item.id}><span>{details.title} × {item.quantity}</span><strong>{money(details.price * item.quantity)}</strong></li>)}</ul>
          <dl className="detail-meta"><div><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div><div><dt>{selectedDelivery.label}</dt><dd>{money(estimatedShipping)}</dd></div><div><dt>Estimated time</dt><dd>{selectedDelivery.timeline}</dd></div><div><dt>Total</dt><dd><strong>{money(total)}</strong></dd></div></dl>
        </aside>
      </div>
    </div></section>
  );
}

export default CheckoutPage;
