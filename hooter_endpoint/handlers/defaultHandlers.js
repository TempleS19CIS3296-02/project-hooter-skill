const WELCOME_MESSAGE = "Welcome to Hooter Skill, how can I help you";
const HELP_MESSAGE = "You can ask for building's hours or lastes news. Try saying when does tech center open.";
const HELP_REPROMPT = "What can I help you with?";
const STOP_MESSAGE = "Go Owl!";

//default handler functions for an Alexa skill
const defaultHandlers = {
    "LaunchRequest": function () {
        const speechOutput = WELCOME_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(":responseReady");
    },
    "AMAZON.HelpIntent": function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(":responseReady");
    },
    "AMAZON.CancelIntent": function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(":responseReady");
    },
    "AMAZON.StopIntent": function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(":responseReady");
    }
};

module.exports = defaultHandlers;

