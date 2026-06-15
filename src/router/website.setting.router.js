const express = require("express");
const router = express.Router();

const upload = require("../middleware/multer.middleware");

const {
  getSettings,
  createSettings,
  updateSettings,
} = require("../controller/website.setting.controller");

const auth = require("../middleware/auth.middleware.js");

const { validate } = require("../middleware/validation.middleware.js");
const { settingsValidation } = require("../utility/validationSchemas.js");

// Public
router.get("/", getSettings);

// Admin Only
router.post(
  "/",
  auth("admin"),
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  settingsValidation,
  validate,
  createSettings
);

router.put(
  "/",
  auth("admin"),
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  settingsValidation,
  validate,
  updateSettings
);

module.exports = router;
