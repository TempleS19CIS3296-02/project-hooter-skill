const GOOGLE_API_KEY = 'AIzaSyAvq7umSxljS8Jo1_PojlODEScs9c8Pyy0';
const axios = require('axios');

const distanceLookUpHandler = {
    'DistanceLookUpIntent': function () {
        var speechOutput = '';
        var userOrigin = this.event.request.intent.slots.origbuildingname.value;
        var userDest = this.event.request.intent.slots.destbuildingname.value;

        //Convert user origin and destination to api address format

        //Get time it will take to get from origin to destination

        var apiurl = 'https://maps.googleapis.com/maps/api/distancematrix/json?';
        var apiorigin = 'origins='
        var origin = '1801+N+12th+St+Philadelphia+PA';
        apiorigin += origin;
        apiurl += apiorigin;
        apiurl += '&';
        var apidest = 'destinations='
        var dest = '1902+Liacouras+Walk+Philadelphia+PA';
        apidest += dest;
        apiurl += apidest;
        apiurl += '&';
        var apimode = 'mode='
        var mode = 'walking';
        apimode += mode;
        apiurl += apimode;
        apiurl += '&';
        var apilang = 'language='
        var lang = 'en-EN';
        apilang += lang;
        apiurl += apilang;
        apiurl += '&';
        var apikey = 'key='
        apikey += GOOGLE_API_KEY;
        apiurl += apikey;

        axios.get('https://maps.googleapis.com/maps/api/distancematrix/json?origins=1801+N+12th+St+Philadelphia+PA&destinations=1902+Liacouras+Walk+Philadelphia+PA&mode=walking&language=en-EN&key=AIzaSyAvq7umSxljS8Jo1_PojlODEScs9c8Pyy0')
            .then(res => {
                speechOutput += JSON.stringify(res.data.rows[0].elements[0].duration.text);
                this.emit(':tell', speechOutput);
            })
            .catch(err => {
                console.log(err)                     //Axios entire error message
                console.log(err.response.data.error) //Google API error message 
            })

    }
}

module.exports = distanceLookUpHandler;