/* Temporary file for testing http requests to the Canvas API

  The getAccessToken returns a bearer access token read from the bearToken.txt file.
  The token is a manually generated access token from the tester's Canvas account.
  
  *NOTE*: A user shall not manually generate an access token to use with the Hooter Skill;
    the following code and manual generation of an access code should only be done withing
    the testing environment.
*/
exports.getAccessToken = function () {
    const fs = require("fs");
    var AUTH_TOKEN = "";
    try {
        AUTH_TOKEN = fs.readFileSync("./canvasUtils/bearerToken.txt", "utf8").toString();
        console.log(AUTH_TOKEN);
    } catch (e) {
        console.log("Error:", e.stack);
    }
    return AUTH_TOKEN;
};
