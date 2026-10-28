const BANANA_API_URL =
    "https://marcconrad.com/uob/banana/api.php?out=json&base64=no";

// Store solutions using their puzzle IDs
const solutions = new Map();

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

    // Generate a unique ID for this puzzle
    const puzzleId =
        `p_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    solutions.set(puzzleId, {
        solution: String(data.solution).trim(),
        timestamp: Date.now()
    });

    // Remove solutions older than 30 minutes
    const now = Date.now();

    for (const [id, puzzle] of solutions.entries()) {
        if (now - puzzle.timestamp > 30 * 60 * 1000) {
            solutions.delete(id);
        }
    }

    // Send the question image and ID to the frontend
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
        return false;
    }

    const correct = playerAnswer === puzzle.solution;

    // Remove the puzzle after a correct answer
    if (correct) {
        solutions.delete(puzzleId);
    }

    return correct;
}

module.exports = {
    getPuzzle,
    checkAnswer
};
