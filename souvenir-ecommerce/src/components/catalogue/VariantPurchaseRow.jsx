import QuantityStepper from "./QuantityStepper";

function formatInr(value) {
  return `₹${Number(value).toLocaleString(
    "en-IN",
  )}`;
}

function VariantPurchaseRow({
  series,
  variant,
  index,
  quantity,
  onQuantityChange,
}) {
  const price =
    typeof variant.priceINR === "number"
      ? `${formatInr(variant.priceINR)} MRP`
      : "Price confirmed by HQ";

  const details = [
    variant.level,
    variant.isbn
      ? `ISBN ${variant.isbn}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="variant-purchase-row">
      <div
        className={`variant-thumbnail ${series.coverTone}`}
        aria-hidden="true"
      >
        <span>{index + 1}</span>
      </div>

      <div className="variant-copy">
        <h3>{variant.title}</h3>

        <p>
          {details || series.title}
        </p>

        <strong>{price}</strong>
      </div>

      <QuantityStepper
        value={quantity}
        label={variant.title}
        minimum={0}
        maximum={999}
        onChange={onQuantityChange}
      />
    </article>
  );
}

export default VariantPurchaseRow;