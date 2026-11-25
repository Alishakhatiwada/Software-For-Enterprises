
// Partly generated with AI assistance, reviewed and modified by me.

const config = require("../config/config");

const BANANA_API_URL = config.bananaApiUrl;
const API_TIMEOUT = config.apiTimeout || 10000;
const PUZZLE_EXPIRY = 30 * 60 * 1000; // 30 minutes

const solutions = new Map();

/**
 * Generate three progressive mathematical hints
 * based on the correct puzzle solution.
 */
function generateSmartHints(solutionValue) {
    const num = Number(solutionValue);
    const isEven = num % 2 === 0;

    // HINT 1: Parity and range
    const parity = isEven ? "EVEN" : "ODD";

    const rangeText = num <= 4
        ? "in the lower range (between 0 and 4)"
        : "in the upper range (between 5 and 9)";

    const hint1 = `Parity & Range Clue: The answer is an ${parity} number located ${rangeText}.`;

    // HINT 2: Mathematical property
    let propertyClue = "";

    if (num === 0) {
        propertyClue = "Zero Property: It represents nothing/zero (adding it leaves numbers unchanged).";
    } else if (num === 1) {
        propertyClue = "Identity Property: Multiplying any number by this value gives the same number.";
    } else if ([2, 3, 5, 7].includes(num)) {
        propertyClue = "Prime Property: The answer is a prime number (divisible only by 1 and itself).";
    } else if (num % 4 === 0) {
        propertyClue = "Multiple Property: The answer is a multiple of 4.";
    } else if (num % 3 === 0) {
        propertyClue = "Multiple Property: The answer is a multiple of 3.";
    } else {
        propertyClue = `Bounds Clue: The answer is strictly between ${Math.max(0, num - 2)} and ${Math.min(9, num + 2)}.`;
    }

    const allDigits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const candidateSet = new Set([num]);

    const potentialDistractors = allDigits
        .filter(d => d !== num)
        .sort((a, b) => {
            const aSame = (a % 2 === num % 2) ? 0 : 1;
            const bSame = (b % 2 === num % 2) ? 0 : 1;

            if (aSame !== bSame) return aSame - bSame;

            return Math.abs(a - num) - Math.abs(b - num);
        });

    for (const d of potentialDistractors) {
        if (candidateSet.size >= 3) break;
        candidateSet.add(d);
    }

    const candidateList = Array.from(candidateSet).sort((a, b) => a - b);

    const hint2 = `${propertyClue} The answer is definitely one of these three numbers: [${candidateList.join(", ")}].`;

    // HINT 3: Final 50/50 elimination
    const chosenDistractor =
        candidateList.find(c => c !== num) ?? ((num + 1) % 10);

    const finalPair = [num, chosenDistractor].sort((a, b) => a - b);

    const hint3 = `50/50 Elimination: The answer is narrowed down to either ${finalPair[0]} or ${finalPair[1]}!`;

    return [hint1, hint2, hint3];
}

// Remove expired puzzles.
function cleanExpiredPuzzles() {
    const now = Date.now();

    for (const [id, puzzle] of solutions.entries()) {
        if (now - puzzle.timestamp > PUZZLE_EXPIRY) {
            solutions.delete(id);
        }
    }
}

const sleep = (ms) =>
    new Promise(resolve => setTimeout(resolve, ms));

/**
 * Execute one request to the external Banana API.
 * Includes timeout and response validation.
 */
async function requestBananaOnce() {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort();
    }, API_TIMEOUT);

    let response;

    try {
        response = await fetch(BANANA_API_URL, {
            signal: controller.signal
        });
    } catch (error) {
        if (error.name === "AbortError") {
            const timeoutError = new Error(
                "Banana API request timed out. Please try again."
            );

            timeoutError.isTimeout = true;
            throw timeoutError;
        }

        const networkError = new Error(
            "Unable to connect to the Banana API. Please check your internet connection."
        );

        networkError.isNetwork = true;
        throw networkError;
    } finally {
        clearTimeout(timeout);
    }

    if (!response.ok) {
        const httpError = new Error(
            `Banana API request failed with status ${response.status}.`
        );

        httpError.status = response.status;
        throw httpError;
    }

    let data;

    try {
        data = await response.json();
    } catch (error) {
        throw new Error(
            "Banana API returned an invalid response."
        );
    }

    if (
        !data ||
        typeof data.question !== "string" ||
        !data.question.trim() ||
        data.solution === undefined ||
        data.solution === null ||
        !Number.isFinite(Number(data.solution))
    ) {
        throw new Error(
            "The Banana API returned invalid puzzle data."
        );
    }

    return data;
}

/**
 * Retry failed API requests using exponential backoff.
 * Client-side 4xx errors are not retried.
 */
async function requestBananaWithRetry(
    maxAttempts = config.maxRetryAttempts || 3
) {
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await requestBananaOnce();
        } catch (error) {
            lastError = error;

            // Do not retry client errors.
            if (error.status >= 400 && error.status < 500) {
                throw error;
            }

            // Retry network errors, timeouts and server errors.
            if (attempt < maxAttempts) {
                await sleep(300 * attempt);
            }
        }
    }

    throw lastError;
}

/**
 * Fetch a new puzzle and store its solution and hints.
 */
async function getPuzzle() {
    const data = await requestBananaWithRetry();

    cleanExpiredPuzzles();

    const puzzleId =
        `p_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const hints = generateSmartHints(data.solution);

    solutions.set(puzzleId, {
        solution: String(data.solution).trim(),
        timestamp: Date.now(),
        hintIndex: 0,
        hints
    });

    return {
        puzzleId,
        question: data.question
    };
}

/**
 * Check the player's submitted answer.
 */
function checkAnswer(answer, puzzleId) {
    if (!puzzleId || !solutions.has(puzzleId)) {
        throw new Error(
            "This puzzle has expired or is invalid. Please load a new puzzle."
        );
    }

    const puzzle = solutions.get(puzzleId);
    const playerAnswer = String(answer ?? "").trim();

    if (!playerAnswer) {
        throw new Error("Please enter an answer.");
    }

    const correct = playerAnswer === puzzle.solution;

    // Remove the puzzle after submission.
    solutions.delete(puzzleId);

    return {
        correct,
        correctAnswer: Number(puzzle.solution)
    };
}

/**
 * Return progressive hints one at a time.
 */
function getHint(puzzleId) {
    if (!puzzleId || !solutions.has(puzzleId)) {
        throw new Error(
            "This puzzle has expired or is invalid. Please load a new puzzle."
        );
    }

    const puzzle = solutions.get(puzzleId);

    if (puzzle.hintIndex >= puzzle.hints.length) {
        throw new Error(
            "You have already used all 3 available hints for this puzzle."
        );
    }

    const hint = puzzle.hints[puzzle.hintIndex];
    puzzle.hintIndex += 1;

    return {
        message: hint,
        hintNumber: puzzle.hintIndex,
        totalHints: puzzle.hints.length
    };
}

module.exports = {
    getPuzzle,
    checkAnswer,
    getHint,
    generateSmartHints,
    requestBananaOnce,
    requestBananaWithRetry
};
