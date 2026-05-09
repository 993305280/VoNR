import request from '@/utils/request'

// 获取图片列表
export function getImageList(params) {
  return request.get('/images', { params })
}

// 获取图片详情
export function getImageById(id) {
  return request.get(`/images/${id}`)
}

// 新增图片
export function createImage(data) {
  return request.post('/images', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000
  })
}

// 更新图片
export function updateImage(id, data) {
  return request.put(`/images/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000
  })
}

// 删除图片
export function deleteImage(id) {
  return request.delete(`/images/${id}`)
}

// 批量删除
export function batchDeleteImages(ids) {
  return request.post('/images/batch-delete', { ids })
}
