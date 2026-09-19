export const DELIVERY_OPTIONS = {
  STANDARD: {
    code: "STANDARD",
    label: "Standard delivery",
    charge: 200,
    timeline: "6–8 working days",
  },
  PRIORITY: {
    code: "PRIORITY",
    label: "Priority delivery",
    charge: 500,
    timeline: "2–3 working days",
  },
};

export const DEFAULT_DELIVERY_OPTION = "STANDARD";

export function getDeliveryOption(code) {
  return DELIVERY_OPTIONS[code] ?? DELIVERY_OPTIONS[DEFAULT_DELIVERY_OPTION];
}
