const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const { GoogleGenAI } = require('@google/genai');
const { makeSafeStoreUrl } = require('../services/aiService');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/** Wraps a promise with a hard timeout */
function withTimeout(promise, ms = 25000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Request timed out after ${ms / 1000}s`)), ms)
    )
  ]);
}

/** Build safe fallback search links for any keyword */
function buildFallbackLinks(keyword) {
  const q = encodeURIComponent(keyword);
  return [
    `Daraz: https://www.daraz.pk/catalog/?q=${q}`,
    `PriceOye: https://priceoye.pk/search?search=${q}`,
    `Telemart: https://www.telemart.pk/search/?s=${q}`,
    `Shophive: https://shophive.com/?s=${q}`,
  ].join('\n');
}

// ── GET /api/profile ─────────────────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── PUT /api/profile ─────────────────────────────────────────────────────────
router.put('/', protect, async (req, res) => {
  try {
    const { name, city, phone, preferences } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name !== undefined) user.name = name;
    if (city !== undefined) user.city = city;
    if (phone !== undefined) user.phone = phone;
    if (preferences !== undefined) user.preferences = preferences;

    await user.save();
    const updated = await User.findById(req.user._id).select('-password');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── GET /api/profile/recommendations ─────────────────────────────────────────
router.get('/recommendations', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const interests = user.interests || [];
    const preferences = user.preferences || [];

    if (interests.length === 0 && preferences.length === 0) {
      return res.json({ recommendations: [], message: 'Search for products to build your taste profile!' });
    }

    const topKeyword = interests[0] || preferences[0] || 'electronics';
    const context = [
      preferences.length > 0 ? `Category preferences: ${preferences.join(', ')}` : '',
      interests.length > 0 ? `Past search interests: ${interests.slice(0, 15).join(', ')}` : '',
      user.city ? `Located in: ${user.city}` : '',
    ].filter(Boolean).join('\n');

    let groundedText = '';
    let citationUrls = [];

    try {
      // IMPORTANT: tools must be inside config in @google/genai v1.x
      const groundedResponse = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: `You are a personal shopping assistant for a Pakistani user.
User profile:
${context}

Use Google Search to find 4 specific products this user would love, available in Pakistan.
Search Pakistani stores: Daraz, Telemart, PriceOye, Shophive.
Report: store name, product name, price in PKR, and why it matches the user's interests.`,
          config: { tools: [{ googleSearch: {} }] },
        }),
        25000
      );

      groundedText = groundedResponse.text;
      const chunks = groundedResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      citationUrls = chunks.filter(c => c.web?.uri).map(c => ({ url: c.web.uri, title: c.web.title || '' }));
    } catch (e) {
      console.error('[Recommendations] Grounding failed:', e.message);
    }

    // Build safe links from citations or use fallback
    const safeLinks = citationUrls.length > 0
      ? citationUrls.map(u => `${u.title}: ${makeSafeStoreUrl(u.url, topKeyword)}`).join('\n')
      : buildFallbackLinks(topKeyword);

    // If we have no grounded text, build static fallback recommendations
    if (!groundedText) {
      const q = encodeURIComponent(topKeyword);
      return res.json({
        recommendations: [
          {
            title: `Best ${topKeyword} deals on Daraz`,
            price: 'View current prices',
            link: `https://www.daraz.pk/catalog/?q=${q}`,
            source: 'Daraz',
            reason: `Based on your interest in ${topKeyword}`,
            category: preferences[0] || 'For You'
          },
          {
            title: `Compare ${topKeyword} prices on PriceOye`,
            price: 'Compare all stores',
            link: `https://priceoye.pk/search?search=${q}`,
            source: 'PriceOye',
            reason: `Find the lowest price for ${topKeyword} in Pakistan`,
            category: preferences[0] || 'Deals'
          },
          {
            title: `${topKeyword} at Telemart`,
            price: 'View current prices',
            link: `https://www.telemart.pk/search/?s=${q}`,
            source: 'Telemart',
            reason: `Telemart offers warranty and after-sales support for ${topKeyword}`,
            category: preferences[0] || 'Verified'
          }
        ]
      });
    }

    // Format grounded text into JSON — NO tools here (JSON mode only)
    try {
      const formatResponse = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: `Format this shopping research into JSON for a Pakistani user.

USER INTERESTS: ${interests.slice(0, 10).join(', ')}

RESEARCH:
${groundedText}

SAFE STORE LINKS (MUST use these as "link" values):
${safeLinks}

Return ONLY this JSON (no markdown):
{
  "recommendations": [
    {
      "title": "Specific Product Name",
      "price": "Rs. X,XXX or price range in PKR",
      "link": "Safe store link from above matching this item",
      "source": "Store name (Daraz / Telemart / PriceOye etc)",
      "reason": "Why this matches the user's interests (1 sentence)",
      "category": "Category label"
    }
  ]
}
Limit to 4 items. Return valid JSON only.`,
          config: { responseMimeType: 'application/json' }
        }),
        20000
      );

      return res.json(JSON.parse(formatResponse.text));
    } catch (e) {
      console.error('[Recommendations] Format failed:', e.message);
      // Fall through to static fallback
      const q = encodeURIComponent(topKeyword);
      return res.json({
        recommendations: [
          { title: `${topKeyword} on Daraz`, price: 'See website', link: `https://www.daraz.pk/catalog/?q=${q}`, source: 'Daraz', reason: `Best selection for ${topKeyword}`, category: 'For You' },
          { title: `${topKeyword} on PriceOye`, price: 'Compare prices', link: `https://priceoye.pk/search?search=${q}`, source: 'PriceOye', reason: 'Compare prices across stores', category: 'Best Value' },
        ]
      });
    }

  } catch (error) {
    console.error('[Recommendations] Error:', error.message);
    res.status(500).json({ message: 'Failed to generate recommendations' });
  }
});

// ── GET /api/profile/trending ─────────────────────────────────────────────────
router.get('/trending', protect, async (req, res) => {
  try {
    let groundedText = '';
    let citationUrls = [];

    try {
      // IMPORTANT: tools must be inside config in @google/genai v1.x
      const groundedResponse = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: `Use Google Search to find:
1. The top 4 trending products being bought in Pakistan right now this month
2. 3 products with major discounts/deals available right now in Pakistan (include exact % off)
3. Upcoming major online sale events in Pakistan in 2025 (Daraz sales, Eid sales, etc.)

For each item: store name, product name, price in PKR, discount if applicable.`,
          config: { tools: [{ googleSearch: {} }] },
        }),
        25000
      );

      groundedText = groundedResponse.text;
      const chunks = groundedResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      citationUrls = chunks.filter(c => c.web?.uri).map(c => ({ url: c.web.uri, title: c.web.title || '' }));
    } catch (e) {
      console.error('[Trending] Grounding failed:', e.message);
    }

    // Build safe links or use fallbacks
    const safeLinks = citationUrls.length > 0
      ? citationUrls.map(u => `${u.title}: ${makeSafeStoreUrl(u.url, 'trending')}`).join('\n')
      : `Daraz: https://www.daraz.pk/
Telemart deals: https://www.telemart.pk/
PriceOye: https://priceoye.pk/
Shophive: https://shophive.com/`;

    // Static fallback if grounding failed entirely
    if (!groundedText) {
      return res.json({
        trending: [
          { title: 'Samsung Galaxy Smartphones', price: 'From Rs. 45,000', link: 'https://www.daraz.pk/catalog/?q=samsung+galaxy', source: 'Daraz', reason: 'Top-selling smartphones in Pakistan' },
          { title: 'Dawlance Refrigerators', price: 'From Rs. 55,000', link: 'https://www.daraz.pk/catalog/?q=dawlance+refrigerator', source: 'Daraz', reason: 'Most popular home appliance brand in Pakistan' },
          { title: 'Haier Air Conditioner 1.5 Ton', price: 'From Rs. 90,000', link: 'https://www.telemart.pk/search/?s=haier+ac', source: 'Telemart', reason: 'Best-selling AC ahead of summer in Pakistan' },
          { title: 'iPhone 15 Series', price: 'From Rs. 250,000', link: 'https://priceoye.pk/search?search=iphone+15', source: 'PriceOye', reason: 'Highly searched premium smartphone in Pakistan' },
        ],
        deals: [
          { title: 'Daraz Flash Sale — Electronics', original_price: 'Various', sale_price: 'Up to 50% off', discount: 'Up to 50% off', link: 'https://www.daraz.pk/', source: 'Daraz', expires: 'Check website for current sales' },
          { title: 'Telemart Weekly Deals', original_price: 'Various', sale_price: 'Up to 30% off', discount: 'Up to 30% off', link: 'https://www.telemart.pk/', source: 'Telemart', expires: 'Weekly rotating deals' },
          { title: 'PriceOye Price Drops', original_price: 'Various', sale_price: 'Best prices', discount: 'Price comparison', link: 'https://priceoye.pk/', source: 'PriceOye', expires: 'Real-time price tracking' },
        ],
        upcoming_sales: [
          { name: 'Daraz Summer Sale', date: 'May–June 2025', description: 'Major discounts on electronics, fashion, and appliances ahead of summer' },
          { name: 'Daraz Eid Sale', date: 'Eid al-Adha 2025', description: 'Biggest annual sale with deals across all categories' },
          { name: 'Mid-Year Mega Sale', date: 'July 2025', description: 'Mid-year clearance with brand promotions and cash back offers' },
        ]
      });
    }

    // Format grounded text into JSON — NO tools for JSON mode
    try {
      const formatResponse = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: `Format this Pakistan shopping trends research into JSON.

RESEARCH:
${groundedText}

SAFE STORE LINKS (MUST use these for "link" fields):
${safeLinks}

Return ONLY this JSON (no markdown):
{
  "trending": [
    {
      "title": "Product Name (specific, with brand)",
      "price": "Rs. X,XXX or price range",
      "link": "Best matching safe store link from above",
      "source": "Store name",
      "reason": "Why it's trending in Pakistan right now"
    }
  ],
  "deals": [
    {
      "title": "Specific Product on Sale",
      "original_price": "Rs. X,XXX",
      "sale_price": "Rs. X,XXX",
      "discount": "XX% off",
      "link": "Best matching safe store link from above",
      "source": "Store",
      "expires": "When deal ends or 'Limited Time'"
    }
  ],
  "upcoming_sales": [
    {
      "name": "Sale Event Name",
      "date": "Expected date or month",
      "description": "What discounts to expect"
    }
  ]
}
Limit: 4 trending, 3 deals, 3 upcoming_sales. Valid JSON only.`,
          config: { responseMimeType: 'application/json' }
        }),
        20000
      );

      return res.json(JSON.parse(formatResponse.text));
    } catch (e) {
      console.error('[Trending] Format step failed:', e.message);
      // Fallback with real working links
      return res.json({
        trending: [
          { title: 'View All Trending Products', price: 'Various', link: 'https://www.daraz.pk/', source: 'Daraz', reason: 'Browse all currently trending products on Pakistan\'s largest store' },
        ],
        deals: [
          { title: 'Current Flash Deals', original_price: 'Various', sale_price: 'Up to 70% off', discount: 'Up to 70% off', link: 'https://www.daraz.pk/', source: 'Daraz', expires: 'Limited time' },
        ],
        upcoming_sales: [
          { name: 'Daraz Upcoming Sales', date: 'Check website', description: 'Visit Daraz for the latest upcoming sale announcements' }
        ]
      });
    }

  } catch (error) {
    console.error('[Trending] Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch trending data' });
  }
});

module.exports = router;
