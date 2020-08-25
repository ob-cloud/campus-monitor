/*
 * @Author: eamiear
 * @Date: 2019-08-07 16:43:10
 * @Last Modified by: eamiear
 * @Last Modified time: 2020-08-25 18:16:21
 */

import { getAction, postAction } from '@/utils/ajax'

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
const addRoom = (params) => getAction('/common', {
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
const bindRoomDevice= (params = {}) => postAction('/common', {
  CMD: 'bind_room_device',
  device: JSON.stringify(params)
})
const unbindRoomDevice = (params = {}) => postAction('/common', {
  CMD: 'unbind_room_device',
  device: JSON.stringify(params)
})

const handleLampPower = (params = {}) => postAction('/common', {
  CMD: 'tigger_room_device',
  device: JSON.stringify(params)
})

const getPowerStatus = () => getAction('/common', {
  CMD: 'get_alltype'
})
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

const addBuilding = (params = {}) => postAction('/common', {
  CMD: 'add_building',
  building: params
})
const editBuilding = (params = {}) => postAction('/common', {
  CMD: 'update_building',
  building: JSON.stringify(params)
})
const delBuilding = (id) => postAction('/common', {
  CMD: 'delete_building',
  building: JSON.stringify({id})
})

// floor
const getFloorList = (params = {}) => getAction('/common', {
  CMD: 'get_floor',
  floor: JSON.stringify({
    params
  })
})
const getFloorByBuildingId = (buildingId) => getAction('/common', {
  CMD: 'get_building_floor',
  floor: JSON.stringify({
    buildingId
  })
})
const addFloor = (params = {}) => postAction('/common', {
  CMD: 'add_floor',
  floor: params
})
const editFloor = (params = {}) => postAction('/common', {
  CMD: 'update_floor',
  floor: JSON.stringify(params)
})
const delFloor = (id) => postAction('/common', {
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
