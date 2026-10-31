
const mongoose = require("mongoose");

const puzzleHistorySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        puzzleId: {
            type: String,
            required: true
        },

        submittedAnswer: {
            type: Number,
            required: true
        },

        isCorrect: {
            type: Boolean,
            required: true
        },

        pointsEarned: {
            type: Number,
            default: 0
        },

        attemptedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("PuzzleHistory", puzzleHistorySchema);
