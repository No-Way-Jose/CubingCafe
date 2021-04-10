const express = require('express');
const serveStatic = require('serve-static');
const path = require('path');
const socketio = require('socket.io');
const bodyParser = require('body-parser');

const { ExpressPeerServer } = require('peer');
const { graphqlHTTP } = require('express-graphql');

const peerOptions = {
  debug: true,
  path: '/peerjs'
};

const https = require('https');
const http = require('http');
const fs = require('fs');

const cookie = require('cookie');
const session = require('express-session');

const sessionMiddleware = session({
  secret: 'heh super duper secret',
  resave: false,
  saveUninitialized: true,
  cookie: { httpOnly: true, secure: true, sameSite: true, path: '/' }
});

// Create server
const app = express();
app.set('trust proxy', 1);

let server;
if (!process.env.PORT) {
  const privateKey = fs.readFileSync('server.key');
  const certificate = fs.readFileSync('server.crt');
  const config = {
    key: privateKey,
    cert: certificate
  };
  // for localhost b/c https is required for camera to work when connecting over LAN
  server = https.createServer(config, app).listen(8080, (err) => {
    if (err) console.log(err);
    else console.log('HTTPS server on https://localhost:%s', 8080);
  });
} else {
  // heroku handles certificates itself
  server = http.createServer(app).listen(process.env.PORT, (err) => {
    if (err) console.log(err);
    else console.log('HTTP server on http://localhost:%s', process.env.PORT);
  });
}

app.use(bodyParser.json());
app.use(sessionMiddleware);

app.use(function (req, res, next) {
  const username = (req.session.username) ? req.session.username : '';
  res.setHeader('Set-Cookie', cookie.serialize('username', username, {
    path: '/',
    secure: true,
    sameSite: true,
    maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
  }));
  next();
});

// here we are configuring dist to serve app files
app.use('/', serveStatic(path.join(__dirname, '/dist')));

app.use(function (req, res, next) {
  const sensitiveTerms = ['signIn', 'signUp'];
  let sensitive = false;
  if (req.body.query) {
    sensitive = sensitiveTerms.some(term => req.body.query.includes(term));
  }
  if (!sensitive) console.log('HTTP request', req.method, req.url, req.body);
  else console.log('HTTP request', req.method, req.url, 'Attempting signIn or signUp');
  next();
});

const graphqlSchema = require('./server/graphql/');
app.use(
  '/graphql',
  graphqlHTTP((request, res) => {
    return {
      context: { startTime: Date.now(), session: request.session, res },
      graphiql: true,
      schema: graphqlSchema
    };
  })
);

const io = socketio(server);

// establish access to session within sockets
io.use((socket, next) => sessionMiddleware(socket.request, socket.request.res || {}, next));

require('./socket.js')(io);

const peerServer = ExpressPeerServer(server, peerOptions.path);

app.use(peerOptions.path, peerServer);

// this * route is to serve project on different page routes except root `/`
app.get(/.*/, function (req, res) {
  res.sendFile(path.join(__dirname, '/dist/index.html'));
});
