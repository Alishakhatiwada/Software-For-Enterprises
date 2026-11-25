// Partly generated with AI assistance, reviewed and modified by me.

// =============================================================================
// BANANAAPI-QUEST: SECURITY HARDENING MIDDLEWARE
//
// THEME 4: VIRTUAL IDENTITY & APPLICATION SECURITY
// Implements defensive security controls:
// 1. Strict origin-based CORS protection
// 2. HTTP response security headers (X-Frame-Options, CSP/Cache, MIME sniffing)
// 3. Dependency-free in-memory fixed-window rate limiters per IP
// =============================================================================

const config = require("../config/config");

// =============================================================================
// 1. CORS CONFIGURATION
// =============================================================================

const corsOptions = {
    origin(origin, callback) {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
        // or requests originating from explicitly configured allowed origins
        if (!origin || config.allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        const error = new Error(`CORS policy blocked access from origin: ${origin}`);
        error.status = 403;
        return callback(error, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
};


// =============================================================================
// 2. HTTP SECURITY HEADERS
// =============================================================================

/**
 * Attaches protective HTTP headers to defend against clickjacking,
 * MIME-confusion attacks, and sensitive data caching in shared proxies.
 */
function securityHeaders(req, res, next) {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Cache-Control", "no-store");
    next();
}


// =============================================================================
// 3. IN-MEMORY FIXED-WINDOW RATE LIMITER FACTORY
// =============================================================================

/**
 * Creates an in-memory rate limiter middleware instance.
 * Uses client IP as the tracking key with zero external dependencies.
 *
 * @param {Object} options
 * @param {number} options.windowMs - Timeframe duration in milliseconds
 * @param {number} options.max - Maximum allowed requests per window
 * @param {string} options.message - Human-readable error message on HTTP 429
 */
function createRateLimiter(options = {}) {
    const windowMs = options.windowMs || 15 * 60 * 1000;
    const max = options.max || 100;
    const message = options.message || "Too many requests. Please try again later.";

    // In-memory store: Map<ip, { count: number, resetTime: number }>
    const hits = new Map();

    // Periodic sweep to prevent unbounded memory growth
    const cleanupTimer = setInterval(() => {
        const now = Date.now();
        for (const [ip, record] of hits.entries()) {
            if (now >= record.resetTime) {
                hits.delete(ip);
            }
        }
    }, windowMs);

    // Unref so the timer does not hold open the Node process in test suites
    if (cleanupTimer.unref) {
        cleanupTimer.unref();
    }

    const limiterMiddleware = function (req, res, next) {
        const ip =
            req.ip ||
            req.headers["x-forwarded-for"] ||
            req.socket.remoteAddress ||
            "127.0.0.1";

        const now = Date.now();
        let record = hits.get(ip);

        // Reset window if expired or not yet initialized
        if (!record || now >= record.resetTime) {
            record = {
                count: 1,
                resetTime: now + windowMs
            };
            hits.set(ip, record);
            return next();
        }

        record.count += 1;

        // Block requests exceeding quota with HTTP 429 and Retry-After header
        if (record.count > max) {
            const retryAfterSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
            res.setHeader("Retry-After", String(retryAfterSeconds));

            return res.status(429).json({
                success: false,
                message,
                retryAfter: retryAfterSeconds
            });
        }

        next();
    };

    // Helper method to reset limiter state during unit tests
    limiterMiddleware.reset = function () {
        hits.clear();
    };

    return limiterMiddleware;
}

// -----------------------------------------------------------------------------
// PRE-CONFIGURED LIMITERS
// -----------------------------------------------------------------------------

// Protect authentication routes against brute-force attacks
const loginLimiter = createRateLimiter({
    windowMs: config.rateLimits.login.windowMs,
    max: config.rateLimits.login.max,
    message: "Too many login attempts. Please try again after 15 minutes."
});

const registerLimiter = createRateLimiter({
    windowMs: config.rateLimits.register.windowMs,
    max: config.rateLimits.register.max,
    message: "Too many registration attempts. Please try again after 1 hour."
});

// Protect general API against excessive traffic
const apiLimiter = createRateLimiter({
    windowMs: config.rateLimits.api.windowMs,
    max: config.rateLimits.api.max,
    message: "Too many requests. Please slow down your activity."
});

module.exports = {
    corsOptions,
    securityHeaders,
    createRateLimiter,
    loginLimiter,
    registerLimiter,
    apiLimiter
};
