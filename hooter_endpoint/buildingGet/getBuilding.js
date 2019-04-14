const axios = require("axios");
const apiurl = "https://xrmw4eh1gl.execute-api.us-east-1.amazonaws.com/active/building?TableName=building&BuildingName=";

exports.getBuilding = function(building){
    var url = apiurl + building;
    return axios.get(url).then(res => res.data);
}