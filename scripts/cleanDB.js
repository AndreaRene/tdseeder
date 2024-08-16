const models = require('../models');
const { staticDB } = require('../config/connection');

module.exports = async (modelName, collectionName) => {
    try {
        let modelExists = await staticDB.db
            .listCollections({
                name: collectionName
            })
            .toArray();

        if (modelExists.length) {
            await staticDB.dropCollection(collectionName);
        }
    } catch (err) {
        throw err;
    }
};
