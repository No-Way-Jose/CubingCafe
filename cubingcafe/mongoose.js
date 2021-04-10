const mongoose = require('mongoose');

const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost/cubingCafeDB';
mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .catch(error => console.error.bind(console, error));

mongoose.connection.on('open', () => console.log.bind(console, 'Mongo connected'));

module.exports = mongoose;
