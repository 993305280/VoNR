<template>
  <div
    class="sidebar"
    :class="{ collapsed, collapsing: isCollapsing, expanding: isExpanding }"
    @transitionstart="onTransitionStart"
    @transitionend="onTransitionEnd"
  >
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
      <template v-for="menu in menuList" :key="menu.id">
        <!-- 有子菜单的情况 -->
        <el-sub-menu v-if="menu.children && menu.children.length > 0" :index="menu.path || menu.id.toString()">
          <template #title>
            <el-icon><component :is="menu.icon" /></el-icon>
            <span>{{ menu.name }}</span>
          </template>

          <template v-for="item in menu.children" :key="item.id">
            <!-- 二级菜单项（无子菜单） -->
            <el-menu-item v-if="!item.children || item.children.length === 0" :index="item.path">
              {{ item.name }}
            </el-menu-item>

            <!-- 有三级子菜单 -->
            <el-sub-menu v-else :index="item.path || item.id.toString()">
              <template #title>{{ item.name }}</template>
              <el-menu-item
                v-for="subItem in item.children"
                :key="subItem.id"
                :index="subItem.path"
              >
                {{ subItem.name }}
              </el-menu-item>
            </el-sub-menu>
          </template>
        </el-sub-menu>

        <!-- 无子菜单的顶级菜单 -->
        <el-menu-item v-else :index="menu.path">
          <el-icon><component :is="menu.icon" /></el-icon>
          <span>{{ menu.name }}</span>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useMenuStore } from '@/stores/menu'
import {
  DataLine,
  Management,
  User as UserIcon,
  Document,
  Files,
  TrendCharts
} from '@element-plus/icons-vue'

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
})

const isCollapsing = ref(false)
const isExpanding = ref(false)

const onTransitionStart = (e) => {
  if (e.propertyName === 'width') {
    if (props.collapsed) {
      isCollapsing.value = true
    } else {
      isExpanding.value = true
    }
  }
}

const onTransitionEnd = (e) => {
  if (e.propertyName === 'width') {
    isCollapsing.value = false
    isExpanding.value = false
  }
}

const route = useRoute()
const menuStore = useMenuStore()
const activeMenu = computed(() => route.path)

// 图标映射
const iconMap = {
  DataLine,
  Management,
  UserIcon,
  Document,
  Files,
  TrendCharts
}

// 将 store 中的菜单数据转换为组件可用的格式
const menuList = computed(() => {
  return menuStore.menus.map(menu => ({
    ...menu,
    icon: iconMap[menu.icon] || DataLine
  }))
})

// 计算默认展开的菜单
const defaultOpeneds = computed(() => {
  const path = route.path
  const openeds = []

  const findOpeneds = (menus) => {
    for (const menu of menus) {
      if (menu.path && (path === menu.path || path.startsWith(menu.path + '/'))) {
        openeds.push(menu.path || menu.id.toString())
      }
      if (menu.children && menu.children.length > 0) {
        findOpeneds(menu.children)
      }
    }
  }

  findOpeneds(menuStore.menus)
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

.sidebar :deep(.el-sub-menu__title) {
  height: 50px;
  line-height: 50px;
  font-weight: 500;
  font-size: 16px;
}

.sidebar :deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
  font-weight: 500;
  font-size: 15px;
}

.sidebar :deep(.el-sub-menu .el-sub-menu .el-sub-menu__title) {
  font-size: 14px;
}

.sidebar :deep(.el-sub-menu .el-sub-menu .el-menu-item) {
  font-size: 14px;
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

/* 子菜单激活时，父级菜单高亮 */
.sidebar :deep(.el-menu-item.is-active) {
  background-color: #ecf5ff !important;
  color: #2196f3 !important;
}

.sidebar :deep(.el-sub-menu.is-opened > .el-sub-menu__title) {
  color: #2196f3 !important;
}

.sidebar :deep(.el-sub-menu.is-opened > .el-sub-menu__title .el-icon) {
  color: #2196f3 !important;
}

/* 鼠标悬停背景色与选中一致 */
.sidebar :deep(.el-menu-item:hover),
.sidebar :deep(.el-sub-menu__title:hover) {
  background-color: #ecf5ff !important;
}

/* 隐藏默认箭头图标 */
.sidebar :deep(.el-sub-menu__title .el-sub-menu__icon-arrow) {
  display: none !important;
}

/* 使用三角形替代箭头 */
.sidebar :deep(.el-sub-menu__title) {
  position: relative;
  padding-right: 30px !important;
}

.sidebar :deep(.el-sub-menu__title::after) {
  content: '';
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid #999;
  transition: transform 0.3s ease;
}

.sidebar :deep(.el-sub-menu.is-opened > .el-sub-menu__title::after) {
  transform: translateY(-50%) rotate(180deg);
  border-top-color: #2196f3;
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

.sidebar.collapsing :deep(.el-sub-menu__title::after),
.sidebar.expanding :deep(.el-sub-menu__title::after) {
  display: none;
}

.sidebar.collapsed:not(.collapsing):not(.expanding) :deep(.el-sub-menu__title::after) {
  display: none;
}
</style>
