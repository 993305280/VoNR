# content-area 撑满剩余空间 + 子页面滚动修复

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 content-area 正确占满剩余空间，子页面内容超出时独立滚动

**Architecture:** 修复子页面中使用 `100vh`/`83vh`/`min-h-screen` 的 CSS，改为 `100%` 或移除；在 `.content-area` 加 `min-height: 0` 确保 flex 高度链完整

**Tech Stack:** Vue 3, CSS

---

### Task 1: 修复 content-area 的 min-height: 0

**Files:**
- Modify: `src/views/Layout.vue:360-364`

- [ ] **Step 1: 修改 content-area 样式**

在 `src/views/Layout.vue` 中，找到 `.content-area` 样式（第 360 行），添加 `min-height: 0`：

```css
.content-area {
  flex: 1;
  overflow: auto;
  padding: 20px;
  min-height: 0;
}
```

- [ ] **Step 2: 验证修改**

确认文件内容正确：`min-height: 0;` 已添加在 `padding: 20px;` 之后

- [ ] **Step 3: Commit**

```bash
git add src/views/Layout.vue
git commit -m "fix: add min-height: 0 to content-area for correct flex sizing"
```

---

### Task 2: 修复 BusinessConfiguration.vue 的 min-height

**Files:**
- Modify: `src/views/BusinessConfiguration.vue:164`

- [ ] **Step 1: 修改样式**

在 `src/views/BusinessConfiguration.vue` 中，将第 164 行的 `min-height: 100vh` 改为 `min-height: 100%`：

```css
  min-height: 100%;
```

- [ ] **Step 2: 验证修改**

确认 `min-height: 100vh` 已改为 `min-height: 100%`

- [ ] **Step 3: Commit**

```bash
git add src/views/BusinessConfiguration.vue
git commit -m "fix: change BusinessConfiguration min-height from 100vh to 100%"
```

---

### Task 3: 修复 SceneConfiguration.vue 的 min-height

**Files:**
- Modify: `src/views/SceneConfiguration.vue:107`

- [ ] **Step 1: 修改样式**

在 `src/views/SceneConfiguration.vue` 中，将第 107 行的 `min-height: 100vh` 改为 `min-height: 100%`：

```css
  min-height: 100%;
```

- [ ] **Step 2: 验证修改**

确认 `min-height: 100vh` 已改为 `min-height: 100%`

- [ ] **Step 3: Commit**

```bash
git add src/views/SceneConfiguration.vue
git commit -m "fix: change SceneConfiguration min-height from 100vh to 100%"
```

---

### Task 4: 修复 UserList.vue 的 min-h-screen

**Files:**
- Modify: `src/views/UserList.vue:2`

- [ ] **Step 1: 修改模板类名**

在 `src/views/UserList.vue` 中，将第 2 行的 `min-h-screen` 类移除：

```html
  <div class="user-subscription p-6 bg-white">
```

- [ ] **Step 2: 验证修改**

确认 `min-h-screen` 已从类名中移除

- [ ] **Step 3: Commit**

```bash
git add src/views/UserList.vue
git commit -m "fix: remove min-h-screen from UserList container"
```

---

### Task 5: 修复 Dashboard.vue 的 min-height

**Files:**
- Modify: `src/views/Dashboard.vue:131`

- [ ] **Step 1: 修改样式**

在 `src/views/Dashboard.vue` 中，将第 131 行的 `min-height: 83vh` 改为 `min-height: 100%`：

```css
  min-height: 100%;
```

- [ ] **Step 2: 验证修改**

确认 `min-height: 83vh` 已改为 `min-height: 100%`

- [ ] **Step 3: Commit**

```bash
git add src/views/Dashboard.vue
git commit -m "fix: change Dashboard min-height from 83vh to 100%"
```

---

### Task 6: 最终验证

- [ ] **Step 1: 启动开发服务器**

```bash
cd "c:\Users\hxf\Desktop\VoNR" && npm run dev
```

- [ ] **Step 2: 浏览器验证**

在浏览器中检查以下页面：
1. Dashboard 页面 - 应撑满 content-area，内容超出时可滚动
2. 用户订购关系页面 - 同上
3. 业务配置页面 - 同上
4. 场景配置页面 - 同上
5. 切换侧边栏展开/折叠 - content-area 应自适应宽度变化

- [ ] **Step 3: 确认无问题后，无需额外 commit（所有修改已在前面的 task 中提交）**
