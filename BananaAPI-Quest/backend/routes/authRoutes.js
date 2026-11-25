// Partly generated with AI assistance, reviewed and modified by me.

const express = require("express");
const { register, login } = require("../controllers/authController");
const { loginLimiter, registerLimiter } = require("../middleware/security");

const router = express.Router();

// Register a new user with brute-force rate limiting
router.post("/register", registerLimiter, register);

// Log in an existing user with brute-force rate limiting
router.post("/login", loginLimiter, login);

module.exports = router;
