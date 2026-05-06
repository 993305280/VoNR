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
            <el-icon class="nav-icon" @click="router.back()">
              <ArrowLeft />
            </el-icon>
            <el-icon class="nav-icon" :class="{ active: isHome }" @click="goHome">
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

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'
import { Menu, ArrowLeft, HomeFilled, Expand, Close } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const isHome = computed(() => route.path === '/dashboard')
const sidebarCollapsed = ref(false)

const pageTitleMap = {
  'Dashboard': 'CDR数据统计',
  'SystemOverview': '素材库列表',
  'ApplicationManagement': '应用管理',
  'BusinessConfiguration': '业务配置',
  'UserSubscription': '用户订购关系',
  'SceneConfiguration': '业务场景定制',
  'BillingPackage': '计费套餐',
  'ChargesDetail': '费用明细',
  'CDRDetail': 'CDR明细',
  'CallRecords': '通话记录',
  'LogList': '日志管控',
  'DataMonitor': '数据监控',
  'RealtimeCall': '呼叫监控',
  'RealtimeService': '服务监控',
  'HistoryCall': '呼叫历史',
  'HistoryService': '服务历史',
  'AnalysisTrend': '趋势分析',
  'AnalysisRanking': '排名分析'
}

const tabs = ref([])
const activeTab = ref('/dashboard')

watch(() => route.path, (newPath) => {
  activeTab.value = newPath
  if (newPath !== '/dashboard' && !tabs.value.find(t => t.path === newPath)) {
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
  const hasDashboard = tabs.value.some(t => t.path === '/dashboard')
  tabs.value = [
    ...(hasDashboard ? [{ path: '/dashboard', title: pageTitleMap['Dashboard'] }] : []),
    ...(current && current.path !== '/dashboard' ? [current] : [])
  ]
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
  const menuWidth = 150
  const menuHeight = 120
  const x = Math.min(e.clientX, window.innerWidth - menuWidth)
  const y = Math.min(e.clientY, window.innerHeight - menuHeight)
  contextMenuPos.value = { x: Math.max(0, x), y: Math.max(0, y) }
  showContextMenu.value = true
}

const closeContextMenu = () => {
  showContextMenu.value = false
  contextMenuTab.value = null
}

const handleKeydown = (e) => {
  if (e.key === 'Escape') closeContextMenu()
}

onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleKeydown))

const handleContextCommand = (command) => {
  const targetTab = contextMenuTab.value || tabs.value.find(t => t.path === activeTab.value)
  switch (command) {
    case 'current':
      if (targetTab) closeTab(targetTab.path)
      break
    case 'others':
      if (targetTab) {
        activeTab.value = targetTab.path
        closeOtherTabs()
      }
      break
    case 'all':
      closeAllTabs()
      break
  }
  closeContextMenu()
}
</script>

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

.nav-icon.active {
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
  overflow: hidden;
  padding: 20px;
  min-height: 0;
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
