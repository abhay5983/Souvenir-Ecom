import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { useCatalogue } from "../context/CatalogueContext.jsx";

import {
  outreachFormBySlug,
  validateOutreachDraft,
} from "../services/help-centre.js";
import { requestHubService } from "../services/requestHubService.js";

const STEP_GROUPS = {
  1: "ABOUT",
  2: "CONTEXT",
  3: "DETAILS",
};

const STEP_LABELS = [
  "About you",
  "Details",
  "Requirement",
  "Review",
];

function createInitialValues(definition) {
  return definition.fields.reduce(
    (values, field) => ({
      ...values,
      [field.name]:
        field.kind === "checkbox"
          ? false
          : "",
    }),
    {},
  );
}

function formatReviewValue(
  key,
  rawValue,
  catalogue,
) {
  if (rawValue === true) {
    return "Confirmed";
  }

  if (key === "seriesId") {
    return (
      catalogue.find(
        (series) =>
          series.id === rawValue,
      )?.title ?? rawValue
    );
  }

  if (
    key === "classId" ||
    key === "bookId"
  ) {
    return (
      catalogue
        .flatMap(
          (series) =>
            series.variants ?? [],
        )
        .find(
          (variant) =>
            variant.id === rawValue,
        )?.title ?? rawValue
    );
  }

  return String(rawValue);
}

function ProgressSteps({
  currentStep,
}) {
  return (
    <ol
      className="outreach-progress"
      aria-label="Form progress"
    >
      {STEP_LABELS.map(
        (label, index) => {
          const number = index + 1;
          const completed =
            currentStep > number;
          const active =
            currentStep === number;

          return (
            <li
              key={label}
              className={[
                completed
                  ? "complete"
                  : "",
                active ? "active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-current={
                active
                  ? "step"
                  : undefined
              }
            >
              <span>
                {completed
                  ? "✓"
                  : number}
              </span>

              <small>{label}</small>
            </li>
          );
        },
      )}
    </ol>
  );
}

function OutreachFormContent({ formSlug }) {
  const navigate = useNavigate();
  const { catalogue, loading: catalogueLoading } = useCatalogue();

  const definition =
    outreachFormBySlug(formSlug);

  const initialValues = useMemo(
    () =>
      definition
        ? createInitialValues(
            definition,
          )
        : {},
    [definition],
  );

  const [step, setStep] =
    useState(1);

  const [values, setValues] =
    useState(initialValues);

  const [files, setFiles] =
    useState([]);

  const [errors, setErrors] =
    useState([]);

  const [result, setResult] =
    useState(null);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [step, result]);

  if (!definition) {
    return (
      <section className="section compact">
        <div className="container">
          <div className="empty-state">
            <p className="eyebrow">
              Help Centre
            </p>

            <h1>Form not found</h1>

            <p>
              The requested outreach form
              could not be found.
            </p>

            <Link
              className="button"
              to="/help"
            >
              Return to Help Centre
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const currentFields =
    step < 4
      ? definition.fields.filter(
          (field) =>
            field.group ===
            STEP_GROUPS[step],
        )
      : [];

  function updateValue(
    name,
    value,
  ) {
    setValues((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors([]);
  }

  function handleFilesChange(
    selectedFiles,
  ) {
    setFiles(
      Array.from(selectedFiles).map(
        (file) => ({
          file,
          name: file.name,
          size: file.size,
          type: file.type,
        }),
      ),
    );

    setErrors([]);
  }

  function validateCurrentStep() {
    const draft = {
      formType: definition.type,
      values,
      files: files.map(
        ({ name, size, type }) => ({
          name,
          size,
          type,
        }),
      ),
      honeypot:
        values.companySite ?? "",
    };

    const validationErrors =
      validateOutreachDraft(draft, step === 4 ? {} : {
        fieldNames: currentFields.map((field) => field.name),
        validateFiles: step === 3,
      });

    setErrors(validationErrors);

    return (
      validationErrors.length === 0
    );
  }

  function handleNext(event) {
    event.preventDefault();

    if (!validateCurrentStep()) {
      return;
    }

    setStep((current) =>
      Math.min(current + 1, 4),
    );
  }

  function handleBack() {
    setErrors([]);

    setStep((current) =>
      Math.max(current - 1, 1),
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const draft = {
      formType: definition.type,
      values,
      files: files.map(
        ({ name, size, type }) => ({
          name,
          size,
          type,
        }),
      ),
      honeypot:
        values.companySite ?? "",
    };

    const validationErrors =
      validateOutreachDraft(draft);

    if (validationErrors.length) {
      setErrors(validationErrors);
      return;
    }

    try {
      setResult(await requestHubService.submitOutreach(draft));
    } catch (requestError) {
      setErrors([requestError.message]);
    }
  }

  function resetForm() {
    setStep(1);
    setValues(
      createInitialValues(
        definition,
      ),
    );
    setFiles([]);
    setErrors([]);
    setResult(null);
  }

  if (result) {
    return (
      <section className="section compact outreach-success-page">
        <div className="container help-reading-width">
          <div className="card outreach-success-card">
            <span
              className="success-mark"
              aria-hidden="true"
            >
              ✓
            </span>

            <p className="eyebrow">
              Submission received
            </p>

            <h1>
              Thank you. Your submission has
              been received.
            </h1>

            <p>
              {definition.successMessage ??
                "The appropriate Souvenir team will review the information provided and contact you if clarification or further action is required."}
            </p>

            <div className="reference-panel">
              <span>
                Correspondence reference
              </span>

              <strong>
                {result.publicReference}
              </strong>

              <p>
                Please retain this submission
                number when corresponding with
                Souvenir.
              </p>
            </div>

            <div className="notice success">Your request has been securely recorded for review by the appropriate Souvenir team.</div>

            <div className="actions-row actions-center">
              <Link
                className="button"
                to="/help"
              >
                Return to Help Centre
              </Link>

              <Link
                className="button secondary"
                to="/books"
              >
                Browse Books
              </Link>

              <button
                className="button ghost"
                type="button"
                onClick={resetForm}
              >
                Send Another Enquiry
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section compact outreach-form-page">
      <div className="container">
        <nav
          className="breadcrumbs"
          aria-label="Breadcrumb"
        >
          <Link to="/help">
            Help Centre
          </Link>

          <span aria-hidden="true">
            /
          </span>

          <span>Outreach forms</span>

          <span aria-hidden="true">
            /
          </span>

          <span aria-current="page">
            {definition.title}
          </span>
        </nav>

        <div className="outreach-form-layout">
          <div className="outreach-form-main">
            <p className="eyebrow">
              {definition.category}
            </p>

            <h1>{definition.title}</h1>

            <p className="lede">
              {definition.summary}
            </p>

            <ProgressSteps
              currentStep={step}
            />

            {errors.length > 0 && (
              <div
                className="notice danger outreach-error-summary"
                role="alert"
                tabIndex="-1"
              >
                <strong>
                  Please correct the following:
                </strong>

                <ul>
                  {errors.map(
                    (error) => (
                      <li key={error}>
                        {error}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}

            <form
              className="card outreach-form-card"
              noValidate
              onSubmit={
                step === 4
                  ? handleSubmit
                  : handleNext
              }
            >
              {step < 4 ? (
                <>
                  <div className="form-step-heading">
                    <p className="eyebrow">
                      Step {step} of 4
                    </p>

                    <h2>
                      {step === 1
                        ? "About you"
                        : step === 2
                          ? "Book, organisation or transaction details"
                          : "Describe the requirement and add evidence"}
                    </h2>
                  </div>

                  <div className="form-grid">
                    {currentFields.map(
                      (field) => (
                        <DynamicOutreachField
                          key={field.name}
                          field={field}
                          value={
                            values[
                              field.name
                            ]
                          }
                          values={values}
                          onChange={
                            updateValue
                          }
                          onFilesChange={
                            handleFilesChange
                          }
                          selectedFiles={
                            files
                          }
                          catalogue={catalogue}
                          catalogueLoading={catalogueLoading}
                        />
                      ),
                    )}

                    <input
                      className="honeypot-input"
                      name="companySite"
                      value={
                        values.companySite ??
                        ""
                      }
                      tabIndex="-1"
                      autoComplete="off"
                      aria-hidden="true"
                      hidden
                      onChange={(event) =>
                        updateValue(
                          "companySite",
                          event.target.value,
                        )
                      }
                    />
                  </div>
                </>
              ) : (
                <OutreachReview
                  definition={
                    definition
                  }
                  values={values}
                  files={files}
                  catalogue={catalogue}
                />
              )}

              <div className="wizard-actions">
                {step > 1 ? (
                  <button
                    className="button secondary"
                    type="button"
                    onClick={handleBack}
                  >
                    Back
                  </button>
                ) : (
                  <button
                    className="button secondary"
                    type="button"
                    onClick={() =>
                      navigate("/help")
                    }
                  >
                    Cancel
                  </button>
                )}

                <button
                  className="button"
                  type="submit"
                >
                  {step === 4
                    ? "Submit to Souvenir"
                    : "Continue"}
                </button>
              </div>
            </form>
          </div>

          <aside className="outreach-form-aside">
            <span className="status neutral">
              Public form · no login required
            </span>

            <h2>
              Prepare before you begin
            </h2>

            <ul className="check-list">
              {definition.preparation.map(
                (item) => (
                  <li key={item}>
                    {item}
                  </li>
                ),
              )}
            </ul>

            <div className="notice neutral">
              <strong>
                Privacy and verification
              </strong>

              <br />

              Information is used only to
              review and respond to this
              submission. Do not enter
              passwords or OTPs.
            </div>

            {definition.confidential && (
              <div className="notice success">
                <strong>
                  Confidential reporting
                  available.
                </strong>

                <br />

                Contact details are optional,
                though this may limit
                clarification.
              </div>
            )}

            <p className="field-help">
              Drafts remain in the current
              browser until the form is
              submitted.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}

function DynamicOutreachField({
  field,
  value,
  values,
  onChange,
  onFilesChange,
  selectedFiles,
  catalogue,
  catalogueLoading,
}) {
  const fieldId =
    `outreach-${field.name}`;

  const fieldOptions =
    getFieldOptions(
      field,
      values,
      catalogue,
    );

  const disabled =
    isFieldDisabled(
      field,
      values,
      catalogueLoading,
    );

  const hidden =
    field.name === "manualBook" &&
    values.bookId !==
      "BOOK_NOT_FOUND";

  if (hidden) {
    return null;
  }

  if (field.kind === "checkbox") {
    return (
      <label className="checkbox-row outreach-checkbox full">
        <input
          id={fieldId}
          type="checkbox"
          checked={Boolean(value)}
          required={field.required}
          onChange={(event) =>
            onChange(
              field.name,
              event.target.checked,
            )
          }
        />

        <span>{field.label}{field.required && <span aria-hidden="true"> *</span>}</span>
      </label>
    );
  }

  if (field.kind === "file") {
    return (
      <div className="form-field full outreach-upload">
        <label htmlFor={fieldId}>
          {field.label}{field.required ? <span aria-hidden="true"> *</span> : <span className="field-help"> Optional</span>}
        </label>

        <input
          id={fieldId}
          type="file"
          multiple
          accept={
            field.accept ??
            ".jpg,.jpeg,.png,.pdf"
          }
          onChange={(event) =>
            onFilesChange(
              event.target.files,
            )
          }
        />

        <span className="field-help">
          {field.help ??
            "Choose one or more supporting files."}
        </span>

        <div
          className="upload-status"
          role="status"
        >
          {selectedFiles.length
            ? `${selectedFiles.length} ${
                selectedFiles.length === 1
                  ? "file"
                  : "files"
              } selected`
            : "No files selected"}
        </div>
      </div>
    );
  }

  if (field.kind === "textarea") {
    return (
      <div className="form-field full">
        <label htmlFor={fieldId}>
          {field.label}{field.required ? <span aria-hidden="true"> *</span> : <span className="field-help"> Optional</span>}
        </label>

        <textarea
          id={fieldId}
          value={value ?? ""}
          required={field.required}
          maxLength={field.maxLength}
          placeholder={
            field.placeholder ?? ""
          }
          onChange={(event) =>
            onChange(
              field.name,
              event.target.value,
            )
          }
        />

        {field.help && (
          <span className="field-help">
            {field.help}
          </span>
        )}
      </div>
    );
  }

  if (field.kind === "select") {
    return (
      <div className="form-field">
        <label htmlFor={fieldId}>
          {field.label}{field.required ? <span aria-hidden="true"> *</span> : <span className="field-help"> Optional</span>}
        </label>

        <select
          id={fieldId}
          value={value ?? ""}
          required={field.required}
          disabled={disabled}
          onChange={(event) =>
            handleSelectChange(
              field,
              event.target.value,
              onChange,
              catalogue,
            )
          }
        >
          <option value="">
            {disabled
              ? "Complete the previous selection first"
              : "Choose an option"}
          </option>

          {fieldOptions.map(
            (option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ),
          )}
        </select>

        {field.help && (
          <span className="field-help">
            {field.help}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="form-field">
      <label htmlFor={fieldId}>
        {field.label}{field.required ? <span aria-hidden="true"> *</span> : <span className="field-help"> Optional</span>}
      </label>

      <input
        id={fieldId}
        type={field.kind}
        value={value ?? ""}
        required={field.required}
        disabled={disabled}
        maxLength={field.maxLength}
        placeholder={
          field.placeholder ?? ""
        }
        pattern={
          field.name === "pincode"
            ? "[1-9][0-9]{5}"
            : field.kind === "tel"
              ? "(?:\\+?91[ -]?)?[6-9][0-9]{9}"
              : undefined
        }
        inputMode={
          field.name === "pincode"
            ? "numeric"
            : field.kind === "tel"
              ? "tel"
              : undefined
        }
        min={field.kind === "number" ? 1 : undefined}
        autoComplete={field.name === "fullName" ? "name" : field.name === "email" ? "email" : field.kind === "tel" ? "tel" : field.name === "pincode" ? "postal-code" : undefined}
        onChange={(event) => {
          const raw = event.target.value;
          const normalized = field.kind === "tel"
            ? raw.replace(/\D/g, "").slice(0, 10)
            : field.name === "pincode"
              ? raw.replace(/\D/g, "").slice(0, 6)
              : raw;
          onChange(field.name, normalized);
        }}
      />

      {field.help && (
        <span className="field-help">
          {field.help}
        </span>
      )}
    </div>
  );
}

function getFieldOptions(
  field,
  values,
  catalogue,
) {
  if (field.name === "subject") {
    return Array.from(
      new Set(
        catalogue
          .filter(
            (series) =>
              series.publicVisibility,
          )
          .map(
            (series) =>
              series.subject,
          ),
      ),
    )
      .sort()
      .map((subject) => ({
        value: subject,
        label: subject,
      }));
  }

  if (field.name === "seriesId") {
    return catalogue
      .filter(
        (series) =>
          series.publicVisibility &&
          series.subject ===
            values.subject,
      )
      .map((series) => ({
        value: series.id,
        label: series.title,
      }));
  }

  if (field.name === "classId") {
    const series =
      catalogue.find(
        (item) =>
          item.id ===
          values.seriesId,
      );

    return (
      series?.variants ?? []
    ).map((variant) => ({
      value: variant.id,
      label:
        variant.level ??
        variant.title,
    }));
  }

  if (field.name === "bookId") {
    const series =
      catalogue.find(
        (item) =>
          item.id ===
          values.seriesId,
      );

    return [
      ...(series?.variants ?? []).filter((variant) => !values.classId || variant.id === values.classId).map(
        (variant) => ({
          value: variant.id,
          label: variant.title,
        }),
      ),
      {
        value: "BOOK_NOT_FOUND",
        label: "Book not found",
      },
    ];
  }

  return (field.options ?? []).map(
    (option) => ({
      value: option,
      label: option,
    }),
  );
}

function isFieldDisabled(
  field,
  values,
  catalogueLoading,
) {
  if (["subject", "seriesId", "classId", "bookId"].includes(field.name) && catalogueLoading) return true;
  if (field.name === "seriesId") {
    return !values.subject;
  }

  if (field.name === "classId") {
    return !values.seriesId;
  }

  if (field.name === "bookId") {
    return !values.classId;
  }

  return false;
}

function handleSelectChange(
  field,
  selectedValue,
  onChange,
  catalogue,
) {
  onChange(
    field.name,
    selectedValue,
  );

  if (field.name === "subject") {
    onChange("seriesId", "");
    onChange("classId", "");
    onChange("bookId", "");
    onChange("manualBook", "");
    onChange("isbn", "");
  }

  if (field.name === "seriesId") {
    onChange("classId", "");
    onChange("bookId", "");
    onChange("manualBook", "");
    onChange("isbn", "");
  }

  if (field.name === "classId") {
    onChange("bookId", selectedValue);
    onChange("manualBook", "");
    const variant = catalogue.flatMap((series) => series.variants ?? []).find((item) => item.id === selectedValue);
    onChange("isbn", variant?.isbn ?? "");
  }

  if (field.name === "bookId") {
    const variant =
      catalogue
        .flatMap(
          (series) =>
            series.variants ?? [],
        )
        .find(
          (item) =>
            item.id ===
            selectedValue,
        );

    onChange(
      "isbn",
      variant?.isbn ?? "",
    );
  }
}

function OutreachReview({
  definition,
  values,
  files,
  catalogue,
}) {
  const labels = new Map(
    definition.fields.map(
      (field) => [
        field.name,
        field.label,
      ],
    ),
  );

  const visibleValues =
    Object.entries(values).filter(
      ([key, value]) =>
        !key.startsWith("__") &&
        key !== "companySite" &&
        value !== "" &&
        value !== false,
    );

  return (
    <div className="outreach-review">
      <h2>
        Review your submission
      </h2>

      <p>
        Check the information before sending
        it to Souvenir.
      </p>

      <dl>
        {visibleValues.map(
          ([key, rawValue]) => (
            <div key={key}>
              <dt>
                {labels.get(key) ??
                  key}
              </dt>

              <dd>
                {formatReviewValue(
                  key,
                  rawValue,
                  catalogue,
                )}
              </dd>
            </div>
          ),
        )}
      </dl>

      {files.length > 0 && (
        <div className="review-files">
          <h3>
            Supporting evidence
          </h3>

          <ul>
            {files.map((item) => (
              <li key={item.name}>
                {item.name}

                <span>
                  {(
                    item.size /
                    1024 /
                    1024
                  ).toFixed(1)}{" "}
                  MB
                </span>
              </li>
            ))}
          </ul>

          <p className="field-help">
            Production delivery remains
            blocked until private storage,
            file-signature inspection and
            malware scanning are configured.
          </p>
        </div>
      )}

      <div className="notice neutral">
        <strong>
          Correspondence only:
        </strong>{" "}
        a submission number is provided for
        correspondence. It does not create a
        public status page.
      </div>
    </div>
  );
}

function OutreachFormPage() {
  const { formSlug } = useParams();
  return <OutreachFormContent key={formSlug} formSlug={formSlug} />;
}

export default OutreachFormPage;
