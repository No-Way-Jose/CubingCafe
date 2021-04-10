const { composeWithMongoose } = require('graphql-compose-mongoose');
const { schemaComposer } = require('graphql-compose');
const { SessionModel, SolveModel } = require('./solve');

const SessionTC = composeWithMongoose(SessionModel);
const SolveTC = composeWithMongoose(SolveModel, {
  resolvers: {
    findMany: {
      filter: {
        operators: {
          time: ['gte', 'gt', 'lt', 'lte']
        }
      }
    }
  }
});

schemaComposer.createObjectTC({
  name: 'QuickStats',
  fields: {
    _id: { type: 'String' },
    slowest: { type: 'Float' },
    fastest: { type: 'Float' },
    avg: { type: 'Float' },
    count: { type: 'Float' }
  }
});

schemaComposer.createObjectTC({
  name: 'SolveCount',
  fields: { solves: 'Float' }
});

module.exports = { SessionTC, SolveTC };
