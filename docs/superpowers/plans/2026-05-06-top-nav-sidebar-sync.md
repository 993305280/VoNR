# 顶部导航标签页与侧边栏联动 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现点击顶部导航标签页时，侧边栏自动高亮对应菜单项并展开父菜单。

**Architecture:** 修改 Sidebar.vue，将 `activeMenu` 改为 computed 以响应路由变化，新增 `defaultOpeneds` 计算属性自动推导需展开的父菜单路径，绑定到 el-menu 的 `:default-openeds`。

**Tech Stack:** Vue 3, Element Plus (el-menu), Vue Router

---

### Task 1: 修改 Sidebar.vue 的 script setup 部分

**Files:**
- Modify: `src/components/Sidebar.vue:41-61`

- [ ] **Step 1: 将 `activeMenu` 从 ref 改为 computed**

在 `src/components/Sidebar.vue` 中，将第 61 行：

```js
const activeMenu = ref(route.path)
```

改为：

```js
const activeMenu = computed(() => route.path)
```

同时更新 import 语句（第 42 行），确保引入 `computed`：

```js
import { computed } from 'vue'
```

- [ ] **Step 2: 新增 `defaultOpeneds` 计算属性**

在 `activeMenu` 定义之后、`menuList` 之前，添加：

```js
const defaultOpeneds = computed(() => {
  const path = route.path
  const openeds = []

  // 收集所有菜单和子菜单的 path
  for (const menu of menuList) {
    if (path.startsWith(menu.path)) {
      openeds.push(menu.path)
    }
    if (menu.subMenus) {
      for (const sub of menu.subMenus) {
        if (path.startsWith(sub.path)) {
          openeds.push(sub.path)
        }
      }
    }
  }

  return openeds
})
```

- [ ] **Step 3: 更新 el-menu 模板绑定**

在 `src/components/Sidebar.vue` 的 `<el-menu>` 标签（第 3 行）上，添加 `:default-openeds` 绑定：

```html
<el-menu
  :default-active="activeMenu"
  :default-openeds="defaultOpeneds"
  :unique-opened="true"
  :collapse="collapsed"
  router
  background-color="#ffffff"
  text-color="#333333"
  active-text-color="#2196f3"
>
```

- [ ] **Step 4: 手动验证**

启动开发服务器，执行以下验证：

1. 点击顶部标签页切换到「计费套餐」页面，确认侧边栏高亮「CDR管理 > 计费套餐」且 CDR管理 菜单展开
2. 点击顶部标签页切换到「呼叫监控」页面，确认侧边栏高亮「数据监管 > 实时监控 > 呼叫监控」且 数据监管 和 实时监控 都展开
3. 点击顶部标签页切换回 Dashboard，确认侧边栏不高亮任何菜单项
4. 先通过侧边栏点击展开某个菜单并进入子页面，再点击顶部标签页切换到其他菜单的页面，确认侧边栏正确切换展开和高亮
5. 确认通过侧边栏点击菜单导航功能不受影响

- [ ] **Step 5: Commit**

```bash
git add src/components/Sidebar.vue
git commit -m "feat: sync sidebar highlight and expand state with top-nav tab navigation"
```
