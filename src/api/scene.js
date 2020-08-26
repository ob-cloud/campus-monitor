/*
 * @Author: eamiear
 * @Date: 2019-08-07 15:19:34
 * @Last Modified by: eamiear
 * @Last Modified time: 2020-08-26 23:16:30
 */

// import {request} from '@/common/request'
import { getAction, postAction } from '@/utils/ajax'

const getSmartSceneList = (params) => getAction('/common', {
  CMD: 'get_smart_scene',
  scene: JSON.stringify(params)
})
const getSceneDeviceList = (params) => getAction('/common', {
  CMD: 'get_scene_devices',
  user: JSON.stringify(params)
})
const getSmartSceneById = (sceneNumber) => getAction('/common', {
  CMD: 'get_smart_single_scene',
  scene_number: sceneNumber
})
const execSmartScene = (sceneNumber) => postAction('/common', {
  CMD: 'execute_smart_scene',
  scene_number: sceneNumber
})
const editSmartScene = (params) => postAction('/common', {
  CMD: 'modify_smart_scene',
  scene: JSON.stringify(params)
})
const addSmartScene = (params) => postAction('/common', {
  CMD: 'set_smart_scene',
  scene: JSON.stringify(params)
})
const setSceneInfo = (scene) => postAction('/common', {
  CMD: 'setting_sc_info',
  scene: scene
})
const delScene = (sceneNumber) => postAction('/common', {
  CMD: 'execute_sc',
  scene_status: '03',
  scene_number: sceneNumber
})
const editSceneStatus = (sceneStatus, sceneNumber) => postAction('/common', {
  CMD: 'execute_sc',
  scene_status: sceneStatus,
  scene_number: sceneNumber
})

export {
  getSmartSceneList,
  getSceneDeviceList,
  getSmartSceneById,
  execSmartScene,
  editSmartScene,
  addSmartScene,
  setSceneInfo,
  delScene,
  editSceneStatus
}
// const SceneAPI = {
//   getSceneList (params) {
//     const page = params.pageNo
//     const pageSize = params.pageSize
//     return request.get('/consumer/common', {
//       CMD: 'query_scenes',
//       start: page,
//       count: pageSize,
//       ...params
//     })
//   },

//   executeScene (sceneNumber) {
//     return request.postForm('/consumer/common', {
//       CMD: 'execute_sc',
//       scene_status: '02',
//       scene_number: sceneNumber
//     })
//   },
// }
// export default SceneAPI
