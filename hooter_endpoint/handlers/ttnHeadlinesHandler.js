"use strict";
// const axios = require('axios');
// const ttnUrl = "https://temple-news.com";
// const cheerio = require('cheerio');
// const getHeadlines = require("../ttnUtils/getHeadlines.js");

const rp = require('request-promise');
const cheerio = require('cheerio');
const options = {
  uri: "https://temple-news.com",
  transform: function (body) {
    return cheerio.load(body);
  }
};


//Main handler
const ttnHeadlinesHandler = {
    "TTNHeadlinesIntent": function () {
        var self = this;
        rp(options)
                .then(($) => {
        var title = "";
        if($('article h3 a').length <= 0){
                    title = "No News For Today";
                } else {
                    $('article h3 a').each(function(i, element){
                    title += $(this).text() + ". ";
                    });
                }
        self.response.speak(title.replace(/-/g," ").replace(/&/g,""));
                self.emit(':responseReady');
        })
                .catch((err) => {
                console.log(err);
                self.response.speak("Yo something went wrong");
                self.emit(':responseReady');
                });
    }
}

module.exports = ttnHeadlinesHandler;