<template>
  <div class="text-tab">
    <TextTable
      :data="tableData"
      :loading="loading"
      @selection-change="handleSelectionChange"
      @edit="handleEdit"
      @delete="handleDeleteClick"
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

    <TextFormModal
      v-model:visible="formModalVisible"
      :mode="formModalMode"
      :data="currentRow"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import TextTable from './TextTable.vue'
import TextFormModal from './TextFormModal.vue'
import UnifiedPagination from '@/components/common/UnifiedPagination.vue'
import { useTextData } from '@/composables/useTextData'

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
} = useTextData()

const formModalVisible = ref(false)
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
    '是否删除此文本素材？',
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
    ElMessage.warning('请先选择要删除的文本素材')
    return
  }

  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedRows.value.length} 个文本素材吗？`,
    '批量删除确认',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success(`成功删除 ${selectedRows.value.length} 个文本素材`)
    selectedRows.value = []
  }).catch(() => {})
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
.text-tab {
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
