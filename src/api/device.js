/*
 * @Author: eamiear
 * @Date: 2019-08-05 17:32:41
 * @Last Modified by: eamiear
 * @Last Modified time: 2020-08-31 15:31:05
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

/**
 * // 扫描添加设备
 * params {
 *  deviceType=04&deviceChildType=17&countOfDevice=1&timeout=60
 * }
 */
const scanAndSaveDevicesToObox = (oboxSerialId, params) => postFormAction(`/aliService/scanByUnRestart/${oboxSerialId}`, {
  timeout: 60,
  ...params
})
const pauseScanDevices = (oboxSerialId) => deleteAction(` /facade/scan/${oboxSerialId}`)

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


// group
const getPanelGroupList = (params) => getAction('/common', {
  CMD: 'get_user_panel_group',
  ...params
})
const setPanelGroup = (params) => getAction('/common', {
  CMD: 'set_panel_group',
  ...params
})
const delPanelGroup = (groupId) => postFormAction('/common', {
  CMD: 'del_panel_group',
  group_id: groupId
})

const setPanelKey = (params) => getAction('/common', {
  CMD: 'set_panel_key',
  ...params
})

const getGroupListByPanelId = (serialId) => getAction('/common', {
  CMD: 'get_panel_group',
  serialId
})

const getGrouplListPanelKey = (serialId, index) => getAction('/common', {
  CMD: 'get_panel_key',
  serialId,
  index
})

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
  scanAndSaveDevicesToObox,
  pauseScanDevices,

  getOboxList,
  getAllOboxList,
  getOboxDeviceList,
  delObox,
  editOboxName,

  getSwitchStatus,
  editSwitchStatus,

  getPanelGroupList,
  setPanelGroup,
  delPanelGroup,
  setPanelKey,
  getGroupListByPanelId,
  getGrouplListPanelKey,

  getDeviceStatusHistory,

  editIrDevice,
  getTransponderDevice,
  getInfratedDeviceList,
  delInfratedDevice,
  getIrCustomKeys,
}
