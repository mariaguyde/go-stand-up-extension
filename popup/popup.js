const form = document.querySelector(".form");
const button = document.getElementById("start-button");
const timer = document.querySelector(".timer");
const input = document.querySelector(".time-input");
const countdown = document.getElementById("countdown");
let countdownInterval = null;

document.addEventListener("DOMContentLoaded", () => {

    //TODO UI

    handlerStartTimer();

    chrome.alarms.get("timer").then((alarm) => { // display the right screen when popup is opened
        if (alarm) {
            form.style.display = "none";
            timer.style.display = "block";
            startCountdown();
        } else {
            form.style.display = "block";
            timer.style.display = "none";
        }
    });

    chrome.runtime.onMessage.addListener((data) => { // handling the end of the timer

        if (data.action !== "showMessage") {
            return;
        }

        if (countdownInterval) {
            clearInterval(countdownInterval);
        }

        form.style.display = "none";
        timer.style.display = "none";
    });
});

function handlerStartTimer() { 
    button.addEventListener("click", () => {
        const intervalUser = parseFloat(input.value);
        if (!intervalUser || intervalUser < 0) {
            alert("Please enter a valid time.");
            return;
        }

        chrome.runtime.sendMessage({action: "startTimer",intervalUser: intervalUser});

        form.style.display = "none";
        timer.style.display = "block";
        startCountdown();
    });
}

function startCountdown() {
    updateCountdown();
    countdownInterval = setInterval(() => {
        updateCountdown();
    }, 1000);
}

function updateCountdown() {
    chrome.storage.sync.get("timerEndTime").then((result) => {
        if (!result.timerEndTime) {
            return;
        }

        const countdown = document.getElementById("countdown");
        const remaining = result.timerEndTime - Date.now();
        if (remaining <= 0) {
            clearInterval(countdownInterval);
            countdown.innerHTML = "0:00 remaining";
            return;
        }

        const totalSeconds = Math.ceil(remaining / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        countdown.innerHTML =`${minutes}:${seconds.toString().padStart(2, "0")} remaining`;
    });
}
