import {
  Link,
  useParams,
} from "react-router-dom";

import {
  CONTROL_RESOURCES,
} from "../../config/controlResources.js";

function formatValue(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  if (typeof value === "number") {
    return String(value);
  }

  return String(value)
    .replaceAll("_", " ")
    .toLocaleLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toLocaleUpperCase(),
    );
}

function statusClass(value) {
  const normalized = String(value ?? "")
    .toLocaleUpperCase();

  if (
    normalized.includes("ACTIVE") ||
    normalized.includes("APPROVED") ||
    normalized.includes("AVAILABLE") ||
    normalized.includes("COMPLETED") ||
    normalized.includes("DISPATCHED")
  ) {
    return "success";
  }

  if (
    normalized.includes("PENDING") ||
    normalized.includes("REVIEW") ||
    normalized.includes("LOW") ||
    normalized.includes("PRESS")
  ) {
    return "warning";
  }

  return "neutral";
}

function ControlRecordDetailPage({
  resourceType,
}) {
  const params = useParams();

  const resource =
    CONTROL_RESOURCES[resourceType];

  if (!resource) {
    return (
      <section className="portal-main">
        <div className="container">
          <div className="empty-state">
            <h1>
              Resource configuration missing
            </h1>
          </div>
        </div>
      </section>
    );
  }

  const recordId =
    params[
      resource.parameterName ??
        "recordId"
    ];

  const record = resource.records.find(
    (item) => item.id === recordId,
  );

  if (!record) {
    return (
      <section className="portal-main control-main">
        <div className="container">
          <div className="empty-state">
            <p className="eyebrow">
              Souvenir Control Centre
            </p>

            <h1>
              {resource.title} not found
            </h1>

            <p>
              The requested record does not
              exist in the current frontend
              data.
            </p>

            <Link
              className="button"
              to={resource.listPath}
            >
              Back to {resource.listTitle}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const statusField =
    resource.fields.find(
      (field) =>
        field.type === "status",
    );

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

          <Link to={resource.listPath}>
            {resource.listTitle}
          </Link>

          <span>/</span>

          <span>{record.id}</span>
        </nav>

        <div className="control-titlebar">
          <div>
            <p className="eyebrow">
              Souvenir Control Centre
            </p>

            <h1>{record.id}</h1>

            <p>{resource.title}</p>
          </div>

          {statusField && (
            <span
              className={`status ${statusClass(
                record[statusField.key],
              )}`}
            >
              {formatValue(
                record[statusField.key],
              )}
            </span>
          )}
        </div>

        <div className="dashboard-grid">
          <section className="card panel">
            <div className="panel-head">
              <h2>Record details</h2>

              <span className="status neutral">
                {resource.title}
              </span>
            </div>

            <dl className="detail-meta">
              {resource.fields.map(
                (field) => (
                  <div key={field.key}>
                    <dt>{field.label}</dt>

                    <dd>
                      {field.type ===
                      "status" ? (
                        <span
                          className={`status ${statusClass(
                            record[field.key],
                          )}`}
                        >
                          {formatValue(
                            record[field.key],
                          )}
                        </span>
                      ) : (
                        formatValue(
                          record[field.key],
                        )
                      )}
                    </dd>
                  </div>
                ),
              )}
            </dl>
          </section>

          <aside className="card panel">
            <div className="panel-head">
              <h2>Available actions</h2>
            </div>

            <div className="stack-actions">
              <Link
                className="button secondary"
                to={resource.listPath}
              >
                Back to list
              </Link>

              {resourceType === "orders" && (
                <>
                  <Link
                    className="button"
                    to="/control/approvals"
                  >
                    Open approvals
                  </Link>

                  <Link
                    className="text-link"
                    to="/control/inventory"
                  >
                    View fulfilment →
                  </Link>
                </>
              )}

              {resourceType ===
                "dispatch" && (
                <Link
                  className="text-link"
                  to="/control/audit"
                >
                  View dispatch activity →
                </Link>
              )}

              {resourceType ===
                "accounts" && (
                <Link
                  className="text-link"
                  to="/control/orders"
                >
                  View account records →
                </Link>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default ControlRecordDetailPage;