import ControlQueuePage from "../../components/control/ControlQueuePage.jsx";

import { controlApprovals } from "../../data/controlCentreData.js";

function ControlApprovalsPage() {
  return (
    <ControlQueuePage
      title="Approval queue"
      description="Review client confirmations, access changes and maker-checker decisions."
      stats={[
        {
          label: "Pending",
          value: controlApprovals.filter(
            (item) =>
              item.status === "PENDING",
          ).length,
          note: "Awaiting reviewer action",
        },
        {
          label: "Client confirmations",
          value: controlApprovals.filter(
            (item) =>
              item.category ===
              "CLIENT_CONFIRMATION",
          ).length,
          note: "Customer decision required",
        },
        {
          label: "Access approvals",
          value: controlApprovals.filter(
            (item) =>
              item.category ===
              "ACCESS_APPROVAL",
          ).length,
          note: "Capability review",
        },
        {
          label: "Escalated",
          value: 0,
          note: "No escalations",
        },
      ]}
      columns={[
        {
          key: "id",
          label: "Approval ID",
          strong: true,
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
      ]}
      records={controlApprovals}
    />
  );
}

export default ControlApprovalsPage;