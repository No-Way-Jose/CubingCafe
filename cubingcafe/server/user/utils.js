const crypto = require('crypto');

const generateHash = function (pass, salt) {
  const hash = crypto.createHmac('sha512', salt);
  hash.update(pass);
  return hash.digest('base64');
};

const generateSalt = function () {
  return crypto.randomBytes(16).toString('base64');
};

module.exports = { generateHash, generateSalt };
