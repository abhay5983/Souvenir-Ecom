async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = payload.detail;
    const message = Array.isArray(detail) ? detail.map((item) => item.msg).join(" ") : detail;
    throw new Error(message || "The request could not be completed.");
  }
  return payload;
}

export const ecommerceService = {
  catalogue: () => request("/catalogue"),
  createOrder: (order) => request("/orders", { method: "POST", body: order }),
  trackOrder: (details) => request("/orders/track", { method: "POST", body: details }),
  shippingQuote: (details) => request("/shipping/serviceability", { method: "POST", body: details }),
  integrationStatus: () => request("/integrations/status"),
  retryPayment: (orderNumber, mobile) => request(`/orders/${encodeURIComponent(orderNumber)}/payment-session`, {
    method: "POST", body: { mobile },
  }),
};
