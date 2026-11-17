let csrfToken = null;

async function getCsrfToken() {
  if (csrfToken) return csrfToken;
  const response = await fetch('/api/auth/csrf', { credentials: 'same-origin' });
  if (!response.ok) throw new Error('Secure checkout could not be initialized.');
  const payload = await response.json();
  csrfToken = payload.csrfToken;
  return csrfToken;
}

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers ?? {}) };
  if (options.method && !["GET", "HEAD", "OPTIONS"].includes(options.method)) {
    headers["X-CSRFToken"] = await getCsrfToken();
  }
  const response = await fetch(`/api${path}`, {
    cache: "no-store",
    credentials: "same-origin",
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = payload.detail;
    const message = Array.isArray(detail) ? detail.map((item) => item.msg).join(" ") : detail;
    const requestError = new Error(message || "The request could not be completed.");
    requestError.code = payload.code;
    requestError.status = response.status;
    throw requestError;
  }
  return payload;
}

export const ecommerceService = {
  catalogue: () => request("/catalogue"),
  studentResources: () => request("/digital-resources/student"),
  studentResourceAccess: (bookIsbn, isbn) => request("/digital-resources/student/access", { method: "POST", body: { book_isbn: bookIsbn, isbn } }),
  teacherResource: (isbn, password) => request("/digital-resources/teacher", { method: "POST", body: { isbn, password } }),
  createDigitalResourceRequest: (details) => request("/digital-resource-requests", { method: "POST", body: details }),
  createOrder: (order) => request("/create-order", { method: "POST", body: order }),
  verifyPayment: (payment) => request("/verify-payment", { method: "POST", body: payment }),
  trackOrder: (details) => request("/orders/track", { method: "POST", body: details }),
  integrationStatus: () => request("/integrations/status"),
  retryPayment: (orderNumber, mobile) => request(`/orders/${encodeURIComponent(orderNumber)}/payment-session`, {
    method: "POST", body: { mobile, new_attempt: true },
  }),
};
