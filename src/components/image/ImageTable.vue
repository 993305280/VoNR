<template>
  <div class="image-table-container">
    <el-table
      ref="tableRef"
      :data="data"
      v-loading="loading"
      style="width: 100%"
      height="100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="编号" width="80" />
      <el-table-column label="素材名称" min-width="200">
        <template #default="{ row }">
          <div class="material-info" @click="$emit('preview', row)">
            <el-image :src="row.filePath" class="thumbnail-img" fit="cover" />
            <span class="material-name">{{ row.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="resolution" label="分辨率" width="120" />
      <el-table-column prop="format" label="文件格式" width="100" />
      <el-table-column label="文件大小" width="100">
        <template #default="{ row }">
          {{ row.fileSizeFormatted }}
        </template>
      </el-table-column>
      <el-table-column label="审核状态" width="150">
        <template #default="{ row }">
          <span :class="['status-tag', getAuditClass(row.auditStatus)]">
            【{{ row.auditType }}】{{ row.auditStatus }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="可用状态" width="100">
        <template #default="{ row }">
          <span :class="row.available ? 'text-gray' : 'text-red'">
            {{ row.available ? '可用' : '不可用' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="素材说明" show-overflow-tooltip />
      <el-table-column label="操作时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column prop="operator" label="操作者" width="150" />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="$emit('edit', row)">编辑</el-button>
          <el-button link type="danger" @click="$emit('delete', row)">删除</el-button>
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

const emit = defineEmits(['selection-change', 'edit', 'delete', 'preview'])

const tableRef = ref(null)

const handleSelectionChange = (selection) => {
  emit('selection-change', selection)
}

const getAuditClass = (status) => {
  if (status && status.includes('失败')) return 'text-red'
  if (status && status.includes('成功')) return 'text-green'
  return 'text-gray'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}
</script>

<style scoped lang="scss">
.image-table-container {
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

.material-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.thumbnail-img {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  flex-shrink: 0;
}

.material-name {
  color: #1d4ed8;

  &:hover {
    text-decoration: underline;
  }
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

.text-gray {
  color: #909399;
}
</style>
