const { schemaComposer } = require('graphql-compose');

schemaComposer.createObjectTC({
  name: 'Completed',
  fields: { completed: 'Boolean!' }
});
