import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";

import {
  controlDispatch,
  controlOrders,
} from "../../data/controlCentreData.js";

function formatStatus(value) {
  return String(value ?? "")
    .replaceAll("_", " ")
    .toLocaleLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toLocaleUpperCase(),
    );
}

function DispatchDashboardPage() {
  const { user } = useAuth();

  const packedRecords = controlOrders.filter(
    (record) =>
      record.status === "PACKED" ||
      record.status === "READY_FOR_DISPATCH",
  );

  const dispatchedRecords =
    controlDispatch.filter(
      (record) =>
        record.status === "DISPATCHED",
    );

  const readyRecords =
    controlDispatch.filter(
      (record) =>
        record.status ===
        "READY_FOR_DISPATCH",
    );

  const totalPackages =
    controlDispatch.reduce(
      (total, record) =>
        total +
        Number(record.packages ?? 0),
      0,
    );

  return (
    <section className="portal-main control-main">
      <div className="container">
        <div className="control-titlebar">
          <div>
            <p className="eyebrow">
              Souvenir Control Centre
            </p>

            <h1>Dispatch Desk</h1>

            <p>
              Authorised Access. Accountable
              Action. ·{" "}
              {user?.controlKeyId ??
                "SCK-DSP-NOI-0004"}
            </p>
          </div>

          <span className="status success">
            Dispatch identity active
          </span>
        </div>

        <div className="kpi-grid">
          <article className="card stat-card">
            <span className="meta">
              Ready for dispatch
            </span>

            <div className="value">
              {readyRecords.length ||
                packedRecords.length}
            </div>

            <p>Packed operational records</p>
          </article>

          <article className="card stat-card">
            <span className="meta">
              Dispatched
            </span>

            <div className="value">
              {dispatchedRecords.length}
            </div>

            <p>Carrier handover complete</p>
          </article>

          <article className="card stat-card">
            <span className="meta">
              Packages
            </span>

            <div className="value">
              {totalPackages}
            </div>

            <p>Across dispatch records</p>
          </article>

          <article className="card stat-card">
            <span className="meta">
              Warehouse
            </span>

            <div className="value small-value">
              {user?.warehouseIds?.[0] ??
                "WH-NOI"}
            </div>

            <p>Assigned dispatch location</p>
          </article>
        </div>

        <div className="control-grid">
          <section className="card panel">
            <div className="panel-head">
              <div>
                <h2>
                  Packed records awaiting
                  dispatch
                </h2>

                <p>
                  Only records assigned to your
                  warehouse can be dispatched.
                </p>
              </div>

              <Link
                className="text-link"
                to="/control/dispatch"
              >
                View all →
              </Link>
            </div>

            {readyRecords.length > 0 ? (
              <div className="queue-list">
                {readyRecords.map((record) => (
                  <Link
                    key={record.id}
                    to={`/control/dispatch/${record.id}`}
                  >
                    <span>
                      <strong>
                        {record.id}
                      </strong>

                      <small>
                        {record.accountName}
                        <br />
                        {record.destination}
                      </small>
                    </span>

                    <strong>
                      {record.packages}
                    </strong>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty-state compact-empty">
                <h3>
                  No packed records are waiting
                </h3>

                <p>
                  Records appear here after
                  inventory and packing are
                  complete.
                </p>
              </div>
            )}
          </section>

          <aside className="card panel">
            <div className="panel-head">
              <h2>Dispatch controls</h2>
            </div>

            <ul className="check-list">
              <li>
                Record must be packed
              </li>

              <li>
                Record warehouse must match
                your assigned warehouse
              </li>

              <li>
                Transporter is required
              </li>

              <li>
                Consignment number is required
              </li>

              <li>
                Package count must be at least
                one
              </li>
            </ul>

            <div className="notice warning">
              <strong>
                Dispatch cannot change stock or
                approval decisions.
              </strong>

              <p>
                Dispatch may only create the
                shipment after warehouse packing
                is complete.
              </p>
            </div>
          </aside>
        </div>

        <section className="card panel space-top-lg">
          <div className="panel-head">
            <h2>Recent dispatch activity</h2>

            <Link
              className="text-link"
              to="/control/audit"
            >
              Open activity →
            </Link>
          </div>

          <div className="table-scroll">
            <table className="control-table">
              <thead>
                <tr>
                  <th>Dispatch ID</th>
                  <th>Order</th>
                  <th>Account</th>
                  <th>Destination</th>
                  <th>Packages</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {controlDispatch.map(
                  (record) => (
                    <tr key={record.id}>
                      <td>
                        <Link
                          className="text-link"
                          to={`/control/dispatch/${record.id}`}
                        >
                          {record.id}
                        </Link>
                      </td>

                      <td>{record.record}</td>

                      <td>
                        {record.accountName}
                      </td>

                      <td>
                        {record.destination}
                      </td>

                      <td>
                        {record.packages}
                      </td>

                      <td>
                        <span
                          className={`status ${
                            record.status ===
                            "DISPATCHED"
                              ? "success"
                              : "warning"
                          }`}
                        >
                          {formatStatus(
                            record.status,
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
      </div>
    </section>
  );
}

export default DispatchDashboardPage;