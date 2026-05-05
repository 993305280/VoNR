# CDR数据统计 改为首页图标导航 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 CDR数据统计页面从侧边栏菜单和标签页中移除，改为通过顶部导航栏首页图标访问，图标在当前页面时高亮显示。

**Architecture:** 修改两个 Vue 组件：Sidebar.vue 移除菜单项，Layout.vue 添加首页图标高亮逻辑并排除 dashboard 从标签页系统。

**Tech Stack:** Vue 3, Element Plus, Vue Router

---

## 文件结构

| 文件 | 职责 | 操作 |
|------|------|------|
| `src/components/Sidebar.vue` | 左侧菜单 | 修改：移除 dashboard 菜单项 |
| `src/views/Layout.vue` | 顶部导航和标签页 | 修改：添加首页图标高亮，排除 dashboard 从标签页 |

---

### Task 1: 从侧边栏移除 CDR数据统计菜单项

**Files:**
- Modify: `src/components/Sidebar.vue:12-15`

- [ ] **Step 1: 删除 dashboard 菜单项**

在 `src/components/Sidebar.vue` 中，删除第 12-15 行的 `<el-menu-item index="/dashboard">` 整个块：

```html
<!-- 删除以下内容 -->
<el-menu-item index="/dashboard">
  <el-icon><DataLine /></el-icon>
  <template #title>CDR数据统计</template>
</el-menu-item>
```

删除后，`<el-menu>` 标签直接以 `<el-sub-menu v-for="menu in menuList"...>` 开始。

- [ ] **Step 2: 验证侧边栏不再显示 CDR数据统计**

运行开发服务器，登录后检查左侧菜单，确认"CDR数据统计"不再出现。

- [ ] **Step 3: 提交更改**

```bash
git add src/components/Sidebar.vue
git commit -m "feat: remove CDR数据统计 from sidebar menu"
```

---

### Task 2: 在 Layout.vue 中添加首页图标高亮逻辑

**Files:**
- Modify: `src/views/Layout.vue:77` (import)
- Modify: `src/views/Layout.vue:19-21` (template)
- Modify: `src/views/Layout.vue:105-115` (script)
- Modify: `src/views/Layout.vue:260-269` (style)

- [ ] **Step 1: 在 import 中添加 computed**

在 `src/views/Layout.vue` 第 77 行，将 `ref, watch, onMounted, onUnmounted` 改为：

```js
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
```

- [ ] **Step 2: 添加 isHome 计算属性**

在 `src/views/Layout.vue` 的 `<script setup>` 中，在 `const route = useRoute()` 之后添加：

```js
const isHome = computed(() => route.path === '/dashboard')
```

- [ ] **Step 3: 修改 HomeFilled 图标添加高亮类名**

在 `src/views/Layout.vue` 第 19-21 行，将：

```html
<el-icon class="nav-icon" @click="goHome">
  <HomeFilled />
</el-icon>
```

改为：

```html
<el-icon class="nav-icon" :class="{ active: isHome }" @click="goHome">
  <HomeFilled />
</el-icon>
```

- [ ] **Step 4: 移除初始标签页中的 dashboard**

在 `src/views/Layout.vue` 第 105-108 行，将：

```js
const tabs = ref([
  { path: '/dashboard', title: pageTitleMap['Dashboard'] }
])
const activeTab = ref('/dashboard')
```

改为：

```js
const tabs = ref([])
const activeTab = ref('/dashboard')
```

- [ ] **Step 5: 修改路由监听跳过 /dashboard**

在 `src/views/Layout.vue` 第 110-115 行，将：

```js
watch(() => route.path, (newPath) => {
  activeTab.value = newPath
  if (!tabs.value.find(t => t.path === newPath)) {
    tabs.value.push({ path: newPath, title: pageTitleMap[route.name] || '未知页面' })
  }
}, { immediate: true })
```

改为：

```js
watch(() => route.path, (newPath) => {
  activeTab.value = newPath
  if (newPath !== '/dashboard' && !tabs.value.find(t => t.path === newPath)) {
    tabs.value.push({ path: newPath, title: pageTitleMap[route.name] || '未知页面' })
  }
}, { immediate: true })
```

- [ ] **Step 6: 添加首页图标高亮样式**

在 `src/views/Layout.vue` 的 `<style scoped>` 部分，在 `.nav-icon:hover` 样式之后添加：

```css
.nav-icon.active {
  color: #2196f3;
}
```

- [ ] **Step 7: 验证功能**

运行开发服务器，登录后验证：
1. 首页图标在 `/dashboard` 页面时高亮（蓝色）
2. 点击首页图标跳转到 CDR数据统计页面
3. 标签页不显示 CDR数据统计
4. 访问其他页面时，首页图标不高亮，标签页正常显示

- [ ] **Step 8: 提交更改**

```bash
git add src/views/Layout.vue
git commit -m "feat: add home icon highlight and exclude dashboard from tabs"
```
