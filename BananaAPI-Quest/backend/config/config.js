// Partly generated with AI assistance, reviewed and modified by me.

// =============================================================================
// BANANAAPI-QUEST: CENTRAL APPLICATION CONFIGURATION
//
// THEME 1: VERSION CONTROL & MODULAR ARCHITECTURE
// Centralises environment variable parsing, default fallback values, and
// runtime validation to ensure consistent configuration across all components.
// =============================================================================

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

/**
 * Parses comma-separated allowed CORS origins from environment variable.
 * Fallback to VS Code Live Server defaults on port 5501.
 */
function parseAllowedOrigins(originsString) {
    if (!originsString || typeof originsString !== "string") {
        return ["http://localhost:5501", "http://127.0.0.1:5501"];
    }

    const origins = originsString
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);

    return origins.length > 0
        ? origins
        : ["http://localhost:5501", "http://127.0.0.1:5501"];
}

const config = {
    port: parseInt(process.env.PORT, 10) || 5000,
    bananaApiUrl:
        process.env.BANANA_API_URL ||
        "https://marcconrad.com/uob/banana/api.php?out=json&base64=no",
    apiTimeout: parseInt(process.env.API_TIMEOUT, 10) || 10000,
    maxRetryAttempts: parseInt(process.env.MAX_RETRY_ATTEMPTS, 10) || 3,
    allowedOrigins: parseAllowedOrigins(process.env.ALLOWED_ORIGINS),

    // In-memory rate limiting configuration parameters
    rateLimits: {
        login: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 10
        },
        register: {
            windowMs: 60 * 60 * 1000, // 1 hour
            max: 10
        },
        api: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 300
        }
    },

    /**
     * Validates critical environment configuration before server launch.
     * Throws an informative error if security keys or database connections are missing.
     */
    validate() {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret || typeof jwtSecret !== "string" || jwtSecret.trim().length < 16) {
            throw new Error(
                "Configuration Error: JWT_SECRET is missing or too short (minimum 16 characters required)."
            );
        }

        const mongodbUri = process.env.MONGODB_URI;
        if (!mongodbUri || typeof mongodbUri !== "string" || !mongodbUri.trim()) {
            throw new Error(
                "Configuration Error: MONGODB_URI environment variable is required."
            );
        }
    }
};

module.exports = config;
