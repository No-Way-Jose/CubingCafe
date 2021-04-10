module.exports = {
  addSorting (TC) {
    const fields = TC.getFields();
    for (const field in fields) {
      if (field !== '_id') {
        const ascValue = {};
        ascValue[field] = 1;

        const descValue = {};
        descValue[field] = -1;

        const asc = { name: field.toUpperCase() + '_ASC', value: ascValue };
        const desc = { name: field.toUpperCase() + '_DESC', value: descValue };

        TC.getResolver('findMany').addSortArg(asc).addSortArg(desc);
      }
    }
  },
  addResolvers (TC, resolvers) {
    for (const resolver in resolvers) {
      TC.addResolver(resolvers[resolver]);
    }
  }
};
