const axios = require("axios");

// Obtains a list of courses enrolled by the user from Canvas LMS API
exports.getCourses = function (AUTH_TOKEN) {
    // async function getCourses(AUTH_TOKEN) {

    let response = ""; //http response
    try {
        // Make the request for the authorized user's to do list
        return response = axios({
            method: "get",
            url: "https://templeu.instructure.com/api/v1/users/self/courses?per_page=100",
            headers: { Authorization: `Bearer ${AUTH_TOKEN}`, },
        })
            .then(function (response) {
                //handle success
                console.log("courses request success");
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