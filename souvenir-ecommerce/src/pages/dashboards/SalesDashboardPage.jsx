import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";

const ROLE_TITLES = {
  MANAGEMENT_SUPER_MASTER:
    "Souvenir Command Dashboard",

  TECH_MASTER:
    "Souvenir TechOps Dashboard",

  PARTNER_NETWORK_ADMIN:
    "Partner Onboarding Centre",

  COORDINATOR:
    "Coordinator Operations Desk",

  COORDINATOR_HEAD:
    "Regional Approval Centre",

  INVENTORY:
    "Inventory Fulfilment Desk",

  INVENTORY_SUPERVISOR:
    "Stock Control Centre",

  DISPATCH:
    "Dispatch Desk",

  FINANCE:
    "Finance and Credit Desk",

  AUDITOR:
    "Control Audit Viewer",

  SUPER_ADMIN:
    "Souvenir Command Dashboard",
};

const CONTROL_KEY_BY_ROLE = {
  MANAGEMENT_SUPER_MASTER:
    "SCK-MGT-HQ-0001",

  TECH_MASTER:
    "SCK-TECH-HQ-0002",

  PARTNER_NETWORK_ADMIN:
    "SCK-PNA-HQ-0011",

  COORDINATOR:
    "SCK-CO-UP-0014",

  COORDINATOR_HEAD:
    "SCK-CH-NR-0003",

  INVENTORY:
    "SCK-INV-NOI-0007",

  INVENTORY_SUPERVISOR:
    "SCK-INV-NOI-0008",

  DISPATCH:
    "SCK-DSP-NOI-0004",

  FINANCE:
    "SCK-FIN-HQ-0006",

  AUDITOR:
    "SCK-AUD-HQ-0002",

  SUPER_ADMIN:
    "Super administrator",
};

const demoPriorities = [
  {
    label:
      "Client confirmation and approvals",
    value: 0,
    to: "/control/approvals",
  },
  {
    label:
      "Inventory and print preparation",
    value: 2,
    to: "/control/inventory",
  },
  {
    label:
      "Packed for dispatch",
    value: 1,
    to: "/control/dispatch",
  },
  {
    label:
      "Low or unavailable stock lines",
    value: 1,
    to: "/control/stock",
  },
];

function StatCard({
  label,
  value,
  note,
}) {
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

function ControlDashboardPage() {
  const { role } = useAuth();

  const dashboardTitle =
    ROLE_TITLES[role] ??
    "Souvenir Control Centre";

  const controlKey =
    CONTROL_KEY_BY_ROLE[role] ??
    role
      .split("_")
      .map(
        (part) =>
          part.charAt(0) +
          part
            .slice(1)
            .toLocaleLowerCase(),
      )
      .join(" ");

  if (
    role === "PARTNER_NETWORK_ADMIN"
  ) {
    return (
      <section className="portal-main control-main">
        <div className="container">
          <div className="control-titlebar">
            <div>
              <p className="eyebrow">
                Souvenir Partner Onboarding
                Centre
              </p>

              <h1>
                Provision partner access
                safely
              </h1>

              <p>
                Staged imports, privilege
                review, maker-checker approval
                and secure invitation handling.
              </p>
            </div>

            <Link
              className="button"
              to="/control/partner-network/onboarding/new"
            >
              Upload Partner Data
            </Link>
          </div>

          <div className="notice warning">
            <strong>
              Production safety gate:
            </strong>{" "}
            live workbook execution remains
            disabled until secure backend
            services are connected.
          </div>

          <div className="kpi-grid">
            <StatCard
              label="Import batches"
              value="3"
              note="Versioned history"
            />

            <StatCard
              label="Awaiting approval"
              value="1"
              note="Maker-checker queue"
            />

            <StatCard
              label="Buying-enabled partners"
              value="10"
              note="Enhanced review required"
            />

            <StatCard
              label="Plaintext passwords"
              value="0"
              note="Never generated"
            />
          </div>

          <div className="dashboard-grid">
            <section className="card panel">
              <div className="panel-head">
                <h2>
                  Operational queues
                </h2>

                <Link
                  className="text-link"
                  to="/control/partner-network/onboarding/batches"
                >
                  Import history →
                </Link>
              </div>

              <div className="queue-list">
                <Link to="/control/partner-network/onboarding/batches">
                  <span>
                    Imports awaiting validation
                  </span>

                  <strong>1</strong>
                </Link>

                <Link to="/control/partner-network/onboarding/batches">
                  <span>
                    Batches awaiting second
                    approval
                  </span>

                  <strong>1</strong>
                </Link>

                <Link to="/control/partner-network/onboarding/batches">
                  <span>
                    Data conflicts
                  </span>

                  <strong>0</strong>
                </Link>

                <Link to="/control/partner-network/onboarding/batches">
                  <span>
                    Failed invitations
                  </span>

                  <strong>0</strong>
                </Link>
              </div>
            </section>

            <aside className="card panel">
              <p className="eyebrow">
                Authority model
              </p>

              <h2>
                A dashboard is not buying
                power
              </h2>

              <ul className="check-list">
                <li>
                  PartnerKey identifies an
                  organisation.
                </li>

                <li>
                  Every user has an individual
                  login.
                </li>

                <li>
                  Role and account capability
                  must both permit actions.
                </li>

                <li>
                  High-risk access requires
                  independent approval.
                </li>
              </ul>

              <Link
                className="button secondary full-width"
                to="/control/partner-network/onboarding/access-profiles"
              >
                Compare access profiles
              </Link>
            </aside>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="portal-main control-main">
      <div className="container">
        <div className="control-titlebar">
          <div>
            <p className="eyebrow">
              Souvenir Control Centre
            </p>

            <h1>{dashboardTitle}</h1>

            <p>
              Authorised Access. Accountable
              Action. · {controlKey}
            </p>
          </div>

          <span className="status success">
            Individual staff identity active
          </span>
        </div>

        <div className="kpi-grid">
          <StatCard
            label="Account-owned records"
            value="3"
            note="One operational source"
          />

          <StatCard
            label="Awaiting approval"
            value="0"
            note="Maker-checker enforced"
          />

          <StatCard
            label="Ready for inventory"
            value="2"
            note="Stock plan reserved"
          />

          <StatCard
            label="Ready for dispatch"
            value="1"
            note="Packed records"
          />
        </div>

        <div className="control-grid">
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
              {demoPriorities.map(
                (priority) => (
                  <Link
                    key={priority.label}
                    to={priority.to}
                  >
                    <span>
                      {priority.label}
                    </span>

                    <strong>
                      {priority.value}
                    </strong>
                  </Link>
                ),
              )}
            </div>
          </section>

          <aside className="card panel">
            <div className="panel-head">
              <h2>Client access</h2>
            </div>

            <dl className="control-summary">
              <div>
                <dt>
                  Dashboard-active accounts
                </dt>

                <dd>3</dd>
              </div>

              <div>
                <dt>Assisted-only</dt>
                <dd>2</dd>
              </div>

              <div>
                <dt>Self-service</dt>
                <dd>1</dd>
              </div>

              <div>
                <dt>
                  Pending PartnerKey
                  activation
                </dt>

                <dd>0</dd>
              </div>
            </dl>

            <p className="field-help">
              Dashboard access remains separate
              from order and sample creation
              permission.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default ControlDashboardPage;