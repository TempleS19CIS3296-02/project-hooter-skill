"use strict";

//Main handler
const directionsLookUpHandler = {
    "DirectionsLookUpIntent": async function () {
        var speechOutput = "";
        speechOutput = "TTN intent";
        this.response.speak(speechOutput);
        this.emit(":responseReady");
    }
}