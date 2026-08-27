import ControlQueuePage from "../../components/control/ControlQueuePage.jsx";

import { controlDispatch } from "../../data/controlCentreData.js";

function ControlDispatchPage() {
  return (
    <ControlQueuePage
      title="Dispatch operations"
      description="Review packed consignments, shipment readiness and dispatch status."
      stats={[
        {
          label: "Dispatch records",
          value: controlDispatch.length,
          note: "Current consignments",
        },
        {
          label: "Ready",
          value: controlDispatch.filter(
            (item) =>
              item.status ===
              "READY_FOR_DISPATCH",
          ).length,
          note: "Awaiting carrier handover",
        },
        {
          label: "Dispatched",
          value: controlDispatch.filter(
            (item) =>
              item.status === "DISPATCHED",
          ).length,
          note: "Carrier handover complete",
        },
        {
          label: "Packages",
          value: controlDispatch.reduce(
            (total, item) =>
              total + item.packages,
            0,
          ),
          note: "Across current records",
        },
      ]}
      columns={[
        {
          key: "id",
          label: "Dispatch ID",
          strong: true,
        },
        {
          key: "record",
          label: "Order",
        },
        {
          key: "accountName",
          label: "Account",
        },
        {
          key: "packages",
          label: "Packages",
        },
        {
          key: "destination",
          label: "Destination",
        },
        {
          key: "status",
          label: "Status",
          type: "status",
        },
      ]}
      records={controlDispatch}
    />
  );
}

export default ControlDispatchPage;