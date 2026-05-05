// src/stores/auth.js
import { defineStore } from 'pinia'

const STORAGE_KEY = 'auth'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch {
    // ignore
  }
  return { isLoggedIn: false, userInfo: null }
}

export const useAuthStore = defineStore('auth', {
  state: () => {
    const saved = loadFromStorage()
    return {
      isLoggedIn: saved.isLoggedIn,
      userInfo: saved.userInfo
    }
  },
  actions: {
    login(username) {
      this.isLoggedIn = true
      this.userInfo = { username }
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        isLoggedIn: true,
        userInfo: { username }
      }))
    },
    logout() {
      this.isLoggedIn = false
      this.userInfo = null
      localStorage.removeItem(STORAGE_KEY)
    }
  }
})
