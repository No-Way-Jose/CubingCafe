const { schemaComposer } = require('graphql-compose');
const { composeWithMongoose } = require('graphql-compose-mongoose');

const UserModel = require('./user');

const UserTC = composeWithMongoose(UserModel, {
  removeFields: ['hash', 'salt'],
  resolvers: {
    findMany: {
      filter: {
        operators: {
          elo: ['gte', 'gt', 'lt', 'lte'],
          losses: ['gte', 'gt', 'lt', 'lte'],
          wins: ['gte', 'gt', 'lt', 'lte']
        }
      }
    }
  }
});

schemaComposer.createObjectTC({
  name: 'LoggedInUser',
  fields: { user: 'String!' }
});

schemaComposer.createObjectTC({
  name: 'NumOfUsers',
  fields: { max: 'Float' }
});

module.exports = UserTC;
