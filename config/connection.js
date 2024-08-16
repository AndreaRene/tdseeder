require('dotenv').config();
const mongoose = require('mongoose');

// Verify that environment variables are set
if (!process.env.TDSD_01_URI) {
  throw new Error('Environment variable TDSD_01_URI must be set');
}

// Log the URI being used (for debugging purposes)
console.log('Connecting to TDSD_01_URI:', process.env.TDSD_01_URI);

// Connect to the static data database
const staticDB = mongoose.createConnection(process.env.TDSD_01_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import and initialize models with the specific connection
const Deck = require('../models/Deck')(staticDB);
const Card = require('../models/Card')(staticDB);
const Spread = require('../models/Spread')(staticDB);
const Avatar = require('../models/Avatar')(staticDB);

// Export the connection and models for use in other parts of the application
module.exports = { staticDB, Deck, Card, Spread, Avatar };
