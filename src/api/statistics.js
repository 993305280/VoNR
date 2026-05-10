import request from '@/utils/request'

export function getCallCountStats(params) {
  return request.get('/statistics/call-count', { params })
}

export function getServiceCountStats(params) {
  return request.get('/statistics/service-count', { params })
}

export function getUserCountStats(params) {
  return request.get('/statistics/user-count', { params })
}
