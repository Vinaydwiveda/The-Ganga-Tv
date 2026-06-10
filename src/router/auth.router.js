const express = require('express')
const {RegisterUser,LoginUser} = require('../controller/auth.controller.js')

const router = express.Router();

router.post('/register',RegisterUser);
router.post('/login',LoginUser)


module.exports = router;