const axios = require("axios");

exports.getCourses = function (AUTH_TOKEN) {
    // async function getCourses(AUTH_TOKEN) {

    let response = ""; //http response
    let courseMap = new Map();
    try {
        // Make the request for the authorized user's to do list
        response = axios({
            method: "get",
            url: "https://templeu.instructure.com/api/v1/users/self/courses?per_page=100",
            // url: "https://templeu.instructure.com/api/v1/courses",
            headers: { Authorization: `Bearer ${AUTH_TOKEN}`, },
        })
            .then(function (response) {
                //handle success
                console.log("courses request success");
                // console.log(response.data);
                return buildCourseMap(response.data);
            });

    } catch (error) {
        console.error(error);
    }

    return response;
}

// Builds the response from Canvas into a map<id,name>
function buildCourseMap(data) {
    let map = new Map();
    console.log("building map");
    data.forEach(course => {
        map.set(course.id, course.name);

    });

    return map;
}