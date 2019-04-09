"use strict"
const getAccessToken = require("../canvasUtils/getAccessToken.js");
const getToDo = require("../canvasUtils/getToDo.js");
const getCourses = require("../canvasUtils/getCourses.js");

const canvasToDoHandler = {
    "CanvasToDoIntent": function () {

        // Read manually generated access token from local file
        const AUTH_TOKEN = getAccessToken.getAccessToken();

        // Get courses from Canvas API
        getCourses.getCourses(AUTH_TOKEN)
            .then((courseMap) => {
                console.log(courseMap);

                // Get to do list from Canvas API
                getToDo.getToDo(AUTH_TOKEN, courseMap)
                    .then((speechOutput) => {
                        console.log(speechOutput);
                        // Output speech formatted to do list
                        this.emit(":tell", speechOutput);
                    });
            });
    } //end CanvasToDoIntent()
} // end canvasToDoHandler

module.exports = canvasToDoHandler;