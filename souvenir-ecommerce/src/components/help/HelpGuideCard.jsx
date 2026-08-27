import { Link } from "react-router-dom";

function HelpGuideCard({ guide, compact = false }) {
  if (!guide) {
    return null;
  }

  return (
    <article
      className={`card help-guide-card${
        compact ? " compact" : ""
      }`}
    >
      <p className="eyebrow">
        {guide.category}
      </p>

      <h3>
        <Link to={`/help/guides/${guide.slug}`}>
          {guide.title}
        </Link>
      </h3>

      <p>{guide.summary}</p>

      <div className="help-card-meta">
        <span>
          {guide.estimatedReadMinutes} min read
        </span>

        <span>
          Reviewed {guide.lastReviewedAt}
        </span>
      </div>

      <Link
        className="text-link"
        to={`/help/guides/${guide.slug}`}
      >
        Read guide{" "}
        <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}

export default HelpGuideCard;