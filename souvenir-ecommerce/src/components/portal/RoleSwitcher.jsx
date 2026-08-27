import { useNavigate } from "react-router-dom";

import {
  DEMO_ROLES,
  ROLE_LABELS,
} from "../../config/roles.js";

import { useAuth } from "../../context/AuthContext.jsx";

import {
  getDefaultRouteForRole,
} from "../../services/roleService.js";

function RoleSwitcher() {
  const navigate = useNavigate();

  const {
    user,
    switchDemoRole,
    logout,
  } = useAuth();

  function handleRoleChange(event) {
    const role = event.target.value;

    switchDemoRole(role);

    navigate(
      getDefaultRouteForRole(role),
      {
        replace: true,
      },
    );
  }

  function handleSignOut() {
    logout();

    navigate("/login", {
      replace: true,
    });
  }

  return (
    <div className="role-switcher">
      <label htmlFor="demo-role">
        Demo role
      </label>

      <select
        id="demo-role"
        value={user?.role ?? ""}
        onChange={handleRoleChange}
      >
        {DEMO_ROLES.map((role) => (
          <option
            key={role}
            value={role}
          >
            {ROLE_LABELS[role]}
          </option>
        ))}
      </select>

      <button
        className="button ghost small"
        type="button"
        onClick={handleSignOut}
      >
        Sign out
      </button>
    </div>
  );
}

export default RoleSwitcher;