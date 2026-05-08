<template>
  <div class="audio-table-container">
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
      <el-table-column label="素材名称" min-width="200">
        <template #default="{ row }">
          <div class="material-name-cell">
            <el-button
              class="play-btn"
              size="small"
              circle
              @click="$emit('play', row)"
            >
              <el-icon><VideoPlay /></el-icon>
            </el-button>
            <span class="material-name" @click="$emit('play', row)">
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
import { VideoPlay } from '@element-plus/icons-vue'

defineProps({
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['selection-change', 'edit', 'delete', 'play'])

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
.audio-table-container {
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
