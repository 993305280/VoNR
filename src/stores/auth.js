import { defineStore } from 'pinia'
import { login as loginApi, logout as logoutApi, getProfile } from '@/api/auth'
import { useMenuStore } from './menu'
import { usePermissionStore } from './permission'

const STORAGE_KEY = 'auth'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  return { token: null, userInfo: null }
}

export const useAuthStore = defineStore('auth', {
  state: () => {
    const saved = loadFromStorage()
    return {
      token: saved.token,
      userInfo: saved.userInfo
    }
  },
  getters: {
    isLoggedIn: (state) => !!state.token
  },
  actions: {
    async login(username, password) {
      const res = await loginApi({ username, password })
      if (res.code === 200) {
        this.token = res.data.token
        this.userInfo = res.data.user
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          token: this.token,
          userInfo: this.userInfo
        }))

        // 登录成功后获取菜单和权限
        const menuStore = useMenuStore()
        const permissionStore = usePermissionStore()
        await Promise.all([
          menuStore.fetchMenus(),
          permissionStore.fetchPermissions()
        ])

        return { success: true }
      }
      return { success: false, message: res.message }
    },
    async logout() {
      try {
        await logoutApi()
      } catch {
        // 即使请求失败也清除本地状态
      }
      this.token = null
      this.userInfo = null
      localStorage.removeItem(STORAGE_KEY)

      // 清除菜单和权限
      const menuStore = useMenuStore()
      const permissionStore = usePermissionStore()
      menuStore.clearMenus()
      permissionStore.clearPermissions()
    },
    async fetchProfile() {
      const res = await getProfile()
      if (res.code === 200) {
        this.userInfo = res.data
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          token: this.token,
          userInfo: this.userInfo
        }))
      }
    }
  }
})
