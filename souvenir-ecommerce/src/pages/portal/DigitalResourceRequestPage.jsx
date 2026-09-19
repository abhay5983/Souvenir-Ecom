
import { useMemo, useState } from "react";

import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";
import { useCatalogue } from "../../context/CatalogueContext.jsx";
import { ecommerceService } from "../../services/ecommerceService.js";

/* =========================================================
   DIGITAL RESOURCE REQUEST
   Correct flow:
   1. Your role
   2. Your details
   3. Select series
   4. Select resources
   5. Verify & submit
========================================================= */

const STEPS = [
  "Your role",
  "Your details",
  "Select series",
  "Select resources",
  "Verify & submit",
];

const REQUESTER_ROLES = [
  {
    value: "STUDENT",
    number: "01",
    title: "Student",
    description:
      "I am requesting learning support for my own class.",
  },
  {
    value: "TEACHER_SCHOOL_ADMIN",
    number: "02",
    title: "Teacher / School Administrator",
    description:
      "I teach, coordinate academics or manage learning resources at a school.",
  },
  {
    value: "AUTHORIZED_SALES_PERSON",
    number: "03",
    title: "Authorised Souvenir Sales Person",
    description:
      "I am a Souvenir sales team member requesting an approved resource for a school or educator.",
  },
  {
    value: "AUTHORIZED_BOOKSELLER_DISTRIBUTOR",
    number: "04",
    title: "Authorised Bookseller / Distributor",
    description:
      "I am an authorised trade partner requesting a resource for a verified school or educator.",
  },
];

const RESOURCE_OPTIONS = [
  {
    code: "EBOOK",
    title: "E-Book",
    description:
      "Read a supported Souvenir title in a secure digital format.",
    teacherTool: false,
    physicalResource: false,
  },
  {
    code: "AUDIO_BOOK",
    title: "Audio Book",
    description:
      "Narrated lessons, stories and pronunciation support.",
    teacherTool: false,
    physicalResource: false,
  },
  {
    code: "PODCAST",
    title: "Podcast",
    description:
      "Series-linked listening episodes and learning discussions.",
    teacherTool: false,
    physicalResource: false,
  },
  {
    code: "VIDEO",
    title: "Videos",
    description:
      "Chapter-linked concept explanations and learning videos.",
    teacherTool: false,
    physicalResource: false,
  },
  {
    code: "INTERACTIVE_ACTIVITY",
    title: "Interactive Activities",
    description:
      "Clickable exercises, games and guided classroom practice.",
    teacherTool: false,
    physicalResource: false,
  },
  {
    code: "QUIZ",
    title: "Quiz",
    description:
      "Topic and chapter-based quizzes for practice and feedback.",
    teacherTool: false,
    physicalResource: false,
  },
  {
    code: "TEST_YOURSELF",
    title: "Test Yourself",
    description:
      "Self-paced questions and MCQ practice.",
    teacherTool: false,
    physicalResource: false,
  },
  {
    code: "QUESTION_BANK",
    title: "Question Bank",
    description:
      "Curated chapter-wise questions for supported titles.",
    teacherTool: false,
    physicalResource: false,
  },
  {
    code: "TEACHER_RESOURCE",
    title: "Teacher Resources",
    description:
      "Lesson plans, teaching notes, worksheets and presentation aids.",
    teacherTool: true,
    physicalResource: false,
  },
  {
    code: "QUESTION_PAPER_GENERATOR",
    title: "Question Paper Generator",
    description:
      "Create customised question papers for classroom assessment.",
    teacherTool: true,
    physicalResource: false,
  },
  {
    code: "EXAM_PRO",
    title: "Exam Pro",
    description:
      "Assessment, revision and examination tools.",
    teacherTool: true,
    physicalResource: false,
  },
  {
    code: "ANSWER_KEY",
    title: "Answer Key",
    description:
      "Verified solutions and marking support for educators.",
    teacherTool: true,
    physicalResource: false,
  },
  {
    code: "OFFLINE_SMARTBOARD_PENDRIVE",
    title: "Offline Smart Board Pen Drive",
    description:
      "Licensed offline package for compatible smart boards.",
    teacherTool: false,
    physicalResource: true,
  },
];

const INDIA_STATES = [
  ["AN", "Andaman and Nicobar Islands"],
  ["AP", "Andhra Pradesh"],
  ["AR", "Arunachal Pradesh"],
  ["AS", "Assam"],
  ["BR", "Bihar"],
  ["CH", "Chandigarh"],
  ["CG", "Chhattisgarh"],
  ["DN", "Dadra and Nagar Haveli and Daman and Diu"],
  ["DL", "Delhi"],
  ["GA", "Goa"],
  ["GJ", "Gujarat"],
  ["HR", "Haryana"],
  ["HP", "Himachal Pradesh"],
  ["JK", "Jammu and Kashmir"],
  ["JH", "Jharkhand"],
  ["KA", "Karnataka"],
  ["KL", "Kerala"],
  ["LA", "Ladakh"],
  ["LD", "Lakshadweep"],
  ["MP", "Madhya Pradesh"],
  ["MH", "Maharashtra"],
  ["MN", "Manipur"],
  ["ML", "Meghalaya"],
  ["MZ", "Mizoram"],
  ["NL", "Nagaland"],
  ["OD", "Odisha"],
  ["PY", "Puducherry"],
  ["PB", "Punjab"],
  ["RJ", "Rajasthan"],
  ["SK", "Sikkim"],
  ["TN", "Tamil Nadu"],
  ["TS", "Telangana"],
  ["TR", "Tripura"],
  ["UP", "Uttar Pradesh"],
  ["UK", "Uttarakhand"],
  ["WB", "West Bengal"],
];

const DEMO_SALES_PARTNER_KEY = "SPK-ST-NR-00147";
const DEMO_OTP = "246810";

const INITIAL_FORM = {
  requesterRole: "",

  requesterName: "",
  requesterDesignation: "",
  requesterOrganisation: "",

  schoolInstitutionName: "",
  schoolBoard: "",

  email: "",
  mobile: "",

  stateCode: "",
  pinCode: "",

  parentGuardianName: "",
  guardianContact: "",
  guardianConsentConfirmed: false,

  partnerKey: "",
  partnerOtp: "",
  partnerKeyVerified: false,

  recipientName: "",
  recipientDesignation: "",
  recipientEmail: "",
  recipientMobile: "",
  recipientConsentConfirmed: false,

  subject: "",
  seriesId: "",
  classIds: [],

  resourceCodes: [],

  purpose: "",
  usageDetails: "",
  authorisedConfirmed: false,
  privacyAcknowledged: false,
};

/* =========================================================
   HELPERS
========================================================= */

function normalizePartnerKey(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(value || "").trim(),
  );
}

function isValidMobile(value) {
  const digits = String(value || "").replace(/\D/g, "");

  const normalized =
    digits.length === 12 && digits.startsWith("91")
      ? digits.slice(2)
      : digits;

  return /^[6-9][0-9]{9}$/.test(normalized);
}

function isValidPin(value) {
  return /^[1-9][0-9]{5}$/.test(
    String(value || "").trim(),
  );
}

/* =========================================================
   PROGRESS
========================================================= */

function ProgressSteps({ currentStep }) {
  return (
    <ol
      className="digital-request-progress"
      aria-label="Digital resource request progress"
    >
      {STEPS.map((label, index) => {
        const stepNumber = index + 1;

        let status = "";

        if (currentStep > stepNumber) {
          status = "complete";
        } else if (currentStep === stepNumber) {
          status = "current";
        }

        return (
          <li
            key={label}
            className={status}
            aria-current={
              currentStep === stepNumber
                ? "step"
                : undefined
            }
          >
            <span>
              {currentStep > stepNumber
                ? "✓"
                : stepNumber}
            </span>

            <small>{label}</small>
          </li>
        );
      })}
    </ol>
  );
}

/* =========================================================
   RIGHT SIDE PANEL
========================================================= */

function RequestAside({ user }) {
  return (
    <aside className="digital-wizard-aside">
      <span className="status neutral">
        Public request · no login required
      </span>

      <h2>Verified before fulfilment</h2>

      <p>
        Your selections create a review request only.
        Protected resources remain role-based,
        time-limited and revocable.
      </p>

      <ul className="check-list">
        <li>One series per request</li>
        <li>Student-safe filtering</li>
        <li>Contact verification</li>
        <li>No automatic entitlement</li>
      </ul>

      <div className="notice warning">
        <strong>Prototype boundary:</strong>{" "}
        local verification and in-session records
        are demonstrations. Do not enter real
        personal data.
      </div>

      {user && (
        <div className="notice neutral">
          <strong>Signed in as:</strong>
          <br />
          {user.name}
          <br />
          {user.accountName || "Souvenir internal user"}
        </div>
      )}

     <Link
  to="/login"
  className="text-link"
>
  Already a partner? Partner Login →
</Link>
    </aside>
  );
}

/* =========================================================
   STEP 1
========================================================= */

function RoleStep({
  form,
  updateField,
  nextStep,
  error,
}) {
  function handleSubmit(event) {
    event.preventDefault();

    if (!form.requesterRole) {
      return;
    }

    nextStep();
  }

  return (
    <form
      className="digital-wizard-card card"
      onSubmit={handleSubmit}
    >
      <p className="eyebrow">Step 1 of 5</p>

      <h1>Who are you?</h1>

      <p>
        Your selection determines the details we
        verify and the resources available in this
        request.
      </p>

      {error && (
        <div className="notice danger" role="alert">
          {error}
        </div>
      )}

      <fieldset className="role-choice-grid">
        <legend className="sr-only">
          Choose requester type
        </legend>

        {REQUESTER_ROLES.map((role) => (
          <label key={role.value}>
            <input
              type="radio"
              name="requesterRole"
              value={role.value}
              checked={
                form.requesterRole === role.value
              }
              onChange={(event) =>
                updateField(
                  "requesterRole",
                  event.target.value,
                )
              }
            />

            <span>
              <b aria-hidden="true">
                {role.number}
              </b>

              <strong>{role.title}</strong>

              <small>{role.description}</small>
            </span>
          </label>
        ))}
      </fieldset>

      <div className="wizard-actions">
        <span />

        <button
          className="button"
          type="submit"
          disabled={!form.requesterRole}
        >
          Continue to your details
        </button>
      </div>
    </form>
  );
}

/* =========================================================
   STEP 2
========================================================= */

function IdentityStep({
  form,
  updateField,
  previousStep,
  nextStep,
  setError,
  error,
}) {
  const student =
    form.requesterRole === "STUDENT";

  const teacher =
    form.requesterRole ===
    "TEACHER_SCHOOL_ADMIN";

  const sales =
    form.requesterRole ===
    "AUTHORIZED_SALES_PERSON";

  const distributor =
    form.requesterRole ===
    "AUTHORIZED_BOOKSELLER_DISTRIBUTOR";

  function verifyPartnerKey() {
    if (
      normalizePartnerKey(form.partnerKey) !==
      DEMO_SALES_PARTNER_KEY
    ) {
      updateField("partnerKeyVerified", false);

      setError(
        "That PartnerKey could not be verified as an active Souvenir sales identity.",
      );

      return;
    }

    if (form.partnerOtp !== DEMO_OTP) {
      updateField("partnerKeyVerified", false);

      setError(
        "The PartnerKey verification code is invalid or expired.",
      );

      return;
    }

    updateField("partnerKeyVerified", true);
    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (
      !form.schoolInstitutionName.trim() ||
      !form.stateCode ||
      !isValidPin(form.pinCode)
    ) {
      setError(
        "School / institution, state and a valid six-digit PIN code are required.",
      );

      return;
    }

    if (student) {
      if (
        !form.requesterName.trim() ||
        !form.parentGuardianName.trim() ||
        !form.guardianContact.trim()
      ) {
        setError(
          "Complete the student and parent / guardian details.",
        );

        return;
      }

      if (
        !isValidEmail(form.guardianContact) &&
        !isValidMobile(form.guardianContact)
      ) {
        setError(
          "Enter a valid parent / guardian email or Indian mobile number.",
        );

        return;
      }

      if (!form.guardianConsentConfirmed) {
        setError(
          "Parent / guardian consent is required.",
        );

        return;
      }
    }

    if (teacher) {
      if (
        !form.requesterName.trim() ||
        !form.requesterDesignation.trim() ||
        !form.schoolBoard.trim() ||
        !isValidEmail(form.email) ||
        !isValidMobile(form.mobile)
      ) {
        setError(
          "Complete name, designation, school board, email and mobile details.",
        );

        return;
      }
    }

    if (sales) {
      if (!form.partnerKeyVerified) {
        setError(
          "Verify your Souvenir PartnerKey before continuing.",
        );

        return;
      }

      if (
        !form.recipientName.trim() ||
        !form.recipientDesignation.trim() ||
        !isValidEmail(form.recipientEmail) ||
        !isValidMobile(form.recipientMobile)
      ) {
        setError(
          "Complete the recipient name, designation, email and mobile number.",
        );

        return;
      }

      if (!form.recipientConsentConfirmed) {
        setError(
          "Confirm that the recipient authorised you to submit these details.",
        );

        return;
      }
    }

    if (distributor) {
      if (
        !form.requesterName.trim() ||
        !form.requesterDesignation.trim() ||
        !form.requesterOrganisation.trim() ||
        !isValidEmail(form.email) ||
        !isValidMobile(form.mobile)
      ) {
        setError(
          "Complete the bookseller / distributor details.",
        );

        return;
      }

      if (
        !form.recipientName.trim() ||
        !form.recipientDesignation.trim() ||
        !isValidEmail(form.recipientEmail) ||
        !isValidMobile(form.recipientMobile)
      ) {
        setError(
          "Complete the recipient school contact details.",
        );

        return;
      }

      if (!form.recipientConsentConfirmed) {
        setError(
          "Confirm that the recipient authorised you to submit these details.",
        );

        return;
      }
    }

    setError("");
    nextStep();
  }

  return (
    <form
      className="digital-wizard-card card"
      onSubmit={handleSubmit}
    >
      <p className="eyebrow">
        Step 2 of 5
        {sales &&
          " · Authorised Souvenir Sales Person"}
      </p>

      <h1>Your details</h1>

      <p>
        We collect only the information needed to
        verify and review this request.
      </p>

      {error && (
        <div className="notice danger" role="alert">
          {error}
        </div>
      )}

      {/* SALES PARTNERKEY */}

      {sales && (
        <div className="sales-verification-panel">
          <p className="eyebrow">
            Your verified Souvenir business identity
          </p>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="partner-key">
                Souvenir PartnerKey™
              </label>

              <input
                id="partner-key"
                value={form.partnerKey}
                placeholder="SPK-ST-NR-00147"
                onChange={(event) => {
                  updateField(
                    "partnerKey",
                    event.target.value,
                  );

                  updateField(
                    "partnerKeyVerified",
                    false,
                  );
                }}
              />
            </div>

            <div className="form-field">
              <label htmlFor="partner-otp">
                PartnerKey OTP
              </label>

              <input
                id="partner-otp"
                value={form.partnerOtp}
                inputMode="numeric"
                maxLength="6"
                placeholder="6-digit code"
                onChange={(event) => {
                  updateField(
                    "partnerOtp",
                    event.target.value,
                  );

                  updateField(
                    "partnerKeyVerified",
                    false,
                  );
                }}
              />

              <span className="field-help">
                Local prototype code:{" "}
                <strong>246810</strong>
              </span>
            </div>
          </div>

          <button
            className="button secondary"
            type="button"
            onClick={verifyPartnerKey}
          >
            {form.partnerKeyVerified
              ? "✓ PartnerKey verified"
              : "Verify PartnerKey"}
          </button>
        </div>
      )}

      <div className="form-grid digital-identity-grid">
        {/* REQUESTER NAME */}

        {!sales && (
          <div className="form-field">
            <label htmlFor="requester-name">
              {student
                ? "Student Full Name"
                : distributor
                  ? "Bookseller / Distributor Contact Name"
                  : "Full Name"}
            </label>

            <input
              id="requester-name"
              value={form.requesterName}
              onChange={(event) =>
                updateField(
                  "requesterName",
                  event.target.value,
                )
              }
            />
          </div>
        )}

        {!student && !sales && (
          <div className="form-field">
            <label htmlFor="designation">
              Role / Designation
            </label>

            <input
              id="designation"
              value={form.requesterDesignation}
              onChange={(event) =>
                updateField(
                  "requesterDesignation",
                  event.target.value,
                )
              }
            />
          </div>
        )}

        {distributor && (
          <div className="form-field full">
            <label htmlFor="organisation">
              Bookseller / Distributor Organisation
            </label>

            <input
              id="organisation"
              value={form.requesterOrganisation}
              onChange={(event) =>
                updateField(
                  "requesterOrganisation",
                  event.target.value,
                )
              }
            />
          </div>
        )}

        {/* SCHOOL */}

        <div className="form-field full">
          <label htmlFor="school-name">
            {sales || distributor
              ? "Recipient School / Institution Name"
              : "School / Institution Name"}
          </label>

          <input
            id="school-name"
            value={form.schoolInstitutionName}
            onChange={(event) =>
              updateField(
                "schoolInstitutionName",
                event.target.value,
              )
            }
          />
        </div>

        {/* TEACHER */}

        {teacher && (
          <div className="form-field">
            <label htmlFor="school-board">
              School Board / Curriculum
            </label>

            <input
              id="school-board"
              value={form.schoolBoard}
              placeholder="CBSE, ICSE, State Board..."
              onChange={(event) =>
                updateField(
                  "schoolBoard",
                  event.target.value,
                )
              }
            />
          </div>
        )}

        {/* NORMAL EMAIL / MOBILE */}

        {!student && !sales && (
          <>
            <div className="form-field">
              <label htmlFor="request-email">
                Email Address
              </label>

              <input
                id="request-email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  updateField(
                    "email",
                    event.target.value,
                  )
                }
              />
            </div>

            <div className="form-field">
              <label htmlFor="request-mobile">
                Mobile Number
              </label>

              <input
                id="request-mobile"
                type="tel"
                value={form.mobile}
                onChange={(event) =>
                  updateField(
                    "mobile",
                    event.target.value,
                  )
                }
              />
            </div>
          </>
        )}

        {/* STUDENT GUARDIAN */}

        {student && (
          <>
            <div className="form-field">
              <label htmlFor="guardian-name">
                Parent / Guardian Name
              </label>

              <input
                id="guardian-name"
                value={form.parentGuardianName}
                onChange={(event) =>
                  updateField(
                    "parentGuardianName",
                    event.target.value,
                  )
                }
              />
            </div>

            <div className="form-field">
              <label htmlFor="guardian-contact">
                Parent / Guardian Mobile or Email
              </label>

              <input
                id="guardian-contact"
                value={form.guardianContact}
                onChange={(event) =>
                  updateField(
                    "guardianContact",
                    event.target.value,
                  )
                }
              />
            </div>
          </>
        )}

        {/* RECIPIENT */}

        {(sales || distributor) && (
          <>
            <div className="form-field">
              <label htmlFor="recipient-name">
                Recipient Full Name
              </label>

              <input
                id="recipient-name"
                value={form.recipientName}
                onChange={(event) =>
                  updateField(
                    "recipientName",
                    event.target.value,
                  )
                }
              />
            </div>

            <div className="form-field">
              <label htmlFor="recipient-designation">
                Recipient Role / Designation
              </label>

              <input
                id="recipient-designation"
                value={form.recipientDesignation}
                onChange={(event) =>
                  updateField(
                    "recipientDesignation",
                    event.target.value,
                  )
                }
              />
            </div>

            <div className="form-field">
              <label htmlFor="recipient-email">
                Recipient Email Address
              </label>

              <input
                id="recipient-email"
                type="email"
                value={form.recipientEmail}
                onChange={(event) =>
                  updateField(
                    "recipientEmail",
                    event.target.value,
                  )
                }
              />
            </div>

            <div className="form-field">
              <label htmlFor="recipient-mobile">
                Recipient Mobile Number
              </label>

              <input
                id="recipient-mobile"
                type="tel"
                value={form.recipientMobile}
                onChange={(event) =>
                  updateField(
                    "recipientMobile",
                    event.target.value,
                  )
                }
              />
            </div>
          </>
        )}

        {/* STATE */}

        <div className="form-field">
          <label htmlFor="state-code">
            State
          </label>

          <select
            id="state-code"
            value={form.stateCode}
            onChange={(event) =>
              updateField(
                "stateCode",
                event.target.value,
              )
            }
          >
            <option value="">
              Choose state or union territory
            </option>

            {INDIA_STATES.map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* PIN */}

        <div className="form-field">
          <label htmlFor="pin-code">
            PIN Code
          </label>

          <input
            id="pin-code"
            inputMode="numeric"
            maxLength="6"
            value={form.pinCode}
            onChange={(event) =>
              updateField(
                "pinCode",
                event.target.value,
              )
            }
          />
        </div>

        {/* STUDENT CONSENT */}

        {student && (
          <label className="checkbox-row full">
            <input
              type="checkbox"
              checked={
                form.guardianConsentConfirmed
              }
              onChange={(event) =>
                updateField(
                  "guardianConsentConfirmed",
                  event.target.checked,
                )
              }
            />

            <span>
              I am the parent or guardian and
              consent to verification and contact
              for this educational request.
            </span>
          </label>
        )}

        {/* RECIPIENT CONSENT */}

        {(sales || distributor) && (
          <label className="checkbox-row full">
            <input
              type="checkbox"
              checked={
                form.recipientConsentConfirmed
              }
              onChange={(event) =>
                updateField(
                  "recipientConsentConfirmed",
                  event.target.checked,
                )
              }
            />

            <span>
              I confirm that the recipient has
              authorised me to submit these details
              for this request.
            </span>
          </label>
        )}
      </div>

      {student && (
        <div className="notice neutral">
          To protect students, verification and
          delivery updates are sent to a parent or
          guardian. Restricted Teacher’s Tools are
          never supplied through student requests.
        </div>
      )}

      <div className="wizard-actions">
        <button
          className="button secondary"
          type="button"
          onClick={previousStep}
        >
          Back
        </button>

        <button
          className="button"
          type="submit"
        >
          Continue to series
        </button>
      </div>
    </form>
  );
}

/* =========================================================
   STEP 3
========================================================= */

function CatalogueStep({
  catalogue,
  catalogueLoading,
  catalogueError,
  form,
  updateField,
  previousStep,
  nextStep,
  setError,
  error,
}) {
  const subjects = useMemo(() => {
    return Array.from(
      new Set(
        catalogue
          .filter(
            (series) => series.publicVisibility,
          )
          .map((series) => series.subject),
      ),
    ).sort();
  }, [catalogue]);

  const seriesOptions = useMemo(() => {
    return catalogue.filter(
      (series) =>
        series.publicVisibility &&
        series.subject === form.subject,
    );
  }, [catalogue, form.subject]);

  const selectedSeries = catalogue.find(
    (series) => series.id === form.seriesId,
  );

  const classOptions =
    selectedSeries?.variants?.map((variant) => ({
      id: variant.id,
      label:
        variant.level ||
        variant.title ||
        variant.id,
    })) || [];

  function toggleClass(classId) {
    if (form.requesterRole === "STUDENT") {
      updateField("classIds", [classId]);
      return;
    }

    updateField(
      "classIds",
      form.classIds.includes(classId)
        ? form.classIds.filter(
            (id) => id !== classId,
          )
        : [...form.classIds, classId],
    );
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (
      !form.subject ||
      !form.seriesId ||
      !form.classIds.length
    ) {
      setError(
        "Choose a valid subject, series and class selection.",
      );

      return;
    }

    setError("");
    nextStep();
  }

  return (
    <form
      className="digital-wizard-card card"
      onSubmit={handleSubmit}
    >
      <p className="eyebrow">
        Step 3 of 5
      </p>

      <h1>Choose the Souvenir series</h1>

      <p>
        Select in order: Subject, then Series,
        then Class.
      </p>

      {error && (
        <div className="notice danger" role="alert">
          {error}
        </div>
      )}

      {catalogueLoading && <div className="notice neutral">Loading the current book catalogue...</div>}
      {catalogueError && <div className="notice danger">The catalogue could not be loaded: {catalogueError}</div>}

      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="digital-subject">
            Subject
          </label>

          <select
            id="digital-subject"
            value={form.subject}
            onChange={(event) => {
              updateField(
                "subject",
                event.target.value,
              );

              updateField("seriesId", "");
              updateField("classIds", []);
              updateField("resourceCodes", []);
            }}
          >
            <option value="">
              Choose subject
            </option>

            {subjects.map((subject) => (
              <option
                key={subject}
                value={subject}
              >
                {subject}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="digital-series">
            Series
          </label>

          <select
            id="digital-series"
            value={form.seriesId}
            disabled={!form.subject}
            onChange={(event) => {
              updateField(
                "seriesId",
                event.target.value,
              );

              updateField("classIds", []);
              updateField("resourceCodes", []);
            }}
          >
            <option value="">
              Choose series
            </option>

            {seriesOptions.map((series) => (
              <option
                key={series.id}
                value={series.id}
              >
                {series.title}
                {series.imprint
                  ? ` · ${series.imprint}`
                  : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {form.seriesId && (
        <fieldset className="class-choice-fieldset">
          <legend>
            {form.requesterRole === "STUDENT"
              ? "Choose your class"
              : "Choose one or more available classes"}
          </legend>

          <div className="class-choice-grid">
            {classOptions.map((classOption) => (
              <label key={classOption.id}>
                <input
                  type={
                    form.requesterRole ===
                    "STUDENT"
                      ? "radio"
                      : "checkbox"
                  }
                  checked={form.classIds.includes(
                    classOption.id,
                  )}
                  onChange={() =>
                    toggleClass(classOption.id)
                  }
                />

                <span>
                  {classOption.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="notice neutral">
        <strong>Availability note:</strong>{" "}
        A catalogue feature indicates intended
        support; it does not guarantee that a
        current asset or offline package is ready.
        Souvenir verifies configured availability
        before approval.
      </div>

      <div className="wizard-actions">
        <button
          className="button secondary"
          type="button"
          onClick={previousStep}
        >
          Back
        </button>

        <button 
          className="button"
          type="submit"
        >
          Continue to resources
        </button>
      </div>
    </form>
  );
}

/* =========================================================
   STEP 4
========================================================= */

function ResourceStep({
  catalogue,
  form,
  updateField,
  previousStep,
  nextStep,
  setError,
  error,
}) {
  const student =
    form.requesterRole === "STUDENT";

  /*
    If a series has configuration, show only
    resources mapped to that series.

    If no mapping exists yet, show all role-safe
    options instead of the old single
    "Availability Enquiry" card.
  */
  const selectedSeries = catalogue.find(
    (series) => series.id === form.seriesId,
  );
  const configuredTitles = (
    selectedSeries?.digitalFeatures ?? []
  ).map((item) => item.toLowerCase());

  const resources = RESOURCE_OPTIONS.filter(
    (resource) => {
      if (
        configuredTitles.length > 0 &&
        !configuredTitles.includes(
          resource.title.toLowerCase(),
        )
      ) {
        return false;
      }

      if (
        student &&
        (resource.teacherTool ||
          resource.physicalResource)
      ) {
        return false;
      }

      return true;
    },
  );

  function toggleResource(code) {
    updateField(
      "resourceCodes",
      form.resourceCodes.includes(code)
        ? form.resourceCodes.filter(
            (item) => item !== code,
          )
        : [...form.resourceCodes, code],
    );
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.resourceCodes.length) {
      setError(
        "Select at least one available resource.",
      );

      return;
    }

    setError("");
    nextStep();
  }

  return (
    <form
      className="digital-wizard-card card"
      onSubmit={handleSubmit}
    >
      <p className="eyebrow">
        Step 4 of 5
      </p>

      <h1>Which resources do you need?</h1>

      <p>
        The options below are filtered by the
        selected series, class and requester type.
      </p>

      {error && (
        <div className="notice danger" role="alert">
          {error}
        </div>
      )}

      <fieldset className="resource-choice-grid">
        <legend className="sr-only">
          Choose resources
        </legend>

        {resources.map((resource, index) => (
          <label key={resource.code}>
            <input
              type="checkbox"
              checked={form.resourceCodes.includes(
                resource.code,
              )}
              onChange={() =>
                toggleResource(resource.code)
              }
            />

            <span>
              <b
                className="resource-icon"
                aria-hidden="true"
              >
                {String(index + 1).padStart(
                  2,
                  "0",
                )}
              </b>

              {resource.teacherTool && (
                <em className="resource-badge teacher">
                  Teacher’s Tool
                </em>
              )}

              {resource.physicalResource && (
                <em className="resource-badge offline">
                  Licensed offline
                </em>
              )}

              <strong>
                {resource.title}
              </strong>

              <small>
                {resource.description}
              </small>
            </span>
          </label>
        ))}
      </fieldset>

      <div className="wizard-actions">
        <button
          className="button secondary"
          type="button"
          onClick={previousStep}
        >
          Back
        </button>

        <button
          className="button"
          type="submit"
        >
          Review and verify
        </button>
      </div>
    </form>
  );
}

/* =========================================================
   STEP 5
========================================================= */

function ReviewStep({
  catalogue,
  form,
  previousStep,
  updateField,
  submitRequest,
  submitting,
  error,
}) {
  const selectedSeries = catalogue.find(
    (series) => series.id === form.seriesId,
  );

  const selectedResources =
    form.resourceCodes.map((code) => {
      return (
        RESOURCE_OPTIONS.find(
          (resource) =>
            resource.code === code,
        )?.title || code
      );
    });

  const selectedRole =
    REQUESTER_ROLES.find(
      (role) =>
        role.value === form.requesterRole,
    )?.title || form.requesterRole;

  function handleSubmit(event) {
    event.preventDefault();
    submitRequest();
  }

  return (
    <form
      className="digital-wizard-card card"
      onSubmit={handleSubmit}
    >
      <p className="eyebrow">
        Step 5 of 5
      </p>

      <h1>Review and submit</h1>

      <p>
        Review the request, verify the required
        contact and submit it to Souvenir.
      </p>

      {error && (
        <div className="notice danger" role="alert">
          {error}
        </div>
      )}

      <div className="digital-review-summary">
        <dl>
          <div>
            <dt>Requester</dt>
            <dd>{selectedRole}</dd>
          </div>

          <div>
            <dt>School / Institution</dt>
            <dd>
              {form.schoolInstitutionName}
            </dd>
          </div>

          <div>
            <dt>Series</dt>
            <dd>
              {selectedSeries?.title ||
                form.seriesId}
            </dd>
          </div>

          <div>
            <dt>Classes</dt>
            <dd>
              {form.classIds.length}
            </dd>
          </div>

          <div>
            <dt>Resources</dt>
            <dd>
              {selectedResources.join(", ")}
            </dd>
          </div>
        </dl>
      </div>

      <div className="form-grid">
        <div className="form-field full">
          <label htmlFor="request-purpose">
            Purpose
          </label>

          <select
            id="request-purpose"
            value={form.purpose}
            onChange={(event) =>
              updateField(
                "purpose",
                event.target.value,
              )
            }
          >
            <option value="">
              Choose purpose
            </option>

            <option value="Student learning support">
              Student learning support
            </option>

            <option value="Classroom teaching">
              Classroom teaching
            </option>

            <option value="School academic evaluation">
              School academic evaluation
            </option>

            <option value="Book adoption review">
              Book adoption review
            </option>

            <option value="Teacher training or demonstration">
              Teacher training or demonstration
            </option>
          </select>
        </div>

        <div className="form-field full">
          <label htmlFor="usage-details">
            How will this resource be used?
          </label>

          <textarea
            id="usage-details"
            value={form.usageDetails}
            minLength="20"
            onChange={(event) =>
              updateField(
                "usageDetails",
                event.target.value,
              )
            }
          />

          <span className="field-help">
            Provide at least 20 meaningful
            characters.
          </span>
        </div>

        <label className="checkbox-row full">
          <input
            type="checkbox"
            checked={
              form.authorisedConfirmed
            }
            onChange={(event) =>
              updateField(
                "authorisedConfirmed",
                event.target.checked,
              )
            }
          />

          <span>
            I confirm that the information is
            accurate and that I am authorised to
            request these resources.
          </span>
        </label>

        <label className="checkbox-row full">
          <input
            type="checkbox"
            checked={
              form.privacyAcknowledged
            }
            onChange={(event) =>
              updateField(
                "privacyAcknowledged",
                event.target.checked,
              )
            }
          />

          <span>
            I acknowledge that Souvenir will use
            the submitted details to verify,
            review and fulfil this request.
          </span>
        </label>
      </div>

      <div className="notice warning">
        <strong>
          Submission is not access.
        </strong>{" "}
        No entitlement, file link or shipment is
        created automatically.
      </div>

      <div className="wizard-actions">
        <button
          className="button secondary"
          type="button"
          onClick={previousStep}
        >
          Back
        </button>

        <button
          className="button green"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Request"}
        </button>
      </div>
    </form>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

function DigitalResourceRequestPage() {
  const { user } = useAuth();
  const { catalogue, loading: catalogueLoading, error: catalogueError } = useCatalogue();

  const [step, setStep] = useState(1);

  const [form, setForm] =
    useState(INITIAL_FORM);

  const [error, setError] =
    useState("");

  const [completed, setCompleted] =
    useState(null);
  const [submitting, setSubmitting] =
    useState(false);

  function updateField(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  }

  function nextStep() {
    setStep((current) =>
      Math.min(current + 1, 5),
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function previousStep() {
    setStep((current) =>
      Math.max(current - 1, 1),
    );

    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function submitRequest() {
    if (!form.purpose) {
      setError(
        "Choose the purpose of this resource request.",
      );

      return;
    }

    if (
      form.usageDetails.trim().length < 20
    ) {
      setError(
        "Provide at least 20 meaningful characters explaining how the resource will be used.",
      );

      return;
    }

    if (!form.authorisedConfirmed) {
      setError(
        "Confirm that the submitted information is accurate and authorised.",
      );

      return;
    }

    if (!form.privacyAcknowledged) {
      setError(
        "Please acknowledge the privacy notice.",
      );

      return;
    }

    setSubmitting(true);
    setError("");
    try {
      setCompleted(
        await ecommerceService.createDigitalResourceRequest(form),
      );
    } catch (requestError) {
      setError(requestError.message);
      setSubmitting(false);
      return;
    }
    setSubmitting(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  if (completed) {
    return (
      <section className="section compact digital-success-page">
        <div className="container">
          <div className="checkout-card checkout-complete card">
            <span
              className="success-mark"
              aria-hidden="true"
            >
              ✓
            </span>

            <p className="eyebrow">
              Request received
            </p>

            <h1>
              Your resource request has been
              received
            </h1>

            <p>
              Reference:{" "}
              <strong>
                {completed.reference}
              </strong>
            </p>

            <div className="notice success">
              <strong>
                No automatic access was created.
              </strong>{" "}
              Souvenir will review the request
              before fulfilment.
            </div>

            <button
              className="button"
              type="button"
              onClick={() => {
                setForm({
                  ...INITIAL_FORM,
                });

                setCompleted(null);
                setError("");
                setStep(1);
              }}
            >
              Request Another Series
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section compact digital-request-page">
      <div className="container">
        <ProgressSteps
          currentStep={step}
        />

        <div className="digital-wizard-layout">
          <div>
            {step === 1 && (
              <RoleStep
                form={form}
                updateField={updateField}
                nextStep={nextStep}
                error={error}
              />
            )}

            {step === 2 && (
              <IdentityStep
                form={form}
                updateField={updateField}
                previousStep={previousStep}
                nextStep={nextStep}
                setError={setError}
                error={error}
              />
            )}

            {step === 3 && (
              <CatalogueStep
                catalogue={catalogue}
                catalogueLoading={catalogueLoading}
                catalogueError={catalogueError}
                form={form}
                updateField={updateField}
                previousStep={previousStep}
                nextStep={nextStep}
                setError={setError}
                error={error}
              />
            )}

            {step === 4 && (
              <ResourceStep
                catalogue={catalogue}
                form={form}
                updateField={updateField}
                previousStep={previousStep}
                nextStep={nextStep}
                setError={setError}
                error={error}
              />
            )}

            {step === 5 && (
              <ReviewStep
                catalogue={catalogue}
                form={form}
                previousStep={previousStep}
                updateField={updateField}
                submitRequest={submitRequest}
                submitting={submitting}
                error={error}
              />
            )}
          </div>

          <RequestAside user={user} />
        </div>
      </div>
    </section>
  );
}

export default DigitalResourceRequestPage;
