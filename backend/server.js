const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Load Routes
const authRoutes = require('./routes/auth');
const searchRoutes = require('./routes/search');
const profileRoutes = require('./routes/profile');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/profile', profileRoutes);

const PORT = process.env.PORT || 5000;
const DB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pk_product_scout';

mongoose.connect(DB_URI)
  .then(() => {
    console.log('Connected to MongoDB:', DB_URI);
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
