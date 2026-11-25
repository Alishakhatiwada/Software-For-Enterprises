// Partly generated with AI assistance, reviewed and modified by me.

const express = require("express");
const router = express.Router();

const {
    getPuzzle,
    submitAnswer,
    useHint,
    getPuzzleHistory,
    getLeaderboard,
    getGameEvents
} = require("../controllers/bananaController");

const authMiddleware = require("../middleware/authMiddleware");

// All game routes require authentication
router.use(authMiddleware);

router.get("/puzzle", getPuzzle);
router.post("/answer", submitAnswer);
router.post("/hint", useHint);
router.get("/history", getPuzzleHistory);
router.get("/leaderboard", getLeaderboard);

// Protected route to inspect event telemetry (THEME 2)
router.get("/events", getGameEvents);

module.exports = router;