const form = document.querySelector(".form");
const button = document.getElementById("start-button");
const timer = document.querySelector(".timer");
const input = document.querySelector(".time-input");
const countdown = document.getElementById("countdown");
let countdownInterval = null;

document.addEventListener("DOMContentLoaded", () => {

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

        form.style.display = "block";
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
    chrome.storage.sync.get(["timerEndTime","countdown"]).then((result) => {
        if (!result.timerEndTime && !result.countdown) {
            return;
        }

        const countdown = document.getElementById("countdown");
        const remaining = result.timerEndTime - Date.now();
        if (remaining <= 0) {
            clearInterval(countdownInterval);
            countdown.innerHTML = "0:00 remaining";
            return;
        }

        updateProgressBar(remaining, result.countdown);
    });
}

function updateProgressBar(remaining, countdownTotalInMinutes) {
    const remainingSeconds = Math.ceil(remaining / 1000);
    const countdownMinutes = Math.floor(remainingSeconds / 60);
    const countdownSeconds = remainingSeconds % 60;
    countdown.innerHTML =`${countdownMinutes}:${countdownSeconds.toString().padStart(2, "0")}`;

    const progress = document.querySelector(".progress");
    const totalDuration = countdownTotalInMinutes * 60 * 1000;
    const progressPercent = ((totalDuration - remaining) / totalDuration) * 100;
    progress.style.width = `${progressPercent}%`;
}
