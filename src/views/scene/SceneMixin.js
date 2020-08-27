import { getSceneDeviceList } from '@/api/scene'
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
  },
}
