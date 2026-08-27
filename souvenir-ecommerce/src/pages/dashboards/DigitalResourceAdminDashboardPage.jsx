import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const demoDigitalRequests = [
  {
    id: "DLR-2026-000001",
    requester: "Greenfield Academy",
    series: "Oakwood English",
    classes: "Class 4",
    resources: "E-Book, Answer Key",
    status: "SUBMITTED",
  },
  {
    id: "DLR-2026-000002",
    requester: "Sunrise Public School",
    series: "Explorer Science",
    classes: "Class 6",
    resources: "Video, Quiz",
    status: "UNDER_REVIEW",
  },
  {
    id: "DLR-2026-000003",
    requester: "North Star Educational Distributors",
    series: "ICSE Steps to Mathematics",
    classes: "Class 7",
    resources: "Question Paper Generator",
    status: "PARTIALLY_APPROVED",
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

function DigitalResourceAdminDashboardPage() {
  const { user } = useAuth();

  const submittedCount =
    demoDigitalRequests.filter(
      (item) => item.status === "SUBMITTED",
    ).length;

  const underReviewCount =
    demoDigitalRequests.filter(
      (item) =>
        item.status === "UNDER_REVIEW",
    ).length;

  const approvedCount =
    demoDigitalRequests.filter((item) =>
      [
        "APPROVED",
        "PARTIALLY_APPROVED",
      ].includes(item.status),
    ).length;

  const totalRequests =
    demoDigitalRequests.length;

  return (
    <section className="portal-main">
      <div className="container">
        <div className="dashboard-head">
          <div>
            <p className="eyebrow">
              Operations overview
            </p>

            <h1>
              Digital resource administrator dashboard
            </h1>

            <p>
              Review public and partner digital-resource
              requests while preserving role, series,
              class and licence controls.
            </p>

            <p className="field-help">
              Signed in as{" "}
              {user?.name ??
                "Digital Resource Administrator"}
            </p>
          </div>

          <Link
            className="button"
            to="/admin/digital-resource-requests"
          >
            Open primary queue
          </Link>
        </div>

        <div className="kpi-grid">
          <article className="card stat-card">
            <span className="meta">
              Digital requests
            </span>

            <div className="value">
              {totalRequests}
            </div>

            <p>
              Current review records
            </p>
          </article>

          <article className="card stat-card">
            <span className="meta">
              Newly submitted
            </span>

            <div className="value">
              {submittedCount}
            </div>

            <p>
              Waiting for review
            </p>
          </article>

          <article className="card stat-card">
            <span className="meta">
              Under review
            </span>

            <div className="value">
              {underReviewCount}
            </div>

            <p>
              Verification in progress
            </p>
          </article>

          <article className="card stat-card">
            <span className="meta">
              Approved
            </span>

            <div className="value">
              {approvedCount}
            </div>

            <p>
              Full or partial approval
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
                  Digital request review
                </h2>
              </div>

              <Link
                className="text-link"
                to="/admin/digital-resource-requests"
              >
                View all →
              </Link>
            </div>

            <div className="queue-list">
              <Link to="/admin/digital-resource-requests?status=submitted">
                <span>
                  New public requests
                </span>

                <strong>
                  {submittedCount}
                </strong>
              </Link>

              <Link to="/admin/digital-resource-requests?status=review">
                <span>
                  Verification in progress
                </span>

                <strong>
                  {underReviewCount}
                </strong>
              </Link>

              <Link to="/admin/digital-resource-requests?status=approved">
                <span>
                  Approved or partially approved
                </span>

                <strong>
                  {approvedCount}
                </strong>
              </Link>

              <Link to="/admin/digital-resource-requests">
                <span>
                  All digital requests
                </span>

                <strong>
                  {totalRequests}
                </strong>
              </Link>
            </div>
          </section>

          <aside className="card panel">
            <div className="panel-head">
              <h2>
                Access policy
              </h2>
            </div>

            <ul className="check-list">
              <li>
                Verify requester role
              </li>

              <li>
                Check selected series and class
              </li>

              <li>
                Restrict Teacher’s Tools
              </li>

              <li>
                Review Answer Key and assessment access
              </li>

              <li>
                Confirm offline smart-board fulfilment
              </li>

              <li>
                No automatic entitlement on submission
              </li>
            </ul>
          </aside>
        </div>

        <section className="card panel space-top-lg">
          <div className="panel-head">
            <div>
              <p className="eyebrow">
                Recent requests
              </p>

              <h2>
                Digital learning review queue
              </h2>
            </div>

            <Link
              className="text-link"
              to="/admin/digital-resource-requests"
            >
              Open queue →
            </Link>
          </div>

          <div className="table-scroll">
            <table className="control-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Requester</th>
                  <th>Series</th>
                  <th>Class</th>
                  <th>Resources</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {demoDigitalRequests.map(
                  (request) => (
                    <tr key={request.id}>
                      <td>
                        <Link
                          className="text-link"
                          to={`/admin/digital-resource-requests/${request.id}`}
                        >
                          {request.id}
                        </Link>
                      </td>

                      <td>
                        {request.requester}
                      </td>

                      <td>
                        {request.series}
                      </td>

                      <td>
                        {request.classes}
                      </td>

                      <td>
                        {request.resources}
                      </td>

                      <td>
                        <span className="status neutral">
                          {formatStatus(
                            request.status,
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

export default DigitalResourceAdminDashboardPage;