import request from '@/utils/request'

export function getUserSubscriptions(params) {
  return request.get('/user-subscriptions', { params })
}

export function getUserSubscription(id) {
  return request.get(`/user-subscriptions/${id}`)
}

export function createUserSubscription(data) {
  return request.post('/user-subscriptions', data)
}

export function updateUserSubscription(id, data) {
  return request.put(`/user-subscriptions/${id}`, data)
}

export function deleteUserSubscription(id) {
  return request.delete(`/user-subscriptions/${id}`)
}

export function batchDeleteUserSubscriptions(ids) {
  return request.post('/user-subscriptions/batch-delete', { ids })
}
