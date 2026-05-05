# 统一分页组件 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将所有菜单页面的分页 UI 统一为 BusinessConfiguration 页面中的分页设计，通过共享组件实现一致的布局和样式。

**Architecture:** 创建一个 `UnifiedPagination` 包装组件放在 `src/components/common/`，包含 BusinessConfiguration 分页的完整样式。各页面删除原有分页代码，替换为该共享组件。删除未使用的旧分页组件。

**Tech Stack:** Vue 3, Element Plus (el-pagination), SCSS

---

### Task 1: 创建 UnifiedPagination 共享组件

**Files:**
- Create: `src/components/common/UnifiedPagination.vue`

- [ ] **Step 1: 创建组件文件**

```vue
<template>
  <div class="pagination-wrapper">
    <span>共{{ total }}条</span>
    <el-pagination
      background
      layout="prev, pager, next, jumper, sizes"
      :total="total"
    />
  </div>
</template>

<script setup>
defineProps({
  total: { type: Number, default: 360 }
})
</script>

<style lang="scss" scoped>
.pagination-wrapper {
  margin-top: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  color: #606266;
  font-size: 13px;
}
</style>
```

- [ ] **Step 2: 验证组件可被导入**

运行: `npm run build 2>&1 | head -20`
预期: 无报错（组件未被引用时不会报错）

- [ ] **Step 3: 提交**

```bash
git add src/components/common/UnifiedPagination.vue
git commit -m "feat: add UnifiedPagination shared component"
```

---

### Task 2: 替换 BusinessConfiguration.vue 的分页

**Files:**
- Modify: `src/views/BusinessConfiguration.vue:77-80` (模板)
- Modify: `src/views/BusinessConfiguration.vue:160-206` (样式)

- [ ] **Step 1: 添加 import**

在 `<script setup>` 中添加（第93行附近）：

```javascript
import UnifiedPagination from '@/components/common/UnifiedPagination.vue'
```

- [ ] **Step 2: 替换模板中的分页**

将第77-80行：

```html
      <div class="pagination-wrapper">
        <span>共360条</span>
        <el-pagination background layout="prev, pager, next, jumper, sizes" :total="360" />
      </div>
```

替换为：

```html
      <UnifiedPagination :total="360" />
```

- [ ] **Step 3: 删除 `.pagination-wrapper` CSS 样式**

删除 `<style>` 中第198-206行的 `.pagination-wrapper` 样式块：

```scss
  .pagination-wrapper {
    margin-top: 25px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    color: #606266;
    font-size: 13px;
  }
```

- [ ] **Step 4: 验证**

运行: `npm run build 2>&1 | head -20`
预期: 无报错

- [ ] **Step 5: 提交**

```bash
git add src/views/BusinessConfiguration.vue
git commit -m "feat: use UnifiedPagination in BusinessConfiguration"
```

---

### Task 3: 替换 UserList.vue 的分页

**Files:**
- Modify: `src/views/UserList.vue:106-117` (模板)
- Modify: `src/views/UserList.vue:294-295` (script 中的 ref 变量)
- Modify: `src/views/UserList.vue:458-464` (script 中的事件处理函数)
- Modify: `src/views/UserList.vue:504-530` (样式)

- [ ] **Step 1: 添加 import**

在 `<script setup>` 中添加（第181行附近）：

```javascript
import UnifiedPagination from '@/components/common/UnifiedPagination.vue'
```

- [ ] **Step 2: 替换模板中的分页**

将第106-117行：

```html
      <!-- 分页 -->
      <div class="flex justify-center items-center mt-8 pb-8">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, prev, pager, next, jumper, sizes"
          :total="360"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          class="custom-pagination"
        />
      </div>
```

替换为：

```html
      <UnifiedPagination :total="360" />
```

- [ ] **Step 3: 删除不再使用的 ref 变量**

删除第294-295行：

```javascript
const currentPage = ref(1)
const pageSize = ref(10)
```

- [ ] **Step 4: 删除不再使用的事件处理函数**

删除第458-464行：

```javascript
const handleSizeChange = (val) => {
  pageSize.value = val
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}
```

- [ ] **Step 5: 删除 `.custom-pagination` 相关 CSS 样式**

删除第504-530行的分页样式块：

```css
/* 分页样式定制 */
.custom-pagination :deep(.el-pagination__total) {
  margin-right: 24px;
}

.custom-pagination :deep(.el-pager li) {
  background: #f4f4f5;
  margin: 0 4px;
  border-radius: 4px;
  min-width: 32px;
}

.custom-pagination :deep(.el-pager li.is-active) {
  background-color: #2196f3 !important;
  color: #fff;
}

.custom-pagination :deep(.btn-prev),
.custom-pagination :deep(.btn-next) {
  background: #f4f4f5;
  border-radius: 4px;
  margin: 0 4px;
}

.custom-pagination :deep(.el-input__inner) {
  text-align: center;
}
```

- [ ] **Step 6: 验证**

运行: `npm run build 2>&1 | head -20`
预期: 无报错

- [ ] **Step 7: 提交**

```bash
git add src/views/UserList.vue
git commit -m "feat: use UnifiedPagination in UserList"
```

---

### Task 4: 替换 Overview.vue 的分页

**Files:**
- Modify: `src/views/Overview.vue:85-92` (模板)
- Modify: `src/views/Overview.vue:162` (script 中的 ref 变量)
- Modify: `src/views/Overview.vue:296-301` (样式)

- [ ] **Step 1: 添加 import**

在 `<script setup>` 中添加（第158行附近）：

```javascript
import UnifiedPagination from '@/components/common/UnifiedPagination.vue'
```

- [ ] **Step 2: 替换模板中的分页**

将第85-92行：

```html
      <div class="pagination-wrapper">
        <el-pagination
          layout="total, prev, pager, next, jumper, sizes"
          :total="360"
          :page-sizes="[10, 20, 50]"
          v-model:current-page="currentPage"
        />
      </div>
```

替换为：

```html
      <UnifiedPagination :total="360" />
```

- [ ] **Step 3: 删除不再使用的 ref 变量**

删除第162行：

```javascript
const currentPage = ref(1)
```

- [ ] **Step 4: 删除 `.pagination-wrapper` CSS 样式**

删除第296-301行的分页样式块：

```css
/* 分页 */
.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
```

- [ ] **Step 5: 验证**

运行: `npm run build 2>&1 | head -20`
预期: 无报错

- [ ] **Step 6: 提交**

```bash
git add src/views/Overview.vue
git commit -m "feat: use UnifiedPagination in Overview"
```

---

### Task 5: 替换 ApplicationManagement.vue 的分页

**Files:**
- Modify: `src/views/ApplicationManagement.vue:31-37` (模板)
- Modify: `src/views/ApplicationManagement.vue:61` (script import)

- [ ] **Step 1: 替换 import**

将第61行：

```javascript
import CustomPagination from '@/components/application/CustomPagination.vue'
```

替换为：

```javascript
import UnifiedPagination from '@/components/common/UnifiedPagination.vue'
```

- [ ] **Step 2: 替换模板中的分页**

将第31-37行：

```html
    <CustomPagination
      :total="total"
      :current="pagination.current"
      :page-size="pagination.pageSize"
      @page-change="handlePageChange"
      @size-change="handlePageSizeChange"
    />
```

替换为：

```html
    <UnifiedPagination :total="360" />
```

- [ ] **Step 3: 验证**

运行: `npm run build 2>&1 | head -20`
预期: 无报错

- [ ] **Step 4: 提交**

```bash
git add src/views/ApplicationManagement.vue
git commit -m "feat: use UnifiedPagination in ApplicationManagement"
```

---

### Task 6: 删除旧分页组件

**Files:**
- Delete: `src/components/application/Pagination.vue`
- Delete: `src/components/application/CustomPagination.vue`

- [ ] **Step 1: 删除 Pagination.vue（未使用）**

```bash
rm src/components/application/Pagination.vue
```

- [ ] **Step 2: 删除 CustomPagination.vue（已替换）**

```bash
rm src/components/application/CustomPagination.vue
```

- [ ] **Step 3: 验证构建仍通过**

运行: `npm run build 2>&1 | head -20`
预期: 无报错（这两个文件不再被任何地方导入）

- [ ] **Step 4: 提交**

```bash
git add -A src/components/application/Pagination.vue src/components/application/CustomPagination.vue
git commit -m "chore: remove unused Pagination and CustomPagination components"
```
