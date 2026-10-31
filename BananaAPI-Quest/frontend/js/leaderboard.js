
// ==========================================
// BANANAAPI-QUEST LEADERBOARD
// Loads real player data from MongoDB
// ==========================================

const API_URL = "http://localhost:5000/api/banana";

document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("token");

    const leaderboardBody =
        document.getElementById("leaderboardBody");

    const leaderboardMessage =
        document.getElementById("leaderboardMessage");

    const myRank =
        document.getElementById("myRank");

    const myPoints =
        document.getElementById("myPoints");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        // Fetch leaderboard from MongoDB
        const response = await fetch(`${API_URL}/leaderboard`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Unable to load leaderboard."
            );
        }

        const players = data.leaderboard || [];

        if (leaderboardBody) {
            leaderboardBody.innerHTML = "";
        }

        if (leaderboardMessage) {
            leaderboardMessage.textContent = "";
        }

        // Display top three players
        displayTopPlayers(players);

        // Display all players
        displayLeaderboard(players);

        // Display logged-in user's actual rank and points
        await displayMyRanking(players, myRank, myPoints, token);

        if (players.length === 0 && leaderboardMessage) {
            leaderboardMessage.textContent =
                "No players have completed a puzzle yet. Be the first!";
        }

    } catch (error) {
        console.error("Leaderboard error:", error);

        if (leaderboardBody) {
            leaderboardBody.innerHTML = "";
        }

        if (leaderboardMessage) {
            leaderboardMessage.textContent = error.message;
        }
    }
});


// ==========================================
// GET CURRENT USER ID FROM JWT
// ==========================================

function getCurrentUserId(token) {
    const payload = token.split(".")[1];

    if (!payload) {
        throw new Error("Invalid login token.");
    }

    const base64 = payload
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const paddedBase64 = base64.padEnd(
        Math.ceil(base64.length / 4) * 4,
        "="
    );

    const decodedPayload = JSON.parse(atob(paddedBase64));

    return decodedPayload.userId;
}


// ==========================================
// DISPLAY TOP THREE PLAYERS
// ==========================================

function displayTopPlayers(players) {
    const firstName = document.getElementById("firstName");
    const firstPoints = document.getElementById("firstPoints");

    const secondName = document.getElementById("secondName");
    const secondPoints = document.getElementById("secondPoints");

    const thirdName = document.getElementById("thirdName");
    const thirdPoints = document.getElementById("thirdPoints");

    const topPlayers = [
        { name: firstName, points: firstPoints },
        { name: secondName, points: secondPoints },
        { name: thirdName, points: thirdPoints }
    ];

    topPlayers.forEach((element, index) => {
        const player = players[index];

        if (player) {
            if (element.name) {
                element.name.textContent = player.name;
            }

            if (element.points) {
                element.points.textContent =
                    `${player.totalPoints} Points`;
            }
        } else {
            if (element.name) {
                element.name.textContent = "—";
            }

            if (element.points) {
                element.points.textContent = "0 Points";
            }
        }
    });
}


// ==========================================
// DISPLAY ALL PLAYERS
// ==========================================

function displayLeaderboard(players) {
    const leaderboardBody =
        document.getElementById("leaderboardBody");

    if (!leaderboardBody) return;

    leaderboardBody.innerHTML = "";

    players.forEach(player => {
        const row = document.createElement("tr");

        const rankCell = document.createElement("td");
        rankCell.textContent = `#${player.rank}`;

        const nameCell = document.createElement("td");
        nameCell.textContent = player.name;

        const solvedCell = document.createElement("td");
        solvedCell.textContent = player.solvedPuzzles;

        const pointsCell = document.createElement("td");
        pointsCell.textContent = `${player.totalPoints} ⭐`;

        row.appendChild(rankCell);
        row.appendChild(nameCell);
        row.appendChild(solvedCell);
        row.appendChild(pointsCell);

        leaderboardBody.appendChild(row);
    });
}


// ==========================================
// DISPLAY CURRENT USER'S RANK AND POINTS
// ==========================================

async function displayMyRanking(players, myRank, myPoints, token) {
    try {
        // Identify the logged-in user
        const currentUserId = getCurrentUserId(token);

        // Find the user in the leaderboard
        const currentPlayer = players.find(
            player => String(player.userId) === String(currentUserId)
        );

        // Fetch the user's saved points
        const response = await fetch(`${API_URL}/history`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Unable to load your points."
            );
        }

        // Display actual leaderboard rank
        if (myRank) {
            myRank.textContent = currentPlayer
                ? `#${currentPlayer.rank}`
                : "Not in Top 100";
        }

        // Display actual points from MongoDB
        if (myPoints) {
            myPoints.textContent =
                data.stats?.totalPoints ?? 0;
        }

    } catch (error) {
        console.error("Personal ranking error:", error);

        if (myRank) {
            myRank.textContent = "—";
        }

        if (myPoints) {
            myPoints.textContent = "—";
        }
    }
}
