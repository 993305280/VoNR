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
