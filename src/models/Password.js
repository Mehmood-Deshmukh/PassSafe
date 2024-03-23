// models/Password.js

const mongoose = require('mongoose');

const passwordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  website: { type: String, required: true },
  password: { type: String, required: true },
});

module.exports = mongoose.model('Password', passwordSchema);
