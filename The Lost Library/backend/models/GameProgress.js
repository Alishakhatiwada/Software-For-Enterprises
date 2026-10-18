
const mongoose = require("mongoose");

const gameProgressSchema = new mongoose.Schema({
    playerName: {
        type: String,
        required: true
    },

    currentLevel: {
        type: Number,
        default: 1
    },

    solvedPuzzles: {
        type: Number,
        default: 0
    },

    completedLevels: {
        type: [Number],
        default: []
    },

    lastPlayed: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("GameProgress", gameProgressSchema);
