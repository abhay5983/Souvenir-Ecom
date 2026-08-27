import { useState } from "react";
import { Link } from "react-router-dom";

function NewPartnerImportPage() {
  const [fileName, setFileName] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (!fileName.trim()) {
      setMessage(
        "Choose a workbook before continuing.",
      );
      return;
    }

    setMessage(
      "The demo import has been staged for validation. No backend upload was performed.",
    );
  }

  return (
    <section className="portal-main control-main">
      <div className="container">
        <nav
          className="breadcrumbs"
          aria-label="Breadcrumb"
        >
          <Link to="/control">
            Control Centre
          </Link>

          <span>/</span>

          <Link to="/control/partner-network/onboarding">
            Partner onboarding
          </Link>

          <span>/</span>

          <span>New import</span>
        </nav>

        <div className="control-titlebar">
          <div>
            <p className="eyebrow">
              Partner onboarding
            </p>

            <h1>Upload Partner Data</h1>

            <p>
              Stage a partner workbook for
              validation and maker-checker
              review.
            </p>
          </div>
        </div>

        <div className="form-shell">
          <form
            className="form-card"
            onSubmit={handleSubmit}
          >
            {message && (
              <div
                className={
                  fileName.trim()
                    ? "notice success"
                    : "notice danger"
                }
              >
                {message}
              </div>
            )}

            <div className="form-field">
              <label htmlFor="partner-file">
                Workbook name
              </label>

              <input
                id="partner-file"
                value={fileName}
                placeholder="school-partners.xlsx"
                onChange={(event) => {
                  setFileName(
                    event.target.value,
                  );
                  setMessage("");
                }}
              />

              <span className="field-help">
                Frontend demo only. No real file
                upload is performed.
              </span>
            </div>

            <button
              className="button"
              type="submit"
            >
              Stage import
            </button>
          </form>

          <aside className="summary-card">
            <h2>Safety checks</h2>

            <ul className="check-list">
              <li>
                Validate required columns
              </li>

              <li>
                Detect duplicate PartnerKeys
              </li>

              <li>
                Separate user and account data
              </li>

              <li>
                Require second approval
              </li>

              <li>
                Never generate plain passwords
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default NewPartnerImportPage;