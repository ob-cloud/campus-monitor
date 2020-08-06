import qs from 'qs'
import { axios } from './request'
import { getReqBaseUrl } from '@/config/env.config'

export function httpAction (url, parameter = {}, method = '', extra = {}) {
  const methods = ['post', 'put']
  if (extra.isData) {
    methods.push(method)
    delete extra.isData
  }
  const opts = methods.includes(method.toLowerCase()) ? { data: parameter } : { params: parameter }
  return axios({
    url,
    method: method,
    ...opts,
    ...extra
  })
}

export function postAction (url, parameter = {}, extra = {}) {
  return httpAction(url, parameter, 'post', extra)
}

export function putAction (url, parameter = {}, extra = {}) {
  return httpAction(url, parameter, 'put', extra)
}

export function getAction (url, parameter = {}, extra = {}) {
  return httpAction(url, parameter, 'get', extra)
}

export function deleteAction (url, parameter = {}, extra = {}) {
  return httpAction(url, parameter, 'delete', extra)
}

export function deleteJsonAction (url, parameter = {}, extra = {}) {
  const headers = { headers: { 'Content-Type': 'application/json'} }
  return deleteAction(url, parameter, {isData: false, ...headers, ...extra})
}

export function downloadAction (url, parameter = {}, extra = {}) {
  return getAction(url, parameter, { responseType: 'blob', ...extra })
}

export function downloadActionByWin (url, parameter) {
  window.open(getRequestUrl(url, parameter))
}

export function getRequestUrl (url, parameter = {}) {
  return getReqBaseUrl() + url + (qs.stringify(parameter) && ('?' + qs.stringify(parameter)))
}
