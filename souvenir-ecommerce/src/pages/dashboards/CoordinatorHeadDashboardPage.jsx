import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

function CoordinatorHeadDashboardPage() {
  const { user } = useAuth();

  return (
    <section className="portal-main control-main">
      <div className="container">
        <div className="control-titlebar">
          <div>
            <p className="eyebrow">
              Souvenir Control Centre
            </p>

            <h1>
              Coordinator Head Dashboard
            </h1>

            <p>
              Authorised Access. Accountable Action.
              {" · "}
              {user?.controlKeyId ??
                "SCK-CH-NR-0003"}
            </p>
          </div>

          <span className="status success">
            Individual staff identity active
          </span>
        </div>

        <div className="kpi-grid">
          <article className="card stat-card">
            <span className="meta">
              Account-owned records
            </span>

            <div className="value">3</div>

            <p>
              Territory operational records
            </p>
          </article>

          <article className="card stat-card">
            <span className="meta">
              Awaiting approval
            </span>

            <div className="value">1</div>

            <p>
              Independent review required
            </p>
          </article>

          <article className="card stat-card">
            <span className="meta">
              Ready for inventory
            </span>

            <div className="value">1</div>

            <p>
              Stock-reserved records
            </p>
          </article>

          <article className="card stat-card">
            <span className="meta">
              Ready for dispatch
            </span>

            <div className="value">1</div>

            <p>
              Packed records
            </p>
          </article>
        </div>

        <div className="control-grid space-top-lg">
          <section className="card panel">
            <div className="panel-head">
              <h2>
                Coordinator priorities
              </h2>

              <Link
                className="text-link"
                to="/control/orders"
              >
                View all →
              </Link>
            </div>

            <div className="queue-list">
              <Link to="/control/approvals">
                <span>
                  Orders awaiting head approval
                </span>
                <strong>1</strong>
              </Link>

              <Link to="/control/accounts">
                <span>
                  Account assistance
                </span>
                <strong>3</strong>
              </Link>

              <Link to="/control/orders">
                <span>
                  Active operational records
                </span>
                <strong>3</strong>
              </Link>

              <Link to="/control/inventory">
                <span>
                  Approved for fulfilment
                </span>
                <strong>1</strong>
              </Link>
            </div>
          </section>

          <aside className="card panel">
            <div className="panel-head">
              <h2>
                Head authority
              </h2>
            </div>

            <ul className="check-list">
              <li>
                Review coordinator-created records
              </li>

              <li>
                Approve eligible operational requests
              </li>

              <li>
                Enforce maker-checker separation
              </li>

              <li>
                Review territory accounts
              </li>

              <li>
                Follow fulfilment readiness
              </li>

              <li>
                Review auditable operational activity
              </li>
            </ul>
          </aside>
        </div>

        <section className="card panel space-top-lg">
          <div className="panel-head">
            <div>
              <p className="eyebrow">
                Operational access
              </p>

              <h2>
                Coordinator Head tools
              </h2>
            </div>
          </div>

          <div className="quick-action-grid">
            <Link
              className="card quick-action"
              to="/control/accounts"
            >
              <strong>Accounts</strong>

              <span>
                Review client account capabilities and
                delegated operations.
              </span>
            </Link>

            <Link
              className="card quick-action"
              to="/control/orders"
            >
              <strong>Orders</strong>

              <span>
                Review orders and account-owned records.
              </span>
            </Link>

            <Link
              className="card quick-action"
              to="/control/approvals"
            >
              <strong>Approvals</strong>

              <span>
                Complete independent approval actions.
              </span>
            </Link>

            <Link
              className="card quick-action"
              to="/control/audit"
            >
              <strong>Activity</strong>

              <span>
                Review accountable operational events.
              </span>
            </Link>
          </div>
        </section>
      </div>
    </section>
  );
}

export default CoordinatorHeadDashboardPage;