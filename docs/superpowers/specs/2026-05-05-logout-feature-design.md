# 退出登录功能设计

## 目标

实现完整的退出登录流程：用户点击 Header 中的退出按钮，弹出确认对话框，确认后清除登录状态并跳转至登录页。

## 改动范围

仅修改 `src/components/Header.vue`。无需新建文件或修改其他组件。

## 具体改动

### Header.vue

1. **导入依赖**：添加 `useRouter`（vue-router）和 `useAuthStore`（stores/auth）

2. **handleLogout 方法**：
   - 调用 `ElMessageBox.confirm('确定退出登录？', '提示', { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' })`
   - 用户点击"确定"：调用 `authStore.logout()` → `router.push('/login')`
   - 用户点击"取消"：不执行任何操作（Promise reject 已被 Element Plus 处理）

3. **用户名显示**：
   - 将硬编码的 `"User_Name"` 改为 `authStore.userInfo?.username || 'Admin'`

## 不需要改动的部分

- `src/stores/auth.js`：已有完整的 `logout()` 方法（清除 localStorage + 重置状态）
- `src/router/index.js`：路由守卫已正确处理未登录用户重定向到 `/login`
- `src/views/Login.vue`：无需修改

## 用户体验

- 点击退出按钮 → 弹出确认对话框（warning 样式）
- 确认退出 → 清除状态 → 跳转登录页
- 取消退出 → 对话框关闭，保持当前状态
