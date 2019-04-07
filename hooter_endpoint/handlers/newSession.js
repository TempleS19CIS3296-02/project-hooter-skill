const WELCOME_MESSAGE = "Welcome to Hooter TESTING Skill, how can I help you";
const HELP_REPROMPT = "What can I help you with?";

const newSession = {
    "LaunchRequest": function () {
        const speechOutput = WELCOME_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(":responseReady");
    }
}

module.exports = newSession;