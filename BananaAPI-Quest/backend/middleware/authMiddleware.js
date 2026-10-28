const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Please log in to access this resource."
        });
    }

    const token = authorization.slice(7);

    try {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is missing.");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Your login token is invalid or has expired."
        });
    }
}

module.exports = authMiddleware;
