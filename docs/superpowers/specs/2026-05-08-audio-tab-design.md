# 音频 Tab 设计文档

## 概述

为素材库列表页面（Overview.vue）添加音频 Tab 功能，支持音频素材的展示、播放、新增、编辑、删除和送审操作。

## 技术选型

- **波形播放器**: wavesurfer.js
- **组件拆分**: 独立组件模式（参考 ApplicationManagement）

## 组件架构

```
Overview.vue (tab 切换 + 共享搜索栏)
  └── AudioTab.vue (音频 tab 主页面)
        ├── AudioTable.vue (表格展示)
        ├── AudioFormModal.vue (新增/编辑弹窗)
        ├── AudioDetailModal.vue (送审内容弹窗)
        ├── AudioWavePlayer.vue (波形播放器组件)
        └── useAudioData.js (数据逻辑 composable)
```

## 数据模型

### 音频素材

```js
{
  id: String,              // 编号，如 '001'
  name: String,            // 素材名称
  duration: String,        // 时长，格式 'MM:SS'
  bitrate: String,         // 码率，如 '128 kbps'
  format: String,          // 文件格式，如 'mp3'
  size: String,            // 文件大小，如 '1.02 M'
  auditTag: String,        // 操作类型：'新增' | '编辑' | '删除'
  syncStatus: String,      // 同步/审核状态
  availableStatus: String, // 可用状态：'可用' | '不可用'
  description: String,     // 素材说明
  updateTime: String,      // 操作时间
  operator: String,        // 操作者
  url: String              // 音频文件地址
}
```

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

### 1. AudioWavePlayer.vue

波形音频播放器，使用 wavesurfer.js 渲染波形。

**Props:**
```js
defineProps({
  src: String,                    // 音频地址
  height: { type: Number, default: 80 },
  showControls: { type: Boolean, default: true },
  showSpeed: { type: Boolean, default: true }
})
```

**Events:**
```js
defineEmits(['play', 'pause', 'ended'])
```

**控制栏布局：**
```
[倍速] [上一曲] [播放/暂停] [下一曲] [音量]
```

**倍速设置：**
- 点击倍速按钮弹出 Popover
- 选项：0.5x | 0.75x | 1x | 1.25x | 1.5x | 2x
- 默认 1x

**方法（通过 defineExpose 暴露）：**
- `play()` / `pause()` / `togglePlay()`
- `setPlaybackRate(rate)`

### 2. AudioTable.vue

音频列表表格。

**列定义：**

| 列名 | 宽度 | 说明 |
|------|------|------|
| 复选框 | 50px | selection |
| 编号 | 70px | id |
| 素材名称 | 200px | 播放图标 + 名称 |
| 时长 | 80px | MM:SS 格式 |
| 码率 | 90px | 如 128 kbps |
| 文件格式 | 80px | mp3/wav |
| 文件大小 | 80px | 如 1.02 M |
| 审核状态 | 180px | 【auditTag】syncStatus |
| 可用状态 | 80px | 可用/不可用 |
| 素材说明 | 剩余 | 文本溢出省略 |
| 操作时间 | 160px | 格式 YYYY-MM-DD HH:mm:ss |
| 操作者 | 120px | 用户名 |
| 操作 | 100px | 编辑/删除 |

**交互：**
- 点击播放图标 → 行内展开波形播放器
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
defineEmits(['selection-change', 'edit', 'delete', 'detail', 'play'])
```

### 3. AudioFormModal.vue

新增/编辑音频素材弹窗。

**表单字段：**
1. 素材名称（必填，el-input）
2. 上传素材（必填，el-upload + AudioWavePlayer 预览）
3. 素材说明（el-input type="textarea"）

**上传限制：**
- 支持格式：mp3, wav, aac, m4a
- 时长小于 30 分钟

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

### 4. AudioDetailModal.vue

送审内容弹窗，显示音频详情。

**展示字段：**
- 编号、素材名称
- 音频波形播放器
- 时长、码率、文件格式、文件大小
- 素材说明
- 操作时间、操作者

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

### 5. useAudioData.js

数据逻辑 composable。

**提供的响应式数据和方法：**
```js
return {
  // 数据
  tableData,           // Ref<Array> 音频列表
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
<AudioTab v-if="currentTab === '音频'" />
<!-- 其他 tab 保持原样或后续添加 -->
```

### 需要修改的部分

1. 搜索栏的操作按钮文案根据 tab 动态变化
2. 新增按钮标题：`新增${currentTab}素材`
3. 删除确认文案：`确定要删除选中的${currentTab}素材吗？`

## Mock 数据

使用 useAudioData.js 生成 10 条静态 mock 数据，覆盖各种审核状态组合：

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
1. `src/components/audio/AudioWavePlayer.vue`
2. `src/components/audio/AudioTable.vue`
3. `src/components/audio/AudioFormModal.vue`
4. `src/components/audio/AudioDetailModal.vue`
5. `src/composables/useAudioData.js`

需要修改的文件：
1. `src/views/Overview.vue` - 添加 tab 切换逻辑和 AudioTab 组件引用

## 依赖

```bash
npm install wavesurfer.js
```

## 注意事项

1. wavesurfer.js 需要在组件 unmount 时调用 `destroy()` 释放资源
2. 同时只能有一个音频在播放，切换时需停止之前的播放
3. 编辑按钮仅在 `syncStatus === '审核失败'` 时可点击
4. 上传音频需限制格式和时长
