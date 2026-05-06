# Tab 状态持久化设计文档

## 概述

解决 Layout.vue 中 nav-tabs 刷新后丢失的问题。通过 sessionStorage 持久化 tab 状态，实现同窗口刷新后保留打开的 tab。

## 需求

1. **存储方式**：使用 sessionStorage 存储 tab 状态
2. **Dashboard 固定**：Dashboard tab 始终在第一个位置，不可关闭
3. **状态恢复**：刷新页面后，从 sessionStorage 恢复之前打开的 tab
4. **会话隔离**：关闭窗口后 tab 状态清空，重新打开时重新开始

## 设计方案

### 存储 Key

- **Key 名称**：`voNR_tabs`
- **存储格式**：JSON 数组，结构为 `[{ path: string, title: string }, ...]`
- **存储位置**：sessionStorage

### 核心逻辑

#### 1. 初始化（onMounted）

```javascript
onMounted(() => {
  const savedTabs = sessionStorage.getItem('voNR_tabs')
  if (savedTabs) {
    tabs.value = JSON.parse(savedTabs)
  } else {
    // 首次访问，添加 Dashboard
    tabs.value = [{ path: '/dashboard', title: pageTitleMap['Dashboard'] }]
  }
  // 确保 Dashboard 始终存在
  if (!tabs.value.find(t => t.path === '/dashboard')) {
    tabs.value.unshift({ path: '/dashboard', title: pageTitleMap['Dashboard'] })
  }
})
```

#### 2. 同步存储（watch）

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

#### 3. 关闭 tab（closeTab）

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

#### 4. 关闭其他 tab（closeOtherTabs）

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

#### 5. 模板修改

Dashboard tab 的关闭按钮不显示：

```html
<el-icon v-if="tab.path !== '/dashboard'" class="tab-close" @click.stop="closeTab(tab.path)">
  <Close />
</el-icon>
```

## 实现步骤

1. 在 Layout.vue 的 `<script setup>` 中添加 onMounted 逻辑，从 sessionStorage 恢复 tabs
2. 在 watch 回调中添加 sessionStorage 同步逻辑
3. 修改 closeTab 函数，跳过 Dashboard 并同步存储
4. 修改 closeOtherTabs 函数，始终保留 Dashboard 并同步存储
5. 修改模板，Dashboard tab 不显示关闭按钮

## 边界情况

1. **首次访问**：没有保存的 tab 状态，只显示 Dashboard
2. **手动输入 URL**：通过 watch 自动添加到 tabs
3. **关闭窗口后重新打开**：sessionStorage 清空，重新开始
4. **浏览器兼容性**：sessionStorage 在现代浏览器中广泛支持

## 测试用例

1. 打开多个 tab → 刷新页面 → 验证所有 tab 都保留
2. 关闭某个 tab → 刷新页面 → 验证该 tab 不再显示
3. 尝试关闭 Dashboard → 验证无法关闭
4. 关闭其他 tab → 验证只保留 Dashboard 和当前 tab
5. 关闭窗口 → 重新打开 → 验证 tab 状态重置

## 相关文件

- `src/views/Layout.vue` — 主要修改文件
