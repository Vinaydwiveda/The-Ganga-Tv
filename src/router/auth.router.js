const express = require('express')
const { RegisterUser, LoginUser, MeUser } = require('../controller/auth.controller.js');

const { registerValidation, loginValidation } = require("../utility/validationSchemas.js");
const { validate } = require("../middleware/validation.middleware.js");

const router = express.Router();

router.post('/register', registerValidation, validate, RegisterUser);
router.post('/login', loginValidation, validate, LoginUser);
router.get('/me', MeUser);

module.exports = router;

