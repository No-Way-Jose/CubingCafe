const { composeWithMongoose } = require('graphql-compose-mongoose');

const { MatchModel, QueueModel } = require('./match');

const MatchTC = composeWithMongoose(MatchModel, { removeFields: ['user1PeerId', 'user2PeerId'] });
const QueueTC = composeWithMongoose(QueueModel, { removeFields: ['peerId'] });

module.exports = { MatchTC, QueueTC };
