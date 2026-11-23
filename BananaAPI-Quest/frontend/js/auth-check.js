const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
} else {
    document.addEventListener("DOMContentLoaded", function () {
        const logoutButton = document.getElementById("logoutButton");

        if (logoutButton) {
            logoutButton.addEventListener("click", function () {
                // Remove saved authentication information.
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                // Redirect to login.
                window.location.href = "login.html";
            });
        }
    });
}
