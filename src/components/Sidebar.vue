<template>
  <div class="sidebar" :class="{ collapsed }">
    <el-menu
      :default-active="activeMenu"
      :unique-opened="true"
      :collapse="collapsed"
      router
      background-color="#ffffff"
      text-color="#333333"
      active-text-color="#2196f3"
    >
      <el-sub-menu v-for="menu in menuList" :key="menu.path" :index="menu.path">
        <template #title>
          <el-icon><component :is="menu.icon" /></el-icon>
          <span>{{ menu.title }}</span>
        </template>

        <el-menu-item v-for="item in menu.children" :key="item.path" :index="item.path">
          {{ item.title }}
        </el-menu-item>

        <el-sub-menu
          v-for="submenu in menu.subMenus"
          :key="submenu.path"
          :index="submenu.path"
        >
          <template #title>{{ submenu.title }}</template>
          <el-menu-item
            v-for="subItem in submenu.children"
            :key="subItem.path"
            :index="subItem.path"
          >
            {{ subItem.title }}
          </el-menu-item>
        </el-sub-menu>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  DataLine,
  Management,
  User as UserIcon,
  Document,
  Files,
  TrendCharts
} from '@element-plus/icons-vue'

defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
})

const route = useRoute()
const activeMenu = ref(route.path)

const menuList = [
  {
    path: '/system',
    title: '素材管理',
    icon: DataLine,
    children: [
      { path: '/system/overview', title: '素材库列表' }
    ]
  },
  {
    path: '/business',
    title: '业务管理',
    icon: Management,
    children: [
      { path: '/business/application', title: '应用管理' },
      { path: '/business/config', title: '业务配置' }
    ]
  },
  {
    path: '/user',
    title: '用户管理',
    icon: UserIcon,
    children: [
      { path: '/user/list', title: '用户订购关系' },
      { path: '/user/scene', title: '业务场景定制' }
    ]
  },
  {
    path: '/cdr',
    title: 'CDR管理',
    icon: Document,
    children: [
      { path: '/cdr/list', title: 'CDR管理' }
    ]
  },
  {
    path: '/log',
    title: '日志管控',
    icon: Files,
    children: [
      { path: '/log/list', title: '日志管控' }
    ]
  },
  {
    path: '/data',
    title: '数据监管',
    icon: TrendCharts,
    children: [],
    subMenus: [
      {
        path: '/data/realtime',
        title: '实时监控',
        children: [
          { path: '/data/realtime/call', title: '呼叫监控' },
          { path: '/data/realtime/service', title: '服务监控' }
        ]
      },
      {
        path: '/data/history',
        title: '历史数据',
        children: [
          { path: '/data/history/call', title: '呼叫历史' },
          { path: '/data/history/service', title: '服务历史' }
        ]
      },
      {
        path: '/data/analysis',
        title: '数据分析',
        children: [
          { path: '/data/analysis/trend', title: '趋势分析' },
          { path: '/data/analysis/ranking', title: '排名分析' }
        ]
      }
    ]
  }
]
</script>

<style scoped>
.sidebar {
  height: 100%;
  overflow-y: auto;
  border-right: 1px solid #e4e7ed;
  transition: width 0.3s ease;
}

.sidebar :deep(.el-menu) {
  border-right: none;
}

.sidebar :deep(.el-menu-item),
.sidebar :deep(.el-sub-menu__title) {
  height: 50px;
  line-height: 50px;
}

.sidebar :deep(.el-sub-menu .el-menu-item) {
  padding-left: 60px !important;
  min-width: 200px;
}

.sidebar :deep(.el-sub-menu .el-sub-menu .el-menu-item) {
  padding-left: 80px !important;
  min-width: 180px;
}

.sidebar :deep(.el-sub-menu .el-sub-menu .el-sub-menu__title) {
  padding-left: 60px !important;
  min-width: 180px;
}

/* 折叠状态样式 */
.sidebar.collapsed {
  width: 64px;
}

.sidebar.collapsed :deep(.el-menu) {
  width: 64px;
}

.sidebar.collapsed :deep(.el-sub-menu__title span),
.sidebar.collapsed :deep(.el-menu-item span) {
  display: none;
}
</style>
