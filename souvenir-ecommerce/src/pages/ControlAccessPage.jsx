import { useState } from "react";
import {
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import {
  getDefaultRouteForRole,
} from "../services/roleService.js";

const CONTROL_IDENTITIES = {
  "SCK-MGT-HQ-0001": {
    id: "USR-MGT-001",
    name: "Management Super Master",
    role: "MANAGEMENT_SUPER_MASTER",
    password: "MgtDemo@2026",
    controlKeyId: "SCK-MGT-HQ-0001",
  },

  "SCK-TECH-HQ-0002": {
    id: "USR-TECH-001",
    name: "Technology Master",
    role: "TECH_MASTER",
    password: "TechDemo@2026",
    controlKeyId: "SCK-TECH-HQ-0002",
  },

  "SCK-PNA-HQ-0011": {
    id: "USR-PNA-001",
    name: "Partner Network Administrator",
    role: "PARTNER_NETWORK_ADMIN",
    password: "PartnerDemo@2026",
    controlKeyId: "SCK-PNA-HQ-0011",
  },

  "SCK-CO-UP-0014": {
    id: "USR-COORD-001",
    name: "Coordinator",
    role: "COORDINATOR",
    password: "CoordDemo@2026",
    controlKeyId: "SCK-CO-UP-0014",
    territoryIds: ["DEMO-NORTH"],
  },

  "SCK-CH-NR-0003": {
    id: "USR-COORD-H-001",
    name: "Coordinator Head",
    role: "COORDINATOR_HEAD",
    password: "CoordHead@2026",
    controlKeyId: "SCK-CH-NR-0003",
    territoryIds: ["DEMO-NORTH"],
  },

  "SCK-INV-NOI-0007": {
    id: "USR-INV-001",
    name: "Inventory Operator",
    role: "INVENTORY",
    password: "Inventory@2026",
    controlKeyId: "SCK-INV-NOI-0007",
    warehouseIds: ["WH-NOI"],
  },

  "SCK-INV-NOI-0008": {
    id: "USR-INV-SUP-001",
    name: "Inventory Supervisor",
    role: "INVENTORY_SUPERVISOR",
    password: "InventorySup@2026",
    controlKeyId: "SCK-INV-NOI-0008",
    warehouseIds: ["WH-NOI"],
  },

  "SCK-DSP-NOI-0004": {
    id: "USR-DSP-001",
    name: "Dispatch Operator",
    role: "DISPATCH",
    password: "Dispatch@2026",
    controlKeyId: "SCK-DSP-NOI-0004",
    warehouseIds: ["WH-NOI"],
  },

  "SCK-FIN-HQ-0006": {
    id: "USR-FIN-001",
    name: "Finance Controller",
    role: "FINANCE",
    password: "Finance@2026",
    controlKeyId: "SCK-FIN-HQ-0006",
  },

  "SCK-AUD-HQ-0002": {
    id: "USR-AUD-001",
    name: "Auditor",
    role: "AUDITOR",
    password: "Audit@2026",
    controlKeyId: "SCK-AUD-HQ-0002",
  },

  "SCK-SUPER-HQ-0001": {
    id: "USR-SUPER-001",
    name: "Super Administrator",
    role: "SUPER_ADMIN",
    password: "SuperDemo@2026",
    controlKeyId: "SCK-SUPER-HQ-0001",
  },
};

function normaliseControlKey(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, "")
    .toLocaleUpperCase();
}

function ControlAccessPage() {
  const navigate = useNavigate();

  const auth = useAuth();

  const authenticated =
    auth.authenticated ?? Boolean(auth.user);

  const currentRole =
    auth.role ??
    auth.user?.role ??
    "PUBLIC";

  const [formData, setFormData] =
    useState({
      controlKey: "SCK-MGT-HQ-0001",
      password: "",
    });

  const [error, setError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  if (
    authenticated &&
    currentRole !== "PUBLIC"
  ) {
    return (
      <Navigate
        to={getDefaultRouteForRole(
          currentRole,
        )}
        replace
      />
    );
  }

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    setSubmitting(true);
    setError("");

    const controlKey =
      normaliseControlKey(
        formData.controlKey,
      );

    const identity =
      CONTROL_IDENTITIES[
        controlKey
      ];

    if (
      !identity ||
      identity.password !==
        formData.password
    ) {
      setError(
        "The ControlKey or password is incorrect.",
      );

      setSubmitting(false);
      return;
    }

    /*
     * Preferred:
     * let AuthContext perform the login
     * instead of writing auth state here.
     *
     * Your AuthContext should expose
     * loginControl() for internal identities.
     */

    const result =
      auth.loginControl?.({
        ...identity,
      });

    if (
      result &&
      result.ok === false
    ) {
      setError(
        result.error ??
          "Control Centre access could not be opened.",
      );

      setSubmitting(false);
      return;
    }

    /*
     * Temporary fallback if loginControl()
     * has not been added yet.
     */
    if (!auth.loginControl) {
      sessionStorage.setItem(
        "souvenir-control-session",
        JSON.stringify({
          user: identity,
          authenticated: true,
          startedAt:
            new Date().toISOString(),
        }),
      );
    }

    navigate(
      getDefaultRouteForRole(
        identity.role,
      ),
      {
        replace: true,
        state: {
          flash: {
            tone: "success",
            message: `Control Centre access opened for ${identity.name}.`,
          },
        },
      },
    );
  }

  return (
    <main
      id="main-content"
      className="control-access-page"
    >
      <div className="control-access-shell">
        <aside className="control-access-aside">
          <div>
            <p className="eyebrow eyebrow-light">
              Souvenir Control Centre
            </p>

            <h1>
              Authorised
              <br />
              Access.
              <br />
              Accountable
              <br />
              Action.
            </h1>

            <p className="control-access-copy">
              Individual ControlKeys identify
              management, coordinators,
              inventory, dispatch, finance and
              technology staff.
            </p>
          </div>
        </aside>

        <section className="control-access-main">
          <p className="eyebrow">
            Internal staff access
          </p>

          <h2>
            Sign in with your ControlKey
          </h2>

          <p className="control-access-description">
            A ControlKey is an identifier, not a
            password. This local build uses
            named demonstration identities only.
          </p>

          {error && (
            <div
              className="notice danger flash"
              role="alert"
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
          >
            <div className="form-field">
              <label htmlFor="control-key">
                Souvenir ControlKey™
              </label>

              <input
                id="control-key"
                name="controlKey"
                type="text"
                value={
                  formData.controlKey
                }
                autoComplete="username"
                required
                placeholder="SCK-MGT-HQ-0001"
                onChange={
                  handleChange
                }
              />
            </div>

            <div className="form-field">
              <label htmlFor="control-password">
                Password
              </label>

              <input
                id="control-password"
                name="password"
                type="password"
                value={
                  formData.password
                }
                autoComplete="current-password"
                required
                onChange={
                  handleChange
                }
              />
            </div>

            <button
              className="button control-access-submit"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Opening..."
                : "Open Control Centre"}
            </button>
          </form>

          <details
            className="demo-access control-demo-access"
            open
          >
            <summary>
              Demo management credentials
            </summary>

            <p>
              <strong>
                ControlKey:
              </strong>{" "}
              SCK-MGT-HQ-0001
            </p>

            <p>
              <strong>
                Password:
              </strong>{" "}
              MgtDemo@2026
            </p>

            <p className="field-help">
              Production requires secure server
              sessions, MFA, device controls and
              individual password management.
            </p>
          </details>

          <p className="auth-switch-link">
            School, distributor or partner?{" "}
            <Link to="/login">
              Partner Login
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}

export default ControlAccessPage;