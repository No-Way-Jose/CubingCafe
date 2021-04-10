const { composeWithMongoose } = require('graphql-compose-mongoose');

const { MatchModel, QueueModel } = require('./match');

const MatchTC = composeWithMongoose(MatchModel).removeField(['user1PeerId', 'user2PeerId']);
const QueueTC = composeWithMongoose(QueueModel).removeField('peerId');

module.exports = { MatchTC, QueueTC };
