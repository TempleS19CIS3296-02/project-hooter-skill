"use strict";
var { google } = require("googleapis");
var key = require("../HooterSkill-5fde0850cf41.json"); // private json
const reprompt = "What can I help you with?";
var AmazonSpeech = require("ssml-builder/amazon_speech");
var imageObj = {
  smallImageUrl: "https://i.imgur.com/0lpxVh6.png", //108x108
  largeImageUrl: "https://i.imgur.com/QIq2lcs.png" //240x240
};

const eventsLookUpHandler = {
  EventsLookUpIntent: async function() {
    var scopes = ["https://www.googleapis.com/auth/calendar.readonly"];
    var jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      scopes,
      null
    );

    jwtClient.authorize();
    var auth = jwtClient;
    //---------------------SLOT VALUES HANDLE BEGINS----------------------------------------
    if (this.event.request.intent.slots.dateoftheweek.value) {
      //get date
      var userinputdate = this.event.request.intent.slots.dateoftheweek.value;
    } else {
      var userinputdate = new Date();
    }
    if (this.event.request.intent.slots.eventamount.value) {
      //get number of event
      var eventamount = this.event.request.intent.slots.eventamount.value;
    } else {
      var eventamount = 5;
    }
    if (this.event.request.intent.slots.eventname.value) {
      //get name of event
      var eventname = this.event.request.intent.slots.eventname.value;
      eventamount = 1;
    } else {
      var eventname = "";
    }
    //---------------------SLOT VALUES HANDLE ENDS----------------------------------------
    const calendar = google.calendar({ version: "v3", auth });
    calendar.events.list(
      {
        calendarId: "hooterstella@gmail.com",
        timeMin: new Date(userinputdate).toISOString(),
        maxResults: eventamount,
        singleEvents: true,
        orderBy: "startTime",
        q: eventname
      },
      (err, res) => {
        var speechOutput = "";
        var oneDay = 24 * 60 * 60 * 1000;
        if (err) return console.log("The API returned an error: " + err);
        const events = res.data.items;
        if (events.length) {
          events.map((event, i) => {
            const start = new Date(event.start.dateTime || event.start.date);
            const end = new Date(event.end.dateTime || event.end.date);
            var diffDays = Math.round(
              Math.abs((start.getTime() - new Date().getTime()) / oneDay)
            );
            var startDate =
              (start.getMonth() + 1).toString() +
              "/" +
              start.getDate() +
              "/" +
              start.getFullYear();
            speechOutput += `Event ${i + 1} on ${startDate}: ${
              event.summary
            } (${diffDays} days left) `;
          });
        } else {
          speechOutput +=
            "I can't find the event " + eventname + ". Please try again!";
        }
        this.emit(":tellWithCard", speechOutput);
        this.emit(":responseReady");

        // this.emit(":tellWithCard", speechOutput, cardTitle, cardContent, imageObj);
      }
    );
  }
};

module.exports = eventsLookUpHandler;
