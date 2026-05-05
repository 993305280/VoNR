# CDR数据统计 页面改为首页图标导航

## 背景

当前"CDR数据统计"页面同时出现在左侧菜单和顶部标签页中，与首页功能重复。需要将其改为纯粹的首页概念，通过顶部导航栏的首页图标访问。

## 需求

1. 左侧菜单移除"CDR数据统计"条目
2. 顶部导航栏首页图标（HomeFilled）点击进入 CDR数据统计页面
3. 当前在 CDR数据统计页面时，首页图标高亮显示
4. 登录后默认进入 CDR数据统计页面（已实现，无需修改）
5. 顶部标签页不显示 CDR数据统计，用首页图标高亮替代

## 实现方案

### 文件 1: `src/components/Sidebar.vue`

**改动：** 删除第 12-15 行的 `<el-menu-item index="/dashboard">` 整个块

```html
<!-- 删除以下内容 -->
<el-menu-item index="/dashboard">
  <el-icon><DataLine /></el-icon>
  <template #title>CDR数据统计</template>
</el-menu-item>
```

### 文件 2: `src/views/Layout.vue`

**改动 1：** 添加 `isHome` 计算属性

```js
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'

const isHome = computed(() => route.path === '/dashboard')
```

**改动 2：** HomeFilled 图标添加高亮类名

```html
<el-icon class="nav-icon" :class="{ active: isHome }" @click="goHome">
  <HomeFilled />
</el-icon>
```

**改动 3：** 移除初始标签页中的 dashboard

```js
const tabs = ref([])
const activeTab = ref('/dashboard')
```

**改动 4：** 路由监听中跳过 /dashboard，不加入标签页

```js
watch(() => route.path, (newPath) => {
  activeTab.value = newPath
  if (newPath !== '/dashboard' && !tabs.value.find(t => t.path === newPath)) {
    tabs.value.push({ path: newPath, title: pageTitleMap[route.name] || '未知页面' })
  }
}, { immediate: true })
```

**改动 5：** 添加首页图标高亮样式

```css
.nav-icon.active {
  color: #2196f3;
}
```

## 视觉效果

- 侧边栏：不再显示 CDR数据统计菜单项
- 顶部导航：在 `/dashboard` 页面时首页图标变蓝（`#2196f3`）
- 标签页：只显示非首页的页面标签
- 登录：仍然跳转 `/dashboard`（不变）

## 不涉及的改动

- 路由配置（`router/index.js`）：保持不变，`/dashboard` 路由和默认重定向保留
- 登录守卫：保持不变
