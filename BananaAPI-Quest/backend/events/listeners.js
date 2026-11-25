// Partly generated with AI assistance, reviewed and modified by me.

// =============================================================================
// BANANAAPI-QUEST: SERVER-SIDE EVENT LISTENERS & TELEMETRY
//
// THEME 2: EVENT-DRIVEN PROGRAMMING
// Listens to domain lifecycle events emitted across controllers, updates
// in-memory analytics counters, maintains an audit trail, and exposes stats.
// =============================================================================

const { gameEvents, EVENTS } = require("./gameEvents");

// In-memory telemetry storage
const MAX_RECENT_ACTIVITIES = 50;

const counters = {
    userRegistered: 0,
    userLoggedIn: 0,
    loginFailed: 0,
    puzzleServed: 0,
    answerSubmitted: 0,
    puzzleSolved: 0,
    hintPurchased: 0
};

const recentActivities = [];
let isRegistered = false;

function recordActivity(type, payload = {}) {
    if (Object.prototype.hasOwnProperty.call(counters, type)) {
        counters[type] += 1;
    }

    const activityEntry = {
        id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        type,
        timestamp: new Date().toISOString(),
        details: payload
    };

    recentActivities.unshift(activityEntry);

    // Keep memory footprint bounded to the latest 50 activities
    if (recentActivities.length > MAX_RECENT_ACTIVITIES) {
        recentActivities.pop();
    }

    console.log(`[EVENT] ${type}:`, JSON.stringify(payload));
}

/**
 * Registers domain listeners idempotently.
 */
function registerListeners() {
    if (isRegistered) {
        return;
    }

    gameEvents.on(EVENTS.userRegistered, (payload) => {
        recordActivity(EVENTS.userRegistered, payload);
    });

    gameEvents.on(EVENTS.userLoggedIn, (payload) => {
        recordActivity(EVENTS.userLoggedIn, payload);
    });

    gameEvents.on(EVENTS.loginFailed, (payload) => {
        recordActivity(EVENTS.loginFailed, payload);
    });

    gameEvents.on(EVENTS.puzzleServed, (payload) => {
        recordActivity(EVENTS.puzzleServed, payload);
    });

    gameEvents.on(EVENTS.answerSubmitted, (payload) => {
        recordActivity(EVENTS.answerSubmitted, payload);
    });

    gameEvents.on(EVENTS.puzzleSolved, (payload) => {
        recordActivity(EVENTS.puzzleSolved, payload);
    });

    gameEvents.on(EVENTS.hintPurchased, (payload) => {
        recordActivity(EVENTS.hintPurchased, payload);
    });

    isRegistered = true;
}

/**
 * Retrieves a snapshot of in-memory telemetry statistics.
 */
function getEventStats() {
    const totalEvents = Object.values(counters).reduce((sum, count) => sum + count, 0);

    return {
        success: true,
        totalEvents,
        counters: { ...counters },
        recentActivities: [...recentActivities]
    };
}

// Helper to reset counters and activities for unit tests
function resetEventStats() {
    for (const key of Object.keys(counters)) {
        counters[key] = 0;
    }
    recentActivities.length = 0;
}

module.exports = {
    registerListeners,
    getEventStats,
    resetEventStats
};
