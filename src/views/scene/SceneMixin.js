import { getSceneDeviceList } from '@/api/scene'
import { TypeHints } from 'hardware-suit'
export default {
  data () {
    return {
      buildingList: [],
      floorList: [],
      roomList: [],
      deviceTypeList: []
    }
  },
  methods: {
    getSceneDeviceList () {
      return new Promise(resolve => {
        getSceneDeviceList().then(res => {
          if (this.$isAjaxSuccess(res.code)) {
            this.buildingList = res.result.records
            resolve(this.buildingList)
          }
        })
      })
    },
    getBuildingList () {
    },
    getFloorList (buildingId) {
      if (!buildingId) return
      const building = this.findBuildingById(buildingId)
      if (!building) return
      this.floorList = building.floors
    },
    getRoomList (floorId) {
      if (!floorId) return
      const floor = this.findFloorById(floorId)
      if (!floor) return
      this.roomList = floor.rooms
    },
    getDeviceTypeListByRoomId (roomId) {
      if (!roomId) return
      const room = this.findRoomById(roomId)
      if (!room) return
      this.deviceTypeList = room.devices
    },
    findBuildingById (id) {
      return this.buildingList.find(item => item.buildingId === id)
    },
    findFloorById (id) {
      return this.floorList.find(item => item.floorId === id)
    },
    findRoomById (id) {
      return this.roomList.find(item => item.roomId === id)
    },
    // 设备是否有动作行为
    isActionDevice (deviceType, deviceSubType) { // only some device can be set action
      return !TypeHints.isSensors(deviceType)
        && !TypeHints.isFinger(deviceType)
        && !TypeHints.isDoorLock(deviceType)
        && !TypeHints.isCamera(deviceType)
        && !(TypeHints.isSocketSwitch(deviceType) && TypeHints.isSceneSocketSwitch(deviceSubType))
        && !(TypeHints.isSocketSwitch(deviceType) && TypeHints.isMixSocketSwitch(deviceSubType))
    },
    // 初始化设备类型
    initDeviceType () { // for building or floor location
      return [{
        name: '三键开关',
        deviceType: '04',
        deviceChildType: '17'
      }, {
        name: '双色灯',
        deviceType: '01',
        deviceChildType: '02'
      }, {
        name: '红外转发器',
        deviceType: '51'
      }]
    },
  },
}
