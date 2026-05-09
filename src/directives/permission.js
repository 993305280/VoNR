import { usePermissionStore } from '@/stores/permission'

export const permission = {
  mounted(el, binding) {
    const permissionStore = usePermissionStore()
    const value = binding.value

    if (value && !permissionStore.hasPermission(value)) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  },
  updated(el, binding) {
    const permissionStore = usePermissionStore()
    const value = binding.value

    if (value && !permissionStore.hasPermission(value)) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  }
}

export default permission
