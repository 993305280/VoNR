<template>
  <div class="audio-tab">
    <AudioTable
      :data="tableData"
      :loading="loading"
      @selection-change="handleSelectionChange"
      @edit="handleEdit"
      @delete="handleDeleteClick"
      @play="handlePlay"
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

    <!-- 播放弹框 -->
    <el-dialog
      v-model="playModalVisible"
      title="音频播放"
      width="600px"
      destroy-on-close
      @closed="handlePlayModalClosed"
    >
      <div class="play-modal-content">
        <div class="play-modal-info">
          <div class="info-row">
            <span class="label">素材名称</span>
            <span class="value">{{ playRow?.name }}</span>
          </div>
          <div class="info-row">
            <span class="label">时长</span>
            <span class="value">{{ playRow?.duration }}</span>
          </div>
          <div class="info-row">
            <span class="label">码率</span>
            <span class="value">{{ playRow?.bitrate }}</span>
          </div>
          <div class="info-row">
            <span class="label">文件格式</span>
            <span class="value">{{ playRow?.format }}</span>
          </div>
        </div>
        <div class="play-modal-player">
          <AudioWavePlayer
            ref="playPlayerRef"
            :src="playRow?.url"
            :height="80"
            :show-controls="true"
            :show-speed="true"
          />
        </div>
      </div>
      <template #footer>
        <el-button @click="playModalVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import AudioTable from './AudioTable.vue'
import AudioFormModal from './AudioFormModal.vue'
import AudioDetailModal from './AudioDetailModal.vue'
import AudioWavePlayer from './AudioWavePlayer.vue'
import UnifiedPagination from '@/components/common/UnifiedPagination.vue'
import { useAudioData } from '@/composables/useAudioData'

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
} = useAudioData()

const formModalVisible = ref(false)
const detailModalVisible = ref(false)
const formModalMode = ref('add')
const currentRow = ref(null)

// 播放弹框
const playModalVisible = ref(false)
const playRow = ref(null)
const playPlayerRef = ref(null)

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

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的音频素材')
    return
  }

  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedRows.value.length} 个音频素材吗？`,
    '批量删除确认',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success(`成功删除 ${selectedRows.value.length} 个音频素材`)
    selectedRows.value = []
  }).catch(() => {})
}

const handlePlay = (row) => {
  playRow.value = row
  playModalVisible.value = true
}

const handlePlayModalClosed = () => {
  playPlayerRef.value?.pause()
  playRow.value = null
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
.audio-tab {
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

.play-modal-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.play-modal-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.info-row {
  display: flex;
  align-items: center;

  .label {
    width: 70px;
    color: #909399;
    font-size: 14px;
    flex-shrink: 0;
  }

  .value {
    color: #333;
    font-size: 14px;
  }
}

.play-modal-player {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}
</style>
