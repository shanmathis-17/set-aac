function makeRequest(request) {
    alert("Request: " + request);

    const speech = new SpeechSynthesisUtterance(request);
    speech.rate = 0.9;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
}
