// websocket 消息cmd对应事件
export const SocketMessageCmdEvent = {
  'a001': 'obox',
  'a100': 'state',
  '2003': 'scan',
  'a015': ''
}

// 推送类型
export const SocketMessageTypeEvent = {
  '0': 'obox-data',
  '2': 'obox-state',
  '4': 'infrared-state',
  '5': 'infrared-data',
  '6': 'obox-connected',
  '7': 'obox-connected-fail'
}

export const BroadcastMixin = {
  methods: {
    broadcast (data) {
      if (data.type === 0 && SocketMessageCmdEvent[data.cmd]) {
        this.$bus.$emit(SocketMessageCmdEvent[data.cmd], data)
      // } else if (data.type === 2 && SocketMessageTypeEvent[data.type]) {
      //   this.$bus.$emit(SocketMessageTypeEvent[data.cmd], data)
      } else if ([2, 6, 7].includes(data.type) && SocketMessageTypeEvent[data.type]) {
        this.$bus.$emit(SocketMessageTypeEvent[data.type], data)
      }
    }
  }
}
