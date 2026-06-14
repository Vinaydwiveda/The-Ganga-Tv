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

// Create
router.post("/", auth("admin", "editor"), upload.single("thumbnail"),createNews);

// Read
router.get("/", getAllNews);
router.get("/:id", getNewsById);

// Update
router.put("/:id", auth("admin", "editor"),upload.single("thumbnail"), updateNews);

// Delete
router.delete("/:id", auth("admin"), deleteNews);

// Filter
router.get("/category/:category", getNewsByCategory);
router.get("/editor/:editorId", getNewsByEditor);

module.exports = router;