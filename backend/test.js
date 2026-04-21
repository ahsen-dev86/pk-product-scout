const dotenv = require('dotenv');
dotenv.config();

const { scrapeListings } = require('./services/searchService');
const { analyzeListings } = require('./services/aiService');

async function test() {
  console.log("1. Testing Scraper...");
  const listings = await scrapeListings("iPhone 15");
  if (listings.length === 0) {
    console.log("Scraping failed or returned empty.");
    return;
  }
  
  console.log("2. Testing AI...");
  const recommendation = await analyzeListings("iPhone 15", listings);
  console.log("AI Result:", JSON.stringify(recommendation, null, 2));
}

test();
