const express = require("express");
const router = express.Router();

const {
    getPuzzle,
    submitAnswer,
    useHint,
    getPuzzleHistory,
    getLeaderboard
} = require("../controllers/bananaController");

const authMiddleware = require("../middleware/authMiddleware");

// All game routes require authentication
router.use(authMiddleware);

router.get("/puzzle", getPuzzle);
router.post("/answer", submitAnswer);
router.post("/hint", useHint);
router.get("/history", getPuzzleHistory);
router.get("/leaderboard", getLeaderboard);

module.exports = router;