<template>
  <div class="image-tab">
    <ImageTable
      :data="tableData"
      :loading="loading"
      @selection-change="handleSelectionChange"
      @edit="handleEdit"
      @delete="handleDeleteClick"
      @preview="handlePreview"
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

    <ImageFormModal
      v-model:visible="formModalVisible"
      :mode="formModalMode"
      :data="currentRow"
      @success="fetchTableData"
    />

    <ImageDetailModal
      v-model:visible="detailModalVisible"
      :data="currentRow"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import ImageTable from './ImageTable.vue'
import ImageFormModal from './ImageFormModal.vue'
import ImageDetailModal from './ImageDetailModal.vue'
import UnifiedPagination from '@/components/common/UnifiedPagination.vue'
import { useImageData } from '@/composables/useImageData'
import { deleteImage } from '@/api/image'

const {
  tableData,
  loading,
  total,
  currentPage,
  pageSize,
  selectedRows,
  fetchTableData,
  handlePageChange,
  handleSizeChange,
  handleSelectionChange,
  handleBatchDelete
} = useImageData()

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
    '是否删除此图片素材？',
    '删除确认',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteImage(row.id)
      ElMessage.success('删除成功')
      fetchTableData()
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

const handlePreview = (row) => {
  currentRow.value = row
  detailModalVisible.value = true
}

const openAdd = () => {
  currentRow.value = null
  formModalMode.value = 'add'
  formModalVisible.value = true
}

defineExpose({
  handleBatchDelete,
  openAdd
})
</script>

<style scoped>
.image-tab {
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
