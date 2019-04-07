"use strict";
const axios = require("axios");

const hoursLookUpHandler = {
  "HoursLookUpIntent": function () {
    var speechOutput = "";

    //==============================================
    //API Call to user input building
    var userbuildingname = this.event.request.intent.slots.buildingname.value;
    speechOutput += userbuildingname + "'s hours ";
    var apiurl =
      "https://xrmw4eh1gl.execute-api.us-east-1.amazonaws.com/active/building?TableName=building&BuildingName=" +
      userbuildingname;
    axios.get(apiurl).then(res => {
      //Input extraction
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
      if (this.event.request.intent.slots.dateoftheweek.value) {
        var user_input_date = new Date(
          this.event.request.intent.slots.dateoftheweek.value
        );
        var userday = weekday[user_input_date.getDay()]; //try to get the day from user
      } else {
        //if the user doesn't specify the day
        //Get the day for today
        //==============================================
        var today = new Date();
        var dayoftheweek = weekday[today.getDay()];
        var userday = dayoftheweek;
      }

      speechOutput += "on " + userday + " is ";

      switch (userday) {
        case "sunday":
          speechOutput += JSON.stringify(res.data.Items[0].hours.sunday);
          break;
        case "monday":
          speechOutput += JSON.stringify(res.data.Items[0].hours.monday);
          break;
        case "tuesday":
          speechOutput += JSON.stringify(res.data.Items[0].hours.tuesday);
          break;
        case "wednesday":
          speechOutput += JSON.stringify(res.data.Items[0].hours.wednesday);
          break;
        case "thursday":
          speechOutput += JSON.stringify(res.data.Items[0].hours.thursday);
          break;
        case "friday":
          speechOutput += JSON.stringify(res.data.Items[0].hours.friday);
          break;
        case "saturday":
          speechOutput += JSON.stringify(res.data.Items[0].hours.saturday);
          break;
      }
      this.emit(":tell", speechOutput);
    });
  }
}

module.exports = hoursLookUpHandler;