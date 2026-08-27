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

function LoginPage() {
  const navigate = useNavigate();

  const {
    authenticated,
    role,
    login,
  } = useAuth();

  const [formData, setFormData] =
    useState({
      identity: "",
      password: "",
    });

  const [error, setError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  if (authenticated) {
    return (
      <Navigate
        to={getDefaultRouteForRole(role)}
        replace
      />
    );
  }

  function handleChange(event) {
    const { name, value } =
      event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitting(true);
    setError("");

    const result = await login({
      identity: formData.identity,
      password: formData.password,
    });

    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    const destination =
      getDefaultRouteForRole(
        result.value.role,
      );

    navigate(destination, {
      replace: true,
      state: {
        flash: {
          tone: "success",
          message: `Welcome back, ${result.value.name}.`,
        },
      },
    });
  }

  return (
    <main
      id="main-content"
      className="auth-page"
    >
      <div className="container">
        <div className="auth-layout">
          <aside className="auth-aside">
            <div>
              <p className="eyebrow eyebrow-light">
                Souvenir Business
              </p>

              <h1>
                Welcome back to Souvenir
              </h1>

              <p>
                Partner pricing, orders and
                restricted resources stay
                inside your authorised
                organisation context.
              </p>
            </div>

            <ul className="security-points">
              <li>
                No public self-registration
              </li>

              <li>
                Secure verification and
                scoped roles
              </li>

              <li>
                Audited on-behalf account work
              </li>
            </ul>
          </aside>

          <section
            className="auth-main"
            aria-labelledby="login-title"
          >
            <p className="eyebrow">
              Partner Login
            </p>

            <h2 id="login-title">
              Sign in securely
            </h2>

            <p>
              Use your registered email or
              mobile number.
            </p>

            <div className="notice warning">
              <strong>
                Connected environment:
              </strong>{" "}
              authentication and role access are
              verified by Django using a secure
              server session.
            </div>

            {error && (
              <div
                className="notice danger flash"
                role="alert"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label htmlFor="login-identity">
                  Registered email or mobile
                </label>

                <input
                  id="login-identity"
                  name="identity"
                  type="text"
                  value={formData.identity}
                  autoComplete="username"
                  required
                  placeholder="name@school.example"
                  onChange={handleChange}
                />
              </div>

              <div className="form-field">
                <label htmlFor="login-password">
                  Password or one-time code
                </label>

                <input
                  id="login-password"
                  name="password"
                  type="password"
                  value={formData.password}
                  autoComplete="current-password"
                  required
                  placeholder="Enter secure code"
                  onChange={handleChange}
                />
              </div>

              <button
                className="button"
                type="submit"
                disabled={submitting}
              >
                {submitting
                  ? "Signing in..."
                  : "Sign in"}
              </button>
            </form>

            <details className="demo-access">
              <summary>
                Demo login accounts
              </summary>

              <p>
                <strong>School admin:</strong>
                <br />
                admin@greenfield.example
              </p>

              <p>
                <strong>Teacher:</strong>
                <br />
                teacher@greenfield.example
              </p>

              <p>
                <strong>Distributor:</strong>
                <br />
                admin@northstar.example
              </p>

              <p>
                <strong>Business Manager:</strong>
                <br />
                bm@souvenir.example
              </p>

              <p>
                <strong>Password:</strong>
                <br />
                123456
              </p>
            </details>

            <p className="auth-switch-link">
              Received an invitation?{" "}
              <Link to="/activate">
                Activate PartnerKey
              </Link>

              <br />

              Souvenir staff?{" "}
              <Link to="/control-access">
                Use Control Centre access
              </Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

export default LoginPage;
