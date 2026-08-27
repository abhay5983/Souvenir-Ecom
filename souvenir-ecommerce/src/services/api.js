let csrfToken = null;

async function getCsrfToken() {
  if (csrfToken) return csrfToken;
  const response = await fetch("/api/auth/csrf", { credentials: "include" });
  const payload = await response.json();
  csrfToken = payload.csrfToken;
  return csrfToken;
}

export async function apiRequest(path, options = {}) {
  const method = options.method ?? "GET";
  const headers = { Accept: "application/json", ...(options.headers ?? {}) };
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    headers["X-CSRFToken"] = await getCsrfToken();
  }
  const response = await fetch(`/api${path}`, {
    ...options,
    method,
    headers,
    credentials: "include",
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  // Django rotates the CSRF secret after authentication changes.
  // Never reuse the token that was obtained before login or logout.
  if (path === "/auth/login" || path === "/auth/logout") {
    csrfToken = null;
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.message ?? "The request could not be completed.");
  }
  return payload.value ?? payload;
}
