import { defineStore } from 'pinia'
import { getMenus } from '@/api/menu'

const STORAGE_KEY = 'menus'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  return []
}

export const useMenuStore = defineStore('menu', {
  state: () => ({
    menus: loadFromStorage(),
    loaded: false
  }),
  actions: {
    async fetchMenus() {
      try {
        // 每次都从服务器获取最新菜单数据
        const res = await getMenus()
        if (res.code === 200) {
          this.menus = res.data
          this.loaded = true
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.menus))
        }
      } catch (error) {
        console.error('获取菜单失败:', error)
      }
    },
    clearMenus() {
      this.menus = []
      this.loaded = false
      localStorage.removeItem(STORAGE_KEY)
    }
  }
})
