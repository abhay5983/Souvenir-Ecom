import ControlQueuePage from "../../components/control/ControlQueuePage.jsx";

import { controlOrders } from "../../data/controlCentreData.js";

function ControlOrdersPage() {
  return (
    <ControlQueuePage
      title="Orders and samples"
      description="Review account-owned sales orders and sample requests from one operational queue."
      stats={[
        {
          label: "Total records",
          value: controlOrders.length,
          note: "Orders and samples",
        },
        {
          label: "Pending approval",
          value: controlOrders.filter(
            (item) =>
              item.status ===
              "PENDING_APPROVAL",
          ).length,
          note: "Checker action required",
        },
        {
          label: "Processing",
          value: controlOrders.filter(
            (item) =>
              item.status === "PROCESSING",
          ).length,
          note: "Operational workflow",
        },
        {
          label: "Total units",
          value: controlOrders.reduce(
            (total, item) =>
              total + item.units,
            0,
          ),
          note: "Across current records",
        },
      ]}
      columns={[
        {
          key: "id",
          label: "Reference",
          strong: true,
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
      ]}
      records={controlOrders}
    />
  );
}

export default ControlOrdersPage;