import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";

import {
  findFulfilmentRecord,
  reprintFulfilmentDocument,
  updatePacking,
} from "../../services/fulfilmentService.js";

function actorFromAuth(
  user,
  role,
) {
  return {
    actorUserId:
      user?.id ??
      `demo-${String(role)
        .toLocaleLowerCase()
        .replaceAll("_", "-")}`,

    role,

    warehouseIds:
      user?.warehouseIds ??
      ["WH-NOI"],
  };
}

function InventoryPackingPage() {
  const { recordId } = useParams();

  const { user, role } = useAuth();

  const [record, setRecord] =
    useState(null);

  const [packed, setPacked] =
    useState({});

  const [reprintReason, setReprintReason] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  function loadRecord() {
    const current =
      findFulfilmentRecord(
        recordId,
      );

    setRecord(current);

    if (current) {
      setPacked(
        Object.fromEntries(
          current.lines.map(
            (line) => [
              line.id,
              line.packedQuantity,
            ],
          ),
        ),
      );
    }
  }

  useEffect(() => {
    loadRecord();
  }, [recordId]);

  if (!record) {
    return (
      <section className="portal-main">
        <div className="container">
          <div className="empty-state">
            <h1>
              Fulfilment record not found
            </h1>

            <Link
              className="button"
              to="/control/inventory"
            >
              Back to fulfilment
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const actor = actorFromAuth(
    user,
    role,
  );

  function updateLine(
    lineId,
    value,
  ) {
    setPacked((current) => ({
      ...current,
      [lineId]:
        Number(value),
    }));

    setError("");
  }

  function handlePackingSubmit(
    event,
  ) {
    event.preventDefault();

    const result = updatePacking(
      actor,
      record.id,
      packed,
      record.version,
    );

    if (!result.ok) {
      setError(
        result.error?.message ??
          "Packing could not be updated.",
      );

      return;
    }

    setRecord(result.value);

    setMessage(
      result.value.status === "PACKED"
        ? "Packing complete. This record is ready for Dispatch."
        : "Packing quantities updated.",
    );

    setError("");
  }

  function handleReprint() {
    const result =
      reprintFulfilmentDocument(
        actor,
        record.id,
        reprintReason,
        crypto.randomUUID(),
      );

    if (!result.ok) {
      setError(
        result.error?.message ??
          "Reprint could not be created.",
      );
      return;
    }

    setMessage(
      `Reprint ${result.value.id} created. Version ${result.value.version}.`,
    );

    setReprintReason("");
    setError("");
  }

  return (
    <section className="portal-main control-main">
      <div className="container">
        <nav className="breadcrumbs">
          <Link to="/control/inventory">
            Fulfilment
          </Link>

          <span>/</span>

          <span>
            {record.reference}
          </span>
        </nav>

        <div className="control-titlebar">
          <div>
            <p className="eyebrow">
              Inventory Fulfilment Desk
            </p>

            <h1>
              {record.reference}
            </h1>

            <p>
              {record.accountName}
              {" · "}
              {record.warehouseId}
            </p>
          </div>

          <span
            className={`status ${
              record.status === "PACKED"
                ? "success"
                : "warning"
            }`}
          >
            {record.status.replaceAll(
              "_",
              " ",
            )}
          </span>
        </div>

        {message && (
          <div className="notice success">
            {message}
          </div>
        )}

        {error && (
          <div
            className="notice danger"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="form-shell">
          <form
            className="form-card"
            onSubmit={
              handlePackingSubmit
            }
          >
            <div className="panel-head">
              <div>
                <p className="eyebrow">
                  Packing
                </p>

                <h2>
                  Update packed quantities
                </h2>
              </div>
            </div>

            <div className="packing-line-list">
              {record.lines.map(
                (line) => (
                  <div
                    key={line.id}
                    className="packing-line"
                  >
                    <div>
                      <strong>
                        {line.title}
                      </strong>

                      <p>
                        {
                          line.reservedQuantity
                        }{" "}
                        allocated to packing
                        {line.backorderedQuantity
                          ? ` · ${line.backorderedQuantity} backordered`
                          : ""}
                      </p>
                    </div>

                    <div className="form-field packing-quantity">
                      <label
                        htmlFor={`packed-${line.id}`}
                      >
                        Packed
                      </label>

                      <input
                        id={`packed-${line.id}`}
                        type="number"
                        min="0"
                        max={
                          line.reservedQuantity
                        }
                        value={
                          packed[line.id] ??
                          0
                        }
                        disabled={
                          record.status ===
                          "PACKED"
                        }
                        onChange={(
                          event,
                        ) =>
                          updateLine(
                            line.id,
                            event.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                ),
              )}
            </div>

            <div className="wizard-actions">
              <Link
                className="button secondary"
                to="/control/inventory"
              >
                Back
              </Link>

              {record.status !==
                "PACKED" && (
                <button
                  className="button"
                  type="submit"
                >
                  Update Packing
                </button>
              )}
            </div>
          </form>

          <aside className="summary-card">
            <h2>
              Fulfilment summary
            </h2>

            <dl className="detail-meta">
              <div>
                <dt>Reference</dt>
                <dd>
                  {record.reference}
                </dd>
              </div>

              <div>
                <dt>Warehouse</dt>
                <dd>
                  {record.warehouseId}
                </dd>
              </div>

              <div>
                <dt>
                  Fulfilment job
                </dt>
                <dd>
                  {record.fulfilmentJobId ??
                    "Not started"}
                </dd>
              </div>

              <div>
                <dt>
                  Record version
                </dt>
                <dd>
                  {record.version}
                </dd>
              </div>
            </dl>

            {record.status ===
              "PACKED" && (
              <div className="notice success">
                <strong>
                  Ready for Dispatch
                </strong>

                <p>
                  All allocated quantities
                  have been packed.
                </p>
              </div>
            )}

            <hr />

            <h3>
              Reprint fulfilment document
            </h3>

            <div className="form-field">
              <label htmlFor="reprint-reason">
                Reprint reason
              </label>

              <textarea
                id="reprint-reason"
                value={reprintReason}
                placeholder="Explain why another copy is required"
                onChange={(event) =>
                  setReprintReason(
                    event.target.value,
                  )
                }
              />
            </div>

            <button
              className="button secondary full-width"
              type="button"
              disabled={
                !reprintReason.trim()
              }
              onClick={handleReprint}
            >
              Create Reprint
            </button>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default InventoryPackingPage;