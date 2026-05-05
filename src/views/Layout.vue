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
            <span class="page-title">{{ currentPageTitle }}</span>
          </div>
          <div class="nav-right">
            <el-dropdown trigger="click" @command="handleTabCommand">
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
        <div class="content-area">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
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
  'BusinessList': '业务列表',
  'UserList': '用户列表',
  'CDRList': 'CDR列表',
  'LogList': '日志列表',
  'DataMonitor': '数据监控',
  'RealtimeCall': '实时呼叫',
  'RealtimeService': '实时服务',
  'HistoryCall': '历史呼叫',
  'HistoryService': '历史服务',
  'AnalysisTrend': '趋势分析',
  'AnalysisRanking': '排名分析'
}

const currentPageTitle = computed(() => {
  return pageTitleMap[route.name] || 'CDR管理平台'
})

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const goHome = () => {
  router.push('/dashboard')
}

const handleTabCommand = (command) => {
  switch (command) {
    case 'current':
      console.log('Close current tab')
      break
    case 'others':
      console.log('Close other tabs')
      break
    case 'all':
      console.log('Close all tabs')
      break
  }
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
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 12px;
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

.page-title {
  font-size: 16px;
  font-weight: 500;
  color: #333333;
}

.nav-right {
  display: flex;
  align-items: center;
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
</style>
