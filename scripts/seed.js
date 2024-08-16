require('dotenv').config();
const { staticDB } = require('../config/connection.js');
const models = require('../models')(staticDB); // Use the index.js to initialize models with the connection
const { Deck, Card, Spread, Avatar } = models; // Destructure the models
const deckSeeds = require('../data/deckSeeds.json');
const spreadSeeds = require('../data/spreadSeeds.json');
const avatarSeeds = require('../data/avatarSeeds.json');

const cleanDB = require('./cleanDB');

staticDB.once('open', async () => {
  try {
    // Clean existing collections
    await cleanDB('Card', 'cards');
    await cleanDB('Deck', 'decks');
    await cleanDB('Spread', 'spreads');
    await cleanDB('Avatar', 'avatars');

    // Seed Spreads and Avatars
    await Spread.create(spreadSeeds);
    await Avatar.create(avatarSeeds);

    const deckIds = process.env.DECK_IDS.split(',');

    for (let i = 0; i < deckIds.length; i++) {
      const deckId = deckIds[i];

      // Find the corresponding deckSeed by deckId
      const deckSeed = deckSeeds.find((seed) => seed.deckId === deckId);

      if (!deckSeed) {
        console.warn(`No deck seed found for deckId: ${deckId}`);
        continue;
      }

      // Create the deck
      const deck = await Deck.create(deckSeed);

      // Load card seeds for the deck
      const cardSeeds = require(`../data/${deckSeed.cardSeeds}`);

      // Create each card for the deck
      let cardIds = [];
      for (const cardSeed of cardSeeds) {
        const card = await Card.create({
          ...cardSeed,
          deck: deck._id,
        });

        cardIds.push(card._id);
      }

      // Update deck with the card IDs
      await Deck.findByIdAndUpdate(deck._id, {
        $set: { cards: cardIds },
      });
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }

  console.log('All done!');
  process.exit(0);
});
