"use strict";
const getBuilding = require("../buildingGet/getBuilding.js");
const reprompt = "What can I help you with?";
var cardTitle = "Temple Building Hours:";
var cardContent = "";
var imageObj = {
  smallImageUrl: "https://i.imgur.com/0lpxVh6.png", //108x108
  largeImageUrl: "https://i.imgur.com/QIq2lcs.png" //240x240
};

const hoursLookUpHandler = {
  HoursLookUpIntent: async function() {
    var speechOutput = "";
    var userday = "";
    var weekday = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday"
    ];
    //==============================================
    //API Call to user input building
    //---------------------SLOT VALUES HANDLE BEGINS----------------------------------------
    if (
      this.event.request.intent.slots.buildingname.resolutions
        .resolutionsPerAuthority[0].values[0].value.name
    ) {
      userbuildingname = this.event.request.intent.slots.buildingname.resolutions.resolutionsPerAuthority[0].values[0].value.name.toLowerCase();
    } else {
      var userbuildingname = this.event.request.intent.slots.buildingname.value.toLowerCase();
    }

    if (userbuildingname) {
      speechOutput += userbuildingname + "'s hours ";
      var data = await getBuilding.getBuilding(userbuildingname);
      if (data.Count > 0) {
        if (this.event.request.intent.slots.dateoftheweek.value) {
          var user_input_date = new Date(
            this.event.request.intent.slots.dateoftheweek.value
          );
          userday = weekday[user_input_date.getDay()];
        } else {
          //if the user doesn't specify the day
          //Get the day for today
          var today = new Date();
          var dayoftheweek = weekday[today.getDay()];
          userday = dayoftheweek;
        }
        //---------------------SLOT VALUES HANDLE ENDS----------------------------------------
        speechOutput += "on " + userday + " is ";
        switch (userday) {
          case "sunday":
            speechOutput += JSON.stringify(data.Items[0].hours.sunday);
            break;
          case "monday":
            speechOutput += JSON.stringify(data.Items[0].hours.monday);
            break;
          case "tuesday":
            speechOutput += JSON.stringify(data.Items[0].hours.tuesday);
            break;
          case "wednesday":
            speechOutput += JSON.stringify(data.Items[0].hours.wednesday);
            break;
          case "thursday":
            speechOutput += JSON.stringify(data.Items[0].hours.thursday);
            break;
          case "friday":
            speechOutput += JSON.stringify(data.Items[0].hours.friday);
            break;
          case "saturday":
            speechOutput += JSON.stringify(data.Items[0].hours.saturday);
            break;
        }
      } else {
        //building not in database
        speechOutput =
          "I can't find " + userbuildingname + ". Please try again";
      }
    } else {
      speechOutput = "Error. Please try again";
    } //else error
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

module.exports = hoursLookUpHandler;
