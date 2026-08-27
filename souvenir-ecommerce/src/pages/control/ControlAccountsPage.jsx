import ControlQueuePage from "../../components/control/ControlQueuePage.jsx";

import { controlAccounts } from "../../data/controlCentreData.js";

function ControlAccountsPage() {
  const activeAccounts =
    controlAccounts.filter(
      (account) =>
        account.status === "ACTIVE",
    ).length;

  const assistedAccounts =
    controlAccounts.filter(
      (account) =>
        account.accessMode ===
        "ASSISTED_ONLY",
    ).length;

  return (
    <ControlQueuePage
      title="Partner accounts"
      description="Review school, distributor and partner account identity, access and capability."
      action={{
        label: "Onboard partner",
        to: "/control/partner-network/onboarding",
      }}
      stats={[
        {
          label: "Total accounts",
          value: controlAccounts.length,
          note: "Operational partner records",
        },
        {
          label: "Active",
          value: activeAccounts,
          note: "Dashboard or assisted access",
        },
        {
          label: "Assisted-only",
          value: assistedAccounts,
          note: "Representative-led ordering",
        },
        {
          label: "Pending review",
          value:
            controlAccounts.length -
            activeAccounts,
          note: "Verification required",
        },
      ]}
      columns={[
        {
          key: "id",
          label: "Account ID",
          strong: true,
        },
        {
          key: "name",
          label: "Organisation",
        },
        {
          key: "type",
          label: "Type",
        },
        {
          key: "partnerKey",
          label: "PartnerKey",
        },
        {
          key: "location",
          label: "Location",
        },
        {
          key: "accessMode",
          label: "Access mode",
        },
        {
          key: "status",
          label: "Status",
          type: "status",
        },
      ]}
      records={controlAccounts}
    />
  );
}

export default ControlAccountsPage;