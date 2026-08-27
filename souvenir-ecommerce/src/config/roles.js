export const ROLE_LABELS = {
  PUBLIC: "Public visitor",
  SCHOOL_ADMIN: "School administrator",
  SCHOOL_TEACHER: "School teacher",
  DISTRIBUTOR_ADMIN: "Distributor administrator",
  SALES_REP: "Sales representative",
  BUSINESS_MANAGER: "Business Manager",
  SALES_MANAGER: "Sales manager",
  CATALOGUE_ADMIN: "Catalogue administrator",
  ORDER_OPERATIONS: "Order operations",
  DIGITAL_RESOURCE_ADMIN:
    "Digital resource administrator",
  SUPER_ADMIN: "Super administrator",
  MANAGEMENT_SUPER_MASTER:
    "Management Super Master",
  TECH_MASTER:
    "Developer / Technology Master",
  PARTNER_NETWORK_ADMIN:
    "Partner Network Administrator",
  COORDINATOR: "Regional Coordinator",
  COORDINATOR_HEAD: "Coordinator Head",
  INVENTORY: "Inventory and Fulfilment",
  INVENTORY_SUPERVISOR:
    "Inventory Supervisor",
  DISPATCH: "Dispatch Team",
  AUDITOR: "Auditor / Read-only",
};

export const ACCOUNT_ROLES = [
  "SCHOOL_ADMIN",
  "SCHOOL_TEACHER",
  "DISTRIBUTOR_ADMIN",
];

export const SALES_ROLES = [
  "BUSINESS_MANAGER",
  "SALES_REP",
  "SALES_MANAGER",
];

export const ADMIN_ROLES = [
  "CATALOGUE_ADMIN",
  "ORDER_OPERATIONS",
  "FINANCE",
  "DIGITAL_RESOURCE_ADMIN",
  "SUPER_ADMIN",
];

export const CONTROL_ROLES = [
  "MANAGEMENT_SUPER_MASTER",
  "TECH_MASTER",
  "PARTNER_NETWORK_ADMIN",
  "COORDINATOR",
  "COORDINATOR_HEAD",
  "INVENTORY",
  "INVENTORY_SUPERVISOR",
  "DISPATCH",
  "FINANCE",
  "AUDITOR",
  "SUPER_ADMIN",
];

export const DEMO_ROLES = Object.keys(
  ROLE_LABELS,
).filter((role) => role !== "PUBLIC");
