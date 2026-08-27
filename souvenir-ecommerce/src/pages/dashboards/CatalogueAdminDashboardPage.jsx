import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { catalogue } from "../../data/catalog.js";

function CatalogueAdminDashboardPage() {
  const auth = useAuth();

  const role =
    auth.role ??
    auth.user?.role ??
    "CATALOGUE_ADMIN";

  const totalSeries = catalogue.length;

  const publicSeries = catalogue.filter(
    (series) => series.publicVisibility,
  ).length;

  const draftSeries = catalogue.filter(
    (series) =>
      series.verificationStatus ===
      "DRAFT_REVIEW",
  ).length;

  const verifiedSeries = catalogue.filter(
    (series) =>
      series.verificationStatus ===
      "SOURCE_VERIFIED",
  ).length;

  const totalVariants = catalogue.reduce(
    (total, series) =>
      total + (series.variants?.length ?? 0),
    0,
  );

  const missingVariants = catalogue.filter(
    (series) =>
      !series.variants ||
      series.variants.length === 0,
  );

  const recentlyReviewed = catalogue
    .filter(
      (series) =>
        series.verificationStatus ===
        "SOURCE_VERIFIED",
    )
    .slice(0, 5);

  return (
    <section className="portal-main">
      <div className="container">
        <div className="dashboard-head">
          <div>
            <p className="eyebrow">
              Catalogue administration
            </p>

            <h1>
              Souvenir Catalogue Dashboard
            </h1>

            <p>
              Manage series, variants,
              catalogue visibility and
              source-verification status.
              Signed in as{" "}
              {role === "CATALOGUE_ADMIN"
                ? "Catalogue Administrator"
                : role}
              .
            </p>
          </div>

          <Link
            className="button"
            to="/admin/catalog"
          >
            Open catalogue
          </Link>
        </div>

        <div className="kpi-grid">
          <article className="card stat-card">
            <span className="meta">
              Catalogue series
            </span>

            <div className="value">
              {totalSeries}
            </div>

            <p>
              All structured catalogue
              records
            </p>
          </article>

          <article className="card stat-card">
            <span className="meta">
              Public series
            </span>

            <div className="value">
              {publicSeries}
            </div>

            <p>
              Currently visible publicly
            </p>
          </article>

          <article className="card stat-card">
            <span className="meta">
              Source verified
            </span>

            <div className="value">
              {verifiedSeries}
            </div>

            <p>
              Verified catalogue records
            </p>
          </article>

          <article className="card stat-card">
            <span className="meta">
              Draft review
            </span>

            <div className="value">
              {draftSeries}
            </div>

            <p>
              Editorial review required
            </p>
          </article>
        </div>

        <div className="control-grid space-top-lg">
          <section className="card panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow">
                  Catalogue health
                </p>

                <h2>
                  Publishing priorities
                </h2>
              </div>

              <Link
                className="text-link"
                to="/admin/catalog"
              >
                View all →
              </Link>
            </div>

            <div className="queue-list">
              <Link to="/admin/catalog?status=draft">
                <span>
                  Series awaiting source
                  verification
                </span>

                <strong>
                  {draftSeries}
                </strong>
              </Link>

              <Link to="/admin/catalog?visibility=public">
                <span>
                  Public catalogue series
                </span>

                <strong>
                  {publicSeries}
                </strong>
              </Link>

              <Link to="/admin/catalog?variants=missing">
                <span>
                  Series without variants
                </span>

                <strong>
                  {missingVariants.length}
                </strong>
              </Link>

              <Link to="/admin/catalog">
                <span>
                  Verified product variants
                </span>

                <strong>
                  {totalVariants}
                </strong>
              </Link>
            </div>
          </section>

          <aside className="card panel">
            <div className="panel-head">
              <h2>
                Catalogue controls
              </h2>
            </div>

            <ul className="check-list">
              <li>
                Maintain series metadata
              </li>

              <li>
                Maintain ISBN and MRP records
              </li>

              <li>
                Review source-page evidence
              </li>

              <li>
                Control public visibility
              </li>

              <li>
                Maintain product variants
              </li>

              <li>
                Do not fabricate unverified
                catalogue values
              </li>
            </ul>
          </aside>
        </div>

        <section className="card panel space-top-lg">
          <div className="panel-head">
            <div>
              <p className="eyebrow">
                Verified catalogue
              </p>

              <h2>
                Recently reviewed series
              </h2>
            </div>

            <Link
              className="text-link"
              to="/admin/catalog"
            >
              Manage catalogue →
            </Link>
          </div>

          {recentlyReviewed.length ? (
            <div className="table-scroll">
              <table className="control-table">
                <thead>
                  <tr>
                    <th>Series</th>
                    <th>Imprint</th>
                    <th>Subject</th>
                    <th>Variants</th>
                    <th>Source</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {recentlyReviewed.map(
                    (series) => (
                      <tr key={series.id}>
                        <td>
                          <Link
                            className="text-link"
                            to={`/admin/catalog/${series.id}`}
                          >
                            {series.title}
                          </Link>
                        </td>

                        <td>
                          {series.imprint}
                        </td>

                        <td>
                          {series.subject}
                        </td>

                        <td>
                          {series.variants
                            ?.length ?? 0}
                        </td>

                        <td>
                          {series.sourcePage
                            ? `Page ${series.sourcePage}`
                            : "Not recorded"}
                        </td>

                        <td>
                          <span className="status success">
                            Source verified
                          </span>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <h3>
                No verified series
              </h3>

              <p>
                Verified catalogue records
                will appear here.
              </p>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

export default CatalogueAdminDashboardPage;