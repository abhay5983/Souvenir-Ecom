import ControlQueuePage from "../../components/control/ControlQueuePage.jsx";

import { controlInventory } from "../../data/controlCentreData.js";

function ControlInventoryPage() {
  return (
    <ControlQueuePage
      title="Inventory and fulfilment"
      description="Coordinate stock reservation, picking, packing and fulfilment readiness."
      stats={[
        {
          label: "Active fulfilments",
          value: controlInventory.length,
          note: "Operational records",
        },
        {
          label: "Picking",
          value: controlInventory.filter(
            (item) =>
              item.status === "PICKING",
          ).length,
          note: "Warehouse action active",
        },
        {
          label: "Stock reserved",
          value: controlInventory.filter(
            (item) =>
              item.status ===
              "STOCK_RESERVED",
          ).length,
          note: "Ready for picking",
        },
        {
          label: "Exceptions",
          value: 0,
          note: "No blocked lines",
        },
      ]}
      columns={[
        {
          key: "id",
          label: "Fulfilment ID",
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
          key: "warehouse",
          label: "Warehouse",
        },
        {
          key: "lines",
          label: "Lines",
        },
        {
          key: "status",
          label: "Status",
          type: "status",
        },
      ]}
      records={controlInventory}
    />
  );
}

export default ControlInventoryPage;