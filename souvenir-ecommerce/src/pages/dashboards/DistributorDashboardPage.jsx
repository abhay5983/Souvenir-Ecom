import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";

function DistributorDashboardPage() {
  const { user } = useAuth();

  return (
    <section className="portal-main">
      <div className="container">
        <div className="dashboard-head">
          <div>
            <p className="eyebrow">
              My Souvenir · Distributor workspace
            </p>

            <h1>
              Good afternoon, {user?.name ?? "Partner"}
            </h1>

            <p>
              {user?.accountName ??
                "North Star Educational Distributors"}{" "}
              ·{" "}
              {user?.partnerKey ??
                "SPK-DS-DL-00002"}{" "}
              · Representative: Rahul Mehta
            </p>
          </div>

          <Link
            className="button"
            to="/app/catalog"
          >
            Create new order
          </Link>
        </div>

        <div className="capability-banner">
          <div>
            <span className="status success">
              Self service
            </span>

            <strong>
              Distributor ordering is enabled
            </strong>

            <p>
              You may browse the catalogue, build
              commercial orders, request approved
              samples and review fulfilment.
            </p>
          </div>

          <dl>
            <div>
              <dt>Order mode</dt>
              <dd>CLIENT SUBMIT</dd>
            </div>

            <div>
              <dt>Sample mode</dt>
              <dd>CLIENT SUBMIT</dd>
            </div>
          </dl>
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
              Pending approval
            </span>

            <div className="value">0</div>

            <p>No review required</p>
          </article>

          <article className="card stat-card">
            <span className="meta">
              Packing & shipping
            </span>

            <div className="value">1</div>

            <p>Fulfilment in progress</p>
          </article>

          <article className="card stat-card">
            <span className="meta">
              Active resources
            </span>

            <div className="value">6</div>

            <p>Secure access grants</p>
          </article>
        </div>

        <div className="dashboard-grid">
          <section className="card panel">
            <div className="panel-head">
              <h2>Quick actions</h2>

              <span className="status success">
                Distributor dashboard active
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

                <h3>
                  Browse account catalogue
                </h3>

                <p>
                  View account-aware availability
                  and catalogue pricing.
                </p>
              </Link>

              <Link
                className="card action-card"
                to="/cart"
              >
                <span
                  className="card-icon"
                  aria-hidden="true"
                >
                  O
                </span>

                <h3>Create an order</h3>

                <p>
                  Add books and quantities for a
                  distributor order.
                </p>
              </Link>

              <Link
                className="card action-card"
                to="/app/catalog"
              >
                <span
                  className="card-icon"
                  aria-hidden="true"
                >
                  S
                </span>

                <h3>Request samples</h3>

                <p>
                  Choose permitted evaluation
                  copies.
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
                  Submit approved resources for a
                  verified school.
                </p>
              </Link>
            </div>
          </section>

          <aside className="card panel">
            <div className="panel-head">
              <h2>
                Recent orders and samples
              </h2>
            </div>

            <ul className="activity-list control-activity">
              <li>
                <div>
                  <strong>
                    ORD-SV-1045
                  </strong>

                  <span>
                    Created by your organisation ·
                    Oakwood English 4
                  </span>
                </div>

                <span className="status success">
                  Approved for Fulfilment
                </span>
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default DistributorDashboardPage;