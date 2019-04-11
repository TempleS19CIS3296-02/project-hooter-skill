"use strict"
const getAccessToken = require("../canvasUtils/getAccessToken.js");
const getToDo = require("../canvasUtils/getToDo.js");
const getCourses = require("../canvasUtils/getCourses.js");

const canvasToDoHandler = {
    "CanvasToDoIntent": async function () {
        var speechOutput = "nope";

        // Read manually generated access token from local file
        const AUTH_TOKEN = getAccessToken.getAccessToken();

        // Get courses from Canvas API
        speechOutput = await getCourses.getCourses(AUTH_TOKEN)
            .then((courseMap) => {
                // console.log(courseMap);

                // Get to do list from Canvas API
                return getToDo.getToDo(AUTH_TOKEN, courseMap)
                    .then((out) => {
                        // console.log(out);
                        // Output speech formatted to do list
                        // this.emit(":tell", speechOutput);
                        return out;
                    });
            });
        // console.log(speechOutput);
        this.emit(":tell", speechOutput);
    } //end CanvasToDoIntent()
} // end canvasToDoHandler

module.exports = canvasToDoHandler;