// ==========================================
// BANANAAPI-QUEST PUZZLE HISTORY
// Loads real history from MongoDB
// ==========================================

const API_URL = "http://localhost:5000/api/banana";

document.addEventListener("DOMContentLoaded", async function () {

    const attemptedCount = document.getElementById("attemptedCount");
    const solvedCount = document.getElementById("historySolvedCount");
    const pointsCount = document.getElementById("historyPoints");

    const historyTableBody = document.getElementById("historyTableBody");
    const emptyHistory = document.getElementById("emptyHistory");
    const historyMessage = document.getElementById("historyMessage");

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/history`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Unable to load puzzle history."
            );
        }

        const stats = data.stats || {};
        const history = data.history || [];

        // Display statistics
        attemptedCount.textContent = stats.totalAttempts ?? 0;
        solvedCount.textContent = stats.solvedPuzzles ?? 0;
        pointsCount.textContent = stats.totalPoints ?? 0;

        // Clear previous records
        historyTableBody.innerHTML = "";

        historyMessage.textContent = "";

        // Show empty state if there is no history
        if (history.length === 0) {
            emptyHistory.style.display = "block";
            return;
        }

        emptyHistory.style.display = "none";

        // Display puzzle history
        history.forEach((item, index) => {

            const row = document.createElement("tr");

            const attemptCell = document.createElement("td");
            attemptCell.textContent = index + 1;

            const answerCell = document.createElement("td");
            answerCell.textContent = item.submittedAnswer ?? "-";

            const resultCell = document.createElement("td");
            resultCell.textContent = item.isCorrect
                ? "✅ Correct"
                : "❌ Incorrect";

            const pointsCell = document.createElement("td");
            pointsCell.textContent = `${item.pointsEarned ?? 0} ⭐`;

            const dateCell = document.createElement("td");

            dateCell.textContent = item.attemptedAt
                ? new Date(item.attemptedAt).toLocaleString()
                : "Unknown";

            row.appendChild(attemptCell);
            row.appendChild(answerCell);
            row.appendChild(resultCell);
            row.appendChild(pointsCell);
            row.appendChild(dateCell);

            historyTableBody.appendChild(row);
        });

    } catch (error) {

        console.error("Puzzle history error:", error);

        emptyHistory.style.display = "none";

        historyMessage.textContent = error.message;
    }
});
