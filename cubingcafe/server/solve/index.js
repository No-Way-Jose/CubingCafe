const { SessionTC, SolveTC } = require('./types');
const { addSorting, addResolvers } = require('../utils');
const resolvers = require('./resolvers');

addResolvers(SessionTC, resolvers);
addResolvers(SolveTC, resolvers);
addSorting(SessionTC);
addSorting(SolveTC);

module.exports = { SessionTC, SolveTC };
