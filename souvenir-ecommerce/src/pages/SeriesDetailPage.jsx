import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Link,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";

import BookCover from "../components/catalogue/BookCover";
import VariantPurchaseRow from "../components/catalogue/VariantPurchaseRow";

import { useCart } from "../context/CartContext";

import { useCatalogue } from "../context/CatalogueContext.jsx";

import {
  cartItemId,
  createCartItem,
} from "../services/cartService";

function getSeriesVariants(series) {
  if (series.variants?.length) {
    return series.variants;
  }

  return [
    {
      id: "",
      title: series.title,
      level:
        series.gradeRange ||
        "Class range not printed",
      availability: "AVAILABLE",
      sourcePage:
        series.sourcePage ?? 0,
      verificationStatus:
        series.verificationStatus,
    },
  ];
}

function createInitialQuantities(variants) {
  return variants.reduce(
    (quantities, variant) => {
      quantities[
        variant.id || "series"
      ] = 0;

      return quantities;
    },
    {},
  );
}

function SeriesDetailPage({
  authenticated = false,
}) {
  const { catalogue, loading } = useCatalogue();
  const { seriesSlug } = useParams();
  const navigate = useNavigate();

  const {
    cartCount,
    addItems,
  } = useCart();

  const flashRef = useRef(null);

  const series = useMemo(() => {
    return catalogue.find((item) => {
      return (
        item.publicVisibility &&
        item.slug === seriesSlug
      );
    });
  }, [catalogue, seriesSlug]);

  const variants = useMemo(() => {
    return series
      ? getSeriesVariants(series)
      : [];
  }, [series]);

  const [quantities, setQuantities] =
    useState(() => {
      return createInitialQuantities(
        variants,
      );
    });

  const [flash, setFlash] =
    useState(null);

  useEffect(() => {
    setQuantities(
      createInitialQuantities(variants),
    );

    setFlash(null);
  }, [variants]);

  useEffect(() => {
    if (!flash) {
      return;
    }

    flashRef.current?.focus();
  }, [flash]);

  if (loading) return <section className="section compact"><div className="container"><div className="notice neutral">Loading catalogue...</div></div></section>;

  if (!series) {
    return (
      <Navigate
        to="/not-found"
        replace
      />
    );
  }

  const variantCount =
    series.variants?.length ?? 0;

  const totalSelected = Object.values(
    quantities,
  ).reduce((total, quantity) => {
    return total + quantity;
  }, 0);

  const selectionSummary =
    totalSelected > 0
      ? `${totalSelected} ${
          totalSelected === 1
            ? "book"
            : "books"
        } selected`
      : "Choose at least one quantity";

  const detailBasePath = authenticated
    ? "/app/catalog"
    : "/books";

  function updateVariantQuantity(
    variantId,
    quantity,
  ) {
    const quantityKey =
      variantId || "series";

    setQuantities((current) => ({
      ...current,
      [quantityKey]: quantity,
    }));

    if (flash) {
      setFlash(null);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    const additions = variants
      .map((variant) => {
        return createCartItem({
          seriesId: series.id,
          variantId:
            variant.id || undefined,
          quantity:
            quantities[
              variant.id || "series"
            ] ?? 0,
        });
      })
      .filter(Boolean);

    if (additions.length === 0) {
      setFlash({
        tone: "danger",
        message:
          "Choose at least one book quantity before adding this series to the cart.",
      });

      return;
    }

    addItems(additions);

    navigate("/cart", {
      state: {
        flash: {
          tone: "success",
          message: `${
            additions.length
          } ${
            additions.length === 1
              ? "book line was"
              : "book lines were"
          } added to your cart.`,
        },
      },
    });
  }

  return (
    <section className="section compact product-page">
      <div className="container">
        <nav
          className="breadcrumbs"
          aria-label="Breadcrumb"
        >
          <Link to={detailBasePath}>
            Books
          </Link>

          <span aria-hidden="true">
            /
          </span>

          <span>{series.title}</span>
        </nav>

        {flash && (
          <div
            ref={flashRef}
            className={`notice ${flash.tone} flash`}
            role={
              flash.tone === "danger"
                ? "alert"
                : "status"
            }
            tabIndex={-1}
          >
            {flash.message}
          </div>
        )}

        <div className="detail-layout product-detail-layout">
          <aside className="product-media-panel">
            <div className="detail-cover">
              <BookCover series={series} />
            </div>

            <div className="product-assurance">
              <strong>
                Souvenir partner request
              </strong>

              <span>
                Catalogue MRP is shown where
                verified.
              </span>

              <span>
                Final rates and availability
                require HQ approval.
              </span>
            </div>
          </aside>

          <div className="product-info">
            <p className="eyebrow">
              {series.imprint} ·{" "}
              {series.subject}
            </p>

            <h1>{series.title}</h1>

            <p className="lede">
              {series.description}
            </p>

            <div className="chips">
              {(
                series.digitalFeatures?.length
                  ? series.digitalFeatures
                  : [
                      `Source page ${
                        series.sourcePage ??
                        "pending"
                      }`,
                      `${variantCount} verified variants`,
                    ]
              ).map((item) => (
                <span
                  className="chip"
                  key={item}
                >
                  {item}
                </span>
              ))}
            </div>

            <form
              className="product-purchase-panel"
              id="series-cart-form"
              onSubmit={handleSubmit}
            >
              <input
                type="hidden"
                name="seriesId"
                value={series.id}
              />

              <div className="purchase-panel-head">
                <div>
                  <p className="eyebrow">
                    Build your request
                  </p>

                  <h2 id="select-editions">
                    Choose books and quantities
                  </h2>

                  <p>
                    {variantCount
                      ? `${variantCount} source-verified ${
                          variantCount === 1
                            ? "book"
                            : "books"
                        } in this series.`
                      : "Per-book rows were not printed in the source catalogue; HQ will confirm the exact title and price."}
                  </p>
                </div>

                <Link
                  className="cart-mini-link"
                  to="/cart"
                >
                  View cart ({cartCount})
                </Link>
              </div>

              <div className="variant-purchase-list">
                {variants.map(
                  (variant, index) => {
                    const quantityKey =
                      variant.id ||
                      "series";

                    return (
                      <VariantPurchaseRow
                        key={
                          variant.id ||
                          `${series.id}-series`
                        }
                        series={series}
                        variant={variant}
                        index={index}
                        quantity={
                          quantities[
                            quantityKey
                          ] ?? 0
                        }
                        onQuantityChange={(
                          quantity,
                        ) => {
                          updateVariantQuantity(
                            variant.id,
                            quantity,
                          );
                        }}
                      />
                    );
                  },
                )}
              </div>

              <div className="purchase-panel-footer">
                <span
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {selectionSummary}
                </span>

                <button
                  className="button"
                  type="submit"
                  disabled={
                    totalSelected === 0
                  }
                >
                  Add selected to cart
                </button>
              </div>
            </form>

            <details className="product-specs card">
              <summary>
                Series details
              </summary>

              <dl className="detail-meta">
                <div>
                  <dt>Learning stage</dt>
                  <dd>
                    {series.stage ||
                      "Pending"}
                  </dd>
                </div>

                <div>
                  <dt>Class range</dt>
                  <dd>
                    {series.gradeRange ||
                      "Pending"}
                  </dd>
                </div>

                <div>
                  <dt>Language</dt>
                  <dd>
                    {series.language ||
                      "Pending"}
                  </dd>
                </div>

                <div>
                  <dt>Curriculum</dt>
                  <dd>
                    {Array.isArray(
                      series.curriculum,
                    )
                      ? series.curriculum.join(
                          ", ",
                        )
                      : series.curriculum ||
                        "Pending"}
                  </dd>
                </div>

                <div>
                  <dt>Source page</dt>
                  <dd>
                    {series.sourcePage ??
                      "Pending"}
                  </dd>
                </div>

                <div>
                  <dt>Verification</dt>
                  <dd>
                    <span
                      className={`status ${
                        series.verificationStatus ===
                        "SOURCE_VERIFIED"
                          ? "success"
                          : "warning"
                      }`}
                    >
                      {series.verificationStatus ===
                      "SOURCE_VERIFIED"
                        ? "Source verified"
                        : "Draft review"}
                    </span>
                  </dd>
                </div>
              </dl>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SeriesDetailPage;
