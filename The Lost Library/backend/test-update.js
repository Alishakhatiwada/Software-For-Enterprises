
async function testUpdate() {
    try {
        const response = await fetch(
            "http://localhost:5000/api/progress/Alisha",
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    currentLevel: 2,
                    solvedPuzzles: 5,
                    completedLevels: [1]
                })
            }
        );

        const data = await response.json();

        console.log("HTTP Status:", response.status);
        console.log(JSON.stringify(data, null, 2));

        if (!response.ok) {
            console.error("The update request failed.");
            return;
        }

        console.log("Player progress updated successfully!");
    } catch (error) {
        console.error("Test failed:", error.message);
    }
}

testUpdate();
