const mongoose = require('../../mongoose');
const { Schema } = mongoose;

const solveSchema = new Schema(
  {
    session: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
    time: { type: Number, required: true },
    user: { type: String, ref: 'User' },
    size: {
      type: String,
      enum: ['_2x2', '_3x3', '_4x4', '_5x5', '_6x6', '_7x7', '_8x8'],
      default: '_3x3'
    }
  },
  { timestamps: true }
);

const sessionSchema = new Schema(
  {
    user: { type: String, ref: 'User' }
  },
  { timestamps: true }
);

sessionSchema.statics.getSession = function (username) {
  return this.findOne({ user: username }, null, { sort: { createdAt: -1 } });
};

solveSchema.statics.getStats = function (username) {
  return this.aggregate([
    { $match: { user: username } },
    { $group: { _id: "$size", slowest: { $max: "$time"}, fastest: { $min: "$time" }, avg: { $avg: "$time" }, count: { $sum: 1 } } },
    { $sort: { count: -1 } }]);
};

solveSchema.statics.solveCount = function (username) {
  return this.count({ user: username })
};

const SolveModel = mongoose.model('Solve', solveSchema);
const SessionModel = mongoose.model('Session', sessionSchema);

module.exports = { SolveModel, SessionModel };
