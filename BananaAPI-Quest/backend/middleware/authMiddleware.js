
const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
    try {
        // Get the Authorization header.
        const authorization = req.headers.authorization;

        // Check whether a Bearer token was provided.
        if (
            !authorization ||
            !authorization.startsWith("Bearer ")
        ) {
            return res.status(401).json({
                success: false,
                message: "Please log in to access this resource."
            });
        }

        // Extract the token.
        const token = authorization.slice(7).trim();

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token is missing."
            });
        }

        // Check whether JWT_SECRET exists.
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing from environment variables.");

            return res.status(500).json({
                success: false,
                message: "Server authentication configuration error."
            });
        }

        // Verify the token.
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Check whether the token contains a user ID.
        if (!decoded.userId) {
            return res.status(401).json({
                success: false,
                message: "Invalid login token. Please log in again."
            });
        }

        // Make authenticated user information available
        // to the controllers.
        req.user = decoded;

        // Continue to the requested route.
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
