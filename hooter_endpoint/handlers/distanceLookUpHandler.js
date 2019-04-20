"use strict";
const getBuilding = require("../buildingGet/getBuilding.js");
const Alexa = require("alexa-sdk")
const axios = require("axios");
const GOOGLE_DISTANCE_MATRIX_API = "https://maps.googleapis.com/maps/api/distancematrix/json?";
const GOOGLE_GEOCODING_API = "https://maps.googleapis.com/maps/api/geocode/json?latlng=";
const GOOGLE_API_KEY = "AIzaSyAvq7umSxljS8Jo1_PojlODEScs9c8Pyy0";
const USER_MODE = "walking";
const USER_LANG = "en-EN";

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

const distanceLookUpHandler = {
    "DistanceLookUpIntent": async function () {
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
                var distanceData = await getDistance(userOriginAdd, userDestAdd);
                speechOutput += collectAndFormatDistance(distanceData, userOrigin, userDest);
                this.emit(":tell", speechOutput);
            } else {
            //User has not specified origin, use user location as origin
                //If user's device can share location
                if (this.event.context.System.device.supportedInterfaces.Geolocation) {
                    //Case: User using mobile device eg. phone with Alexa app
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
                            var userOriginAdd = geoAddressData.results[0].formatted_address;
                            var distanceData = await getDistance(userOriginAdd, userDestAdd);
                            speechOutput += collectAndFormatDistance(distanceData, userOriginAdd, userDest);
                            this.emit(":tell", speechOutput);
                        }
                    }
                } else {
                    //User's device cannot share location. User using stationary Alexa device eg. Echo
                    //Use Alexa Devices API to get device address
                    //If user has given permission for location
                    if (this.event.context.System.user.permissions) {
                        const token = this.event.context.System.user.permissions.consentToken;
                        const apiEndpoint = this.event.context.System.apiEndpoint;
                        const deviceId = this.event.context.System.device.deviceId;
                        const das = new Alexa.services.DeviceAddressService();
                        //Retrieve address for user origin
                        das.getFullAddress(deviceId, apiEndpoint, token)
                        .then((data) => {
                            var userOriginAdd = '';
                            if (data.addressLine1 == null && data.addressLine2 == null && data.addressLine3 == null){
                                this.response.speak('I\'m sorry. There is no street address listed for your device.'); 
                                this.emit(':responseReady'); 
                            } else if (data.addressLine2 == null && data.addressLine3 == null){
                                userOriginAdd = data.addressLine1 + ' ' + data.city + ' ' + data.stateOrRegion;
                            } else if (data.addressLine3 == null){
                                userOriginAdd = data.addressLine1 + ' ' + data.addressLine2 + ' ' + data.city + ' ' + data.stateOrRegion;
                            } else {
                                userOriginAdd = data.addressLine1 + ' ' + data.addressLine2 + ' ' + data.addressLine3 + ' ' + data.city + ' ' + data.stateOrRegion;
                            }
                            //Create url for Google Distance Matrix API
                            var distanceApiUrl = GOOGLE_DISTANCE_MATRIX_API + "origins=" + userOriginAdd + "&destinations=" + userDestAdd + "&mode=" + USER_MODE + "&language=" + USER_LANG + "&key=" + GOOGLE_API_KEY;
                            //Get time it will take to get from user origin to user destination
                            axios.get(distanceApiUrl)
                            .then(res => {
                                speechOutput += "It will take ";
                                speechOutput += res.data.rows[0].elements[0].duration.text;
                                speechOutput += " to get to " + userDest + " from " + userOriginAdd;
                                this.emit(":tell", speechOutput);
                            })
                            .catch(err => {
                                speechOutput += "I\'m sorry, there was an error. Please try again. ";
                                speechOutput += err + " "; //Axios entire error message
                                speechOutput += err.response.data.error; //Google API error message
                                this.emit(":tell", speechOutput); 
                            });              
                        })
                        .catch(err => {
                            speechOutput += err; //Entire error message
                            this.emit(":tell", speechOutput); 
                        });
                    } else { //User has not given permission for location yet
                        //Get user to give permission to get their device location
                        this.response.speak('Hooter would like to use your device address. To turn on location sharing, please go to your Alexa app, and follow the instructions. Then please try again.');
                        const permissions = ['read::alexa:device:all:address'];
                        this.response.askForPermissionsConsentCard(permissions);
                        this.emit(':responseReady');
                    }      
                }
            }
        }
    }
}

module.exports = distanceLookUpHandler;