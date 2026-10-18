
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const GameProgress = require("./models/GameProgress");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Route 1: Test the server
app.get("/", (req, res) => {
    res.send("Welcome to The Lost Library API!");
});

// Route 2: Get game information
app.get("/api/game", (req, res) => {
    res.json({
        success: true,
        game: {
            title: "The Lost Library",
            description:
                "Explore a mysterious library, solve puzzles, and uncover hidden secrets.",
            status: "In Development"
        }
    });
});

// Route 3: Create a new player progress record
app.post("/api/progress", async (req, res) => {
    try {
        const {
            playerName,
            currentLevel,
            solvedPuzzles,
            completedLevels
        } = req.body;

        if (
            typeof playerName !== "string" ||
            !playerName.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid player name is required."
            });
        }

        const progress = await GameProgress.create({
            playerName: playerName.trim(),
            currentLevel,
            solvedPuzzles,
            completedLevels
        });

        return res.status(201).json({
            success: true,
            message: "Game progress saved successfully!",
            progress
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to save game progress.",
            error: error.message
        });
    }
});

// Route 4: Retrieve player progress
app.get("/api/progress/:playerName", async (req, res) => {
    try {
        const playerName = req.params.playerName.trim();

        const progress = await GameProgress.findOne({
            playerName: playerName
        });

        if (!progress) {
            return res.status(404).json({
                success: false,
                message: "Player progress not found."
            });
        }

        return res.status(200).json({
            success: true,
            progress
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve game progress.",
            error: error.message
        });
    }
});

// Route 5: Update existing progress or create it if missing
app.put("/api/progress/:playerName", async (req, res) => {
    try {
        const playerName = req.params.playerName.trim();

        if (!playerName) {
            return res.status(400).json({
                success: false,
                message: "Player name is required."
            });
        }

        const {
            currentLevel,
            solvedPuzzles,
            completedLevels
        } = req.body;

        const updates = {
            lastPlayed: new Date()
        };

        if (currentLevel !== undefined) {
            updates.currentLevel = currentLevel;
        }

        if (solvedPuzzles !== undefined) {
            updates.solvedPuzzles = solvedPuzzles;
        }

        if (completedLevels !== undefined) {
            updates.completedLevels = completedLevels;
        }

        const progress = await GameProgress.findOneAndUpdate(
            { playerName: playerName },
            {
                $set: updates,
                $setOnInsert: { playerName: playerName }
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }
        );

        return res.status(200).json({
            success: true,
            message: "Game progress updated successfully!",
            progress
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update game progress.",
            error: error.message
        });
    }
});

// Connect to MongoDB and start the server
const startServer = async () => {
    try {
        await connectDB();

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error(
            "Failed to start server:",
            error.message
        );

        process.exit(1);
    }
};

startServer();
