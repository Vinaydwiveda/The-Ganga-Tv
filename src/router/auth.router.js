const express = require('express')
const { RegisterUser, LoginUser, MeUser } = require('../controller/auth.controller.js')

const router = express.Router();

router.post('/register', RegisterUser);
router.post('/login', LoginUser);
router.get('/me', MeUser);

module.exports = router;
