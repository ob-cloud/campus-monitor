/*
 * @Author: eamiear
 * @Date: 2019-11-04 11:23:06
 * @Last Modified by: eamiear
 * @Last Modified time: 2020-08-24 16:05:56
 */

import { getAction, postAction } from '@/utils/ajax'

const getPointList = () => getAction('/common', { CMD: 'get_map_point' })
const createPoint = (roomId, x, y) => postAction('/common', { CMD: 'add_map_point', point: JSON.stringify({roomId, x, y})})
const removePoint = (id) => postAction('/common', { point: JSON.stringify(id), CMD: 'delete_map_point' })
const getMapInfo  = (params) => getAction('/common', { ...params, ...{ CMD: 'get_map_info' }})
export {
  getPointList,
  createPoint,
  removePoint,
  getMapInfo
}
