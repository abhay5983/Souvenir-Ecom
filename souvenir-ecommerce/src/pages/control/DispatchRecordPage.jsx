import {
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";

import {
  controlDispatch,
} from "../../data/controlCentreData.js";

function DispatchRecordPage() {
  const { recordId } = useParams();
  const navigate = useNavigate();

  const { user, role } = useAuth();

  const record = useMemo(
    () =>
      controlDispatch.find(
        (item) =>
          item.id === recordId,
      ),
    [recordId],
  );

  const [form, setForm] = useState({
    transporter: "",
    consignmentNumber: "",
    packageCount:
      record?.packages ?? 1,
    trackingUrl: "",
    notes: "",
  });

  const [error, setError] =
    useState("");

  const [submitted, setSubmitted] =
    useState(false);

  if (!record) {
    return (
      <section className="portal-main control-main">
        <div className="container">
          <div className="empty-state">
            <h1>
              Dispatch record not found
            </h1>

            <Link
              className="button"
              to="/control/dispatch"
            >
              Back to dispatch
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const allowed =
    role === "DISPATCH" ||
    role === "SUPER_ADMIN";

  const ready =
    record.status ===
    "READY_FOR_DISPATCH";

  function updateField(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!allowed) {
      setError(
        "Only an authorised Dispatch identity can create a shipment.",
      );

      return;
    }

    if (!ready) {
      setError(
        "Only a packed record can be dispatched.",
      );

      return;
    }

    if (!form.transporter.trim()) {
      setError(
        "Transporter is required.",
      );

      return;
    }

    if (
      !form.consignmentNumber.trim()
    ) {
      setError(
        "Consignment number is required.",
      );

      return;
    }

    if (
      Number(form.packageCount) < 1
    ) {
      setError(
        "Package count must be at least one.",
      );

      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <section className="portal-main control-main">
        <div className="container">
          <div className="card checkout-card checkout-complete">
            <span className="success-mark">
              ✓
            </span>

            <p className="eyebrow">
              Shipment created
            </p>

            <h1>
              Dispatch recorded successfully
            </h1>

            <p>
              {record.record} was dispatched
              via {form.transporter}.
            </p>

            <dl className="success-summary">
              <div>
                <dt>
                  Consignment number
                </dt>

                <dd>
                  {form.consignmentNumber}
                </dd>
              </div>

              <div>
                <dt>Packages</dt>

                <dd>
                  {form.packageCount}
                </dd>
              </div>

              <div>
                <dt>Warehouse</dt>

                <dd>
                  {user?.warehouseIds?.[0] ??
                    "WH-NOI"}
                </dd>
              </div>
            </dl>

            <button
              className="button"
              type="button"
              onClick={() =>
                navigate(
                  "/control/dispatch",
                )
              }
            >
              Return to dispatch
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="portal-main control-main">
      <div className="container">
        <nav className="breadcrumbs">
          <Link to="/control/dispatch">
            Dispatch
          </Link>

          <span>/</span>

          <span>{record.id}</span>
        </nav>

        <div className="control-titlebar">
          <div>
            <p className="eyebrow">
              Dispatch operations
            </p>

            <h1>{record.id}</h1>

            <p>
              {record.accountName} ·{" "}
              {record.destination}
            </p>
          </div>

          <span className="status warning">
            {record.status
              .replaceAll("_", " ")}
          </span>
        </div>

        <div className="form-shell">
          <form
            className="form-card"
            onSubmit={handleSubmit}
          >
            <div className="panel-head">
              <h2>Create shipment</h2>
            </div>

            {error && (
              <div
                className="notice danger"
                role="alert"
              >
                {error}
              </div>
            )}

            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="transporter">
                  Transporter
                </label>

                <input
                  id="transporter"
                  value={form.transporter}
                  placeholder="Transport company"
                  onChange={(event) =>
                    updateField(
                      "transporter",
                      event.target.value,
                    )
                  }
                />
              </div>

              <div className="form-field">
                <label htmlFor="consignment">
                  Consignment number
                </label>

                <input
                  id="consignment"
                  value={
                    form.consignmentNumber
                  }
                  onChange={(event) =>
                    updateField(
                      "consignmentNumber",
                      event.target.value,
                    )
                  }
                />
              </div>

              <div className="form-field">
                <label htmlFor="package-count">
                  Package count
                </label>

                <input
                  id="package-count"
                  type="number"
                  min="1"
                  value={form.packageCount}
                  onChange={(event) =>
                    updateField(
                      "packageCount",
                      event.target.value,
                    )
                  }
                />
              </div>

              <div className="form-field">
                <label htmlFor="tracking-url">
                  Tracking URL
                </label>

                <input
                  id="tracking-url"
                  type="url"
                  value={form.trackingUrl}
                  onChange={(event) =>
                    updateField(
                      "trackingUrl",
                      event.target.value,
                    )
                  }
                />
              </div>

              <div className="form-field full">
                <label htmlFor="dispatch-notes">
                  Dispatch notes
                </label>

                <textarea
                  id="dispatch-notes"
                  value={form.notes}
                  onChange={(event) =>
                    updateField(
                      "notes",
                      event.target.value,
                    )
                  }
                />
              </div>
            </div>

            <div className="wizard-actions">
              <Link
                className="button secondary"
                to="/control/dispatch"
              >
                Cancel
              </Link>

              <button
                className="button"
                type="submit"
                disabled={!ready}
              >
                Create shipment
              </button>
            </div>
          </form>

          <aside className="summary-card">
            <h2>Shipment summary</h2>

            <dl className="detail-meta">
              <div>
                <dt>Order</dt>
                <dd>{record.record}</dd>
              </div>

              <div>
                <dt>Account</dt>
                <dd>
                  {record.accountName}
                </dd>
              </div>

              <div>
                <dt>Destination</dt>
                <dd>
                  {record.destination}
                </dd>
              </div>

              <div>
                <dt>Packages</dt>
                <dd>
                  {record.packages}
                </dd>
              </div>

              <div>
                <dt>Warehouse</dt>
                <dd>
                  {user?.warehouseIds?.[0] ??
                    "WH-NOI"}
                </dd>
              </div>
            </dl>

            <div className="notice warning">
              Shipment creation is final in
              this frontend flow. Production
              will use an idempotency key and
              record version check.
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default DispatchRecordPage;