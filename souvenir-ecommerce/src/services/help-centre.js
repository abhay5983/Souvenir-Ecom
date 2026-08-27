const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

function field(
  name,
  label,
  kind,
  group,
  required = false,
  extra = {},
) {
  return {
    name,
    label,
    kind,
    group,
    required,
    ...extra,
  };
}

function contactFields(
  organisationLabel = "School or organisation",
) {
  return [
    field(
      "fullName",
      "Full name",
      "text",
      "ABOUT",
      true,
    ),
    field(
      "organisationName",
      organisationLabel,
      "text",
      "ABOUT",
      true,
    ),
    field(
      "email",
      "Email address",
      "email",
      "ABOUT",
      true,
    ),
    field(
      "mobile",
      "Mobile number",
      "tel",
      "ABOUT",
      true,
      {
        placeholder:
          "10-digit Indian mobile number",
      },
    ),
    field(
      "city",
      "City",
      "text",
      "ABOUT",
      true,
    ),
    field(
      "state",
      "State or union territory",
      "select",
      "ABOUT",
      true,
      {
        options: INDIAN_STATES,
      },
    ),
    field(
      "pincode",
      "PIN code",
      "text",
      "ABOUT",
      true,
      {
        placeholder: "6-digit PIN code",
        maxLength: 6,
      },
    ),
  ];
}

function catalogueFields() {
  return [
    field(
      "subject",
      "Subject or category",
      "select",
      "CONTEXT",
      false,
      {
        options: [
          "English",
          "Hindi",
          "Mathematics",
          "Science",
          "Social Science",
          "Computer Science",
          "General Knowledge",
          "Other",
        ],
      },
    ),
    field(
      "seriesId",
      "Series",
      "text",
      "CONTEXT",
      false,
      {
        placeholder:
          "Enter the Souvenir series name",
      },
    ),
    field(
      "classId",
      "Class or level",
      "text",
      "CONTEXT",
      false,
    ),
    field(
      "bookId",
      "Book title",
      "text",
      "CONTEXT",
      false,
    ),
    field(
      "edition",
      "Edition or academic year",
      "text",
      "CONTEXT",
      false,
    ),
    field(
      "isbn",
      "ISBN",
      "text",
      "CONTEXT",
      false,
    ),
  ];
}

function evidenceField(
  accept = ".jpg,.jpeg,.png,.pdf",
) {
  return field(
    "evidence",
    "Supporting evidence",
    "file",
    "DETAILS",
    false,
    {
      accept,
      help:
        "Choose supporting images or documents. Files remain local in this frontend prototype.",
    },
  );
}

/* -------------------------------------------------------------------------- */
/* HELP GUIDES                                                                */
/* -------------------------------------------------------------------------- */

export const helpGuides = [
  {
    slug: "find-right-books",
    category: "Catalogue",
    title: "How to find the right books",
    summary:
      "Learn how to browse Souvenir books by subject, learning stage and series.",
    estimatedReadMinutes: 3,
    lastReviewedAt: "July 2026",
    body: [
      "Open the Souvenir catalogue and begin with a subject, learning stage or search term.",
      "Open a series page to review its available classes, editions, language, curriculum and verified book variants.",
      "Use an ISBN when available to locate a specific edition. Public catalogue browsing does not expose confidential partner pricing.",
    ],
    relatedFormSlugs: [
      "general-enquiry",
      "school-requirement",
    ],
    relatedGuideSlugs: [
      "request-sample-books",
    ],
  },
  {
    slug: "place-sales-order",
    category: "Orders",
    title: "How to place a sales order",
    summary:
      "Understand how verified schools and distributors can prepare and submit an order request.",
    estimatedReadMinutes: 4,
    lastReviewedAt: "July 2026",
    body: [
      "Commercial ordering is available only within an authorised school, bookseller or distributor account.",
      "Select the required book variants, enter commercial quantities and review the cart before checkout.",
      "An order submission is not immediate confirmation. Partner verification, availability, commercial review and fulfilment controls still apply.",
    ],
    relatedFormSlugs: [
      "order-discrepancy",
      "business-partnership",
    ],
    relatedGuideSlugs: [],
  },
  {
    slug: "request-sample-books",
    category: "Samples",
    title: "How to request sample books",
    summary:
      "Check sample eligibility, quantity limits and the approval process.",
    estimatedReadMinutes: 3,
    lastReviewedAt: "July 2026",
    body: [
      "Sample requests are intended for genuine academic evaluation, adoption review or institutional demonstration.",
      "Sample quantities are limited and may require school, educator or partner verification.",
      "Use the Sample Book Enquiry form for guidance or to report a problem with an existing sample request.",
    ],
    relatedFormSlugs: [
      "sample-request",
    ],
    relatedGuideSlugs: [
      "find-right-books",
    ],
  },
  {
    slug: "request-digital-resource",
    category: "Digital Learning",
    title: "How to request a digital resource",
    summary:
      "Choose a Souvenir series, class and eligible digital learning resource.",
    estimatedReadMinutes: 5,
    lastReviewedAt: "July 2026",
    body: [
      "Digital resources are connected to eligible Souvenir series, classes and requester roles.",
      "Teacher tools, answer keys and assessment resources require verified educator or institutional access.",
      "Submitting a request does not automatically create a download, entitlement or permanent access link.",
    ],
    relatedFormSlugs: [
      "digital-support",
    ],
    relatedGuideSlugs: [],
  },
  {
    slug: "activate-partner-key",
    category: "Partner Access",
    title: "How to activate a PartnerKey",
    summary:
      "Learn how an invited school, bookseller or distributor activates its Souvenir access.",
    estimatedReadMinutes: 4,
    lastReviewedAt: "July 2026",
    body: [
      "A Souvenir PartnerKey identifies an approved organisation. It is not a password.",
      "Activation combines the PartnerKey, registered contact information and secure verification.",
      "Never enter passwords or one-time codes inside a public support form.",
    ],
    relatedFormSlugs: [
      "general-enquiry",
      "business-partnership",
    ],
    relatedGuideSlugs: [],
  },
  {
    slug: "report-book-issue",
    category: "Book Support",
    title: "How to report a book issue",
    summary:
      "Send clear information about printing, content, packaging or delivery concerns.",
    estimatedReadMinutes: 3,
    lastReviewedAt: "July 2026",
    body: [
      "For editorial concerns, provide the book title, class, edition, chapter, page number and exact printed text.",
      "For printing or physical defects, include clear photographs of the cover, edition page and affected pages.",
      "For delivery discrepancies, provide the order reference, affected title, quantities and delivery details.",
    ],
    relatedFormSlugs: [
      "teacher-editorial-feedback",
      "order-discrepancy",
    ],
    relatedGuideSlugs: [],
  },
];

/* -------------------------------------------------------------------------- */
/* FAQs                                                                       */
/* -------------------------------------------------------------------------- */

export const helpFaqs = [
  {
    id: "public-support",
    question:
      "Do I need a Souvenir account to contact support?",
    answer:
      "No. Public outreach forms are available without a Souvenir account.",
  },
  {
    id: "teacher-resources",
    question:
      "Can students request teacher resources?",
    answer:
      "No. Restricted teacher tools are available only to verified educators and institutions.",
  },
  {
    id: "order-confirmation",
    question:
      "Does submitting an order mean it is confirmed?",
    answer:
      "No. Orders require partner verification, availability checks and approval from Souvenir HQ.",
  },
  {
    id: "individual-buying",
    question:
      "Can I buy books directly as an individual customer?",
    answer:
      "The current platform is designed for schools, booksellers, distributors and approved institutional partners.",
  },
  {
    id: "digital-delivery",
    question:
      "How are digital resources delivered?",
    answer:
      "Delivery depends on the resource type, requester role, series, class, verification and licence conditions.",
  },
  {
    id: "editorial-feedback",
    question:
      "Can I submit editorial feedback?",
    answer:
      "Yes. Use the Teacher and Editorial Feedback form and provide the book, class, page and issue details.",
  },
];

/* -------------------------------------------------------------------------- */
/* OUTREACH FORMS                                                             */
/* -------------------------------------------------------------------------- */

export const outreachForms = [
  {
    slug: "general-enquiry",
    type: "GENERAL_ENQUIRY",
    prefix: "GEN",
    category: "General Support",
    title: "General Enquiry",
    summary:
      "Contact Souvenir when you are not sure which specialist form to use.",
    cta: "Open enquiry form",
    icon: "message",
    featured: true,
    preparation: [
      "Choose the closest enquiry topic",
      "Provide only the information needed for a response",
      "Do not include passwords or OTPs",
    ],
    fields: [
      ...contactFields(),
      field(
        "topic",
        "Enquiry topic",
        "select",
        "CONTEXT",
        true,
        {
          options: [
            "Books and catalogue",
            "Editorial feedback",
            "Orders and samples",
            "Digital learning",
            "School support",
            "Publishing",
            "Partnerships",
            "Rights and permissions",
            "Other",
          ],
        },
      ),
      field(
        "reference",
        "Existing reference, if available",
        "text",
        "CONTEXT",
        false,
      ),
      field(
        "description",
        "How can we help?",
        "textarea",
        "DETAILS",
        true,
        {
          maxLength: 4000,
        },
      ),
      evidenceField(),
    ],
  },
  {
    slug: "teacher-editorial-feedback",
    type: "EDITORIAL_FEEDBACK",
    prefix: "EDT",
    category: "Academic Support",
    title: "Teacher & Editorial Feedback",
    summary:
      "Report a content question, correction, suggestion or classroom observation.",
    cta: "Send feedback",
    icon: "book-pencil",
    featured: true,
    preparation: [
      "Book title, class and edition",
      "Chapter and page number",
      "Clear image of the affected page where possible",
    ],
    fields: [
      ...contactFields("School name"),
      field(
        "designation",
        "Designation",
        "text",
        "ABOUT",
        true,
      ),
      field(
        "board",
        "Board or curriculum",
        "text",
        "ABOUT",
        true,
      ),
      ...catalogueFields(),
      field(
        "chapter",
        "Chapter or lesson",
        "text",
        "CONTEXT",
        false,
      ),
      field(
        "pageNumber",
        "Page number",
        "text",
        "CONTEXT",
        false,
      ),
      field(
        "issueType",
        "Feedback type",
        "select",
        "DETAILS",
        true,
        {
          options: [
            "Possible factual error",
            "Typographical or grammatical error",
            "Incorrect answer or solution",
            "Unclear question or exercise",
            "Image, map, graph or table issue",
            "Curriculum alignment concern",
            "Editorial improvement suggestion",
            "Other editorial feedback",
          ],
        },
      ),
      field(
        "description",
        "Detailed description",
        "textarea",
        "DETAILS",
        true,
        {
          maxLength: 4000,
        },
      ),
      field(
        "suggestedResolution",
        "Suggested correction or improvement",
        "textarea",
        "DETAILS",
        false,
      ),
      evidenceField(),
    ],
  },
  {
    slug: "sample-request",
    type: "SAMPLE_REQUEST",
    prefix: "SMP",
    category: "Samples",
    title: "Sample Book Enquiry",
    summary:
      "Ask about evaluation copies for an authorised school or institutional review.",
    cta: "Request information",
    icon: "book-check",
    featured: true,
    preparation: [
      "School and educator details",
      "Titles or series required",
      "Purpose of evaluation",
    ],
    fields: [
      ...contactFields("School or organisation"),
      field(
        "designation",
        "Designation",
        "text",
        "ABOUT",
        true,
      ),
      ...catalogueFields(),
      field(
        "expectedStudents",
        "Expected student strength",
        "number",
        "CONTEXT",
        false,
      ),
      field(
        "evaluationPurpose",
        "Evaluation purpose",
        "select",
        "DETAILS",
        true,
        {
          options: [
            "School adoption review",
            "Teacher evaluation",
            "Curriculum comparison",
            "Institutional demonstration",
            "Other",
          ],
        },
      ),
      field(
        "description",
        "Additional details",
        "textarea",
        "DETAILS",
        true,
      ),
    ],
  },
  {
    slug: "order-discrepancy",
    type: "ORDER_DISCREPANCY",
    prefix: "ORD",
    category: "Orders",
    title: "Order or Delivery Issue",
    summary:
      "Report missing, incorrect, damaged or delayed books from an institutional order.",
    cta: "Report an issue",
    icon: "package-alert",
    featured: true,
    preparation: [
      "Order, invoice or purchase-order number",
      "Affected title or ISBN",
      "Photographs or delivery documents where relevant",
    ],
    fields: [
      ...contactFields("Organisation name"),
      field(
        "orderNumber",
        "Order number",
        "text",
        "CONTEXT",
        false,
      ),
      field(
        "invoiceNumber",
        "Invoice number",
        "text",
        "CONTEXT",
        false,
      ),
      field(
        "affectedTitle",
        "Affected title or ISBN",
        "text",
        "CONTEXT",
        true,
      ),
      field(
        "quantityAffected",
        "Quantity affected",
        "number",
        "CONTEXT",
        false,
      ),
      field(
        "issueType",
        "Issue type",
        "select",
        "DETAILS",
        true,
        {
          options: [
            "Short quantity",
            "Wrong title",
            "Wrong edition",
            "Damaged in transit",
            "Partial shipment",
            "Shipment not received",
            "Invoice concern",
            "Other order concern",
          ],
        },
      ),
      field(
        "description",
        "Describe the issue",
        "textarea",
        "DETAILS",
        true,
      ),
      field(
        "preferredResolution",
        "Preferred resolution",
        "select",
        "DETAILS",
        false,
        {
          options: [
            "Send missing books",
            "Replace incorrect books",
            "Replace damaged books",
            "Correct invoice",
            "Arrange a callback",
            "Other",
          ],
        },
      ),
      evidenceField(),
    ],
  },
  {
    slug: "digital-support",
    type: "DIGITAL_SUPPORT",
    prefix: "DTS",
    category: "Digital Learning",
    title: "Digital Resource Support",
    summary:
      "Get help with eligible digital resources, access or offline classroom packages.",
    cta: "Get digital support",
    icon: "qr-cursor",
    featured: true,
    preparation: [
      "Book title and edition",
      "Device and browser information",
      "Screenshot or exact error message",
    ],
    fields: [
      ...contactFields(),
      ...catalogueFields(),
      field(
        "supportIntent",
        "What do you need help with?",
        "select",
        "CONTEXT",
        true,
        {
          options: [
            "Digital access is not working",
            "QR code is not working",
            "Resource does not match the book",
            "Offline package is not working",
            "Other digital support",
          ],
        },
      ),
      field(
        "device",
        "Device type",
        "text",
        "CONTEXT",
        false,
      ),
      field(
        "browser",
        "Browser",
        "text",
        "CONTEXT",
        false,
      ),
      field(
        "errorMessage",
        "Exact error message",
        "text",
        "DETAILS",
        false,
      ),
      field(
        "description",
        "Describe what happened",
        "textarea",
        "DETAILS",
        true,
      ),
      evidenceField(".jpg,.jpeg,.png,.pdf"),
    ],
  },
  {
    slug: "author-submission",
    type: "AUTHOR_SUBMISSION",
    prefix: "AUT",
    category: "Publishing",
    title: "Author & Manuscript Enquiry",
    summary:
      "Contact Souvenir regarding an educational manuscript or publishing proposal.",
    cta: "Submit an enquiry",
    icon: "manuscript",
    featured: true,
    preparation: [
      "Professional profile or CV",
      "Proposal or synopsis",
      "Sample chapter or portfolio",
    ],
    fields: [
      ...contactFields("Current organisation"),
      field(
        "qualification",
        "Highest qualification",
        "text",
        "ABOUT",
        true,
      ),
      field(
        "expertise",
        "Subject expertise",
        "text",
        "ABOUT",
        true,
      ),
      field(
        "proposedRole",
        "Proposed role",
        "select",
        "CONTEXT",
        true,
        {
          options: [
            "Author",
            "Co-author",
            "Editor",
            "Reviewer",
            "Translator",
            "Illustrator",
            "Digital-content contributor",
          ],
        },
      ),
      field(
        "proposedTitle",
        "Proposed title or concept",
        "text",
        "CONTEXT",
        true,
      ),
      field(
        "description",
        "Proposal synopsis",
        "textarea",
        "DETAILS",
        true,
      ),
      field(
        "rightsDeclaration",
        "I own or control the rights to the submitted material.",
        "checkbox",
        "DETAILS",
        true,
      ),
      evidenceField(
        ".pdf,.doc,.docx,.jpg,.jpeg,.png",
      ),
    ],
  },
  {
    slug: "school-requirement",
    type: "SCHOOL_REQUIREMENT",
    prefix: "SCH",
    category: "Schools",
    title: "School Requirement",
    summary:
      "Discuss curriculum programmes, school adoption or institutional learning needs.",
    cta: "Contact Souvenir",
    icon: "school",
    featured: false,
    preparation: [
      "School board and classes",
      "Subjects or series of interest",
      "Preferred meeting format",
    ],
    fields: [
      ...contactFields("School name"),
      field(
        "designation",
        "Designation",
        "text",
        "ABOUT",
        true,
      ),
      field(
        "board",
        "Board or curriculum",
        "text",
        "CONTEXT",
        true,
      ),
      field(
        "classes",
        "Classes",
        "text",
        "CONTEXT",
        true,
      ),
      field(
        "subjects",
        "Subjects",
        "text",
        "CONTEXT",
        true,
      ),
      field(
        "requirementType",
        "Requirement type",
        "select",
        "DETAILS",
        true,
        {
          options: [
            "Book-series presentation",
            "Curriculum mapping",
            "School adoption discussion",
            "Teacher orientation",
            "Digital demonstration",
            "Institutional meeting",
            "Other",
          ],
        },
      ),
      field(
        "description",
        "Additional context",
        "textarea",
        "DETAILS",
        false,
      ),
    ],
  },
  {
    slug: "accessibility-support",
    type: "ACCESSIBILITY_SUPPORT",
    prefix: "ACS",
    category: "Accessibility",
    title: "Accessibility Support",
    summary:
      "Share an accessibility requirement related to Souvenir content or services.",
    cta: "Request support",
    icon: "accessibility",
    featured: false,
    preparation: [
      "Book or resource involved",
      "Accessibility barrier",
      "Assistive technology where relevant",
    ],
    fields: [
      ...contactFields(),
      ...catalogueFields(),
      field(
        "requirementType",
        "Accessibility requirement",
        "select",
        "DETAILS",
        true,
        {
          options: [
            "Accessible digital text",
            "Audio support",
            "Larger text",
            "Screen-reader compatibility",
            "Colour or contrast concern",
            "Captions or transcripts",
            "Keyboard-access problem",
            "Other",
          ],
        },
      ),
      field(
        "description",
        "Describe the requirement",
        "textarea",
        "DETAILS",
        true,
      ),
      evidenceField(),
    ],
  },
  {
    slug: "business-partnership",
    type: "BUSINESS_PARTNERSHIP",
    prefix: "TRD",
    category: "Partnerships",
    title: "Business Partnership",
    summary:
      "Contact Souvenir regarding bookseller, distribution or institutional collaboration.",
    cta: "Discuss partnership",
    icon: "handshake",
    featured: false,
    preparation: [
      "Business registration details",
      "Territory and business focus",
      "Relevant business references",
    ],
    fields: [
      field(
        "legalBusinessName",
        "Legal business name",
        "text",
        "ABOUT",
        true,
      ),
      field(
        "fullName",
        "Contact person",
        "text",
        "ABOUT",
        true,
      ),
      field(
        "email",
        "Email address",
        "email",
        "ABOUT",
        true,
      ),
      field(
        "mobile",
        "Mobile number",
        "tel",
        "ABOUT",
        true,
      ),
      field(
        "businessType",
        "Business type",
        "select",
        "CONTEXT",
        true,
        {
          options: [
            "Bookseller",
            "Distributor",
            "Wholesaler",
            "Institutional supplier",
            "Other",
          ],
        },
      ),
      field(
        "gst",
        "GST or tax registration",
        "text",
        "CONTEXT",
        false,
      ),
      field(
        "territory",
        "Territory served",
        "text",
        "CONTEXT",
        true,
      ),
      field(
        "description",
        "Partnership requirement",
        "textarea",
        "DETAILS",
        true,
      ),
      evidenceField(),
    ],
  },
  {
    slug: "rights-permissions",
    type: "RIGHTS_PERMISSIONS",
    prefix: "RGT",
    category: "Rights & Permissions",
    title: "Rights and Permissions",
    summary:
      "Request permission relating to Souvenir content, reproduction or publishing rights.",
    cta: "Request permission",
    icon: "document-shield",
    featured: false,
    preparation: [
      "Book title, ISBN and edition",
      "Exact pages or content required",
      "Purpose, territory and duration",
    ],
    fields: [
      ...contactFields("Organisation"),
      ...catalogueFields(),
      field(
        "contentRequested",
        "Pages or content requested",
        "textarea",
        "CONTEXT",
        true,
      ),
      field(
        "intendedUse",
        "Intended use",
        "textarea",
        "DETAILS",
        true,
      ),
      field(
        "territory",
        "Territory",
        "text",
        "DETAILS",
        true,
      ),
      field(
        "duration",
        "Duration",
        "text",
        "DETAILS",
        true,
      ),
      evidenceField(".pdf"),
    ],
  },
  {
    slug: "report-piracy",
    type: "REPORT_PIRACY",
    prefix: "CPR",
    category: "Rights Protection",
    title: "Report Suspected Piracy",
    summary:
      "Confidentially report suspected unauthorised reproduction or distribution.",
    cta: "Submit confidential report",
    icon: "shield-alert",
    featured: false,
    confidential: true,
    preparation: [
      "Book or series involved",
      "Seller, website or physical location",
      "Screenshots or photographs where safely available",
    ],
    fields: [
      field(
        "confidential",
        "Submit this report confidentially",
        "checkbox",
        "ABOUT",
        false,
      ),
      field(
        "fullName",
        "Reporter name",
        "text",
        "ABOUT",
        false,
      ),
      field(
        "email",
        "Email address",
        "email",
        "ABOUT",
        false,
      ),
      field(
        "mobile",
        "Mobile number",
        "tel",
        "ABOUT",
        false,
      ),
      field(
        "issueType",
        "Type of concern",
        "select",
        "CONTEXT",
        true,
        {
          options: [
            "Counterfeit book",
            "Unauthorised PDF",
            "Copied content",
            "Trademark or brand misuse",
            "Other copyright concern",
          ],
        },
      ),
      field(
        "bookOrSeries",
        "Book or series involved",
        "text",
        "CONTEXT",
        true,
      ),
      field(
        "seller",
        "Seller, website or organisation",
        "text",
        "CONTEXT",
        false,
      ),
      field(
        "url",
        "Website URL",
        "url",
        "CONTEXT",
        false,
      ),
      field(
        "description",
        "Describe the concern",
        "textarea",
        "DETAILS",
        true,
      ),
      evidenceField(),
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* LOOKUPS AND SEARCH                                                         */
/* -------------------------------------------------------------------------- */

export function guideBySlug(slug) {
  return helpGuides.find(
    (guide) => guide.slug === slug,
  );
}

export function outreachFormBySlug(slug) {
  return outreachForms.find(
    (form) => form.slug === slug,
  );
}

function includesQuery(values, query) {
  const normalizedQuery = String(query)
    .trim()
    .toLocaleLowerCase();

  if (!normalizedQuery) {
    return false;
  }

  return values.some((value) =>
    String(value ?? "")
      .toLocaleLowerCase()
      .includes(normalizedQuery),
  );
}

export function searchHelpContent(query) {
  const cleanQuery = String(query).trim();

  if (!cleanQuery) {
    return {
      guides: [],
      faqs: [],
      forms: [],
    };
  }

  return {
    guides: helpGuides.filter((guide) =>
      includesQuery(
        [
          guide.title,
          guide.summary,
          guide.category,
          ...(guide.body ?? []),
        ],
        cleanQuery,
      ),
    ),

    faqs: helpFaqs.filter((faq) =>
      includesQuery(
        [
          faq.question,
          faq.answer,
        ],
        cleanQuery,
      ),
    ),

    forms: outreachForms.filter((form) =>
      includesQuery(
        [
          form.title,
          form.summary,
          form.category,
          form.cta,
        ],
        cleanQuery,
      ),
    ),
  };
}

/* -------------------------------------------------------------------------- */
/* VALIDATION                                                                 */
/* -------------------------------------------------------------------------- */

function normalizeEmail(value) {
  const email = String(value ?? "")
    .trim()
    .toLocaleLowerCase();

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email,
  )
    ? email
    : null;
}

function normalizePhone(value) {
  const digits = String(value ?? "")
    .replace(/\D/g, "")
    .replace(
      /^91(?=[6-9][0-9]{9}$)/,
      "",
    );

  return /^[6-9][0-9]{9}$/.test(digits)
    ? `+91${digits}`
    : null;
}

function validateFile(file) {
  const extension =
    String(file.name ?? "")
      .toLocaleLowerCase()
      .split(".")
      .at(-1) ?? "";

  const allowedExtensions = [
    "jpg",
    "jpeg",
    "png",
    "pdf",
    "doc",
    "docx",
  ];

  if (!allowedExtensions.includes(extension)) {
    return `${file.name}: file type is not allowed.`;
  }

  const limit =
    extension === "pdf"
      ? 20 * 1024 * 1024
      : 10 * 1024 * 1024;

  if (
    Number(file.size) <= 0 ||
    Number(file.size) > limit
  ) {
    return `${file.name}: file is empty or exceeds the size limit.`;
  }

  return null;
}

export function validateOutreachDraft(draft) {
  const definition = outreachForms.find(
    (form) =>
      form.type === draft.formType,
  );

  if (!definition) {
    return [
      "Unknown outreach form type.",
    ];
  }

  const errors = [];
  const values = draft.values ?? {};

  if (draft.honeypot) {
    errors.push(
      "The submission could not be accepted.",
    );
  }

  for (const currentField of definition.fields ?? []) {
    const value =
      values[currentField.name];

    const isEmpty =
      value === undefined ||
      value === null ||
      value === false ||
      String(value).trim() === "";

    if (
      currentField.required &&
      isEmpty
    ) {
      errors.push(
        `${currentField.label} is required.`,
      );
    }

    if (
      currentField.kind === "email" &&
      !isEmpty &&
      !normalizeEmail(value)
    ) {
      errors.push(
        `${currentField.label} must be a valid email address.`,
      );
    }

    if (
      currentField.kind === "tel" &&
      !isEmpty &&
      !normalizePhone(value)
    ) {
      errors.push(
        `${currentField.label} must be a valid Indian mobile number.`,
      );
    }

    if (
      currentField.name === "pincode" &&
      !isEmpty &&
      !/^[1-9][0-9]{5}$/.test(
        String(value).trim(),
      )
    ) {
      errors.push(
        `${currentField.label} must be a valid six-digit Indian PIN code.`,
      );
    }

    if (
      currentField.maxLength &&
      typeof value === "string" &&
      value.length >
        currentField.maxLength
    ) {
      errors.push(
        `${currentField.label} is too long.`,
      );
    }
  }

  const files = draft.files ?? [];

  const totalSize = files.reduce(
    (total, file) =>
      total + Number(file.size ?? 0),
    0,
  );

  if (totalSize > 40 * 1024 * 1024) {
    errors.push(
      "The total attachment size exceeds 40 MB.",
    );
  }

  files.forEach((file) => {
    const error = validateFile(file);

    if (error) {
      errors.push(error);
    }
  });

  return Array.from(new Set(errors));
}

/* -------------------------------------------------------------------------- */
/* ROUTING AND SUBMISSION SERVICE                                             */
/* -------------------------------------------------------------------------- */

const routingRules = [
  {
    formType: "GENERAL_ENQUIRY",
    destination: "Partner Care Triage",
  },
  {
    formType: "EDITORIAL_FEEDBACK",
    destination: "Academic Editorial",
  },
  {
    formType: "SAMPLE_REQUEST",
    destination: "Sample Desk",
  },
  {
    formType: "ORDER_DISCREPANCY",
    destination: "Order Operations",
  },
  {
    formType: "DIGITAL_SUPPORT",
    destination: "Digital Support",
  },
  {
    formType: "AUTHOR_SUBMISSION",
    destination: "Author Acquisition",
  },
  {
    formType: "SCHOOL_REQUIREMENT",
    destination: "Academic Support",
  },
  {
    formType: "ACCESSIBILITY_SUPPORT",
    destination: "Accessibility Review",
  },
  {
    formType: "BUSINESS_PARTNERSHIP",
    destination: "Business Development",
  },
  {
    formType: "RIGHTS_PERMISSIONS",
    destination: "Rights and Legal",
  },
  {
    formType: "REPORT_PIRACY",
    destination: "Anti-Piracy",
  },
];

export function selectRoutingTeam(formType) {
  return (
    routingRules.find(
      (rule) =>
        rule.formType === formType,
    )?.destination ??
    "Partner Care Triage"
  );
}

function createReference(prefix, now = new Date()) {
  const randomValues =
    new Uint32Array(1);

  crypto.getRandomValues(randomValues);

  const number =
    randomValues[0] ?? Date.now();

  const digits = String(
    number % 1_000_000,
  ).padStart(6, "0");

  return `${prefix}-${now.getUTCFullYear()}-${digits}`;
}

export function buildOutreachConfirmation(
  definition,
  result,
  email,
) {
  const [local = "", domain = ""] =
    String(email).split("@");

  return {
    publicReference:
      result.publicReference,

    recipientMasked: email
      ? `${local.slice(0, 1)}•••@${domain}`
      : "not supplied",

    subject:
      `Souvenir has received your submission — ${result.publicReference}`,

    body:
      `Souvenir has received your ${definition.title} submission. ` +
      `Please retain ${result.publicReference} for correspondence.`,

    deliveryStatus: "PREVIEW_STORED",
  };
}

class OutreachSubmissionService {
  constructor() {
    this.records = [];
    this.idempotency = new Map();
    this.confirmations = [];
  }

  submit(draft, idempotencyKey) {
    const existing =
      this.idempotency.get(
        idempotencyKey,
      );

    if (existing) {
      return {
        ok: true,
        value: existing,
      };
    }

    const errors =
      validateOutreachDraft(draft);

    if (errors.length > 0) {
      return {
        ok: false,
        error: {
          code: "VALIDATION_FAILED",
          message: errors.join(" "),
        },
      };
    }

    const definition =
      outreachForms.find(
        (form) =>
          form.type === draft.formType,
      );

    if (!definition) {
      return {
        ok: false,
        error: {
          code: "FORM_NOT_FOUND",
          message:
            "The selected outreach form could not be found.",
        },
      };
    }

    const publicReference =
      createReference(
        definition.prefix ?? "GEN",
      );

    const submittedAt =
      new Date().toISOString();

    const assignedTeam =
      selectRoutingTeam(
        definition.type,
      );

    const attachments = (
      draft.files ?? []
    ).map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,

      safeDisplayName: String(
        file.name,
      )
        .replace(
          /[^a-zA-Z0-9._ -]/g,
          "_",
        )
        .slice(0, 120),

      checksumStatus:
        "CLIENT_PENDING",

      malwareScanStatus:
        "PRODUCTION_PROVIDER_REQUIRED",
    }));

    const record = {
      id:
        crypto.randomUUID?.() ??
        `${Date.now()}-${Math.random()}`,

      publicReference,
      formType: definition.type,
      submittedAt,
      internalStatus: "New",
      assignedTeam,

      originalPayload:
        structuredClone(
          draft.values ?? {},
        ),

      attachments,

      accountId:
        draft.accountId ?? null,

      submittedByUserId:
        draft.submittedByUserId ??
        null,

      auditEvents: [
        {
          event: "SUBMITTED",
          at: submittedAt,
          actor:
            draft.submittedByUserId ??
            "public-visitor",
        },
        {
          event: "ROUTED",
          at: submittedAt,
          actor: "routing-rules",
        },
      ],
    };

    this.records.unshift(record);

    const email = String(
      draft.values?.email ??
        draft.values?.adultEmail ??
        "",
    );

    const result = {
      success: true,
      publicReference,
      formTitle: definition.title,

      safeSummary:
        `${definition.category} · ${definition.title}`,

      confirmationDelivery: email
        ? "PREVIEW_STORED"
        : "NOT_REQUESTED",
    };

    if (email) {
      const confirmation =
        buildOutreachConfirmation(
          definition,
          result,
          email,
        );

      this.confirmations.unshift(
        confirmation,
      );
    }

    this.idempotency.set(
      idempotencyKey,
      result,
    );

    return {
      ok: true,
      value: result,
    };
  }

  listInternal() {
    return this.records;
  }

  listConfirmationPreviews() {
    return this.confirmations;
  }

  find(reference) {
    return this.records.find(
      (record) =>
        record.publicReference ===
        reference,
    );
  }

  assign(reference, team, actor) {
    const record =
      this.find(reference);

    if (!record) {
      return {
        ok: false,
        error: {
          code: "NOT_FOUND",
          message:
            "The internal submission was not found.",
        },
      };
    }

    record.assignedTeam = team;
    record.internalStatus =
      "Assigned";

    record.auditEvents.push({
      event: "ASSIGNED",
      at: new Date().toISOString(),
      actor,
    });

    return {
      ok: true,
      value: record,
    };
  }
}

export const outreachSubmissionService =
  new OutreachSubmissionService();