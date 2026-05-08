<template>
  <div class="text-table-container">
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
      <el-table-column prop="name" label="素材名称" min-width="150">
        <template #default="{ row }">
          <span class="material-name">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="content" label="文本内容" min-width="300" show-overflow-tooltip />
      <el-table-column prop="contentLength" label="文本长度(字)" width="120" />
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
      <el-table-column prop="description" label="素材说明" min-width="200" show-overflow-tooltip />
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

const emit = defineEmits(['selection-change', 'edit', 'delete'])

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
.text-table-container {
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

.material-name {
  color: #1d4ed8;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
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
