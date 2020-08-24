/*
 * @Author: eamiear
 * @Date: 2019-08-07 16:43:10
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-11-26 15:34:09
 */

import {request} from '@/common/request'

const RoomAPI = {
  getRoomList (params) {
    const page = params.pageNo
    const pageSize = params.pageSize
    delete params.pageNo
    delete params.pageSize
    return request.get('/consumer/common', {
      CMD: 'query_location',
      start: page,
      count: pageSize,
      ...params
    })
  },
  getRoomDeviceList (params) {
    return request.postForm('/consumer/common', {
      CMD: 'query_device_location',
      start: params.pageNo,
      count: params.pageSize,
      location: params.room
    })
  },
  getRoomSceneList (params) {
    return request.postForm('/consumer/common', {
      CMD: 'query_scene_location',
      start: params.pageNo,
      count: params.pageSize,
      location: params.room
    })
  },
  createRoom (params) {
    return request.postForm('/consumer/common', {
      CMD: 'create_location',
      action: '01',
      building: params.room,
      room: params.room,
      layer: params.layer
    })
  },
  editRoom (params) {

  },
  deleteRoom (params) {
    return request.get('/consumer/common', {
      CMD: 'create_location',
      action: '00',
      location: params.location,
      building: params.room,
      room: params.room,
      layer: params.layer
    })
  },
  // 添加设备到教室
  setRoomDevice (params) {
    return request.postForm('/consumer/common', {
      CMD: 'set_device_location',
      device_type: params.device_type,
      serialId: params.serialId,
      location: params.location,
      x_axis: 0,
      y_axis: 0
    })
  },
  removeRoomDevice (params) {
    return request.postForm('/consumer/common', {
      CMD: 'delete_device_location',
      device_type: params.device_type,
      serialId: params.serialId,
      location: params.location
    })
  },
  // 绑定场景到教室
  setRoomScene (params) {
    return request.postForm('/consumer/common', {
      CMD: 'set_scene_location',
      action: '01',
      scene_number: params.scene_number,
      location: params.location
    })
  },
  // 删除教室场景
  removeRoomScene (location, sceneNumber) {
    return request.postForm('/consumer/common', {
      CMD: 'delete_scene_location',
      location,
      scene_number: sceneNumber
    })
  },
  getRoomListV2 (room = {}) {
    return request.get('/consumer/common', {
      CMD: 'get_room',
      room: JSON.stringify(room)
    })
  },
  getRoomCascader () {
    return request.get('/consumer/common', {
      CMD: 'get_building_floor_room'
    })
  },
  addRoomV2 (room) {
    return request.postForm('/consumer/common', {
      CMD: 'add_room',
      room: JSON.stringify(room)
    })
  },
  updateRoomV2 (room) {
    return request.postForm('/consumer/common', {
      CMD: 'update_room',
      room: JSON.stringify(room)
    })
  },
  removeRoomV2 (id) {
    return request.postForm('/consumer/common', {
      CMD: 'delete_room',
      room: JSON.stringify({id})
    })
  },
  bindDeviceToRoomV2 (roomId, deviceId, deviceSerialId, deviceType, deviceChildType) {
    return request.postForm('/consumer/common', {
      CMD: 'bind_room_device',
      device: JSON.stringify({roomId, deviceId, deviceSerialId, deviceType, deviceChildType})
    })
  },
  unbindRoomDevice (roomId, deviceId, deviceSerialId, deviceType, deviceChildType) {
    return request.postForm('/consumer/common', {
      CMD: 'unbind_room_device',
      device: JSON.stringify({roomId, deviceId, deviceSerialId, deviceType, deviceChildType})
    })
  },
  getRoomDeviceListV2 (device = {}) {
    return request.get('/consumer/common', {
      CMD: 'get_room_device',
      device: JSON.stringify(device)
    })
  },
  triggerGlobalSwitch (deviceType) {
    return request.postForm('/consumer/common', {
      CMD: 'tigger_room_device',
      device: JSON.stringify({deviceType})
    })
  },
  triggerSwitch (device) {
    return request.postForm('/consumer/common', {
      CMD: 'tigger_room_device',
      device: JSON.stringify(device)
    })
  },
  getSwitchGlobalType () {
    return request.get('/consumer/common', {
      CMD: 'get_alltype'
    })
  }
}
const BuildingAPI = {
  getBuildingList (building = {}) {
    return request.get('/consumer/common', {
      CMD: 'get_building',
      building: JSON.stringify(building)
    })
  },
  getSelectBuildingList () {
    return request.get('/consumer/common', {
      CMD: 'get_select_building'
    })
  },
  addBuilding (building = {}) {
    return request.postForm('/consumer/common', {
      CMD: 'add_building',
      building: JSON.stringify(building)
    })
  },
  updateBuilding (building = {}) {
    return request.postForm('/consumer/common', {
      CMD: 'update_building',
      building: JSON.stringify(building)
    })
  },
  removeBuilding (id) {
    return request.postForm('/consumer/common', {
      CMD: 'delete_building',
      building: JSON.stringify({id})
    })
  }
}
const FloorAPI = {
  getFloorList (floor = {}) {
    return request.get('/consumer/common', {
      CMD: 'get_floor',
      floor: JSON.stringify(floor)
    })
  },
  getFloorByBuildingId (buildingId) {
    return request.get('/consumer/common', {
      CMD: 'get_building_floor',
      floor: JSON.stringify({buildingId})
    })
  },
  addFloor (floor = {}) {
    return request.postForm('/consumer/common', {
      CMD: 'add_floor',
      floor: JSON.stringify(floor)
    })
  },
  updateFloor (floor = {}) {
    return request.postForm('/consumer/common', {
      CMD: 'update_floor',
      floor: JSON.stringify(floor)
    })
  },
  removeFloor (id) {
    return request.postForm('/consumer/common', {
      CMD: 'delete_floor',
      floor: JSON.stringify({id})
    })
  }
}
export default {...RoomAPI, ...BuildingAPI, ...FloorAPI}
