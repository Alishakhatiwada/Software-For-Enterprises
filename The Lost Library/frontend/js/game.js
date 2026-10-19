
const API_BASE_URL = "http://localhost:5000/api";

// ==========================================
// 1. GET HTML ELEMENTS
// ==========================================

const welcomeScreen = document.querySelector(".welcome");
const startButton = document.getElementById("startButton");

const storyScreen = document.getElementById("storyScreen");
const exploreButton = document.getElementById("exploreButton");

const explorationScreen = document.getElementById("explorationScreen");
const backButton = document.getElementById("backButton");

const clueTitle = document.getElementById("clueTitle");
const clueMessage = document.getElementById("clueMessage");
const progressMessage = document.getElementById("progressMessage");

const puzzleButton = document.getElementById("puzzleButton");
const puzzleScreen = document.getElementById("puzzleScreen");
const puzzleLoading = document.getElementById("puzzleLoading");
const puzzleImage = document.getElementById("puzzleImage");

const answerForm = document.getElementById("answerForm");
const answerInput = document.getElementById("answerInput");
const submitAnswerButton = document.getElementById("submitAnswerButton");
const answerFeedback = document.getElementById("answerFeedback");

const retryPuzzleButton = document.getElementById("retryPuzzleButton");
const returnToLibraryButton = document.getElementById("returnToLibraryButton");

const nextChapterScreen = document.getElementById("nextChapterScreen");
const returnFromChapterButton = document.getElementById(
    "returnFromChapterButton"
);

// ==========================================
// 2. GAME VARIABLES
// ==========================================

const discoveredClues = {
    book: false,
    note: false,
    door: false
};

let puzzleUnlocked = false;
let puzzleSolved = false;
let loadingPuzzle = false;
let checkingAnswer = false;
let currentPuzzleLoaded = false;

// ==========================================
// 3. SHOW AND HIDE SCREENS
// ==========================================

function showScreen(screenToShow) {
    const screens = [
        welcomeScreen,
        storyScreen,
        explorationScreen,
        puzzleScreen,
        nextChapterScreen
    ];

    screens.forEach(function (screen) {
        if (screen) {
            screen.classList.add("hidden");
        }
    });

    if (screenToShow) {
        screenToShow.classList.remove("hidden");
    }
}

// ==========================================
// 4. START THE GAME
// ==========================================

startButton.addEventListener("click", function () {
    showScreen(storyScreen);
});

// ==========================================
// 5. EXPLORE THE LIBRARY
// ==========================================

exploreButton.addEventListener("click", function () {
    showScreen(explorationScreen);
});

// ==========================================
// 6. RETURN TO THE STORY
// ==========================================

backButton.addEventListener("click", function () {
    showScreen(storyScreen);
});

// ==========================================
// 7. CLUE INFORMATION
// ==========================================

const clues = {
    book: {
        title: "The Golden Book",
        message:
            'You open the dusty book. Its first page reads: ' +
            '"Knowledge opens doors that keys cannot." ' +
            "A strange symbol is drawn beneath the words."
    },

    note: {
        title: "The Mysterious Note",
        message:
            '"Three secrets guard the way. Find the truth ' +
            'before you proceed." Someone has hidden the rest.'
    },

    door: {
        title: "The Locked Door",
        message:
            "Strange symbols cover the ancient door. " +
            "It will not open until you solve its hidden puzzle."
    }
};

// ==========================================
// 8. INSPECT CLUES
// ==========================================

document.querySelectorAll(".inspectButton").forEach(function (button) {
    button.addEventListener("click", function () {
        const item = button.dataset.item;
        const clue = clues[item];

        if (!clue) {
            return;
        }

        clueTitle.textContent = clue.title;
        clueMessage.textContent = clue.message;

        discoveredClues[item] = true;

        checkClueProgress();
    });
});

// ==========================================
// 9. CHECK CLUE PROGRESS
// ==========================================

function checkClueProgress() {
    const discoveredCount = Object.values(discoveredClues)
        .filter(Boolean).length;

    progressMessage.textContent =
        `Clues discovered: ${discoveredCount} of 3.`;

    if (discoveredCount === 3) {
        puzzleUnlocked = true;

        progressMessage.textContent =
            "All three clues discovered! The hidden puzzle is unlocked.";

        puzzleButton.classList.remove("hidden");
    }
}

// ==========================================
// 10. OPEN THE BANANA PUZZLE
// ==========================================

puzzleButton.addEventListener("click", async function () {
    if (!puzzleUnlocked || loadingPuzzle || puzzleSolved) {
        return;
    }

    showScreen(puzzleScreen);

    // Reuse the puzzle if it has already loaded.
    if (currentPuzzleLoaded) {
        return;
    }

    await loadBananaPuzzle();
});

// ==========================================
// 11. LOAD A PUZZLE FROM THE BACKEND
// ==========================================

async function loadBananaPuzzle() {
    if (loadingPuzzle || puzzleSolved) {
        return;
    }

    loadingPuzzle = true;
    currentPuzzleLoaded = false;

    puzzleLoading.textContent = "Loading your Banana puzzle...";

    puzzleImage.classList.add("hidden");
    puzzleImage.removeAttribute("src");

    answerInput.value = "";
    answerInput.disabled = true;
    submitAnswerButton.disabled = true;

    answerFeedback.textContent = "";
    retryPuzzleButton.classList.add("hidden");

    try {
        const response = await fetch(`${API_BASE_URL}/banana/puzzle`);

        // Read the response safely.
        const data = await response.json();

        if (!response.ok || !data.success || !data.puzzle) {
            throw new Error(
                data.message || `Server error: ${response.status}`
            );
        }

        if (!data.puzzle.question) {
            throw new Error("The API did not return a puzzle image.");
        }

        // Display the Banana API puzzle image.
        puzzleImage.onload = function () {
            puzzleImage.classList.remove("hidden");
            puzzleLoading.textContent =
                "Study the image carefully and solve the puzzle.";
        };

        puzzleImage.onerror = function () {
            currentPuzzleLoaded = false;
            puzzleImage.classList.add("hidden");

            puzzleLoading.textContent =
                "The puzzle was received, but its image could not load.";

            answerInput.disabled = true;
            submitAnswerButton.disabled = true;
            retryPuzzleButton.classList.remove("hidden");
        };

        puzzleImage.src = data.puzzle.question;

        // Wait for the image to load before enabling answers.
        await new Promise(function (resolve, reject) {
            if (puzzleImage.complete && puzzleImage.naturalWidth > 0) {
                resolve();
                return;
            }

            puzzleImage.onload = function () {
                puzzleImage.classList.remove("hidden");
                resolve();
            };

            puzzleImage.onerror = function () {
                reject(new Error("Could not load the puzzle image."));
            };
        });

        currentPuzzleLoaded = true;

        puzzleImage.classList.remove("hidden");

        puzzleLoading.textContent =
            "Study the image carefully and solve the puzzle.";

        answerInput.disabled = false;
        submitAnswerButton.disabled = false;

        answerInput.focus();

    } catch (error) {
        console.error("Banana puzzle loading failed:", error);

        puzzleLoading.textContent =
            "Could not load the puzzle. " + getErrorMessage(error);

        retryPuzzleButton.classList.remove("hidden");

    } finally {
        loadingPuzzle = false;
    }
}

// ==========================================
// 12. EXPLAIN COMMON ERRORS
// ==========================================

function getErrorMessage(error) {
    if (error instanceof TypeError) {
        return (
            "Check that the backend is running and that CORS " +
            "allows your frontend to connect. Open the browser " +
            "Console for more details."
        );
    }

    return error.message || "Please try again.";
}

// ==========================================
// 13. SUBMIT THE PLAYER'S ANSWER
// ==========================================

answerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (
        !currentPuzzleLoaded ||
        puzzleSolved ||
        loadingPuzzle ||
        checkingAnswer
    ) {
        return;
    }

    const answer = answerInput.value.trim();

    if (answer === "") {
        answerFeedback.textContent = "Please enter your answer.";
        return;
    }

    checkingAnswer = true;
    submitAnswerButton.disabled = true;

    answerFeedback.textContent = "Checking your answer...";

    try {
        const response = await fetch(`${API_BASE_URL}/banana/answer`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                answer: answer
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || `Server error: ${response.status}`
            );
        }

        if (data.correct) {
            puzzleSolved = true;
            currentPuzzleLoaded = false;

            answerFeedback.textContent =
                "Correct! The ancient door begins to open...";

            answerInput.disabled = true;
            submitAnswerButton.disabled = true;

            // Give the player a moment to read the message.
            window.setTimeout(function () {
                showScreen(nextChapterScreen);
            }, 1200);

        } else {
            answerFeedback.textContent =
                "Not quite! Look carefully at the puzzle and try again.";

            submitAnswerButton.disabled = false;
            answerInput.focus();
            answerInput.select();
        }

    } catch (error) {
        console.error("Answer checking failed:", error);

        answerFeedback.textContent =
            "Could not check your answer. " + getErrorMessage(error);

        submitAnswerButton.disabled = false;

    } finally {
        checkingAnswer = false;
    }
});

// ==========================================
// 14. LOAD ANOTHER PUZZLE
// ==========================================

retryPuzzleButton.addEventListener("click", async function () {
    if (loadingPuzzle || checkingAnswer || puzzleSolved) {
        return;
    }

    await loadBananaPuzzle();
});

// ==========================================
// 15. RETURN TO THE LIBRARY
// ==========================================

returnToLibraryButton.addEventListener("click", function () {
    showScreen(explorationScreen);
});

// ==========================================
// 16. RETURN AFTER CHAPTER ONE
// ==========================================

returnFromChapterButton.addEventListener("click", function () {
    showScreen(explorationScreen);
});

// ==========================================
// 17. GAME READY
// ==========================================

console.log("The Lost Library game is ready!");
