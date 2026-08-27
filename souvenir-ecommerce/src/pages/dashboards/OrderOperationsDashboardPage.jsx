import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const demoOrders = [
  {
    id: "ORDER-DEMO-104",
    reference: "ORD-SV-1042",
    account: "Greenfield Academy",
    source: "Coordinator back office",
    lines: 1,
    status: "AWAITING_CLIENT_CONFIRMATION",
    customerStatus: "Awaiting Your Confirmation",
  },
  {
    id: "ORDER-DEMO-105",
    reference: "ORD-SV-1045",
    account: "North Star Educational Distributors",
    source: "Client self service",
    lines: 1,
    status: "READY_FOR_INVENTORY",
    customerStatus: "Approved for Fulfilment",
  },
  {
    id: "ORDER-DEMO-106",
    reference: "ORD-SV-1048",
    account: "Sunrise Public School",
    source: "Coordinator back office",
    lines: 1,
    status: "PACKED",
    customerStatus: "Packing & Shipping",
  },
];

const demoSamples = [
  {
    id: "SAMPLE-DEMO-101",
    reference: "SMP-SV-1001",
    account: "Greenfield Academy",
    lines: 2,
    status: "SUBMITTED",
  },
];

function formatStatus(value) {
  return String(value ?? "")
    .replaceAll("_", " ")
    .toLocaleLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toLocaleUpperCase(),
    );
}

function OrderOperationsDashboardPage() {
  const { user, role } = useAuth();

  const awaitingConfirmation =
    demoOrders.filter(
      (order) =>
        order.status ===
        "AWAITING_CLIENT_CONFIRMATION",
    ).length;

  const underReview =
    demoOrders.filter((order) =>
      [
        "SUBMITTED",
        "PENDING_COORDINATOR_REVIEW",
        "PENDING_HEAD_APPROVAL",
        "CLARIFICATION_REQUIRED",
      ].includes(order.status),
    ).length;

  const readyForFulfilment =
    demoOrders.filter((order) =>
      [
        "READY_FOR_INVENTORY",
        "PARTIALLY_READY_FOR_INVENTORY",
      ].includes(order.status),
    ).length;

  const packed =
    demoOrders.filter(
      (order) =>
        order.status === "PACKED",
    ).length;

  return (
    <section className="portal-main">
      <div className="container">
        <div className="dashboard-head">
          <div>
            <p className="eyebrow">
              Operations overview
            </p>

            <h1>
              Order operations dashboard
            </h1>

            <p>
              Review account-owned orders and
              samples, track customer
              confirmation, and move approved
              records into the correct
              operational queue.
            </p>

            <p className="field-help">
              Signed in as{" "}
              {user?.name ??
                "Order Operations"}{" "}
              · {role}
            </p>
          </div>

          <Link
            className="button"
            to="/admin/orders"
          >
            Open primary queue
          </Link>
        </div>

        <div className="kpi-grid">
          <article className="card stat-card">
            <span className="meta">
              Order records
            </span>

            <div className="value">
              {demoOrders.length}
            </div>

            <p>
              Current operational orders
            </p>
          </article>

          <article className="card stat-card">
            <span className="meta">
              Awaiting client
            </span>

            <div className="value">
              {awaitingConfirmation}
            </div>

            <p>
              Customer confirmation required
            </p>
          </article>

          <article className="card stat-card">
            <span className="meta">
              Under review
            </span>

            <div className="value">
              {underReview}
            </div>

            <p>
              Approval or clarification queue
            </p>
          </article>

          <article className="card stat-card">
            <span className="meta">
              Ready for fulfilment
            </span>

            <div className="value">
              {readyForFulfilment}
            </div>

            <p>
              Stock-reserved records
            </p>
          </article>
        </div>

        <div className="control-grid space-top-lg">
          <section className="card panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow">
                  Priority queues
                </p>

                <h2>
                  Order operations
                </h2>
              </div>

              <Link
                className="text-link"
                to="/admin/orders"
              >
                View all →
              </Link>
            </div>

            <div className="queue-list">
              <Link to="/admin/orders?status=awaiting-client">
                <span>
                  Awaiting client confirmation
                </span>

                <strong>
                  {awaitingConfirmation}
                </strong>
              </Link>

              <Link to="/admin/orders?status=review">
                <span>
                  Approval and clarification
                </span>

                <strong>
                  {underReview}
                </strong>
              </Link>

              <Link to="/admin/orders?status=fulfilment">
                <span>
                  Ready for inventory
                </span>

                <strong>
                  {readyForFulfilment}
                </strong>
              </Link>

              <Link to="/admin/orders?status=packed">
                <span>
                  Packed records
                </span>

                <strong>
                  {packed}
                </strong>
              </Link>
            </div>
          </section>

          <aside className="card panel">
            <div className="panel-head">
              <h2>
                Operations scope
              </h2>
            </div>

            <ul className="check-list">
              <li>
                Review orders and sample
                requests
              </li>

              <li>
                Track customer-owned records
              </li>

              <li>
                Check client confirmation state
              </li>

              <li>
                Review source and actor context
              </li>

              <li>
                Escalate records requiring
                approval
              </li>

              <li>
                Do not bypass inventory or
                dispatch controls
              </li>
            </ul>
          </aside>
        </div>

        <section className="card panel space-top-lg">
          <div className="panel-head">
            <div>
              <p className="eyebrow">
                Recent records
              </p>

              <h2>
                Orders and samples
              </h2>
            </div>

            <Link
              className="text-link"
              to="/admin/orders"
            >
              Open queue →
            </Link>
          </div>

          <div className="table-scroll">
            <table className="control-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Account</th>
                  <th>Source</th>
                  <th>Lines</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {demoOrders.map(
                  (order) => (
                    <tr key={order.id}>
                      <td>
                        <Link
                          className="text-link"
                          to={`/admin/orders/${order.id}`}
                        >
                          {order.reference}
                        </Link>
                      </td>

                      <td>
                        {order.account}
                      </td>

                      <td>
                        {order.source}
                      </td>

                      <td>
                        {order.lines}
                      </td>

                      <td>
                        <span className="status neutral">
                          {formatStatus(
                            order.status,
                          )}
                        </span>
                      </td>
                    </tr>
                  ),
                )}

                {demoSamples.map(
                  (sample) => (
                    <tr key={sample.id}>
                      <td>
                        <Link
                          className="text-link"
                          to={`/admin/sample-requests/${sample.id}`}
                        >
                          {sample.reference}
                        </Link>
                      </td>

                      <td>
                        {sample.account}
                      </td>

                      <td>
                        Sample request
                      </td>

                      <td>
                        {sample.lines}
                      </td>

                      <td>
                        <span className="status neutral">
                          {formatStatus(
                            sample.status,
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

export default OrderOperationsDashboardPage;