<template>
  <div class="audio-table-container">
    <el-table
      ref="tableRef"
      :data="data"
      :loading="loading"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column type="expand">
        <template #default="{ row }">
          <div v-if="playingId === row.id" class="inline-player">
            <AudioWavePlayer
              ref="playerRef"
              :src="currentPlayingUrl"
              :height="60"
              :show-controls="true"
              @ended="handlePlayEnded"
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="id" label="编号" width="70" />
      <el-table-column label="素材名称" min-width="200">
        <template #default="{ row }">
          <div class="material-name-cell">
            <el-button
              class="play-btn"
              size="small"
              circle
              @click="handlePlay(row)"
            >
              <el-icon v-if="playingId === row.id"><VideoPause /></el-icon>
              <el-icon v-else><VideoPlay /></el-icon>
            </el-button>
            <span class="material-name" @click="$emit('detail', row)">
              {{ row.name }}
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="duration" label="时长" width="80" />
      <el-table-column prop="bitrate" label="码率" width="90" />
      <el-table-column prop="format" label="文件格式" width="80" />
      <el-table-column prop="size" label="文件大小" width="80" />
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
      <el-table-column prop="operator" label="操作者" width="120" />
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
import { VideoPlay, VideoPause } from '@element-plus/icons-vue'
import AudioWavePlayer from './AudioWavePlayer.vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['selection-change', 'edit', 'delete', 'detail', 'play'])

const tableRef = ref(null)
const playingId = ref(null)
const currentPlayingUrl = ref('')
const playerRef = ref(null)

const getStatusClass = (status) => {
  if (status.includes('失败')) return 'text-red'
  if (status.includes('成功')) return 'text-green'
  if (status.includes('中')) return 'text-blue'
  return 'text-gray'
}

const handleSelectionChange = (selection) => {
  emit('selection-change', selection)
}

const handlePlay = (row) => {
  if (playingId.value === row.id) {
    playerRef.value?.togglePlay()
  } else {
    // Collapse previous row if any
    if (playingId.value && tableRef.value) {
      const prevRow = props.data.find(r => r.id === playingId.value)
      if (prevRow) tableRef.value.toggleRowExpansion(prevRow, false)
    }

    // Set new playing row
    playerRef.value = null  // Clear old reference
    playingId.value = row.id
    currentPlayingUrl.value = row.url

    // Expand the row
    tableRef.value?.toggleRowExpansion(row, true)

    emit('play', row)
  }
}

const handlePlayEnded = () => {
  // Collapse the expanded row
  if (playingId.value && tableRef.value) {
    const row = props.data.find(r => r.id === playingId.value)
    if (row) tableRef.value.toggleRowExpansion(row, false)
  }
  playingId.value = null
  currentPlayingUrl.value = ''
}
</script>

<style scoped lang="scss">
.audio-table-container {
  width: 100%;

  :deep(.el-table th) {
    background-color: #f8f9fb;
    color: #333;
  }
}

.material-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .play-btn {
    flex-shrink: 0;
  }

  .material-name {
    color: #1d4ed8;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
}

.inline-player {
  padding: 12px 20px;
  background: #f5f7fa;
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
