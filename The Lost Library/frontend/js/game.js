
/**
 * The Lost Library - Master Game Engine
 * Features:
 * - Dynamic chapter progression
 * - Clue discovery
 * - Banana API puzzles
 * - Saved player progress
 * - Login and logout support
 * - Four or more chapters
 */

const gameState = {
    currentUser: null,
    currentLevel: 1,
    solvedPuzzles: 0,
    completedLevels: [],
    discoveredClues: {},
    puzzleUnlocked: false,
    puzzleSolved: false,
    loadingPuzzle: false,
    checkingAnswer: false,
    currentPuzzleLoaded: false
};

// DOM ELEMENTS
const topNav = document.getElementById("topNav");
const currentChapterBadge =
    document.getElementById("currentChapterBadge");
const userStatusArea =
    document.getElementById("userStatusArea");
const toastNotification =
    document.getElementById("toastNotification");

const welcomeScreen =
    document.getElementById("welcomeScreen") ||
    document.querySelector(".welcome");
const startButton = document.getElementById("startButton");
const welcomeAccountLinks =
    document.getElementById("welcomeAccountLinks");

const storyScreen = document.getElementById("storyScreen");
const storyEyebrow = document.getElementById("storyEyebrow");
const storyTitle = document.getElementById("storyTitle");
const storyParagraph1 = document.getElementById("storyParagraph1");
const storyParagraph2 = document.getElementById("storyParagraph2");
const storyParagraph3 = document.getElementById("storyParagraph3");
const storyQuestion = document.getElementById("storyQuestion");
const exploreButton = document.getElementById("exploreButton");

const explorationScreen =
    document.getElementById("explorationScreen");
const roomEyebrow = document.getElementById("roomEyebrow");
const roomTitle = document.getElementById("roomTitle");
const roomDescription = document.getElementById("roomDescription");
const roomItemsContainer =
    document.getElementById("roomItemsContainer");
const clueTitle = document.getElementById("clueTitle");
const clueMessage = document.getElementById("clueMessage");
const progressMessage = document.getElementById("progressMessage");
const puzzleButton = document.getElementById("puzzleButton");
const backButton = document.getElementById("backButton");

const puzzleScreen = document.getElementById("puzzleScreen");
const puzzleEyebrow = document.getElementById("puzzleEyebrow");
const puzzleHeading = document.getElementById("puzzleHeading");
const puzzlePrompt = document.getElementById("puzzlePrompt");
const puzzleLoading = document.getElementById("puzzleLoading");
const puzzleImage = document.getElementById("puzzleImage");
const answerForm = document.getElementById("answerForm");
const answerInput = document.getElementById("answerInput");
const submitAnswerButton =
    document.getElementById("submitAnswerButton");
const answerFeedback = document.getElementById("answerFeedback");
const retryPuzzleButton =
    document.getElementById("retryPuzzleButton");
const returnToLibraryButton =
    document.getElementById("returnToLibraryButton");

const nextChapterScreen =
    document.getElementById("nextChapterScreen");
const unlockedEyebrow = document.getElementById("unlockedEyebrow");
const unlockedTitle = document.getElementById("unlockedTitle");
const unlockedText1 = document.getElementById("unlockedText1");
const unlockedText2 = document.getElementById("unlockedText2");
const unlockedQuestion =
    document.getElementById("unlockedQuestion");
const advanceChapterButton =
    document.getElementById("advanceChapterButton");
const returnFromChapterButton =
    document.getElementById("returnFromChapterButton");

const victoryScreen = document.getElementById("victoryScreen");
const victoryPlayerName =
    document.getElementById("victoryPlayerName");
const victoryStats = document.getElementById("victoryStats");
const playAgainButton = document.getElementById("playAgainButton");

let toastTimeout = null;
let chapterTransitionTimer = null;


// GENERAL HELPERS

function showToast(message, duration = 3500) {
    if (!toastNotification) return;

    toastNotification.textContent = message;
    toastNotification.classList.remove("hidden");

    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }

    toastTimeout = setTimeout(() => {
        toastNotification.classList.add("hidden");
    }, duration);
}

function showScreen(screenToShow) {
    const screens = [
        welcomeScreen,
        storyScreen,
        explorationScreen,
        puzzleScreen,
        nextChapterScreen,
        victoryScreen
    ];

    screens.forEach(screen => {
        if (screen) {
            screen.classList.add("hidden");
        }
    });

    if (screenToShow) {
        screenToShow.classList.remove("hidden");
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
}

function escapeHtml(value) {
    const element = document.createElement("div");
    element.textContent = String(value ?? "");
    return element.innerHTML;
}

function getChapterNumbers() {
    return Object.keys(window.ROOMS || {})
        .map(Number)
        .filter(Number.isFinite)
        .sort((a, b) => a - b);
}

function getCurrentRoom() {
    return window.ROOMS
        ? window.ROOMS[gameState.currentLevel] || null
        : null;
}

function getNextChapterNumber() {
    const chapters = getChapterNumbers();
    const currentIndex = chapters.indexOf(gameState.currentLevel);

    if (currentIndex === -1) return null;

    return chapters[currentIndex + 1] ?? null;
}


// NAVIGATION AND ACCOUNT DISPLAY

function updateTopNav() {
    if (currentChapterBadge) {
        currentChapterBadge.textContent =
            `Chapter ${gameState.currentLevel}`;
    }

    if (!userStatusArea) return;

    if (gameState.currentUser) {
        userStatusArea.innerHTML = `
            <div class="user-pill">
                <span>👤 ${escapeHtml(gameState.currentUser.name)}</span>
                <span class="user-level-badge">
                    ⭐ Chapter ${gameState.currentLevel}
                </span>
                <span>🧩 ${gameState.solvedPuzzles} solved</span>
            </div>
            <button id="logoutButton" class="nav-logout-button">
                Log Out
            </button>
        `;

        const logoutButton =
            document.getElementById("logoutButton");

        if (logoutButton) {
            logoutButton.addEventListener("click", () => {
                if (window.api) {
                    window.api.logout();
                }

                gameState.currentUser = null;

                updateTopNav();
                showScreen(welcomeScreen);
                showToast("You have been logged out.");
            });
        }

        if (welcomeAccountLinks) {
            welcomeAccountLinks.innerHTML = `
                <span>Welcome back,
                    <strong>${escapeHtml(gameState.currentUser.name)}</strong>
                </span>
            `;
        }
    } else {
        userStatusArea.innerHTML = `
            <span class="user-pill">👤 Guest</span>
            <a href="login.html" class="nav-auth-link">Log In</a>
            <span>·</span>
            <a href="register.html" class="nav-auth-link">Register</a>
        `;

        if (welcomeAccountLinks) {
            welcomeAccountLinks.innerHTML = "";
        }
    }
}


// SAVED PROGRESS

async function loadPlayerProgress() {
    if (!gameState.currentUser || !window.api) return;

    try {
        const saved = await window.api.getProgress(
            gameState.currentUser.name
        );

        if (saved) {
            const chapters = getChapterNumbers();

            gameState.currentLevel =
                Number(saved.currentLevel) || chapters[0] || 1;

            gameState.solvedPuzzles =
                Number(saved.solvedPuzzles) || 0;

            gameState.completedLevels =
                Array.isArray(saved.completedLevels)
                    ? [...new Set(saved.completedLevels.map(Number))]
                    : [];

            // If the saved chapter no longer exists, use the first
            // chapter that has not been completed.
            if (!window.ROOMS[gameState.currentLevel]) {
                gameState.currentLevel =
                    chapters.find(level =>
                        !gameState.completedLevels.includes(level)
                    ) ?? chapters[chapters.length - 1] ?? 1;
            }

            // If all chapters are complete, keep the last chapter
            // selected. Initialization will display the victory screen.
            updateTopNav();

            showToast("Your saved progress has been loaded.");
        } else {
            await savePlayerProgress();
        }
    } catch (error) {
        console.error("Could not load progress:", error);
        showToast("Could not load saved progress. You can still play.");
    }
}

async function savePlayerProgress() {
    updateTopNav();

    if (!gameState.currentUser) {
        return;
    }

    const updates = {
        currentLevel: gameState.currentLevel,
        solvedPuzzles: gameState.solvedPuzzles,
        completedLevels: gameState.completedLevels
    };

    try {
        const result = await window.api.saveProgress(
            gameState.currentUser.name,
            updates
        );

        if (!result || !result.success) {
            console.warn("The server did not confirm the progress save.");
            showToast("Progress could not be confirmed as saved.");
        }
    } catch (error) {
        console.error("Could not save progress:", error);
        showToast("Could not save progress. Please try again later.");
    }
}


// ROOM RENDERING

function renderRoom(levelNumber) {
    const room = window.ROOMS[levelNumber];

    if (!room) {
        showToast("This chapter is not available.");
        return;
    }

    gameState.currentLevel = Number(levelNumber);
    gameState.discoveredClues = {};
    gameState.puzzleUnlocked = false;
    gameState.puzzleSolved =
        gameState.completedLevels.includes(Number(levelNumber));
    gameState.currentPuzzleLoaded = false;

    if (storyEyebrow) {
        storyEyebrow.textContent = room.eyebrow;
    }

    if (storyTitle) {
        storyTitle.textContent = room.title;
    }

    if (storyParagraph1) {
        storyParagraph1.textContent = room.storyGreeting;
    }

    if (storyParagraph2) {
        storyParagraph2.textContent = room.description;
    }

    if (storyParagraph3) {
        storyParagraph3.textContent = "";
    }

    if (storyQuestion) {
        storyQuestion.textContent = room.storyQuestion;
    }

    if (roomEyebrow) {
        roomEyebrow.textContent =
            `CHAPTER ${room.chapterNumber} · EXPLORE`;
    }

    if (roomTitle) {
        roomTitle.textContent = room.title;
    }

    if (roomDescription) {
        roomDescription.textContent = room.description;
    }

    if (roomItemsContainer) {
        roomItemsContainer.innerHTML = "";

        room.items.forEach(item => {
            const card = document.createElement("div");

            card.className = "room-item";
            card.id = `item-card-${item.id}`;

            card.innerHTML = `
                <div class="item-icon">${escapeHtml(item.icon)}</div>
                <h2>${escapeHtml(item.name)}</h2>
                <p>${escapeHtml(item.shortDesc)}</p>
                <button class="inspectButton"
                        data-item="${escapeHtml(item.id)}">
                    Inspect ${escapeHtml(
                        item.name.replace(/^The\s+/, "")
                    )}
                </button>
            `;

            roomItemsContainer.appendChild(card);
        });

        roomItemsContainer
            .querySelectorAll(".inspectButton")
            .forEach(button => {
                button.addEventListener("click", () => {
                    inspectItem(button.dataset.item, room);
                });
            });
    }

    if (clueTitle) {
        clueTitle.textContent = "Your Discoveries";
    }

    if (clueMessage) {
        clueMessage.textContent =
            "Inspect relics in this room to uncover hidden secrets.";
    }

    if (progressMessage) {
        progressMessage.textContent =
            `Clues discovered: 0 of ${room.items.length}.`;
    }

    if (puzzleButton) {
        puzzleButton.classList.add("hidden");
        puzzleButton.disabled = gameState.puzzleSolved;
    }

    if (puzzleEyebrow) {
        puzzleEyebrow.textContent =
            `CHAPTER ${room.chapterNumber} · THE CHALLENGE`;
    }

    if (puzzleHeading) {
        puzzleHeading.textContent = room.puzzleTitle;
    }

    if (puzzlePrompt) {
        puzzlePrompt.textContent = room.puzzleStory;
    }

    if (gameState.puzzleSolved) {
        if (progressMessage) {
            progressMessage.textContent =
                "You have already completed this chapter.";
        }

        if (clueMessage) {
            clueMessage.textContent =
                "This chapter is complete. Continue your adventure.";
        }
    }

    updateTopNav();
}


// CLUE DISCOVERY

function inspectItem(itemId, room) {
    const item = room.items.find(entry => entry.id === itemId);

    if (!item) return;

    if (clueTitle) {
        clueTitle.textContent = item.title;
    }

    if (clueMessage) {
        clueMessage.textContent = item.message;
    }

    gameState.discoveredClues[itemId] = true;

    const card = document.getElementById(`item-card-${itemId}`);

    if (card) {
        card.style.borderColor = "var(--gold)";
    }

    checkClueProgress(room);
}

function checkClueProgress(room) {
    const discoveredCount =
        Object.keys(gameState.discoveredClues).length;

    const totalCount = room.items.length;

    if (progressMessage) {
        progressMessage.textContent =
            `Clues discovered: ${discoveredCount} of ${totalCount}.`;
    }

    if (
        discoveredCount >= totalCount &&
        !gameState.puzzleSolved
    ) {
        gameState.puzzleUnlocked = true;

        if (progressMessage) {
            progressMessage.textContent =
                "All clues discovered! The challenge is unlocked.";
        }

        if (puzzleButton) {
            puzzleButton.classList.remove("hidden");
            puzzleButton.disabled = false;
        }

        showToast("All clues discovered! Challenge unlocked.");
    }
}


// BANANA API PUZZLE

async function loadPuzzle() {
    if (
        gameState.loadingPuzzle ||
        gameState.puzzleSolved
    ) {
        return;
    }

    if (!puzzleImage) {
        showToast("The puzzle image element is missing from the page.");
        return;
    }

    gameState.loadingPuzzle = true;
    gameState.currentPuzzleLoaded = false;

    if (puzzleLoading) {
        puzzleLoading.textContent =
            "Retrieving a challenge from the ancient Banana API...";
    }

    puzzleImage.classList.add("hidden");
    puzzleImage.removeAttribute("src");

    if (answerInput) {
        answerInput.value = "";
        answerInput.disabled = true;
    }

    if (submitAnswerButton) {
        submitAnswerButton.disabled = true;
    }

    if (answerFeedback) {
        answerFeedback.textContent = "";
        answerFeedback.style.color = "var(--gold)";
    }

    if (retryPuzzleButton) {
        retryPuzzleButton.classList.add("hidden");
    }

    try {
        const puzzle = await window.api.getBananaPuzzle();

        if (!puzzle || !puzzle.question) {
            throw new Error("Invalid puzzle received from server.");
        }

        // Register image handlers before assigning the image source.
        await new Promise((resolve, reject) => {
            puzzleImage.onload = () => resolve();

            puzzleImage.onerror = () => {
                reject(new Error("Unable to display the puzzle image."));
            };

            puzzleImage.src = puzzle.question;

            // Handle an image already cached by the browser.
            if (puzzleImage.complete && puzzleImage.naturalWidth > 0) {
                resolve();
            }
        });

        puzzleImage.classList.remove("hidden");
        gameState.currentPuzzleLoaded = true;

        if (puzzleLoading) {
            puzzleLoading.textContent =
                "Study the glyphs and find the missing digit.";
        }

        if (answerInput) {
            answerInput.disabled = false;
            answerInput.focus();
        }

        if (submitAnswerButton) {
            submitAnswerButton.disabled = false;
        }
    } catch (error) {
        console.error("Puzzle load failed:", error);

        if (puzzleLoading) {
            puzzleLoading.textContent =
                `Could not load puzzle. ${error.message}`;
        }

        if (retryPuzzleButton) {
            retryPuzzleButton.classList.remove("hidden");
        }
    } finally {
        gameState.loadingPuzzle = false;
    }
}

async function handleAnswerSubmission(event) {
    if (event) {
        event.preventDefault();
    }

    if (
        !gameState.currentPuzzleLoaded ||
        gameState.puzzleSolved ||
        gameState.checkingAnswer
    ) {
        return;
    }

    const answer = (answerInput?.value || "").trim();

    if (!answer) {
        if (answerFeedback) {
            answerFeedback.textContent = "Please enter your answer.";
        }

        return;
    }

    gameState.checkingAnswer = true;

    if (submitAnswerButton) {
        submitAnswerButton.disabled = true;
    }

    if (answerFeedback) {
        answerFeedback.textContent =
            "Consulting the library archive...";
    }

    try {
        const result = await window.api.checkBananaAnswer(answer);

        if (result.correct) {
            gameState.puzzleSolved = true;
            gameState.currentPuzzleLoaded = false;
            gameState.solvedPuzzles += 1;

            if (
                !gameState.completedLevels.includes(
                    gameState.currentLevel
                )
            ) {
                gameState.completedLevels.push(
                    gameState.currentLevel
                );
            }

            if (answerFeedback) {
                answerFeedback.style.color = "var(--green-success)";
                answerFeedback.textContent =
                    "Correct! The ancient mechanism unlocks.";
            }

            await savePlayerProgress();

            if (chapterTransitionTimer) {
                clearTimeout(chapterTransitionTimer);
            }

            chapterTransitionTimer = setTimeout(() => {
                handleChapterCompleted();
            }, 1200);
        } else {
            if (answerFeedback) {
                answerFeedback.style.color = "var(--red-alert)";
                answerFeedback.textContent =
                    result.message || "Incorrect answer. Try again!";
            }

            if (submitAnswerButton) {
                submitAnswerButton.disabled = false;
            }

            if (answerInput) {
                answerInput.focus();
                answerInput.select();
            }
        }
    } catch (error) {
        console.error("Answer check failed:", error);

        if (answerFeedback) {
            answerFeedback.style.color = "var(--red-alert)";
            answerFeedback.textContent =
                `Error checking answer: ${error.message}`;
        }

        if (submitAnswerButton) {
            submitAnswerButton.disabled = false;
        }
    } finally {
        gameState.checkingAnswer = false;
    }
}


// CHAPTER COMPLETION AND PROGRESSION

function handleChapterCompleted() {
    const currentRoom = getCurrentRoom();

    if (!currentRoom) {
        showToast("Could not find the completed chapter.");
        return;
    }

    const nextLevel = getNextChapterNumber();

    // All chapters have been completed.
    if (nextLevel === null) {
        if (victoryPlayerName) {
            const name = gameState.currentUser
                ? gameState.currentUser.name
                : "Adventurer";

            victoryPlayerName.textContent =
                `Honored Archivist: ${name}`;
        }

        if (victoryStats) {
            victoryStats.textContent =
                `Chapters Mastered: ${gameState.completedLevels.length} · ` +
                `Puzzles Deciphered: ${gameState.solvedPuzzles}`;
        }

        showScreen(victoryScreen);
        return;
    }

    const nextRoom = window.ROOMS[nextLevel];

    if (unlockedEyebrow) {
        unlockedEyebrow.textContent =
            `CHAPTER ${gameState.currentLevel} COMPLETED`;
    }

    if (unlockedTitle) {
        unlockedTitle.textContent =
            currentRoom.unlockMessage ||
            `Chapter ${nextLevel} Unlocked`;
    }

    if (unlockedText1) {
        unlockedText1.textContent =
            `Your discovery leads you to ${nextRoom.title}.`;
    }

    if (unlockedText2) {
        unlockedText2.textContent = nextRoom.storyGreeting;
    }

    if (unlockedQuestion) {
        unlockedQuestion.textContent =
            `Are you ready to enter Chapter ${nextLevel}?`;
    }

    if (advanceChapterButton) {
        advanceChapterButton.textContent =
            `Enter Chapter ${nextLevel}: ${nextRoom.title}`;
    }

    showScreen(nextChapterScreen);
}

async function advanceToNextChapter() {
    const nextLevel = getNextChapterNumber();

    if (nextLevel === null) {
        handleChapterCompleted();
        return;
    }

    // Change the chapter number before saving progress.
    gameState.currentLevel = nextLevel;

    renderRoom(nextLevel);

    await savePlayerProgress();

    // Display the new chapter's story.
    showScreen(storyScreen);
}


// EVENT LISTENERS

function setupEventListeners() {
    if (startButton) {
        startButton.addEventListener("click", () => {
            const chapters = getChapterNumbers();

            // If every chapter is completed, show the ending.
            const allCompleted =
                chapters.length > 0 &&
                chapters.every(level =>
                    gameState.completedLevels.includes(level)
                );

            if (allCompleted) {
                handleChapterCompleted();
                return;
            }

            // If the saved chapter is completed, offer the next one.
            if (
                gameState.completedLevels.includes(
                    gameState.currentLevel
                )
            ) {
                handleChapterCompleted();
                return;
            }

            renderRoom(gameState.currentLevel);
            showScreen(storyScreen);
        });
    }

    if (exploreButton) {
        exploreButton.addEventListener("click", () => {
            showScreen(explorationScreen);
        });
    }

    // FIX: Return to Story now handles completed chapters.
    if (backButton) {
        backButton.addEventListener("click", () => {
            if (
                gameState.completedLevels.includes(
                    gameState.currentLevel
                )
            ) {
                handleChapterCompleted();
            } else {
                showScreen(storyScreen);
            }
        });
    }

    if (puzzleButton) {
        puzzleButton.addEventListener("click", async () => {
            if (
                !gameState.puzzleUnlocked ||
                gameState.loadingPuzzle ||
                gameState.puzzleSolved
            ) {
                return;
            }

            showScreen(puzzleScreen);

            if (!gameState.currentPuzzleLoaded) {
                await loadPuzzle();
            }
        });
    }

    if (answerForm) {
        answerForm.addEventListener(
            "submit",
            handleAnswerSubmission
        );
    }

    if (retryPuzzleButton) {
        retryPuzzleButton.addEventListener("click", loadPuzzle);
    }

    if (returnToLibraryButton) {
        returnToLibraryButton.addEventListener("click", () => {
            showScreen(explorationScreen);
        });
    }

    if (returnFromChapterButton) {
        returnFromChapterButton.addEventListener("click", () => {
            if (
                gameState.completedLevels.includes(
                    gameState.currentLevel
                )
            ) {
                handleChapterCompleted();
            } else {
                showScreen(explorationScreen);
            }
        });
    }

    if (advanceChapterButton) {
        advanceChapterButton.addEventListener(
            "click",
            advanceToNextChapter
        );
    }

    if (playAgainButton) {
        playAgainButton.addEventListener("click", async () => {
            const confirmed = window.confirm(
                "Start a new adventure? This resets your saved progress."
            );

            if (!confirmed) return;

            gameState.currentLevel =
                getChapterNumbers()[0] || 1;

            gameState.completedLevels = [];
            gameState.solvedPuzzles = 0;
            gameState.discoveredClues = {};
            gameState.puzzleUnlocked = false;
            gameState.puzzleSolved = false;
            gameState.currentPuzzleLoaded = false;

            renderRoom(gameState.currentLevel);

            await savePlayerProgress();

            showScreen(welcomeScreen);
            showToast("A new adventure awaits!");
        });
    }
}


// INITIALIZATION

document.addEventListener("DOMContentLoaded", async () => {
    if (!window.ROOMS || !window.api) {
        console.error("Required game modules are missing.");
        showToast(
            "A game module failed to load. Check index.html scripts."
        );
        return;
    }

    gameState.currentUser = window.api.getCurrentUser();

    setupEventListeners();

    if (gameState.currentUser) {
        await loadPlayerProgress();
    }

    const chapters = getChapterNumbers();

    if (!window.ROOMS[gameState.currentLevel]) {
        gameState.currentLevel = chapters[0] || 1;
    }

    updateTopNav();

    // Show the victory screen if every chapter has been completed.
    const allChaptersCompleted =
        chapters.length > 0 &&
        chapters.every(level =>
            gameState.completedLevels.includes(level)
        );

    if (allChaptersCompleted) {
        handleChapterCompleted();
    } else {
        renderRoom(gameState.currentLevel);
        showScreen(welcomeScreen);
    }

    if (window.booksModule) {
        window.booksModule.init();
    }

    console.log("The Lost Library game engine initialized.");
});
