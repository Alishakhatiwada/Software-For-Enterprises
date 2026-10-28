
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/database");
const GameProgress = require("./models/GameProgress");
const bananaApi = require("./services/bananaApi");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Authentication routes
app.use("/api/auth", authRoutes);

// HOME
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to BananaAPI-Quest API!"
    });
});

// GAME INFORMATION
app.get("/api/game", (req, res) => {
    res.json({
        success: true,
        game: {
            title: "BananaAPI-Quest",
            description:
                "Register, log in, solve visual maths puzzles, and track your game progress.",
            status: "In Development"
        }
    });
});

// GET A BANANA PUZZLE
app.get("/api/banana/puzzle", async (req, res) => {
    try {
        const puzzle = await bananaApi.getPuzzle();

        res.json({
            success: true,
            puzzle
        });
    } catch (error) {
        console.error("Banana puzzle error:", error);

        res.status(502).json({
            success: false,
            message: "Unable to load a Banana puzzle."
        });
    }
});

// CHECK A BANANA PUZZLE ANSWER
app.post("/api/banana/answer", (req, res) => {
    try {
        const { answer, puzzleId } = req.body;

        if (String(answer ?? "").trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Please enter an answer."
            });
        }

        const correct = bananaApi.checkAnswer(answer, puzzleId);

        res.json({
            success: true,
            correct,
            message: correct
                ? "Correct! You solved the puzzle."
                : "Not quite. Try again."
        });
    } catch (error) {
        console.error("Banana answer error:", error);

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// VALIDATE PLAYER NAME
function validPlayerName(value) {
    return (
        typeof value === "string" &&
        value.trim().length > 0
    );
}

// CREATE GAME PROGRESS
app.post("/api/progress", async (req, res) => {
    try {
        const { playerName } = req.body;

        if (!validPlayerName(playerName)) {
            return res.status(400).json({
                success: false,
                message: "Player name is required."
            });
        }

        let progress = await GameProgress.findOne({
            playerName: playerName.trim()
        });

        if (progress) {
            return res.json({
                success: true,
                message: "Progress already exists.",
                progress
            });
        }

        progress = new GameProgress({
            ...req.body,
            playerName: playerName.trim()
        });

        await progress.save();

        res.status(201).json({
            success: true,
            message: "Game progress created successfully!",
            progress
        });
    } catch (error) {
        console.error("Progress creation error:", error);

        res.status(500).json({
            success: false,
            message: "Could not create game progress."
        });
    }
});

// GET GAME PROGRESS
app.get("/api/progress/:playerName", async (req, res) => {
    try {
        const progress = await GameProgress.findOne({
            playerName: req.params.playerName
        });

        if (!progress) {
            return res.status(404).json({
                success: false,
                message: "Game progress not found."
            });
        }

        res.json({
            success: true,
            progress
        });
    } catch (error) {
        console.error("Progress loading error:", error);

        res.status(500).json({
            success: false,
            message: "Could not load game progress."
        });
    }
});

// UPDATE GAME PROGRESS
app.put("/api/progress/:playerName", async (req, res) => {
    try {
        const progress = await GameProgress.findOneAndUpdate(
            { playerName: req.params.playerName },
            { $set: req.body },
            {
                new: true,
                runValidators: true
            }
        );

        if (!progress) {
            return res.status(404).json({
                success: false,
                message: "Game progress not found."
            });
        }

        res.json({
            success: true,
            message: "Game progress updated successfully!",
            progress
        });
    } catch (error) {
        console.error("Progress update error:", error);

        res.status(500).json({
            success: false,
            message: "Could not update game progress."
        });
    }
});

// START SERVER
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
