const { MatchModel } = require('./match');

const findUserWinsOrLosses = {
  name: 'findUserWinsOrLosses',
  type: ['Match!'],
  args: {
    username: 'String',
    losses: 'Boolean'
  },
  resolve: async ({ args: { username, losses } }) => {
    const func = losses ? MatchModel.findLosses : MatchModel.findWins;
    return new Promise((resolve, reject) => {
      func.call(MatchModel, username)
        .then(res => resolve(res))
        .catch(err => reject(new Error('Internal server error: ' + err)));
    });
  }
};

module.exports = { findUserWinsOrLosses };
