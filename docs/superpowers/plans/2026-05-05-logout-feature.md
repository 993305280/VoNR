# 退出登录功能实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现退出登录功能，用户点击 Header 退出按钮后弹出确认对话框，确认后清除登录状态并跳转登录页。

**Architecture:** 仅修改 `Header.vue`，接入已有的 auth store 和 router。无需新建文件。

**Tech Stack:** Vue 3, Pinia, Vue Router, Element Plus (ElMessageBox)

---

## File Structure

- Modify: `src/components/Header.vue` — 接入 auth store + router，实现退出逻辑，显示真实用户名

---

### Task 1: 实现退出登录功能

**Files:**
- Modify: `src/components/Header.vue:16-22`

- [ ] **Step 1: 修改 Header.vue 的 script 部分**

替换 `<script setup>` 块为：

```vue
<script setup>
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { SwitchButton, User } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  ElMessageBox.confirm('确定退出登录？', '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(() => {
    authStore.logout()
    router.push('/login')
  }).catch(() => {})
}
</script>
```

- [ ] **Step 2: 修改模板中的用户名显示**

将第 9 行的硬编码用户名：

```html
<span>User_Name</span>
```

改为：

```html
<span>{{ authStore.userInfo?.username || 'Admin' }}</span>
```

- [ ] **Step 3: 在模板顶部添加 authStore 实例**

在 `<template>` 标签内、`<div class="header">` 之前，确保没有需要额外添加的内容（`authStore` 已在 script 中定义，模板可直接使用）。

- [ ] **Step 4: 验证改动**

运行开发服务器确认：
1. 页面正常加载，Header 显示登录用户名（非硬编码的 User_Name）
2. 点击退出按钮弹出确认对话框
3. 点击"取消"关闭对话框，保持当前状态
4. 点击"确定"清除登录状态，跳转到 `/login` 页面
5. 尝试直接访问 `/dashboard` 应被重定向回 `/login`

Run: `npm run dev`
Expected: 应用正常运行，退出功能正常工作

- [ ] **Step 5: 提交**

```bash
git add src/components/Header.vue
git commit -m "feat: implement logout with confirmation dialog and dynamic username"
```
