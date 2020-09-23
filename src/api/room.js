/*
 * @Author: eamiear
 * @Date: 2019-08-07 16:43:10
 * @Last Modified by: eamiear
 * @Last Modified time: 2020-09-22 18:12:44
 */

import { getAction, postFormAction } from '@/utils/ajax'

const getRoomCascader = () => getAction('/common', {
  CMD: 'get_building_floor_room'
})
const getRoomDeviceList = (params) => getAction('/common', {
  CMD: 'get_room_device',
  device: JSON.stringify(params)
})
const getRoomList = (params) => getAction('/common', {
  CMD: 'get_room',
  room: JSON.stringify(params)
})
const addRoom = (params) => postFormAction('/common', {
  CMD: 'add_room',
  room: JSON.stringify(params)
})
const editRoom = (params) => getAction('/common', {
  CMD: 'update_room',
  room: JSON.stringify(params)
})
const delRoom = (id) => getAction('/common', {
  CMD: 'delete_room',
  room: JSON.stringify({
    id
  })
})
const bindRoomDevice= (params = {}) => postFormAction('/common', {
  CMD: 'bind_room_device',
  device: JSON.stringify(params)
})
const unbindRoomDevice = (params = {}) => postFormAction('/common', {
  CMD: 'unbind_room_device',
  device: JSON.stringify(params)
})

// 灯控
const handleLampPower = (params = {}) => postFormAction('/common', {
  CMD: 'tigger_room_device',
  device: JSON.stringify({ ...params, deviceChildType: '01' })
})
// 开关
const handleSwitchPower = (params = {}) => postFormAction('/common', {
  CMD: 'tigger_room_device',
  device: JSON.stringify({ ...params, deviceChildType: '0417' })
})

const getPowerStatus = () => getAction('/common', {
  CMD: 'get_alltype'
})

// 总控
const triggerAllPower = (deviceType) => getAction('/common', {
  CMD: 'tigger_room_device',
  device: JSON.stringify({deviceType})
})

// 楼栋
const getBuildingList = (params = {}) => getAction('/common', {
  CMD: 'get_building',
  building: JSON.stringify(params)
})
const getSelectBuildingList = () => getAction('/common', {
  CMD: 'get_select_building'
})

const addBuilding = (params = {}) => postFormAction('/common', {
  CMD: 'add_building',
  building: JSON.stringify(params)
})
const editBuilding = (params = {}) => postFormAction('/common', {
  CMD: 'update_building',
  building: JSON.stringify(params)
})
const delBuilding = (id) => postFormAction('/common', {
  CMD: 'delete_building',
  building: JSON.stringify({id})
})

// floor
const getFloorList = (params = {}) => getAction('/common', {
  CMD: 'get_floor',
  floor: JSON.stringify(params)
})
const getFloorByBuildingId = (buildingId) => getAction('/common', {
  CMD: 'get_building_floor',
  floor: JSON.stringify({
    buildingId
  })
})
const addFloor = (params = {}) => postFormAction('/common', {
  CMD: 'add_floor',
  floor: JSON.stringify(params)
})
const editFloor = (params = {}) => postFormAction('/common', {
  CMD: 'update_floor',
  floor: JSON.stringify(params)
})
const delFloor = (id) => postFormAction('/common', {
  CMD: 'delete_floor',
  floor: JSON.stringify({id})
})

// const RoomAPI = {
//   getRoomList (params) {
//     const page = params.pageNo
//     const pageSize = params.pageSize
//     delete params.pageNo
//     delete params.pageSize
//     return request.get('/consumer/common', {
//       CMD: 'query_location',
//       start: page,
//       count: pageSize,
//       ...params
//     })
//   },
//   getRoomDeviceList (params) {
//     return request.postForm('/consumer/common', {
//       CMD: 'query_device_location',
//       start: params.pageNo,
//       count: params.pageSize,
//       location: params.room
//     })
//   },
//   getRoomSceneList (params) {
//     return request.postForm('/consumer/common', {
//       CMD: 'query_scene_location',
//       start: params.pageNo,
//       count: params.pageSize,
//       location: params.room
//     })
//   },
//   createRoom (params) {
//     return request.postForm('/consumer/common', {
//       CMD: 'create_location',
//       action: '01',
//       building: params.room,
//       room: params.room,
//       layer: params.layer
//     })
//   },
//   editRoom (params) {

//   },
//   deleteRoom (params) {
//     return request.get('/consumer/common', {
//       CMD: 'create_location',
//       action: '00',
//       location: params.location,
//       building: params.room,
//       room: params.room,
//       layer: params.layer
//     })
//   },
//   // 添加设备到教室
//   setRoomDevice (params) {
//     return request.postForm('/consumer/common', {
//       CMD: 'set_device_location',
//       device_type: params.device_type,
//       serialId: params.serialId,
//       location: params.location,
//       x_axis: 0,
//       y_axis: 0
//     })
//   },
//   removeRoomDevice (params) {
//     return request.postForm('/consumer/common', {
//       CMD: 'delete_device_location',
//       device_type: params.device_type,
//       serialId: params.serialId,
//       location: params.location
//     })
//   },
//   // 绑定场景到教室
//   setRoomScene (params) {
//     return request.postForm('/consumer/common', {
//       CMD: 'set_scene_location',
//       action: '01',
//       scene_number: params.scene_number,
//       location: params.location
//     })
//   },
//   // 删除教室场景
//   removeRoomScene (location, sceneNumber) {
//     return request.postForm('/consumer/common', {
//       CMD: 'delete_scene_location',
//       location,
//       scene_number: sceneNumber
//     })
//   },


// export default {...RoomAPI, ...BuildingAPI, ...FloorAPI}

export {
  getRoomCascader,
  getRoomDeviceList,
  getRoomList,
  addRoom,
  editRoom,
  delRoom,
  bindRoomDevice,
  unbindRoomDevice,
  handleLampPower,
  handleSwitchPower,
  getPowerStatus,
  triggerAllPower,

  getBuildingList,
  getSelectBuildingList,
  addBuilding,
  editBuilding,
  delBuilding,

  getFloorList,
  getFloorByBuildingId,
  addFloor,
  editFloor,
  delFloor
}
