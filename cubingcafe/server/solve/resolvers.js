const { SessionModel } = require('./solve');

const createSession = {
  name: 'createSession',
  type: 'Session!',
  resolve: async ({ context: { session } }) => {
    return new Promise((resolve, reject) => {
      const ses = SessionModel({ user: session.username }).save();
      resolve(ses);
    });
  }
};

const getSession = {
  name: 'getSession',
  type: 'Session!',
  resolve: async ({ context: { session } }) => {
    return new Promise((resolve, reject) => {
      SessionModel.getSession(session.username).then((ses) => {
        if (ses) { return resolve(ses); }
        return SessionModel({ user: session.username }).save();
      }).then((ses) => {
        return resolve(ses);
      }).catch((err) => {
        return reject(new Error('Internal Server Error: ' + err));
      });
    });
  }
};

module.exports = { createSession, getSession };
