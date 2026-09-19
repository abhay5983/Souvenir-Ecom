import {
    BrowserRouter,
    Route,
    Routes,
} from "react-router-dom";

import PublicLayout from "../components/layout/PublicLayout.jsx";
import PortalLayout from "../components/layout/PortalLayout.jsx";
import ScrollToTop from "../components/common/ScrollToTop.jsx";

import ProtectedRoute from "./ProtectedRoute.jsx";

import HomePage from "../pages/HomePage.jsx";
import AboutPage from "../pages/AboutPage.jsx";
import BooksPage from "../pages/BooksPage.jsx";
import HelpPage from "../pages/HelpPage.jsx";
import SeriesDetailPage from "../pages/SeriesDetailPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import CartPage from "../pages/CartPage.jsx";
import CheckoutPage from "../pages/CheckoutPage.jsx";
import TrackOrderPage from "../pages/TrackOrderPage.jsx";
import DigitalLearningPage from "../pages/DigitalLearningPage.jsx";
import OutreachFormPage from "../pages/OutreachFormPage.jsx";
import HelpGuidePage from "../pages/HelpGuidePage.jsx";
import PolicyPage from "../pages/PolicyPage.jsx";

import RoleDashboardPage from "../pages/RoleDashboardPage.jsx";

// import SalesDashboardPage from "../pages/dashboards/SalesDashboardPage.jsx";

import AccountPage from "../pages/portal/AccountPage.jsx";
import DigitalResourceRequestPage from "../pages/portal/DigitalResourceRequestPage.jsx";

import ControlAccountsPage from "../pages/control/ControlAccountsPage.jsx";
import ControlOrdersPage from "../pages/control/ControlOrdersPage.jsx";
import ControlApprovalsPage from "../pages/control/ControlApprovalsPage.jsx";
import ControlStockPage from "../pages/control/ControlStockPage.jsx";
import ControlAuditPage from "../pages/control/ControlAuditPage.jsx";
import PartnerOnboardingPage from "../pages/control/PartnerOnboardingPage.jsx";
import NewPartnerImportPage from "../pages/control/NewPartnerImportPage.jsx";

import ControlRecordDetailPage from "../components/control/ControlRecordDetailPage.jsx";


import DispatchRecordPage from "../pages/control/DispatchRecordPage.jsx";

import ControlAccessPage from "../pages/ControlAccessPage.jsx";
import WorkflowDashboardPage from "../pages/WorkflowDashboardPage.jsx";
import WorkflowRequestDetailPage from "../pages/WorkflowRequestDetailPage.jsx";
import RequestHubPage from "../pages/RequestHubPage.jsx";

function AppRouter() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <Routes>
                {/* Public website */}
                <Route element={<PublicLayout />}>
                    <Route
                        path="/"
                        element={<HomePage />}
                    />

                    <Route
                        path="/about"
                        element={<AboutPage />}
                    />

                    <Route
                        path="/books"
                        element={<BooksPage />}
                    />

                    <Route
                        path="/books/:seriesSlug"
                        element={<SeriesDetailPage />}
                    />

                    <Route
                        path="/cart"
                        element={<CartPage />}
                    />

                    <Route
                        path="/checkout"
                        element={<CheckoutPage />}
                    />

                    <Route
                        path="/track-order"
                        element={<TrackOrderPage />}
                    />

                    <Route
                        path="/digital-learning"
                        element={<DigitalLearningPage />}
                    />

                    <Route
                        path="/digital-learning/request"
                        element={<DigitalResourceRequestPage />}
                    />

                    <Route
                        path="/help"
                        element={<HelpPage />}
                    />

                    <Route
                        path="/help/guides/:guideSlug"
                        element={<HelpGuidePage />}
                    />

                    <Route
                        path="/help/forms/:formSlug"
                        element={<OutreachFormPage />}
                    />

                    <Route
                        path="/login"
                        element={<LoginPage />}
                    />

                    <Route path="/return-policy" element={<PolicyPage policy="returns" />} />
                    <Route path="/privacy" element={<PolicyPage policy="privacy" />} />
                    <Route path="/terms" element={<PolicyPage policy="terms" />} />

                    <Route path="/requests-dashboard" element={<RequestHubPage />} />

                    <Route
                        path="/control-access"
                        element={
                            <ControlAccessPage />
                        }
                    />
                </Route>

                {/* Authenticated portal */}
                <Route
                    element={
                        <ProtectedRoute>
                            <PortalLayout />
                        </ProtectedRoute>
                    }
                >
                    {/* Partner account routes */}
                    <Route
                        path="/app"
                        element={<RoleDashboardPage />}
                    />

                    <Route
                        path="/app/catalog"
                        element={<BooksPage authenticated />}
                    />

                    <Route
                        path="/app/catalog/:seriesSlug"
                        element={<SeriesDetailPage authenticated />}
                    />

                    <Route
                        path="/app/account"
                        element={<AccountPage />}
                    />

                    <Route
                        path="/app/digital-resources/request"
                        element={<DigitalResourceRequestPage />}
                    />

                    <Route
                        path="/requests/:requestId"
                        element={<WorkflowRequestDetailPage />}
                    />

                    {/* Sales routes */}
                    <Route
                        path="/sales"
                        element={
                            <ProtectedRoute
                                allowedRoles={[
                                    "SALES_REP",
                                    "SALES_MANAGER",
                                    "BUSINESS_MANAGER",
                                ]}
                            >
                                <RoleDashboardPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/sales/accounts"
                        element={
                            <ProtectedRoute
                                allowedRoles={[
                                    "SALES_REP",
                                    "SALES_MANAGER",
                                ]}
                            >
                                <div className="portal-main">
                                    <div className="container">
                                        <h1>Sales accounts</h1>
                                    </div>
                                </div>
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin routes */}
                    <Route
                        path="/admin"
                        element={<RoleDashboardPage />}
                    />
                    <Route
                        path="/admin/catalog"
                        element={
                            <div className="portal-main">
                                <div className="container">
                                    <h1>Admin catalogue</h1>
                                </div>
                            </div>
                        }
                    />

                    <Route
                        path="/admin/orders"
                        element={
                            <div className="portal-main">
                                <div className="container">
                                    <h1>Admin orders</h1>
                                </div>
                            </div>
                        }
                    />

                    {/* Control Centre dashboard */}
                    <Route
                        path="/control"
                        element={<RoleDashboardPage />}
                    />

                    {/* Partner onboarding */}
                    <Route
                        path="/control/partner-network/onboarding"
                        element={<PartnerOnboardingPage />}
                    />

                    <Route
                        path="/control/partner-network/onboarding/new"
                        element={<NewPartnerImportPage />}
                    />

                    <Route
                        path="/control/partner-network/onboarding/:recordId"
                        element={
                            <ControlRecordDetailPage
                                resourceType="onboarding"
                            />
                        }
                    />

                    {/* Accounts */}
                    <Route
                        path="/control/accounts"
                        element={<ControlAccountsPage />}
                    />

                    <Route
                        path="/control/accounts/:recordId"
                        element={
                            <ControlRecordDetailPage
                                resourceType="accounts"
                            />
                        }
                    />

                    {/* Orders */}
                    <Route
                        path="/control/orders"
                        element={<ControlOrdersPage />}
                    />

                    <Route
                        path="/control/orders/:recordId"
                        element={
                            <ControlRecordDetailPage
                                resourceType="orders"
                            />
                        }
                    />

                    {/* Approvals */}
                    <Route
                        path="/control/approvals"
                        element={<ControlApprovalsPage />}
                    />

                    <Route
                        path="/control/approvals/:recordId"
                        element={
                            <ControlRecordDetailPage
                                resourceType="approvals"
                            />
                        }
                    />

                    {/* Stock */}
                    <Route
                        path="/control/stock"
                        element={<ControlStockPage />}
                    />

                    <Route
                        path="/control/stock/:recordId"
                        element={
                            <ControlRecordDetailPage
                                resourceType="stock"
                            />
                        }
                    />

                    {/* Inventory and fulfilment */}
                    <Route
                        path="/control/inventory"
                        element={
                            <ProtectedRoute
                                allowedRoles={[
                                    "INVENTORY",
                                    "INVENTORY_SUPERVISOR",
                                    "SUPER_ADMIN",
                                    "MANAGEMENT_SUPER_MASTER",
                                    "TECH_MASTER",
                                ]}
                            >
                                <WorkflowDashboardPage />
                            </ProtectedRoute>
                        }
                    />
                   <Route
  path="/control/inventory/:recordId"
  element={
    <ProtectedRoute
      allowedRoles={[
        "INVENTORY",
        "INVENTORY_SUPERVISOR",
        "SUPER_ADMIN",
        "MANAGEMENT_SUPER_MASTER",
        "TECH_MASTER",
      ]}
    >
      <ControlRecordDetailPage
        resourceType="inventory"
      />
    </ProtectedRoute>
  }
/>

                    {/* Dispatch */}
                    <Route
                        path="/control/dispatch"
                        element={
                            <ProtectedRoute
                                allowedRoles={[
                                    "DISPATCH",
                                    "SUPER_ADMIN",
                                    "MANAGEMENT_SUPER_MASTER",
                                    "TECH_MASTER",
                                ]}
                            >
                                <WorkflowDashboardPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/control/dispatch/:recordId"
                        element={
                            <ProtectedRoute
                                allowedRoles={[
                                    "DISPATCH",
                                    "SUPER_ADMIN",
                                    "MANAGEMENT_SUPER_MASTER",
                                    "TECH_MASTER",
                                ]}
                            >
                                <DispatchRecordPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Audit */}
                    <Route
                        path="/control/audit"
                        element={<ControlAuditPage />}
                    />

                    <Route
                        path="/control/audit/:recordId"
                        element={
                            <ControlRecordDetailPage
                                resourceType="audit"
                            />
                        }
                    />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;
