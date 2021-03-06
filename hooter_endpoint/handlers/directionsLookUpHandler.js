"use strict";
const getBuilding = require("../buildingGet/getBuilding.js");
const Alexa = require("alexa-sdk")
const axios = require("axios");
const das = new Alexa.services.DeviceAddressService();
const GOOGLE_DIRECTIONS_API = "https://maps.googleapis.com/maps/api/directions/json?";
const GOOGLE_GEOCODING_API = "https://maps.googleapis.com/maps/api/geocode/json?latlng=";
const GOOGLE_API_KEY = "AIzaSyAvq7umSxljS8Jo1_PojlODEScs9c8Pyy0";
const USER_MODE = "walking";
const SEARCH = "\<.*?>";
const REPLACE = "";
const SEARCH_FT= " ft"
const REPLACE_FT = " feet";
const SEARCH_MI = " mi";
const REPLACE_MI = " miles";
const REPROMPT = "What can I help you with?";
const IMAGE_OBJ = {
    smallImageUrl: "https://i.imgur.com/0lpxVh6.png", //108x108
    largeImageUrl: "https://i.imgur.com/QIq2lcs.png" //240x240
};

//Function to convert html formatted text string into plain text readable by Alexa
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
//Function to call Google Geocoding API to get current user location from geocoordinates
function getAddressFromGeoCoord(userLat, userLong) {
    var geocodingApiUrl = GOOGLE_GEOCODING_API + userLat + "," + userLong + "&key=" + GOOGLE_API_KEY;  
    return axios.get(geocodingApiUrl).then(res => res.data);  
}
//Function to get building address from building data retrieved from database
function getBuildingAddress(userData){
    var userAdd = ""
    if (userData.Count > 0){
        userAdd = userData.Items[0].address;
    } 
    return userAdd;
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
    speechOutput = speechOutput.replace(/&nbsp;/gi,'');
    speechOutput = speechOutput.replace(/-/g," ").replace(/&/g,"");
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
        speechOutput += "\nThen ";
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
    speechOutput += "\nThen ";
    var htmlString = directionsData.routes[0].legs[0].steps[i].html_instructions;
    speechOutput += htmlString.replaceAll(SEARCH, REPLACE);
    speechOutput += " in ";
    speechOutput += directionsData.routes[0].legs[0].steps[i].distance.text;
    speechOutput += ".";
    //Fix speech output grammar
    speechOutput = fixDirectionInstructionsGrammar(speechOutput);
    return speechOutput;
}
//Function to call Alexa Device Service to get user device address
function getUserDeviceAdd(deviceId, apiEndpoint, token){
    return das.getFullAddress(deviceId, apiEndpoint, token).then(data => data);
}
//Function to get user device address from device address data retrieved from Alexa Device Service
//And format for seemless use with Google Directions API call
function collectAndFormatUserDeviceAdd(data){
    var userOriginAdd = "";
    if (data.addressLine2 == null && data.addressLine3 == null){
        userOriginAdd = data.addressLine1 + " " + data.city + " " + data.stateOrRegion;
    } else if (data.addressLine3 == null){
        userOriginAdd = data.addressLine1 + " " + data.addressLine2 + " " + data.city + " " + data.stateOrRegion;
    } else {
        userOriginAdd = data.addressLine1 + " " + data.addressLine2 + " " + data.addressLine3 + " " + data.city + " " + data.stateOrRegion;
    }
    return userOriginAdd;
}
//Main handler
const directionsLookUpHandler = {
    "DirectionsLookUpIntent": async function () {
        var speechOutput = "";
        //If user did not specify a destination
        if(!this.event.request.intent.slots.destbuildingname.value && !this.event.request.intent.slots.destaddress.value){
            speechOutput = "I\'m sorry, I didn't hear your destination. Please try again and specify a destination.";
            this.response.speak(speechOutput).listen(REPROMPT);
            this.emit(":responseReady");
        } else { 
        //User has specified a destination
            var userDestAdd = "";
            var userOriginAdd = "";
        //Get user destination
            //Case: User has specified a building name as destination
            if(this.event.request.intent.slots.destbuildingname.value){
                //Get user destination building name
                var userDest = this.event.request.intent.slots.destbuildingname.value.toLowerCase();
                //Retrieve address for user dest building
                var destData = await getBuilding.getBuilding(userDest);
                if(getBuildingAddress(destData)){
                    userDestAdd = getBuildingAddress(destData);
                } else { //Building not in database
                    speechOutput = "I\'m sorry, I can't find " + userDest + ". Please try again";
                    this.response.speak(speechOutput).listen(REPROMPT);
                    this.emit(":responseReady");
                }
            } else {
            //Case: User has specified an address as destination
                userDestAdd = this.event.request.intent.slots.destaddress.value;
            }
        //Get user origin
            //Case: User has specified a building name as origin
            if (this.event.request.intent.slots.originbuildingname.value){
                //Get user origin building name
                var userOrigin = this.event.request.intent.slots.originbuildingname.value.toLowerCase();
                //Retrieve address for user origin building
                var origData = await getBuilding.getBuilding(userOrigin);
                if(getBuildingAddress(origData)){
                    userOriginAdd = getBuildingAddress(origData);
                } else { //Building not in database
                    speechOutput = "I\'m sorry, I can't find " + userOrigin + ". Please try again";
                    this.response.speak(speechOutput).listen(REPROMPT);
                    this.emit(":responseReady");
                }
            } else if (this.event.request.intent.slots.originaddress.value) {
            //Case: User has specified an address as origin
                //Get user origin address
                userOriginAdd = this.event.request.intent.slots.originaddress.value;
            } else {
            //Case: User has not specified origin, use user location as origin
                //Case: User device can share location eg. mobile device with Alexa app
                if (this.event.context.System.device.supportedInterfaces.Geolocation) {
                    //Use Alexa Location Services to get user current location
                    var geoObject = this.event.context.Geolocation;
                    //If user permission for location not given yet -- get permission
                    if (!geoObject || !geoObject.coordinate) {
                        this.response.speak("Hooter would like to use your location. To turn on location sharing, please go to your Alexa app, and follow the instructions. Then please try again.");
                        const permissions = ["alexa::devices:all:geolocation:read"];
                        this.response.askForPermissionsConsentCard(permissions);
                        this.emit(":responseReady");
                    } else { //User has already given permission for location
                        var freshness = ( new Date(this.event.request.timestamp) - new Date(geoObject.timestamp) ) / 1000; // freshness in seconds
                        var ACCURACY_THRESHOLD = 25; // accuracy of 25 meters required
                        //Check if user location is "fresh" in relation to when intent was executed
                        if (geoObject && geoObject.coordinate && geoObject.coordinate.accuracyInMeters < ACCURACY_THRESHOLD && freshness < 60 ) { 
                            //Get user current geo coordinates
                            var userLat = geoObject.coordinate.latitudeInDegrees;
                            var userLong = geoObject.coordinate.longitudeInDegrees;
                            //Get user address from user latitude and longitude
                            var geoAddressData = await getAddressFromGeoCoord(userLat, userLong);
                            userOriginAdd = geoAddressData.results[0].formatted_address;
                        }
                    }
                } else {
                //Case: User device cannot share location
                    //Use Alexa Devices API to get device address
                    const devicePermissionSpecs = "alexa::devices:all:geolocation:read";
                    //User has not given permission for location yet
                    if (this.event.context.System.user.permissions.scopes[devicePermissionSpecs].status == "DENIED"){
                        //Get user to give permission to get their device location
                        this.response.speak('Hooter would like to use your device address. Hooter requires both the Device Address and Location Services boxes to be checked in the permissions card. To turn on location sharing, please go to your Alexa app, and follow the instructions. Then please try again.');
                        const permissions = ['read::alexa:device:all:address'];
                        this.response.askForPermissionsConsentCard(permissions);
                        this.emit(':responseReady');
                    } else {
                    //If user has given permission for location
                        const token = this.event.context.System.user.permissions.consentToken;
                        const apiEndpoint = this.event.context.System.apiEndpoint;
                        const deviceId = this.event.context.System.device.deviceId;
                        //Retrieve address for user origin
                        var deviceAddData = await getUserDeviceAdd(deviceId, apiEndpoint, token);
                        if(collectAndFormatUserDeviceAdd(deviceAddData) === ""){
                            speechOutput = "I\'m sorry. There is no street address listed for your device. Please update the street address for your device. Then please try again.";
                            this.response.speak(speechOutput).listen(REPROMPT);
                            this.emit(":responseReady"); 
                        } else {
                            userOriginAdd = collectAndFormatUserDeviceAdd(deviceAddData);
                        } 
                    }
                }
            }
            //Call Google Directions API for directions from user origin to user destination
            var directionsData = await getDirections(userOriginAdd, userDestAdd);
            //User specified invalid destination and/or origin address(es)
            if((directionsData.geocoded_waypoints[0].geocoder_status == "ZERO_RESULTS") 
                || (directionsData.geocoded_waypoints[1].geocoder_status == "ZERO_RESULTS")){
                var invalidAddressPoint = "";
                var correctionAddressPoint = "";
                //Destination and origin addresses are invalid
                if((directionsData.geocoded_waypoints[0].geocoder_status == "ZERO_RESULTS") 
                    && (directionsData.geocoded_waypoints[1].geocoder_status == "ZERO_RESULTS")){
                        invalidAddressPoint = "destination nor origin";
                        correctionAddressPoint = "destination and origin";
                } else if ((directionsData.geocoded_waypoints[0].geocoder_status == "ZERO_RESULTS")) {
                //Origin address is invalid
                    invalidAddressPoint = "origin";
                    correctionAddressPoint = invalidAddressPoint;
                } else if(directionsData.geocoded_waypoints[1].geocoder_status == "ZERO_RESULTS"){
                //Destination address is invalid
                    invalidAddressPoint = "destination";
                    correctionAddressPoint = invalidAddressPoint;
                }
                //Tell user the error they made and how to fix it
                speechOutput = "I'm sorry, that is not a valid " 
                + invalidAddressPoint + " address. " + "Please specify a valid " 
                + correctionAddressPoint + " address or building name, and try again.";
                this.response.speak(speechOutput).listen(REPROMPT);
                this.emit(":responseReady");
            } else {
                //Get response for directions request
                speechOutput += collectAndFormatDirections(directionsData);
                //Send a card with written directions to user Alexa app along with narration of directions
                const cardTitle = "Directions to " + directionsData.routes[0].legs[0].end_address;
                const cardContent = speechOutput;
                this.emit(':askWithCard', speechOutput, REPROMPT, cardTitle, cardContent, IMAGE_OBJ);
            }
        }
    }
}

module.exports = directionsLookUpHandler;