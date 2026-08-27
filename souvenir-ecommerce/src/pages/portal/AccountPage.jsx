import { useAuth } from "../../context/AuthContext.jsx";

const ROLE_LABELS = {
  SCHOOL_ADMIN:
    "School administrator",

  SCHOOL_TEACHER:
    "School teacher",

  DISTRIBUTOR_ADMIN:
    "Distributor administrator",

  SALES_REP:
    "Sales representative",

  SALES_MANAGER:
    "Sales manager",

  CATALOGUE_ADMIN:
    "Catalogue administrator",

  ORDER_OPERATIONS:
    "Order operations",

  FINANCE:
    "Finance",

  DIGITAL_RESOURCE_ADMIN:
    "Digital resource administrator",

  SUPER_ADMIN:
    "Super administrator",

  MANAGEMENT_SUPER_MASTER:
    "Management Super Master",

  TECH_MASTER:
    "Technology Master",

  PARTNER_NETWORK_ADMIN:
    "Partner Network Administrator",

  COORDINATOR:
    "Regional Coordinator",

  COORDINATOR_HEAD:
    "Coordinator Head",

  INVENTORY:
    "Inventory and fulfilment",

  INVENTORY_SUPERVISOR:
    "Inventory Supervisor",

  DISPATCH:
    "Dispatch Team",

  AUDITOR:
    "Auditor",
};

function AccountPage() {
  const { user, role } = useAuth();

  if (!user) {
    return null;
  }

  const roleLabel =
    ROLE_LABELS[role] ?? role;

  const hasOrganisation =
    Boolean(user.accountName);

  return (
    <section className="portal-main">
      <div className="container">
        <div className="dashboard-head">
          <div>
            <p className="eyebrow">
              My Souvenir
            </p>

            <h1>Account details</h1>

            <p>
              Review your current demo identity
              and organisation context.
            </p>
          </div>

          <span className="status success">
            Session active
          </span>
        </div>

        <div className="dashboard-grid">
          <section className="card panel">
            <div className="panel-head">
              <h2>Personal identity</h2>
            </div>

            <dl className="detail-meta">
              <div>
                <dt>Name</dt>
                <dd>{user.name}</dd>
              </div>

              <div>
                <dt>Email</dt>
                <dd>{user.email}</dd>
              </div>

              <div>
                <dt>Mobile</dt>
                <dd>
                  {user.mobile ??
                    "Not configured"}
                </dd>
              </div>

              <div>
                <dt>Role</dt>
                <dd>{roleLabel}</dd>
              </div>

              <div>
                <dt>User ID</dt>
                <dd>{user.id}</dd>
              </div>
            </dl>
          </section>

          <aside className="card panel">
            <div className="panel-head">
              <h2>
                Organisation context
              </h2>
            </div>

            {hasOrganisation ? (
              <dl className="detail-meta">
                <div>
                  <dt>Organisation</dt>
                  <dd>
                    {user.accountName}
                  </dd>
                </div>

                <div>
                  <dt>Account ID</dt>
                  <dd>
                    {user.accountId}
                  </dd>
                </div>

                <div>
                  <dt>PartnerKey</dt>
                  <dd>
                    {user.partnerKey}
                  </dd>
                </div>

                <div>
                  <dt>Account status</dt>
                  <dd>
                    <span className="status success">
                      Active
                    </span>
                  </dd>
                </div>
              </dl>
            ) : (
              <div className="notice neutral">
                This is an internal Souvenir
                identity and is not permanently
                attached to a customer account.
              </div>
            )}
          </aside>
        </div>

        <div className="dashboard-grid space-top-lg">
          <section className="card panel">
            <div className="panel-head">
              <h2>Access scope</h2>
            </div>

            <dl className="detail-meta">
              <div>
                <dt>Territories</dt>

                <dd>
                  {user.territoryIds?.length
                    ? user.territoryIds.join(
                        ", ",
                      )
                    : "No territory scope"}
                </dd>
              </div>

              <div>
                <dt>Warehouses</dt>

                <dd>
                  {user.warehouseIds?.length
                    ? user.warehouseIds.join(
                        ", ",
                      )
                    : "No warehouse scope"}
                </dd>
              </div>

              <div>
                <dt>ControlKey</dt>

                <dd>
                  {user.controlKeyId ??
                    "Not applicable"}
                </dd>
              </div>
            </dl>
          </section>

          <aside className="card panel">
            <div className="panel-head">
              <h2>Security</h2>
            </div>

            <ul className="check-list">
              <li>
                Session belongs to one user.
              </li>

              <li>
                Route access is role-based.
              </li>

              <li>
                Customer and internal identities
                remain separate.
              </li>

              <li>
                Production authentication will
                be controlled by the backend.
              </li>
            </ul>

            <div className="notice warning">
              <strong>
                Demo boundary:
              </strong>{" "}
              this page displays frontend demo
              session data only.
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default AccountPage;