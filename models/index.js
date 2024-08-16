module.exports = (connection) => {
  return {
    Card: require('./Card')(connection),
    Deck: require('./Deck')(connection),
    Spread: require('./Spread')(connection),
    Avatar: require('./Avatar')(connection),
  };
};
