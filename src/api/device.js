/*
 * @Author: eamiear
 * @Date: 2019-08-05 17:32:41
 * @Last Modified by: eamiear
 * @Last Modified time: 2020-08-26 15:13:57
 */

// import {request} from '@/common/request'
import { getAction, postAction } from '@/utils/ajax'


// device
const getDeviceList = (params) => getAction('/common', {
  CMD: 'query_device',
  ...params
})

const getAllBuildingDeviceList = (params) => getAction('/common', { CMD: 'get_building_devices', user: JSON.stringify(params) })

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

const delObox = (oboxSerialId) => postAction('/common', {
  CMD: 'delete_obox',
  obox_serial_id: oboxSerialId,
  fForce_delete: '00'
})

const editOboxName = (oboxSerialId, name) => postAction('/common', {
  CMD: 'update_obox_name',
  obox_serial_id: oboxSerialId,
  name
})

// 开关

const getSwitchStatus = (serialId) => postAction('/common', {
  CMD: 'query_node_real_status',
  serialId
})

const editSwitchStatus = (serialId, status) => postAction('/common', {
  CMD: 'setting_node_status',
  serialId,
  status
})

// export  {
//   getDeviceList
// }

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
//   // removeDevice (serialId, name) {
//   //   return request.postForm('/consumer/common', {
//   //     CMD: 'modify_device',
//   //     serialId,
//   //     operate_type: '00',
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
//   // getDeviceStatusHistory (serialId, fromDate, toDate, type = '02') {
//   //   return request.postForm('/consumer/common', {
//   //     CMD: 'query_device_status_history',
//   //     serialId,
//   //     from_data: fromDate,
//   //     to_data: toDate,
//   //     type
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
//   // getTransponderDevice (serialId) {
//   //   return request.get('/consumer/common', {
//   //     CMD: 'query_ir_device',
//   //     serialId
//   //   })
//   // },
//   // getInfratedDeviceList (wifi = {}) {
//   //   return request.get('/consumer/common', {
//   //     CMD: 'get_wifi',
//   //     wifi: JSON.stringify(wifi)
//   //   })
//   // },
//   // removeInfratedDevice (deviceId) {
//   //   return request.postForm('/consumer/common', {
//   //     CMD: 'delete_ali_dev',
//   //     deviceId
//   //   })
//   // },
//   // reNameIrDevice (serialId, name) {
//   //   return request.postForm('/consumer/common', {
//   //     CMD: 'update_ir_name',
//   //     device_serial_id: serialId,
//   //     name
//   //   })
//   // },
//   // getIrCustomKeys () {
//   //   return request.postForm('/consumer/common', {
//   //     CMD: 'get_custom_key',
//   //     tId: 0
//   //   })
//   // }
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

// const GroupApi = {
//   // getPanelGroupList () {
//   //   return request.postForm('/consumer/common', {
//   //     CMD: 'get_panel_group',
//   //   })
//   // },
//   // setanelGroup (params = {}) {
//   //   return request.postForm('/consumer/common', {
//   //     CMD: 'set_panel_group',
//   //     ...params
//   //   })
//   // },
//   // delPanelGroup (groupId) {
//   //   return request.postForm('/consumer/common', {
//   //     CMD: 'del_panel_group',
//   //     group_id: groupId
//   //   })
//   // },
// }
export {
  getDeviceList,
  getAllBuildingDeviceList,

  getOboxList,
  getAllOboxList,
  getOboxDeviceList,
  delObox,
  editOboxName,

  getSwitchStatus,
  editSwitchStatus
}
