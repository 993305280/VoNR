<template>
  <div class="application-table">
    <el-dialog
      v-model="dialogVisible"
      title="送审内容"
      :width="600"
      :close-on-click-modal="false"
      :show-close="true"
      class="audit-detail-dialog"
    >
      <div class="audit-detail-content">
        <div class="detail-item">
          <span class="label">应用ID：</span>
          <span class="value">{{ selectedRow?.id }}</span>
        </div>
        <div class="detail-item">
          <span class="label">应用名称：</span>
          <span class="value">{{ selectedRow?.name }}</span>
        </div>
        <div class="detail-item">
          <span class="label">业务场景：</span>
          <span class="value">{{ selectedRow?.businessScene }}</span>
        </div>
        <div class="detail-item">
          <span class="label">子业务场景：</span>
          <span class="value">{{ selectedRow?.subScenes?.join('、') || '-' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">应用说明：</span>
          <span class="value">{{ selectedRow?.description || '-' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">操作时间：</span>
          <span class="value">{{ selectedRow?.operationTime || '-' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">操作者：</span>
          <span class="value">{{ selectedRow?.operator || '-' }}</span>
        </div>
      </div>
    </el-dialog>

    <el-table
      :data="data"
      v-loading="loading"
      stripe
      height="540"
      style="width: 100%"
      :header-cell-style="{ background: '#FAFAFA', color: '#262626', fontWeight: 600 }"
      @selection-change="handleSelectionChange"
      row-key="id"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="应用ID" width="120" />
      <el-table-column prop="name" label="应用名称" min-width="150" />
      <el-table-column prop="businessScene" label="业务场景" min-width="120" />
      <el-table-column label="子业务场景" min-width="150">
        <template #default="{ row }">
          <SubSceneTooltip :scenes="row.subScenes" />
        </template>
      </el-table-column>
      <el-table-column label="审核状态" min-width="150">
        <template #default="{ row }">
          <span
            class="audit-status-text"
            :style="{ color: getStatusColor(row.auditStatus) }"
            @click="handleAuditStatusClick(row)"
          >
            {{ row.auditStatusText }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="可用状态" min-width="100">
        <template #default="{ row }">
          <span :style="{ color: getAvailableColor(row.availableStatus) }">
            {{ row.availableStatusText }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="应用说明" min-width="200">
        <template #default="{ row }">
          <CustomTooltip :content="row.description" placement="top">
            <span class="description-text">{{ truncateText(row.description, 30) }}</span>
          </CustomTooltip>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="emit('edit', row.id)">编辑</el-button>
          <el-button type="danger" link @click="emit('delete', row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SubSceneTooltip from './SubSceneTooltip.vue'
import CustomTooltip from './CustomTooltip.vue'

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

const emit = defineEmits(['edit', 'delete', 'selection-change'])

// 弹窗控制
const dialogVisible = ref(false)
const selectedRow = ref(null)

// 处理审核状态点击
const handleAuditStatusClick = (row) => {
  selectedRow.value = row
  dialogVisible.value = true
}

const getStatusColor = (status) => {
  const colorMap = {
    'sync_success': '#52C41A',
    'pending': '#FAAD14',
    'approved': '#52C41A',
    'rejected': '#F5222D'
  }
  return colorMap[status] || '#262626'
}

const getAvailableColor = (status) => {
  return status === 'available' ? '#52C41A' : '#F5222D'
}

const truncateText = (text, maxLength) => {
  if (!text) return '-'
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const handleSelectionChange = (selection) => {
  emit('selection-change', selection)
}
</script>

<style scoped>
.application-table {
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e8e8e8;
}

.description-text {
  color: #262626;
  cursor: pointer;
}

.application-table :deep(.el-table__body tr:hover > td) {
  background-color: #f5f7fa !important;
}

/* 审核状态文本样式 */
.audit-status-text {
  cursor: pointer;
  user-select: none;
}

.audit-status-text:hover {
  opacity: 0.8;
}

/* 审核详情弹窗样式 */
:deep(.audit-detail-dialog) {
  .el-dialog {
    border-radius: 8px;
    overflow: hidden;
  }

  .el-dialog__header {
    background: #ffffff;
    padding: 20px 20px 10px;
    margin: 0;
    border-bottom: 1px solid #f0f0f0;

    .el-dialog__title {
      font-size: 16px;
      font-weight: 600;
      color: #333333;
    }

    .el-dialog__headerbtn {
      top: 20px;
      right: 20px;

      .el-dialog__close {
        color: #999999;
        font-size: 16px;

        &:hover {
          color: #666666;
        }
      }
    }
  }

  .el-dialog__body {
    padding: 0;
    background: #ffffff;
  }

  .audit-detail-content {
    padding: 0;

    .detail-item {
      display: flex;
      align-items: flex-start;
      padding: 16px 20px;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .label {
        color: #666666;
        font-size: 14px;
        min-width: 100px;
        line-height: 1.5;
      }

      .value {
        color: #333333;
        font-size: 14px;
        line-height: 1.5;
        flex: 1;
        word-break: break-all;

        /* ID和时间使用等宽字体 */
        &:is(.id, .operation-time) {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }
      }
    }
  }
}

/* 背景遮罩样式 */
:deep(.el-overlay-dialog) {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
