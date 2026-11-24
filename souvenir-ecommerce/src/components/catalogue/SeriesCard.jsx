import { Link } from "react-router-dom";
import CatalogueIcon from "../common/CatalogueIcon";

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

  const cardChips = (series.digitalFeatures ?? []).slice(0, 2);
  const remainingFeatureCount = Math.max(
    (series.digitalFeatures ?? []).length - cardChips.length,
    0,
  );

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

        {cardChips.length > 0 && (
          <div className="chips">
            {cardChips.map((chip) => (
              <span className="chip" key={chip}>
                {chip}
              </span>
            ))}
            {remainingFeatureCount > 0 && (
              <span
                className="chip chip-more"
                title={`${remainingFeatureCount} more digital ${remainingFeatureCount === 1 ? "feature" : "features"}`}
                aria-label={`${remainingFeatureCount} more digital ${remainingFeatureCount === 1 ? "feature" : "features"}`}
              >
                +{remainingFeatureCount} more
              </span>
            )}
          </div>
        )}

        <p className="card-price">
          <CatalogueIcon name="price" />
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
          <CatalogueIcon name="cart" /> Add to cart
        </Link>
      </div>
    </article>
  );
}

export default SeriesCard;
