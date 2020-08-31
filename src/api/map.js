/*
 * @Author: eamiear
 * @Date: 2019-11-04 11:23:06
 * @Last Modified by: eamiear
 * @Last Modified time: 2020-08-31 14:33:41
 */

import { getAction, postFormAction } from '@/utils/ajax'

const getPointList = () => getAction('/common', { CMD: 'get_map_point' })
const createPoint = (roomId, x, y) => postFormAction('/common', { CMD: 'add_map_point', point: JSON.stringify({roomId, x, y})})
const removePoint = (id) => postFormAction('/common', { point: JSON.stringify({id}), CMD: 'delete_map_point' })
const getMapInfo  = (params) => getAction('/common', { ...params, ...{ CMD: 'get_map_info' }})
export {
  getPointList,
  createPoint,
  removePoint,
  getMapInfo
}
