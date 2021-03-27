const express = require('express')
const crypto = require('crypto')
const serveStatic = require('serve-static')
const path = require('path')
const socketio = require('socket.io')
const bodyParser = require('body-parser')

const { ExpressPeerServer } = require('peer')
const peerOptions = {
  debug: true,
  path: '/peerjs'
}

const { MongoClient } = require('mongodb')
const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost/'

const https = require('https')
const http = require('http')
const fs = require('fs')

const privateKey = fs.readFileSync('server.key')
const certificate = fs.readFileSync('server.crt')
const config = {
  key: privateKey,
  cert: certificate
}

const cookie = require('cookie')
const session = require('express-session')

const sessionMiddleware = session({
  secret: 'heh super duper secret',
  resave: false,
  saveUninitialized: true,
  cookie: { httpOnly: true, secure: true, sameSite: true }
})

const connectedUsers = []

// Create server
const app = express()
app.set('trust proxy', 1)

app.use(bodyParser.json())
app.use(sessionMiddleware)

app.use(function (req, res, next) {
  const username = (req.session.username) ? req.session.username : ''
  res.setHeader('Set-Cookie', cookie.serialize('username', username, {
    path: '/',
    secure: true,
    sameSite: true,
    maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
  }))
  next()
})

// here we are configuring dist to serve app files
app.use('/', serveStatic(path.join(__dirname, '/dist')))

app.use(function (req, res, next) {
  console.log('HTTP request', req.method, req.url, req.body)
  next()
})

const generateHash = (password, salt) => {
  const hash = crypto.createHmac('sha512', salt)
  hash.update(password)
  return hash.digest('base64')
}

MongoClient.connect(mongoUrl, (err, client) => {
  if (err) console.error(err)
  const db = client.db('cubingCafeDB')
  const queue = db.collection('users.matchqueue')
  const users = db.collection('users')
  const matches = db.collection('matches')

  app.post('/joinGame/', (req, res, next) => {
    connectedUsers.push(req.body.peerId)
    console.log(connectedUsers)
    res.json(connectedUsers.filter(val => val !== req.body.peerId))
  })
  const io = socketio(server)

  // establish access to session within sockets
  io.use((socket, next) => sessionMiddleware(socket.request, socket.request.res || {}, next))

  require('./socket.js')(io, queue, users, matches)
  // require('./socket.js')(io, mongodb, dbname);

  const peerServer = ExpressPeerServer(server, peerOptions.path)

  peerServer.on('connection', (client) => {
    // connectedUsers.push(client);
    console.log('Connected: ' + client.getId())
  })

  peerServer.on('disconnect', (client) => {
    console.log(client.getId())
    const clientId = client.getId()
    const i = connectedUsers.findIndex((id) => id === clientId)
    if (i !== -1) connectedUsers.splice(i, 1)
    console.log(`'client ${client} disconnected.'`)
  })

  app.use(peerOptions.path, peerServer)

  // curl -H "Content-Type: application/json" -X POST -d '{"username":"alice","password":"alice"}' -c cookie.txt localhost:3000/signup/
  app.post('/signup/',
    (req, res, next) => {
      const username = req.body.username
      const password = req.body.password
      users.findOne({ _id: username }, function (err, user) {
        if (err) return res.status(500).end(err)
        if (user) return res.status(409).end('username ' + username + ' already exists')
        const salt = crypto.randomBytes(16).toString('base64')
        const hash = generateHash(password, salt)
        users.insertOne({ _id: username, salt, hash, elo: 500 }, { upsert: true }, function (err) {
          if (err) return res.status(500).end(err)
          return res.json('user ' + username + ' signed up')
        })
      })
    }
  )

  // curl -H "Content-Type: application/json" -X POST -d '{"username":"alice","password":"alice"}' -c cookie.txt localhost:3000/signin/
  app.post('/signin/',
    (req, res, next) => {
      const username = req.body.username
      const password = req.body.password
      // retrieve user from the database
      users.findOne({ _id: username }, function (err, user) {
        if (err) return res.status(500).end(err)
        if (!user) return res.status(401).end('access denied')
        console.log(user)
        if (user.hash !== generateHash(password, user.salt)) return res.status(401).end('access denied') // invalid password
        // start a session
        req.session.username = user._id
        res.setHeader('Set-Cookie', cookie.serialize('username', user._id, {
          path: '/',
          secure: true,
          sameSite: true,
          maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
        }))
        console.log(req.session.username)
        return res.json('user ' + username + ' signed in')
      })
    }
  )

  // curl -b cookie.txt -c cookie.txt localhost:3000/signout/
  app.get('/signout/', (req, res, next) => {
    req.session.destroy()
    res.setHeader('Set-Cookie', cookie.serialize('username', '', {
      path: '/',
      secure: true,
      sameSite: true,
      maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
    }))
    res.redirect('/')
  })

  // this * route is to serve project on different page routes except root `/`
  app.get(/.*/, function (req, res) {
    res.sendFile(path.join(__dirname, '/dist/index.html'))
  })

})

let server
if (!process.env.PORT) {
  // for localhost b/c https is required for camera to work when connecting over LAN
  console.log('here')
  server = https.createServer(config, app).listen(8080, (err) => {
    if (err) console.log(err)
    else console.log('HTTPS server on https://localhost:%s', 8080)
  })
} else {
  // heroku handles certificates itself
  server = http.createServer(app).listen(process.env.PORT, (err) => {
    if (err) console.log(err)
    else console.log('HTTP server on http://localhost:%s', process.env.PORT)
  })
}
