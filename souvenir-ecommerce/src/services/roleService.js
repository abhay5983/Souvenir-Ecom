const ADMIN_ROLES = [
  "CATALOGUE_ADMIN",
  "ORDER_OPERATIONS",
  "FINANCE",
  "DIGITAL_RESOURCE_ADMIN",
  "SUPER_ADMIN",
];

const SALES_ROLES = [
  "BUSINESS_MANAGER",
  "SALES_REP",
  "SALES_MANAGER",
];

const CONTROL_ROLES = [
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

export function isAdminRole(role) {
  return ADMIN_ROLES.includes(role);
}

export function isSalesRole(role) {
  return SALES_ROLES.includes(role);
}

export function isControlRole(role) {
  return CONTROL_ROLES.includes(role);
}

export function getDefaultRouteForRole(role) {
  if (role === "SUPER_ADMIN") {
    return "/control";
  }

  if (role === "PARTNER_NETWORK_ADMIN") {
    return "/control/partner-network/onboarding";
  }

  if (role === "DISPATCH") {
    return "/control/dispatch";
  }

  if (
    role === "INVENTORY" ||
    role === "INVENTORY_SUPERVISOR"
  ) {
    return "/control/inventory";
  }

  if (isControlRole(role)) {
    return "/control";
  }

  if (isSalesRole(role)) {
    return "/sales";
  }

  if (isAdminRole(role)) {
    return "/admin";
  }

  return "/app";
}
