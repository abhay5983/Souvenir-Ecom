import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";

const stats = [
  {
    label: "Account-owned records",
    value: "3",
    note: "One operational source",
  },
  {
    label: "Awaiting approval",
    value: "0",
    note: "Maker-checker enforced",
  },
  {
    label: "Ready for inventory",
    value: "1",
    note: "Stock plan reserved",
  },
  {
    label: "Ready for dispatch",
    value: "1",
    note: "Packed records",
  },
];

const priorities = [
  {
    label: "Client confirmation and approvals",
    value: 1,
    to: "/control/approvals",
  },
  {
    label: "Inventory and print preparation",
    value: 1,
    to: "/control/inventory",
  },
  {
    label: "Packed records awaiting dispatch",
    value: 1,
    to: "/control/dispatch",
  },
  {
    label: "Stock exceptions requiring review",
    value: 0,
    to: "/control/stock",
  },
];

const clientAccess = [
  {
    label: "Dashboard-active accounts",
    value: 3,
  },
  {
    label: "Assisted-only",
    value: 2,
  },
  {
    label: "Self-service",
    value: 1,
  },
  {
    label: "Pending PartnerKey activation",
    value: 0,
  },
];

function StatCard({ label, value, note }) {
  return (
    <article className="card stat-card">
      <span className="meta">
        {label}
      </span>

      <div className="value">
        {value}
      </div>

      <p>{note}</p>
    </article>
  );
}

function SuperAdminDashboardPage() {
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
              Souvenir Command Dashboard
            </h1>

            <p>
              Authorised Access. Accountable
              Action. · Super administrator
            </p>
          </div>

          <span className="status success">
            Individual staff identity active
          </span>
        </div>

        <div className="kpi-grid four-column">
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              note={stat.note}
            />
          ))}
        </div>

        <div className="super-admin-grid">
          <section className="card panel">
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

            <div className="priority-list">
              {priorities.map((item) => (
                <Link
                  key={item.label}
                  className="priority-row"
                  to={item.to}
                >
                  <span>
                    {item.label}
                  </span>

                  <strong>
                    {item.value}
                  </strong>
                </Link>
              ))}
            </div>
          </section>

          <aside className="card panel">
            <div className="panel-head">
              <h2>Client access</h2>
            </div>

            <dl className="client-access-list">
              {clientAccess.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>

            <div className="notice neutral">
              <strong>
                Access model
              </strong>

              <p>
                Dashboard access, ordering,
                samples and digital resources
                remain separate permissions.
              </p>
            </div>
          </aside>
        </div>

        <div className="super-admin-grid space-top-lg">
          <section className="card panel">
            <div className="panel-head">
              <h2>
                Control Centre actions
              </h2>

              <span className="status neutral">
                Full operational access
              </span>
            </div>

            <div className="quick-actions">
              <Link
                className="card action-card"
                to="/control/partner-network/onboarding"
              >
                <span
                  className="card-icon"
                  aria-hidden="true"
                >
                  P
                </span>

                <h3>
                  Partner onboarding
                </h3>

                <p>
                  Review staged partner imports,
                  access profiles and approvals.
                </p>
              </Link>

              <Link
                className="card action-card"
                to="/control/accounts"
              >
                <span
                  className="card-icon"
                  aria-hidden="true"
                >
                  A
                </span>

                <h3>Accounts</h3>

                <p>
                  Review school, distributor and
                  partner account access.
                </p>
              </Link>

              <Link
                className="card action-card"
                to="/control/orders"
              >
                <span
                  className="card-icon"
                  aria-hidden="true"
                >
                  O
                </span>

                <h3>Orders</h3>

                <p>
                  Review account-owned commercial
                  and sample records.
                </p>
              </Link>

              <Link
                className="card action-card"
                to="/control/approvals"
              >
                <span
                  className="card-icon"
                  aria-hidden="true"
                >
                  C
                </span>

                <h3>Approvals</h3>

                <p>
                  Process maker-checker and client
                  confirmation queues.
                </p>
              </Link>

              <Link
                className="card action-card"
                to="/control/stock"
              >
                <span
                  className="card-icon"
                  aria-hidden="true"
                >
                  S
                </span>

                <h3>Stock</h3>

                <p>
                  Review inventory availability,
                  print and reservation status.
                </p>
              </Link>

              <Link
                className="card action-card"
                to="/control/dispatch"
              >
                <span
                  className="card-icon"
                  aria-hidden="true"
                >
                  D
                </span>

                <h3>Dispatch</h3>

                <p>
                  Review packed records and
                  shipment readiness.
                </p>
              </Link>
            </div>
          </section>

          <aside className="card panel">
            <div className="panel-head">
              <h2>Signed-in identity</h2>
            </div>

            <dl className="detail-meta">
              <div>
                <dt>Name</dt>
                <dd>
                  {user?.name ??
                    "Super Administrator"}
                </dd>
              </div>

              <div>
                <dt>Email</dt>
                <dd>
                  {user?.email ??
                    "superadmin@souvenir.example"}
                </dd>
              </div>

              <div>
                <dt>Role</dt>
                <dd>SUPER_ADMIN</dd>
              </div>

              <div>
                <dt>Access scope</dt>
                <dd>
                  Souvenir Control Centre
                </dd>
              </div>
            </dl>

            <div className="notice success">
              <strong>
                Identity verified
              </strong>

              <p>
                This session belongs to an
                individual authorised staff
                account.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default SuperAdminDashboardPage;