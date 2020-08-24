/*
 * @Author: eamiear
 * @Date: 2019-11-04 11:23:06
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-11-13 11:12:44
 */

import {request} from '@/common/request'

const MapAPI = {
  getPointList () {
    return request.get('/consumer/common', {
      CMD: 'get_map_point',
    })
  },
  createPoint (roomId, x, y) {
    return request.postForm('/consumer/common', {
      CMD: 'add_map_point',
      point: JSON.stringify({roomId, x, y})
    })
  },
  removePoint (id) {
    return request.postForm('/consumer/common', {
      CMD: 'delete_map_point',
      point: JSON.stringify({id})
    })
  },
  getMapInfo () {
    return request.get('/consumer/common', {
      CMD: 'get_map_info'
    })
  }
}
export default MapAPI
