/* =====================================================
   SETU
   Patient Communication + Caregiver Dashboard
   ===================================================== */


/* ================= SETTINGS ================= */

const ALERT_RULES = {

    Pain: {
        threshold: 2,
        windowMinutes: 5
    },

    Help: {
        threshold: 2,
        windowMinutes: 5
    },

    Water: {
        threshold: 3,
        windowMinutes: 10
    }

};


/* ================= STORAGE ================= */

function getLogs() {

    return JSON.parse(
        localStorage.getItem("setuLogs")
    ) || [];

}


function saveLogs(logs) {

    localStorage.setItem(
        "setuLogs",
        JSON.stringify(logs)
    );

}


/* ================= PATIENT REQUEST ================= */

function makeRequest(request) {

    const now = new Date();

    /* Text-to-speech */

    const speech =
        new SpeechSynthesisUtterance(request);

    speech.rate = 0.9;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);


    /* Create communication log */

    const newLog = {

        id: Date.now(),

        request: request,

        timestamp: now.toISOString(),

        time: now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        })

    };


    /* Get old logs */

    const logs = getLogs();


    /* Add newest request */

    logs.push(newLog);


    /* Save */

    saveLogs(logs);


    /* Update patient screen */

    const lastRequest =
        document.getElementById("lastRequest");

    if (lastRequest) {

        lastRequest.textContent =
            request + " ✓";

    }


    /* Check pattern */

    detectPattern(request);


    /* Update caregiver dashboard */

    updateDashboard();


    console.log(
        "Setu request logged:",
        newLog
    );

}


/* ================= PATTERN DETECTION ================= */

function detectPattern(request) {

    const rule = ALERT_RULES[request];

    if (!rule) {
        return;
    }


    const logs = getLogs();

    const now = Date.now();

    const windowMilliseconds =
        rule.windowMinutes * 60 * 1000;


    /* Find recent requests of the same type */

    const recentRequests = logs.filter(log => {

        return (
            log.request === request &&
            now - new Date(log.timestamp).getTime()
                <= windowMilliseconds
        );

    });


    /* Threshold reached */

    if (recentRequests.length >= rule.threshold) {

        createAlert(
            request,
            recentRequests.length,
            rule.windowMinutes
        );

    }

}


/* ================= CREATE ALERT ================= */

function createAlert(
    request,
    count,
    minutes
) {

    const existingAlert =
        JSON.parse(
            localStorage.getItem("setuAlert")
        );


    /*
       Prevent the same alert from appearing
       repeatedly for every tap.
    */

    if (
        existingAlert &&
        existingAlert.request === request &&
        !existingAlert.acknowledged
    ) {

        return;

    }


    const alert = {

        request: request,

        count: count,

        minutes: minutes,

        time: new Date().toLocaleTimeString(),

        acknowledged: false

    };


    localStorage.setItem(
        "setuAlert",
        JSON.stringify(alert)
    );


    showAlert(alert);

}


/* ================= SHOW ALERT ================= */

function showAlert(alert) {

    const alertBox =
        document.getElementById("alertBox");

    const alertMessage =
        document.getElementById("alertMessage");


    if (!alertBox || !alertMessage) {
        return;
    }


    alertMessage.textContent =
        `${alert.request} was requested ${alert.count} times within ${alert.minutes} minutes.`;


    alertBox.classList.remove("hidden");

}


/* ================= ACKNOWLEDGE ALERT ================= */

function acknowledgeAlert() {

    const alert =
        JSON.parse(
            localStorage.getItem("setuAlert")
        );


    if (!alert) {
        return;
    }


    alert.acknowledged = true;


    localStorage.setItem(
        "setuAlert",
        JSON.stringify(alert)
    );


    const alertBox =
        document.getElementById("alertBox");


    if (alertBox) {

        alertBox.classList.add("hidden");

    }

}


/* ================= PATIENT VIEW ================= */

function showPatient() {

    document
        .getElementById("patientView")
        .classList.remove("hidden");

    document
        .getElementById("caregiverView")
        .classList.add("hidden");


    document
        .getElementById("patientTab")
        .classList.add("active");

    document
        .getElementById("caregiverTab")
        .classList.remove("active");

}


/* ================= CAREGIVER VIEW ================= */

function showCaregiver() {

    document
        .getElementById("patientView")
        .classList.add("hidden");

    document
        .getElementById("caregiverView")
        .classList.remove("hidden");


    document
        .getElementById("patientTab")
        .classList.remove("active");

    document
        .getElementById("caregiverTab")
        .classList.add("active");


    updateDashboard();


    /* Show existing alert */

    const alert =
        JSON.parse(
            localStorage.getItem("setuAlert")
        );


    if (
        alert &&
        !alert.acknowledged
    ) {

        showAlert(alert);

    }

}


/* ================= DASHBOARD ================= */

function updateDashboard() {

    const logs = getLogs();


    /* Total */

    const total =
        document.getElementById("totalRequests");

    if (total) {

        total.textContent =
            logs.length;

    }


    /* Pain requests */

    const painCount =
        logs.filter(
            log => log.request === "Pain"
        ).length;


    const pain =
        document.getElementById("painRequests");

    if (pain) {

        pain.textContent =
            painCount;

    }


    /* Latest request */

    const latest =
        document.getElementById("lastRequestTime");


    if (latest && logs.length > 0) {

        latest.textContent =
            logs[logs.length - 1].time;

    }


    renderHistory();

}


/* ================= HISTORY ================= */

function renderHistory() {

    const historyList =
        document.getElementById("historyList");


    if (!historyList) {
        return;
    }


    const logs = getLogs();


    if (logs.length === 0) {

        historyList.innerHTML =
            `<div class="empty">
                No communication history yet.
             </div>`;

        return;

    }


    /* Newest first */

    const reversedLogs =
        [...logs].reverse();


    historyList.innerHTML =
        reversedLogs.map(log => {

            return `
                <div class="history-item">

                    <div class="request-info">

                        <span class="request-icon">
                            ${getIcon(log.request)}
                        </span>

                        <div>

                            <div class="request-name">
                                ${log.request}
                            </div>

                            <div class="request-time">
                                ${formatDate(log.timestamp)}
                            </div>

                        </div>

                    </div>

                    <span>
                        ${log.time}
                    </span>

                </div>
            `;

        }).join("");

}


/* ================= ICONS ================= */

function getIcon(request) {

    const icons = {

        Water: "💧",

        Pain: "❤️‍🩹",

        Bathroom: "🚻",

        Food: "🍽️",

        Company: "👋",

        Help: "🆘"

    };

    return icons[request] || "💬";

}


/* ================= DATE FORMAT ================= */

function formatDate(timestamp) {

    const date =
        new Date(timestamp);


    return date.toLocaleDateString(
        [],
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* ================= CLEAR HISTORY ================= */

function clearHistory() {

    const confirmClear =
        confirm(
            "Clear the communication history?"
        );


    if (!confirmClear) {
        return;
    }


    localStorage.removeItem(
        "setuLogs"
    );

    localStorage.removeItem(
        "setuAlert"
    );


    updateDashboard();


    const lastRequest =
        document.getElementById("lastRequest");


    if (lastRequest) {

        lastRequest.textContent =
            "Nothing yet";

    }

}


/* ================= STARTUP ================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        showPatient();

        updateDashboard();

    }
);
