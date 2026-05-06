<template>
  <div class="sidebar" :class="{ collapsed }">
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
import { computed } from 'vue'
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
const activeMenu = computed(() => route.path)

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
      { path: '/cdr/billing', title: '计费套餐' },
      { path: '/cdr/charges', title: '费用明细' },
      { path: '/cdr/detail', title: 'CDR明细' },
      { path: '/cdr/calls', title: '通话记录' }
    ]
  },
  {
    path: '/log',
    title: '日志管控',
    icon: Files,
    children: [
      { path: '/log/list', title: '操作日志' }
    ]
  },
  {
    path: '/data',
    title: '数据监管',
    icon: TrendCharts,
    children: [],
    subMenus: [
      {
        path: '/data/statistics',
        title: '业务统计',
        children: [
          { path: '/data/statistics/call-count', title: '呼叫记录数量统计' },
          { path: '/data/statistics/service-count', title: '服务人次统计' },
          { path: '/data/statistics/user-count', title: '服务用户数统计' }
        ]
      }
    ]
  }
]

const defaultOpeneds = computed(() => {
  const path = route.path
  const openeds = []

  for (const menu of menuList) {
    if (path === menu.path || path.startsWith(menu.path + '/')) {
      openeds.push(menu.path)
    }
    if (menu.subMenus) {
      for (const sub of menu.subMenus) {
        if (path === sub.path || path.startsWith(sub.path + '/')) {
          openeds.push(sub.path)
        }
      }
    }
  }

  return openeds
})
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
