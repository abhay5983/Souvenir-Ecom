import {
  NavLink,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";

/* =========================================================
   PARTNER / CUSTOMER WORKSPACE
========================================================= */

const accountNavigation = [
  {
    label: "Overview",
    to: "/app",
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

/* =========================================================
   SALES WORKSPACE
========================================================= */

const salesNavigation = [
  {
    label: "Overview",
    to: "/sales",
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

/* =========================================================
   ADMIN WORKSPACE
========================================================= */

const adminNavigation = [
  {
    label: "Overview",
    to: "/admin",
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

/* =========================================================
   FULL CONTROL CENTRE
   SUPER_ADMIN
   MANAGEMENT_SUPER_MASTER
   TECH_MASTER
   COORDINATOR_HEAD
   FINANCE
   AUDITOR
========================================================= */

const controlNavigation = [
  {
    label: "Overview",
    to: "/control",
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

/* =========================================================
   PARTNER NETWORK ADMIN
========================================================= */

const partnerNetworkNavigation = [
  {
    label: "Onboarding",
    to: "/control/partner-network/onboarding",
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

/* =========================================================
   DISPATCH
========================================================= */

const dispatchNavigation = [
  {
    label: "Dispatch queue",
    to: "/control/dispatch",
  },
];

/* =========================================================
   INVENTORY
========================================================= */

const inventoryNavigation = [
  {
    label: "Fulfilment queue",
    to: "/control/inventory",
  },
];

/* =========================================================
   COORDINATOR
========================================================= */

const coordinatorNavigation = [
  {
    label: "Assigned requests",
    to: "/control",
  },
];

/* =========================================================
   ROLE GROUPS
========================================================= */

const SALES_ROLES = [
  "BUSINESS_MANAGER",
  "SALES_REP",
  "SALES_MANAGER",
];

const ADMIN_ROLES = [
  "CATALOGUE_ADMIN",
  "ORDER_OPERATIONS",
  "FINANCE",
  "DIGITAL_RESOURCE_ADMIN",
  "SUPER_ADMIN",
];

const CONTROL_ROLES = [
  "SUPER_ADMIN",
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
];

/* =========================================================
   CONTROL NAVIGATION BY ROLE
========================================================= */

function getControlNavigation(role) {
  if (role === "PARTNER_NETWORK_ADMIN") {
    return partnerNetworkNavigation;
  }

  if (role === "DISPATCH") {
    return dispatchNavigation;
  }

  if (
    role === "INVENTORY" ||
    role === "INVENTORY_SUPERVISOR"
  ) {
    return inventoryNavigation;
  }

  if (role === "COORDINATOR") {
    return coordinatorNavigation;
  }

  if (
    role === "COORDINATOR_HEAD" ||
    role === "AUDITOR"
  ) {
    return [{ label: "Request queue", to: "/control" }];
  }

  if (CONTROL_ROLES.includes(role)) {
    return controlNavigation;
  }

  return [];
}

/* =========================================================
   MAIN NAVIGATION RESOLVER
========================================================= */

function getNavigation(role, pathname) {
  if (!role || role === "PUBLIC") {
    return [];
  }

  /*
   * CONTROL CENTRE
   *
   * This comes FIRST deliberately.
   *
   * FINANCE and SUPER_ADMIN may also be admin roles,
   * but while inside /control they must keep
   * Control Centre navigation.
   */
  if (pathname.startsWith("/control")) {
    return getControlNavigation(role);
  }

  /*
   * SALES
   */
  if (
    pathname.startsWith("/sales") &&
    SALES_ROLES.includes(role)
  ) {
    return salesNavigation;
  }

  /*
   * ADMIN
   */
  if (
    pathname.startsWith("/admin") &&
    ADMIN_ROLES.includes(role)
  ) {
    return adminNavigation;
  }

  /*
   * SHARED CATALOGUE / CART / ACCOUNT AREA
   */
  if (
    pathname.startsWith("/app") ||
    pathname.startsWith("/requests") ||
    pathname === "/cart" ||
    pathname === "/checkout"
  ) {
    if (SALES_ROLES.includes(role)) {
      return salesNavigation;
    }

    /*
     * Internal Control Centre roles retain their
     * own workspace navigation when they temporarily
     * enter shared catalogue/cart routes.
     */
    if (CONTROL_ROLES.includes(role)) {
      return getControlNavigation(role);
    }

    return accountNavigation;
  }

  return [];
}

/* =========================================================
   COMPONENT
========================================================= */

function RoleNavigation() {
  const {
    authenticated,
    role,
  } = useAuth();

  const { pathname } =
    useLocation();

  if (!authenticated) {
    return null;
  }

  const links =
    getNavigation(role, pathname);

  if (!links.length) {
    return null;
  }

  const controlWorkspace =
    pathname.startsWith("/control");

  return (
    <nav
      className={`portal-nav ${
        controlWorkspace
          ? "control-nav"
          : ""
      }`}
      aria-label={
        controlWorkspace
          ? "Control Centre navigation"
          : "Workspace navigation"
      }
    >
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={
            link.to === "/app" ||
            link.to === "/sales" ||
            link.to === "/admin" ||
            link.to === "/control"
          }
          className={({
            isActive,
          }) =>
            isActive
              ? "active"
              : undefined
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default RoleNavigation;
