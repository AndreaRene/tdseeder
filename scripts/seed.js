require('dotenv').config();
const { staticDB } = require('../config/connection.js');
const createCardModel = require('../models/Card');
const createDeckModel = require('../models/Deck');
const createSpreadModel = require('../models/Spread');
const createAvatarModel = require('../models/Avatar');
const deckSeeds = require('./deckSeeds.json');
const spreadSeeds = require('./spreadSeeds.json');
const avatarSeeds = require('./avatarSeeds.json');

const cleanDB = require('./cleanDB');

// Create models using the staticDB connection
const Card = createCardModel(staticDB);
const Deck = createDeckModel(staticDB);
const Spread = createSpreadModel(staticDB);
const Avatar = createAvatarModel(staticDB);

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
            const cardSeeds = require(`./${deckSeed.cardSeeds}`);

            // Create each card for the deck
            let cardIds = [];
            for (const cardSeed of cardSeeds) {
                const card = await Card.create({
                    ...cardSeed,
                    deck: deck._id
                });

                cardIds.push(card._id);
            }

            // Update deck with the card IDs
            await Deck.findByIdAndUpdate(deck._id, {
                $set: { cards: cardIds }
            });
        }
    } catch (err) {
        console.error(err);
        process.exit(1);
    }

    console.log('All done!');
    process.exit(0);
});
