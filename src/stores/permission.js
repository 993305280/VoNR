import { defineStore } from 'pinia'
import { getPermissions } from '@/api/menu'

const STORAGE_KEY = 'permissions'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  return []
}

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    permissions: loadFromStorage(),
    loaded: false
  }),
  getters: {
    hasPermission: (state) => {
      return (permission) => {
        return state.permissions.includes(permission)
      }
    }
  },
  actions: {
    async fetchPermissions() {
      try {
        const res = await getPermissions()
        if (res.code === 200) {
          this.permissions = res.data
          this.loaded = true
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.permissions))
        }
      } catch (error) {
        console.error('获取权限失败:', error)
      }
    },
    clearPermissions() {
      this.permissions = []
      this.loaded = false
      localStorage.removeItem(STORAGE_KEY)
    }
  }
})
