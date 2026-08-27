import { useAuth } from "../context/AuthContext.jsx";


import TeacherDashboardPage from "./dashboards/TeacherDashboardPage.jsx";

import CatalogueAdminDashboardPage from "./dashboards/CatalogueAdminDashboardPage.jsx";
import OrderOperationsDashboardPage from "./dashboards/OrderOperationsDashboardPage.jsx";

import SuperAdminDashboardPage from "./dashboards/SuperAdminDashboardPage.jsx";
import SalesDashboardPage from "./dashboards/SalesDashboardPage.jsx";
import SalesManagerDashboardPage from "./dashboards/SalesManagerDashboardPage.jsx";
import InventoryDashboardPage from "./dashboards/InventoryDashboardPage.jsx";
import DispatchDashboardPage from "./dashboards/DispatchDashboardPage.jsx";
import DigitalResourceAdminDashboardPage from "./dashboards/DigitalResourceAdminDashboardPage.jsx";

import ManagementSuperMasterDashboardPage from "./dashboards/ManagementSuperMasterDashboardPage.jsx";


import DistributorDashboardPage from "./dashboards/DistributorDashboardPage.jsx";
import CoordinatorHeadDashboardPage from "./dashboards/CoordinatorHeadDashboardPage.jsx";

import InventoryPackingPage from "../pages/control/InventoryPackingPage.jsx";
import WorkflowDashboardPage from "./WorkflowDashboardPage.jsx";

function RoleDashboardPage() {
  const { role } = useAuth();

  if ([
    "SCHOOL_ADMIN", "BUSINESS_MANAGER", "SALES_REP", "SALES_MANAGER",
    "DISTRIBUTOR_ADMIN", "COORDINATOR", "COORDINATOR_HEAD", "INVENTORY",
    "INVENTORY_SUPERVISOR", "DISPATCH", "AUDITOR", "SUPER_ADMIN",
    "MANAGEMENT_SUPER_MASTER",
  ].includes(role)) {
    return <WorkflowDashboardPage />;
  }

  console.log(
    "ROLE DASHBOARD CURRENT ROLE:",
    role,
  );


  if (role === "SCHOOL_TEACHER") {
  return <TeacherDashboardPage />;
}

  if (role === "CATALOGUE_ADMIN") {
    return (
      <CatalogueAdminDashboardPage />
    );
  }

  if (role === "ORDER_OPERATIONS") {
    return (
      <OrderOperationsDashboardPage />
    );
  }

  if (role === "SUPER_ADMIN") {
    return (
      <SuperAdminDashboardPage />
    );
  }

  if (role === "SALES_MANAGER") {
    return (
      <SalesManagerDashboardPage />
    );
  }

  if (role === "SALES_REP") {
    return (
      <SalesDashboardPage />
    );
  }

  if (
    role === "INVENTORY" ||
    role === "INVENTORY_SUPERVISOR"
  ) {
    return (
      <InventoryDashboardPage />
    );
  }

  if (role === "DISPATCH") {
    return (
      <DispatchDashboardPage />
    );
  }

  if (role === "DIGITAL_RESOURCE_ADMIN") {
  return <DigitalResourceAdminDashboardPage />;
}

if (role === "MANAGEMENT_SUPER_MASTER") {
  return (
    <ManagementSuperMasterDashboardPage />
  );
}



if (role === "DISTRIBUTOR_ADMIN") {
  return <DistributorDashboardPage />;
}

if (role === "COORDINATOR_HEAD") {
  return <CoordinatorHeadDashboardPage />;
}
  return (
    <section className="portal-main">
      <div className="container">
        <h1>
          Dashboard not configured
        </h1>

        <p>
          Current role: {role}
        </p>
      </div>
    </section>
  );
}

export default RoleDashboardPage;
