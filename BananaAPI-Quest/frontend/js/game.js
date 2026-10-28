
const puzzleImage = document.getElementById("puzzleImage");
const answerInput = document.getElementById("answerInput");
const submitButton = document.getElementById("submitAnswer");
const nextButton = document.getElementById("nextPuzzle");
const message = document.getElementById("gameMessage");

let currentPuzzleId = null;

async function loadPuzzle() {
    try {
        message.textContent = "Loading a new puzzle...";
        puzzleImage.style.display = "none";
        submitButton.disabled = true;
        nextButton.disabled = true;

        const response = await fetch(
            "http://localhost:5000/api/banana/puzzle"
        );

        const data = await response.json();

        if (!response.ok || !data.success || !data.puzzle) {
            throw new Error(data.message || "Could not load the puzzle.");
        }

        currentPuzzleId = data.puzzle.puzzleId;
        puzzleImage.src = data.puzzle.question;

        puzzleImage.onload = function () {
            puzzleImage.style.display = "block";
        };

        puzzleImage.onerror = function () {
            message.textContent = "The puzzle image could not be displayed.";
        };

        message.textContent = "Solve the puzzle and enter your answer.";
        answerInput.value = "";
        submitButton.disabled = false;
        nextButton.disabled = true;

    } catch (error) {
        console.error("Puzzle loading error:", error);
        message.textContent =
            "Could not load the puzzle. Check that your backend is running.";
    }
}

submitButton.addEventListener("click", async function () {
    const answer = answerInput.value.trim();

    if (!answer) {
        message.textContent = "Please enter your answer first.";
        return;
    }

    if (!currentPuzzleId) {
        message.textContent = "Please load a puzzle first.";
        return;
    }

    try {
        submitButton.disabled = true;
        message.textContent = "Checking your answer...";

        const response = await fetch(
            "http://localhost:5000/api/banana/answer",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    answer,
                    puzzleId: currentPuzzleId
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not check the answer.");
        }

        if (data.correct === true || data.isCorrect === true ||
            data.success === true && data.correct !== false) {
            message.textContent = "Correct! Well done! 🎉";
            nextButton.disabled = false;
        } else {
            message.textContent = "Not quite! Try again.";
            submitButton.disabled = false;
        }

    } catch (error) {
        console.error("Answer checking error:", error);
        message.textContent =
            error.message || "Could not check your answer.";
        submitButton.disabled = false;
    }
});

nextButton.addEventListener("click", loadPuzzle);

loadPuzzle();
