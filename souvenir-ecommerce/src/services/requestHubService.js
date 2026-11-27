import { apiRequest } from "./api.js";

export const requestHubService = {
  submitOutreach: (draft) => apiRequest("/outreach-requests", { method: "POST", body: draft }),
  session: () => apiRequest("/request-hub/session"),
  login: (credentials) => apiRequest("/request-hub/login", { method: "POST", body: credentials }),
  logout: () => apiRequest("/request-hub/logout", { method: "POST" }),
  list: () => apiRequest("/request-hub"),
  update: (item, details) => apiRequest(`/request-hub/${item.source}/${item.id}`, { method: "POST", body: details }),
};
