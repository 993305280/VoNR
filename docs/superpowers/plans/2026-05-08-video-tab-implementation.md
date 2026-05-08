# 视频 Tab 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为素材库列表页面添加视频 Tab，支持视频素材的展示、新增、编辑、删除和送审操作。

**Architecture:** 采用独立组件模式，将视频 Tab 拆分为 VideoTable、VideoFormModal、VideoDetailModal 三个组件，通过 useVideoData composable 管理数据逻辑。使用 UnifiedPagination 通用分页组件。不需要播放器组件。

**Tech Stack:** Vue 3 Composition API, Element Plus

---

## 文件结构

```
src/
├── components/video/
│   ├── VideoTable.vue         # 视频列表表格
│   ├── VideoFormModal.vue     # 新增/编辑弹窗
│   ├── VideoDetailModal.vue   # 送审内容弹窗
│   └── VideoTab.vue           # 视频 tab 主页面
├── composables/
│   └── useVideoData.js        # 视频数据逻辑
└── views/
    └── Overview.vue           # 修改：添加 VideoTab 引用
```

---

### Task 1: 创建 useVideoData.js Composable

**Files:**
- Create: `src/composables/useVideoData.js`

- [ ] **Step 1: 创建 composable 文件，定义数据模型和 mock 数据**

```js
import { ref, reactive } from 'vue'

// 模拟视频数据
const generateMockData = () => [
  {
    id: '001',
    name: '宽带套餐活动视频材料',
    thumbnail: '/video/thumb1.jpg',
    duration: '01:52',
    resolution: '1920 × 1080',
    bitrate: '128 kbps',
    format: 'mp4',
    size: '8.88 M',
    auditTag: '编辑',
    syncStatus: '审核失败',
    availableStatus: '可用',
    description: '这是说明这是说明',
    updateTime: '2024-03-25 10:00:00',
    url: '/video/demo1.mp4'
  },
  {
    id: '002',
    name: '青年志愿者服务日',
    thumbnail: '/video/thumb2.jpg',
    duration: '00:49',
    resolution: '1920 × 1080',
    bitrate: '128 kbps',
    format: 'mp4',
    size: '10.26 M',
    auditTag: '编辑',
    syncStatus: '同步中',
    availableStatus: '可用',
    description: '这是说明这是说明这里...',
    updateTime: '2024-03-25 10:00:00',
    url: '/video/demo2.mp4'
  },
  {
    id: '003',
    name: '宽带套餐活动视频材料',
    thumbnail: '/video/thumb3.jpg',
    duration: '01:25',
    resolution: '1080 × 1920',
    bitrate: '128 kbps',
    format: 'mp4',
    size: '8.88 M',
    auditTag: '编辑',
    syncStatus: '审核中',
    availableStatus: '可用',
    description: '这是说明这是说明',
    updateTime: '2024-03-25 10:00:00',
    url: '/video/demo3.mp4'
  },
  {
    id: '004',
    name: '青年志愿者服务日',
    thumbnail: '/video/thumb4.jpg',
    duration: '00:43',
    resolution: '720 × 720',
    bitrate: '128 kbps',
    format: 'mp4',
    size: '10.26 M',
    auditTag: '新增',
    syncStatus: '同步成功',
    availableStatus: '可用',
    description: '这是说明这是说明这里...',
    updateTime: '2024-03-25 10:00:00',
    url: '/video/demo4.mp4'
  },
  {
    id: '005',
    name: '宽带套餐活动视频材料',
    thumbnail: '/video/thumb5.jpg',
    duration: '01:52',
    resolution: '1920 × 1080',
    bitrate: '128 kbps',
    format: 'mp4',
    size: '8.88 M',
    auditTag: '删除',
    syncStatus: '审核中',
    availableStatus: '可用',
    description: '这是说明这是说明',
    updateTime: '2024-03-25 10:00:00',
    url: '/video/demo5.mp4'
  },
  {
    id: '006',
    name: '宽带套餐活动视频材料',
    thumbnail: '/video/thumb6.jpg',
    duration: '01:52',
    resolution: '1920 × 1080',
    bitrate: '128 kbps',
    format: 'mp4',
    size: '8.88 M',
    auditTag: '编辑',
    syncStatus: '审核成功',
    availableStatus: '可用',
    description: '这是说明这是说明',
    updateTime: '2024-03-25 10:00:00',
    url: '/video/demo6.mp4'
  },
  {
    id: '007',
    name: '宽带套餐活动视频材料',
    thumbnail: '/video/thumb7.jpg',
    duration: '01:52',
    resolution: '1920 × 1080',
    bitrate: '128 kbps',
    format: 'mp4',
    size: '8.88 M',
    auditTag: '新增',
    syncStatus: '同步中',
    availableStatus: '可用',
    description: '这是说明这是说明',
    updateTime: '2024-03-25 10:00:00',
    url: '/video/demo7.mp4'
  },
  {
    id: '008',
    name: '青年志愿者服务日',
    thumbnail: '/video/thumb8.jpg',
    duration: '00:49',
    resolution: '1920 × 1080',
    bitrate: '128 kbps',
    format: 'mp4',
    size: '10.26 M',
    auditTag: '编辑',
    syncStatus: '同步失败',
    availableStatus: '可用',
    description: '这是说明这是说明这里...',
    updateTime: '2024-03-25 10:00:00',
    url: '/video/demo8.mp4'
  },
  {
    id: '009',
    name: '宽带套餐活动视频材料',
    thumbnail: '/video/thumb9.jpg',
    duration: '01:25',
    resolution: '1080 × 1920',
    bitrate: '128 kbps',
    format: 'mp4',
    size: '8.88 M',
    auditTag: '编辑',
    syncStatus: '审核中',
    availableStatus: '可用',
    description: '这是说明这是说明',
    updateTime: '2024-03-25 10:00:00',
    url: '/video/demo9.mp4'
  },
  {
    id: '010',
    name: '青年志愿者服务日',
    thumbnail: '/video/thumb10.jpg',
    duration: '00:43',
    resolution: '720 × 720',
    bitrate: '128 kbps',
    format: 'mp4',
    size: '10.26 M',
    auditTag: '新增',
    syncStatus: '同步成功',
    availableStatus: '可用',
    description: '这是说明这是说明这里...',
    updateTime: '2024-03-25 10:00:00',
    url: '/video/demo10.mp4'
  }
]

export function useVideoData() {
  const tableData = ref(generateMockData())
  const loading = ref(false)
  const total = ref(360)
  const currentPage = ref(1)
  const pageSize = ref(10)

  const searchForm = reactive({
    name: '',
    auditStatus: '',
    useStatus: ''
  })

  const selectedRows = ref([])

  // 搜索
  const handleSearch = () => {
    loading.value = true
    setTimeout(() => {
      loading.value = false
    }, 500)
  }

  // 重置
  const handleReset = () => {
    searchForm.name = ''
    searchForm.auditStatus = ''
    searchForm.useStatus = ''
    handleSearch()
  }

  // 分页
  const handlePageChange = (page) => {
    currentPage.value = page
    handleSearch()
  }

  const handleSizeChange = (size) => {
    pageSize.value = size
    currentPage.value = 1
    handleSearch()
  }

  // 选择
  const handleSelectionChange = (rows) => {
    selectedRows.value = rows
  }

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedRows.value.length === 0) return
    console.log('批量删除:', selectedRows.value)
  }

  // 同步
  const handleSync = () => {
    console.log('同步素材')
  }

  return {
    tableData,
    loading,
    total,
    currentPage,
    pageSize,
    searchForm,
    selectedRows,
    handleSearch,
    handleReset,
    handlePageChange,
    handleSizeChange,
    handleSelectionChange,
    handleBatchDelete,
    handleSync
  }
}
```

- [ ] **Step 2: 验证文件创建**

Run: `ls src/composables/useVideoData.js`

Expected: 文件存在

- [ ] **Step 3: 提交**

```bash
git add src/composables/useVideoData.js
git commit -m "feat: add useVideoData composable with mock data"
```

---

### Task 2: 创建 VideoTable.vue 组件

**Files:**
- Create: `src/components/video/VideoTable.vue`

- [ ] **Step 1: 创建表格组件**

```vue
<template>
  <div class="video-table-container">
    <el-table
      ref="tableRef"
      :data="data"
      :loading="loading"
      style="width: 100%"
      height="100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50" :selectable="canSelect" />
      <el-table-column prop="id" label="编号" width="70" />
      <el-table-column label="素材名称" min-width="250">
        <template #default="{ row }">
          <div class="material-name-cell">
            <div class="thumbnail-wrapper">
              <img :src="row.thumbnail" class="thumbnail" alt="" />
              <span class="duration">{{ row.duration }}</span>
            </div>
            <span class="material-name" @click="$emit('detail', row)">
              {{ row.name }}
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="resolution" label="分辨率" width="120" />
      <el-table-column prop="bitrate" label="码率" width="90" />
      <el-table-column prop="format" label="文件格式" width="90" />
      <el-table-column prop="size" label="文件大小" width="90" />
      <el-table-column label="审核状态" width="180">
        <template #default="{ row }">
          <span :class="getStatusClass(row.syncStatus)">
            【{{ row.auditTag }}】{{ row.syncStatus }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="可用状态" width="80">
        <template #default="{ row }">
          <span :class="row.availableStatus === '可用' ? 'text-green' : 'text-red'">
            {{ row.availableStatus }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="素材说明" show-overflow-tooltip />
      <el-table-column prop="updateTime" label="操作时间" width="160" />
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button
            type="primary"
            link
            size="small"
            :disabled="row.syncStatus !== '审核失败'"
            @click="$emit('edit', row)"
          >
            编辑
          </el-button>
          <el-button
            type="danger"
            link
            size="small"
            :disabled="row.syncStatus === '同步中' || row.syncStatus === '审核中'"
            @click="$emit('delete', row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['selection-change', 'edit', 'delete', 'detail'])

const tableRef = ref(null)

const getStatusClass = (status) => {
  if (status.includes('失败')) return 'text-red'
  if (status.includes('成功')) return 'text-green'
  if (status.includes('中')) return 'text-blue'
  return 'text-gray'
}

const handleSelectionChange = (selection) => {
  emit('selection-change', selection)
}

const canSelect = (row) => {
  return row.syncStatus !== '同步中' && row.syncStatus !== '审核中'
}
</script>

<style scoped lang="scss">
.video-table-container {
  width: 100%;
  flex: 1;
  overflow: hidden;

  :deep(.el-table th) {
    background-color: #f8f9fb;
    color: #333;
  }

  :deep(.el-table__body-wrapper) {
    overflow-y: auto;
  }
}

.material-name-cell {
  display: flex;
  align-items: center;
  gap: 12px;

  .thumbnail-wrapper {
    position: relative;
    width: 80px;
    height: 45px;
    flex-shrink: 0;
    border-radius: 4px;
    overflow: hidden;
    background: #000;

    .thumbnail {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .duration {
      position: absolute;
      bottom: 2px;
      right: 2px;
      padding: 1px 4px;
      background: rgba(0, 0, 0, 0.7);
      color: #fff;
      font-size: 10px;
      border-radius: 2px;
    }
  }

  .material-name {
    color: #1d4ed8;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
}

.text-red {
  color: #f56c6c;
}

.text-green {
  color: #67c23a;
}

.text-blue {
  color: #409eff;
}

.text-gray {
  color: #909399;
}
</style>
```

- [ ] **Step 2: 验证组件语法**

Run: `npx vue-tsc --noEmit src/components/video/VideoTable.vue`

Expected: 无语法错误

- [ ] **Step 3: 提交**

```bash
git add src/components/video/VideoTable.vue
git commit -m "feat: add VideoTable component"
```

---

### Task 3: 创建 VideoFormModal.vue 组件

**Files:**
- Create: `src/components/video/VideoFormModal.vue`

- [ ] **Step 1: 创建表单弹窗组件**

```vue
<template>
  <el-dialog
    :model-value="visible"
    :title="mode === 'add' ? '新增视频素材' : '编辑视频素材'"
    width="600px"
    destroy-on-close
    @update:model-value="$emit('update:visible', $event)"
  >
    <el-form label-position="left" label-width="80px">
      <!-- 素材名称 -->
      <el-form-item label="素材名称" required>
        <el-input v-model="formData.name" placeholder="请输入" />
      </el-form-item>

      <!-- 上传素材 -->
      <el-form-item label="上传素材" required>
        <div class="upload-section">
          <!-- 上传按钮 -->
          <div class="upload-row">
            <el-upload
              ref="uploadRef"
              :auto-upload="false"
              :show-file-list="false"
              accept=".mp4,.avi,.mov,.mkv"
              :on-change="handleFileChange"
              :before-upload="beforeUpload"
            >
              <el-button type="primary" :icon="Upload">点击上传</el-button>
            </el-upload>
            <span class="upload-hint">
              请上传小于500MB的视频，支持mp4、avi、mov、mkv格式
            </span>
          </div>

          <!-- 上传进度 -->
          <el-progress
            v-if="uploadProgress > 0 && uploadProgress < 100"
            :percentage="uploadProgress"
            :stroke-width="8"
            class="upload-progress"
          />

          <!-- 已上传文件信息 -->
          <div v-if="fileInfo && formData.url" class="file-info">
            <div class="file-info-left">
              <el-icon class="file-icon"><Document /></el-icon>
              <span class="file-name">{{ fileInfo.name }}</span>
              <span class="file-size">{{ fileInfo.size }}</span>
            </div>
            <el-button
              type="danger"
              link
              size="small"
              :icon="Delete"
              @click="handleRemoveFile"
            >
              删除
            </el-button>
          </div>

          <!-- 视频预览 -->
          <div class="video-preview">
            <video
              v-if="formData.url"
              :src="formData.url"
              controls
              class="preview-video"
            />
            <div v-else class="preview-placeholder">
              视频预览区域
            </div>
          </div>
        </div>
      </el-form-item>

      <!-- 素材说明 -->
      <el-form-item label="素材说明">
        <el-input v-model="formData.description" type="textarea" rows="4" placeholder="请输入" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="$emit('update:visible', false)">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, onBeforeUnmount } from 'vue'
import { Upload, Delete, Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: { type: Boolean, default: false },
  mode: { type: String, default: 'add', validator: (v) => ['add', 'edit'].includes(v) },
  data: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:visible', 'save'])

const formData = reactive({ name: '', url: '', description: '' })
const currentBlobUrl = ref(null)
const uploadRef = ref(null)
const uploadProgress = ref(0)
const fileInfo = ref(null)

// 监听 visible 变化，填充/重置表单
watch(() => props.visible, (val) => {
  if (val) {
    // 重置状态
    uploadProgress.value = 0
    fileInfo.value = null

    if (props.mode === 'edit' && props.data?.url) {
      // 编辑模式：回显已上传文件
      Object.assign(formData, {
        name: props.data?.name || '',
        url: props.data?.url || '',
        description: props.data?.description || ''
      })
      fileInfo.value = {
        name: props.data?.name || '视频文件',
        size: props.data?.size || '未知',
        format: props.data?.format || 'mp4'
      }
    } else {
      // 新增模式：重置表单
      Object.assign(formData, {
        name: '',
        url: '',
        description: ''
      })
    }
  }
})

// 清理 blob URL
onBeforeUnmount(() => {
  if (currentBlobUrl.value) {
    URL.revokeObjectURL(currentBlobUrl.value)
  }
})

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

// 上传前校验
const beforeUpload = (file) => {
  const isVideo = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-matroska'].includes(file.type)
  if (!isVideo) {
    ElMessage.error('只能上传视频文件')
    return false
  }
  const isLt500M = file.size / 1024 / 1024 < 500
  if (!isLt500M) {
    ElMessage.error('视频文件大小不能超过 500MB')
    return false
  }
  return true
}

const handleFileChange = (file) => {
  if (!beforeUpload(file.raw)) return

  // 撤销旧的 blob URL
  if (currentBlobUrl.value) {
    URL.revokeObjectURL(currentBlobUrl.value)
  }

  // 模拟上传进度
  uploadProgress.value = 0
  const timer = setInterval(() => {
    uploadProgress.value += 10
    if (uploadProgress.value >= 100) {
      clearInterval(timer)
      // 创建新的 blob URL
      currentBlobUrl.value = URL.createObjectURL(file.raw)
      formData.url = currentBlobUrl.value
      fileInfo.value = {
        name: file.name,
        size: formatFileSize(file.size),
        format: file.name.split('.').pop()
      }
    }
  }, 50)
}

const handleRemoveFile = () => {
  if (currentBlobUrl.value) {
    URL.revokeObjectURL(currentBlobUrl.value)
    currentBlobUrl.value = null
  }
  formData.url = ''
  fileInfo.value = null
  uploadProgress.value = 0
}

const handleSave = () => {
  if (!formData.name) {
    ElMessage.warning('请输入素材名称')
    return
  }
  if (!formData.url) {
    ElMessage.warning('请上传视频素材')
    return
  }
  emit('save', { ...formData })
  emit('update:visible', false)
}
</script>

<style scoped lang="scss">
.upload-section {
  width: 100%;
}

.upload-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.upload-hint {
  font-size: 12px;
  color: #a8abb2;
}

.upload-progress {
  margin-top: 12px;
}

.file-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding: 10px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.file-info-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-icon {
  color: #909399;
  font-size: 18px;
}

.file-name {
  color: #333;
  font-size: 14px;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  color: #909399;
  font-size: 12px;
}

.video-preview {
  margin-top: 16px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
}

.preview-video {
  width: 100%;
  max-height: 300px;
  border-radius: 4px;
}

.preview-placeholder {
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}

:deep(.el-button--primary) {
  --el-button-bg-color: #1d4ed8;
}
</style>
```

- [ ] **Step 2: 验证组件语法**

Run: `npx vue-tsc --noEmit src/components/video/VideoFormModal.vue`

Expected: 无语法错误

- [ ] **Step 3: 提交**

```bash
git add src/components/video/VideoFormModal.vue
git commit -m "feat: add VideoFormModal component"
```

---

### Task 4: 创建 VideoDetailModal.vue 组件

**Files:**
- Create: `src/components/video/VideoDetailModal.vue`

- [ ] **Step 1: 创建详情弹窗组件**

```vue
<template>
  <el-dialog
    :model-value="visible"
    title="送审内容"
    width="600px"
    destroy-on-close
    @update:model-value="$emit('update:visible', $event)"
  >
    <div class="detail-content" v-if="data">
      <div class="info-row">
        <span class="label">编号</span>
        <span class="value">{{ data.id }}</span>
      </div>
      <div class="info-row">
        <span class="label">素材名称</span>
        <span class="value">{{ data.name }}</span>
      </div>

      <div class="video-section">
        <span class="label">素材</span>
        <div class="video-wrapper">
          <div class="thumbnail-container">
            <img :src="data.thumbnail" class="thumbnail" alt="" />
            <span class="duration">{{ data.duration }}</span>
          </div>
        </div>
      </div>

      <div class="info-row">
        <span class="label">分辨率</span>
        <span class="value">{{ data.resolution }}</span>
      </div>
      <div class="info-row">
        <span class="label">码率</span>
        <span class="value">{{ data.bitrate }}</span>
      </div>
      <div class="info-row">
        <span class="label">文件格式</span>
        <span class="value">{{ data.format }}</span>
      </div>
      <div class="info-row">
        <span class="label">文件大小</span>
        <span class="value">{{ data.size }}</span>
      </div>
      <div class="info-row">
        <span class="label">素材说明</span>
        <span class="value">{{ data.description || '--' }}</span>
      </div>
      <div class="info-row">
        <span class="label">操作时间</span>
        <span class="value">{{ data.updateTime }}</span>
      </div>
    </div>

    <template #footer>
      <el-button @click="$emit('update:visible', false)">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  data: { type: Object, default: () => ({}) }
})

defineEmits(['update:visible'])
</script>

<style scoped>
.detail-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-row {
  display: flex;
  font-size: 14px;
  line-height: 1.6;
}

.label {
  width: 80px;
  color: #909399;
  flex-shrink: 0;
}

.value {
  color: #333;
}

.video-section {
  display: flex;
  align-items: flex-start;
  gap: 0;
}

.video-section .label {
  width: 80px;
  color: #909399;
  flex-shrink: 0;
  padding-top: 8px;
}

.video-wrapper {
  flex: 1;
}

.thumbnail-container {
  position: relative;
  width: 200px;
  height: 112px;
  border-radius: 4px;
  overflow: hidden;
  background: #000;

  .thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .duration {
    position: absolute;
    bottom: 4px;
    right: 4px;
    padding: 2px 6px;
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    font-size: 12px;
    border-radius: 2px;
  }
}
</style>
```

- [ ] **Step 2: 验证组件语法**

Run: `npx vue-tsc --noEmit src/components/video/VideoDetailModal.vue`

Expected: 无语法错误

- [ ] **Step 3: 提交**

```bash
git add src/components/video/VideoDetailModal.vue
git commit -m "feat: add VideoDetailModal component"
```

---

### Task 5: 创建 VideoTab.vue 主组件

**Files:**
- Create: `src/components/video/VideoTab.vue`

- [ ] **Step 1: 创建主组件，整合所有子组件**

```vue
<template>
  <div class="video-tab">
    <VideoTable
      :data="tableData"
      :loading="loading"
      @selection-change="handleSelectionChange"
      @edit="handleEdit"
      @delete="handleDeleteClick"
      @detail="handleDetail"
    />

    <div class="pagination-wrapper">
      <UnifiedPagination
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>

    <VideoFormModal
      v-model:visible="formModalVisible"
      :mode="formModalMode"
      :data="currentRow"
      @save="handleSave"
    />

    <VideoDetailModal
      v-model:visible="detailModalVisible"
      :data="currentRow"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import VideoTable from './VideoTable.vue'
import VideoFormModal from './VideoFormModal.vue'
import VideoDetailModal from './VideoDetailModal.vue'
import UnifiedPagination from '@/components/common/UnifiedPagination.vue'
import { useVideoData } from '@/composables/useVideoData'

const {
  tableData,
  loading,
  total,
  currentPage,
  pageSize,
  selectedRows,
  handlePageChange,
  handleSizeChange,
  handleSelectionChange
} = useVideoData()

const formModalVisible = ref(false)
const detailModalVisible = ref(false)
const formModalMode = ref('add')
const currentRow = ref(null)

const handleEdit = (row) => {
  currentRow.value = row
  formModalMode.value = 'edit'
  formModalVisible.value = true
}

const handleDeleteClick = (row) => {
  if (row.syncStatus === '同步中' || row.syncStatus === '审核中') {
    ElMessage.warning('同步中或审核中的素材不能删除')
    return
  }

  ElMessageBox.confirm(
    '是否删除此视频素材？',
    '删除确认',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('删除成功')
    console.log('删除:', row)
  }).catch(() => {})
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的视频素材')
    return
  }

  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedRows.value.length} 个视频素材吗？`,
    '批量删除确认',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success(`成功删除 ${selectedRows.value.length} 个视频素材`)
    selectedRows.value = []
  }).catch(() => {})
}

const handleDetail = (row) => {
  currentRow.value = row
  detailModalVisible.value = true
}

const handleSave = (data) => {
  ElMessage.success('保存成功')
  console.log('保存:', data)
}

defineExpose({
  handleBatchDelete
})
</script>

<style scoped>
.video-tab {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  padding: 0 20px 20px;
  box-sizing: border-box;
}

.pagination-wrapper {
  flex-shrink: 0;
  padding-top: 16px;
}
</style>
```

- [ ] **Step 2: 验证组件语法**

Run: `npx vue-tsc --noEmit src/components/video/VideoTab.vue`

Expected: 无语法错误

- [ ] **Step 3: 提交**

```bash
git add src/components/video/VideoTab.vue
git commit -m "feat: add VideoTab main component"
```

---

### Task 6: 修改 Overview.vue 集成 VideoTab

**Files:**
- Modify: `src/views/Overview.vue`

- [ ] **Step 1: 添加 VideoTab 组件引用**

在 `<script setup>` 中添加：

```js
import VideoTab from '@/components/video/VideoTab.vue'
```

- [ ] **Step 2: 添加 videoTabRef 模板引用**

在 `<script setup>` 中添加：

```js
const videoTabRef = ref(null)
```

- [ ] **Step 3: 修改模板，添加 tab 切换逻辑**

在 AudioTab 后面添加 VideoTab：

```html
<!-- 音频 Tab -->
<AudioTab v-if="currentTab === '音频'" ref="audioTabRef" />

<!-- 视频 Tab -->
<VideoTab v-if="currentTab === '视频'" ref="videoTabRef" />
```

- [ ] **Step 4: 修改批量删除按钮调用**

将批量删除按钮的点击事件改为：

```html
<el-button type="danger" @click="handleBatchDelete">
  <el-icon><Delete /></el-icon>
  删除{{ currentTab }}素材
</el-button>
```

在 `<script setup>` 中修改 handleBatchDelete 函数：

```js
const handleBatchDelete = () => {
  if (currentTab.value === '音频') {
    audioTabRef.value?.handleBatchDelete()
  } else if (currentTab.value === '视频') {
    videoTabRef.value?.handleBatchDelete()
  } else {
    ElMessage.warning('该功能暂未实现')
  }
}
```

- [ ] **Step 5: 验证页面运行**

Run: `npm run dev`

Expected: 启动成功，切换到视频 tab 时显示视频列表

- [ ] **Step 6: 提交**

```bash
git add src/views/Overview.vue
git commit -m "feat: integrate VideoTab into Overview page"
```

---

### Task 7: 集成测试与修复

**Files:**
- Various files as needed

- [ ] **Step 1: 启动开发服务器**

Run: `npm run dev`

Expected: 服务正常启动

- [ ] **Step 2: 测试视频 Tab 功能**

测试项目：
1. 切换到视频 tab，表格正确显示
2. 缩略图和时长正确显示
3. 分辨率列正确显示
4. 点击素材名称，送审详情弹窗打开
5. 点击编辑按钮（仅审核失败状态可点），编辑弹窗打开
6. 点击删除按钮，确认对话框弹出
7. 点击新增素材，新增弹窗打开
8. 分页功能正常
9. 批量选择和删除功能正常

- [ ] **Step 3: 修复发现的问题**

根据测试结果修复任何问题

- [ ] **Step 4: 最终提交**

```bash
git add .
git commit -m "fix: video tab integration fixes"
```

---

## 完成检查清单

- [ ] useVideoData composable 正常工作
- [ ] VideoTable 表格正确显示所有列
- [ ] 缩略图和时长正确显示
- [ ] 分辨率列正确显示
- [ ] 审核状态样式正确（成功绿色、失败红色、进行中蓝色）
- [ ] 编辑按钮仅审核失败时可点击
- [ ] VideoFormModal 新增/编辑弹窗正常
- [ ] VideoDetailModal 详情弹窗正常
- [ ] 搜索栏文案随 tab 动态变化
- [ ] 分页功能正常
- [ ] 批量删除功能正常
