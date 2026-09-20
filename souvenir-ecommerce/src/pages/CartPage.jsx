import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useState } from "react";

import { useCatalogue } from "../context/CatalogueContext.jsx";
import { useCart } from "../context/CartContext";
import { DELIVERY_OPTIONS, getDeliveryOption } from "../services/deliveryOptions.js";

function formatInr(value) {
  return `₹${Number(value).toLocaleString(
    "en-IN",
  )}`;
}

function getCartItemDetails(item, catalogue) {
  const series = catalogue.find((entry) => {
    return entry.id === item.seriesId;
  });

  if (!series) {
    return null;
  }

  const variant = item.variantId
    ? series.variants?.find((entry) => {
        return entry.id === item.variantId;
      })
    : undefined;

  return {
    series,
    title: variant?.title ?? series.title,

    subtitle: variant
      ? [series.title, variant.level]
          .filter(Boolean)
          .join(" · ")
      : `${series.imprint} · exact book confirmed by HQ`,

    price:
      typeof variant?.priceINR === "number"
        ? variant.priceINR
        : undefined,
    coverImageUrl: variant?.coverImageUrl,
  };
}

function CartPage() {
  const [showCheckoutNotice, setShowCheckoutNotice] = useState(false);
  const { catalogue, loading } = useCatalogue();
  const location = useLocation();
  const navigate = useNavigate();

  const {
  cart,
  cartCount,
  updateQuantity,
  removeFromCart,
  clearCart,
  deliveryOption,
  setDeliveryOption,
} = useCart();

const cartItems = cart ?? [];

  if (loading) return <section className="section compact"><div className="container"><div className="notice neutral">Loading your cart...</div></div></section>;

  const flash = location.state?.flash;

  const validItems = cartItems
    .map((item) => {
      return {
        item,
        details: getCartItemDetails(item, catalogue),
      };
    })
    .filter((entry) => {
      return Boolean(entry.details);
    });

  const pricedTotal = validItems.reduce(
    (total, entry) => {
      const price = entry.details?.price;

      if (typeof price !== "number") {
        return total;
      }

      return (
        total +
        price * entry.item.quantity
      );
    },
    0,
  );

  const pendingPrices = validItems.filter(
    (entry) => {
      return (
        typeof entry.details?.price !==
        "number"
      );
    },
  ).length;
  const selectedDelivery = getDeliveryOption(deliveryOption);
  const orderTotal = pricedTotal + selectedDelivery.charge;

  function handleClearCart() {
    clearCart();

    navigate("/cart", {
      replace: true,
      state: {
        flash: {
          tone: "success",
          message:
            "All books were removed from your cart.",
        },
      },
    });
  }

  if (validItems.length === 0) {
    return (
      <section className="section compact request-page">
        <div className="container">
          <nav
            className="breadcrumbs"
            aria-label="Breadcrumb"
          >
            <Link to="/books">Books</Link>

            <span aria-hidden="true">/</span>

            <span>Cart</span>
          </nav>

          {flash && (
            <div
              className={`notice ${flash.tone} flash`}
              role="status"
            >
              {flash.message}
            </div>
          )}

          <div className="empty-state">
            <h1>Your cart is empty</h1>

            <p>
              Open a series, choose book
              quantities and add the selection
              here.
            </p>

            <Link
              className="button"
              to="/books"
            >
              Browse the catalogue
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section compact request-page">
      <div className="container">
        <nav
          className="breadcrumbs"
          aria-label="Breadcrumb"
        >
          <Link to="/books">Books</Link>

          <span aria-hidden="true">/</span>

          <span>Cart</span>
        </nav>

        {flash && (
          <div
            className={`notice ${flash.tone} flash`}
            role="status"
          >
            {flash.message}
          </div>
        )}

        <div className="request-heading">
          <div>
            <p className="eyebrow">
              Souvenir shopping cart
            </p>

            <h1>Your selected books</h1>

            <p>
              Review editions and quantities
              before guest checkout.
            </p>
          </div>

          <span className="status neutral">
            {cartCount}{" "}
            {cartCount === 1
              ? "book"
              : "books"}
          </span>
        </div>

        <div className="notice neutral" role="note">
          <strong>Coming soon:</strong> Direct-to-customer ordering will start on 10 October 2026.
        </div>

        <div className="cart-layout">
          <section
            className="cart-panel card"
            aria-labelledby="cart-items-heading"
          >
            <div className="panel-head">
              <h2 id="cart-items-heading">
                Cart items
              </h2>

              <button
                className="button ghost small"
                type="button"
                onClick={handleClearCart}
              >
                Clear cart
              </button>
            </div>

            <div className="cart-line-list">
              {validItems.map(
                ({ item, details }) => (
                  <article
                    className="cart-line"
                    key={item.id}
                  >
                    {details.coverImageUrl ? (
                    <img className="variant-thumbnail variant-cover-image" src={details.coverImageUrl} alt={`${details.title} cover`} loading="lazy" />
                    ) : (
                      <div className={`variant-thumbnail ${details.series.coverTone}`} aria-hidden="true"><span>▣</span></div>
                    )}

                    <div className="cart-line-copy">
                      <h3>{details.title}</h3>

                      <p>
                        {details.subtitle}
                      </p>

                      <strong>
                        {typeof details.price ===
                        "number"
                          ? `${formatInr(
                              details.price,
                            )} MRP each`
                          : "Price confirmed by HQ"}
                      </strong>
                    </div>

                    <div
                      className="quantity-stepper cart-stepper"
                      aria-label={`Quantity for ${details.title}`}
                    >
                      <button
                        type="button"
                        aria-label={`Decrease ${details.title} quantity`}
                        onClick={() => {
                          updateQuantity(
                            item.id,
                            item.quantity - 1,
                          );
                        }}
                      >
                        −
                      </button>

                      <input
                        type="number"
                        min="1"
                        max="999"
                        value={item.quantity}
                        inputMode="numeric"
                        aria-label={`${details.title} quantity`}
                        onChange={(event) => {
                          const quantity =
                            Math.max(
                              1,
                              Math.min(
                                999,
                                Math.floor(
                                  Number(
                                    event.target
                                      .value,
                                  ) || 1,
                                ),
                              ),
                            );

                          updateQuantity(
                            item.id,
                            quantity,
                          );
                        }}
                      />

                      <button
                        type="button"
                        aria-label={`Increase ${details.title} quantity`}
                        onClick={() => {
                          updateQuantity(
                            item.id,
                            item.quantity + 1,
                          );
                        }}
                        disabled={
                          item.quantity >= 999
                        }
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="remove-line"
                      type="button"
                      onClick={() => {
                        removeFromCart(item.id);
                      }}
                    >
                      Remove
                    </button>
                  </article>
                ),
              )}
            </div>

            <Link
              className="text-link cart-continue"
              to="/books"
            >
              ← Continue browsing
            </Link>
          </section>

          <aside className="cart-summary card">
            <p className="eyebrow">
              Order summary
            </p>

            <h2>
              {cartCount}{" "}
              {cartCount === 1
                ? "book"
                : "books"}
            </h2>

            <dl>
              <div>
                <dt>
                  Catalogue MRP subtotal
                </dt>

                <dd>
                  {formatInr(pricedTotal)}
                </dd>
              </div>

              {pendingPrices > 0 && (
                <div>
                  <dt>Prices pending</dt>

                  <dd>
                    {pendingPrices}{" "}
                    {pendingPrices === 1
                      ? "line"
                      : "lines"}
                  </dd>
                </div>
              )}

              <div>
                <dt>Books subtotal</dt>
                <dd>{formatInr(pricedTotal)}</dd>
              </div>
              <div>
                <dt>{selectedDelivery.label}</dt>
                <dd>{formatInr(selectedDelivery.charge)}</dd>
              </div>
              <div className="cart-grand-total">
                <dt>Order total</dt>
                <dd>{formatInr(orderTotal)}</dd>
              </div>
            </dl>

            <fieldset className="delivery-options">
              <legend>Choose delivery speed</legend>
              {Object.values(DELIVERY_OPTIONS).map((option) => (
                <label className={`delivery-option${deliveryOption === option.code ? " selected" : ""}`} key={option.code}>
                  <input
                    type="radio"
                    name="deliveryOption"
                    value={option.code}
                    checked={deliveryOption === option.code}
                    onChange={() => setDeliveryOption(option.code)}
                  />
                  <span><strong>{option.label}</strong><small>{option.timeline}</small></span>
                  <b>{formatInr(option.charge)}</b>
                </label>
              ))}
            </fieldset>

            <p className="delivery-note">
              Delivery timelines are counted in working days and begin after payment confirmation and order processing.
            </p>

            <div className="notice warning">
              <strong>
                Secure guest checkout.
              </strong>{" "}
              No account or login is required.
              Enter your delivery details and
              complete payment at checkout.
            </div>

            <button
              className="button full-width"
              type="button"
              onClick={() => setShowCheckoutNotice(true)}
            >
              Proceed to checkout
            </button>

            <p className="field-help">
              Online payment through Shiprocket
              will be enabled in the next phase.
            </p>
          </aside>
        </div>

        <div className="mobile-cart-bar" aria-label="Cart checkout summary">
          <span><small>Total with delivery</small><strong>{formatInr(orderTotal)}</strong></span>
          <button className="button" type="button" onClick={() => setShowCheckoutNotice(true)}>Checkout</button>
        </div>
      </div>
      {showCheckoutNotice && <div className="resource-modal-backdrop checkout-notice-backdrop" role="presentation" onMouseDown={() => setShowCheckoutNotice(false)}>
        <section className="resource-modal checkout-notice-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-notice-title" onMouseDown={(event) => event.stopPropagation()}>
          <button className="resource-modal-close" type="button" aria-label="Close notice" onClick={() => setShowCheckoutNotice(false)}>×</button>
          <div className="checkout-notice-icon" aria-hidden="true">10</div>
          <p className="eyebrow">Ordering opens soon</p>
          <h2 id="checkout-notice-title">Direct-to-customer service starts on 10 October 2026</h2>
          <p>You can continue exploring our catalogue and keep books in your cart. Online checkout and home delivery will become available from 10 October.</p>
          <button className="button full-width" type="button" onClick={() => setShowCheckoutNotice(false)}>Continue browsing</button>
        </section>
      </div>}
    </section>
  );
}

export default CartPage;
