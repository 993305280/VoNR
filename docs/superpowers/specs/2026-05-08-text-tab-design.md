# 文本 Tab 设计文档

## 概述

为素材库列表页面（Overview.vue）添加文本 Tab 功能，支持文本素材的展示、新增、编辑、删除操作。

## 技术选型

- **组件拆分**: 独立组件模式（与音频/视频 tab 保持一致）
- **字数限制**: 使用 el-input maxlength + show-word-limit

## 组件架构

```
Overview.vue (tab 切换 + 共享搜索栏)
  └── TextTab.vue (文本 tab 主页面)
        ├── TextTable.vue (表格展示)
        ├── TextFormModal.vue (新增/编辑弹窗)
        └── useTextData.js (数据逻辑 composable)
```

## 数据模型

### 文本素材

```js
{
  id: String,              // 编号，如 '001'
  name: String,            // 素材名称
  content: String,         // 文本内容
  contentLength: Number,   // 文本长度(字)，自动计算
  auditTag: String,        // 操作类型：'新增' | '编辑' | '删除'
  syncStatus: String,      // 同步/审核状态
  availableStatus: String, // 可用状态：'可用' | '不可用'
  description: String,     // 素材说明
  updateTime: String,      // 操作时间
  operator: String         // 操作者
}
```

### 审核状态

`auditTag` 和 `syncStatus` 组合显示，如 `【编辑】同步中`

**syncStatus 枚举：**
- 同步中
- 同步成功
- 同步失败
- 审核中
- 审核成功
- 审核失败

**状态样式：**
- 同步成功 / 审核成功 → 绿色
- 同步失败 / 审核失败 → 红色
- 同步中 / 审核中 → 蓝色/黄色

## 组件设计

### 1. TextTable.vue

文本列表表格。

**列定义：**

| 列名 | 宽度 | 说明 |
|------|------|------|
| 复选框 | 50px | selection，同步中/审核中不可选 |
| 编号 | 70px | id |
| 素材名称 | 150px | 蓝色可点击 |
| 文本内容 | 300px | 超长截断 + tooltip |
| 文本长度(字) | 120px | 自动计算 |
| 审核状态 | 180px | 【auditTag】syncStatus |
| 可用状态 | 80px | 可用/不可用 |
| 素材说明 | 200px | show-overflow-tooltip |
| 操作时间 | 160px | 格式 YYYY-MM-DD HH:mm:ss |
| 操作 | 100px | 编辑/删除 |

**交互：**
- 编辑按钮：仅 `syncStatus === '审核失败'` 时可点击
- 删除按钮：`同步中` 或 `审核中` 时禁用

**Props:**
```js
defineProps({
  data: Array,
  loading: Boolean
})
```

**Events:**
```js
defineEmits(['selection-change', 'edit', 'delete'])
```

### 2. TextFormModal.vue

新增/编辑文本素材弹窗。

**表单字段：**
1. 素材名称（必填，el-input）
2. 文本内容（必填，el-input type="textarea"，带字数统计）
3. 素材说明（el-input type="textarea"）

**字数限制：**
- 最大字数：500（可配置）
- 实时显示当前字数/最大字数
- 超出时输入框标红，禁止提交

**Props:**
```js
defineProps({
  visible: Boolean,
  mode: String,  // 'add' | 'edit'
  data: Object   // 编辑时的回填数据
})
```

**Events:**
```js
defineEmits(['update:visible', 'save'])
```

### 3. useTextData.js

数据逻辑 composable。

**提供的响应式数据和方法：**
```js
return {
  // 数据
  tableData,           // Ref<Array> 文本列表
  loading,             // Ref<Boolean>
  total,               // Ref<Number>
  currentPage,         // Ref<Number>
  pageSize,            // Ref<Number>

  // 搜索相关
  searchForm,          // Reactive 筛选条件
  handleSearch,        // 搜索
  handleReset,         // 重置

  // 分页
  handlePageChange,
  handleSizeChange,

  // CRUD
  handleAdd,           // 新增
  handleEdit,          // 编辑
  handleDelete,        // 删除
  handleSync,          // 同步

  // 选择
  selectedRows,        // Ref<Array>
  handleSelectionChange,
  handleBatchDelete    // 批量删除
}
```

## Overview.vue 改造

### Tab 切换逻辑

在 Overview.vue 中添加文本 Tab 引用：

```vue
<!-- 文本 Tab -->
<TextTab v-if="currentTab === '文本'" ref="textTabRef" />
```

### 需要修改的部分

1. 搜索栏的操作按钮文案根据 tab 动态变化
2. 新增按钮标题：`新增${currentTab}素材`
3. 删除确认文案：`确定要删除选中的${currentTab}素材吗？`

## Mock 数据

使用 useTextData.js 生成 10 条静态 mock 数据，覆盖各种审核状态组合：

```js
// 状态组合示例
{ auditTag: '新增', syncStatus: '同步中' }
{ auditTag: '编辑', syncStatus: '审核中' }
{ auditTag: '编辑', syncStatus: '审核成功' }
{ auditTag: '编辑', syncStatus: '审核失败' }
{ auditTag: '新增', syncStatus: '同步成功' }
{ auditTag: '编辑', syncStatus: '同步失败' }
```

## 文件清单

需要创建的文件：
1. `src/components/text/TextTable.vue`
2. `src/components/text/TextFormModal.vue`
3. `src/composables/useTextData.js`

需要修改的文件：
1. `src/views/Overview.vue` - 添加 TextTab 组件引用和导入

## 注意事项

1. 编辑按钮仅在 `syncStatus === '审核失败'` 时可点击
2. 删除按钮在 `同步中` 或 `审核中` 时禁用
3. 文本内容超长时截断显示，鼠标悬停显示完整内容
4. 字数限制默认 500 字，可通过配置调整
