const { composeWithMongoose } = require('graphql-compose-mongoose');

const { SessionModel, SolveModel } = require('./solve');

const SessionTC = composeWithMongoose(SessionModel);
const SolveTC = composeWithMongoose(SolveModel);

module.exports = { SessionTC, SolveTC };
