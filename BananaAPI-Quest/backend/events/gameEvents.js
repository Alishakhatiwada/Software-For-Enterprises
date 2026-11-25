// Partly generated with AI assistance, reviewed and modified by me.

// =============================================================================
// BANANAAPI-QUEST: GAME EVENT BUS
//
// THEME 2: EVENT-DRIVEN PROGRAMMING
// Provides a centralized, decoupled publish/subscribe event emitter using
// Node.js's built-in EventEmitter class.
// =============================================================================

const EventEmitter = require("events");

class GameEventEmitter extends EventEmitter {}

const gameEvents = new GameEventEmitter();

// Frozen events dictionary to avoid typos and ensure deterministic event names
const EVENTS = Object.freeze({
    userRegistered: "userRegistered",
    userLoggedIn: "userLoggedIn",
    loginFailed: "loginFailed",
    puzzleServed: "puzzleServed",
    answerSubmitted: "answerSubmitted",
    puzzleSolved: "puzzleSolved",
    hintPurchased: "hintPurchased"
});

module.exports = {
    gameEvents,
    EVENTS
};
