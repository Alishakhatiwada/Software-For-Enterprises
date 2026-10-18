
async function testProgress() {
    try {
        const response = await fetch(
            "http://localhost:5000/api/progress",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    playerName: "Alisha",
                    currentLevel: 1,
                    solvedPuzzles: 2,
                    completedLevels: []
                })
            }
        );

        const data = await response.json();

        console.log(data);
    } catch (error) {
        console.error("Test failed:", error.message);
    }
}

testProgress();
