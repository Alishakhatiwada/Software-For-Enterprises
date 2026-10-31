
const BANANA_API_URL =
    "https://marcconrad.com/uob/banana/api.php?out=json&base64=no";

const solutions = new Map();

const HINTS = [
    "Look closely at the bananas. Some may be grouped differently.",
    "Count the objects carefully before calculating.",
    "Check whether the same image represents the same number.",
    "Pay attention to the mathematical symbols in the puzzle.",
    "Solve the puzzle one step at a time, following the correct order of operations.",
    "Start by counting the bananas in each group.",
    "Compare the first and second rows carefully.",
    "Find the value of one banana before solving the final row.",
    "Watch for changes in the number of bananas.",
    "A missing banana can change the entire calculation.",
    "Check whether the final row contains a different combination.",
    "Remember that multiplication comes before addition.",
    "Break the puzzle into smaller calculations.",
    "Look carefully at the number of objects in the last row.",
    "Recheck your calculation before submitting your answer."
];

async function getPuzzle() {
    const response = await fetch(BANANA_API_URL);

    if (!response.ok) {
        throw new Error("Failed to fetch a Banana puzzle.");
    }

    const data = await response.json();

    if (
        !data.question ||
        data.solution === undefined ||
        data.solution === null
    ) {
        throw new Error("The Banana API returned invalid puzzle data.");
    }

    const puzzleId =
        `p_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    solutions.set(puzzleId, {
        solution: String(data.solution).trim(),
        timestamp: Date.now(),
        hintIndex: 0
    });

    // Remove expired puzzles.
    const now = Date.now();

    for (const [id, puzzle] of solutions.entries()) {
        if (now - puzzle.timestamp > 30 * 60 * 1000) {
            solutions.delete(id);
        }
    }

    return {
        puzzleId,
        question: data.question
    };
}

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

    // Remove the puzzle after an answer is submitted.
    solutions.delete(puzzleId);

    return {
        correct,
        correctAnswer: Number(puzzle.solution)
    };
}

function getHint(puzzleId) {
    if (!puzzleId || !solutions.has(puzzleId)) {
        throw new Error(
            "This puzzle has expired or is invalid. Please load a new puzzle."
        );
    }

    const puzzle = solutions.get(puzzleId);

    // Get the next hint.
    if (puzzle.hintIndex >= HINTS.length) {
        throw new Error("You have used all available hints.");
    }

    const hint = HINTS[puzzle.hintIndex];

    puzzle.hintIndex += 1;

    return {
        message: hint,
        hintNumber: puzzle.hintIndex,
        totalHints: HINTS.length
    };
}

module.exports = {
    getPuzzle,
    checkAnswer,
    getHint
};
