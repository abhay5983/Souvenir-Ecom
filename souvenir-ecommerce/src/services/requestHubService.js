import { apiRequest } from "./api.js";

export const requestHubService = {
  submitOutreach: (draft) => apiRequest("/outreach-requests", { method: "POST", body: draft }),
  list: () => apiRequest("/request-hub"),
  update: (item, details) => apiRequest(`/request-hub/${item.source}/${item.id}`, { method: "POST", body: details }),
};
