
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ==========================================
// GENERATE A LOGIN TOKEN
// ==========================================

function createToken(user) {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is missing from the .env file.");
    }

    return jwt.sign(
        {
            userId: user._id.toString(),
            email: user.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "2h"
        }
    );
}


// ==========================================
// REGISTER A NEW USER
// ==========================================

async function register(req, res) {
    try {
        const { name, email, password } = req.body;

        // Validate required fields.
        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide your name, email and password."
            });
        }

        const trimmedName = name.trim();
        const normalizedEmail = email.trim().toLowerCase();

        // Validate name length.
        if (trimmedName.length > 80) {
            return res.status(400).json({
                success: false,
                message: "Your name cannot exceed 80 characters."
            });
        }

        // Validate password length.
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Your password must contain at least 8 characters."
            });
        }

        // Check whether the email already exists.
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        // Hash the password before saving it.
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create the user.
        const user = await User.create({
            name: trimmedName,
            email: normalizedEmail,
            password: hashedPassword
        });

        // Generate the login token.
        const token = createToken(user);

        return res.status(201).json({
            success: true,
            message: "Account created successfully!",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        console.error("Registration error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to register. Please try again."
        });
    }
}


// ==========================================
// LOG IN AN EXISTING USER
// ==========================================

async function login(req, res) {
    try {
        const { email, password } = req.body;

        // Validate required fields.
        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Please enter your email and password."
            });
        }

        // Find the user by email.
        const user = await User.findOne({
            email: email.trim().toLowerCase()
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Compare the entered password with the hashed password.
        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Generate the login token.
        const token = createToken(user);

        return res.status(200).json({
            success: true,
            message: "Login successful!",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to log in. Please try again."
        });
    }
}


// ==========================================
// EXPORT FUNCTIONS
// ==========================================

module.exports = {
    register,
    login
};
