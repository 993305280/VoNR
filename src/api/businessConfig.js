import request from '@/utils/request'

export function getBusinessConfigs(params) {
  return request.get('/business-configs', { params })
}

export function createBusinessConfig(data) {
  return request.post('/business-configs', data)
}

export function updateBusinessConfig(id, data) {
  return request.put(`/business-configs/${id}`, data)
}

export function deleteBusinessConfig(id) {
  return request.delete(`/business-configs/${id}`)
}

export function batchDeleteBusinessConfigs(ids) {
  return request.post('/business-configs/batch-delete', { ids })
}
