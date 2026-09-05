function makeRequest(request) {

    // Speak the request
    const speech = new SpeechSynthesisUtterance(request);
    speech.rate = 0.9;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);

    // Get existing logs
    let logs = JSON.parse(localStorage.getItem("setuLogs")) || [];

    // Create a new log
    const newLog = {
        request: request,
        time: new Date().toLocaleTimeString()
    };

    // Add the new request
    logs.push(newLog);

    // Save the updated logs
    localStorage.setItem("setuLogs", JSON.stringify(logs));

    console.log("Request logged:", newLog);
}
