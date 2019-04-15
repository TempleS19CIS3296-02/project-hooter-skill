"use strict"
const getAccessToken = require("../canvasUtils/getAccessToken.js");
const getToDo = require("../canvasUtils/getToDo.js");
const getCourses = require("../canvasUtils/getCourses.js");
const Alexa = require("alexa-sdk");

const canvasToDoHandler = {
    "CanvasToDoIntent": async function () {
        var speechOutput = "";
        const alexa = this;
        speechOutput = "hello world!";

        try {
            // Read manually generated access token from local file
            const AUTH_TOKEN = getAccessToken.getAccessToken();

            // Get courses from Canvas API
            speechOutput = await getCourses.getCourses(AUTH_TOKEN)
                // .then((courseMap) => {
                .then(async function (courseMap) {
                    try {
                        // Get to do list from Canvas API
                        return await getToDo.getToDo(AUTH_TOKEN, courseMap)
                            .then((out) => {
                                // Output speech formatted to do list
                                return out;
                            });
                    } catch (error) {
                        console.error(error);
                        alexa.emit(":tell", "An error occured");
                    }
                    // this.emit(":tell", speechOutput);
                    // console.log(speechOutput);
                });
        } catch (error) {
            console.error(error);
            alexa.emit(":tell", "An error occured");
        }


        // this.emit(":tell", speechOutput);
        console.log(speechOutput);
    } //end CanvasToDoIntent()
} // end canvasToDoHandler

module.exports = canvasToDoHandler;