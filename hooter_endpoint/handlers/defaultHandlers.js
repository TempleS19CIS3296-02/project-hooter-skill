const WELCOME_MESSAGE = "Welcome to Hooter Skill, how can I help you";
const HELP_MESSAGE =
  "You can ask for Temple building's hours, upcoming events, and direction. Try saying, when does tech center open or, what are some upcoming events. You can also say when is study days.";
const HELP_REPROMPT = "What can I help you with?";
const ERROR_MESSAGE =
  "I didn't understand. If you want to quit, just say goodbye. How can I help you?";
const STOP_MESSAGE = "Go Owl!";

//default handler functions for an Alexa skill
const defaultHandlers = {
  LaunchRequest: function() {
    const speechOutput = WELCOME_MESSAGE;
    const reprompt = HELP_REPROMPT;

    this.response.speak(speechOutput).listen(reprompt);
    this.emit(":responseReady");
  },
  "AMAZON.HelpIntent": function() {
    const speechOutput = HELP_MESSAGE;
    const reprompt = HELP_REPROMPT;

    this.response.speak(speechOutput).listen(reprompt);
    this.emit(":responseReady");
  },
  "AMAZON.CancelIntent": function() {
    this.response.speak(STOP_MESSAGE);
    this.emit(":responseReady");
  },
  "AMAZON.StopIntent": function() {
    this.emit(":tell", STOP_MESSAGE);
  },
  Unhandled: function() {
    const speechOutput = ERROR_MESSAGE;
    const reprompt = HELP_REPROMPT;

    this.response.speak(speechOutput).listen(reprompt);
    this.emit(":responseReady");
  }
};

module.exports = defaultHandlers;
