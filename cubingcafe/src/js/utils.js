const utils = (function () {
  'use strict'
  const module = {}
  module.Stopwatch = function (elem, options) {
    const timer = createTimer()
    let offset
    let clock
    let interval

    // default options
    options = options || {}
    options.delay = options.delay || 1

    // append elements
    elem.appendChild(timer)

    // initialize
    reset()

    // private functions
    function createTimer () {
      return document.createElement('div')
    }

    function start () {
      if (!interval) {
        offset = Date.now()
        interval = setInterval(update, options.delay)
      }
    }

    function stop () {
      if (interval) {
        clearInterval(interval)
        interval = null
      }
      return clock / 1000
    }

    function reset () {
      clock = 0
      render()
    }

    function running () {
      return !!(interval)
    }

    function update () {
      clock += delta()
      render()
    }

    function render () {
      timer.innerHTML = (clock / 1000).toFixed(3)
    }

    function delta () {
      const now = Date.now()
      const d = now - offset

      offset = now
      return d
    }

    function getSeconds () {
      return clock / 1000
    }

    // public API
    this.start = start
    this.stop = stop
    this.reset = reset
    this.running = running
    this.getSeconds = getSeconds
  }
  return module
}())

export { utils }
