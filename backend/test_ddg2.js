const { search } = require('duck-duck-scrape');

async function testDDGStr() {
  try {
    const searchResults = await search('iphone 15 price in pakistan');
    console.log('DuckDuckScrape test returned:', searchResults.results.length);
    console.log(searchResults.results[0]);
  } catch (error) {
    console.error('DDG Error:', error);
  }
}
testDDGStr();
