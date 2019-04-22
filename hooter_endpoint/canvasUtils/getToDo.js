/*  Makes an http request to the Canvas LMS api: https://canvas.instructure.com/doc/api/
    using the Axios http client: https://github.com/axios/axios

    This http request is a GET to Canvas's 'To do' list for a user.
*/

// const getAccessToken = require("./getAccessToken.js");
// const AUTH_TOKEN = getAccessToken();

const axios = require("axios");
const moment = require("moment");

exports.getToDo = function (AUTH_TOKEN, map) {
  let response = ""; //http response
  try {
    // Make the request for the authorized user's to do list
    return response = axios({
      method: "get",
      url: "https://templeu.instructure.com/api/v1/users/self/todo?per_page=20",
      // url: "/users/self/todo",
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
    })
      .then(function (response) {
        //handle success
        console.log("todo request success");
        // console.log(response.data);
        return buildTodoListSpeech(response.data, map);
      });
  } catch (error) {
    console.error(error);
  }

  return response;
};

function buildTodoListSpeech(toDoList, map) {

  if (toDoList === "") {
    return "You're all caught up!";
  }

  toDoList.sort(compareDate);
  // var speechText = "Your Canvas to do list is: ";
  var speechText = "";
  for (let i = 0; i < toDoList.length; i++) {
    speechText += ("\n\t" + getToDoListItem(toDoList[i], map.get(toDoList[i].course_id)));
  }

  speechText = speechText.replace("&", "and");

  return speechText;
}

function getToDoListItem(item, course_name) {

  let dueDate = item.assignment.due_at;
  let assignment = item.assignment.name;
  dueDate = moment(item.assignment.due_at).format('MMMM Do [at] hh:mm A');

  // //format for console testing
  // var str =
  //   "\n" + course_name + ": " +
  //   item.assignment.name +
  //   "\n\tdue date: " +
  //   dueDate;

  //format for Alexa output
  var str = course_name + ": " +
    assignment +
    " due date: " + dueDate + ". ";


  return str;
}

function compareDate(item1, item2) {
  let comp = 0;
  if (item1.assignment.due_at > item2.assignment.due_at) {
    comp = 1;
  } else if (item1.assignment.due_at <= item2.assignment.due_at) {
    comp = -1;
  }
  return comp;
}