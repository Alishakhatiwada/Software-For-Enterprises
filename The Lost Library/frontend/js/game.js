
const startButton = document.getElementById("startButton");
const message = document.getElementById("message");

startButton.addEventListener("click", function () {
    message.textContent =
        "Your journey begins... The library awaits you.";
});
