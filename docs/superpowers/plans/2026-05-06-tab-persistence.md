# Tab 状态持久化实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 Layout.vue 中 nav-tabs 的 sessionStorage 持久化，刷新页面后保留打开的 tab

**Architecture:** 在 Layout.vue 中添加 sessionStorage 读写逻辑，每次 tabs 变化时同步到 sessionStorage，页面加载时从 sessionStorage 恢复。Dashboard tab 始终固定在第一个位置，不可关闭。

**Tech Stack:** Vue 3 Composition API, sessionStorage

---

## 文件结构

- **Modify:** `src/views/Layout.vue` — 添加 tab 持久化逻辑

---

### Task 1: 添加 onMounted 生命周期钩子

**Files:**
- Modify: `src/views/Layout.vue:76-77` (import 区域)
- Modify: `src/views/Layout.vue:185-186` (onMounted 区域)

- [ ] **Step 1: 确保 onMounted 已导入**

检查 Layout.vue 第 77 行，确认 onMounted 已在 import 中：

```javascript
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
```

如果已存在，跳到 Step 2。

- [ ] **Step 2: 在 onMounted 中添加 sessionStorage 恢复逻辑**

在 Layout.vue 的 `onMounted` 钩子中（约第 185 行），添加从 sessionStorage 恢复 tabs 的逻辑：

```javascript
onMounted(() => {
  const savedTabs = sessionStorage.getItem('voNR_tabs')
  if (savedTabs) {
    tabs.value = JSON.parse(savedTabs)
  } else {
    tabs.value = [{ path: '/dashboard', title: pageTitleMap['Dashboard'] }]
  }
  // 确保 Dashboard 始终存在
  if (!tabs.value.find(t => t.path === '/dashboard')) {
    tabs.value.unshift({ path: '/dashboard', title: pageTitleMap['Dashboard'] })
  }
})
```

- [ ] **Step 3: 验证功能**

打开浏览器控制台，执行以下操作：
1. 访问 `/dashboard`，打开多个 tab
2. 在控制台执行 `sessionStorage.getItem('voNR_tabs')`，验证数据已保存
3. 刷新页面，验证所有 tab 都保留
4. 关闭浏览器窗口，重新打开应用，验证 tab 状态重置

- [ ] **Step 4: 提交代码**

```bash
git add src/views/Layout.vue
git commit -m "feat: add sessionStorage restore for tabs on mount"
```

---

### Task 2: 在 watch 中同步存储到 sessionStorage

**Files:**
- Modify: `src/views/Layout.vue:112-117` (watch 回调)

- [ ] **Step 1: 修改 watch 回调，添加 sessionStorage 同步**

在 Layout.vue 的 `watch` 回调中（约第 112-117 行），在末尾添加 sessionStorage 同步逻辑：

```javascript
watch(() => route.path, (newPath) => {
  activeTab.value = newPath
  if (newPath !== '/dashboard' && !tabs.value.find(t => t.path === newPath)) {
    tabs.value.push({ path: newPath, title: pageTitleMap[route.name] || '未知页面' })
  }
  // 同步到 sessionStorage
  sessionStorage.setItem('voNR_tabs', JSON.stringify(tabs.value))
}, { immediate: true })
```

- [ ] **Step 2: 验证功能**

1. 访问 `/dashboard`
2. 依次访问 `/business/application` 和 `/business/config`
3. 在控制台执行 `sessionStorage.getItem('voNR_tabs')`，验证包含 3 个 tab
4. 刷新页面，验证所有 tab 都保留且顺序正确

- [ ] **Step 3: 提交代码**

```bash
git add src/views/Layout.vue
git commit -m "feat: sync tabs to sessionStorage on route change"
```

---

### Task 3: 修改 closeTab 函数，跳过 Dashboard 并同步存储

**Files:**
- Modify: `src/views/Layout.vue:131-145` (closeTab 函数)

- [ ] **Step 1: 修改 closeTab 函数**

在 Layout.vue 的 `closeTab` 函数中（约第 131-145 行），添加 Dashboard 保护和 sessionStorage 同步：

```javascript
const closeTab = (tabPath) => {
  if (tabPath === '/dashboard') return // 不允许关闭 Dashboard
  const index = tabs.value.findIndex(t => t.path === tabPath)
  if (index === -1) return

  tabs.value.splice(index, 1)
  // 同步到 sessionStorage
  sessionStorage.setItem('voNR_tabs', JSON.stringify(tabs.value))

  if (tabPath === activeTab.value) {
    if (tabs.value.length === 0) {
      router.push('/dashboard')
    } else {
      const newIndex = Math.min(index, tabs.value.length - 1)
      router.push(tabs.value[newIndex].path)
    }
  }
}
```

- [ ] **Step 2: 验证功能**

1. 访问 `/dashboard`，打开多个 tab
2. 尝试关闭 Dashboard tab，验证无法关闭（关闭按钮点击无效）
3. 关闭其他 tab，刷新页面，验证该 tab 不再显示
4. 关闭当前激活的 tab，验证自动切换到相邻 tab

- [ ] **Step 3: 提交代码**

```bash
git add src/views/Layout.vue
git commit -m "feat: protect Dashboard tab from closing and sync to sessionStorage"
```

---

### Task 4: 修改 closeOtherTabs 函数，始终保留 Dashboard

**Files:**
- Modify: `src/views/Layout.vue:147-154` (closeOtherTabs 函数)

- [ ] **Step 1: 修改 closeOtherTabs 函数**

在 Layout.vue 的 `closeOtherTabs` 函数中（约第 147-154 行），始终保留 Dashboard 并同步存储：

```javascript
const closeOtherTabs = () => {
  const current = tabs.value.find(t => t.path === activeTab.value)
  // 始终保留 Dashboard
  tabs.value = [
    { path: '/dashboard', title: pageTitleMap['Dashboard'] },
    ...(current && current.path !== '/dashboard' ? [current] : [])
  ]
  // 同步到 sessionStorage
  sessionStorage.setItem('voNR_tabs', JSON.stringify(tabs.value))
}
```

- [ ] **Step 2: 验证功能**

1. 访问 `/dashboard`，打开多个 tab
2. 右键点击某个非 Dashboard 的 tab，选择"关闭其他标签页"
3. 验证只保留 Dashboard 和当前 tab
4. 刷新页面，验证结果保持不变

- [ ] **Step 3: 提交代码**

```bash
git add src/views/Layout.vue
git commit -m "feat: always keep Dashboard when closing other tabs"
```

---

### Task 5: 修改模板，Dashboard tab 不显示关闭按钮

**Files:**
- Modify: `src/views/Layout.vue:33-35` (模板中的 tab-close 图标)

- [ ] **Step 1: 修改模板，为 Dashboard tab 隐藏关闭按钮**

在 Layout.vue 的模板中（约第 33-35 行），为 Dashboard tab 隐藏关闭按钮：

```html
<el-icon v-if="tab.path !== '/dashboard'" class="tab-close" @click.stop="closeTab(tab.path)">
  <Close />
</el-icon>
```

- [ ] **Step 2: 验证功能**

1. 访问 `/dashboard`，观察 Dashboard tab 没有关闭按钮
2. 打开其他 tab，验证其他 tab 有关闭按钮
3. 刷新页面，验证 Dashboard tab 始终显示且没有关闭按钮

- [ ] **Step 3: 提交代码**

```bash
git add src/views/Layout.vue
git commit -m "feat: hide close button for Dashboard tab"
```

---

### Task 6: 完整功能测试

**Files:**
- Test: 手动测试

- [ ] **Step 1: 执行完整测试用例**

测试场景 1：刷新后保留 tabs
1. 访问 `/dashboard`
2. 依次访问 `/business/application`、`/business/config`、`/user/list`
3. 验证顶部显示 4 个 tab（Dashboard + 3 个页面）
4. 刷新页面（F5）
5. 验证所有 4 个 tab 都保留，且 Dashboard 在第一个位置

测试场景 2：关闭 tab 后刷新
1. 继续场景 1，关闭 `/business/config` tab
2. 刷新页面
3. 验证只显示 3 个 tab（Dashboard + `/business/application` + `/user/list`）

测试场景 3：关闭当前 tab
1. 激活 `/user/list` tab
2. 关闭该 tab
3. 验证自动切换到相邻 tab（`/business/application`）
4. 刷新页面，验证 tab 状态正确

测试场景 4：关闭其他 tabs
1. 右键点击 `/business/application` tab
2. 选择"关闭其他标签页"
3. 验证只保留 Dashboard 和 `/business/application`
4. 刷新页面，验证结果保持不变

测试场景 5：会话隔离
1. 完成以上测试
2. 关闭浏览器窗口
3. 重新打开应用
4. 验证只有 Dashboard tab（tab 状态已重置）

测试场景 6：Dashboard 不可关闭
1. 尝试通过多种方式关闭 Dashboard tab：
   - 点击关闭按钮（应该没有）
   - 右键菜单选择"关闭当前标签页"
2. 验证 Dashboard 始终存在

- [ ] **Step 2: 修复发现的问题**

如果测试中发现问题，修复并重新测试。

- [ ] **Step 3: 最终提交**

```bash
git add -A
git commit -m "feat: complete tab persistence with sessionStorage"
```

---

## 验证清单

完成所有任务后，确认以下内容：

- [ ] Dashboard tab 始终在第一个位置
- [ ] Dashboard tab 不显示关闭按钮
- [ ] 其他 tab 可以正常关闭
- [ ] 刷新页面后所有 tab 都保留
- [ ] 关闭窗口后重新打开，tab 状态重置
- [ ] sessionStorage 中正确存储了 tab 数据
- [ ] 页面控制台无错误
