import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const demoRecords = [
  {
    id: "ORDER-DEMO-104",
    reference: "ORD-SV-1042",
    account: "Greenfield Academy",
    status: "AWAITING_CLIENT_CONFIRMATION",
  },
  {
    id: "ORDER-DEMO-105",
    reference: "ORD-SV-1045",
    account: "North Star Educational Distributors",
    status: "READY_FOR_INVENTORY",
  },
  {
    id: "ORDER-DEMO-106",
    reference: "ORD-SV-1048",
    account: "Sunrise Public School",
    status: "PACKED",
  },
];

function ManagementSuperMasterDashboardPage() {
  const { user } = useAuth();

  const awaitingApproval = demoRecords.filter(
    (record) =>
      [
        "PENDING_HEAD_APPROVAL",
        "SUBMITTED",
        "CLARIFICATION_REQUIRED",
      ].includes(record.status),
  ).length;

  const readyForInventory = demoRecords.filter(
    (record) =>
      [
        "READY_FOR_INVENTORY",
        "PARTIALLY_READY_FOR_INVENTORY",
      ].includes(record.status),
  ).length;

  const readyForDispatch = demoRecords.filter(
    (record) => record.status === "PACKED",
  ).length;

  return (
    <section className="portal-main control-main">
      <div className="container">
        <div className="control-titlebar">
          <div>
            <p className="eyebrow">
              Souvenir Control Centre
            </p>

            <h1>
              Management Command Dashboard
            </h1>

            <p>
              Authorised Access. Accountable Action.
              {" · "}
              {user?.controlKeyId ??
                "SCK-MGT-HQ-0001"}
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

            <div className="value">
              {demoRecords.length}
            </div>

            <p>
              One operational source
            </p>
          </article>

          <article className="card stat-card">
            <span className="meta">
              Awaiting approval
            </span>

            <div className="value">
              {awaitingApproval}
            </div>

            <p>
              Maker-checker enforced
            </p>
          </article>

          <article className="card stat-card">
            <span className="meta">
              Ready for inventory
            </span>

            <div className="value">
              {readyForInventory}
            </div>

            <p>
              Stock plan reserved
            </p>
          </article>

          <article className="card stat-card">
            <span className="meta">
              Ready for dispatch
            </span>

            <div className="value">
              {readyForDispatch}
            </div>

            <p>
              Packed records
            </p>
          </article>
        </div>

        <div className="control-grid space-top-lg">
          <section className="card panel control-priority">
            <div className="panel-head">
              <h2>
                Operational priorities
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
                  Client confirmation and approvals
                </span>

                <strong>
                  {awaitingApproval}
                </strong>
              </Link>

              <Link to="/control/inventory">
                <span>
                  Inventory and print preparation
                </span>

                <strong>
                  {readyForInventory}
                </strong>
              </Link>

              <Link to="/control/dispatch">
                <span>
                  Packed for dispatch
                </span>

                <strong>
                  {readyForDispatch}
                </strong>
              </Link>

              <Link to="/control/stock">
                <span>
                  Stock and availability review
                </span>

                <strong>1</strong>
              </Link>
            </div>
          </section>

          <aside className="card panel">
            <div className="panel-head">
              <h2>
                Management authority
              </h2>
            </div>

            <ul className="check-list">
              <li>
                Review operational records
              </li>

              <li>
                Approve independent maker-checker actions
              </li>

              <li>
                Manage account capability profiles
              </li>

              <li>
                Review stock and fulfilment readiness
              </li>

              <li>
                Access partner onboarding
              </li>

              <li>
                Review audit and operational activity
              </li>
            </ul>
          </aside>
        </div>

        <div className="control-grid space-top-lg">
          <section className="card panel">
            <div className="panel-head">
              <h2>
                Management controls
              </h2>
            </div>

            <div className="quick-action-grid">
              <Link
                className="card quick-action"
                to="/control/partner-network/onboarding"
              >
                <strong>
                  Partner onboarding
                </strong>

                <span>
                  Review onboarding operations
                </span>
              </Link>

              <Link
                className="card quick-action"
                to="/control/accounts"
              >
                <strong>
                  Account access
                </strong>

                <span>
                  Review capability profiles
                </span>
              </Link>

              <Link
                className="card quick-action"
                to="/control/approvals"
              >
                <strong>
                  Approvals
                </strong>

                <span>
                  Review maker-checker queue
                </span>
              </Link>

              <Link
                className="card quick-action"
                to="/control/audit"
              >
                <strong>
                  Audit
                </strong>

                <span>
                  Review accountable actions
                </span>
              </Link>
            </div>
          </section>

          <aside className="card panel">
            <div className="panel-head">
              <h2>
                Control identity
              </h2>
            </div>

            <dl className="control-summary">
              <div>
                <dt>Role</dt>
                <dd>
                  Management Super Master
                </dd>
              </div>

              <div>
                <dt>ControlKey</dt>
                <dd>
                  {user?.controlKeyId ??
                    "SCK-MGT-HQ-0001"}
                </dd>
              </div>

              <div>
                <dt>Scope</dt>
                <dd>
                  Management authority
                </dd>
              </div>

              <div>
                <dt>Session</dt>
                <dd>
                  Active
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default ManagementSuperMasterDashboardPage;