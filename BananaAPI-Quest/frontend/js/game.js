
// Partly generated with AI assistance, reviewed and modified by me.

// =============================================================================
// BANANAAPI-QUEST: MAIN GAME ENGINE
//
// CIS046-3 Software For Enterprise - Assignment 1
// Demonstrates Four Core Themes:
// 1. Version Control & Modularity
// 2. Event-Driven Programming
// 3. Interoperability
// 4. Virtual Identity
// =============================================================================

const API_BASE_URL =
    window.APP_CONFIG?.API_BASE_URL || "http://localhost:5000/api";

// -----------------------------------------------------------------------------
// DOM ELEMENT REFERENCES
// -----------------------------------------------------------------------------

const puzzleImage = document.getElementById("puzzleImage");
const answerInput = document.getElementById("answerInput");
const submitButton = document.getElementById("submitAnswer");
const nextButton = document.getElementById("nextPuzzle");
const message = document.getElementById("gameMessage");

const solvedCount = document.getElementById("solvedCount");
const livesCount = document.getElementById("livesCount");
const achievementText = document.getElementById("achievementText");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const progressTrack = document.getElementById("progressTrack");
const celebration = document.getElementById("celebration");
const pointsCount = document.getElementById("pointsCount");

const hintButton = document.getElementById("hintButton");
const hintMessage = document.getElementById("hintMessage");

// Timer elements
const timerBadge = document.getElementById("timerBadge");
const timerText = document.getElementById("timerText");
const timerFill = document.getElementById("timerFill");

// Life and Game Over elements
const livesDisplay = document.getElementById("livesDisplay");
const gameOverCard = document.getElementById("gameOverCard");
const gameOverDetails = document.getElementById("gameOverDetails");
const restartGameBtn = document.getElementById("restartGameBtn");

// -----------------------------------------------------------------------------
// GAME CONFIGURATION AND STATE
// -----------------------------------------------------------------------------

const HINT_COST = 20;
const PUZZLE_TIME_LIMIT = 30;
const MAX_LIVES = 3;

let currentPuzzleId = null;
let currentPuzzleSolved = false;
let answerSubmitting = false;
let hintRequestInProgress = false;
let hintsUsed = 0;

let currentLives = MAX_LIVES;
let timeLeft = PUZZLE_TIME_LIMIT;
let timerInterval = null;

// =============================================================================
// THEME 4: VIRTUAL IDENTITY - AUTHENTICATION HELPERS
// =============================================================================

/**
 * Retrieves the stored JWT token.
 */
function getToken() {
    return localStorage.getItem("token");
}

/**
 * Sends authenticated requests to the backend API.
 */
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
            "Cannot connect to the backend server. Please make sure it is running on port 5000."
        );
    }

    const responseText = await response.text();
    let data;

    try {
        data = JSON.parse(responseText);
    } catch (error) {
        console.error("Invalid API response:", responseText);

        throw new Error(
            `Invalid backend response. Status code: ${response.status}`
        );
    }

    // Handle expired or invalid JWT tokens
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

// =============================================================================
// THEME 2: EVENT-DRIVEN PROGRAMMING - TIMER SUBSYSTEM
// =============================================================================

/**
 * Starts the 30-second countdown timer.
 */
function startTimer() {
    stopTimer();

    timeLeft = PUZZLE_TIME_LIMIT;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeLeft--;

        updateTimerDisplay();

        if (timeLeft <= 0) {
            handleTimeout();
        }
    }, 1000);
}

/**
 * Stops the countdown timer.
 */
function stopTimer() {
    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

/**
 * Updates the timer text and progress bar.
 */
function updateTimerDisplay() {
    if (timerText) {
        timerText.textContent = `${timeLeft}s`;
    }

    const percentage = Math.max(
        0,
        Math.min(100, (timeLeft / PUZZLE_TIME_LIMIT) * 100)
    );

    if (timerFill) {
        timerFill.style.width = `${percentage}%`;
    }

    if (timerBadge && timerFill) {
        timerBadge.classList.remove("warning", "danger");
        timerFill.classList.remove("warning", "danger");

        if (timeLeft <= 5) {
            timerBadge.classList.add("danger");
            timerFill.classList.add("danger");
        } else if (timeLeft <= 10) {
            timerBadge.classList.add("warning");
            timerFill.classList.add("warning");
        }
    }
}

/**
 * Handles timer expiration.
 */
function handleTimeout() {
    if (currentPuzzleSolved) return;

    stopTimer();

    currentPuzzleSolved = true;

    if (answerInput) answerInput.disabled = true;
    if (submitButton) submitButton.disabled = true;
    if (hintButton) hintButton.disabled = true;

    if (message) {
        message.textContent =
            "⏰ Time's up! You took more than 30 seconds.";
    }

    if (celebration) {
        celebration.textContent =
            "You lost 1 life due to timeout. 💔";
    }

    loseLife("timeout");

    if (currentLives > 0 && nextButton) {
        nextButton.disabled = false;
    }
}

// =============================================================================
// LIFE SYSTEM AND GAME OVER LOGIC
// =============================================================================

/**
 * Updates the lives counter and heart icons.
 */
function updateLivesDisplay() {
    // Update statistics card
    if (livesCount) {
        livesCount.textContent = currentLives;
    }

    // Update heart icons
    if (!livesDisplay) return;

    if (currentLives <= 0) {
        livesDisplay.innerHTML =
            '<span class="heart-icon dead" title="No Lives Left">💔</span>';
        return;
    }

    let heartsHtml = "";

    for (let i = 1; i <= MAX_LIVES; i++) {
        if (i <= currentLives) {
            heartsHtml +=
                `<span class="heart-icon active" title="Active Life (${i} of ${MAX_LIVES})">❤️</span>`;
        } else {
            heartsHtml +=
                '<span class="heart-icon lost" title="Lost Life">🤍</span>';
        }
    }

    livesDisplay.innerHTML = heartsHtml;
}

/**
 * Removes one life.
 */
function loseLife(reason = "") {
    currentLives = Math.max(0, currentLives - 1);

    updateLivesDisplay();

    if (currentLives <= 0) {
        triggerGameOver(reason);
    }
}

/**
 * Displays the Game Over screen.
 */
function triggerGameOver(reason = "") {
    stopTimer();

    currentPuzzleSolved = true;

    if (answerInput) answerInput.disabled = true;
    if (submitButton) submitButton.disabled = true;
    if (nextButton) nextButton.disabled = true;
    if (hintButton) hintButton.disabled = true;

    if (gameOverCard) {
        gameOverCard.style.display = "block";
    }

    if (gameOverDetails) {
        if (reason === "timeout") {
            gameOverDetails.textContent =
                "You ran out of time and lost all your lives! Restart to try again.";
        } else {
            gameOverDetails.textContent =
                "You lost all 3 lives! Restart to try a fresh quest.";
        }
    }

    if (message) {
        message.textContent =
            "💔 Game Over! Click 'Play Again' to start a new quest.";
    }
}

/**
 * Restarts the game with three lives.
 */
function restartGame() {
    stopTimer();

    currentLives = MAX_LIVES;
    updateLivesDisplay();

    if (gameOverCard) {
        gameOverCard.style.display = "none";
    }

    loadPuzzle();
}

// =============================================================================
// PROGRESS AND STATISTICS DISPLAY
// =============================================================================

/**
 * Updates the player's saved progress.
 */
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
            `${remaining} more to reach ${nextMilestone}!`;
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

/**
 * Retrieves saved progress from the backend.
 */
async function loadSavedProgress() {
    try {
        const data = await apiRequest("/banana/history");

        updateProgress(data.stats || {});
    } catch (error) {
        console.error("Could not load initial progress:", error);
    }
}

// =============================================================================
// PUZZLE MANAGEMENT AND SMART HINT LOGIC
// =============================================================================

/**
 * Resets hints when a new puzzle is loaded.
 */
function resetHint() {
    hintsUsed = 0;
    hintRequestInProgress = false;

    if (hintButton) {
        hintButton.disabled = false;
        hintButton.textContent =
            `💡 Get a Hint (${HINT_COST} Points)`;
    }

    if (hintMessage) {
        hintMessage.innerHTML = "";
    }
}

/**
 * Loads a new puzzle from the backend.
 */
async function loadPuzzle() {
    if (currentLives <= 0) {
        triggerGameOver();
        return;
    }

    try {
        currentPuzzleId = null;
        currentPuzzleSolved = false;
        answerSubmitting = false;

        stopTimer();
        resetHint();

        if (message) {
            message.textContent =
                "Loading puzzle from Banana API...";
        }

        if (answerInput) {
            answerInput.value = "";
            answerInput.disabled = true;
        }

        if (submitButton) submitButton.disabled = true;
        if (nextButton) nextButton.disabled = true;

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
                "Backend returned incomplete puzzle information."
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
                "Solve the puzzle and enter your answer (0 - 9)!";
        }

        // Start a new 30-second countdown
        startTimer();

    } catch (error) {
        console.error("Puzzle loading error:", error);

        stopTimer();

        if (message) {
            message.textContent = error.message;
        }
    }
}

/**
 * Requests the next progressive hint from the backend.
 */
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

        const data = await apiRequest("/banana/hint", {
            method: "POST",
            body: JSON.stringify({
                puzzleId: currentPuzzleId
            })
        });

        if (data.progress) {
            updateProgress(data.progress);
        }

        const hintText =
            typeof data.hint === "string"
                ? data.hint
                : data.hint?.message;

        if (!hintText) {
            throw new Error(
                "Server did not return a valid hint message."
            );
        }

        hintsUsed++;

        if (hintMessage) {
            const hintItem = document.createElement("div");

            hintItem.className = "hint-item";

            hintItem.textContent =
                `💡 Clue ${data.hint?.hintNumber || hintsUsed}: ${hintText}`;

            hintMessage.appendChild(hintItem);
        }

        if (hintButton) {
            const totalHints = data.hint?.totalHints || 3;

            if (data.hint?.hintNumber >= totalHints) {
                hintButton.textContent =
                    "💡 All Hints Unlocked";

                hintButton.disabled = true;
            } else {
                hintButton.textContent =
                    "💡 Get Next Hint";

                hintButton.disabled = false;
            }
        }

    } catch (error) {
        console.error("Hint error:", error);

        if (hintMessage) {
            const errorParagraph = document.createElement("p");

            errorParagraph.style.color = "#A91E2C";
            errorParagraph.textContent = error.message;

            hintMessage.appendChild(errorParagraph);
        }

        if (hintButton && !currentPuzzleSolved) {
            hintButton.disabled = false;
        }

    } finally {
        hintRequestInProgress = false;
    }
}

// =============================================================================
// ANSWER SUBMISSION AND EVALUATION
// =============================================================================

/**
 * Submits the player's answer to the backend.
 */
async function checkAnswer() {
    if (
        !currentPuzzleId ||
        currentPuzzleSolved ||
        answerSubmitting
    ) {
        return;
    }

    const rawValue = answerInput
        ? answerInput.value.trim()
        : "";

    const numericAnswer = Number(rawValue);

    if (
        rawValue === "" ||
        !Number.isInteger(numericAnswer) ||
        numericAnswer < 0 ||
        numericAnswer > 9
    ) {
        if (message) {
            message.textContent =
                "Please enter a valid whole number (0 to 9).";
        }

        return;
    }

    try {
        answerSubmitting = true;

        stopTimer();

        if (submitButton) submitButton.disabled = true;
        if (answerInput) answerInput.disabled = true;
        if (hintButton) hintButton.disabled = true;

        if (message) {
            message.textContent =
                "Evaluating your answer with backend...";
        }

        const data = await apiRequest("/banana/answer", {
            method: "POST",
            body: JSON.stringify({
                answer: numericAnswer,
                puzzleId: currentPuzzleId
            })
        });

        currentPuzzleSolved = true;

        if (data.correct) {
            if (message) {
                message.textContent =
                    "🎉 Correct! Excellent calculation!";
            }

            if (celebration) {
                celebration.textContent =
                    `+${data.pointsEarned} points awarded! 🍌`;
            }

            if (nextButton) {
                nextButton.disabled = false;
            }

        } else {
            if (message) {
                message.textContent =
                    `❌ Incorrect! The correct answer was ${data.correctAnswer}.`;
            }

            if (celebration) {
                celebration.textContent =
                    "You lost 1 life! 💔 Keep thinking!";
            }

            loseLife("wrong_answer");

            if (currentLives > 0 && nextButton) {
                nextButton.disabled = false;
            }
        }

        if (data.progress) {
            updateProgress(data.progress);
        } else {
            await loadSavedProgress();
        }

    } catch (error) {
        console.error("Answer evaluation error:", error);

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

        // Resume timer if the request failed and time remains
        if (!currentPuzzleSolved && timeLeft > 0) {
            startTimer();
        }

    } finally {
        answerSubmitting = false;
    }
}

// =============================================================================
// THEME 2: EVENT-DRIVEN PROGRAMMING - EVENT LISTENERS
// =============================================================================

// Submit answer
if (submitButton) {
    submitButton.addEventListener("click", checkAnswer);
}

// Load next puzzle
if (nextButton) {
    nextButton.addEventListener("click", loadPuzzle);
}

// Request a hint
if (hintButton) {
    hintButton.addEventListener("click", getPuzzleHint);
}

// Restart game
if (restartGameBtn) {
    restartGameBtn.addEventListener("click", restartGame);
}

// Submit answer using Enter key
if (answerInput) {
    answerInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            checkAnswer();
        }
    });
}

// =============================================================================
// INITIALIZATION
// =============================================================================

async function initGame() {
    try {
        updateLivesDisplay();

        await loadSavedProgress();
        await loadPuzzle();

    } catch (error) {
        console.error("Game initialization error:", error);

        if (message) {
            message.textContent = error.message;
        }
    }
}

// Start the game
initGame();
