
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const bananaRoutes = require("./routes/bananaRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Authentication routes
app.use("/api/auth", authRoutes);

// Banana puzzle routes
app.use("/api/banana", bananaRoutes);

// Home route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to BananaAPI-Quest API!"
    });
});

// Game information
app.get("/api/game", (req, res) => {
    res.json({
        success: true,
        game: {
            title: "BananaAPI-Quest",
            description:
                "Register, log in, solve visual maths puzzles, and track your progress.",
            status: "In Development"
        }
    });
});

// API 404 handler
app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        message: `API route not found: ${req.method} ${req.originalUrl}`
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Server error:", err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error."
    });
});

// Start server
async function startServer() {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(
                `BananaAPI-Quest API is running on port ${PORT}`
            );
            console.log(
                `Game information: http://localhost:${PORT}/api/game`
            );
            console.log(
                `Banana puzzle: http://localhost:${PORT}/api/banana/puzzle`
            );
        });
    } catch (error) {
        console.error("Could not start the server:", error);
        process.exit(1);
    }
}

startServer();
