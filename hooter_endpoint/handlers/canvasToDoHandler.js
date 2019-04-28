"use strict";
const getAccessToken = require("../canvasUtils/getAccessToken.js");
const getToDo = require("../canvasUtils/getToDo.js");
const getCourses = require("../canvasUtils/getCourses.js");

// obtains a to do list from Canvas LMS API and outs as Alexa response
const canvasToDoHandler = {
  CanvasToDoIntent: async function () {
    var speechOutput = "";
    var toDoResults = "";
    var cardTitle = "Your Canvas To Do List:";
    var cardContent = "card content here";
    var imageObj = {
      smallImageUrl: "https://i.imgur.com/0lpxVh6.png", //108x108
      largeImageUrl: "https://i.imgur.com/QIq2lcs.png" //240x240
    };

    try {
      // Read manually generated access token from local file
      const AUTH_TOKEN = getAccessToken.getAccessToken();

      // Missing or invalid access token
      if (AUTH_TOKEN === undefined || AUTH_TOKEN === "") {
        toDoResults = "This functionality is current unavailable.";
        // toDoResults = "Unable to retrieve a valid access token.";
        // this.emit(":tell", toDoResults);
      }
      else {
        // Get courses from Canvas API
        toDoResults = await getCourses
          .getCourses(AUTH_TOKEN)
          .then(async function (courseMap) {
            try {
              // Get to do list from Canvas API
              return await getToDo.getToDo(AUTH_TOKEN, courseMap).then(out => {
                return out;
              });
            } catch (error) {
              console.error(error);
              toDoResults = "An error occured.";
              // this.emit(":tell", "An error occured");
            }
          });
      }
    } catch (error) {
      console.error(error);
      toDoResults = "An error occured.";
      // this.emit(":tell", "An error occured");
    }

    // Output speech formatted to do list with card
    cardContent = toDoResults;
    speechOutput = cardTitle + toDoResults;
    this.emit(":tellWithCard", speechOutput, cardTitle, cardContent, imageObj);
    this.emit(":responseReady");
  } //end CanvasToDoIntent()
}; // end canvasToDoHandler

module.exports = canvasToDoHandler;