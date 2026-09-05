function makeRequest(request) {

    const speech = new SpeechSynthesisUtterance(request);
    speech.rate = 0.9;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);

    let logs = JSON.parse(localStorage.getItem("setuLogs")) || [];

    const newLog = {
        request: request,
        time: new Date().toLocaleTimeString()
    };

    logs.push(newLog);

    localStorage.setItem("setuLogs", JSON.stringify(logs));

    console.log("Request logged:", newLog);
}
