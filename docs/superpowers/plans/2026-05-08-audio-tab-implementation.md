# 音频 Tab 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为素材库列表页面添加音频 Tab，支持音频素材的展示、播放、新增、编辑、删除和送审操作。

**Architecture:** 采用独立组件模式，将音频 Tab 拆分为 AudioWavePlayer、AudioTable、AudioFormModal、AudioDetailModal 四个组件，通过 useAudioData composable 管理数据逻辑。使用 wavesurfer.js 实现波形音频播放器。

**Tech Stack:** Vue 3 Composition API, Element Plus, wavesurfer.js

---

## 文件结构

```
src/
├── components/audio/
│   ├── AudioWavePlayer.vue    # 波形播放器组件
│   ├── AudioTable.vue         # 音频列表表格
│   ├── AudioFormModal.vue     # 新增/编辑弹窗
│   └── AudioDetailModal.vue   # 送审内容弹窗
├── composables/
│   └── useAudioData.js        # 音频数据逻辑
└── views/
    └── Overview.vue           # 修改：添加 AudioTab 引用
```

---

### Task 1: 安装 wavesurfer.js 依赖

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 安装 wavesurfer.js**

Run: `npm install wavesurfer.js`

Expected: 依赖安装成功，package.json 中出现 wavesurfer.js

- [ ] **Step 2: 验证安装**

Run: `npm list wavesurfer.js`

Expected: 显示 wavesurfer.js 版本号

- [ ] **Step 3: 提交**

```bash
git add package.json package-lock.json
git commit -m "chore: add wavesurfer.js dependency"
```

---

### Task 2: 创建 useAudioData.js Composable

**Files:**
- Create: `src/composables/useAudioData.js`

- [ ] **Step 1: 创建 composable 文件，定义数据模型和 mock 数据**

```js
import { ref, reactive } from 'vue'

// 模拟音频数据
const generateMockData = () => [
  {
    id: '001',
    name: '音频文件名称音频文件名称',
    duration: '00:56',
    bitrate: '128 kbps',
    format: 'mp3',
    size: '1.02 M',
    auditTag: '新增',
    syncStatus: '同步中',
    availableStatus: '可用',
    description: '这是说明这是说明',
    updateTime: '2024-03-25 10:00:00',
    operator: 'admin@VoNR',
    url: '/audio/demo1.mp3'
  },
  {
    id: '002',
    name: '音频文件名称音频文件名称',
    duration: '01:20',
    bitrate: '96 kbps',
    format: 'mp3',
    size: '980 KB',
    auditTag: '编辑',
    syncStatus: '审核中',
    availableStatus: '可用',
    description: '这是说明这是说明这里...',
    updateTime: '2024-03-25 10:00:00',
    operator: 'admin@VoNR',
    url: '/audio/demo2.mp3'
  },
  {
    id: '003',
    name: '音频文件名称音频文件名称',
    duration: '00:56',
    bitrate: '160 kbps',
    format: 'mp3',
    size: '1.02 M',
    auditTag: '删除',
    syncStatus: '审核中',
    availableStatus: '可用',
    description: '这是说明这是说明',
    updateTime: '2024-03-25 10:00:00',
    operator: 'admin@VoNR',
    url: '/audio/demo3.mp3'
  },
  {
    id: '004',
    name: '音频文件名称音频文件名称',
    duration: '01:20',
    bitrate: '128 kbps',
    format: 'mp3',
    size: '980 KB',
    auditTag: '编辑',
    syncStatus: '审核成功',
    availableStatus: '可用',
    description: '这是说明这是说明这里...',
    updateTime: '2024-03-25 10:00:00',
    operator: 'admin@VoNR',
    url: '/audio/demo4.mp3'
  },
  {
    id: '005',
    name: '音频文件名称音频文件名称',
    duration: '00:56',
    bitrate: '96 kbps',
    format: 'mp3',
    size: '980 KB',
    auditTag: '编辑',
    syncStatus: '审核失败',
    availableStatus: '可用',
    description: '这是说明这是说明这里...',
    updateTime: '2024-03-25 10:00:00',
    operator: 'admin@VoNR',
    url: '/audio/demo5.mp3'
  },
  {
    id: '006',
    name: '音频文件名称音频文件名称',
    duration: '01:20',
    bitrate: '160 kbps',
    format: 'mp3',
    size: '980 KB',
    auditTag: '编辑',
    syncStatus: '审核成功',
    availableStatus: '可用',
    description: '这是说明这是说明这里...',
    updateTime: '2024-03-25 10:00:00',
    operator: 'admin@VoNR',
    url: '/audio/demo6.mp3'
  },
  {
    id: '007',
    name: '音频文件名称音频文件名称',
    duration: '00:56',
    bitrate: '128 kbps',
    format: 'mp3',
    size: '980 KB',
    auditTag: '编辑',
    syncStatus: '同步中',
    availableStatus: '可用',
    description: '这是说明这是说明这里...',
    updateTime: '2024-03-25 10:00:00',
    operator: 'admin@VoNR',
    url: '/audio/demo7.mp3'
  },
  {
    id: '008',
    name: '音频文件名称音频文件名称',
    duration: '01:20',
    bitrate: '96 kbps',
    format: 'mp3',
    size: '980 KB',
    auditTag: '编辑',
    syncStatus: '同步失败',
    availableStatus: '可用',
    description: '这是说明这是说明这里...',
    updateTime: '2024-03-25 10:00:00',
    operator: 'admin@VoNR',
    url: '/audio/demo8.mp3'
  },
  {
    id: '009',
    name: '音频文件名称音频文件名称',
    duration: '00:56',
    bitrate: '160 kbps',
    format: 'mp3',
    size: '980 KB',
    auditTag: '新增',
    syncStatus: '同步成功',
    availableStatus: '可用',
    description: '这是说明这是说明这里...',
    updateTime: '2024-03-25 10:00:00',
    operator: 'admin@VoNR',
    url: '/audio/demo9.mp3'
  },
  {
    id: '010',
    name: '音频文件名称音频文件名称',
    duration: '01:20',
    bitrate: '160 kbps',
    format: 'mp3',
    size: '980 KB',
    auditTag: '新增',
    syncStatus: '同步成功',
    availableStatus: '可用',
    description: '这是说明这是说明这里...',
    updateTime: '2024-03-25 10:00:00',
    operator: 'admin@VoNR',
    url: '/audio/demo10.mp3'
  }
]

export function useAudioData() {
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

Run: `ls src/composables/useAudioData.js`

Expected: 文件存在

- [ ] **Step 3: 提交**

```bash
git add src/composables/useAudioData.js
git commit -m "feat: add useAudioData composable with mock data"
```

---

### Task 3: 创建 AudioWavePlayer.vue 组件

**Files:**
- Create: `src/components/audio/AudioWavePlayer.vue`

- [ ] **Step 1: 创建组件基础结构**

```vue
<template>
  <div class="audio-wave-player">
    <div ref="waveformRef" class="waveform-container"></div>
    <div v-if="showControls" class="controls-bar">
      <el-popover
        v-if="showSpeed"
        placement="top"
        :width="180"
        trigger="click"
      >
        <template #reference>
          <el-button size="small" class="speed-btn">
            {{ playbackRate }}x
          </el-button>
        </template>
        <div class="speed-options">
          <div
            v-for="speed in speedOptions"
            :key="speed"
            :class="['speed-item', { active: playbackRate === speed }]"
            @click="setPlaybackRate(speed)"
          >
            {{ speed }}x
          </div>
        </div>
      </el-popover>

      <el-button :icon="VideoPlay" circle @click="togglePlay" />

      <div class="time-display">
        {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { VideoPlay, VideoPause } from '@element-plus/icons-vue'
import WaveSurfer from 'wavesurfer.js'

const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  height: {
    type: Number,
    default: 80
  },
  showControls: {
    type: Boolean,
    default: true
  },
  showSpeed: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['play', 'pause', 'ended'])

const waveformRef = ref(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const playbackRate = ref(1)
const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2]

let wavesurfer = null

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const togglePlay = () => {
  if (!wavesurfer) return
  wavesurfer.playPause()
}

const setPlaybackRate = (rate) => {
  playbackRate.value = rate
  if (wavesurfer) {
    wavesurfer.setPlaybackRate(rate)
  }
}

const play = () => {
  if (wavesurfer) wavesurfer.play()
}

const pause = () => {
  if (wavesurfer) wavesurfer.pause()
}

defineExpose({ play, pause, togglePlay, setPlaybackRate })

onMounted(() => {
  if (!waveformRef.value || !props.src) return

  wavesurfer = WaveSurfer.create({
    container: waveformRef.value,
    waveColor: '#d1d5db',
    progressColor: '#1d4ed8',
    cursorColor: '#1d4ed8',
    height: props.height,
    barWidth: 2,
    barGap: 1
  })

  wavesurfer.load(props.src)

  wavesurfer.on('ready', () => {
    duration.value = wavesurfer.getDuration()
  })

  wavesurfer.on('audioprocess', () => {
    currentTime.value = wavesurfer.getCurrentTime()
  })

  wavesurfer.on('play', () => {
    isPlaying.value = true
    emit('play')
  })

  wavesurfer.on('pause', () => {
    isPlaying.value = false
    emit('pause')
  })

  wavesurfer.on('finish', () => {
    isPlaying.value = false
    emit('ended')
  })
})

onBeforeUnmount(() => {
  if (wavesurfer) {
    wavesurfer.destroy()
    wavesurfer = null
  }
})

watch(() => props.src, (newSrc) => {
  if (wavesurfer && newSrc) {
    wavesurfer.load(newSrc)
  }
})
</script>

<style scoped>
.audio-wave-player {
  width: 100%;
}

.waveform-container {
  width: 100%;
  margin-bottom: 8px;
}

.controls-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.speed-btn {
  min-width: 50px;
}

.speed-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.speed-item {
  padding: 6px 8px;
  text-align: center;
  cursor: pointer;
  border-radius: 4px;
  font-size: 13px;
}

.speed-item:hover {
  background-color: #f5f7fa;
}

.speed-item.active {
  background-color: #1d4ed8;
  color: white;
}

.time-display {
  font-size: 13px;
  color: #606266;
}
</style>
```

- [ ] **Step 2: 验证组件语法**

Run: `npx vue-tsc --noEmit src/components/audio/AudioWavePlayer.vue`

Expected: 无语法错误

- [ ] **Step 3: 提交**

```bash
git add src/components/audio/AudioWavePlayer.vue
git commit -m "feat: add AudioWavePlayer component with wavesurfer.js"
```

---

### Task 4: 创建 AudioTable.vue 组件

**Files:**
- Create: `src/components/audio/AudioTable.vue`

- [ ] **Step 1: 创建表格组件**

```vue
<template>
  <div class="audio-table-container">
    <el-table
      :data="data"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="id" label="编号" width="70" />
      <el-table-column label="素材名称" min-width="200">
        <template #default="scope">
          <div class="material-name-cell">
            <el-button
              :icon="playingId === scope.row.id ? VideoPause : VideoPlay"
              circle
              size="small"
              @click="handlePlay(scope.row)"
            />
            <span class="material-name" @click="$emit('detail', scope.row)">
              {{ scope.row.name }}
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="duration" label="时长" width="80" />
      <el-table-column prop="bitrate" label="码率" width="90" />
      <el-table-column prop="format" label="文件格式" width="80" />
      <el-table-column prop="size" label="文件大小" width="80" />
      <el-table-column label="审核状态" width="180">
        <template #default="scope">
          <span :class="['status-tag', getStatusClass(scope.row.syncStatus)]">
            【{{ scope.row.auditTag }}】{{ scope.row.syncStatus }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="可用状态" width="80">
        <template #default="scope">
          <span :class="scope.row.availableStatus === '可用' ? 'text-green' : 'text-red'">
            {{ scope.row.availableStatus }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="素材说明" show-overflow-tooltip />
      <el-table-column prop="updateTime" label="操作时间" width="160" />
      <el-table-column prop="operator" label="操作者" width="120" />
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="scope">
          <el-button
            link
            type="primary"
            :disabled="scope.row.syncStatus !== '审核失败'"
            @click="$emit('edit', scope.row)"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="$emit('delete', scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 行内播放器展开 -->
    <div v-if="playingId" class="inline-player">
      <AudioWavePlayer
        ref="playerRef"
        :src="currentPlayingUrl"
        :height="60"
        :show-controls="true"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { VideoPlay, VideoPause } from '@element-plus/icons-vue'
import AudioWavePlayer from './AudioWavePlayer.vue'

defineProps({
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['selection-change', 'edit', 'delete', 'detail', 'play'])

const playingId = ref(null)
const currentPlayingUrl = ref('')
const playerRef = ref(null)

const getStatusClass = (status) => {
  if (status.includes('失败')) return 'text-red'
  if (status.includes('成功')) return 'text-green'
  if (status.includes('中')) return 'text-blue'
  return 'text-gray'
}

const handleSelectionChange = (rows) => {
  emit('selection-change', rows)
}

const handlePlay = (row) => {
  if (playingId.value === row.id) {
    // 切换播放/暂停
    playerRef.value?.togglePlay()
  } else {
    // 播放新的音频
    playingId.value = row.id
    currentPlayingUrl.value = row.url
    emit('play', row)
  }
}
</script>

<style scoped>
.audio-table-container {
  width: 100%;
}

.material-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.material-name {
  color: #1d4ed8;
  cursor: pointer;
}

.material-name:hover {
  text-decoration: underline;
}

.inline-player {
  padding: 16px 20px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-top: 12px;
}

.status-tag {
  font-size: 13px;
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

:deep(.el-table th) {
  background-color: #f8f9fb;
  color: #333;
}
</style>
```

- [ ] **Step 2: 验证组件语法**

Run: `npx vue-tsc --noEmit src/components/audio/AudioTable.vue`

Expected: 无语法错误

- [ ] **Step 3: 提交**

```bash
git add src/components/audio/AudioTable.vue
git commit -m "feat: add AudioTable component"
```

---

### Task 5: 创建 AudioFormModal.vue 组件

**Files:**
- Create: `src/components/audio/AudioFormModal.vue`

- [ ] **Step 1: 创建表单弹窗组件**

```vue
<template>
  <el-dialog
    :model-value="visible"
    :title="mode === 'add' ? '新增音频素材' : '编辑音频素材'"
    width="600px"
    destroy-on-close
    @update:model-value="$emit('update:visible', $event)"
  >
    <el-form label-position="left" label-width="80px">
      <el-form-item label="素材名称" required>
        <el-input v-model="formData.name" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="上传素材" required>
        <div class="upload-section">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :show-file-list="false"
            accept=".mp3,.wav,.aac,.m4a"
            :on-change="handleFileChange"
          >
            <el-button type="primary" :icon="Upload">
              点击上传
            </el-button>
          </el-upload>
          <span class="upload-hint">
            请上传时长小于30分钟的音频，支持主流的音频格式
          </span>

          <div class="audio-preview">
            <AudioWavePlayer
              v-if="formData.url"
              ref="playerRef"
              :src="formData.url"
              :height="80"
              :show-controls="true"
            />
            <div v-else class="preview-placeholder">
              音频预览区域
            </div>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="素材说明">
        <el-input
          v-model="formData.description"
          type="textarea"
          rows="4"
          placeholder="请输入"
        />
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
import { ref, reactive, watch } from 'vue'
import { Upload } from '@element-plus/icons-vue'
import AudioWavePlayer from './AudioWavePlayer.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    default: 'add',
    validator: (v) => ['add', 'edit'].includes(v)
  },
  data: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible', 'save'])

const formData = reactive({
  name: '',
  url: '',
  description: ''
})

const uploadRef = ref(null)
const playerRef = ref(null)

watch(() => props.visible, (val) => {
  if (val && props.data) {
    formData.name = props.data.name || ''
    formData.url = props.data.url || ''
    formData.description = props.data.description || ''
  } else if (val) {
    formData.name = ''
    formData.url = ''
    formData.description = ''
  }
})

const handleFileChange = (file) => {
  // 创建本地预览 URL
  formData.url = URL.createObjectURL(file.raw)
}

const handleSave = () => {
  if (!formData.name) {
    ElMessage.warning('请输入素材名称')
    return
  }
  if (!formData.url) {
    ElMessage.warning('请上传音频素材')
    return
  }
  emit('save', { ...formData })
  emit('update:visible', false)
}
</script>

<style scoped>
.upload-section {
  width: 100%;
}

.upload-hint {
  font-size: 12px;
  color: #a8abb2;
  margin-left: 12px;
}

.audio-preview {
  margin-top: 16px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
}

.preview-placeholder {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
  font-size: 14px;
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

Run: `npx vue-tsc --noEmit src/components/audio/AudioFormModal.vue`

Expected: 无语法错误

- [ ] **Step 3: 提交**

```bash
git add src/components/audio/AudioFormModal.vue
git commit -m "feat: add AudioFormModal component"
```

---

### Task 6: 创建 AudioDetailModal.vue 组件

**Files:**
- Create: `src/components/audio/AudioDetailModal.vue`

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

      <div class="audio-section">
        <span class="label">素材</span>
        <AudioWavePlayer
          v-if="data.url"
          :src="data.url"
          :height="80"
          :show-controls="true"
        />
      </div>

      <div class="info-row">
        <span class="label">时长</span>
        <span class="value">{{ data.duration }}</span>
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
      <div class="info-row">
        <span class="label">操作者</span>
        <span class="value">{{ data.operator }}</span>
      </div>
    </div>

    <template #footer>
      <el-button @click="$emit('update:visible', false)">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import AudioWavePlayer from './AudioWavePlayer.vue'

defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: () => ({})
  }
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

.audio-section {
  display: flex;
  align-items: flex-start;
  gap: 0;
}

.audio-section .label {
  width: 80px;
  color: #909399;
  flex-shrink: 0;
  padding-top: 8px;
}

.audio-section :deep(.audio-wave-player) {
  flex: 1;
}
</style>
```

- [ ] **Step 2: 验证组件语法**

Run: `npx vue-tsc --noEmit src/components/audio/AudioDetailModal.vue`

Expected: 无语法错误

- [ ] **Step 3: 提交**

```bash
git add src/components/audio/AudioDetailModal.vue
git commit -m "feat: add AudioDetailModal component"
```

---

### Task 7: 创建 AudioTab.vue 主组件

**Files:**
- Create: `src/components/audio/AudioTab.vue`

- [ ] **Step 1: 创建主组件，整合所有子组件**

```vue
<template>
  <div class="audio-tab">
    <AudioTable
      :data="tableData"
      :loading="loading"
      @selection-change="handleSelectionChange"
      @edit="handleEdit"
      @delete="handleDeleteClick"
      @detail="handleDetail"
    />

    <UnifiedPagination
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    />

    <AudioFormModal
      v-model:visible="formModalVisible"
      :mode="formModalMode"
      :data="currentRow"
      @save="handleSave"
    />

    <AudioDetailModal
      v-model:visible="detailModalVisible"
      :data="currentRow"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import AudioTable from './AudioTable.vue'
import AudioFormModal from './AudioFormModal.vue'
import AudioDetailModal from './AudioDetailModal.vue'
import UnifiedPagination from '@/components/common/UnifiedPagination.vue'
import { useAudioData } from '@/composables/useAudioData'

const {
  tableData,
  loading,
  total,
  currentPage,
  pageSize,
  handlePageChange,
  handleSizeChange,
  handleSelectionChange
} = useAudioData()

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
  ElMessageBox.confirm(
    '是否删除此音频素材？',
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

const handleDetail = (row) => {
  currentRow.value = row
  detailModalVisible.value = true
}

const handleSave = (data) => {
  ElMessage.success('保存成功')
  console.log('保存:', data)
}
</script>

<style scoped>
.audio-tab {
  width: 100%;
}
</style>
```

- [ ] **Step 2: 验证组件语法**

Run: `npx vue-tsc --noEmit src/components/audio/AudioTab.vue`

Expected: 无语法错误

- [ ] **Step 3: 提交**

```bash
git add src/components/audio/AudioTab.vue
git commit -m "feat: add AudioTab main component"
```

---

### Task 8: 修改 Overview.vue 集成 AudioTab

**Files:**
- Modify: `src/views/Overview.vue`

- [ ] **Step 1: 添加 AudioTab 组件引用**

在 `<script setup>` 中添加：

```js
import AudioTab from '@/components/audio/AudioTab.vue'
```

- [ ] **Step 2: 修改模板，添加 tab 切换逻辑**

在表格容器 div 后面添加 AudioTab：

```html
<!-- 原有的图片表格 -->
<div v-if="currentTab === '图片'" class="table-container">
  <el-table ...>
    ...
  </el-table>
  <UnifiedPagination :total="360" />
</div>

<!-- 音频 Tab -->
<AudioTab v-if="currentTab === '音频'" />
```

- [ ] **Step 3: 修复图片表格的 v-if 条件**

将原来的 `<div class="table-container">` 改为 `<div v-if="currentTab === '图片'" class="table-container">`

- [ ] **Step 4: 验证页面运行**

Run: `npm run dev`

Expected: 启动成功，切换到音频 tab 时显示音频列表

- [ ] **Step 5: 提交**

```bash
git add src/views/Overview.vue
git commit -m "feat: integrate AudioTab into Overview page"
```

---

### Task 9: 完善 Overview.vue 搜索栏动态文案

**Files:**
- Modify: `src/views/Overview.vue`

- [ ] **Step 1: 修改新增按钮文案**

将：
```html
<el-button type="primary" icon="Plus" @click="openModal('add')">新增素材</el-button>
```

改为：
```html
<el-button type="primary" icon="Plus" @click="openModal('add')">新增{{ currentTab }}素材</el-button>
```

- [ ] **Step 2: 修改删除确认文案**

将删除确认对话框中的文案改为动态：
```html
<p class="delete-text">是否删除此{{ currentTab }}素材？</p>
<p class="delete-warning">删除后，关联此{{ currentTab }}素材的业务场景将无法使用此{{ currentTab }}素材，请谨慎操作！</p>
```

- [ ] **Step 3: 验证功能**

Run: `npm run dev`

Expected: 切换 tab 时按钮文案动态变化

- [ ] **Step 4: 提交**

```bash
git add src/views/Overview.vue
git commit -m "feat: add dynamic tab text to filter bar"
```

---

### Task 10: 集成测试与修复

**Files:**
- Various files as needed

- [ ] **Step 1: 启动开发服务器**

Run: `npm run dev`

Expected: 服务正常启动

- [ ] **Step 2: 测试音频 Tab 功能**

测试项目：
1. 切换到音频 tab，表格正确显示
2. 点击播放图标，行内播放器展开
3. 点击素材名称，送审详情弹窗打开
4. 点击编辑按钮（仅审核失败状态可点），编辑弹窗打开
5. 点击删除按钮，确认对话框弹出
6. 点击新增素材，新增弹窗打开
7. 分页功能正常

- [ ] **Step 3: 修复发现的问题**

根据测试结果修复任何问题

- [ ] **Step 4: 最终提交**

```bash
git add .
git commit -m "fix: audio tab integration fixes"
```

---

## 完成检查清单

- [ ] wavesurfer.js 安装成功
- [ ] AudioWavePlayer 组件正常渲染波形
- [ ] AudioTable 表格正确显示所有列
- [ ] 审核状态样式正确（成功绿色、失败红色、进行中蓝色）
- [ ] 编辑按钮仅审核失败时可点击
- [ ] AudioFormModal 新增/编辑弹窗正常
- [ ] AudioDetailModal 详情弹窗正常
- [ ] 搜索栏文案随 tab 动态变化
- [ ] 分页功能正常
- [ ] 组件切换时 wavesurfer 正确销毁
