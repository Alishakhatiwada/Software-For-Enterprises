const mongoose = require("mongoose");

const gameProgressSchema = new mongoose.Schema(
    {
        playerName: {
            type: String,
            required: true,
            trim: true
        },

        currentLevel: {
            type: Number,
            required: true,
            default: 1,
            min: 1
        },

        solvedPuzzles: {
            type: Number,
            required: true,
            default: 0,
            min: 0
        },

        completedLevels: {
            type: [Number],
            default: [],
            validate: {
                validator: function (levels) {
                    return (
                        levels.every(
                            level =>
                                Number.isInteger(level) &&
                                level >= 1
                        ) &&
                        new Set(levels).size === levels.length
                    );
                },
                message:
                    "Completed chapters must contain unique positive integers."
            }
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

// Create an index to make player progress lookups faster.
// Multiple accounts may have the same display name, so
// playerName is deliberately not marked as unique.
gameProgressSchema.index({ playerName: 1, lastPlayed: -1 });

module.exports = mongoose.model(
    "GameProgress",
    gameProgressSchema
);