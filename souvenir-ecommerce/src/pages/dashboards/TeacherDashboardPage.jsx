import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";

function TeacherDashboardPage() {
  const { user } = useAuth();

  return (
    <section className="portal-main">
      <div className="container">
        <div className="dashboard-head">
          <div>
            <p className="eyebrow">
              My Souvenir · Teacher workspace
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
            className="button secondary"
            to="/help/forms/general-enquiry"
          >
            Contact coordinator
          </Link>
        </div>

        <div className="capability-banner">
          <div>
            <span className="status neutral">
              Teacher access
            </span>

            <strong>
              Teaching and learning resources
            </strong>

            <p>
              Teachers may browse the catalogue,
              request approved digital resources
              and review account information.
              Commercial order submission is not
              available.
            </p>
          </div>
        </div>

        <div className="kpi-grid">
          <article className="card stat-card">
            <span className="meta">
              Active resources
            </span>

            <div className="value">3</div>

            <p>Secure access grants</p>
          </article>

          <article className="card stat-card">
            <span className="meta">
              Pending requests
            </span>

            <div className="value">1</div>

            <p>Awaiting review</p>
          </article>

          <article className="card stat-card">
            <span className="meta">
              Saved series
            </span>

            <div className="value">4</div>

            <p>Teaching programmes</p>
          </article>
        </div>

        <section className="card panel">
          <div className="panel-head">
            <h2>Quick actions</h2>

            <span className="status success">
              Teacher dashboard active
            </span>
          </div>

          <div className="quick-actions">
            <Link
              className="card action-card"
              to="/app/catalog"
            >
              <span
                className="card-icon"
                aria-hidden="true"
              >
                B
              </span>

              <h3>Browse catalogue</h3>

              <p>
                Explore books available to your
                school.
              </p>
            </Link>

            <Link
              className="card action-card"
              to="/app/digital-resources/request"
            >
              <span
                className="card-icon"
                aria-hidden="true"
              >
                D
              </span>

              <h3>
                Request digital resources
              </h3>

              <p>
                Request approved teacher and
                classroom support.
              </p>
            </Link>

            <Link
              className="card action-card"
              to="/help"
            >
              <span
                className="card-icon"
                aria-hidden="true"
              >
                H
              </span>

              <h3>Get help</h3>

              <p>
                Contact Souvenir academic
                support.
              </p>
            </Link>
          </div>
        </section>
      </div>
    </section>
  );
}

export default TeacherDashboardPage;