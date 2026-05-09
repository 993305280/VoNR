import request from '@/utils/request'

export function getMenus() {
  return request.get('/menus')
}

export function getPermissions() {
  return request.get('/permissions')
}
