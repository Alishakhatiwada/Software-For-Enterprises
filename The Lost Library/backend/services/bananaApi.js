
const BANANA_API_URL =
    "https://marcconrad.com/uob/banana/api.php?out=json&base64=no";

// Store the current puzzle solution on the server
let currentSolution = null;

// Fetch a new puzzle from the Banana API
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

    // Keep the answer on the backend
    currentSolution = String(data.solution).trim();

    // Return only the image URL to the frontend
    return {
        question: data.question
    };
}

// Check the player's submitted answer
function checkAnswer(answer) {
    if (currentSolution === null) {
        throw new Error("Please load a puzzle first.");
    }

    const playerAnswer = String(answer).trim();

    if (!playerAnswer) {
        return false;
    }

    const isCorrect = playerAnswer === currentSolution;

    if (isCorrect) {
        // Clear the answer after a correct solution
        currentSolution = null;
    }

    return isCorrect;
}

module.exports = {
    getPuzzle,
    checkAnswer
};
