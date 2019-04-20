"use strict";
const getBuilding = require("../buildingGet/getBuilding.js");
const Alexa = require("alexa-sdk")
const axios = require("axios");
const GOOGLE_DISTANCE_MATRIX_API = "https://maps.googleapis.com/maps/api/distancematrix/json?";
const GOOGLE_API_KEY = "AIzaSyAvq7umSxljS8Jo1_PojlODEScs9c8Pyy0";
const USER_MODE = "walking";
const USER_LANG = "en-EN";
const SEARCH = "\<.*?>";
const REPLACE = "";
const SEARCH_FT= " ft"
const REPLACE_FT = " feet";
const SEARCH_MI = " mi";
const REPLACE_MI = " miles";

//Function to convert html formatted text string into plain text readable by Alexa
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

//Function to call Google Distance Matrix API to calculate distance between origin and destination
function getDistance(userOriginAdd, userDestAdd) {
    var distanceApiUrl = GOOGLE_DISTANCE_MATRIX_API + "origins=" + userOriginAdd + "&" + "destinations=" + userDestAdd + "&" + "mode=" + USER_MODE + "&" + "language=" + USER_LANG + "&" + "key=" + GOOGLE_API_KEY;
    return axios.get(distanceApiUrl).then(res => res.data);  
}

//Function to call Google Geocoding API to get current user location from geocoordinates
function getAddressFromGeoCoord(userLat, userLong) {
    var geocodingApiUrl = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + userLat + "," + userLong + "&key=" + GOOGLE_API_KEY;;    
    return axios.get(geocodingApiUrl).then(res => res.data);  
}

const directionsLookUpHandler = {
    "DirectionsLookUpIntent": async function () {
        var speechOutput = "";

        //If user did not specify a destination
        if(!this.event.request.intent.slots.destbuildingname.value){
            speechOutput = "I\'m sorry, I didn't hear your destination. Please try again and specify a destination.";
            this.emit(":tell", speechOutput);
        } else { //User has specified a destination
            //Get user destination building name
            var userDest = this.event.request.intent.slots.destbuildingname.value.toLowerCase();
            //Retrieve address for user dest
            var userDestAdd = "";
            var destData = await getBuilding.getBuilding(userDest);
            if (destData.Count > 0){
                userDestAdd = destData.Items[0].address;
            } else { //Building not in database
                speechOutput = "I\'m sorry, I can't find " + userDest + ". Please try again";
                this.emit(":tell", speechOutput);
            }

            //If user specifies origin building
            if (this.event.request.intent.slots.originbuildingname.value){
                //Get user origin building name
                var userOrigin = this.event.request.intent.slots.originbuildingname.value.toLowerCase();
                //Retrieve address for user origin
                var userOriginAdd = "";
                var origData = await getBuilding.getBuilding(userOrigin);
                if (origData.Count > 0){
                    userOriginAdd = origData.Items[0].address;
                } else { //Building not in database
                    speechOutput = "I\'m sorry, I can't find " + userDest + ". Please try again";
                    this.emit(":tell", speechOutput);
                }

                // Call directions API to get directions from origin to destination

                //Create url for Google Directions api
                //var distanceApiUrl = GOOGLE_DISTANCE_MATRIX_API + "origins=" + userOriginAdd + "&" + "destinations=" + userDestAdd + "&" + "mode=" + USER_MODE + "&" + "language=" + USER_LANG + "&" + "key=" + GOOGLE_API_KEY;
                var directionsAPIUrl = "https://maps.googleapis.com/maps/api/directions/json?origin=1100%20W%20Montgomery%20Ave,%20Philadelphia,%20PA%2019122&destination=2109%20N%20Broad%20St,%20Philadelphia,%20PA%2019122&mode=walking&key=AIzaSyAvq7umSxljS8Jo1_PojlODEScs9c8Pyy0";
                //Get time it will take to get from origin to destination
                axios.get(directionsAPIUrl)
                .then(res => {
                    //head to w mont
                    var htmlString = res.data.routes[0].legs[0].steps[0].html_instructions;
                    speechOutput += htmlString.replaceAll(SEARCH, REPLACE);
                    speechOutput += " for ";
                    speechOutput += res.data.routes[0].legs[0].steps[0].distance.text;
                    speechOutput += ".";
                    //Run from second until penultimate step so we can keep adding a space and the word "then" after each direction instruction
                    var i = 1;
                    for(i = 1; i < res.data.routes[0].legs[0].steps.length-1; i++){
                        speechOutput += " Then ";
                        var htmlString = res.data.routes[0].legs[0].steps[i].html_instructions;
                        speechOutput += htmlString.replaceAll(SEARCH, REPLACE);
                        if (res.data.routes[0].legs[0].steps[i].distance.text != 0){
                        speechOutput += " and continue on for ";
                        speechOutput += res.data.routes[0].legs[0].steps[i].distance.text;
                        speechOutput += "."
                        }
                    }
                    //Last step does not have word "next at end of it"
                    speechOutput += " Then ";
                    var htmlString = res.data.routes[0].legs[0].steps[i].html_instructions;
                    speechOutput += htmlString.replaceAll(SEARCH, REPLACE);
                    speechOutput += " in ";
                    speechOutput += res.data.routes[0].legs[0].steps[i].distance.text;
                    speechOutput += ".";

                    //Change all occurences of "mi" and "ft" to miles and feet
                    speechOutput = speechOutput.replaceAll(SEARCH_FT, REPLACE_FT);
                    speechOutput = speechOutput.replaceAll(SEARCH_MI, REPLACE_MI);
                    // PARES THE LAST STEP BECAUSE IT HAS TWO STRING IN IT


                    //Final step is added to speech output and does not contain the word "then" at the end
                    this.emit(":tell", speechOutput);
                })
                .catch(err => {
                    speechOutput += "I\'m sorry, there was an error. Please try again. ";
                    speechOutput += err + " "; //Axios entire error message
                    speechOutput += err.response.data.error; //Google API error message
                    this.emit(":tell", speechOutput);
                });
            } else {
            //User has not specified origin, use user location as origin
            //Case 1: User device can share location
            //Case 2: User device cannot share location
            }
        }
    }
}

module.exports = directionsLookUpHandler;