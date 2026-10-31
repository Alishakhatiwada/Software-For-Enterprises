const mongoose = require("mongoose");

const gameProgressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        totalAttempts: {
            type: Number,
            default: 0
        },

        solvedPuzzles: {
            type: Number,
            default: 0
        },

        totalPoints: {
            type: Number,
            default: 0
        },

        // IDs of puzzles already solved
        solvedPuzzleIds: {
            type: [String],
            default: []
        },

        // IDs of puzzles where a hint was purchased
        hintedPuzzleIds: {
            type: [String],
            default: []
        },

        lastPlayed: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("GameProgress", gameProgressSchema);