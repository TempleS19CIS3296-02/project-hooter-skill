"use strict";
const getBuilding = require("../buildingGet/getBuilding.js");
const Alexa = require("alexa-sdk")
const axios = require("axios");
const GOOGLE_DIRECTIONS_API = "https://maps.googleapis.com/maps/api/directions/json?";
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
//Function to call Google Geocoding API to get current user location from geocoordinates
function getAddressFromGeoCoord(userLat, userLong) {
    var geocodingApiUrl = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + userLat + "," + userLong + "&key=" + GOOGLE_API_KEY; 
    return axios.get(geocodingApiUrl).then(res => res.data);  
}
//Function to get building address from building data retrieved from database
function getBuildingAddress(userData, userDest){
    var userDestAdd = ""
    if (userData.Count > 0){
        userDestAdd = userData.Items[0].address;
    } else { //Building not in database
        speechOutput = "I\'m sorry, I can't find " + userDest + ". Please try again";
        this.emit(":tell", speechOutput);
    }
    return userDestAdd;
}
//Function to call Google Directions API for directions from user origin to user destination
function getDirections(userOriginAdd, userDestAdd){
    var directionsApiUrl = GOOGLE_DIRECTIONS_API + "origin=" + userOriginAdd + "&destination=" + userDestAdd + "&mode=" + USER_MODE + "&key=" + GOOGLE_API_KEY;
    return axios.get(directionsApiUrl).then(res => res.data); 
}
//Function to fix grammar of directions speech output
function fixDirectionInstructionsGrammar(speechOutput){
    speechOutput = speechOutput.replaceAll("Destination", " and destination");
    speechOutput = speechOutput.replaceAll("Turn", "turn");
    speechOutput = speechOutput.replaceAll(SEARCH_FT, REPLACE_FT);
    speechOutput = speechOutput.replaceAll(SEARCH_MI, REPLACE_MI);
    return speechOutput;
}
//Function to get directions steps from directions data retrieved from Google Directions API and format those instructions for fluent speech output
function collectAndFormatDirections(directionsData){
    var speechOutput = "";
    var htmlString = directionsData.routes[0].legs[0].steps[0].html_instructions;
    speechOutput += htmlString.replaceAll(SEARCH, REPLACE);
    speechOutput += " for ";
    speechOutput += directionsData.routes[0].legs[0].steps[0].distance.text;
    speechOutput += ".";
    //Run from second until penultimate step so we can keep adding filler words between each direction instruction
    var i = 1;
    for(i = 1; i < directionsData.routes[0].legs[0].steps.length-1; i++){
        speechOutput += " Then ";
        var htmlString = directionsData.routes[0].legs[0].steps[i].html_instructions;
        speechOutput += htmlString.replaceAll(SEARCH, REPLACE);
        //If next direction instruction is 0 miles away, no need to tell user to "continue on" for 0 miles in the current instruction
        if (directionsData.routes[0].legs[0].steps[i].distance.text != 0){
        speechOutput += " and continue on for ";
        speechOutput += directionsData.routes[0].legs[0].steps[i].distance.text;
        speechOutput += "."
        }
    }
    //Last step does not have "continue on"
    speechOutput += " Then ";
    var htmlString = directionsData.routes[0].legs[0].steps[i].html_instructions;
    speechOutput += htmlString.replaceAll(SEARCH, REPLACE);
    speechOutput += " in ";
    speechOutput += directionsData.routes[0].legs[0].steps[i].distance.text;
    speechOutput += ".";
    //Fix speech output grammar
    speechOutput = fixDirectionInstructionsGrammar(speechOutput);
    return speechOutput;
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
            //Retrieve address for user dest building
            var destData = await getBuilding.getBuilding(userDest);
            var userDestAdd = getBuildingAddress(destData, userDest);
            //If user specifies origin building
            if (this.event.request.intent.slots.originbuildingname.value){
                //Get user origin building name
                var userOrigin = this.event.request.intent.slots.originbuildingname.value.toLowerCase();
                //Retrieve address for user origin building
                var origData = await getBuilding.getBuilding(userOrigin);
                var userOriginAdd = getBuildingAddress(origData, userOrigin);
                //Call Google Directions API for directions from user origin to user destination
                var directionsData = await getDirections(userOriginAdd, userDestAdd);
                speechOutput += collectAndFormatDirections(directionsData);
                this.emit(":tell", speechOutput);
            } else {
            //User has not specified origin, use user location as origin
            //Case 1: User device can share location
            //Case 2: User device cannot share location
            }
        }
    }
}

module.exports = directionsLookUpHandler;