export const initialFulfilmentRecords = [
  {
    id: "REC-1001",
    reference: "ORD-SV-1042",
    customerAccountId: "ACC-SCHOOL-001",
    accountName: "Greenfield Academy",
    warehouseId: "WH-NOI",
    status: "READY_FOR_INVENTORY",
    version: 1,
    fulfilmentJobId: null,
    updatedAt: "2026-08-10T04:30:00.000Z",

    lines: [
      {
        id: "LINE-1001",
        productVariantId: "VAR-EXPL-SCI-06",
        title: "Explorer Science — Class 6",
        orderedQuantity: 40,
        reservedQuantity: 40,
        backorderedQuantity: 0,
        packedQuantity: 0,
        dispatchedQuantity: 0,
        status: "READY_FOR_INVENTORY",
      },
      {
        id: "LINE-1002",
        productVariantId: "VAR-OAK-ENG-05",
        title: "Oakwood English — Class 5",
        orderedQuantity: 30,
        reservedQuantity: 25,
        backorderedQuantity: 5,
        packedQuantity: 0,
        dispatchedQuantity: 0,
        status: "READY_FOR_INVENTORY",
      },
    ],
  },

  {
    id: "REC-1002",
    reference: "ORD-SV-1045",
    customerAccountId: "ACC-DIST-001",
    accountName:
      "North Star Educational Distributors",
    warehouseId: "WH-NOI",
    status: "PARTIALLY_READY_FOR_INVENTORY",
    version: 1,
    fulfilmentJobId: null,
    updatedAt: "2026-08-10T04:40:00.000Z",

    lines: [
      {
        id: "LINE-2001",
        productVariantId: "VAR-MATH-07",
        title:
          "ICSE Steps to Mathematics — Class 7",
        orderedQuantity: 100,
        reservedQuantity: 80,
        backorderedQuantity: 20,
        packedQuantity: 0,
        dispatchedQuantity: 0,
        status: "READY_FOR_INVENTORY",
      },
    ],
  },
];

export const initialWarehouseStock = [
  {
    id: "STK-001",
    warehouseId: "WH-NOI",
    productVariantId: "VAR-EXPL-SCI-06",
    available: 120,
    reserved: 40,
    allocatedToPacking: 0,
    version: 1,
  },
  {
    id: "STK-002",
    warehouseId: "WH-NOI",
    productVariantId: "VAR-OAK-ENG-05",
    available: 75,
    reserved: 25,
    allocatedToPacking: 0,
    version: 1,
  },
  {
    id: "STK-003",
    warehouseId: "WH-NOI",
    productVariantId: "VAR-MATH-07",
    available: 130,
    reserved: 80,
    allocatedToPacking: 0,
    version: 1,
  },
];