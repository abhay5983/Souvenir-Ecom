const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "/api";

class ApiError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "ApiError";
    this.status = options.status || 0;
    this.code = options.code || "UNKNOWN_ERROR";
    this.details = options.details || null;
  }
}

async function request(
  endpoint,
  {
    method = "GET",
    body,
    signal,
    idempotencyKey,
  } = {},
) {
  const headers = {
    Accept: "application/json",
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }

  let response;

  try {
    response = await fetch(
      `${API_BASE}${endpoint}`,
      {
        method,
        headers,
        credentials: "include",
        signal,
        body:
          body !== undefined
            ? JSON.stringify(body)
            : undefined,
      },
    );
  } catch (error) {
    if (error?.name === "AbortError") {
      throw error;
    }

    throw new ApiError(
      "Unable to connect to the fulfilment service.",
      {
        code: "NETWORK_ERROR",
      },
    );
  }

  const contentType =
    response.headers.get("content-type") || "";

  let payload = null;

  if (contentType.includes("application/json")) {
    payload = await response.json();
  }

  if (!response.ok) {
    throw new ApiError(
      payload?.message ||
        payload?.error?.message ||
        "The fulfilment request could not be completed.",
      {
        status: response.status,
        code:
          payload?.code ||
          payload?.error?.code ||
          "REQUEST_FAILED",
        details: payload,
      },
    );
  }

  return payload;
}

function createIdempotencyKey(prefix, recordId) {
  return `${prefix}:${recordId}:${crypto.randomUUID()}`;
}

export const inventoryFulfilmentService = {
  async listReady({ signal } = {}) {
    return request(
      "/control/fulfilment?status=ready",
      { signal },
    );
  },

  async prepareDocument(
    recordId,
    version,
    { signal } = {},
  ) {
    return request(
      `/control/fulfilment/${encodeURIComponent(
        recordId,
      )}/prepare`,
      {
        method: "POST",
        signal,
        idempotencyKey:
          createIdempotencyKey(
            "fulfilment-prepare",
            recordId,
          ),
        body: {
          expectedVersion: version,
        },
      },
    );
  },

  async startPacking(
    {
      recordId,
      documentId,
      version,
      idempotencyKey,
    },
    { signal } = {},
  ) {
    return request(
      `/control/fulfilment/${encodeURIComponent(
        recordId,
      )}/start-packing`,
      {
        method: "POST",
        signal,

        // Preserve this key across retries.
        idempotencyKey,

        body: {
          documentId,
          expectedVersion: version,
        },
      },
    );
  },

  async reprintDocument(
    {
      recordId,
      reason,
    },
    { signal } = {},
  ) {
    return request(
      `/control/fulfilment/${encodeURIComponent(
        recordId,
      )}/reprint`,
      {
        method: "POST",
        signal,
        idempotencyKey:
          createIdempotencyKey(
            "fulfilment-reprint",
            recordId,
          ),
        body: {
          reason,
        },
      },
    );
  },
};

export { ApiError };