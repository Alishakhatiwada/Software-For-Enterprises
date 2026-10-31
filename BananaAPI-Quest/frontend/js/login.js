
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const loginButton = document.getElementById("loginButton");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
        loginButton.disabled = true;
        loginMessage.textContent = "Logging in...";

        const response = await fetch(
            "http://localhost:5000/api/auth/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            loginMessage.textContent =
                data.message || "Login failed. Please try again.";
            return;
        }

        if (!data.token || !data.user) {
            loginMessage.textContent =
                "Login response is missing user or authentication information.";
            return;
        }

        // Save the authentication token.
        localStorage.setItem("token", data.token);

        // Save the logged-in user's information.
        localStorage.setItem("user", JSON.stringify(data.user));

        loginMessage.textContent =
            "Login successful! Starting your game...";

        window.location.href = "game.html";

    } catch (error) {
        console.error("Login error:", error);

        loginMessage.textContent =
            "Could not connect to the server. Please try again.";

    } finally {
        loginButton.disabled = false;
    }
});
