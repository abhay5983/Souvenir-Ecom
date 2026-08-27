export const accountNavigation = [
  {
    label: "Overview",
    to: "/app",
    exact: true,
  },
  {
    label: "Catalogue",
    to: "/app/catalog",
  },
  {
    label: "Cart",
    to: "/cart",
  },
  {
    label: "Digital resources",
    to: "/app/digital-resources/request",
  },
  {
    label: "Account",
    to: "/app/account",
  },
];

export const salesNavigation = [
  {
    label: "Overview",
    to: "/sales",
    exact: true,
  },
  {
    label: "Accounts",
    to: "/sales/accounts",
  },
  {
    label: "Catalogue",
    to: "/app/catalog",
  },
  {
    label: "Cart",
    to: "/cart",
  },
  {
    label: "Resource shares",
    to: "/app/digital-resources/request",
  },
];

export const adminNavigation = [
  {
    label: "Overview",
    to: "/admin",
    exact: true,
  },
  {
    label: "Catalogue",
    to: "/admin/catalog",
  },
  {
    label: "Orders",
    to: "/admin/orders",
  },
  {
    label: "Samples",
    to: "/admin/sample-requests",
  },
  {
    label: "Digital requests",
    to: "/admin/digital-resource-requests",
  },
  {
    label: "Outreach",
    to: "/admin/outreach",
  },
  {
    label: "Audit log",
    to: "/admin/audit-log",
  },
];

export const fullControlNavigation = [
  {
    label: "Overview",
    to: "/control",
    exact: true,
  },
  {
    label: "Partner onboarding",
    to: "/control/partner-network/onboarding",
  },
  {
    label: "Accounts",
    to: "/control/accounts",
  },
  {
    label: "Orders",
    to: "/control/orders",
  },
  {
    label: "Approvals",
    to: "/control/approvals",
  },
  {
    label: "Stock",
    to: "/control/stock",
  },
  {
    label: "Fulfilment",
    to: "/control/inventory",
  },
  {
    label: "Dispatch",
    to: "/control/dispatch",
  },
  {
    label: "Audit",
    to: "/control/audit",
  },
];

export const partnerNetworkNavigation = [
  {
    label: "Onboarding",
    to: "/control/partner-network/onboarding",
    exact: true,
  },
  {
    label: "New import",
    to: "/control/partner-network/onboarding/new",
  },
  {
    label: "Import history",
    to: "/control/partner-network/onboarding/batches",
  },
  {
    label: "Access profiles",
    to: "/control/partner-network/onboarding/access-profiles",
  },
  {
    label: "Templates",
    to: "/control/partner-network/onboarding/templates",
  },
];

export const dispatchNavigation = [
  {
    label: "Dispatch",
    to: "/control/dispatch",
    exact: true,
  },
  {
    label: "Activity",
    to: "/control/audit",
  },
];

export const inventoryNavigation = [
  {
    label: "Fulfilment",
    to: "/control/inventory",
    exact: true,
  },
  {
    label: "Stock",
    to: "/control/stock",
  },
  {
    label: "Activity",
    to: "/control/audit",
  },
];

export const coordinatorNavigation = [
  {
    label: "Operations",
    to: "/control/coordinator",
    exact: true,
  },
  {
    label: "Accounts",
    to: "/control/accounts",
  },
  {
    label: "Orders",
    to: "/control/orders",
  },
  {
    label: "Activity",
    to: "/control/audit",
  },
];