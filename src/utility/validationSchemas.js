const { body, param } = require("express-validator");

const VALID_ROLES = ["admin", "editor"];
const NEWS_CATEGORIES = [
  "politics",
  "sports",
  "business",
  "technology",
  "education",
  "health",
  "entertainment",
  "local",
  "national",
  "international",
];
const NEWS_STATUSES = ["draft", "published", "rejected"];

const isMongoId = () =>
  // We use a regex+length based ObjectId check. Mongoose also validates.
  // express-validator has `isMongoId` but it can be stricter depending on version.
  // This regex is enough for early rejection.
  param("id").notEmpty().isString().matches(/^[0-9a-fA-F]{24}$/);

const registerValidation = [
  body("name").isString().trim().notEmpty().isLength({ min: 2, max: 80 }),
  body("email").isEmail().normalizeEmail(),
  body("password")
    .isString()
    .isLength({ min: 8, max: 200 })
    .custom((v) => !v.toLowerCase().includes("password")),
  body("role")
    .isString()
    .custom((v) => {
      if (!VALID_ROLES.includes(v)) throw new Error("Invalid role");
      return true;
    }),
];

const loginValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").isString().notEmpty(),
];

const objectIdParamValidation = [
  body("_id").optional(),
  param("id").notEmpty().matches(/^[0-9a-fA-F]{24}$/),
];

const newsCreateValidation = [
  body("title").isString().trim().notEmpty().isLength({ min: 2, max: 200 }),
  body("summary").isString().trim().notEmpty().isLength({ min: 2, max: 400 }),
  body("description").isString().trim().notEmpty().isLength({ min: 10, max: 5000 }),
  body("category")
    .isString()
    .custom((v) => {
      if (!NEWS_CATEGORIES.includes(v)) throw new Error("Invalid category");
      return true;
    }),
  body("status")
    .optional()
    .isString()
    .custom((v) => {
      if (!NEWS_STATUSES.includes(v)) throw new Error("Invalid status");
      return true;
    }),
  body("tags")
    .optional()
    .custom((v) => {
      // frontend sends comma-separated string
      if (typeof v !== "string") throw new Error("tags must be a comma-separated string");
      const parts = v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (parts.length > 30) throw new Error("Too many tags");
      return true;
    }),
  // Multer validation is handled via multer.middleware (mimetype/size)
];

const newsUpdateValidation = [
  body("title")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 200 }),
  body("summary")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 400 }),
  body("description")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 10, max: 5000 }),
  body("category")
    .optional()
    .isString()
    .custom((v) => {
      if (!NEWS_CATEGORIES.includes(v)) throw new Error("Invalid category");
      return true;
    }),
  body("status")
    .optional()
    .isString()
    .custom((v) => {
      if (!NEWS_STATUSES.includes(v)) throw new Error("Invalid status");
      return true;
    }),
  body("tags")
    .optional()
    .custom((v) => {
      if (typeof v !== "string") throw new Error("tags must be a comma-separated string");
      const parts = v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (parts.length > 30) throw new Error("Too many tags");
      return true;
    }),
];

const newsByCategoryValidation = [
  param("category")
    .notEmpty()
    .isString()
    .custom((v) => {
      if (!NEWS_CATEGORIES.includes(v)) throw new Error("Invalid category");
      return true;
    }),
];

const newsByEditorValidation = [
  param("editorId").notEmpty().matches(/^[0-9a-fA-F]{24}$/),
];

const settingsValidation = [
  body("websiteName")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .isLength({ min: 2, max: 80 }),
  body("footerText")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 300 }),

  // Social URLs: allow empty/undefined; validate if present
  ...["youtube", "facebook", "instagram", "linkedin", "twitter"].map((field) =>
    body(field)
      .optional({ nullable: true })
      .isString()
      .trim()
      .custom((v) => {
        if (v === "") return true;
        try {
          // eslint-disable-next-line no-new
          new URL(v);
        } catch {
          throw new Error(`${field} must be a valid URL`);
        }
        return true;
      })
  ),
];


module.exports = {
  registerValidation,
  loginValidation,
  newsCreateValidation,
  newsUpdateValidation,
  objectIdParamValidation,
  newsByCategoryValidation,
  newsByEditorValidation,
  settingsValidation,
  VALID_ROLES,
  NEWS_CATEGORIES,
  NEWS_STATUSES,
};

