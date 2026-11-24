
// Partly generated with AI assistance, reviewed and modified by me.

const registerForm = document.getElementById("registerForm");
const message = document.getElementById("message");

registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword =
        document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        message.textContent = "Passwords do not match.";
        return;
    }

    if (password.length < 8) {
        message.textContent =
            "Password must contain at least 8 characters.";
        return;
    }

    try {
        message.textContent = "Creating your account...";

        const apiBaseUrl = window.APP_CONFIG?.API_BASE_URL || "http://localhost:5000/api";
        const response = await fetch(
            `${apiBaseUrl}/auth/register`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            message.textContent =
                data.message || "Registration failed.";
            return;
        }

        message.textContent =
            "Account created successfully! Redirecting to login...";

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1200);

    } catch (error) {
        console.error("Registration error:", error);

        message.textContent =
            "Could not connect to the server. Please try again.";
    }
});
