const mongoose = require('../../mongoose');
const { Schema } = mongoose;

const queueSchema = new Schema(
  {
    _id: { type: String, ref: 'User', required: true },
    elo: { type: Number, required: true },
    peerId: { type: String, required: true }
  },
  { timestamps: true }
);

queueSchema.statics.findInQueue = function (_id) {
  return this.findOne({ _id });
};

const matchSchema = new Schema(
  {
    user1: { type: String, ref: 'User', required: true },
    user1PeerId: { type: String, required: true },
    user2: { type: String, ref: 'User', required: true },
    user2PeerId: { type: String, required: true },
    user1Time: Number,
    user2Time: Number,
    user1Win: { type: Number, required: true },
    user2Win: { type: Number, required: true },
    completed: { type: Boolean, required: true },
    scramble: {
      state: { type: String, required: true },
      scrambleString: { type: String, required: true }
    }
  },
  { timestamps: true }
);

const MatchModel = mongoose.model('Match', matchSchema);
const QueueModel = mongoose.model('QueuedUsers', queueSchema);

module.exports = { MatchModel, QueueModel };
