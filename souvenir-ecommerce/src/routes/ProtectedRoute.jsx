import {
  Navigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

function ProtectedRoute({
  children,
  allowedRoles,
}) {
  const location = useLocation();

  const {
    authenticated,
    role,
    loading,
  } = useAuth();

  if (loading) {
    return <div className="portal-main"><div className="container"><p>Checking your session...</p></div></div>;
  }

  if (!authenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  if (
    Array.isArray(allowedRoles) &&
    !allowedRoles.includes(role)
  ) {
    return (
      <Navigate
        to="/app"
        replace
        state={{
          flash: {
            tone: "warning",
            message:
              "Your role does not have access to that workspace.",
          },
        }}
      />
    );
  }

  return children;
}

export default ProtectedRoute;
