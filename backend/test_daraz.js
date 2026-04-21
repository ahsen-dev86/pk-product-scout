const axios = require('axios');
const cheerio = require('cheerio');

async function testDaraz() {
  try {
    const { data } = await axios.get('https://www.daraz.pk/catalog/?q=iphone+15', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    });
    // Daraz might load data dynamically via window.pageData...
    const scriptMatch = data.match(/window\.pageData=(.*?);<\/script>/);
    if (scriptMatch) {
       const parsed = JSON.parse(scriptMatch[1]);
       const items = parsed.mods?.listItems;
       console.log('Daraz items found:', items?.length);
       if (items && items.length > 0) {
         console.log(items[0].name, items[0].priceShow);
       }
    } else {
       console.log('No daraz pagedata found');
    }
  } catch (error) {
    console.error('Daraz error', error.message);
  }
}
testDaraz();
