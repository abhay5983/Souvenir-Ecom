import {
  initialFulfilmentRecords,
  initialWarehouseStock,
} from "../data/fulfilmentData.js";

function clone(value) {
  return JSON.parse(
    JSON.stringify(value),
  );
}

let records = clone(
  initialFulfilmentRecords,
);

let stock = clone(
  initialWarehouseStock,
);

let documents = [];
let printEvents = [];

const idempotency = new Map();

let documentSequence = 1;
let fulfilmentSequence = 1;
let printSequence = 1;

function next(prefix, sequence) {
  return `${prefix}-${String(sequence).padStart(
    5,
    "0",
  )}`;
}

function stale() {
  return {
    ok: false,
    error: {
      code: "STALE_VERSION",
      message:
        "This record has changed. Refresh before continuing.",
    },
  };
}

function canOperateWarehouse(
  actor,
  warehouseId,
) {
  if (
    actor.role === "SUPER_ADMIN" ||
    actor.role ===
      "MANAGEMENT_SUPER_MASTER"
  ) {
    return true;
  }

  return (
    Array.isArray(actor.warehouseIds) &&
    actor.warehouseIds.includes(
      warehouseId,
    )
  );
}

export function listFulfilmentRecords() {
  return clone(records);
}

export function findFulfilmentRecord(
  recordId,
) {
  const record = records.find(
    (item) => item.id === recordId,
  );

  return record ? clone(record) : null;
}

export function listReadyForInventory() {
  return clone(
    records.filter((record) =>
      [
        "READY_FOR_INVENTORY",
        "PARTIALLY_READY_FOR_INVENTORY",
      ].includes(record.status),
    ),
  );
}

export function listPackingRecords() {
  return clone(
    records.filter((record) =>
      [
        "PACKING_AND_SHIPPING",
        "PACKING_IN_PROGRESS",
        "PARTIALLY_PACKED",
        "PACKED",
      ].includes(record.status),
    ),
  );
}

export function prepareFulfilmentPrint(
  actor,
  recordId,
  expectedVersion,
) {
  const record = records.find(
    (item) => item.id === recordId,
  );

  if (!record) {
    return {
      ok: false,
      error: {
        code: "NOT_FOUND",
        message: "Record not found.",
      },
    };
  }

  if (
    record.version !== expectedVersion
  ) {
    return stale();
  }

  if (
    ![
      "READY_FOR_INVENTORY",
      "PARTIALLY_READY_FOR_INVENTORY",
    ].includes(record.status) ||
    !record.warehouseId ||
    !canOperateWarehouse(
      actor,
      record.warehouseId,
    )
  ) {
    return {
      ok: false,
      error: {
        code: "FORBIDDEN",
        message:
          "The record is not ready in an assigned warehouse.",
      },
    };
  }

  const version =
    documents.filter(
      (document) =>
        document.recordId === recordId,
    ).length + 1;

  const document = {
    id: next(
      "DOC",
      documentSequence++,
    ),

    recordId,

    warehouseId:
      record.warehouseId,

    version,

    checksum:
      `${record.id}-${record.version}-${version}`,

    generatedBy:
      actor.actorUserId,

    generatedAt:
      new Date().toISOString(),
  };

  documents.push(document);

  return {
    ok: true,
    value: clone(document),
  };
}

export function confirmPrintAndStartPacking(
  actor,
  recordId,
  documentId,
  idempotencyKey,
  expectedVersion,
) {
  const replay =
    idempotency.get(
      `print:${idempotencyKey}`,
    );

  if (replay) {
    return {
      ok: true,
      value: clone(replay),
    };
  }

  const record = records.find(
    (item) => item.id === recordId,
  );

  const document = documents.find(
    (item) =>
      item.id === documentId,
  );

  if (!record || !document) {
    return {
      ok: false,
      error: {
        code: "NOT_FOUND",
        message:
          "Prepared fulfilment document not found.",
      },
    };
  }

  if (
    document.recordId !== recordId ||
    record.version !== expectedVersion
  ) {
    return stale();
  }

  if (
    !record.warehouseId ||
    !canOperateWarehouse(
      actor,
      record.warehouseId,
    ) ||
    ![
      "READY_FOR_INVENTORY",
      "PARTIALLY_READY_FOR_INVENTORY",
    ].includes(record.status)
  ) {
    return {
      ok: false,
      error: {
        code: "FORBIDDEN",
        message:
          "Print confirmation is not permitted for this record and warehouse.",
      },
    };
  }

  for (const line of record.lines) {
    if (!line.reservedQuantity) {
      continue;
    }

    const stockItem = stock.find(
      (candidate) =>
        candidate.warehouseId ===
          record.warehouseId &&
        candidate.productVariantId ===
          line.productVariantId,
    );

    if (
      !stockItem ||
      stockItem.reserved <
        line.reservedQuantity
    ) {
      return {
        ok: false,
        error: {
          code: "STOCK_INTEGRITY",
          message:
            "Reserved stock no longer reconciles. Packing was not started.",
        },
      };
    }
  }

  /*
   * Validate all stock first.
   * Only then mutate.
   */

  for (const line of record.lines) {
    if (!line.reservedQuantity) {
      continue;
    }

    const stockItem = stock.find(
      (candidate) =>
        candidate.warehouseId ===
          record.warehouseId &&
        candidate.productVariantId ===
          line.productVariantId,
    );

    stockItem.reserved -=
      line.reservedQuantity;

    stockItem.allocatedToPacking +=
      line.reservedQuantity;

    stockItem.version += 1;

    line.status =
      "PACKING_AND_SHIPPING";
  }

  record.fulfilmentJobId = next(
    "FUL",
    fulfilmentSequence++,
  );

  record.status =
    "PACKING_AND_SHIPPING";

  record.version += 1;

  record.updatedAt =
    new Date().toISOString();

  printEvents.push({
    id: next(
      "PRN",
      printSequence++,
    ),

    recordId,

    documentId,

    printType: "FIRST_PRINT",

    idempotencyKey,

    confirmedBy:
      actor.actorUserId,

    confirmedAt:
      record.updatedAt,
  });

  idempotency.set(
    `print:${idempotencyKey}`,
    clone(record),
  );

  return {
    ok: true,
    value: clone(record),
  };
}

export function reprintFulfilmentDocument(
  actor,
  recordId,
  reason,
  idempotencyKey,
) {
  const replay =
    idempotency.get(
      `reprint:${idempotencyKey}`,
    );

  if (replay) {
    return {
      ok: true,
      value: clone(replay),
    };
  }

  const record = records.find(
    (item) => item.id === recordId,
  );

  const original = documents
    .filter(
      (document) =>
        document.recordId === recordId,
    )
    .sort(
      (a, b) =>
        b.version - a.version,
    )[0];

  if (
    !record ||
    !original ||
    !reason.trim() ||
    !record.warehouseId ||
    !canOperateWarehouse(
      actor,
      record.warehouseId,
    )
  ) {
    return {
      ok: false,
      error: {
        code: "FORBIDDEN",
        message:
          "A valid packing record, warehouse role and reprint reason are required.",
      },
    };
  }

  const document = {
    ...original,

    id: next(
      "DOC",
      documentSequence++,
    ),

    version:
      original.version + 1,

    generatedBy:
      actor.actorUserId,

    generatedAt:
      new Date().toISOString(),

    watermark: "REPRINT",
  };

  documents.push(document);

  printEvents.push({
    id: next(
      "PRN",
      printSequence++,
    ),

    recordId,

    documentId:
      document.id,

    printType: "REPRINT",

    idempotencyKey,

    confirmedBy:
      actor.actorUserId,

    confirmedAt:
      document.generatedAt,

    reason: reason.trim(),
  });

  idempotency.set(
    `reprint:${idempotencyKey}`,
    clone(document),
  );

  return {
    ok: true,
    value: clone(document),
  };
}

export function updatePacking(
  actor,
  recordId,
  packedByLine,
  expectedVersion,
) {
  const record = records.find(
    (item) => item.id === recordId,
  );

  if (!record) {
    return {
      ok: false,
      error: {
        code: "NOT_FOUND",
        message: "Record not found.",
      },
    };
  }

  if (
    record.version !== expectedVersion
  ) {
    return stale();
  }

  if (
    !record.warehouseId ||
    !canOperateWarehouse(
      actor,
      record.warehouseId,
    ) ||
    ![
      "PACKING_AND_SHIPPING",
      "PACKING_IN_PROGRESS",
      "PARTIALLY_PACKED",
    ].includes(record.status)
  ) {
    return {
      ok: false,
      error: {
        code: "FORBIDDEN",
        message:
          "Packing is not permitted for this record.",
      },
    };
  }

  for (const line of record.lines) {
    const quantity =
      packedByLine[line.id] ??
      line.packedQuantity;

    if (
      quantity < 0 ||
      quantity >
        line.reservedQuantity
    ) {
      return {
        ok: false,
        error: {
          code: "PACKING_LIMIT",
          message:
            "Packed quantity cannot exceed allocated quantity.",
        },
      };
    }
  }

  for (const line of record.lines) {
    const quantity =
      Number(
        packedByLine[line.id] ??
          line.packedQuantity,
      );

    line.packedQuantity =
      quantity;

    if (quantity > 0) {
      line.status =
        quantity ===
        line.reservedQuantity
          ? "PACKED"
          : "PACKING_IN_PROGRESS";
    }
  }

  const packable =
    record.lines.filter(
      (line) =>
        line.reservedQuantity > 0,
    );

  if (
    packable.length > 0 &&
    packable.every(
      (line) =>
        line.packedQuantity ===
        line.reservedQuantity,
    )
  ) {
    record.status = "PACKED";
  } else if (
    packable.some(
      (line) =>
        line.packedQuantity > 0,
    )
  ) {
    record.status =
      "PARTIALLY_PACKED";
  } else {
    record.status =
      "PACKING_IN_PROGRESS";
  }

  record.version += 1;

  record.updatedAt =
    new Date().toISOString();

  return {
    ok: true,
    value: clone(record),
  };
}

export function listFulfilmentDocuments() {
  return clone(documents);
}

export function listPrintEvents() {
  return clone(printEvents);
}