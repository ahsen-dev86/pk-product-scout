const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Wraps a promise with a timeout. Rejects with a timeout error if too slow.
 */
function withTimeout(promise, ms = 25000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Request timed out after ${ms / 1000}s`)), ms)
    )
  ]);
}

/**
 * Convert any URL into a safe store search URL that will never 404.
 * Product-specific pages often 404; search pages always work.
 */
function makeSafeStoreUrl(url, query) {
  const q = encodeURIComponent(query);
  try {
    const host = new URL(url).hostname.replace('www.', '');
    if (host.includes('daraz.pk'))        return `https://www.daraz.pk/catalog/?q=${q}`;
    if (host.includes('priceoye.pk'))     return `https://priceoye.pk/search?search=${q}`;
    if (host.includes('telemart.pk'))     return `https://www.telemart.pk/search/?s=${q}`;
    if (host.includes('shophive.com'))    return `https://shophive.com/?s=${q}`;
    if (host.includes('ishopping.pk'))    return `https://www.ishopping.pk/search?q=${q}`;
    if (host.includes('homeshopping.pk')) return `https://www.homeshopping.pk/search?term=${q}`;
    if (host.includes('goto.com.pk'))     return `https://goto.com.pk/search?q=${q}`;
    if (host.includes('symbios.pk'))      return `https://www.symbios.pk/search?q=${q}`;
    // For social media, keep as-is since they're pages not product URLs
    if (host.includes('instagram.com') || host.includes('facebook.com')) return url;
    // For unknown domains, return the homepage (safe)
    return new URL(url).origin;
  } catch {
    return url;
  }
}

/**
 * Generates fallback recommendations using static search links.
 * Used when the AI call fails or times out.
 */
function buildFallback(query) {
  const q = encodeURIComponent(query);
  return {
    recommendations: [
      {
        title: `${query} — Best Prices on Daraz`,
        price: 'See website for latest price',
        link: `https://www.daraz.pk/catalog/?q=${q}`,
        source: 'Daraz',
        trust_rating: 'High',
        trust_reasoning: 'Daraz is Pakistan\'s largest e-commerce platform with buyer protection and easy returns.',
        features: ['Verified seller ratings', 'Cash on delivery available', 'Easy returns policy'],
        reasoning: 'Daraz is the most trusted platform in Pakistan with the widest product selection and competitive prices.'
      },
      {
        title: `${query} — Compare Prices on PriceOye`,
        price: 'Compare multiple stores',
        link: `https://priceoye.pk/search?search=${q}`,
        source: 'PriceOye',
        trust_rating: 'High',
        trust_reasoning: 'PriceOye aggregates prices from multiple verified Pakistani retailers.',
        features: ['Price comparison across stores', 'Spec comparison', 'User reviews'],
        reasoning: 'Best for comparing prices across multiple Pakistani retailers before buying.'
      },
      {
        title: `${query} — Official Store at Telemart`,
        price: 'See website for latest price',
        link: `https://www.telemart.pk/search/?s=${q}`,
        source: 'Telemart',
        trust_rating: 'High',
        trust_reasoning: 'Telemart is an established Pakistani retailer with physical stores and warranty support.',
        features: ['Official warranty', 'After-sales support', 'Cash on delivery'],
        reasoning: 'Telemart is a reliable Pakistani electronics retailer with strong after-sales support.'
      }
    ],
    social_links: [],
    summary: `Showing search results for "${query}" across top Pakistani online stores. Click any store link to browse current listings, prices, and deals. Prices in Pakistan can vary — comparing across Daraz, PriceOye, and Telemart is recommended for the best deal.`
  };
}

// ── Main Export ───────────────────────────────────────────────────────────────

async function analyzeListings(query) {
  try {
    console.log(`[AI] Starting grounded search for: ${query}`);

    // STEP 1: Grounded search with Google Search tool
    // IMPORTANT: In @google/genai v1.x, tools must be inside `config`, NOT top-level
    const groundedResponse = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `You are a shopping research assistant for Pakistani consumers.
Use Google Search to research: "${query} buy online Pakistan price 2025"

Provide a research report with:
- Store names where this product is sold in Pakistan (Daraz, Telemart, PriceOye, Shophive, etc.)
- Prices in Pakistani Rupees (PKR)
- Key product specifications
- Seller trust indicators
- Any Instagram or Facebook sellers in Pakistan`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      }),
      25000 // 25 second timeout
    );

    const groundedText = groundedResponse.text;
    console.log(`[AI] Grounded search complete. Text length: ${groundedText?.length}`);

    // Extract citation URLs from grounding metadata
    let citationUrls = [];
    try {
      const chunks = groundedResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      citationUrls = chunks.filter(c => c.web?.uri).map(c => ({ url: c.web.uri, title: c.web.title || '' }));
      console.log(`[AI] Found ${citationUrls.length} citation URLs`);
    } catch (e) {}

    // Convert all citation URLs to safe search URLs
    const safeSourceLinks = citationUrls.length > 0
      ? citationUrls.map(u => `${u.title}: ${makeSafeStoreUrl(u.url, query)}`).join('\n')
      : `Daraz: https://www.daraz.pk/catalog/?q=${encodeURIComponent(query)}
PriceOye: https://priceoye.pk/search?search=${encodeURIComponent(query)}
Telemart: https://www.telemart.pk/search/?s=${encodeURIComponent(query)}`;

    // STEP 2: Format into JSON (no tools — JSON mode only)
    const formatResponse = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `You are a JSON formatter for a Pakistani shopping assistant.
Format the research below about "${query}" into structured JSON.

RESEARCH:
${groundedText}

SAFE STORE SEARCH LINKS (MUST use these for "link" fields — they are guaranteed to work):
${safeSourceLinks}

Rules:
- The "link" field MUST use one of the safe store links above. NEVER invent or modify URLs.
- Extract real prices from the research (format: "Rs. X,XXX" or "PKR X,XXX")
- If exact price not found, write "Check website for current price"

Return ONLY valid JSON, no markdown fences:
{
  "recommendations": [
    {
      "title": "Specific product title",
      "price": "Rs. X,XXX or price range",
      "link": "Safe store search link from above",
      "source": "Store name",
      "trust_rating": "High / Medium / Low",
      "trust_reasoning": "One sentence reason",
      "features": ["Feature 1", "Feature 2", "Feature 3"],
      "reasoning": "Why this is a good option"
    }
  ],
  "social_links": [
    {
      "platform": "Instagram or Facebook",
      "link": "URL only if found in research",
      "title": "Page description"
    }
  ],
  "summary": "2-3 sentence market summary including typical price range in PKR"
}
Limit: 3 recommendations, 2 social links. Return ONLY valid JSON.`,
        config: { responseMimeType: 'application/json' },
      }),
      20000 // 20 second timeout
    );

    const parsed = JSON.parse(formatResponse.text);
    console.log(`[AI] JSON formatted successfully with ${parsed.recommendations?.length} recommendations`);

    // Final safety pass: re-sanitize all links in the response
    if (parsed.recommendations) {
      parsed.recommendations = parsed.recommendations.map(item => ({
        ...item,
        link: item.link ? makeSafeStoreUrl(item.link, query) : `https://www.daraz.pk/catalog/?q=${encodeURIComponent(query)}`
      }));
    }

    return parsed;

  } catch (error) {
    console.error('[AI] analyzeListings failed:', error.message);
    console.log('[AI] Returning fallback search links...');
    // Return intelligent fallback with real working links instead of an error
    return buildFallback(query);
  }
}

module.exports = { analyzeListings, makeSafeStoreUrl };
