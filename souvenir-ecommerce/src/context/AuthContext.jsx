import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { authenticateUser, clearAuthSession } from "../services/authService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const loading = false;

  const login = useCallback(async (credentials) => {
    const result = await authenticateUser(credentials);
    if (result.ok) setUser(result.value);
    return result;
  }, []);

  const logout = useCallback(async () => {
    await clearAuthSession();
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user, role: user?.role ?? "PUBLIC", authenticated: Boolean(user), loading, login, logout,
  }), [user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
}
