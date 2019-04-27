"use strict";
const getBuilding = require("../buildingGet/getBuilding.js");
const Alexa = require("alexa-sdk")
const axios = require("axios");
const das = new Alexa.services.DeviceAddressService();
const GOOGLE_DISTANCE_MATRIX_API = "https://maps.googleapis.com/maps/api/distancematrix/json?";
const GOOGLE_GEOCODING_API = "https://maps.googleapis.com/maps/api/geocode/json?latlng=";
const GOOGLE_API_KEY = "AIzaSyAvq7umSxljS8Jo1_PojlODEScs9c8Pyy0";
const USER_MODE = "walking";
const USER_LANG = "en-EN";
const REPROMPT = "What can I help you with?";

//Function to get building address from building data retrieved from database
function getBuildingAddress(userData){
    var userAdd = ""
    if (userData.Count > 0){
        userAdd = userData.Items[0].address;
    } 
    return userAdd;
}
//Function to call Google Distance Matrix API to calculate distance between origin and destination
function getDistance(userOriginAdd, userDestAdd) {
    var distanceApiUrl = GOOGLE_DISTANCE_MATRIX_API + "origins=" + userOriginAdd + "&destinations=" + userDestAdd + "&mode=" + USER_MODE + "&language=" + USER_LANG + "&key=" + GOOGLE_API_KEY;
    return axios.get(distanceApiUrl).then(res => res.data);  
}
//Function to call Google Geocoding API to get current user location from geocoordinates
function getAddressFromGeoCoord(userLat, userLong) {
    var geocodingApiUrl = GOOGLE_GEOCODING_API + userLat + "," + userLong + "&key=" + GOOGLE_API_KEY;  
    return axios.get(geocodingApiUrl).then(res => res.data);  
}
//Function to collect distance data retrieved from Google Distance Matrix API and format that data for fluent speech output
function collectAndFormatDistance(distanceData, userOrigin, userDest){
    var speechOutput = " It will take ";
    speechOutput += distanceData.rows[0].elements[0].duration.text;
    speechOutput += " to get to " + userDest + " from " + userOrigin;
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
const distanceLookUpHandler = {
    "DistanceLookUpIntent": async function () {
        var speechOutput = "";
        //If user did not specify a destination building name or destination address
        if(!this.event.request.intent.slots.destbuildingname.value && !this.event.request.intent.slots.destaddress.value){
            speechOutput = "I\'m sorry, I didn't hear your destination. Please try again and specify a destination.";
            this.response.speak(speechOutput).listen(REPROMPT);
            this.emit(":responseReady");
        } else { //User has specified a destination
            var userDestAdd = "";
            var userOriginAdd = "";
            var speechDestination = "";
            var speechOrigin = "";
            //Case: User has specified a building name as destination
            if(this.event.request.intent.slots.destbuildingname.value){
                //Get user destination building name
                var userDest = this.event.request.intent.slots.destbuildingname.value.toLowerCase();
                speechDestination = userDest;
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
                speechDestination = userDestAdd;
            }
            //Case: User has specified a building name as origin
            if (this.event.request.intent.slots.originbuildingname.value){
                //Get user origin building name
                var userOrigin = this.event.request.intent.slots.originbuildingname.value.toLowerCase();
                speechOrigin = userOrigin;
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
                speechOrigin = userOriginAdd;
            } else {
            //Case: User has not specified an origin, use user location as origin
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
                        var freshness = ( new Date(this.event.request.timestamp) - new Date(geoObject.timestamp) ) / 1000; //Freshness in seconds
                        var ACCURACY_THRESHOLD = 25; //Accuracy of 25 meters required
                        //Check if user location is "fresh" in relation to when intent was executed
                        if (geoObject && geoObject.coordinate && geoObject.coordinate.accuracyInMeters < ACCURACY_THRESHOLD && freshness < 60 ) { 
                            //Get user current geo coordinates
                            var userLat = geoObject.coordinate.latitudeInDegrees;
                            var userLong = geoObject.coordinate.longitudeInDegrees;
                            //Get user address from user latitude and longitude
                            var geoAddressData = await getAddressFromGeoCoord(userLat, userLong);
                            userOriginAdd = geoAddressData.results[0].formatted_address;
                            speechOrigin = userOriginAdd;
                        }
                    }
                } else {
                //Case: User device cannot share location eg. stationary Alexa device - Echo
                    //Use Alexa Devices API to get device address
                    //If user has given permission for location
                    if (this.event.context.System.user.permissions) {
                        const token = this.event.context.System.user.permissions.consentToken;
                        const apiEndpoint = this.event.context.System.apiEndpoint;
                        const deviceId = this.event.context.System.device.deviceId;
                        //Retrieve address for user origin
                        var deviceAddData = await getUserDeviceAdd(deviceId, apiEndpoint, token);
                        if(collectAndFormatUserDeviceAdd(deviceAddData) === ""){
                            speechOutput = "I\'m sorry. There is no street address listed for your device.";
                            this.response.speak(speechOutput).listen(REPROMPT);
                            this.emit(":responseReady"); 
                        } else {
                            userOriginAdd = collectAndFormatUserDeviceAdd(deviceAddData);
                            speechOrigin = userOriginAdd;
                        } 
                    } else { //User has not given permission for location yet
                        //Get user to give permission to get their device location
                        this.response.speak('Hooter would like to use your device address. To turn on location sharing, please go to your Alexa app, and follow the instructions. Then please try again.');
                        const permissions = ['read::alexa:device:all:address'];
                        this.response.askForPermissionsConsentCard(permissions);
                        this.emit(':responseReady');
                    }      
                }
            } 
            //Call Google Distance Matrix API to get distance from user origin to user destination
            var distanceData = await getDistance(userOriginAdd, userDestAdd);
            speechOutput += collectAndFormatDistance(distanceData, speechOrigin, speechDestination);
            this.response.speak(speechOutput).listen(REPROMPT);
            this.emit(":responseReady");
        }
    }
}

module.exports = distanceLookUpHandler;
