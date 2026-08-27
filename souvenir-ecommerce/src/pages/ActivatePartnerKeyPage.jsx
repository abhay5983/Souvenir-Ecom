import { useState } from "react";
import { useNavigate } from "react-router-dom";




const demoInvitations = {
  "SPK-SC-DL-00003": {
    partnerKey: "SPK-SC-DL-00003",
    contact: "admin@greenfield.example",
    accountId: "ACC-SCHOOL-002",
    organisationName: "Greenfield Academy",
    role: "SCHOOL_ADMIN",
    roleLabel: "School account administrator",
  },

  "SPK-DS-DL-00004": {
    partnerKey: "SPK-DS-DL-00004",
    contact: "admin@northstar.example",
    accountId: "ACC-DIST-001",
    organisationName:
      "North Star Educational Distributors",
    role: "DISTRIBUTOR_ADMIN",
    roleLabel: "Distributor administrator",
  },
};

function normalizePartnerKey(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, "")
    .toLocaleUpperCase();
}

function normalizeContact(value) {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase();
}

function ActivatePartnerKeyPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [partnerKey, setPartnerKey] = useState(
    "SPK-SC-DL-00003",
  );

  const [contact, setContact] = useState(
    "admin@greenfield.example",
  );

  const [otp, setOtp] = useState("");

  const [termsAccepted, setTermsAccepted] =
    useState(false);

  const [invitation, setInvitation] =
    useState(null);

  const [notice, setNotice] = useState("");

  const [error, setError] = useState("");

  function clearMessages() {
    setError("");
    setNotice("");
  }

  function handleSendCode(event) {
    event.preventDefault();

    clearMessages();

    const normalizedKey =
      normalizePartnerKey(partnerKey);

    const normalizedContact =
      normalizeContact(contact);

    const found =
      demoInvitations[normalizedKey];

    /*
     * Keep the response generic.
     *
     * This matches the original prototype intent:
     * random users should not be able to enumerate
     * whether a PartnerKey/contact combination exists.
     */
    if (
      found &&
      normalizeContact(found.contact) ===
        normalizedContact
    ) {
      setInvitation(found);
    } else {
      setInvitation(null);
    }

    setNotice(
      "If the invitation details match, a one-time code has been issued.",
    );

    setStep(2);
  }

  function handleVerifyCode(event) {
    event.preventDefault();

    clearMessages();

    /*
     * Original screenshot uses 123456
     * for this activation MVP.
     */
    if (otp !== "123456") {
      setError(
        "The one-time code is invalid or expired.",
      );

      return;
    }

    /*
     * Even with correct OTP, we still need
     * a matching invitation.
     */
    if (!invitation) {
      setError(
        "The invitation could not be verified. Use different details and try again.",
      );

      return;
    }

    setStep(3);
  }

  function handleActivate(event) {
    event.preventDefault();

    clearMessages();

    if (!invitation) {
      setError(
        "The invitation is no longer available. Start again.",
      );

      setStep(1);
      return;
    }

    if (!termsAccepted) {
      setError(
        "Accept the terms and privacy notice before continuing.",
      );

      return;
    }

    /*
     * Frontend prototype only.
     *
     * In production this becomes a backend activation
     * transaction that creates/activates membership.
     */
    const activation = {
      partnerKey: invitation.partnerKey,
      accountId: invitation.accountId,
      organisationName:
        invitation.organisationName,
      role: invitation.role,
      contact: invitation.contact,
      activatedAt:
        new Date().toISOString(),
      status: "ACTIVE",
    };

    localStorage.setItem(
      `souvenir-partner-activation:${invitation.partnerKey}`,
      JSON.stringify(activation),
    );

    setStep(4);
  }

  function handleRestart() {
    setStep(1);
    setInvitation(null);
    setOtp("");
    setTermsAccepted(false);
    clearMessages();
  }

  return (
    <main
      id="main-content"
      className="activation-page"
    >
      <div className="activation-shell">
        <aside className="activation-aside">
          <div>
            <p className="eyebrow eyebrow-light">
              Secure activation
            </p>

            <h1>
              One Key.
              <br />
              Complete
              <br />
              Souvenir Access.
            </h1>

            <p className="activation-aside-copy">
              A PartnerKey identifies an approved
              organisation; registered contact
              verification authorises the person.
            </p>
          </div>

          <ul className="activation-benefits">
            <li>
              <span>✓</span>
              PartnerKey + invited contact
            </li>

            <li>
              <span>✓</span>
              Rate-limited one-time verification
            </li>

            <li>
              <span>✓</span>
              Terms acceptance and role membership
            </li>
          </ul>
        </aside>

        <section className="activation-main">
          <div
            className="activation-progress"
            aria-label="Activation progress"
          >
            <span
              className={
                step >= 1 ? "complete" : ""
              }
            />

            <span
              className={
                step >= 2 ? "complete" : ""
              }
            />

            <span
              className={
                step >= 3 ? "complete" : ""
              }
            />
          </div>

          {notice && (
            <div
              className="notice success activation-notice"
              role="status"
            >
              {notice}
            </div>
          )}

          {error && (
            <div
              className="notice danger activation-notice"
              role="alert"
            >
              {error}
            </div>
          )}

          {step === 1 && (
            <form
              className="activation-form"
              onSubmit={handleSendCode}
            >
              <p className="eyebrow">
                Step 1 of 3
              </p>

              <h2>
                Find your PartnerKey invitation
              </h2>

              <p className="lede-small">
                Enter the Souvenir PartnerKey™
                and contact used in your
                invitation.
              </p>

              <div className="form-field">
                <label htmlFor="activation-partner-key">
                  Souvenir PartnerKey™
                </label>

                <input
                  id="activation-partner-key"
                  value={partnerKey}
                  required
                  placeholder="SPK-SC-DL-00003"
                  onChange={(event) => {
                    setPartnerKey(
                      event.target.value,
                    );

                    clearMessages();
                  }}
                />

                <span className="field-help">
                  Your verified Souvenir business
                  identity. A PartnerKey is not a
                  password.
                </span>
              </div>

              <div className="form-field">
                <label htmlFor="activation-contact">
                  Registered email or mobile
                </label>

                <input
                  id="activation-contact"
                  value={contact}
                  required
                  placeholder="admin@greenfield.example"
                  onChange={(event) => {
                    setContact(
                      event.target.value,
                    );

                    clearMessages();
                  }}
                />
              </div>

              <button
                className="button activation-submit"
                type="submit"
              >
                Send one-time code
              </button>

              <p className="activation-security-note">
                The response remains generic so
                random contacts cannot be
                enumerated.
              </p>
            </form>
          )}

          {step === 2 && (
            <form
              className="activation-form"
              onSubmit={handleVerifyCode}
            >
              <p className="eyebrow">
                Step 2 of 3
              </p>

              <h2>Verify your contact</h2>

              <p className="lede-small">
                A demo one-time code has been
                sent to the registered channel.
                Enter <strong>123456</strong> in
                this local MVP.
              </p>

              <div className="form-field">
                <label htmlFor="activation-otp">
                  One-time code
                </label>

                <input
                  id="activation-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  required
                  onChange={(event) => {
                    setOtp(
                      event.target.value.replace(
                        /\D/g,
                        "",
                      ),
                    );

                    setError("");
                  }}
                />
              </div>

              <button
                className="button activation-submit"
                type="submit"
              >
                Verify code
              </button>

              <button
                className="activation-link-button"
                type="button"
                onClick={handleRestart}
              >
                Use different details
              </button>
            </form>
          )}

          {step === 3 && invitation && (
            <form
              className="activation-form"
              onSubmit={handleActivate}
            >
              <p className="eyebrow">
                Step 3 of 3
              </p>

              <h2>Accept your invitation</h2>

              <p className="lede-small">
                You are joining{" "}
                <strong>
                  {invitation.organisationName}
                </strong>{" "}
                as a{" "}
                <strong>
                  {invitation.roleLabel}
                </strong>
                .
              </p>

              <label className="activation-consent">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(event) =>
                    setTermsAccepted(
                      event.target.checked,
                    )
                  }
                />

                <span>
                  I agree to the terms and
                  acknowledge the privacy notice.
                  Legal text requires business
                  approval before launch.
                </span>
              </label>

              <button
                className="button activation-submit"
                type="submit"
              >
                Activate and continue
              </button>
            </form>
          )}

          {step === 4 && invitation && (
            <div className="activation-complete">
              <span
                className="activation-check"
                aria-hidden="true"
              >
                ✓
              </span>

              <p className="eyebrow">
                PartnerKey activated
              </p>

              <h2>
                You’re ready to begin
              </h2>

              <p>
                Your membership is active.
                Continue to My Souvenir.
              </p>

             <button
  className="button"
  type="button"
  onClick={() => {
    const activatedUser =
      findActivatedUser(
        invitation,
      );

    if (!activatedUser) {
      setError(
        "The activated invitation does not match a demo account.",
      );

      return;
    }

    const result =
      activatePartnerSession({
        id: activatedUser.id,
        name: activatedUser.name,
        email:
          activatedUser.email,
        mobile:
          activatedUser.mobile,
        role:
          activatedUser.role,

        accountId:
          activatedUser.accountId,

        accountName:
          activatedUser.accountName,

        partnerKey:
          invitation.partnerKey,

        territoryIds:
          activatedUser.territoryIds ??
          [],

        warehouseIds:
          activatedUser.warehouseIds ??
          [],

        controlKeyId:
          activatedUser.controlKeyId,
      });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    const destination =
      getDefaultRouteForRole(
        result.value.role,
      );

    navigate(destination, {
      replace: true,
    });
  }}
>
  Open My Souvenir
</button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default ActivatePartnerKeyPage;