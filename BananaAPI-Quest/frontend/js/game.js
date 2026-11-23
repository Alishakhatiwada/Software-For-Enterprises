// =============================================================================
// BANANAAPI-QUEST: MAIN GAME ENGINE
//
// CIS046-3 Software For Enterprise - Assignment 1
// Demonstrates Four Core Themes:
// 1. Version Control & Modularity
// 2. Event-Driven Programming (DOM listeners, setInterval timer, async handlers)
// 3. Interoperability (Node.js REST API <-> External Banana API)
// 4. Virtual Identity (JWT bearer tokens, session persistence)
// =============================================================================

const API_BASE_URL = "http://localhost:5000/api";

// -----------------------------------------------------------------------------
// DOM ELEMENT REFERENCES
// -----------------------------------------------------------------------------
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

// Timer DOM Elements
const timerBadge = document.getElementById("timerBadge");
const timerText = document.getElementById("timerText");
const timerFill = document.getElementById("timerFill");

// Life & Game Over DOM Elements
const livesDisplay = document.getElementById("livesDisplay");
const gameOverCard = document.getElementById("gameOverCard");
const gameOverDetails = document.getElementById("gameOverDetails");
const restartGameBtn = document.getElementById("restartGameBtn");

// -----------------------------------------------------------------------------
// GAME CONFIGURATION & STATE
// -----------------------------------------------------------------------------
const HINT_COST = 20;
const PUZZLE_TIME_LIMIT = 30; // 30 seconds countdown per puzzle
const MAX_LIVES = 3;          // 3 lives per quest run

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
 * Retrieves the stored JWT token representing the user's virtual identity.
 */
function getToken() {
    return localStorage.getItem("token");
}

/**
 * THEME 3: INTEROPERABILITY - CLIENT TO SERVER REST COMMUNICATION
 * Executes authenticated HTTP requests sending JSON payloads with Bearer token.
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
        console.error("Invalid API response format:", responseText);
        throw new Error(`Invalid backend response. Status code: ${response.status}`);
    }

    // Token expired or invalid -> enforce re-authentication
    if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "login.html";
        throw new Error("Your session has expired. Please log in again.");
    }

    if (!response.ok || data.success === false) {
        throw new Error(data.message || `Request failed with status ${response.status}.`);
    }

    return data;
}


// =============================================================================
// THEME 2: EVENT-DRIVEN PROGRAMMING - TIMER SUBSYSTEM
// =============================================================================

/**
 * Starts a real-time 30-second countdown timer.
 * Uses setInterval to generate recurring tick events every 1000 milliseconds.
 */
function startTimer() {
    stopTimer(); // Ensure no duplicate intervals run concurrently

    timeLeft = PUZZLE_TIME_LIMIT;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeLeft -= 1;
        updateTimerDisplay();

        // Timer expiration event
        if (timeLeft <= 0) {
            handleTimeout();
        }
    }, 1000);
}

/**
 * Clears the active interval timer.
 */
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

/**
 * Synchronizes the visual timer badge and progress bar with current remaining time.
 */
function updateTimerDisplay() {
    if (timerText) {
        timerText.textContent = `${timeLeft}s`;
    }

    // Calculate width percentage (0% to 100%)
    const percentage = Math.max(0, Math.min(100, (timeLeft / PUZZLE_TIME_LIMIT) * 100));

    if (timerFill) {
        timerFill.style.width = `${percentage}%`;
    }

    // Dynamic visual feedback classes based on remaining time
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
 * Event Handler: Executed when the countdown reaches 0 seconds.
 * Imposes a life penalty and advances the game state.
 */
function handleTimeout() {
    stopTimer();

    currentPuzzleSolved = true;

    if (answerInput) answerInput.disabled = true;
    if (submitButton) submitButton.disabled = true;
    if (hintButton) hintButton.disabled = true;

    if (message) {
        message.textContent = "⏰ Time's up! You took more than 30 seconds.";
    }

    if (celebration) {
        celebration.textContent = "You lost 1 life due to timeout. 💔";
    }

    // Deduct 1 life
    loseLife("timeout");

    // If lives still remain, allow player to advance to next puzzle
    if (currentLives > 0 && nextButton) {
        nextButton.disabled = false;
    }
}


// =============================================================================
// LIFE SYSTEM & GAME OVER LOGIC
// =============================================================================

/**
 * Renders hearts representing remaining lives:
 * 3 lives: ❤️❤️❤️ | 2 lives: ❤️❤️🤍 | 1 life: ❤️🤍🤍 | 0 lives: 💔 Game Over
 */
function updateLivesDisplay() {
    if (!livesDisplay) return;

    if (currentLives <= 0) {
        livesDisplay.innerHTML = `<span class="heart-icon dead" title="No Lives Left">💔</span>`;
        return;
    }

    let heartsHtml = "";
    for (let i = 1; i <= MAX_LIVES; i++) {
        if (i <= currentLives) {
            heartsHtml += `<span class="heart-icon active" title="Active Life (${i} of ${MAX_LIVES})">❤️</span>`;
        } else {
            heartsHtml += `<span class="heart-icon lost" title="Lost Life">🤍</span>`;
        }
    }

    livesDisplay.innerHTML = heartsHtml;
}

/**
 * Decrements player lives and triggers Game Over if lives reach 0.
 */
function loseLife(reason = "") {
    currentLives = Math.max(0, currentLives - 1);
    updateLivesDisplay();

    if (currentLives <= 0) {
        triggerGameOver(reason);
    }
}

/**
 * Triggers the Game Over state, halting gameplay until the player restarts.
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
                "You ran out of time and lost all your lives! Don't give up—restart to try again.";
        } else {
            gameOverDetails.textContent =
                "You lost all 3 lives! Re-examine the math carefully and try a fresh quest.";
        }
    }

    if (message) {
        message.textContent = "💔 Game Over! Click 'Play Again' to start a new quest.";
    }
}

/**
 * Restarts a fresh quest session: restores 3 lives and loads a new puzzle.
 */
function restartGame() {
    currentLives = MAX_LIVES;
    updateLivesDisplay();

    if (gameOverCard) {
        gameOverCard.style.display = "none";
    }

    loadPuzzle();
}


// =============================================================================
// PROGRESS & STATS DISPLAY
// =============================================================================

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
        achievementText.textContent = `${remaining} more to reach ${nextMilestone}!`;
    }

    const percentage = (solved % 5) * 20;

    if (progressText) {
        progressText.textContent = `${solved % 5}/5`;
    }

    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }

    if (progressTrack) {
        progressTrack.setAttribute("aria-valuenow", String(percentage));
    }
}

async function loadSavedProgress() {
    try {
        const data = await apiRequest("/banana/history");
        updateProgress(data.stats || {});
    } catch (error) {
        console.error("Could not load initial progress:", error);
    }
}


// =============================================================================
// PUZZLE MANAGEMENT & SMART HINT LOGIC
// =============================================================================

function resetHint() {
    hintsUsed = 0;
    hintRequestInProgress = false;

    if (hintButton) {
        hintButton.disabled = false;
        hintButton.textContent = `💡 Get a Hint (${HINT_COST} Points)`;
    }

    if (hintMessage) {
        hintMessage.innerHTML = "";
    }
}

/**
 * Loads a new puzzle from the backend API and initiates the countdown timer.
 */
async function loadPuzzle() {
    // If the player has no lives, require a restart
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
            message.textContent = "Loading puzzle from Banana API...";
        }

        if (answerInput) {
            answerInput.value = "";
            answerInput.disabled = true;
        }

        if (submitButton) submitButton.disabled = true;
        if (nextButton) nextButton.disabled = true;
        if (celebration) celebration.textContent = "";

        if (puzzleImage) {
            puzzleImage.style.display = "none";
        }

        // Fetch puzzle from our backend (which queries Marc Conrad's Banana API)
        const data = await apiRequest("/banana/puzzle");

        if (!data.puzzle || !data.puzzle.puzzleId || !data.puzzle.question) {
            throw new Error("Backend returned incomplete puzzle information.");
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
            message.textContent = "Solve the puzzle and enter your answer (0 - 9)!";
        }

        // Start countdown timer for this puzzle
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
 * Requests a progressive, mathematically helpful hint from the backend.
 */
async function getPuzzleHint() {
    if (!currentPuzzleId || currentPuzzleSolved || hintRequestInProgress) {
        return;
    }

    try {
        hintRequestInProgress = true;

        if (hintButton) hintButton.disabled = true;

        const data = await apiRequest("/banana/hint", {
            method: "POST",
            body: JSON.stringify({
                puzzleId: currentPuzzleId
            })
        });

        if (data.progress) {
            updateProgress(data.progress);
        }

        hintsUsed += 1;

        const hintText = typeof data.hint === "string" ? data.hint : data.hint?.message;

        if (!hintText) {
            throw new Error("Server did not return a valid hint message.");
        }

        // Render the helpful mathematical clue
        if (hintMessage) {
            const hintItem = document.createElement("div");
            hintItem.className = "hint-item";
            hintItem.textContent = `💡 Clue ${data.hint.hintNumber || hintsUsed}: ${hintText}`;
            hintMessage.appendChild(hintItem);
        }

        // Update button status based on total hints available
        if (hintButton) {
            const totalHints = data.hint?.totalHints || 3;

            if (data.hint?.hintNumber >= totalHints) {
                hintButton.textContent = "💡 All Hints Unlocked";
                hintButton.disabled = true;
            } else {
                hintButton.textContent = `💡 Get Next Hint (${HINT_COST} Points)`;
                hintButton.disabled = false;
            }
        }

    } catch (error) {
        console.error("Hint error:", error);

        if (hintMessage) {
            const errP = document.createElement("p");
            errP.style.color = "#A91E2C";
            errP.textContent = error.message;
            hintMessage.appendChild(errP);
        }

        if (hintButton) {
            hintButton.disabled = false;
        }

    } finally {
        hintRequestInProgress = false;
    }
}


// =============================================================================
// ANSWER SUBMISSION & EVALUATION
// =============================================================================

async function checkAnswer() {
    if (!currentPuzzleId || currentPuzzleSolved || answerSubmitting) {
        return;
    }

    const rawValue = answerInput ? answerInput.value.trim() : "";

    if (rawValue === "" || !Number.isFinite(Number(rawValue))) {
        if (message) {
            message.textContent = "Please enter a valid number (0 to 9).";
        }
        return;
    }

    try {
        answerSubmitting = true;
        stopTimer(); // Halt timer immediately on submission

        if (submitButton) submitButton.disabled = true;
        if (answerInput) answerInput.disabled = true;
        if (hintButton) hintButton.disabled = true;

        if (message) {
            message.textContent = "Evaluating your answer with backend...";
        }

        const data = await apiRequest("/banana/answer", {
            method: "POST",
            body: JSON.stringify({
                answer: Number(rawValue),
                puzzleId: currentPuzzleId
            })
        });

        currentPuzzleSolved = true;

        if (data.correct) {
            // Correct answer
            if (message) {
                message.textContent = "🎉 Correct! Excellent calculation!";
            }

            if (celebration) {
                celebration.textContent = `+${data.pointsEarned} points awarded! 🍌`;
            }

            if (nextButton) nextButton.disabled = false;

        } else {
            // Incorrect answer -> deduct a life
            if (message) {
                message.textContent = `❌ Incorrect! The correct answer was ${data.correctAnswer}.`;
            }

            if (celebration) {
                celebration.textContent = "You lost 1 life! 💔 Keep thinking!";
            }

            loseLife("wrong_answer");

            // If lives remain, allow player to continue
            if (currentLives > 0 && nextButton) {
                nextButton.disabled = false;
            }
        }

        // Update progress counters
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

        if (answerInput) answerInput.disabled = false;
        if (submitButton) submitButton.disabled = false;
        if (hintButton && !currentPuzzleSolved) hintButton.disabled = false;

        // Resume timer if submission failed due to network error
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

// Button Click Events
if (submitButton) {
    submitButton.addEventListener("click", checkAnswer);
}

if (nextButton) {
    nextButton.addEventListener("click", loadPuzzle);
}

if (hintButton) {
    hintButton.addEventListener("click", getPuzzleHint);
}

if (restartGameBtn) {
    restartGameBtn.addEventListener("click", restartGame);
}

// Keyboard Input Event: Submitting on "Enter"
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

// Start the game once the script is loaded
initGame();
