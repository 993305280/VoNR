# 统一分页组件设计

## 目标

将所有菜单页面的分页 UI 统一为 BusinessConfiguration 页面中的分页设计：居中布局，左侧显示"共X条"，`el-pagination` 使用 `background`、`prev, pager, next, jumper, sizes` 布局。分页保持纯装饰用途（硬编码 total，不接数据源）。

## 方案

采用最小化包装组件（方案 A）：创建一个共享组件包装 `el-pagination`，强制统一布局和样式。

## 组件设计

### UnifiedPagination.vue

- 位置：`src/components/common/UnifiedPagination.vue`
- Props：`total`（Number，默认 360）
- 布局：居中 flex，左侧"共X条"标签 + 右侧 el-pagination
- 样式：margin-top 25px，gap 15px，color #606266，font-size 13px
- el-pagination 属性：`background`，layout `"prev, pager, next, jumper, sizes"`

## 页面替换

### BusinessConfiguration.vue
- 第77-80行：删除原有 `.pagination-wrapper` div 及内联 span + el-pagination
- 替换为 `<UnifiedPagination :total="360" />`
- 删除 `.pagination-wrapper` CSS 样式

### UserList.vue
- 第107-116行：删除原有 el-pagination 及外层 div
- 替换为 `<UnifiedPagination :total="360" />`
- 删除 `.custom-pagination` 相关 CSS 样式

### Overview.vue
- 第85-91行：删除原有 `.pagination-wrapper` div 及 el-pagination
- 替换为 `<UnifiedPagination :total="360" />`
- 删除 `.pagination-wrapper` CSS 样式

### ApplicationManagement.vue
- 移除 `import CustomPagination from '@/components/application/CustomPagination.vue'`
- 模板中的 `<CustomPagination>` 替换为 `<UnifiedPagination :total="360" />`

## 清理

- 删除 `src/components/application/Pagination.vue`（未使用）
- 删除 `src/components/application/CustomPagination.vue`（被 ApplicationManagement 替换）

## 不做的事

- 不改变分页的功能行为（保持装饰性）
- 不修改数据获取逻辑
- 不添加 v-model 支持（后续按需扩展）
- 不修改 LinkAppDialog 中的分页（对话框内紧凑分页，不在范围内）
