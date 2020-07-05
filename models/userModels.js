const mongoose = require('mongoose');
// Structure of data
const userSchema = mongoose.Schema({
  username: { type: String },
  email: { type: String },
  password: { type: String },
});

module.exports = mongoose.model('User', userSchema);
