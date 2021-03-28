const ObjectId = require('mongodb').ObjectId
const scrambler = require('scramby')()

module.exports = (io, queue, users, matches) => {
  const queueError = (socket) => {
    socket.emit('QueueError', 'Internal queueing error')
  }

  io.on('connection', (socket) => {
    console.log(socket.request.session)
    console.log('CONNECTION')
    // console.log(socket.request.session);
    if (!socket.request.session.username) return socket.disconnect(true)
    const username = socket.request.session.username

    const removeFromQueue = (username) => {
      queue.findOne({ _id: username }, {}, (err, queuedUser) => {
        if (err) return queueError(socket)
        if (queuedUser) {
          console.log(`found the socket for ${username} removing from queue ${queuedUser}`)
          queue.deleteOne({ _id: username }, {}, (err, result) => {})
        }
      })
    }

    socket.on('disconnect', () => {
      console.log(`${username} informed server that they disconnected`)
      removeFromQueue(username)
      matches.findOne({ $and: [{ $or: [{ user1: username }, { user2: username }] }, { completed: false }] }, {}, (err, match) => {
        console.log(match)
        if (err || !match) return
        let currUser = ''; let otherUser = ''
        if (username === match.user1) currUser = 'user1', otherUser = 'user2'
        else if (username === match.user2) currUser = 'user2', otherUser = 'user1'
        // forfeit the match
        updateMatchTimes(match._id.toString(), currUser, Number.MAX_SAFE_INTEGER, () => {
          updateMatchTimes(match._id.toString(), otherUser, -1)
        })
      })
    })

    socket.on('matched', (matchId) => {
      console.log(`${username} informed server that they matched to ${matchId}`)
      removeFromQueue(username)
      matches.findOne({ _id: new ObjectId(matchId), completed: false }, (err, result) => {
        if (err) return queueError(socket)
        if (result) {
          console.log(`${username} joining ${matchId} room for future emits`)
          socket.join(matchId)
          console.log(io.sockets.adapter.rooms.get(matchId))
          console.log(typeof matchId)
        }
      })
    })

    socket.on('joinQueue', (id) => {
      console.log(`User ${username} attempting to join match queue`)
      users.findOne({ _id: username }, {}, (err, user) => {
        if (err) return queueError(socket)
        queue.findOne(
          {
            elo: { $lt: user.elo + 150, $gt: user.elo - 150 },
            _id: { $ne: user._id }
          }, { sort: [['joinedQueue', 'desc']] }, (err, matchedUser) => {
            if (err) return queueError(socket)
            if (matchedUser) {
              winProb = 1 / (1 + 10 ** ((matchedUser.elo - user.elo) / 400))
              winElo = Math.round((30 * (1 - winProb)))
              lossElo = Math.round(30 * winProb)
              matches.insertOne(
                {
                  user1: username,
                  user1PeerId: id,
                  user2: matchedUser._id,
                  user2PeerId: matchedUser.peerId,
                  user1Time: null,
                  user2Time: null,
                  user1Win: winElo,
                  user2Win: lossElo,
                  completed: false,
                  scramble: scrambler.getRandomScramble(),
                  createdDate: new Date()
                }, {}, (err, result) => {
                  if (err) return queueError(socket)
                  console.log(result.ops[0])
                  socket.emit('match', result.ops[0])
                })
            } else { // add to queue
              queue.updateOne(
                { _id: username },
                {
                  $set: { elo: user.elo, peerId: id },
                  $currentDate: { joinedQueue: true }
                },
                { upsert: true },
                (err, result) => {
                  if (err) return queueError(socket)
                  queue.countDocuments({}, {}, (err, result) => {
                    if (err) return queueError(socket)
                    console.log(`queue size is ${result}`)
                    socket.emit('queue-size', result)
                  })
                })
            }
          })
      })
    })

    const updateMatchTimes = (matchId, user, time, cb = null) => {
      const updateOptions = { $set: {} }
      updateOptions.$set[`${user}Time`] = time
      updateOptions.$set.completed = true
      const idObj = new ObjectId(matchId)
      const filter = { _id: idObj }
      filter[`${user}Time`] = null
      matches.updateOne(filter, updateOptions, (err, result) => {
        if (err) return socket.emit('MatchUpdateError', 'Internal server error')
        matches.findOne({ _id: idObj }, (err, match) => {
          if (err) return socket.emit('MatchUpdateError', 'Internal server error')
          if (match.user1Time && match.user2Time) {
            console.log('MATCH COMPLETE')
            let det = match.user1Time < match.user2Time ? { win: 'user1', lose: 'user2' } : null
            if (!det) det = match.user1Time > match.user2Time ? { win: 'user2', lose: 'user1' } : null
            if (!det) return
            io.to(matchId).emit('match:completed', match)
            // console.log(io.in(matchId).adapter.nsp.sockets.sockets)
            for (const [_, s] of io.in(matchId).adapter.nsp.sockets) {
              s.leave(matchId)
            }
            // yeah I know this looks stupid but I spent an hour trying to figure out
            // why the example in their docs didn't work, this disbands the room
            /*
            for (const [_, s] of io.in(matchId).sockets.sockets) {
              s.leave(matchId)
            }
             */
            users.updateOne({ _id: match[det.win] }, { $inc: { elo: match[`${det.win}Win`], wins: 1 } })
            users.updateOne({ _id: match[det.lose] }, { $inc: { elo: -match[`${det.win}Win`], losses: 1 } })
            if (cb) cb()
          }
        })
      })
    }

    socket.on('matchEnd', (data) => {
      console.log('match ended')
      console.log(data)
      matches.findOne({ _id: new ObjectId(data._id) }, {}, (err, match) => {
        if (err) return queueError(socket)
        if (match) {
          console.log(`found the match that ended that ${username} was updating`)
          const matchTime = data.trusted ? data.time : Number.MAX_SAFE_INTEGER
          let otherUser = ''; let currUser = ''
          if (username === match.user1) otherUser = 'user2', currUser = 'user1'
          else if (username === match.user2) otherUser = 'user1', currUser = 'user2'
          else return
          if (!match[`${otherUser}Time`]) updateMatchTimes(data._id, otherUser, matchTime)
          else return
        }
      })
    })
  })
}
