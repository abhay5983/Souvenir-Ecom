import { Link, useParams } from "react-router-dom";

import { controlOrders } from "../../data/controlCentreData.js";

function formatValue(value) {
  return String(value ?? "—")
    .replaceAll("_", " ")
    .toLocaleLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toLocaleUpperCase(),
    );
}

function ControlOrderDetailPage() {
  const { recordId } = useParams();

  const order = controlOrders.find(
    (item) => item.id === recordId,
  );

  if (!order) {
    return (
      <section className="portal-main control-main">
        <div className="container">
          <div className="empty-state">
            <p className="eyebrow">
              Control Centre
            </p>

            <h1>Order not found</h1>

            <p>
              The requested order or sample
              record could not be found.
            </p>

            <Link
              className="button"
              to="/control/orders"
            >
              Back to orders
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="portal-main control-main">
      <div className="container">
        <nav
          className="breadcrumbs"
          aria-label="Breadcrumb"
        >
          <Link to="/control">
            Control Centre
          </Link>

          <span>/</span>

          <Link to="/control/orders">
            Orders
          </Link>

          <span>/</span>

          <span>{order.id}</span>
        </nav>

        <div className="control-titlebar">
          <div>
            <p className="eyebrow">
              Order operations
            </p>

            <h1>{order.id}</h1>

            <p>{order.accountName}</p>
          </div>

          <span className="status warning">
            {formatValue(order.status)}
          </span>
        </div>

        <div className="dashboard-grid">
          <section className="card panel">
            <div className="panel-head">
              <h2>Record details</h2>
            </div>

            <dl className="detail-meta">
              <div>
                <dt>Reference</dt>
                <dd>{order.id}</dd>
              </div>

              <div>
                <dt>Account</dt>
                <dd>{order.accountName}</dd>
              </div>

              <div>
                <dt>Record type</dt>
                <dd>{formatValue(order.type)}</dd>
              </div>

              <div>
                <dt>Lines</dt>
                <dd>{order.lines}</dd>
              </div>

              <div>
                <dt>Units</dt>
                <dd>{order.units}</dd>
              </div>

              <div>
                <dt>Created</dt>
                <dd>{order.createdAt}</dd>
              </div>

              <div>
                <dt>Status</dt>
                <dd>{formatValue(order.status)}</dd>
              </div>
            </dl>
          </section>

          <aside className="card panel">
            <div className="panel-head">
              <h2>Available actions</h2>
            </div>

            <div className="stack-actions">
              <Link
                className="button"
                to="/control/approvals"
              >
                Open approval queue
              </Link>

              <Link
                className="button secondary"
                to="/control/inventory"
              >
                View fulfilment
              </Link>

              <Link
                className="text-link"
                to="/control/orders"
              >
                Back to all orders →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default ControlOrderDetailPage;