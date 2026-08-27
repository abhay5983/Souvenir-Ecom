import {
  controlAccounts,
  controlApprovals,
  controlAudit,
  controlDispatch,
  controlInventory,
  controlOrders,
  controlStock,
  partnerOnboardingBatches,
} from "../data/controlCentreData.js";

export const CONTROL_RESOURCES = {
  accounts: {
    title: "Partner account",
    listTitle: "Partner accounts",
    listPath: "/control/accounts",
    records: controlAccounts,
    parameterName: "recordId",
    fields: [
      {
        key: "id",
        label: "Account ID",
      },
      {
        key: "name",
        label: "Organisation",
      },
      {
        key: "type",
        label: "Account type",
      },
      {
        key: "partnerKey",
        label: "PartnerKey",
      },
      {
        key: "location",
        label: "Location",
      },
      {
        key: "accessMode",
        label: "Access mode",
      },
      {
        key: "status",
        label: "Status",
        type: "status",
      },
    ],
  },

  orders: {
    title: "Order record",
    listTitle: "Orders and samples",
    listPath: "/control/orders",
    records: controlOrders,
    parameterName: "recordId",
    fields: [
      {
        key: "id",
        label: "Reference",
      },
      {
        key: "accountName",
        label: "Account",
      },
      {
        key: "type",
        label: "Record type",
      },
      {
        key: "lines",
        label: "Lines",
      },
      {
        key: "units",
        label: "Units",
      },
      {
        key: "createdAt",
        label: "Created",
      },
      {
        key: "status",
        label: "Status",
        type: "status",
      },
    ],
  },

  approvals: {
    title: "Approval record",
    listTitle: "Approval queue",
    listPath: "/control/approvals",
    records: controlApprovals,
    parameterName: "recordId",
    fields: [
      {
        key: "id",
        label: "Approval ID",
      },
      {
        key: "title",
        label: "Request",
      },
      {
        key: "accountName",
        label: "Account",
      },
      {
        key: "requestedBy",
        label: "Requested by",
      },
      {
        key: "category",
        label: "Category",
      },
      {
        key: "status",
        label: "Status",
        type: "status",
      },
    ],
  },

  stock: {
    title: "Stock record",
    listTitle: "Stock visibility",
    listPath: "/control/stock",
    records: controlStock,
    parameterName: "recordId",
    fields: [
      {
        key: "id",
        label: "Variant ID",
      },
      {
        key: "title",
        label: "Title",
      },
      {
        key: "isbn",
        label: "ISBN",
      },
      {
        key: "warehouse",
        label: "Warehouse",
      },
      {
        key: "available",
        label: "Available",
      },
      {
        key: "reserved",
        label: "Reserved",
      },
      {
        key: "state",
        label: "Stock state",
        type: "status",
      },
    ],
  },

  inventory: {
    title: "Fulfilment record",
    listTitle: "Inventory and fulfilment",
    listPath: "/control/inventory",
    records: controlInventory,
    parameterName: "recordId",
    fields: [
      {
        key: "id",
        label: "Fulfilment ID",
      },
      {
        key: "record",
        label: "Order",
      },
      {
        key: "accountName",
        label: "Account",
      },
      {
        key: "warehouse",
        label: "Warehouse",
      },
      {
        key: "lines",
        label: "Lines",
      },
      {
        key: "status",
        label: "Status",
        type: "status",
      },
    ],
  },

  dispatch: {
    title: "Dispatch record",
    listTitle: "Dispatch operations",
    listPath: "/control/dispatch",
    records: controlDispatch,
    parameterName: "recordId",
    fields: [
      {
        key: "id",
        label: "Dispatch ID",
      },
      {
        key: "record",
        label: "Order",
      },
      {
        key: "accountName",
        label: "Account",
      },
      {
        key: "packages",
        label: "Packages",
      },
      {
        key: "destination",
        label: "Destination",
      },
      {
        key: "status",
        label: "Status",
        type: "status",
      },
    ],
  },

  audit: {
    title: "Audit event",
    listTitle: "Audit activity",
    listPath: "/control/audit",
    records: controlAudit,
    parameterName: "recordId",
    fields: [
      {
        key: "id",
        label: "Audit ID",
      },
      {
        key: "actor",
        label: "Actor",
      },
      {
        key: "action",
        label: "Action",
      },
      {
        key: "target",
        label: "Target",
      },
      {
        key: "date",
        label: "Date and time",
      },
    ],
  },

  onboarding: {
    title: "Partner import batch",
    listTitle: "Partner onboarding",
    listPath:
      "/control/partner-network/onboarding",
    records: partnerOnboardingBatches,
    parameterName: "recordId",
    fields: [
      {
        key: "id",
        label: "Batch ID",
      },
      {
        key: "fileName",
        label: "Source file",
      },
      {
        key: "records",
        label: "Records",
      },
      {
        key: "valid",
        label: "Valid",
      },
      {
        key: "issues",
        label: "Issues",
      },
      {
        key: "status",
        label: "Status",
        type: "status",
      },
    ],
  },
};