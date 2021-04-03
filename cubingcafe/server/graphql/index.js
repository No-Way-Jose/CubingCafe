const { schemaComposer } = require('graphql-compose');

require('./completed');
const { UserTC } = require('../user');
const { SessionTC, SolveTC } = require('../solve');

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

schemaComposer.Query.addFields({
  userById: UserTC.getResolver('findById'),
  userMany: UserTC.getResolver('findMany'),
  sessionMany: SessionTC.getResolver('findMany', [isAuthenticated, setUserInFilter]),
  solveMany: SolveTC.getResolver('findMany', [isAuthenticated, setUserInFilter]),
  getSession: SessionTC.getResolver('getSession', [isAuthenticated])
});

schemaComposer.Mutation.addFields({
  signIn: UserTC.getResolver('signIn'),
  signUp: UserTC.getResolver('signUp'),
  signOut: UserTC.getResolver('signOut'),
  createSession: SessionTC.getResolver('createSession', [isAuthenticated]),
  insertSolve: SolveTC.getResolver('createOne', [isAuthenticated]).wrapResolve(next => rp => {
    rp.args.record.user = rp.context.session.username;
    return next(rp);
  })
});

const schema = schemaComposer.buildSchema();

module.exports = schema;
