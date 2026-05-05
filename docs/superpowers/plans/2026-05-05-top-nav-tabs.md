# Top Nav Tab Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the top-nav bar into a browser-style tab navigation with keep-alive page switching and close controls.

**Architecture:** Layout.vue maintains a tabs array and activeTab ref. A route watcher adds tabs on navigation. Keep-alive wraps router-view. Close logic navigates to adjacent tab or Dashboard.

**Tech Stack:** Vue 3 (Composition API), Vue Router, Element Plus

---

### Task 1: Add tab state and route watcher to Layout.vue

**Files:**
- Modify: `src/views/Layout.vue:48-99`

- [ ] **Step 1: Add tab state refs and route watcher**

Replace the script section in Layout.vue with:

```js
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'
import { Menu, ArrowLeft, HomeFilled, Expand, Close } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const sidebarCollapsed = ref(false)

const pageTitleMap = {
  'Dashboard': 'CDR数据统计',
  'SystemOverview': '素材库列表',
  'ApplicationManagement': '应用管理',
  'BusinessConfiguration': '业务配置',
  'UserSubscription': '用户订购关系',
  'SceneConfiguration': '场景配置',
  'CDRList': 'CDR管理',
  'LogList': '日志管控',
  'DataMonitor': '数据监控',
  'RealtimeCall': '呼叫监控',
  'RealtimeService': '服务监控',
  'HistoryCall': '呼叫历史',
  'HistoryService': '服务历史',
  'AnalysisTrend': '趋势分析',
  'AnalysisRanking': '排名分析'
}

const tabs = ref([
  { path: '/dashboard', title: pageTitleMap['Dashboard'] }
])
const activeTab = ref('/dashboard')

watch(() => route.path, (newPath) => {
  activeTab.value = newPath
  if (!tabs.value.find(t => t.path === newPath)) {
    tabs.value.push({ path: newPath, title: pageTitleMap[route.name] || '未知页面' })
  }
}, { immediate: true })

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const goHome = () => {
  router.push('/dashboard')
}

const handleTabClick = (tab) => {
  router.push(tab.path)
}

const closeTab = (tabPath) => {
  const index = tabs.value.findIndex(t => t.path === tabPath)
  if (index === -1) return

  tabs.value.splice(index, 1)

  if (tabPath === activeTab.value) {
    if (tabs.value.length === 0) {
      router.push('/dashboard')
    } else {
      const newIndex = Math.min(index, tabs.value.length - 1)
      router.push(tabs.value[newIndex].path)
    }
  }
}

const closeOtherTabs = () => {
  const current = tabs.value.find(t => t.path === activeTab.value)
  const dashboard = tabs.value.find(t => t.path === '/dashboard')
  tabs.value = [dashboard, current].filter(Boolean)
  // deduplicate
  const seen = new Set()
  tabs.value = tabs.value.filter(t => {
    if (seen.has(t.path)) return false
    seen.add(t.path)
    return true
  })
}

const closeAllTabs = () => {
  tabs.value = []
  router.push('/dashboard')
}

const contextMenuTab = ref(null)
const showContextMenu = ref(false)
const contextMenuPos = ref({ x: 0, y: 0 })

const openContextMenu = (e, tab) => {
  e.preventDefault()
  contextMenuTab.value = tab
  contextMenuPos.value = { x: e.clientX, y: e.clientY }
  showContextMenu.value = true
}

const closeContextMenu = () => {
  showContextMenu.value = false
  contextMenuTab.value = null
}

const handleContextCommand = (command) => {
  if (!contextMenuTab.value) return
  switch (command) {
    case 'current':
      closeTab(contextMenuTab.value.path)
      break
    case 'others':
      activeTab.value = contextMenuTab.value.path
      closeOtherTabs()
      break
    case 'all':
      closeAllTabs()
      break
  }
  closeContextMenu()
}
```

- [ ] **Step 2: Verify no syntax errors**

Run: `cd "c:/Users/hxf/Desktop/VoNR" && npx vite build --mode development 2>&1 | head -20`
Expected: Build completes without errors (or only warnings, not syntax errors)

- [ ] **Step 3: Commit**

```bash
cd "c:/Users/hxf/Desktop/VoNR" && git add src/views/Layout.vue && git commit -m "feat: add tab state management and route watcher to Layout"
```

---

### Task 2: Add tab bar template to Layout.vue

**Files:**
- Modify: `src/views/Layout.vue:1-45`

- [ ] **Step 1: Replace the template section**

Replace the entire `<template>` in Layout.vue with:

```html
<template>
  <div class="layout">
    <div class="layout-header">
      <Header />
    </div>
    <div class="layout-body">
      <div class="layout-sidebar" :class="{ collapsed: sidebarCollapsed }">
        <Sidebar :collapsed="sidebarCollapsed" />
      </div>
      <div class="layout-main">
        <div class="top-nav">
          <div class="nav-left">
            <el-icon class="nav-icon" @click="toggleSidebar">
              <Menu />
            </el-icon>
            <el-icon class="nav-icon">
              <ArrowLeft />
            </el-icon>
            <el-icon class="nav-icon" @click="goHome">
              <HomeFilled />
            </el-icon>
          </div>
          <div class="nav-tabs">
            <div
              v-for="tab in tabs"
              :key="tab.path"
              class="nav-tab"
              :class="{ active: tab.path === activeTab }"
              @click="handleTabClick(tab)"
              @contextmenu="openContextMenu($event, tab)"
            >
              <span class="tab-title">{{ tab.title }}</span>
              <el-icon class="tab-close" @click.stop="closeTab(tab.path)">
                <Close />
              </el-icon>
            </div>
          </div>
          <div class="nav-right">
            <el-dropdown trigger="click" @command="handleContextCommand">
              <div class="tab-menu">
                <el-icon><Expand /></el-icon>
                <el-icon><Close /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="current">关闭当前标签页</el-dropdown-item>
                  <el-dropdown-item command="others">关闭其他标签页</el-dropdown-item>
                  <el-dropdown-item command="all">关闭全部标签页</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <div v-if="showContextMenu" class="context-menu-overlay" @click="closeContextMenu">
          <div
            class="context-menu"
            :style="{ left: contextMenuPos.x + 'px', top: contextMenuPos.y + 'px' }"
          >
            <div class="context-menu-item" @click="handleContextCommand('current')">关闭当前标签页</div>
            <div class="context-menu-item" @click="handleContextCommand('others')">关闭其他标签页</div>
            <div class="context-menu-item" @click="handleContextCommand('all')">关闭全部标签页</div>
          </div>
        </div>

        <div class="content-area">
          <keep-alive>
            <router-view />
          </keep-alive>
        </div>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Verify template renders**

Run: `cd "c:/Users/hxf/Desktop/VoNR" && npx vite build --mode development 2>&1 | head -20`
Expected: Build completes without errors

- [ ] **Step 3: Commit**

```bash
cd "c:/Users/hxf/Desktop/VoNR" && git add src/views/Layout.vue && git commit -m "feat: add tab bar template with keep-alive router-view"
```

---

### Task 3: Update styles for tab bar and context menu

**Files:**
- Modify: `src/views/Layout.vue:102-203` (style section)

- [ ] **Step 1: Replace the style section**

Replace the entire `<style scoped>` section in Layout.vue with:

```css
<style scoped>
.layout {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.layout-header {
  flex-shrink: 0;
}

.layout-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.layout-sidebar {
  width: 240px;
  flex-shrink: 0;
  background: #ffffff;
  transition: width 0.3s ease;
}

.layout-sidebar.collapsed {
  width: 64px;
}

.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-nav {
  height: 50px;
  background: #ffffff;
  display: flex;
  align-items: center;
  padding: 0 12px;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.nav-icon {
  font-size: 18px;
  color: #666666;
  cursor: pointer;
  transition: color 0.3s;
}

.nav-icon:hover {
  color: #2196f3;
}

.nav-tabs {
  display: flex;
  align-items: center;
  flex: 1;
  overflow-x: auto;
  margin-left: 12px;
  gap: 4px;
}

.nav-tabs::-webkit-scrollbar {
  height: 0;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  font-size: 13px;
  color: #666666;
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  transition: all 0.2s;
  flex-shrink: 0;
}

.nav-tab:hover {
  color: #2196f3;
  border-color: #bbd4f1;
}

.nav-tab.active {
  color: #ffffff;
  background: #2196f3;
  border-color: #2196f3;
}

.tab-title {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab-close {
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.2s;
}

.nav-tab:hover .tab-close,
.nav-tab.active .tab-close {
  opacity: 1;
}

.tab-close:hover {
  color: #f56c6c;
}

.nav-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.tab-menu {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 4px;
  transition: background 0.3s;
}

.tab-menu:hover {
  background: #f5f7fa;
}

.tab-menu .el-icon {
  font-size: 16px;
  color: #666666;
}

.content-area {
  flex: 1;
  overflow: auto;
  padding: 20px;
  height: 87vh;
}

.context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

.context-menu {
  position: fixed;
  background: #ffffff;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  min-width: 150px;
  z-index: 1000;
}

.context-menu-item {
  padding: 8px 16px;
  font-size: 13px;
  color: #333333;
  cursor: pointer;
  transition: background 0.2s;
}

.context-menu-item:hover {
  background: #f5f7fa;
  color: #2196f3;
}
</style>
```

- [ ] **Step 2: Verify build passes**

Run: `cd "c:/Users/hxf/Desktop/VoNR" && npx vite build --mode development 2>&1 | head -20`
Expected: Build completes without errors

- [ ] **Step 3: Commit**

```bash
cd "c:/Users/hxf/Desktop/VoNR" && git add src/views/Layout.vue && git commit -m "feat: add tab bar and context menu styles"
```

---

### Task 4: Fix pageTitleMap to include missing route names

**Files:**
- Modify: `src/views/Layout.vue:59-73` (pageTitleMap)

- [ ] **Step 1: Update pageTitleMap**

The existing map is missing some route names. Update it to match all routes defined in `src/router/index.js`:

```js
const pageTitleMap = {
  'Dashboard': 'CDR数据统计',
  'SystemOverview': '素材库列表',
  'ApplicationManagement': '应用管理',
  'BusinessConfiguration': '业务配置',
  'UserSubscription': '用户订购关系',
  'SceneConfiguration': '场景定制',
  'CDRList': 'CDR管理',
  'LogList': '日志管控',
  'DataMonitor': '数据监控',
  'RealtimeCall': '呼叫监控',
  'RealtimeService': '服务监控',
  'HistoryCall': '呼叫历史',
  'HistoryService': '服务历史',
  'AnalysisTrend': '趋势分析',
  'AnalysisRanking': '排名分析'
}
```

- [ ] **Step 2: Verify build passes**

Run: `cd "c:/Users/hxf/Desktop/VoNR" && npx vite build --mode development 2>&1 | head -20`
Expected: Build completes without errors

- [ ] **Step 3: Commit**

```bash
cd "c:/Users/hxf/Desktop/VoNR" && git add src/views/Layout.vue && git commit -m "fix: complete pageTitleMap with all route names"
```

---

### Task 5: Manual verification

**Files:**
- None (manual testing)

- [ ] **Step 1: Start dev server and test**

Run: `cd "c:/Users/hxf/Desktop/VoNR" && npm run dev`

Open browser and test:
1. Click sidebar menu items — new tabs should appear
2. Click the same menu item again — should switch to existing tab, not duplicate
3. Click × on a tab — should close it and switch to adjacent tab
4. Close the active tab — should switch to nearest remaining tab
5. Close all tabs — should redirect to Dashboard
6. Right-click a tab — context menu should appear
7. Context menu: "关闭其他" should keep current + Dashboard
8. Context menu: "关闭全部" should clear all and go to Dashboard
9. Switch between tabs — page state (scroll position, form inputs) should be preserved

- [ ] **Step 2: Final commit if any fixes needed**

```bash
cd "c:/Users/hxf/Desktop/VoNR" && git add -A && git commit -m "fix: address verification issues"
```
