const cheerio = require('cheerio');

exports.getHeadlines = function (html) {
    const $ = cheerio.load(html);
    const articles = $('article h3 a');
    const headlines = [];
    articles.each((i, el) => {
        let headline = $(el).text().trim();
        headlines.push(headline);
    });
    return headlines;
};