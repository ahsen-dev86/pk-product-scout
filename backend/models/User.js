const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, default: '' },
  city: { type: String, default: '' },
  phone: { type: String, default: '' },
  avatar: { type: String, default: '' },
  // User-selected category preferences (e.g. ["Electronics", "Fashion"])
  preferences: { type: [String], default: [] },
  // Auto-extracted interest keywords from search history (max 30 kept)
  interests: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
