const mongoose = require('mongoose');

const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost/cubingCafeDB';

const connect = () => {
  console.log('Attempting Mongo connection');
  mongoose
    .connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .catch(error => {
      console.error(error);
      console.log('Initial connection to Mongo failed, retrying in 15 seconds');
      setTimeout(connect, 15000);
    });
};

mongoose.connection.on('open', () => console.log('Mongo connected'));

mongoose.connection.on('disconnected', () => console.log('Mongo disconnected.'));

connect();

module.exports = mongoose;
