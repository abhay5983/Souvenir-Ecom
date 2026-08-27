import ControlQueuePage from "../../components/control/ControlQueuePage.jsx";

import {
  partnerOnboardingBatches,
} from "../../data/controlCentreData.js";

function PartnerOnboardingPage() {
  return (
    <ControlQueuePage
      eyebrow="Souvenir Partner Onboarding Centre"
      title="Partner onboarding"
      description="Review staged partner imports, validation issues and maker-checker approval."
      action={{
        label: "New import",
        to: "/control/partner-network/onboarding/new",
      }}
      stats={[
        {
          label: "Import batches",
          value:
            partnerOnboardingBatches.length,
          note: "Versioned history",
        },
        {
          label: "Total records",
          value:
            partnerOnboardingBatches.reduce(
              (total, item) =>
                total + item.records,
              0,
            ),
          note: "Partner rows reviewed",
        },
        {
          label: "Valid records",
          value:
            partnerOnboardingBatches.reduce(
              (total, item) =>
                total + item.valid,
              0,
            ),
          note: "Ready after approval",
        },
        {
          label: "Issues",
          value:
            partnerOnboardingBatches.reduce(
              (total, item) =>
                total + item.issues,
              0,
            ),
          note: "Correction required",
        },
      ]}
      columns={[
        {
          key: "id",
          label: "Batch ID",
          strong: true,
        },
        {
          key: "fileName",
          label: "Source file",
        },
        {
          key: "records",
          label: "Records",
        },
        {
          key: "valid",
          label: "Valid",
        },
        {
          key: "issues",
          label: "Issues",
        },
        {
          key: "status",
          label: "Status",
          type: "status",
        },
      ]}
      records={partnerOnboardingBatches}
    />
  );
}

export default PartnerOnboardingPage;