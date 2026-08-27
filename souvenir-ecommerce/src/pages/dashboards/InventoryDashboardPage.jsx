import { useMemo, useState } from "react";

const demoRecords = [
  {
    id: "ORDER-DEMO-105",
    reference: "ORD-SV-1045",
    customerAccountId: "ACC-DIST-001",
    customerName: "North Star Educational Distributors",
    status: "READY_FOR_INVENTORY",
    warehouseId: "WH-NOI",
    version: 3,
    lines: [
      {
        id: "LINE-DEMO-2",
        title: "Oakwood English 4",
        reservedQuantity: 12,
        backorderedQuantity: 0,
      },
    ],
  },
];

function customerStatus(status) {
  if (
    status === "READY_FOR_INVENTORY" ||
    status === "PARTIALLY_READY_FOR_INVENTORY"
  ) {
    return "Approved for Fulfilment";
  }

  if (
    [
      "PACKING_AND_SHIPPING",
      "PACKING_IN_PROGRESS",
      "PARTIALLY_PACKED",
      "PACKED",
    ].includes(status)
  ) {
    return "Packing & Shipping";
  }

  return String(status || "")
    .split("_")
    .map(
      (word) =>
        word.charAt(0) +
        word.slice(1).toLowerCase(),
    )
    .join(" ");
}

function PageHero({ eyebrow, title, body }) {
  return (
    <section className="page-hero">
      <div className="container">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="lede">{body}</p>
      </div>
    </section>
  );
}

function FlashMessage({ flash }) {
  if (!flash) {
    return null;
  }

  return (
    <div
      className={`notice ${flash.tone} flash`}
      role={
        flash.tone === "danger"
          ? "alert"
          : "status"
      }
      tabIndex="-1"
    >
      {flash.message}
    </div>
  );
}

function InventoryFulfilmentPage() {
  const [records, setRecords] =
    useState(demoRecords);

  const [preparedDocument, setPreparedDocument] =
    useState(null);

  const [flash, setFlash] = useState(null);

  const [preparingId, setPreparingId] =
    useState(null);

  const [confirming, setConfirming] =
    useState(false);

  const readyRecords = useMemo(() => {
    return records.filter((record) =>
      [
        "READY_FOR_INVENTORY",
        "PARTIALLY_READY_FOR_INVENTORY",
      ].includes(record.status),
    );
  }, [records]);

  const handlePreparePrint = async (record) => {
    if (preparingId || confirming) {
      return;
    }

    setPreparingId(record.id);
    setFlash(null);

    try {
      /*
       * FRONTEND DEMO ONLY
       *
       * Later replace this with:
       *
       * POST
       * /api/control/fulfilment/:recordId/prepare
       */

      await new Promise((resolve) =>
        setTimeout(resolve, 400),
      );

      const document = {
        id: `DOC-${Date.now()}`,

        documentNumber:
          `FUL-${new Date().getFullYear()}-${String(
            Date.now(),
          ).slice(-6)}`,

        recordId: record.id,

        recordVersion: record.version,

        warehouseId: record.warehouseId,

        version: 1,

        checksum:
          `${record.id}-${record.version}-1`,

        generatedAt:
          new Date().toISOString(),

        /*
         * Temporary demo PDF.
         * Put PDF inside:
         *
         * public/pdf/
         */
        viewUrl:
          "/pdf/souvenir-demo-warehouse-fulfilment-print.pdf",

        downloadUrl:
          "/pdf/souvenir-demo-warehouse-fulfilment-print.pdf",
      };

      setPreparedDocument(document);

      setFlash({
        tone: "success",
        message:
          "Fulfilment document prepared. Review the PDF before starting packing.",
      });
    } catch {
      setPreparedDocument(null);

      setFlash({
        tone: "danger",
        message:
          "The fulfilment document could not be prepared.",
      });
    } finally {
      setPreparingId(null);
    }
  };

  const handleConfirmPacking = async () => {
    if (
      !preparedDocument ||
      confirming
    ) {
      return;
    }

    setConfirming(true);
    setFlash(null);

    try {
      /*
       * Later this must call:
       *
       * POST
       * /api/control/fulfilment/:recordId/start-packing
       *
       * Server will:
       *
       * reserved stock
       *      ↓
       * allocatedToPacking
       *
       * and update:
       *
       * PACKING_AND_SHIPPING
       */

      await new Promise((resolve) =>
        setTimeout(resolve, 500),
      );

      let confirmedRecord = null;

      setRecords((current) =>
        current.map((record) => {
          if (
            record.id !==
            preparedDocument.recordId
          ) {
            return record;
          }

          confirmedRecord = {
            ...record,

            status:
              "PACKING_AND_SHIPPING",

            version:
              Number(record.version || 0) + 1,

            fulfilmentJobId:
              `FUL-${Date.now()}`,

            lines: record.lines.map(
              (line) => ({
                ...line,

                status:
                  "PACKING_AND_SHIPPING",
              }),
            ),
          };

          return confirmedRecord;
        }),
      );

      setPreparedDocument(null);

      setFlash({
        tone: "success",

        message:
          `${
            confirmedRecord?.reference ||
            "Order"
          } moved to Packing & Shipping. Reserved stock was allocated exactly once.`,
      });
    } catch {
      setFlash({
        tone: "danger",
        message:
          "Packing could not be started.",
      });
    } finally {
      setConfirming(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Inventory Fulfilment Desk"
        title="Prepare fulfilment and start packing"
        body="Preparing a document does not change status. The explicit first confirmation converts reservations to packing allocation exactly once."
      />

      <section className="section compact">
        <div className="container">

          <FlashMessage flash={flash} />

          {preparedDocument && (
            <section
              className="card print-confirmation"
              aria-labelledby="prepared-document-title"
            >
              <div>
                <span className="status warning">
                  Confirmation required
                </span>

                <h2 id="prepared-document-title">
                  Fulfilment document{" "}
                  {preparedDocument.documentNumber}
                  {" "}is ready
                </h2>

                <p>
                  Version{" "}
                  {preparedDocument.version}
                  {" · "}
                  Warehouse{" "}
                  {preparedDocument.warehouseId}
                  {" · "}
                  Checksum{" "}
                  {preparedDocument.checksum}
                </p>
              </div>

              <div className="notice warning">
                <strong>
                  Consequence:
                </strong>{" "}
                confirming this document creates
                the first print event, converts
                reserved stock to packing
                allocation and changes the
                client-visible status to Packing
                &amp; Shipping.
              </div>

              <div className="actions-row">

                <a
                  className="button secondary"
                  href={
                    preparedDocument.viewUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Fulfilment PDF
                </a>

                <a
                  className="button ghost"
                  href={
                    preparedDocument.downloadUrl
                  }
                  download
                >
                  Download PDF
                </a>

                <button
                  className="button"
                  type="button"
                  disabled={confirming}
                  onClick={
                    handleConfirmPacking
                  }
                >
                  {confirming
                    ? "Starting Packing..."
                    : "Confirm Print & Start Packing"}
                </button>
              </div>
            </section>
          )}

          {readyRecords.length ? (
            <div className="fulfilment-grid">
              {readyRecords.map(
                (record) => (
                  <article
                    key={record.id}
                    className="card fulfilment-card"
                  >
                    <div>
                      <span className="status success">
                        {customerStatus(
                          record.status,
                        )}
                      </span>

                      <h2>
                        {record.reference}
                      </h2>

                      <p>
                        {record.customerName ||
                          record.customerAccountId}
                        {" · "}
                        {record.warehouseId ||
                          "Unassigned"}
                      </p>
                    </div>

                    <ul>
                      {record.lines.map(
                        (line) => (
                          <li key={line.id}>

                            <span>
                              {line.title}
                            </span>

                            <strong>
                              {
                                line.reservedQuantity
                              }{" "}
                              reserved

                              {line.backorderedQuantity >
                              0
                                ? ` · ${line.backorderedQuantity} backordered`
                                : ""}
                            </strong>

                          </li>
                        ),
                      )}
                    </ul>

                    <button
                      className="button secondary"
                      type="button"
                      disabled={
                        preparingId !==
                          null ||
                        confirming
                      }
                      onClick={() =>
                        handlePreparePrint(
                          record,
                        )
                      }
                    >
                      {preparingId ===
                      record.id
                        ? "Preparing..."
                        : "Prepare Fulfilment Print"}
                    </button>
                  </article>
                ),
              )}
            </div>
          ) : (
            <div className="empty-state">

              <h2>
                No records ready for print
                preparation
              </h2>

              <p>
                Approved and stock-reserved
                records appear here.
              </p>

            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default InventoryFulfilmentPage;