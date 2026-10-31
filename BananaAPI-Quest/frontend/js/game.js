
// ==========================================
// BANANAAPI-QUEST GAME
// ==========================================

const API_BASE_URL = "http://localhost:5000/api";

// HTML elements
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

const hintButton = document.getElementById("hintButton");
const hintMessage = document.getElementById("hintMessage");

const HINT_COST = 20;

// Game variables
let currentPuzzleId = null;
let currentPuzzleSolved = false;
let answerSubmitting = false;
let hintRequestInProgress = false;
let hintsUsed = 0;


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

    const responseText = await response.text();

    let data;

    try {
        data = JSON.parse(responseText);

    } catch (error) {
        console.error("Invalid API response:", responseText);

        throw new Error(
            `Invalid backend response. HTTP Status: ${response.status}.`
        );
    }

    if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "login.html";

        throw new Error("Your session has expired. Please log in again.");
    }

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
// LOAD SAVED PROGRESS
// ==========================================

async function loadSavedProgress() {
    const data = await apiRequest("/banana/history");

    updateProgress(data.stats || {});
}


// ==========================================
// RESET HINTS FOR A NEW PUZZLE
// ==========================================

function resetHint() {
    hintsUsed = 0;
    hintRequestInProgress = false;

    if (hintButton) {
        hintButton.disabled = false;
        hintButton.textContent =
            `💡 Hint:`;
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

        if (
            !data.puzzle ||
            !data.puzzle.puzzleId ||
            !data.puzzle.question
        ) {
            throw new Error(
                "The backend returned incomplete puzzle information."
            );
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

        // Update the points shown on the page.
        if (data.progress) {
            updateProgress(data.progress);
        }

        hintsUsed++;

        // The backend returns a hint object.
        const hintText =
            typeof data.hint === "string"
                ? data.hint
                : data.hint?.message;

        if (!hintText) {
            throw new Error("The server did not return a valid hint.");
        }

        // Display the actual hint message.
        if (hintMessage) {
            const hintLine = document.createElement("p");

            hintLine.textContent =
                `💡 Hint ${data.hint.hintNumber || hintsUsed}: ${hintText}`;

            hintMessage.appendChild(hintLine);
        }

        // Update the button for another hint.
        if (hintButton) {
            hintButton.textContent =
                `💡 Get Another Hint (${HINT_COST} Points)`;

            hintButton.disabled = false;
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

        if (data.correct) {
            if (message) {
                message.textContent =
                    "🎉 Correct! You solved the puzzle!";
            }

            if (celebration) {
                celebration.textContent =
                    `+${data.pointsEarned} points! 🍌`;
            }

        } else {
            if (message) {
                message.textContent =
                    `❌ Incorrect! The correct answer is ${data.correctAnswer}.`;
            }

            if (celebration) {
                celebration.textContent =
                    "Keep learning! Try the next puzzle. 🍌";
            }
        }

        if (data.progress) {
            updateProgress(data.progress);
        } else {
            await loadSavedProgress();
        }

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

        if (answerInput) {
            answerInput.disabled = false;
        }

        if (submitButton) {
            submitButton.disabled = false;
        }

        if (hintButton && !currentPuzzleSolved) {
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
    submitButton.addEventListener("click", checkAnswer);
}

if (nextButton) {
    nextButton.addEventListener("click", loadPuzzle);
}

if (hintButton) {
    hintButton.addEventListener("click", getPuzzleHint);
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
        await loadSavedProgress();
        await loadPuzzle();

    } catch (error) {
        console.error("Game startup error:", error);

        if (message) {
            message.textContent = error.message;
        }
    }
}

startGame();
