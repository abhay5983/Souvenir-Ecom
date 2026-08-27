import ControlQueuePage from "../../components/control/ControlQueuePage.jsx";

import { controlStock } from "../../data/controlCentreData.js";

function ControlStockPage() {
  return (
    <ControlQueuePage
      title="Stock visibility"
      description="Review deterministic inventory availability, reservations and print status."
      stats={[
        {
          label: "Catalogue lines",
          value: controlStock.length,
          note: "Visible stock records",
        },
        {
          label: "Available units",
          value: controlStock.reduce(
            (total, item) =>
              total + item.available,
            0,
          ),
          note: "Across warehouses",
        },
        {
          label: "Reserved units",
          value: controlStock.reduce(
            (total, item) =>
              total + item.reserved,
            0,
          ),
          note: "Committed to orders",
        },
        {
          label: "Exceptions",
          value: controlStock.filter(
            (item) =>
              item.state !== "AVAILABLE",
          ).length,
          note: "Low stock or in press",
        },
      ]}
      columns={[
        {
          key: "id",
          label: "Variant ID",
          strong: true,
        },
        {
          key: "title",
          label: "Title",
        },
        {
          key: "isbn",
          label: "ISBN",
        },
        {
          key: "warehouse",
          label: "Warehouse",
        },
        {
          key: "available",
          label: "Available",
        },
        {
          key: "reserved",
          label: "Reserved",
        },
        {
          key: "state",
          label: "Stock state",
          type: "status",
        },
      ]}
      records={controlStock}
    />
  );
}

export default ControlStockPage;