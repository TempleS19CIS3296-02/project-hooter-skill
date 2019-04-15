"use strict";
const Alexa = require("alexa-sdk");
const axios = require("axios");
const GOOGLE_API_KEY = "AIzaSyAvq7umSxljS8Jo1_PojlODEScs9c8Pyy0";

const distanceLookUpHandler = {
  DistanceLookUpIntent: async function() {
    var speechOutput = "";
    //Get user destination building name
    var userDest = this.event.request.intent.slots.destbuildingname.value.toLowerCase();

    //Check if user specified origin
    if (this.event.request.intent.slots.originbuildingname.value) {
      //If user specifies origin building
      //Get user origin building name
      var userOrigin = this.event.request.intent.slots.originbuildingname.value.toLowerCase();
      //Retrieve address for user dest
      var userDestAdd = "";
      var destDBApiUrl =
        "https://xrmw4eh1gl.execute-api.us-east-1.amazonaws.com/active/building?TableName=building&BuildingName=" +
        userDest;
      axios
        .get(destDBApiUrl)
        .then(res => {
          userDestAdd += res.data.Items[0].address;

          //Retrieve address for user origin
          var originDBApiUrl =
            "https://xrmw4eh1gl.execute-api.us-east-1.amazonaws.com/active/building?TableName=building&BuildingName=" +
            userOrigin;
          var userOriginAdd = "";
          axios
            .get(originDBApiUrl)
            .then(res => {
              userOriginAdd += res.data.Items[0].address;

              //Set user preferences for travel mode and language
              var userMode = "walking";
              var userLang = "en-EN";

              //Create url for Google Directions api
              var apiurl =
                "https://maps.googleapis.com/maps/api/distancematrix/json?";
              var apiorigin = "origins=";
              apiorigin += userOriginAdd;
              apiurl += apiorigin;
              apiurl += "&";
              var apidest = "destinations=";
              apidest += userDestAdd;
              apiurl += apidest;
              apiurl += "&";
              var apimode = "mode=";
              apimode += userMode;
              apiurl += apimode;
              apiurl += "&";
              var apilang = "language=";
              apilang += userLang;
              apiurl += apilang;
              apiurl += "&";
              var apikey = "key=";
              apikey += GOOGLE_API_KEY;
              apiurl += apikey;

              //Get time it will take to get from origin to destination
              axios
                .get(apiurl)
                .then(res => {
                  speechOutput += "It will take ";
                  speechOutput += res.data.rows[0].elements[0].duration.text;
                  speechOutput +=
                    " to get from " + userOrigin + " to " + userDest;
                  this.emit(":tell", speechOutput);
                })
                .catch(err => {
                  console.log(err); //Axios entire error message
                  console.log(err.response.data.error); //Google API error message
                });
            })
            .catch(err => {
              console.log(err); //Axios entire error message
              console.log(err.response.data.error); //Google API error message
            });
        })
        .catch(err => {
          console.log(err); //Axios entire error message
          console.log(err.response.data.error); //Google API error message
        });
    } else {
      //If user gives only destination
      //Use origin as user location

      //If user's device can share location
      if (this.event.context.System.device.supportedInterfaces.Geolocation) {
        //Case: User using mobile device eg. phone with Alexa app
        //Use Alexa Location Services to get user current location
        var geoObject = this.event.context.Geolocation;
        //If user permission for location not given yet -- get permission
        if (!geoObject || !geoObject.coordinate) {
          this.response.speak(
            "Hooter would like to use your location. To turn on location sharing, please go to your Alexa app, and follow the instructions. Then please try again"
          );
          const permissions = ["alexa::devices:all:geolocation:read"];
          this.response.askForPermissionsConsentCard(permissions);
          this.emit(":responseReady");
        } else {
          //User has already given permission for location
          var freshness =
            (new Date(this.event.request.timestamp) -
              new Date(geoObject.timestamp)) /
            1000; // freshness in seconds
          var ACCURACY_THRESHOLD = 25; // accuracy of 100 meters required
          //Check if user location is "fresh" in relation to when intent was executed
          if (
            geoObject &&
            geoObject.coordinate &&
            geoObject.coordinate.accuracyInMeters < ACCURACY_THRESHOLD &&
            freshness < 60
          ) {
            //Get user current geo coordinates
            var userlat = geoObject.coordinate.latitudeInDegrees;
            var userlong = geoObject.coordinate.longitudeInDegrees;

            var geocodingapiurl =
              "https://maps.googleapis.com/maps/api/geocode/json?latlng=";
            geocodingapiurl += userlat + "," + userlong + "&key=";
            geocodingapiurl += GOOGLE_API_KEY;

            //Get user current location address from geo coordinates
            axios
              .get(geocodingapiurl)
              .then(res => {
                var userOriginAdd = res.data.results[0].formatted_address;

                //Retrieve address for user dest
                var userDestAdd = "";
                var destDBApiUrl =
                  "https://xrmw4eh1gl.execute-api.us-east-1.amazonaws.com/active/building?TableName=building&BuildingName=" +
                  userDest;
                axios
                  .get(destDBApiUrl)
                  .then(res => {
                    userDestAdd += res.data.Items[0].address;

                    //Set user preferences for travel mode and language
                    var userMode = "walking";
                    var userLang = "en-EN";

                    //Create url for Google Directions api
                    var apiurl =
                      "https://maps.googleapis.com/maps/api/distancematrix/json?";
                    var apiorigin = "origins=";
                    apiorigin += userOriginAdd;
                    apiurl += apiorigin;
                    apiurl += "&";
                    var apidest = "destinations=";
                    apidest += userDestAdd;
                    apiurl += apidest;
                    apiurl += "&";
                    var apimode = "mode=";
                    apimode += userMode;
                    apiurl += apimode;
                    apiurl += "&";
                    var apilang = "language=";
                    apilang += userLang;
                    apiurl += apilang;
                    apiurl += "&";
                    var apikey = "key=";
                    apikey += GOOGLE_API_KEY;
                    apiurl += apikey;

                    //Get time it will take to get from origin to destination
                    axios
                      .get(apiurl)
                      .then(res => {
                        speechOutput += "It will take ";
                        speechOutput +=
                          res.data.rows[0].elements[0].duration.text;
                        speechOutput +=
                          " to get to " + userDest + " from " + userOriginAdd;
                        this.emit(":tell", speechOutput);
                      })
                      .catch(err => {
                        console.log(err); //Axios entire error message
                        console.log(err.response.data.error); //Google API error message
                      });
                  })
                  .catch(err => {
                    console.log(err); //Axios entire error message
                    console.log(err.response.data.error); //Google API error message
                  });
              })
              .catch(err => {
                console.log(err); //Axios entire error message
                console.log(err.response.data.error); //Google API error message
              });
          }
        }
      } else {
        // User's device cannot share location
        //Case: User using stationary Alexa device eg. Echo
        //Use Alexa Devices API to get device address

        //If user has given permission for location
        if (this.event.context.System.user.permissions) {
          const token = this.event.context.System.user.permissions.consentToken;
          const apiEndpoint = this.event.context.System.apiEndpoint;
          const deviceId = this.event.context.System.device.deviceId;
          const das = new Alexa.services.DeviceAddressService();

          //Retrieve address for user origin
          das
            .getFullAddress(deviceId, apiEndpoint, token)
            .then(data => {
              var userOriginAdd = "";

              if (
                data.addressLine1 == null &&
                data.addressLine2 == null &&
                data.addressLine3 == null
              ) {
                this.response.speak(
                  "I'm sorry. There is no street address listed for your device."
                );
                this.emit(":responseReady");
              } else if (
                data.addressLine2 == null &&
                data.addressLine3 == null
              ) {
                userOriginAdd =
                  data.addressLine1 +
                  " " +
                  data.city +
                  " " +
                  data.stateOrRegion;
              } else if (data.addressLine3 == null) {
                userOriginAdd =
                  data.addressLine1 +
                  " " +
                  data.addressLine2 +
                  " " +
                  data.city +
                  " " +
                  data.stateOrRegion;
              } else {
                userOriginAdd =
                  data.addressLine1 +
                  " " +
                  data.addressLine2 +
                  " " +
                  data.addressLine3 +
                  " " +
                  data.city +
                  " " +
                  data.stateOrRegion;
              }
              //Retrieve address for user dest
              var userDestAdd = "";
              var destDBApiUrl =
                "https://xrmw4eh1gl.execute-api.us-east-1.amazonaws.com/active/building?TableName=building&BuildingName=" +
                userDest;
              axios
                .get(destDBApiUrl)
                .then(res => {
                  userDestAdd += res.data.Items[0].address;

                  //Set user preferences for travel mode and language
                  var userMode = "walking";
                  var userLang = "en-EN";

                  //Create url for Google Directions api
                  var apiurl =
                    "https://maps.googleapis.com/maps/api/distancematrix/json?";
                  var apiorigin = "origins=";
                  apiorigin += userOriginAdd;
                  apiurl += apiorigin;
                  apiurl += "&";
                  var apidest = "destinations=";
                  apidest += userDestAdd;
                  apiurl += apidest;
                  apiurl += "&";
                  var apimode = "mode=";
                  apimode += userMode;
                  apiurl += apimode;
                  apiurl += "&";
                  var apilang = "language=";
                  apilang += userLang;
                  apiurl += apilang;
                  apiurl += "&";
                  var apikey = "key=";
                  apikey += GOOGLE_API_KEY;
                  apiurl += apikey;

                  //Get time it will take to get from origin to destination
                  axios
                    .get(apiurl)
                    .then(res => {
                      speechOutput += "It will take ";
                      speechOutput +=
                        res.data.rows[0].elements[0].duration.text;
                      speechOutput +=
                        " to get to " + userDest + " from " + userOriginAdd;
                      this.emit(":tell", speechOutput);
                    })
                    .catch(err => {
                      console.log(err); //Axios entire error message
                      console.log(err.response.data.error); //Google API error message
                    });
                })
                .catch(err => {
                  console.log(err); //Axios entire error message
                  console.log(err.response.data.error); //Google API error message
                });
            })
            .catch(error => {
              this.response.speak("I'm sorry. Something went wrong.");
              this.emit(":responseReady");
              console.log(error.message);
            });
        } else {
          //User has not given permission for location yet
          //Get user to give permission to get their device location
          this.response.speak(
            "Hooter would like to use your device address. To turn on location sharing, please go to your Alexa app, and follow the instructions. Then please try again."
          );
          const permissions = ["read::alexa:device:all:address"];
          this.response.askForPermissionsConsentCard(permissions);
          this.emit(":responseReady");
        }
      }
    }
  }
};

module.exports = distanceLookUpHandler;
