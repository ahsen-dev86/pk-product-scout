const axios = require('axios');
const cheerio = require('cheerio');

async function testBing() {
  try {
    const { data } = await axios.get('https://www.bing.com/search?q=iphone+15+price+in+pakistan', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });
    const $ = cheerio.load(data);
    const results = [];
    $('.b_algo').each((i, el) => {
      const title = $(el).find('h2 a').text();
      const link = $(el).find('h2 a').attr('href');
       const snippet = $(el).find('.b_caption p').text() || $(el).find('.b_vList').text();
      if (title && link) {
         results.push({ title, link, snippet });
      }
    });
    console.log('Bing HTML Found:', results.length);
    console.log(results[0]);
  } catch (error) {
    console.error('Bing error');
  }
}
testBing();
