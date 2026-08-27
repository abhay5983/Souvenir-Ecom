import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";

const assignedPartners = [
  {
    id: "ACC-SCHOOL-001",
    name: "Greenfield Academy",
    partnerKey: "SPK-SC-DL-00003",
    type: "School",
    territory: "Demo North",
    status: "ACTIVE",
  },
  {
    id: "ACC-DIST-001",
    name: "North Star Education",
    partnerKey: "SPK-DS-DL-00004",
    type: "Distributor",
    territory: "Demo North",
    status: "ACTIVE",
  },
];

const demoActivity = [
  {
    id: "ACT-001",
    accountName: "Greenfield Academy",
    action: "Adoption follow-up",
    owner: "Sales Rep",
    status: "OPEN",
  },
  {
    id: "ACT-002",
    accountName: "North Star Education",
    action: "Order assistance",
    owner: "Sales Rep",
    status: "IN_PROGRESS",
  },
];

function SalesManagerDashboardPage() {
  const { user, role } = useAuth();

  const [accountCode, setAccountCode] = useState("");
  const [reason, setReason] = useState(
    "Adoption follow-up",
  );
  const [activeContext, setActiveContext] =
    useState(null);
  const [message, setMessage] = useState("");

  const territory =
    user?.territoryIds?.[0] ?? "Demo North";

  const stats = useMemo(
    () => [
      {
        label: "Assigned partners",
        value: assignedPartners.length,
        note: "Within current territory",
      },
      {
        label: "Active follow-ups",
        value: demoActivity.filter(
          (item) => item.status !== "CLOSED",
        ).length,
        note: "Sales activity in progress",
      },
      {
        label: "Schools",
        value: assignedPartners.filter(
          (item) => item.type === "School",
        ).length,
        note: "Territory school accounts",
      },
      {
        label: "Distributors",
        value: assignedPartners.filter(
          (item) =>
            item.type === "Distributor",
        ).length,
        note: "Territory trade accounts",
      },
    ],
    [],
  );

  function handleSubmit(event) {
    event.preventDefault();

    const cleanCode = accountCode
      .trim()
      .toLocaleUpperCase();

    const account = assignedPartners.find(
      (item) =>
        item.partnerKey === cleanCode,
    );

    if (!account) {
      setActiveContext(null);
      setMessage(
        "That PartnerKey is not assigned to your current territory.",
      );
      return;
    }

    setActiveContext({
      account,
      reason,
    });

    setMessage(
      `Authorised partner context opened for ${account.name}.`,
    );
  }

  return (
    <section className="portal-main">
      <div className="container">
        <div className="dashboard-head">
          <div>
            <p className="eyebrow">
              Sales workspace
            </p>

            <h1>
              Account relationships, clearly
              scoped
            </h1>

            <p>
              Assigned territory: {territory} ·
              Signed in as{" "}
              {role === "SALES_MANAGER"
                ? "Sales Manager"
                : "Sales Representative"}
            </p>
          </div>

          <span className="status success">
            Territory access active
          </span>
        </div>

        <div className="kpi-grid">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="card stat-card"
            >
              <span className="meta">
                {stat.label}
              </span>

              <div className="value">
                {stat.value}
              </div>

              <p>{stat.note}</p>
            </article>
          ))}
        </div>

        <div className="form-shell space-top-lg">
          <section className="form-card">
            <p className="eyebrow">
              Work on behalf
            </p>

            <h2>
              Enter an authorised account
              context
            </h2>

            <p>
              Search by organisation code. The
              customer never shares
              credentials; every action retains
              the internal actor and customer
              account.
            </p>

            {message && (
              <div
                className={`notice ${
                  activeContext
                    ? "success"
                    : "warning"
                }`}
                role="status"
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="account-search">
                    School or distributor
                    PartnerKey ID
                  </label>

                  <input
                    id="account-search"
                    name="accountCode"
                    value={accountCode}
                    placeholder="SPK-SC-DL-00003"
                    required
                    onChange={(event) => {
                      setAccountCode(
                        event.target.value,
                      );
                      setMessage("");
                    }}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="reason">
                    Reason
                  </label>

                  <select
                    id="reason"
                    name="reason"
                    value={reason}
                    onChange={(event) =>
                      setReason(
                        event.target.value,
                      )
                    }
                  >
                    <option>
                      Adoption follow-up
                    </option>

                    <option>
                      Order assistance
                    </option>

                    <option>
                      Resource share
                    </option>
                  </select>
                </div>
              </div>

              <button
                className="button form-submit-top"
                type="submit"
              >
                {activeContext
                  ? "Refresh partner context"
                  : "Begin authorised session"}
              </button>
            </form>
          </section>

          <aside className="summary-card">
            <h2>Assigned partners</h2>

            <ul className="summary-list">
              {assignedPartners.map(
                (partner) => (
                  <li key={partner.id}>
                    <span>
                      {partner.name}
                    </span>

                    <strong>
                      {partner.partnerKey}
                    </strong>
                  </li>
                ),
              )}
            </ul>

            <p className="field-help">
              Territory restrictions are
              enforced by the service boundary.
            </p>
          </aside>
        </div>

        {activeContext && (
          <section className="card panel space-top-lg">
            <div className="panel-head">
              <div>
                <p className="eyebrow">
                  Authorised account context
                </p>

                <h2>
                  {
                    activeContext.account
                      .name
                  }
                </h2>
              </div>

              <span className="status success">
                On behalf session active
              </span>
            </div>

            <dl className="detail-meta">
              <div>
                <dt>PartnerKey</dt>
                <dd>
                  {
                    activeContext.account
                      .partnerKey
                  }
                </dd>
              </div>

              <div>
                <dt>Account type</dt>
                <dd>
                  {
                    activeContext.account
                      .type
                  }
                </dd>
              </div>

              <div>
                <dt>Territory</dt>
                <dd>
                  {
                    activeContext.account
                      .territory
                  }
                </dd>
              </div>

              <div>
                <dt>Reason</dt>
                <dd>
                  {activeContext.reason}
                </dd>
              </div>
            </dl>

            <div className="actions-row">
              <Link
                className="button"
                to="/app/catalog"
              >
                Open catalogue
              </Link>

              <Link
                className="button secondary"
                to="/cart"
              >
                Prepare cart
              </Link>

              <Link
                className="button secondary"
                to="/app/digital-resources/request"
              >
                Resource share
              </Link>
            </div>

            <div className="notice neutral">
              <strong>
                Actor accountability:
              </strong>{" "}
              actions performed in this session
              must keep both the internal sales
              actor and customer account
              identity.
            </div>
          </section>
        )}

        {role === "SALES_MANAGER" && (
          <div className="sales-manager-grid space-top-lg">
            <section className="card panel">
              <div className="panel-head">
                <div>
                  <p className="eyebrow">
                    Manager visibility
                  </p>

                  <h2>
                    Territory activity
                  </h2>
                </div>

                <Link
                  className="text-link"
                  to="/sales/accounts"
                >
                  View accounts →
                </Link>
              </div>

              <div className="table-scroll">
                <table className="control-table">
                  <thead>
                    <tr>
                      <th>Account</th>
                      <th>Activity</th>
                      <th>Owner</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {demoActivity.map(
                      (item) => (
                        <tr key={item.id}>
                          <td>
                            <strong>
                              {
                                item.accountName
                              }
                            </strong>
                          </td>

                          <td>
                            {item.action}
                          </td>

                          <td>
                            {item.owner}
                          </td>

                          <td>
                            <span className="status neutral">
                              {item.status
                                .replaceAll(
                                  "_",
                                  " ",
                                )}
                            </span>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <aside className="card panel">
              <div className="panel-head">
                <h2>
                  Manager controls
                </h2>
              </div>

              <ul className="check-list">
                <li>
                  Review assigned territory
                  accounts
                </li>

                <li>
                  Support representatives with
                  partner follow-up
                </li>

                <li>
                  Work on behalf of authorised
                  accounts
                </li>

                <li>
                  Create sample and commercial
                  requests within policy
                </li>

                <li>
                  Share digital resources within
                  verified account scope
                </li>
              </ul>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}

export default SalesManagerDashboardPage;