import request from '@/utils/request'

export function getApplications(params) {
  return request.get('/applications', { params })
}

export function getApplicationById(id) {
  return request.get(`/applications/${id}`)
}

export function createApplication(data) {
  return request.post('/applications', data)
}

export function updateApplication(id, data) {
  return request.put(`/applications/${id}`, data)
}

export function deleteApplication(id) {
  return request.delete(`/applications/${id}`)
}

export function batchDeleteApplications(ids) {
  return request.post('/applications/batch-delete', { ids })
}
