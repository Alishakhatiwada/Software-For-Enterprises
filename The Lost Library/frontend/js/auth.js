
const API_BASE_URL = "http://localhost:5000/api";

// REGISTER
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;
        const message = document.getElementById("registerMessage");
        const button = document.getElementById("registerButton");

        message.textContent = "";
        button.disabled = true;
        button.textContent = "Creating account...";

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Registration failed.");
            }

            message.textContent =
                "Account created! Taking you to login...";

            registerForm.reset();

            window.setTimeout(function () {
                window.location.href = "login.html";
            }, 1000);

        } catch (error) {
            message.textContent =
                error.message === "Failed to fetch"
                    ? "Cannot connect to the backend. Check that your server is running."
                    : error.message;

        } finally {
            button.disabled = false;
            button.textContent = "Create My Account";
        }
    });
}

// LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;
        const message = document.getElementById("loginMessage");
        const button = document.getElementById("loginButton");

        message.textContent = "";
        button.disabled = true;
        button.textContent = "Opening the library...";

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Login failed.");
            }

            // Keep the token for authenticated API requests.
            // This is a prototype approach; localStorage is
            // accessible to JavaScript and is not suitable for
            // protecting tokens against XSS attacks.
            localStorage.setItem("lostLibraryToken", data.token);
            localStorage.setItem(
                "lostLibraryUser",
                JSON.stringify(data.user)
            );

            message.textContent = "Login successful! Welcome back.";

            window.setTimeout(function () {
                window.location.href = "index.html";
            }, 800);

        } catch (error) {
            message.textContent =
                error.message === "Failed to fetch"
                    ? "Cannot connect to the backend. Check that your server is running."
                    : error.message;

        } finally {
            button.disabled = false;
            button.textContent = "Enter the Library";
        }
    });
}
