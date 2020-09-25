import { WEBSOCKET_URL } from '@/config/env.config'

const getUrl = (url) => {
  return url.includes('http') ? url : window.location.origin + url
}

export function initWebSocket (topic = '', url) {
  url = getUrl(url || WEBSOCKET_URL)
  url = url.replace('https://', 'wss://').replace('http://', 'ws://').format({topic})
  const websocket = new WebSocket(url)
  websocket.onopen = onWebSocketOpen
  websocket.onclose = onWebSocketClose
  websocket.onerror = onWebSocketError
  websocket.onmessage = onWebSocketMessage
  console.log('init WebSocket.')
  return websocket
}

export function onWebSocketOpen () {
  console.log('WebSocket Connected.')
}

export function onWebSocketClose (e) {
  console.log(`WebSocket Closed (${e.code}).`)
}

export function onWebSocketError () {
  console.log('WebSocket Connect Error.')
}

export function onWebSocketMessage (e) {
  console.log('WebSocket Receive Data.\n')
  console.log(e.data)
}

// websocket 消息cmd对应事件
export const SocketMessageCmdEvent = {
  'a100': 'state',
  '2003': 'scan',
  '2': 'obox'
}

// 20s 心跳检测一次
const HeartBeat = {
  timeout: 20000,
  timeoutPicker: null,
  serverTimeoutPicker: null,
  reset () {
    this.timeoutPicker && clearTimeout(this.timeoutPicker)
    return this
  },
  start (callback) {
    // 发送一个心跳，后端收到后，返回一个心跳消息，
    // onmessage拿到返回的心跳就说明连接正常
    this.timeoutPicker = setTimeout(() => {
      // this.webSocketSend('HeartBeat')
      callback && callback('HeartBeat')
    }, this.timeout)
  }
}

export const WebSocketMixin = {
  data () {
    return {
      lockReconect: false,
      isForceClose: false,
      websocket: null,
      heartBeat: HeartBeat,
      topic: ''
    }
  },
  mounted () {
    // this.initWebSocket()
  },
  methods: {
    getUrl (url) {
      return url.includes('http') ? url : window.location.origin + url
    },
    initWebSocket (topic = '', url) {
      url = url = this.getUrl(url || WEBSOCKET_URL)
      url = url.replace('https://', 'wss://').replace('http://', 'ws://').format({topic})
      url = !topic ? url.slice(0, -1) : url
      const websocket = new WebSocket(url)
      websocket.onopen = this.onWebSocketOpen
      websocket.onclose = this.onWebSocketClose
      websocket.onerror = this.onWebSocketError
      websocket.onmessage = this.onWebSocketMessage
      this.topic = topic

      this.websocket = websocket
      console.log('init WebSocket.')
    },
    onWebSocketOpen () {
      console.log('WebSocket Connected.')
      // this.startHeartBeat()
    },
    onWebSocketClose () {
      console.log(`WebSocket Closed.`)
      // this.isForceClose && this.reconnectWebSocket()
      this.reconnectWebSocket()
    },
    onWebSocketError () {
      console.log('WebSocket Connect Error.')
      this.reconnectWebSocket()
    },
    onWebSocketMessage () {
      console.log('WebSocket Receive Data.\n')
    },
    closeWebSocket () {
      // this.isForceClose = true
      this.websocket.close()
    },
    reconnectWebSocket () {
      if (this.lockReconect) return
      this.lockReconect = true
      setTimeout(() => {
        console.log('reconnect websocket...')
        this.initWebSocket(this.topic)
        this.lockReconect = false
      }, 5000)
    },
    webSocketSend (text) {
      try {
        this.websocket.send(text)
      } catch (err) {
        console.log(`websocket send failed { ${err.code} }`)
      }
    },
    startHeartBeat () {
      this.heartBeat.reset().start(this.webSocketSend)
    }
  },
}
