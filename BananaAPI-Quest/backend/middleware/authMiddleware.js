
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

function authMiddleware(req, res, next) {
    try {
        const authorization = req.headers.authorization;

        // Check whether the Bearer token exists.
        if (!authorization || !authorization.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Please log in to access this resource."
            });
        }

        const token = authorization.slice(7).trim();

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token is missing."
            });
        }

        // Check JWT configuration.
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing.");

            return res.status(500).json({
                success: false,
                message: "Server authentication configuration error."
            });
        }

        // Verify the JWT.
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Validate the information inside the token.
        if (
            !decoded.userId ||
            !mongoose.Types.ObjectId.isValid(decoded.userId) ||
            !decoded.email ||
            typeof decoded.email !== "string"
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid login token. Please log in again."
            });
        }

        // Make user information available to protected routes.
        req.user = {
            userId: decoded.userId,
            email: decoded.email
        };

        next();

    } catch (error) {
        console.error("Authentication error:", error.message);

        return res.status(401).json({
            success: false,
            message: "Your login token is invalid or has expired."
        });
    }
}

module.exports = authMiddleware;
