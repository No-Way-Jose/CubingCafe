const UserTC = require('./types');
const resolvers = require('./resolvers');
const { addSorting, addResolvers } = require('../utils');

addResolvers(UserTC, resolvers);
addSorting(UserTC);

module.exports = { UserTC };
