const { schemaComposer } = require('graphql-compose');

require('./completed');
const { UserTC } = require('../user');
const { SessionTC, SolveTC } = require('../solve');

const isAuthenticated = async (resolve, source, args, context, info) => {
  const user = context.session.username;

  if (!user) { return Promise.reject(new Error('You must be logged in for this action')); }

  return resolve(source, args, context, info);
};

schemaComposer.Query.addFields({
  userById: UserTC.getResolver('findById'),
  userMany: UserTC.getResolver('findMany'),
  sessionMany: SessionTC.getResolver('findMany', [isAuthenticated]).wrapResolve(next => rp => {
    rp.args.filter = { user: rp.context.session.username };
    return next(rp);
  }),
  solveMany: SolveTC.getResolver('findMany', [isAuthenticated]).wrapResolve(next => rp => {
    rp.args.filter = { user: rp.context.session.username };
    return next(rp);
  }),
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
