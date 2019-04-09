var { google } = require('googleapis')
var scopes = ['https://www.googleapis.com/auth/calendar.readonly']
var key = require('../HooterSkill-5fde0850cf41.json'); // private json
var jwtClient = new google.auth.JWT(key.client_email, null, key.private_key, scopes, null);

const eventsLookUpHandler = {
    "EventsLookUpIntent": function () {
        var speechOutput = "";

        var auth = jwtClient.authorize(function (err, token) {
            listCalendars(jwtClient);
        });

        const calendar = google.calendar({ version: 'v3', auth });
        calendar.events.list({
            calendarId: 'hooterstella@gmail.com',
            timeMin: (new Date()).toISOString(),
            maxResults: 5,
            singleEvents: true,
            orderBy: 'startTime',

        }, (err, res) => {
            if (err) speechOutput += "Error retreiving events";
            const events = res.data.items;
            if (events.length) {
                speechOutput += 'Upcoming 5 events:';
                events.map((event, i) => {
                    const start = event.start.dateTime || event.start.date;
                    speechOutput += `${start} - ${event.summary}`;
                });
            } else {
                speechOutput += 'No upcoming events found.';
            }
        });
        this.emit(":tell", speechOutput);
    }
}

module.exports = eventsLookUpHandler;