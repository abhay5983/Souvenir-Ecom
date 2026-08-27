import {
  Link,
  useParams,
} from "react-router-dom";

import {
  guideBySlug,
  outreachFormBySlug,
} from "../services/help-centre.js";

function HelpGuidePage() {
  const { guideSlug } =
    useParams();

  const guide =
    guideBySlug(guideSlug);

  if (!guide) {
    return (
      <section className="section">
        <div className="container">
          <div className="empty-state">
            <h1>Guide not found</h1>

            <Link
              className="button"
              to="/help"
            >
              Back to Help Centre
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const relatedForms =
    guide.relatedFormSlugs
      .map(outreachFormBySlug)
      .filter(Boolean);

  return (
    <section className="section compact">
      <div className="container help-reading-width">
        <nav className="breadcrumbs">
          <Link to="/help">
            Help Centre
          </Link>

          <span>/</span>

          <span>{guide.title}</span>
        </nav>

        <article className="card help-guide-detail">
          <p className="eyebrow">
            {guide.category}
          </p>

          <h1>{guide.title}</h1>

          <p className="lede">
            {guide.summary}
          </p>

          <div className="guide-meta">
            <span>
              {guide.estimatedReadMinutes} min
              read
            </span>

            <span>
              Last reviewed{" "}
              {guide.lastReviewedAt}
            </span>
          </div>

          <div className="guide-body">
            {guide.body.map(
              (paragraph) => (
                <p key={paragraph}>
                  {paragraph}
                </p>
              ),
            )}
          </div>

          {relatedForms.length > 0 && (
            <div className="related-help">
              <h2>Related forms</h2>

              <div className="actions-row">
                {relatedForms.map(
                  (form) => (
                    <Link
                      key={form.slug}
                      className="button secondary"
                      to={`/help/forms/${form.slug}`}
                    >
                      {form.title}
                    </Link>
                  ),
                )}
              </div>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}

export default HelpGuidePage;