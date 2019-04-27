"use strict";
let Parser = require('rss-parser');
let parser = new Parser();
const REPROMPT = "What can I help you with?";

//Dictionary of news types and the URLs for their RSS feeds
const newsTypes = {
  artsAndCulture : "https://news.temple.edu/rss/news/topics/arts-culture",
  athletics : "https://news.temple.edu/rss/news/topics/athletics",
  campusNews : "https://news.temple.edu/rss/news/topics/campus-news",
  globalTemple : "https://news.temple.edu/rss/news/topics/global-temple",
  research : "https://news.temple.edu/rss/news/topics/research",
  communityEngagement : "https://news.temple.edu/rss/news/topics/community-engagement",
  staffAndFaculty : "https://news.temple.edu/rss/news/topics/staff-faculty",
  studentSuccess : "https://news.temple.edu/rss/news/topics/student-success",
  sustainability : "https://news.temple.edu/rss/news/topics/sustainability",
  visualizeTemple : "https://news.temple.edu/rss/news/topics/visualize-temple"
};
//Function to get extract headlines from retrieved RSS feed and format speech output
function getHeadlines(feed, userChoice){
  var speechOutput = "Here are headlines from Temple University about " + userChoice 
  + " <audio src='soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_neutral_response_03'/> ";
  feed.items.forEach(item => {
    speechOutput += item.title + ". ";
  });
  speechOutput += "<audio src='soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_neutral_response_03'/> That's all for " 
  + userChoice + " headlines.";
  speechOutput = speechOutput.replace(/-/g," ").replace(/&/g,"");
  return speechOutput;
};

//Main handler
const tuHeadlinesHandler = {
    "TuHeadlinesIntent": async function() {
      var speechOutput = "";
      var userFeed = "";
      var userChoice = userChoice = this.event.request.intent.slots.newsType.resolutions.resolutionsPerAuthority[0].values[0].value.name;
      //Switch statement to get RSS feed URL for user choice of news type
      switch(userChoice){
        case "arts and culture":
        userFeed += newsTypes.artsAndCulture;
          break;
        case "athletics":
        userFeed += newsTypes.athletics;
          break;
        case "campus":
        userFeed += newsTypes.campusNews;
          break;
        case "global temple":
        userFeed += newsTypes.globalTemple;
          break;
        case "research":
        userFeed += newsTypes.research;
          break;
        case "community engagement":
        userFeed += newsTypes.communityEngagement;
          break;
        case "staff and faculty":
        userFeed += newsTypes.staffAndFaculty;
          break;
        case "student success":
        userFeed += newsTypes.studentSuccess;
          break;
        case "sustainability":
        userFeed += newsTypes.sustainability;
          break;
        case "visualize temple":
        userFeed += newsTypes.visualizeTemple;
          break;
      }
      //Get RSS feed from user specified RSS feed
      let feed = await parser.parseURL(userFeed);
      speechOutput = getHeadlines(feed, userChoice);
      this.response.speak(speechOutput).listen(REPROMPT);
      this.emit(":responseReady");
  }
}

module.exports = tuHeadlinesHandler;

