const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
} else {
    document.addEventListener("DOMContentLoaded", function () {
        const logoutButton = document.getElementById("logoutButton");

        if (logoutButton) {
            logoutButton.addEventListener("click", function () {
                localStorage.removeItem("token");

                window.location.href = "login.html";
            });
        }
    });
}