"use strict";
const getBuilding = require("../buildingGet/getBuilding.js");

const hoursLookUpHandler = {
  "HoursLookUpIntent": async function () {
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
    var userbuildingname = (this.event.request.intent.slots.buildingname.value).toLowerCase();
    if (userbuildingname){
      speechOutput += userbuildingname + "\'s hours ";
      var data = await getBuilding.getBuilding(userbuildingname);
      if (data.Count > 0){
        if (this.event.request.intent.slots.dateoftheweek.value) {
          var user_input_date = new Date(
            this.event.request.intent.slots.dateoftheweek.value
          );
          userday = weekday[user_input_date.getDay()]; //try to get the day from user
        } else {
          //if the user doesn't specify the day
          //Get the day for today
          //==============================================
          var today = new Date();
          var dayoftheweek = weekday[today.getDay()];
          userday = dayoftheweek;
        }
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
            speechOutput += JSON.stringify(res.data.Items[0].hours.saturday);
            break;
        }
      } else {
        //building not in database
        speechOutput = "I can't find " + userbuildingname + ". Please try again";
      }
    } else {
      speechOutput = "Error. Please try again";
    }//else error
    this.emit(":tell", speechOutput);
  }
}

module.exports = hoursLookUpHandler;