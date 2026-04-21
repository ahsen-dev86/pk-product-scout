const axios = require('axios');
const cheerio = require('cheerio');

async function testDDG() {
  const { data } = await axios.get('https://html.duckduckgo.com/html/?q=iphone+15+price+in+pakistan');
  const $ = cheerio.load(data);
  const results = [];
  $('.result').each((i, el) => {
    const title = $(el).find('.result__title a').text();
    const link = $(el).find('.result__url').attr('href');
    const snippet = $(el).find('.result__snippet').text();
    if (title && link) {
       results.push({ title, link, snippet });
    }
  });
  console.log('DuckDuckGo HTML Found:', results.length);
}
testDDG();
