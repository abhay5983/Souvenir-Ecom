import { apiRequest } from "./api.js";

export async function authenticateUser({ identity, password }) {
  try {
    const value = await apiRequest("/auth/login", { method: "POST", body: { identity, password } });
    return { ok: true, value };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

export async function restoreAuthSession() {
  try {
    return await apiRequest("/auth/me");
  } catch {
    return null;
  }
}

export async function clearAuthSession() {
  try {
    await apiRequest("/auth/logout", { method: "POST" });
  } catch {
    // Local logout still completes if the server session has expired.
  }
}
