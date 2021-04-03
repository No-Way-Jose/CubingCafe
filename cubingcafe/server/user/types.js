const { schemaComposer } = require('graphql-compose');
const { composeWithMongoose } = require('graphql-compose-mongoose');

const UserModel = require('./user');

const UserTC = composeWithMongoose(UserModel).removeField(['hash', 'salt']);

schemaComposer.createObjectTC({
  name: 'LoggedInUser',
  fields: { user: 'String!' }
});

module.exports = UserTC;
