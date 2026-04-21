const express = require('express');
const router = express.Router();
const { analyzeListings } = require('../services/aiService');
const SearchHistory = require('../models/SearchHistory');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ message: 'Query is required' });

    console.log(`Searching for: ${query}`);

    // 1. Perform AI analysis — always returns results (AI or smart fallback)
    const aiRecommendation = await analyzeListings(query);

    // 2. Save to history
    const historyEntry = await SearchHistory.create({
      userId: req.user._id,
      query,
      results: [],
      recommendation: aiRecommendation
    });

    // 3. Update user interests with keywords from the query (Spotify-style taste tracking)
    try {
      const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      const user = await User.findById(req.user._id);
      const combined = [...new Set([...keywords, ...user.interests])].slice(0, 30);
      user.interests = combined;
      await user.save();
    } catch (e) {
      console.error('Interest tracking error:', e.message);
    }

    res.json({
      query,
      listings: [],
      recommendation: aiRecommendation,
      historyId: historyEntry._id
    });

  } catch (error) {
    console.error("Search route error:", error);
    res.status(500).json({ message: 'Server error during search' });
  }
});

router.get('/history', protect, async (req, res) => {
  try {
    const history = await SearchHistory.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching history' });
  }
});

module.exports = router;
