export const controlAccounts = [
  {
    id: "ACC-SCHOOL-001",
    name: "Greenfield Academy",
    type: "School",
    partnerKey: "SPK-SC-DL-00001",
    location: "Delhi",
    accessMode: "ASSISTED_ONLY",
    status: "ACTIVE",
  },
  {
    id: "ACC-DIST-001",
    name: "North Star Educational Distributors",
    type: "Distributor",
    partnerKey: "SPK-DS-DL-00002",
    location: "Delhi NCR",
    accessMode: "SELF_SERVICE",
    status: "ACTIVE",
  },
  {
    id: "ACC-SCHOOL-002",
    name: "Oakwood Public School",
    type: "School",
    partnerKey: "SPK-SC-UP-00003",
    location: "Uttar Pradesh",
    accessMode: "DASHBOARD_ONLY",
    status: "PENDING_REVIEW",
  },
];

export const controlOrders = [
  {
    id: "ORD-SV-1042",
    accountName: "Greenfield Academy",
    type: "SALES_ORDER",
    lines: 3,
    units: 145,
    status: "PENDING_APPROVAL",
    createdAt: "07 Aug 2026",
  },
  {
    id: "ORD-SV-1045",
    accountName:
      "North Star Educational Distributors",
    type: "SALES_ORDER",
    lines: 6,
    units: 520,
    status: "PROCESSING",
    createdAt: "06 Aug 2026",
  },
  {
    id: "SMP-SV-2041",
    accountName: "Oakwood Public School",
    type: "SAMPLE_REQUEST",
    lines: 2,
    units: 4,
    status: "UNDER_REVIEW",
    createdAt: "05 Aug 2026",
  },
];

export const controlApprovals = [
  {
    id: "APR-2026-001",
    title: "School order confirmation",
    accountName: "Greenfield Academy",
    requestedBy: "Rahul Mehta",
    category: "CLIENT_CONFIRMATION",
    status: "PENDING",
  },
  {
    id: "APR-2026-002",
    title: "Buying access profile",
    accountName: "Oakwood Public School",
    requestedBy: "Partner Network Team",
    category: "ACCESS_APPROVAL",
    status: "PENDING",
  },
];

export const controlStock = [
  {
    id: "VAR-EXPL-SCI-06",
    title: "Explorer Science – Class 6",
    isbn: "978-93-00000-101-1",
    warehouse: "Noida Warehouse",
    available: 132,
    reserved: 80,
    state: "AVAILABLE",
  },
  {
    id: "VAR-OAK-ENG-04",
    title: "Oakwood English – Class 4",
    isbn: "978-93-00000-102-8",
    warehouse: "Noida Warehouse",
    available: 18,
    reserved: 15,
    state: "LOW_STOCK",
  },
  {
    id: "VAR-MATH-07",
    title: "ICSE Steps to Mathematics – Class 7",
    isbn: "978-93-00000-103-5",
    warehouse: "Delhi Warehouse",
    available: 0,
    reserved: 0,
    state: "IN_PRESS",
  },
];

export const controlInventory = [
  {
    id: "FUL-2026-1001",
    record: "ORD-SV-1045",
    accountName:
      "North Star Educational Distributors",
    warehouse: "Noida Warehouse",
    lines: 6,
    status: "PICKING",
  },
  {
    id: "FUL-2026-1002",
    record: "ORD-SV-1042",
    accountName: "Greenfield Academy",
    warehouse: "Noida Warehouse",
    lines: 3,
    status: "STOCK_RESERVED",
  },
];

export const controlDispatch = [
  {
    id: "DSP-2026-501",
    record: "ORD-SV-1038",
    accountName: "Sunrise International School",
    packages: 3,
    destination: "Lucknow, Uttar Pradesh",
    status: "READY_FOR_DISPATCH",
  },
  {
    id: "DSP-2026-502",
    record: "ORD-SV-1040",
    accountName: "National Book Depot",
    packages: 6,
    destination: "Jaipur, Rajasthan",
    status: "DISPATCHED",
  },
];

export const controlAudit = [
  {
    id: "AUD-9001",
    actor: "Super Administrator",
    action: "ORDER_APPROVED",
    target: "ORD-SV-1045",
    date: "07 Aug 2026, 03:20 PM",
  },
  {
    id: "AUD-9002",
    actor: "Inventory Supervisor",
    action: "STOCK_RESERVED",
    target: "ORD-SV-1042",
    date: "07 Aug 2026, 02:35 PM",
  },
  {
    id: "AUD-9003",
    actor: "Partner Network Administrator",
    action: "PARTNER_PROFILE_UPDATED",
    target: "ACC-SCHOOL-002",
    date: "07 Aug 2026, 01:10 PM",
  },
];

export const partnerOnboardingBatches = [
  {
    id: "IMP-2026-001",
    fileName: "school-partners-august.xlsx",
    records: 38,
    valid: 35,
    issues: 3,
    status: "AWAITING_APPROVAL",
  },
  {
    id: "IMP-2026-002",
    fileName: "distributor-directory.xlsx",
    records: 12,
    valid: 12,
    issues: 0,
    status: "COMPLETED",
  },
];