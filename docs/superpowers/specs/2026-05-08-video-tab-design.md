# 视频 Tab 设计文档

## 概述

为素材库列表页面（Overview.vue）添加视频 Tab 功能，支持视频素材的展示、新增、编辑、删除和送审操作。

## 技术选型

- **组件拆分**: 独立组件模式（复用 AudioTab 架构）
- **分页组件**: UnifiedPagination（通用分页组件）

## 组件架构

```
Overview.vue (tab 切换 + 共享搜索栏)
  └── VideoTab.vue (视频 tab 主页面)
        ├── VideoTable.vue (表格展示)
        ├── VideoFormModal.vue (新增/编辑弹窗)
        ├── VideoDetailModal.vue (送审内容弹窗)
        ├── UnifiedPagination (分页组件)
        └── useVideoData.js (数据逻辑 composable)
```

## 数据模型

### 视频素材

```js
{
  id: String,              // 编号，如 '001'
  name: String,            // 素材名称
  thumbnail: String,       // 缩略图地址
  duration: String,        // 时长，格式 'MM:SS'
  resolution: String,      // 分辨率，如 '1920 × 1080'
  bitrate: String,         // 码率，如 '128 kbps'
  format: String,          // 文件格式，如 'mp4'
  size: String,            // 文件大小，如 '8.88 M'
  auditTag: String,        // 操作类型：'新增' | '编辑' | '删除'
  syncStatus: String,      // 同步/审核状态
  availableStatus: String, // 可用状态：'可用' | '不可用'
  description: String,     // 素材说明
  updateTime: String,      // 操作时间
  url: String              // 视频文件地址
}
```

### 与音频素材的差异

- 新增 `thumbnail` 字段（缩略图地址）
- 新增 `resolution` 字段（分辨率）
- 保留 `bitrate`、`format`、`size` 字段
- 保留 `duration` 字段（视频时长）

### 审核状态

`auditTag` 和 `syncStatus` 组合显示，如 `【新增】同步中`

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

### 1. VideoTable.vue

视频列表表格。

**列定义：**

| 列名 | 宽度 | 说明 |
|------|------|------|
| 复选框 | 50px | selection |
| 编号 | 70px | id |
| 素材名称 | 250px | 缩略图（带时长）+ 名称 |
| 分辨率 | 120px | 如 1920 × 1080 |
| 码率 | 90px | 如 128 kbps |
| 文件格式 | 90px | mp4 |
| 文件大小 | 90px | 如 8.88 M |
| 审核状态 | 180px | 【auditTag】syncStatus |
| 可用状态 | 80px | 可用/不可用 |
| 素材说明 | 剩余 | 文本溢出省略 |
| 操作时间 | 160px | 格式 YYYY-MM-DD HH:mm:ss |
| 操作 | 100px | 编辑/删除 |

**交互：**
- 点击素材名称 → 打开送审详情弹窗
- 编辑按钮：仅 `syncStatus === '审核失败'` 时可点击
- 删除按钮：始终可点击

**Props:**
```js
defineProps({
  data: Array,
  loading: Boolean
})
```

**Events:**
```js
defineEmits(['selection-change', 'edit', 'delete', 'detail'])
```

### 2. VideoFormModal.vue

新增/编辑视频素材弹窗。

**表单字段：**
1. 素材名称（必填，el-input）
2. 上传素材（必填，el-upload + 视频预览）
3. 素材说明（el-input type="textarea"）

**上传限制：**
- 支持格式：mp4, avi, mov, mkv
- 文件大小小于 500MB

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

### 3. VideoDetailModal.vue

送审内容弹窗，显示视频详情。

**展示字段：**
- 编号、素材名称
- 视频缩略图（带时长）
- 分辨率、码率、文件格式、文件大小
- 素材说明
- 操作时间

**Props:**
```js
defineProps({
  visible: Boolean,
  data: Object
})
```

**Events:**
```js
defineEmits(['update:visible'])
```

### 4. VideoTab.vue

视频 tab 主页面，作为编排器协调子组件。

**职责：**
- 管理子组件的显示状态
- 处理模态框的打开/关闭
- 暴露 `handleBatchDelete` 方法供父组件调用

**模板结构：**
```html
<template>
  <div class="video-tab">
    <VideoTable
      :data="tableData"
      :loading="loading"
      @selection-change="handleSelectionChange"
      @edit="handleEditClick"
      @delete="handleDeleteClick"
      @detail="handleDetailClick"
    />
    <UnifiedPagination
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    />
    <VideoFormModal
      v-model:visible="formModalVisible"
      :mode="formModalMode"
      :data="currentRow"
      @save="handleFormSave"
    />
    <VideoDetailModal
      v-model:visible="detailModalVisible"
      :data="currentRow"
    />
  </div>
</template>
```

**Props:**
```js
// 无外部 props，数据由 useVideoData 管理
```

**Expose:**
```js
defineExpose({
  handleBatchDelete
})
```

### 5. useVideoData.js

数据逻辑 composable。

**提供的响应式数据和方法：**
```js
return {
  // 数据
  tableData,           // Ref<Array> 视频列表
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

```html
<!-- 共享搜索栏 -->
<div class="filter-bar">...</div>

<!-- Tab 内容区 -->
<VideoTab v-if="currentTab === '视频'" ref="videoTabRef" />
```

### 需要修改的部分

1. 引入 VideoTab 组件
2. 添加 `videoTabRef` 模板引用
3. 批量删除按钮调用 `videoTabRef.value?.handleBatchDelete()`

## Mock 数据

使用 useVideoData.js 生成 10 条静态 mock 数据，覆盖各种审核状态组合：

```js
// 状态组合示例
{ auditTag: '新增', syncStatus: '同步中' }
{ auditTag: '编辑', syncStatus: '审核中' }
{ auditTag: '编辑', syncStatus: '审核成功' }
{ auditTag: '编辑', syncStatus: '审核失败' }
{ auditTag: '删除', syncStatus: '审核中' }
{ auditTag: '新增', syncStatus: '同步成功' }
{ auditTag: '编辑', syncStatus: '同步失败' }
```

## 文件清单

需要创建的文件：
1. `src/components/video/VideoTable.vue`
2. `src/components/video/VideoFormModal.vue`
3. `src/components/video/VideoDetailModal.vue`
4. `src/components/video/VideoTab.vue`
5. `src/composables/useVideoData.js`

需要修改的文件：
1. `src/views/Overview.vue` - 添加 VideoTab 组件引用和批量删除调用

## 注意事项

1. 视频缩略图需在上传时自动生成或提供默认占位图
2. 编辑按钮仅在 `syncStatus === '审核失败'` 时可点击
3. 上传视频需限制格式和文件大小
4. 与音频 tab 保持一致的审核状态显示逻辑
