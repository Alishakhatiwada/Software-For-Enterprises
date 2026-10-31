
const bananaApi = require("../services/bananaApi");
const GameProgress = require("../models/GameProgress");
const PuzzleHistory = require("../models/PuzzleHistory");

const HINT_COST = 20;
const PUZZLE_POINTS = 10;


// ==========================================
// GET A NEW PUZZLE
// ==========================================

const getPuzzle = async (req, res) => {
    try {
        const puzzle = await bananaApi.getPuzzle();

        return res.status(200).json({
            success: true,
            puzzle
        });

    } catch (error) {
        console.error("Get puzzle error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load a puzzle. Please try again."
        });
    }
};


// ==========================================
// SUBMIT AN ANSWER
// ==========================================

const submitAnswer = async (req, res) => {
    try {
        const { answer, puzzleId } = req.body;
        const userId = req.user.userId;

        if (
            answer === undefined ||
            answer === null ||
            String(answer).trim() === "" ||
            !puzzleId
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide an answer and puzzle ID."
            });
        }

        const submittedAnswer = Number(answer);

        if (!Number.isFinite(submittedAnswer)) {
            return res.status(400).json({
                success: false,
                message: "Your answer must be a valid number."
            });
        }

        // Check the answer.
        const result = bananaApi.checkAnswer(
            submittedAnswer,
            puzzleId
        );

        const isCorrect = result.correct;
        const pointsEarned = isCorrect ? PUZZLE_POINTS : 0;

        // Save the submitted answer.
        await PuzzleHistory.create({
            userId,
            puzzleId,
            submittedAnswer,
            isCorrect,
            pointsEarned
        });

        // Find or create the player's progress document.
        let progress = await GameProgress.findOne({ userId });

        if (!progress) {
            progress = await GameProgress.create({ userId });
        }

        // Count every submitted answer.
        progress.totalAttempts += 1;

        // Award points only if this puzzle has not
        // already been counted as solved.
        if (
            isCorrect &&
            !progress.solvedPuzzleIds.includes(puzzleId)
        ) {
            progress.solvedPuzzles += 1;
            progress.totalPoints += PUZZLE_POINTS;
            progress.solvedPuzzleIds.push(puzzleId);
        }

        progress.lastPlayed = new Date();

        await progress.save();

        return res.status(200).json({
            success: true,
            correct: isCorrect,
            correctAnswer: result.correctAnswer,
            pointsEarned,
            progress
        });

    } catch (error) {
        console.error("Submit answer error:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Unable to check your answer."
        });
    }
};


// ==========================================
// PURCHASE A HINT
// ==========================================

const useHint = async (req, res) => {
    try {
        const { puzzleId } = req.body;
        const userId = req.user.userId;

        if (!puzzleId) {
            return res.status(400).json({
                success: false,
                message: "Puzzle ID is required."
            });
        }

        // Check whether the puzzle is still active.
        const hint = bananaApi.getHint(puzzleId);

        // Deduct points only when the player has
        // enough points and has not used a hint.
        const progress = await GameProgress.findOneAndUpdate(
            {
                userId,
                totalPoints: { $gte: HINT_COST },
                hintedPuzzleIds: { $ne: puzzleId }
            },
            {
                $inc: {
                    totalPoints: -HINT_COST
                },
                $addToSet: {
                    hintedPuzzleIds: puzzleId
                },
                $set: {
                    lastPlayed: new Date()
                }
            },
            {
                returnDocument: "after"
            }
        );

        if (!progress) {
            const existingProgress =
                await GameProgress.findOne({ userId });

            if (
                existingProgress?.hintedPuzzleIds?.includes(puzzleId)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "You have already used a hint for this puzzle."
                });
            }

            return res.status(400).json({
                success: false,
                message: "You need at least 20 points to purchase a hint."
            });
        }

        return res.status(200).json({
            success: true,
            hint,
            pointsSpent: HINT_COST,
            remainingPoints: progress.totalPoints,
            progress
        });

    } catch (error) {
        console.error("Use hint error:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Unable to provide a hint."
        });
    }
};


// ==========================================
// GET PUZZLE HISTORY
// ==========================================

const getPuzzleHistory = async (req, res) => {
    try {
        const userId = req.user.userId;

        const history = await PuzzleHistory.find({ userId })
            .sort({ attemptedAt: -1 });

        const progress = await GameProgress.findOne({ userId });

        return res.status(200).json({
            success: true,

            stats: {
                totalAttempts: progress?.totalAttempts || 0,
                solvedPuzzles: progress?.solvedPuzzles || 0,
                totalPoints: progress?.totalPoints || 0
            },

            history
        });

    } catch (error) {
        console.error("Get puzzle history error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load puzzle history."
        });
    }
};


// ==========================================
// GET LEADERBOARD
// ==========================================

const getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await GameProgress.find()
            .sort({
                totalPoints: -1,
                solvedPuzzles: -1,
                lastPlayed: 1
            })
            .limit(100)
            .populate("userId", "name");

        const rankings = leaderboard
            .filter(item => item.userId)
            .map((item, index) => ({
                rank: index + 1,
                userId: item.userId._id.toString(),
                name: item.userId.name,
                solvedPuzzles: item.solvedPuzzles,
                totalAttempts: item.totalAttempts,
                totalPoints: item.totalPoints
            }));

        return res.status(200).json({
            success: true,
            leaderboard: rankings
        });

    } catch (error) {
        console.error("Get leaderboard error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load the leaderboard."
        });
    }
};


// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
    getPuzzle,
    submitAnswer,
    useHint,
    getPuzzleHistory,
    getLeaderboard
};
