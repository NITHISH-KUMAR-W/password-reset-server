const express = require('express');
const { forgotPassword, resetPassword, registerUser } = require('../controllers/authController');

const router = express.Router();

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post("/register", registerUser);

module.exports = router;
