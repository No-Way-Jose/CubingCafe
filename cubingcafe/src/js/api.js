import Peer from 'peerjs'
import io from 'socket.io-client'

const api = (function () {
  'use strict'

  const module = {}

  let peer = null
  let queueSocket = null

  let localStream = null
  let localStreamListeners = []

  let videoConnections = []
  let dataConnections = []

  const notifyLocalStreamListeners = () => {
    localStreamListeners.forEach(listener => listener(localStream))
  }

  const getLocalStream = (cb = () => {}) => {
    if (localStream) {
      return cb(localStream)
    }
    if (!navigator.mediaDevices) return console.error('Not on a secure HTTPS connection')
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: false, video: true })
        .then((stream) => {
          localStream = stream
          localStream.getVideoTracks()[0].onended = () => {
            localStream = null
            notifyLocalStreamListeners()
          }
          notifyLocalStreamListeners()
        })
        .catch((e) => {
          console.error(e)
          notifyLocalStreamListeners()
        })
    }
  }

  module.onLocalStreamUpdate = (listener) => {
    localStreamListeners.push(listener)
    getLocalStream(() => {})
  }

  const notifyNewVideoConnection = (stream, connectionObj) => {
    videoConnections.push(connectionObj)
    notifyMatchListeners({
      action: 1, // video stream connection
      data: { stream, id: connectionObj.peer }
    })
  }

  const removeVideo = (videoConnection) => {
    const i = videoConnections.findIndex((conn) => conn === videoConnection)
    if (i !== -1) {
      videoConnections.splice(i, 1)
      if (videoConnection.open) videoConnection.close()
      notifyMatchListeners({ action: 2, data: { id: videoConnection.peer } })
    }
  }

  const listenForDisconnect = (connection) => {
    connection.peerConnection.oniceconnectionstatechange = () => {
      if (connection.peerConnection.iceConnectionState === 'closed' ||
        connection.peerConnection.iceConnectionState === 'disconnected') {
        removeVideo(connection)
      }
    }
  }

  let queueListeners = []

  const notifyMatchListeners = (data) => {
    queueListeners.forEach(listener => listener(data))
  }

  const setupMediaStream = (videoStream) => {
    videoStream.on('stream', (stream) => {
      notifyNewVideoConnection(stream, videoStream)
    })

    videoStream.on('error', (err) => {
      console.error(err)
    })

    // need special listener for media stream
    // built in one doesn't work properly for some reason
    listenForDisconnect(videoStream)
  }

  const setupDataStream = (dataStream, match = null) => {
    dataStream.on('open', () => {
      dataConnections.push(dataStream)
      if (match) dataStream.send({ action: 'Match', match })
    })
    dataStream.on('data', (data) => {
      notifyMatchListeners({ action: 4, data }) // action 4 is user interaction
    })

    dataStream.on('close', () => {
      const i = dataConnections.findIndex((stream) => stream === dataStream)
      if (i !== -1) dataConnections.splice(i, 1)
    })

    dataStream.on('error', (err) => {
      console.error(err)
    })
  }

  module.findMatch = (listener = null) => {
    if (listener) queueListeners.push(listener)
    if (queueSocket && !queueSocket.connected) return queueSocket.connect()
    if (queueSocket) return
    queueSocket = io({ transports: ['polling'] })

    queueSocket.on('connect', () => {
      if (peer) return queueSocket.emit('joinQueue', peer.id)
      peer = new Peer({
        secure: true,
        host: location.hostname,
        path: '/peerjs',
        port: location.port
      })

      peer.on('open', (id) => {
        queueSocket.emit('joinQueue', id)
      })

      peer.on('error', (err) => {
        console.error(err)
        // if in queue leave due to peer error
        if (queueSocket.connected) queueSocket.disconnect()
        // if we're already in a match, they're connected peer to peer
        // so they can continue and post the result later
      })

      /* answer the call, this happens when we sit in queue
          waiting for an opponent */
      peer.on('call', (incoming) => {
        getLocalStream((stream) => {
          incoming.answer(stream)
        })
        setupMediaStream(incoming)
      })

      peer.on('connection', (dataConn) => {
        setupDataStream(dataConn)
      })
    })

    queueSocket.on('queue-size', (size) => {
      notifyMatchListeners({ action: 0, data: { queueSize: size } })
    })

    queueSocket.on('error', (err) => {
      console.error(err)
      queueSocket.disconnect()
      peer.disconnect()
    })

    queueSocket.on('match', (match) => {
      const peerUser = match.user2PeerId
      getLocalStream((ls) => {
        const peerStream = peer.call(peerUser, ls)
        setupMediaStream(peerStream)
      })

      notifyMatchListeners({ action: 4, data: { action: 'Match', match } })

      const newPeer = peer.connect(peerUser)
      setupDataStream(newPeer, match)
    })

    queueSocket.on('match:completed', (match) => {
      notifyMatchListeners({ action: 6, data: match }) // match registered by server
    })
  }

  const sendMessage = (msg) => {
    if (peer) return dataConnections.forEach(conn => conn.send(msg))
    else return false
  }

  module.sendReady = () => {
    sendMessage({ action: 'Ready' })
  }

  module.sendNotReady = () => {
    sendMessage({ action: 'NotReady' })
  }

  module.sendCfmScramble = () => {
    sendMessage({ action: 'Confirmed' })
  }

  module.sendSolveTime = (time) => {
    sendMessage({ action: 'Solved', value: time })
  }

  module.sendStarted = () => {
    sendMessage({ action: 'StartedSolving' })
  }

  module.emitOpponentTime = (_id, trusted, time) => {
    queueSocket.emit('matchEnd', { _id, trusted, time })
  }

  module.emitMatched = (matchId) => {
    queueSocket.emit('matched', matchId)
  }

  module.disconnect = () => {
    dataConnections.forEach(conn => conn.open ? conn.close() : null)
    videoConnections.forEach(conn => conn.open ? conn.close() : null)
    if (queueSocket && queueSocket.connected) {
      queueSocket.disconnect()
      notifyMatchListeners({ action: 5 })
    }
    dataConnections = []
    videoConnections = []
    notifyMatchListeners({ action: 7 }) // disconnected from match
  }

  module.stopCamera = () => {
    if (localStream) localStream.getTracks().forEach(track => track.stop())
    dataConnections = []
    videoConnections = []
    localStreamListeners = []
    localStream = null
    queueListeners = []
  }

  return module
}())

export { api }
