
// ==========================================
// BANANAAPI-QUEST GAME
// ==========================================

const API_BASE_URL = "http://localhost:5000/api";

// ==========================================
// HTML ELEMENTS
// ==========================================

const puzzleImage = document.getElementById("puzzleImage");
const answerInput = document.getElementById("answerInput");
const submitButton = document.getElementById("submitAnswer");
const nextButton = document.getElementById("nextPuzzle");
const message = document.getElementById("gameMessage");

const solvedCount = document.getElementById("solvedCount");
const achievementText = document.getElementById("achievementText");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const progressTrack = document.getElementById("progressTrack");
const celebration = document.getElementById("celebration");
const pointsCount = document.getElementById("pointsCount");

// Hint elements
const hintButton = document.getElementById("hintButton");
const hintMessage = document.getElementById("hintMessage");

// Hint cost
const HINT_COST = 20;

// ==========================================
// GAME VARIABLES
// ==========================================

let currentPuzzleId = null;
let currentPuzzleSolved = false;
let hintUsed = false;
let answerSubmitting = false;
let hintRequestInProgress = false;


// ==========================================
// GET LOGIN TOKEN
// ==========================================

function getToken() {
    return localStorage.getItem("token");
}


// ==========================================
// AUTHENTICATED API REQUEST
// ==========================================

async function apiRequest(endpoint, options = {}) {

    const token = getToken();

    if (!token) {
        window.location.href = "login.html";
        throw new Error("Please log in first.");
    }

    let response;

    try {

        response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,

            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                ...(options.headers || {})
            }
        });

    } catch (error) {

        console.error("Network error:", error);

        throw new Error(
            "Cannot connect to the backend. Please make sure your server is running on port 5000."
        );
    }

    // Read response as text first.
    const responseText = await response.text();

    let data;

    // Safely convert the response into JSON.
    try {

        data = JSON.parse(responseText);

    } catch (error) {

        console.error("Invalid API response:", responseText);

        throw new Error(
            `The backend returned HTML or invalid JSON instead of JSON. HTTP Status: ${response.status}. Check your API URL and backend routes.`
        );
    }

    // Handle authentication errors.
    if (response.status === 401) {

        localStorage.removeItem("token");

        window.location.href = "login.html";

        throw new Error("Your session has expired. Please log in again.");
    }

    // Handle other API errors.
    if (!response.ok || data.success === false) {

        throw new Error(
            data.message || `Request failed with status ${response.status}.`
        );
    }

    return data;
}


// ==========================================
// UPDATE PROGRESS DISPLAY
// ==========================================

function updateProgress(progress = {}) {

    const solved = Number(progress.solvedPuzzles) || 0;
    const points = Number(progress.totalPoints) || 0;

    if (solvedCount) {
        solvedCount.textContent = solved;
    }

    if (pointsCount) {
        pointsCount.textContent = points;
    }

    const nextMilestone = (Math.floor(solved / 5) + 1) * 5;
    const remaining = nextMilestone - solved;

    if (achievementText) {

        achievementText.textContent =
            `${remaining} more puzzles to reach ${nextMilestone}!`;

    }

    const percentage = (solved % 5) * 20;

    if (progressText) {
        progressText.textContent = `${solved % 5}/5`;
    }

    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }

    if (progressTrack) {

        progressTrack.setAttribute(
            "aria-valuenow",
            String(percentage)
        );

    }
}


// ==========================================
// LOAD SAVED PROGRESS FROM MONGODB
// ==========================================

async function loadSavedProgress() {

    const data = await apiRequest("/banana/history");

    if (data.stats) {

        updateProgress(data.stats);

    } else if (data.progress) {

        updateProgress(data.progress);

    } else {

        console.warn("No progress information returned by the backend.");

    }
}


// ==========================================
// RESET HINT FOR A NEW PUZZLE
// ==========================================

function resetHint() {

    hintUsed = false;
    hintRequestInProgress = false;

    if (hintButton) {

        hintButton.disabled = false;

        hintButton.textContent =
            `💡 Get a Hint (${HINT_COST} Points)`;

    }

    if (hintMessage) {
        hintMessage.textContent = "";
    }
}


// ==========================================
// LOAD A NEW PUZZLE
// ==========================================

async function loadPuzzle() {

    try {

        currentPuzzleId = null;
        currentPuzzleSolved = false;
        answerSubmitting = false;

        resetHint();

        if (message) {
            message.textContent = "Loading your puzzle...";
        }

        if (answerInput) {

            answerInput.value = "";
            answerInput.disabled = true;

        }

        if (submitButton) {
            submitButton.disabled = true;
        }

        if (nextButton) {
            nextButton.disabled = true;
        }

        if (celebration) {
            celebration.textContent = "";
        }

        if (puzzleImage) {
            puzzleImage.style.display = "none";
        }

        const data = await apiRequest("/banana/puzzle");

        if (!data.puzzle || !data.puzzle.puzzleId || !data.puzzle.question) {

            throw new Error("The backend returned incomplete puzzle information.");

        }

        currentPuzzleId = data.puzzle.puzzleId;

        if (puzzleImage) {

            puzzleImage.src = data.puzzle.question;
            puzzleImage.style.display = "block";

        }

        if (answerInput) {

            answerInput.disabled = false;
            answerInput.focus();

        }

        if (submitButton) {
            submitButton.disabled = false;
        }

        if (message) {

            message.textContent =
                "Solve the puzzle and enter your answer!";

        }

    } catch (error) {

        console.error("Puzzle loading error:", error);

        if (message) {
            message.textContent = error.message;
        }

    }

}


// ==========================================
// PURCHASE A HINT
// ==========================================

async function getPuzzleHint() {

    if (
        !currentPuzzleId ||
        currentPuzzleSolved ||
        hintUsed ||
        hintRequestInProgress
    ) {

        return;

    }

    try {

        hintRequestInProgress = true;

        if (hintButton) {
            hintButton.disabled = true;
        }

        if (hintMessage) {
            hintMessage.textContent = "Getting your hint...";
        }

        const data = await apiRequest("/banana/hint", {

            method: "POST",

            body: JSON.stringify({
                puzzleId: currentPuzzleId
            })

        });

        // Hint successfully purchased.
        hintUsed = true;

        // Update points from the backend.
        if (data.progress) {
            updateProgress(data.progress);
        }

        if (hintMessage) {

            hintMessage.textContent =
                `💡 Hint: ${data.hint}`;

        }

        if (hintButton) {

            hintButton.textContent = "Hint Used";
            hintButton.disabled = true;

        }

    } catch (error) {

        console.error("Hint error:", error);

        if (hintMessage) {
            hintMessage.textContent = error.message;
        }

        if (hintButton) {
            hintButton.disabled = false;
        }

    } finally {

        hintRequestInProgress = false;

    }

}


// ==========================================
// SUBMIT AN ANSWER
// ==========================================

async function checkAnswer() {

    if (
        !currentPuzzleId ||
        currentPuzzleSolved ||
        answerSubmitting
    ) {

        return;

    }

    const answer = answerInput.value.trim();

    // Validate the answer.
    if (
        answer === "" ||
        !Number.isFinite(Number(answer))
    ) {

        if (message) {
            message.textContent = "Please enter a valid number.";
        }

        return;

    }

    try {

        answerSubmitting = true;

        if (submitButton) {
            submitButton.disabled = true;
        }

        if (answerInput) {
            answerInput.disabled = true;
        }

        if (hintButton) {
            hintButton.disabled = true;
        }

        if (message) {
            message.textContent = "Checking your answer...";
        }

        const data = await apiRequest("/banana/answer", {

            method: "POST",

            body: JSON.stringify({

                answer: Number(answer),
                puzzleId: currentPuzzleId

            })

        });

        currentPuzzleSolved = true;

        // Correct answer.
        if (data.correct) {

            if (message) {

                message.textContent =
                    "🎉 Correct! You solved the puzzle!";

            }

            if (celebration) {

                celebration.textContent =
                    `+${data.pointsEarned} points! 🍌`;

            }

        }

        // Incorrect answer.
        else {

            if (message) {

                message.textContent =
                    `❌ Incorrect! The correct answer is ${data.correctAnswer}.`;

            }

            if (celebration) {

                celebration.textContent =
                    "Keep learning! Try the next puzzle. 🍌";

            }

        }

        // Update progress from MongoDB.
        if (data.progress) {

            updateProgress(data.progress);

        } else {

            await loadSavedProgress();

        }

        // Enable the next puzzle button.
        if (nextButton) {
            nextButton.disabled = false;
        }

        if (hintButton) {
            hintButton.disabled = true;
        }

    } catch (error) {

        console.error("Answer submission error:", error);

        if (message) {
            message.textContent = error.message;
        }

        // Allow the user to try again if submission failed.
        if (answerInput) {
            answerInput.disabled = false;
        }

        if (submitButton) {
            submitButton.disabled = false;
        }

        if (hintButton && !hintUsed) {
            hintButton.disabled = false;
        }

    } finally {

        answerSubmitting = false;

    }

}


// ==========================================
// BUTTON EVENTS
// ==========================================

if (submitButton) {

    submitButton.addEventListener(
        "click",
        checkAnswer
    );

}

if (nextButton) {

    nextButton.addEventListener(
        "click",
        loadPuzzle
    );

}

if (hintButton) {

    hintButton.addEventListener(
        "click",
        getPuzzleHint
    );

}

if (answerInput) {

    answerInput.addEventListener("keydown", event => {

        if (event.key === "Enter") {

            checkAnswer();

        }

    });

}


// ==========================================
// START GAME
// ==========================================

async function startGame() {

    try {

        // Load saved progress first.
        await loadSavedProgress();

        // Load the first puzzle.
        await loadPuzzle();

    } catch (error) {

        console.error("Game startup error:", error);

        if (message) {
            message.textContent = error.message;
        }

    }

}


// Start the game.
startGame();
