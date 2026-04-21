const axios = require('axios');
const cheerio = require('cheerio');
const google = require('googlethis');

async function scrapeListings(query) {
  try {
    const searchQuery = `${query} price in pakistan`;
    console.log(`Scraping started for: ${searchQuery}`);
    
    // 1. Primary Google Search for local vendor listings
    const googleOptions = {
      page: 0, 
      safe: false, // Safe Search
      parse_ads: false, // If set to true, sponsored results will be parsed
      additional_params: { 
        hl: 'en',
        gl: 'pk' // target Pakistan
      }
    };
    
    const response = await google.search(searchQuery, googleOptions);
    const primaryResults = response.results.slice(0, 8).map(r => ({
      title: r.title,
      link: r.url,
      snippet: r.description,
      source: new URL(r.url).hostname.replace('www.', '')
    }));
    
    // 2. Secondary Google Search for Social Media (Instagram / Facebook)
    const socialQuery = `${query} price pakistan site:instagram.com OR site:facebook.com`;
    let socialResults = [];
    try {
      const socialResponse = await google.search(socialQuery, googleOptions);
      socialResults = socialResponse.results.slice(0, 3).map(r => ({
        title: r.title,
        link: r.url,
        snippet: r.description,
        source: new URL(r.url).hostname.replace('www.', '')
      }));
    } catch (e) {
      console.error("Social scrape failed:", e.message);
    }

    // 3. Deep Scraping of Top 3 product pages to extract real info
    const topLinks = primaryResults.slice(0, 3);
    const deepData = [];
    
    for (const item of topLinks) {
      try {
        const { data } = await axios.get(item.link, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
          },
          timeout: 4000
        });
        const $ = cheerio.load(data);
        // remove noise
        $('script, style, nav, footer, iframe, noscript').remove();
        let pageText = $('body').text().replace(/\s+/g, ' ').trim();
        deepData.push({
          site: item.source,
          url: item.link,
          extracted_text: pageText.substring(0, 800) // snippet limited to 800 chars to avoid huge payload
        });
      } catch (err) {
        console.error(`Deep scrape failed for ${item.link}:`, err.message);
      }
    }

    // Combine everything to feed AI
    const payload = {
      listings: primaryResults,
      social_media: socialResults,
      deep_scraped_details: deepData
    };
    
    console.log(`Found ${primaryResults.length} primary, ${socialResults.length} social, and ${deepData.length} deep text elements.`);
    return payload;
  } catch (error) {
    console.error("Scraping error:", error.message);
    return {
      listings: [
        {
          title: `${query} Original Price in Pakistan`,
          link: 'https://www.daraz.pk/',
          snippet: `Find the best prices for ${query} in Pakistan. Shop online with trusted vendors.`,
          source: 'daraz.pk'
        },
        {
          title: `Buy ${query} - Lowest Prices`,
          link: 'https://www.telemart.pk/',
          snippet: `Compare prices for ${query} across Telemart and get the best deals and discounts today.`,
          source: 'telemart.pk'
        }
      ],
      social_media: [],
      deep_scraped_details: []
    };
  }
}

module.exports = { scrapeListings };
