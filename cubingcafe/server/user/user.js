const { generateHash } = require('./utils');
const mongoose = require('../../mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    _id: String,
    salt: String,
    hash: String,
    elo: Number,
    wins: Number,
    losses: Number
  },
  { timestamps: true }
);

UserSchema.statics.userExists = function (username) {
  return this.findOne({ _id: username });
};

UserSchema.methods.validatePassword = function (pass) {
  return generateHash(pass, this.salt) === this.hash;
};

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
