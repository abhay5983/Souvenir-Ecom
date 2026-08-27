import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";

function SchoolAdminDashboardPage() {
  const { user } = useAuth();

  return (
    <section className="portal-main">
      <div className="container">
        <div className="dashboard-head">
          <div>
            <p className="eyebrow">
              My Souvenir · School workspace
            </p>

            <h1>
              Good afternoon, {user.name}
            </h1>

            <p>
              {user.accountName} ·{" "}
              {user.partnerKey}
            </p>
          </div>

          <Link
            className="button"
            to="/app/catalog"
          >
            Browse account catalogue
          </Link>
        </div>

        <div className="kpi-grid">
          <article className="card stat-card">
            <span className="meta">
              Account records
            </span>

            <div className="value">1</div>

            <p>Orders and samples</p>
          </article>

          <article className="card stat-card">
            <span className="meta">
              Your confirmation
            </span>

            <div className="value">1</div>

            <p>Review required</p>
          </article>

          <article className="card stat-card">
            <span className="meta">
              Active resources
            </span>

            <div className="value">6</div>

            <p>Secure access grants</p>
          </article>
        </div>

        <section className="card panel">
          <div className="panel-head">
            <h2>Quick actions</h2>
          </div>

          <div className="quick-actions">
            <Link
              className="card action-card"
              to="/app/catalog"
            >
              <span className="card-icon">
                B
              </span>

              <h3>Browse catalogue</h3>

              <p>
                View account-aware books and
                resources.
              </p>
            </Link>

            <Link
              className="card action-card"
              to="/cart"
            >
              <span className="card-icon">
                O
              </span>

              <h3>Review cart</h3>

              <p>
                Prepare a partner order or
                sample request.
              </p>
            </Link>

            <Link
              className="card action-card"
              to="/app/digital-resources/request"
            >
              <span className="card-icon">
                D
              </span>

              <h3>Digital resources</h3>

              <p>
                Request controlled school
                resources.
              </p>
            </Link>
          </div>
        </section>
      </div>
    </section>
  );
}

export default SchoolAdminDashboardPage;