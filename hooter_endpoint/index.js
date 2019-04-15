"use strict";
const Alexa = require("alexa-sdk");

//=========================================================================================================================================
//TODO: The items below this comment need attention.
//=========================================================================================================================================
const APP_ID = "amzn1.ask.skill.e896779a-a041-473e-9834-95af9e94d2f4";

//=========================================================================================================================================
//Editing anything below this line might break your skill.
//=========================================================================================================================================


// const newSession = require("./handlers/newSession"); // used for testing
const defaultHandlers = require("./handlers/defaultHandlers.js");
const hoursLookUpHandler = require("./handlers/hoursLookUpHandler.js");
const distanceLookUpHandler = require("./handlers/distanceLookUpHandler.js");
const eventsLookUpHandler = require("./handlers/eventsLookUpHandler.js");
const canvasToDoHandler = require("./handlers/canvasToDoHandler.js");

// canvasToDoHandler.CanvasToDoIntent();

exports.handler = function (event, context, callback) {
  const alexa = Alexa.handler(event, context, callback);
  alexa.APP_ID = APP_ID;
  alexa.registerHandlers(
    defaultHandlers,
    hoursLookUpHandler,
    distanceLookUpHandler,
    eventsLookUpHandler,
    canvasToDoHandler
  );
  alexa.execute();
};
