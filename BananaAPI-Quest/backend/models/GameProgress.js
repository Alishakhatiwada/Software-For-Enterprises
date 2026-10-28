const mongoose = require("mongoose");

const archiveDiscoverySchema = new mongoose.Schema({
    bookKey: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    bookTitle: {
        type: String,
        default: ""
    },
    bookAuthor: {
        type: String,
        default: ""
    },
    coverUrl: {
        type: String,
        default: ""
    },
    missionId: {
        type: String,
        default: "catalogue-cipher"
    },
    missionTitle: {
        type: String,
        default: "Mission 1: The First Clue"
    },
    secretId: {
        type: String,
        required: true
    },
    discoveredAt: {
        type: Date,
        default: Date.now
    }
});

const gameProgressSchema = new mongoose.Schema({
    playerName: {
        type: String,
        required: true,
        unique: true
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
    archiveDiscoveries: {
        type: [archiveDiscoverySchema],
        default: []
    },
    unlockedSecrets: {
        type: [String],
        default: []
    },
    lastPlayed: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("GameProgress", gameProgressSchema);
