import { apiRequest } from "./api.js";

export const workflowService = {
  list: () => apiRequest("/requests"),
  get: (id) => apiRequest(`/requests/${id}`),
  verifyPartner: (partnerKey) => apiRequest("/partners/verify", { method: "POST", body: { partnerKey } }),
  create: (request) => apiRequest("/requests", { method: "POST", body: request }),
  action: (id, action, details = {}) => apiRequest(`/requests/${id}/action`, { method: "POST", body: { action, ...details } }),
};
