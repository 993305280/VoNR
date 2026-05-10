import request from '@/utils/request'

export function getUserSubscriptions(params) {
  return request.get('/api/v1/user-subscriptions', { params })
}

export function getUserSubscription(id) {
  return request.get(`/api/v1/user-subscriptions/${id}`)
}

export function createUserSubscription(data) {
  return request.post('/api/v1/user-subscriptions', data)
}

export function updateUserSubscription(id, data) {
  return request.put(`/api/v1/user-subscriptions/${id}`, data)
}

export function deleteUserSubscription(id) {
  return request.delete(`/api/v1/user-subscriptions/${id}`)
}

export function batchDeleteUserSubscriptions(ids) {
  return request.post('/api/v1/user-subscriptions/batch-delete', { ids })
}
