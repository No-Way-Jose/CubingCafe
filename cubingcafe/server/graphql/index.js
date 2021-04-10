const { schemaComposer } = require('graphql-compose');
const validator = require('validator');

require('./completed');
const { UserTC } = require('../user');
const { SessionTC, SolveTC } = require('../solve');
const { MatchTC, QueueTC } = require('../match');

const isAuthenticated = async (resolve, source, args, context, info) => {
  const user = context.session.username;

  if (!user) { return Promise.reject(new Error('You must be logged in for this action')); }

  return resolve(source, args, context, info);
};

const setUserInFilter = async (resolve, source, args, context, info) => {
  const user = context.session.username;
  if (args.filter) {
    if (args.filter.user && args.filter.user !== user) {
      return Promise.reject(new Error('Access denied'));
    }
    args.filter.user = user;
  } else {
    args.filter = { user };
  }
  return resolve(source, args, context, info);
};

const validateUserStrings = async (resolve, source, args, context, info) => {
  let { username, password } = args;

  username = validator.trim(username);
  username = validator.escape(username);
  if (!validator.isLength(username, { min: 1, max: 30 })) {
    return Promise.reject(new Error('Error: Username is not between 1 and 30 characters.'));
  }

  if (!validator.isLength(password, { min: 8 })) {
    return Promise.reject(new Error('Error: Password is too short.'));
  }

  Object.assign(args, { username });

  return resolve(source, args, context, info);
};

schemaComposer.Query.addFields({
  userById: UserTC.getResolver('findById'),
  userMany: UserTC.getResolver('findMany'),
  userCount: UserTC.getResolver('userCount'),
  sessionMany: SessionTC.getResolver('findMany', [isAuthenticated, setUserInFilter]),
  solveMany: SolveTC.getResolver('findMany', [isAuthenticated, setUserInFilter]),
  getSession: SessionTC.getResolver('getSession', [isAuthenticated]),
  matchMany: MatchTC.getResolver('findMany', [isAuthenticated]),
  queueMany: QueueTC.getResolver('findMany', [isAuthenticated]),
  userWinsOrLosses: MatchTC.getResolver('findUserWinsOrLosses', [isAuthenticated]),
  getStats: SolveTC.getResolver('getStats', [isAuthenticated]),
  solveCount: SolveTC.getResolver('count', [isAuthenticated, setUserInFilter])
});

schemaComposer.Mutation.addFields({
  signIn: UserTC.getResolver('signIn', [validateUserStrings]),
  signUp: UserTC.getResolver('signUp', [validateUserStrings]),
  signOut: UserTC.getResolver('signOut'),
  createSession: SessionTC.getResolver('createSession', [isAuthenticated]),
  insertSolve: SolveTC.getResolver('createOne', [isAuthenticated]).wrapResolve(next => rp => {
    rp.args.record.user = rp.context.session.username;
    return next(rp);
  })
});

const schema = schemaComposer.buildSchema();

module.exports = schema;
