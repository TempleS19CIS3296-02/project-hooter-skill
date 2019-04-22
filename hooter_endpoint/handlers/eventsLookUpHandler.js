"use strict";
var { google } = require('googleapis')
var key = require('../HooterSkill-5fde0850cf41.json'); // private json


const eventsLookUpHandler = {
    "EventsLookUpIntent": async function () {
        var scopes = ['https://www.googleapis.com/auth/calendar.readonly']
        var jwtClient = new google.auth.JWT(key.client_email, null, key.private_key, scopes, null );

        jwtClient.authorize();
        var auth = jwtClient;
        if (this.event.request.intent.slots.dateoftheweek.value){
            var userinputdate = this.event.request.intent.slots.dateoftheweek.value;
        } else {
            var userinputdate = (new Date()).getDate();
        }
     
        const calendar = google.calendar({version: 'v3', auth});
            calendar.events.list({
                calendarId: 'hooterstella@gmail.com',
                timeMin: (new Date(userinputdate)).toISOString(),
                maxResults: 3,
                singleEvents: true,
                orderBy: 'startTime'
        }, (err, res) => {
            var speechOutput = "";
            if (err) return console.log('The API returned an error: ' + err);
            const events = res.data.items;
            if (events.length) {
                speechOutput += 'Upcoming events: ';
                events.map((event, i) => {
                    const start = new Date(event.start.dateTime || event.start.date);
                    const end = new Date(event.end.dateTime || event.end.date);
                    var startDate = (start.getMonth()+1).toString() + "/" + start.getDate() + "/" + start.getFullYear();
                    //var endDate = end.getMonth().toString() + "/" + end.getDate() + "/" + end.getFullYear();
                    var startHour = (start.getHours()).toString() + ":" + (start.getMinutes()).toString();
                    var endHour = (end.getHours()).toString() + ":" + (end.getMinutes()).toString();
                    speechOutput += ` ${startDate} - ${event.summary} at ${startHour}`;
                });
            } else {
                speechOutput += 'No upcoming events found.';
            }
            this.emit(':tell',speechOutput);
        });
    }
}

module.exports = eventsLookUpHandler;