const ObjectId = require('mongodb').ObjectId;
const scrambler = require('scramby')();
const { MatchModel, QueueModel } = require('./server/match/match');
const UserModel = require('./server/user/user');

module.exports = (io) => {
  const queueError = (socket) => {
    socket.emit('QueueError', 'Internal queueing error');
  };

  io.on('connection', (socket) => {
    console.log('CONNECTION');
    if (!socket.request.session.username) return socket.disconnect(true);
    const username = socket.request.session.username;

    const removeFromQueue = (username) => {
      QueueModel.findInQueue(username).then((res) => {
        if (!res) return;
        QueueModel.deleteOne({ _id: username }, {}, () => {});
      }).catch((err) => {
        if (err) return queueError(socket);
      });
    };

    socket.on('disconnect', () => {
      console.log(`${username} informed server that they disconnected`);
      removeFromQueue(username);
      MatchModel.findOne({ $and: [{ $or: [{ user1: username }, { user2: username }] }, { completed: false }] }, {}, (err, match) => {
        console.log(match);
        if (err || !match) return;
        let currUser = ''; let otherUser = '';
        if (username === match.user1) {
          currUser = 'user1';
          otherUser = 'user2';
        } else if (username === match.user2) {
          currUser = 'user2';
          otherUser = 'user1';
        }
        // forfeit the match
        updateMatchTimes(match._id.toString(), currUser, Number.MAX_SAFE_INTEGER, () => {
          updateMatchTimes(match._id.toString(), otherUser, -1);
        });
      });
    });

    socket.on('matched', (matchId) => {
      console.log(`${username} informed server that they matched to ${matchId}`);
      removeFromQueue(username);
      MatchModel.findOne({ _id: new ObjectId(matchId), completed: false }, (err, result) => {
        if (err) return queueError(socket);
        if (result) {
          console.log(`${username} joining ${matchId} room for future emits`);
          socket.join(matchId);
        }
      });
    });

    socket.on('joinQueue', (id) => {
      console.log(`User ${username} attempting to join match queue`);
      UserModel.findOne({ _id: username }, {}, (err, user) => {
        if (err) return queueError(socket);
        QueueModel.findOne(
          {
            elo: { $lt: user.elo + 150, $gt: user.elo - 150 },
            _id: { $ne: user._id }
          }, null, { sort: { createdAt: -1 } }, (err, matchedUser) => {
            if (err) return queueError(socket);
            if (matchedUser) {
              const winProb = 1 / (1 + 10 ** ((matchedUser.elo - user.elo) / 400));
              const winElo = Math.round((30 * (1 - winProb)));
              const lossElo = Math.round(30 * winProb);
              MatchModel({
                user1: username,
                user1PeerId: id,
                user2: matchedUser._id,
                user2PeerId: matchedUser.peerId,
                user1Time: null,
                user2Time: null,
                user1Win: winElo,
                user2Win: lossElo,
                completed: false,
                scramble: scrambler.getRandomScramble()
              }).save().then(result => {
                socket.emit('match', result);
              }).catch(err => {
                if (err) queueError(socket);
              });
            } else { // add to queue
              QueueModel.updateOne(
                { _id: username },
                {
                  $set: { elo: user.elo, peerId: id }
                },
                { upsert: true, runValidators: true },
                (err, result) => {
                  if (err) return queueError(socket);
                  QueueModel.estimatedDocumentCount((err, result) => {
                    if (err) return queueError(socket);
                    console.log(`queue size is ${result}`);
                    socket.emit('queue-size', result);
                  });
                });
            }
          });
      });
    });

    const updateMatchTimes = (matchId, user, time, cb = null) => {
      const updateOptions = { $set: {} };
      updateOptions.$set[`${user}Time`] = time;
      updateOptions.$set.completed = true;
      const idObj = new ObjectId(matchId);
      const filter = { _id: idObj };
      filter[`${user}Time`] = null;
      MatchModel.updateOne(filter, updateOptions, { runValidators: true }, (err, result) => {
        if (err) return socket.emit('MatchUpdateError', 'Internal server error');
        MatchModel.findOne({ _id: idObj }, null, null, (err, match) => {
          if (err) return socket.emit('MatchUpdateError', 'Internal server error');
          if (match.user1Time && match.user2Time) {
            console.log(`MATCH ${matchId} COMPLETE`);
            let det = match.user1Time < match.user2Time ? { win: 'user1', lose: 'user2' } : null;
            if (!det) det = match.user1Time > match.user2Time ? { win: 'user2', lose: 'user1' } : null;
            io.to(matchId).emit('match:completed', match);
            // eslint-disable-next-line no-unused-vars
            for (const [_, s] of io.in(matchId).adapter.nsp.sockets) {
              s.leave(matchId);
            }
            if (!det) return;
            UserModel.updateOne({ _id: match[det.win] }, { $inc: { elo: match[`${det.win}Win`], wins: 1 } }).exec();
            UserModel.updateOne({ _id: match[det.lose] }, { $inc: { elo: -match[`${det.win}Win`], losses: 1 } }).exec();
          }
          if (cb) cb();
        });
      });
    };

    socket.on('matchEnd', (data) => {
      console.log('match ended');
      MatchModel.findOne({ _id: new ObjectId(data._id) }, {}, (err, match) => {
        if (err) return queueError(socket);
        if (match) {
          console.log(`found the match that ended that ${username} was updating`);
          const matchTime = data.trusted ? data.time : Number.MAX_SAFE_INTEGER;
          let otherUser = '';
          if (username === match.user1) otherUser = 'user2';
          else if (username === match.user2) otherUser = 'user1';
          else return;
          if (!match[`${otherUser}Time`]) updateMatchTimes(data._id, otherUser, matchTime);
        }
      });
    });
  });
};
