import { Link } from "react-router-dom";

function getCatalogueMrp(series) {
  const prices = series.variants
    .map((variant) => variant.priceINR)
    .filter((price) => {
      return typeof price === "number";
    });

  if (prices.length === 0) {
    return null;
  }

  const minimumPrice = Math.min(...prices);

  return `₹${minimumPrice.toLocaleString("en-IN")}`;
}

function SeriesCard({
  series,
  authenticated = false,
}) {
  const mrp = getCatalogueMrp(series);

  const detailPath = authenticated
    ? `/app/catalog/${series.slug}`
    : `/books/${series.slug}`;

  const cardChips =
    series.digitalFeatures.length > 0
      ? series.digitalFeatures.slice(0, 2)
      : [
          `Source p. ${series.sourcePage ?? "—"}`,
          `${series.variants.length} verified ${
            series.variants.length === 1
              ? "variant"
              : "variants"
          }`,
        ];

  return (
    <article className="series-card">
      <Link
        className="cover-stage product-card-link"
        to={detailPath}
        aria-label={`Open ${series.title}`}
      >
        {series.coverImageUrl ? <img className="book-cover" src={series.coverImageUrl} alt="" loading="lazy" /> : <div
          className={`book-cover ${series.coverTone}`}
          aria-hidden="true"
        >
          <span>{series.title}</span>
        </div>}
      </Link>

      <div className="series-body">
        <p className="meta">
          {series.imprint} · {series.subject}
        </p>

        <h3>
          <Link
            className="product-title-link"
            to={detailPath}
          >
            {series.title}
          </Link>
        </h3>

        <p className="grade-range">
          {series.gradeRange}
        </p>

        <div className="chips">
          {cardChips.map((chip) => (
            <span className="chip" key={chip}>
              {chip}
            </span>
          ))}
        </div>

        <p className="card-price">
          <strong>
            {mrp
              ? `Catalogue MRP from ${mrp}`
              : "Price confirmed by HQ"}
          </strong>
        </p>

        <Link
          className="button small series-add-button"
          to={detailPath}
        >
          Add to cart
        </Link>
      </div>
    </article>
  );
}

export default SeriesCard;
