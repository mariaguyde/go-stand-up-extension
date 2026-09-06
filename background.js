const myAlarmName = "timer";

chrome.runtime.onMessage.addListener((message) => { // start of the timer
  if (message.action === "startTimer") {
    chrome.alarms.get(myAlarmName).then((alarm) => {
      if (alarm) {
        return;
      }

      chrome.alarms.create(myAlarmName, {delayInMinutes: message.intervalUser});
      chrome.storage.sync.set({timerActive: true});
      chrome.storage.sync.set({timerEndTime: Date.now() + message.intervalUser * 60 * 1000});
    });
  }
});

chrome.alarms.onAlarm.addListener((alarm) => { // end of the timer
  if (alarm.name !== myAlarmName) {
    return;
  }

  chrome.alarms.clear(myAlarmName);
  chrome.storage.sync.set({timerActive: false});
  chrome.storage.sync.remove("timerEndTime");

  chrome.runtime.sendMessage({action: "showMessage"})
  .catch(() => {console.log("No popup open to send message to.")});

  chrome.windows.create({
    url: chrome.runtime.getURL("reminder/reminder.html"),
    type: "popup",
    width: 400,
    height: 300
  });
});