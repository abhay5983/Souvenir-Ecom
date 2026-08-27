import ControlQueuePage from "../../components/control/ControlQueuePage.jsx";

import { controlAudit } from "../../data/controlCentreData.js";

function ControlAuditPage() {
  return (
    <ControlQueuePage
      title="Audit activity"
      description="Review accountable actions performed by individual authorised users."
      stats={[
        {
          label: "Recent events",
          value: controlAudit.length,
          note: "Current demo session",
        },
        {
          label: "Order actions",
          value: controlAudit.filter(
            (item) =>
              item.action.includes("ORDER"),
          ).length,
          note: "Commercial workflow",
        },
        {
          label: "Stock actions",
          value: controlAudit.filter(
            (item) =>
              item.action.includes("STOCK"),
          ).length,
          note: "Inventory workflow",
        },
        {
          label: "Security alerts",
          value: 0,
          note: "No alerts detected",
        },
      ]}
      columns={[
        {
          key: "id",
          label: "Audit ID",
          strong: true,
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
      ]}
      records={controlAudit}
    />
  );
}

export default ControlAuditPage;