import { Link } from "react-router-dom";

function formatValue(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  return String(value)
    .replaceAll("_", " ")
    .toLocaleLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toLocaleUpperCase(),
    );
}

function statusClass(value) {
  const normalized = String(value)
    .toLocaleUpperCase();

  if (
    normalized.includes("ACTIVE") ||
    normalized.includes("AVAILABLE") ||
    normalized.includes("COMPLETED") ||
    normalized.includes("DISPATCHED") ||
    normalized.includes("APPROVED")
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

function ControlQueuePage({
  eyebrow = "Souvenir Control Centre",
  title,
  description,
  action,
  stats = [],
  columns,
  records,
  detailBasePath,
  emptyTitle = "No records found",
  emptyDescription =
    "There are no records in this queue.",
}) {
  return (
    <section className="portal-main control-main">
      <div className="container">
        <div className="control-titlebar">
          <div>
            <p className="eyebrow">
              {eyebrow}
            </p>

            <h1>{title}</h1>

            <p>{description}</p>
          </div>

          {action && (
            <Link
              className="button"
              to={action.to}
            >
              {action.label}
            </Link>
          )}
        </div>

        {stats.length > 0 && (
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
        )}

        <section className="card panel control-table-panel">
          <div className="panel-head">
            <h2>{title}</h2>

            <span className="status neutral">
              {records.length} records
            </span>
          </div>

          {records.length === 0 ? (
            <div className="empty-state">
              <h2>{emptyTitle}</h2>

              <p>{emptyDescription}</p>
            </div>
          ) : (
            <div className="table-scroll">
              <table className="control-table">
                <thead>
                  <tr>
                    {columns.map((column) => (
                      <th key={column.key}>
                        {column.label}
                      </th>
                    ))}

                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {records.map((record) => (
                    <tr key={record.id}>
                      {columns.map((column) => {
                        const value =
                          record[column.key];

                        if (
                          column.type ===
                          "status"
                        ) {
                          return (
                            <td key={column.key}>
                              <span
                                className={`status ${statusClass(
                                  value,
                                )}`}
                              >
                                {formatValue(
                                  value,
                                )}
                              </span>
                            </td>
                          );
                        }

                        return (
                          <td key={column.key}>
                            {column.strong ? (
                              <strong>
                                {formatValue(
                                  value,
                                )}
                              </strong>
                            ) : (
                              formatValue(value)
                            )}
                          </td>
                        );
                      })}

                      <td>
                        <Link
                          className="text-link"
                          to={`${record.id}`}
                        >
                          Open →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

export default ControlQueuePage;