const { generateSalt, generateHash } = require('./utils');
const UserModel = require('./user');
const cookie = require('cookie');

const signIn = {
  name: 'signIn',
  type: 'LoggedInUser!',
  args: {
    username: 'String!',
    password: 'String!'
  },
  resolve: async ({ args: { username, password }, context: { session, res } }) => {
    return new Promise((resolve, reject) => {
      UserModel.userExists(username).then(function (user) {
        if (!user) reject(new Error('Invalid credentials.'));
        return { valid: user.validatePassword(password), user };
      }).then(function ({ valid, user }) {
        if (!valid) { reject(new Error('Invalid credentials.')); }
        session.username = user._id;
        res.setHeader('Set-Cookie', cookie.serialize('username', user._id, {
          path: '/',
          secure: true,
          sameSite: true,
          maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
        }));
        resolve({ user: user._id });
      }).catch(function (err) {
        reject(new Error('Internal server error: ' + err));
      });
    });
  }
};

const signUp = {
  name: 'signUp',
  type: 'LoggedInUser!',
  args: {
    username: 'String!',
    password: 'String!'
  },
  resolve: async ({ args: { username, password }, context: { session, res } }) => {
    return new Promise((resolve, reject) => {
      UserModel.userExists(username).then(function (user) {
        if (user) { reject(new Error('Username already taken.')); }
        const salt = generateSalt();
        const hash = generateHash(password, salt);
        return UserModel({ _id: username, salt, hash, elo: 750, wins: 3, losses: 0 }).save();
      }).then(function (result) {
        session.username = result._id;
        res.setHeader('Set-Cookie', cookie.serialize('username', result._id, {
          path: '/',
          secure: true,
          sameSite: true,
          maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
        }));
        resolve({ user: result._id });
      }).catch(function (err) {
        reject(new Error('Internal server error: ' + err));
      });
    });
  }
};

const signOut = {
  name: 'signOut',
  type: 'Completed!',
  resolve: async ({ context: { session, res } }) => {
    return new Promise((resolve, reject) => {
      session.username = null;
      res.setHeader('Set-Cookie', cookie.serialize('username', null, {
        path: '/',
        secure: true,
        sameSite: true,
        maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
      }));
      resolve({ completed: true });
    });
  }
};

const userCount = {
  name: 'userCount',
  type: 'NumOfUsers!',
  resolve: async () => {
    return new Promise((resolve, reject) => {
      UserModel.getNumOfUsers().then((ses) => {
        return resolve({ max: ses });
      }).catch((err) => {
        return reject(new Error('Internal Server Error: ' + err));
      });
    });
  }
};

module.exports = { signIn, signUp, signOut, userCount };
