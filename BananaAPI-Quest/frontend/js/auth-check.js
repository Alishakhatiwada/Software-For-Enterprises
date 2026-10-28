
const token = localStorage.getItem("token");

if (!token) {
    // The player is not logged in.
    window.location.href = "login.html";
}
