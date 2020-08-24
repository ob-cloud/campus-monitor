/*
 * @Author: eamiear
 * @Date: 2019-08-07 15:19:34
 * @Last Modified by: eamiear
 * @Last Modified time: 2020-02-13 10:03:43
 */

import {request} from '@/common/request'

const SceneAPI = {
  getSceneList (params) {
    const page = params.pageNo
    const pageSize = params.pageSize
    return request.get('/consumer/common', {
      CMD: 'query_scenes',
      start: page,
      count: pageSize,
      ...params
    })
  },
  chageSceneStatus (sceneStatus, sceneNumber) {
    return request.postForm('/consumer/common', {
      CMD: 'execute_sc',
      scene_status: sceneStatus,
      scene_number: sceneNumber
    })
  },
  executeScene (sceneNumber) {
    return request.postForm('/consumer/common', {
      CMD: 'execute_sc',
      scene_status: '02',
      scene_number: sceneNumber
    })
  },
  removeScene (sceneNumber) {
    return request.postForm('/consumer/common', {
      CMD: 'execute_sc',
      scene_status: '03',
      scene_number: sceneNumber
    })
  },
  setScene (scene) {
    return request.get('/consumer/common', {
      CMD: 'setting_sc_info',
      scene
    })
  },
  setSmartScene (scene = {}) {
    return request.postForm('/consumer/common', {
      CMD: 'set_smart_scene',
      scene: JSON.stringify(scene)
    })
  },
  updateSmartScene (scene = {}) {
    return request.postForm('/consumer/common', {
      CMD: 'modify_smart_scene',
      scene: JSON.stringify(scene)
    })
  },
  executeSmartScene (sceneNumber) {
    return request.postForm('/consumer/common', {
      CMD: 'execute_smart_scene',
      scene_number: sceneNumber
    })
  },
  getSmartSceneById (sceneNumber) {
    return request.get('/consumer/common', {
      CMD: 'get_smart_single_scene',
      scene_number: sceneNumber
    })
  },
  getSceneDeviceList (user = {}) {
    return request.get('/consumer/common', {
      CMD: 'get_scene_devices',
      user: JSON.stringify(user)
    })
  },
  getSmartSceneList (scene = {}) {
    return request.get('/consumer/common', {
      CMD: 'get_smart_scene',
      scene: JSON.stringify(scene)
    })
  }
}
export default SceneAPI
