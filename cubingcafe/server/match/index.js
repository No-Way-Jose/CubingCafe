const { MatchTC, QueueTC } = require('./types');
const { addSorting, addResolvers } = require('../utils');
const resolvers = require('./resolvers');

addResolvers(MatchTC, resolvers);
addSorting(MatchTC);
addSorting(QueueTC);

module.exports = { MatchTC, QueueTC };
