const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables before connecting to MongoDB.
dotenv.config();

// Import database connection.
const connectDB = require("./config/database");

// Import models.
const GameProgress = require("./models/GameProgress");

// Import Banana API service.
const bananaApi = require("./services/bananaApi");

// Import authentication routes.
const authRoutes = require("./routes/authRoutes");

// Create Express application.
const app = express();

// Set server port.
const PORT = process.env.PORT || 5000;

// ==========================================
// 1. MIDDLEWARE
// ==========================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Authentication routes.
app.use("/api/auth", authRoutes);

// ==========================================
// 2. CONNECT TO MONGODB
// ==========================================

connectDB();

// ==========================================
// 3. HOME ROUTE
// ==========================================

app.get("/", function (req, res) {
    res.status(200).json({
        success: true,
        message: "Welcome to The Lost Library API!"
    });
});

// ==========================================
// 4. GAME INFORMATION
// ==========================================

app.get("/api/game", function (req, res) {
    res.status(200).json({
        success: true,

        game: {
            title: "The Lost Library",

            description:
                "Explore a mysterious library, solve puzzles, and uncover hidden secrets.",

            status: "In Development"
        }
    });
});

// ==========================================
// 5. LOAD BANANA API PUZZLE
// ==========================================

app.get("/api/banana/puzzle", async function (req, res) {
    try {
        const puzzle = await bananaApi.getPuzzle();

        return res.status(200).json({
            success: true,

            message: "Banana puzzle loaded successfully!",

            puzzle: {
                question: puzzle.question
            }
        });
    } catch (error) {
        console.error(
            "Banana puzzle error:",
            error.message
        );

        return res.status(502).json({
            success: false,

            message:
                "Unable to retrieve a puzzle from the Banana API."
        });
    }
});

// ==========================================
// 6. CHECK BANANA API ANSWER
// ==========================================

app.post("/api/banana/answer", function (req, res) {
    try {
        const answer = req.body.answer;

        if (
            answer === undefined ||
            answer === null ||
            String(answer).trim() === ""
        ) {
            return res.status(400).json({
                success: false,
                correct: false,
                message: "Please provide an answer."
            });
        }

        const correct = bananaApi.checkAnswer(answer);

        if (correct) {
            return res.status(200).json({
                success: true,
                correct: true,

                message:
                    "Correct answer! You solved the Banana puzzle."
            });
        }

        return res.status(200).json({
            success: true,
            correct: false,

            message:
                "That answer is incorrect. Try again!"
        });
    } catch (error) {
        console.error(
            "Banana answer error:",
            error.message
        );

        return res.status(400).json({
            success: false,
            correct: false,

            message:
                error.message ||
                "Unable to check the answer."
        });
    }
});

// ==========================================
// 7. SAVE OR CREATE PLAYER PROGRESS
// ==========================================

app.post("/api/progress", async function (req, res) {
    try {
        const {
            playerName,
            currentLevel,
            solvedPuzzles,
            completedLevels
        } = req.body;

        // Validate player name.
        if (
            typeof playerName !== "string" ||
            !playerName.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid player name is required."
            });
        }

        // Validate chapter number.
        if (
            currentLevel !== undefined &&
            (
                !Number.isInteger(currentLevel) ||
                currentLevel < 1
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Current chapter must be a positive integer."
            });
        }

        // Validate solved puzzle count.
        if (
            solvedPuzzles !== undefined &&
            (
                !Number.isInteger(solvedPuzzles) ||
                solvedPuzzles < 0
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Solved puzzle count must be a non-negative integer."
            });
        }

        // Validate completed chapters.
        if (
            completedLevels !== undefined &&
            (
                !Array.isArray(completedLevels) ||
                !completedLevels.every(
                    level =>
                        Number.isInteger(level) &&
                        level >= 1
                ) ||
                new Set(completedLevels).size !==
                    completedLevels.length
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Completed chapters must be an array of unique positive integers."
            });
        }

        const name = playerName.trim();

        // Update an existing record or create one.
        // This preserves the existing playerName-based API.
        const progress = await GameProgress.findOneAndUpdate(
            { playerName: name },

            {
                $set: {
                    currentLevel: currentLevel ?? 1,

                    solvedPuzzles: solvedPuzzles ?? 0,

                    completedLevels: completedLevels ?? [],

                    lastPlayed: new Date()
                },

                $setOnInsert: {
                    playerName: name
                }
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

            message: "Game progress saved successfully!",

            progress: progress
        });
    } catch (error) {
        console.error(
            "Save progress error:",
            error.message
        );

        return res.status(500).json({
            success: false,

            message: "Unable to save game progress."
        });
    }
});

// ==========================================
// 8. GET PLAYER PROGRESS
// ==========================================

app.get(
    "/api/progress/:playerName",
    async function (req, res) {
        try {
            const playerName =
                req.params.playerName.trim();

            if (!playerName) {
                return res.status(400).json({
                    success: false,
                    message: "Player name is required."
                });
            }

            // Find the most recently updated record.
            const progress = await GameProgress.findOne({
                playerName: playerName
            }).sort({
                lastPlayed: -1
            });

            if (!progress) {
                return res.status(404).json({
                    success: false,

                    message:
                        "No saved progress found for this player."
                });
            }

            return res.status(200).json({
                success: true,
                progress: progress
            });
        } catch (error) {
            console.error(
                "Get progress error:",
                error.message
            );

            return res.status(500).json({
                success: false,

                message:
                    "Unable to retrieve game progress."
            });
        }
    }
);

// ==========================================
// 9. UPDATE PLAYER PROGRESS
// ==========================================

app.put(
    "/api/progress/:playerName",
    async function (req, res) {
        try {
            const playerName =
                req.params.playerName.trim();

            const {
                currentLevel,
                solvedPuzzles,
                completedLevels
            } = req.body;

            // Validate chapter number.
            if (
                currentLevel !== undefined &&
                (
                    !Number.isInteger(currentLevel) ||
                    currentLevel < 1
                )
            ) {
                return res.status(400).json({
                    success: false,

                    message:
                        "Current chapter must be a positive integer."
                });
            }

            // Validate solved puzzle count.
            if (
                solvedPuzzles !== undefined &&
                (
                    !Number.isInteger(solvedPuzzles) ||
                    solvedPuzzles < 0
                )
            ) {
                return res.status(400).json({
                    success: false,

                    message:
                        "Solved puzzle count must be a non-negative integer."
                });
            }

            // Validate completed chapters.
            if (
                completedLevels !== undefined &&
                (
                    !Array.isArray(completedLevels) ||
                    !completedLevels.every(
                        level =>
                            Number.isInteger(level) &&
                            level >= 1
                    ) ||
                    new Set(completedLevels).size !==
                        completedLevels.length
                )
            ) {
                return res.status(400).json({
                    success: false,

                    message:
                        "Completed chapters must be an array of unique positive integers."
                });
            }

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

            const progress =
                await GameProgress.findOneAndUpdate(
                    {
                        playerName: playerName
                    },

                    {
                        $set: updates
                    },

                    {
                        new: true,
                        runValidators: true
                    }
                );

            if (!progress) {
                return res.status(404).json({
                    success: false,

                    message:
                        "No saved progress found for this player. Save progress first."
                });
            }

            return res.status(200).json({
                success: true,

                message:
                    "Game progress updated successfully!",

                progress: progress
            });
        } catch (error) {
            console.error(
                "Update progress error:",
                error.message
            );

            return res.status(500).json({
                success: false,

                message:
                    "Unable to update game progress."
            });
        }
    }
);

// ==========================================
// 10. START SERVER
// ==========================================

app.listen(PORT, function () {
    console.log("------------------------------------");

    console.log(
        "The Lost Library backend is running!"
    );

    console.log(
        `Server URL: http://localhost:${PORT}`
    );

    console.log(
        `Banana API: http://localhost:${PORT}/api/banana/puzzle`
    );

    console.log(
        `Progress API: http://localhost:${PORT}/api/progress`
    );

    console.log("------------------------------------");
});