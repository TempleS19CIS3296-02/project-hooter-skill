"use strict";
const Alexa = require("alexa-sdk");
const REPROMPT = "What can I help you with?";
var cardTitle = "Emergency Service:";
var cardContent = "";
var imageObj = {
  smallImageUrl: "https://i.imgur.com/0lpxVh6.png", //108x108
  largeImageUrl: "https://i.imgur.com/QIq2lcs.png" //240x240
};

const emergencyHandler = {
  EmergencyIntent: function() {
    var speechOutput =
      "Emergency line for main, ambler, and HSC campuses is (215)-204-1234. If it's urgent, please call 911.";
    cardContent = speechOutput;
    this.emit(
      ":askWithCard",
      speechOutput,
      reprompt,
      cardTitle,
      cardContent,
      imageObj
    );
    this.emit(":responseReady");
  }
};

module.exports = emergencyHandler;
