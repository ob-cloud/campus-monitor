/*
 * @Author: eamiear
 * @Date: 2019-08-05 17:32:41
 * @Last Modified by: eamiear
 * @Last Modified time: 2020-09-30 10:27:29
 */

// import {request} from '@/common/request'
import { getAction, postFormAction, deleteAction } from '@/utils/ajax'


// device
const getDeviceList = (params) => getAction('/common', {
  CMD: 'query_device',
  ...params
})

const getAllBuildingDeviceList = (params) => getAction('/common', { CMD: 'get_building_devices', user: JSON.stringify(params) })

const delDevice = (serialId, name) => postFormAction('/common', {
  CMD: 'modify_device',
  serialId,
  operate_type: '00',
  name
})
const editDevice = (serialId, name) => getAction('/common', {
  CMD: 'modify_device',
  serialId,
  operate_type: '01',
  name
})

/**
 * // 扫描添加设备
 * params {
 *  deviceType=04&deviceChildType=17&countOfDevice=1&timeout=60
 * }
 */
const scanAndSaveDevicesToObox = (oboxSerialId, params) => postFormAction(`/aliService/scanByUnRestart/${oboxSerialId}`, {
  timeOut: 60,
  ...params
})
const pauseScanDevices = (oboxSerialId) => deleteAction(`/facade/scan/${oboxSerialId}`)

// OBOX
const getOboxList = (params) => getAction('/common', {
  CMD: 'get_obox',
  obox: JSON.stringify(params)
})

const getAllOboxList = () => getAction('/common', {
  CMD: 'get_allobox'
})

const getOboxDeviceList = (params) => getAction('/common', {
  CMD: 'get_obox_device',
  oboxdevice: JSON.stringify(params)
})

const addWiredObox = () => postFormAction('/common', {
  CMD: 'add_wired_obox'
})

// {"ssid":"OBE-dev","bssid":"20:6b:e7:7f:7c:95","password":"28068198"
const addWirelessObox = (ssid, password, bssid) => postFormAction('/common', {
  CMD: 'add_wireless_obox',
  config: JSON.stringify({ssid, password, bssid})
})

const delObox = (oboxSerialId) => postFormAction('/common', {
  CMD: 'delete_obox',
  obox_serial_id: oboxSerialId,
  fForce_delete: '00'
})

const editOboxName = (oboxSerialId, name) => postFormAction('/common', {
  CMD: 'modify_obox_name',
  obox_serial_id: oboxSerialId,
  obox_name: name
})

const getRoomObox = (roomId) => getAction('/common', {
  CMD: 'get_room_obox',
  device: JSON.stringify({ roomId })
})

const getBindableOboxList = (params) => getAction('/common', {
  CMD: 'get_building_obox',
  user: JSON.stringify(params)
})

const bindObox2Room = (roomId, oboxId, oboxSerialId) => postFormAction('/common', {
  CMD: 'bind_room_obox',
  device: JSON.stringify({ roomId, oboxId, oboxSerialId })
})

const unbindObox2Room = (roomId, oboxId, oboxSerialId) => postFormAction('/common', {
  CMD: 'unbind_room_obox',
  device: JSON.stringify({ roomId, oboxId, oboxSerialId })
})

// 开关

const getSwitchStatus = (serialId) => postFormAction('/common', {
  CMD: 'query_node_real_status',
  serialId
})

const editSwitchStatus = (serialId, status) => postFormAction('/common', {
  CMD: 'setting_node_status',
  serialId,
  status
})


// 面板编组
const getPanelGroupList = (params) => getAction('/common', {
  // CMD: 'get_user_panel_group',
  CMD: 'get_panel_00',
  ...params
})
const getPanelChildGroupList = (groupNo) => getAction('/common', {
  CMD: 'get_group_panel_no',
  addr: groupNo
})
// 添加编辑组
const setPanelGroup = (params, extra = {}) => getAction('/common', {
  CMD: 'set_panel_group',
  ...params
}, extra)
// 删除组
const delPanelGroup = (groupId, type) => postFormAction('/common', {
  CMD: 'del_panel_group',
  group_id: groupId,
  type
})
const getPanelGroupDeviceList = (groupId) => getAction('/common', {
  CMD: 'get_device_panel',
  group_id: groupId
})

// 组基本信息
const editPanelGroup = (groupId, groupName) => getAction('/common', {
  CMD: 'edit_panel',
  groupId,
  groupName
})

// 添加组设备
const addPanelGroupDeviceMember = (groupId, groupMember, extra = {}) => getAction('/common', {
  CMD: 'add_panel_member',
  groupId,
  groupMember
}, extra)
// 删除组设备
const delPanelGroupDeviceMember = (groupId, groupMember, extra = {}) => getAction('/common', {
  CMD: 'del_panel_member',
  groupId,
  groupMember
}, extra)

// 组设备闪烁
const twinklePanelGroupDevice = (serialId) => getAction('/common', {
  CMD: 'light_twinkle',
  serialId
})

// 添加组设备
const addPanelGroupDevice = (params, extra = {}) => getAction('/common', {
  CMD: 'set_panel_group',
  ...params
}, extra)

// 删除组设备
const delPanelGroupDevice = (groupId, type) => postFormAction('/common', {
  CMD: 'del_panel_group',
  group_id: groupId,
  type
})

// 六键开关，键设置
const setPanelKey = (params) => getAction('/common', {
  CMD: 'set_panel_key',
  ...params
})

// 根据序列号获取关联组
const getGroupListByPanelId = (serialId) => getAction('/common', {
  CMD: 'get_panel_group',
  serialId
})

// 获取键配置的组列表
const getGrouplListPanelKey = (serialId, index) => getAction('/common', {
  CMD: 'get_panel_key',
  serialId,
  index
})

// 设备分组
const getDeviceGroupList = (params) => getAction('/common', {
  CMD: 'query_group',
  ...params
})
// same with getDeviceGroupList
const getLocalDeviceGroupList = (params) => getAction('/common', {
  CMD: 'query_local_group',
  group: { ...params }
})
// group={"pageNo":1,"pageSize":10,"groupId":18}
const getGroupMemberById = (params) => getAction('/common', {
  CMD: 'query_local_group_device',
  group: { ...params }
})

const addDeviceGroup = (oboxSerialId, groupName, groupMember = []) => postFormAction('/common', {
  CMD: 'set_group',
  operate_type: '01',
  group_style: '00',
  obox_serial_id: oboxSerialId,
  group_name: groupName,
  group_member: JSON.stringify(groupMember)
})
const delDeviceGroup = (groupId) => postFormAction('/common', {
  CMD: 'set_group',
  operate_type: '00',
  group_style: '00',
  group_id: groupId
})
const execDeviceGroup = (groupId, groupState) => postFormAction('/common', {
  CMD: 'set_group',
  operate_type: '06',
  group_style: '00',
  group_id: groupId,
  group_state: groupState
})
const editDeviceGroup = (groupId, groupName) => postFormAction('/common', {
  CMD: 'set_group',
  operate_type: '05',
  group_style: '00',
  group_id: groupId,
  group_name: groupName
})

const addDeviceGroupMember = (groupId, groupMember, extra = {}) => postFormAction('/common', {
  CMD: 'set_group',
  operate_type: '03',
  group_style: '00',
  group_member: JSON.stringify(groupMember),
  group_id: groupId
}, extra)
const editDeviceGroupMember = (groupId, groupMember) => postFormAction('/common', {
  CMD: 'set_group',
  operate_type: '02',
  group_style: '00',
  group_member: JSON.stringify(groupMember),
  group_id: groupId
})

const delDeviceGroupMember = (groupId, groupMember, extra = {}) => postFormAction('/common', {
  CMD: 'set_group',
  operate_type: '04',
  group_style: '00',
  group_id: groupId,
  group_member: JSON.stringify(groupMember)
}, extra)

// 温湿度
const getDeviceStatusHistory = (serialId, fromDate, toDate, type = '02') => getAction('/common', {
  CMD: 'query_device_status_history',
  serialId,
  from_data: fromDate,
  to_data: toDate,
  type
})

// 红外

const editIrDevice = (serialId, name) => postFormAction('/common', {
  CMD: 'update_ir_name',
  device_serial_id: serialId,
  name
})
const getTransponderDevice = (serialId) => getAction('/common', {
  CMD: 'query_ir_device',
  serialId
})
const getInfratedDeviceList = (params) => getAction('/common', {
  CMD: 'get_wifi',
  wifi: JSON.stringify(params)
})

const delInfratedDevice = (deviceId) => getAction('/common', {
  CMD: 'delete_ali_dev',
  deviceId
})
const getIrCustomKeys = () => getAction('/common', {
  CMD: 'get_custom_key',
  tId: 0
})

// const DeviceAPI = {
//   // getDeviceList (params) {
//   //   const page = params.pageNo
//   //   const pageSize = params.pageSize
//   //   delete params.pageNo
//   //   delete params.pageSize
//   //   return request.get('/consumer/common', {
//   //     CMD: 'query_device',
//   //     start_index: page,
//   //     count: pageSize,
//   //     ...params
//   //   })
//   // },

//   // getCameraList () {
//   //   return request.get('/consumer/nvr/device', {
//   //     start_index: 1
//   //   })
//   // },
//   // getOboxList (page = 0, pageSize = 300) {
//   //   return request.get('/consumer/common', {
//   //     CMD: 'query_obox',
//   //     start_index: page,
//   //     count: pageSize
//   //   })
//   // },
//   // getDeviceOperationHistory (params) {
//   //   return request.get('/consumer/common', {
//   //     CMD: 'query_device_status_history',
//   //     serialId: params.serialId,
//   //     type: '00',
//   //     start: params.pageNo,
//   //     count: params.pageSize
//   //   })
//   // },
//   // modifyDeviceName (serialId, name) {
//   //   return request.postForm('/consumer/common', {
//   //     CMD: 'modify_device',
//   //     serialId,
//   //     operate_type: '01',
//   //     name
//   //   })
//   // },

//   // searchToAddDevice (oboxId, deviceType, deviceSubType) {
//   //   return request.postForm('/consumer/common', {
//   //     CMD: 'search_new_device',
//   //     obox_serial_id: oboxId,
//   //     serialId: '',
//   //     device_type: deviceType,
//   //     device_child_type: deviceSubType,
//   //     state: '02',
//   //     timeout: 60
//   //   })
//   // },


// }

// const WifiDeviceAPI = {
//   // getWifiDeviceList () {
//   //   return request.postForm('/consumer/common', {
//   //     CMD: 'query_ali_dev'
//   //   })
//   // },
//   // // 红外转发器下的设备




// }


// 空调控制
// const AcControlAPI = {
//   // setAcAction (serialId, index, key) {
//   //   return request.postForm('/consumer/common', {
//   //     CMD: 'control_ir_device',
//   //     serialId,
//   //     index,
//   //     keyType: 0,
//   //     key
//   //   })
//   // }
// }

export {
  getDeviceList,
  getAllBuildingDeviceList,
  delDevice,
  editDevice,
  scanAndSaveDevicesToObox,
  pauseScanDevices,

  getOboxList,
  getAllOboxList,
  getOboxDeviceList,
  addWiredObox,
  addWirelessObox,
  delObox,
  editOboxName,
  getRoomObox,
  getBindableOboxList,
  bindObox2Room,
  unbindObox2Room,

  getSwitchStatus,
  editSwitchStatus,

  getPanelGroupList,
  getPanelChildGroupList,
  getPanelGroupDeviceList,
  editPanelGroup,
  addPanelGroupDeviceMember,
  delPanelGroupDeviceMember,
  twinklePanelGroupDevice,
  addPanelGroupDevice,
  delPanelGroupDevice,
  setPanelGroup,
  delPanelGroup,
  setPanelKey,
  getGroupListByPanelId,
  getGrouplListPanelKey,

  getDeviceGroupList,
  getLocalDeviceGroupList,
  getGroupMemberById,
  addDeviceGroup,
  delDeviceGroup,
  execDeviceGroup,
  editDeviceGroup,
  addDeviceGroupMember,
  editDeviceGroupMember,
  delDeviceGroupMember,

  getDeviceStatusHistory,

  editIrDevice,
  getTransponderDevice,
  getInfratedDeviceList,
  delInfratedDevice,
  getIrCustomKeys,
}
