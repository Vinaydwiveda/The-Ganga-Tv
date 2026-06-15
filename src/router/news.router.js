const router = require("express").Router();
const upload = require("../middleware/multer.middleware");

const {
  createNews,
  getAllNews,
  getNewsById,
  updateNews,
  deleteNews,
  getNewsByCategory,
  getNewsByEditor,
} = require("../controller/news.controller.js");

const auth = require("../middleware/auth.middleware.js");

const { validate } = require("../middleware/validation.middleware.js");
const {
  newsCreateValidation,
  newsUpdateValidation,
  objectIdParamValidation,
  newsByCategoryValidation,
  newsByEditorValidation,
} = require("../utility/validationSchemas.js");

// Create
router.post(
  "/",
  auth("admin", "editor"),
  upload.single("thumbnail"),
  validate,
  createNews
);

// Read
router.get("/", getAllNews);
router.get("/:id", objectIdParamValidation, validate, getNewsById);

// Update
router.put(
  "/:id",
  auth("admin", "editor"),
  upload.single("thumbnail"),
  newsUpdateValidation,
  validate,
  updateNews
);

// Delete
router.delete("/:id", auth("admin"), objectIdParamValidation, validate, deleteNews);

// Filter
router.get(
  "/category/:category",
  newsByCategoryValidation,
  validate,
  getNewsByCategory
);
router.get(
  "/editor/:editorId",
  newsByEditorValidation,
  validate,
  getNewsByEditor
);

module.exports = router;
