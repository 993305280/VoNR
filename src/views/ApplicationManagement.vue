<template>
  <div class="application-management">
    <div class="page-header">
      <h2 class="page-title">应用管理</h2>
      <div class="header-actions">
        <el-button :loading="currentSyncing" type="primary" @click="() => { handleSync(); ElMessage.success('同步成功') }">
          <el-icon><Refresh /></el-icon>
          同步应用
        </el-button>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增应用
        </el-button>
        <el-button type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete">
          <el-icon><Delete /></el-icon>
          删除应用
        </el-button>
      </div>
    </div>

    <SearchForm v-model="searchParams" @search="handleSearch" @reset="handleReset" />

    <ApplicationTable
      :data="tableData"
      :loading="loading"
      @edit="handleEdit"
      @delete="handleDelete"
      @selection-change="handleSelectionChange"
    />

    <UnifiedPagination :total="360" />

    <ApplicationModal
      v-model:visible="modalVisible"
      :is-edit="isEdit"
      :edit-data="editData"
      @save="handleSave"
    />

    <DeleteConfirmDialog
      v-model="deleteDialogVisible"
      :is-batch="deleteDialogVisible && deleteMode === 'batch'"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Plus, Delete } from '@element-plus/icons-vue'
import { useApplicationData } from '@/composables/useApplicationData'
import SearchForm from '@/components/application/SearchForm.vue'
import ApplicationTable from '@/components/application/ApplicationTable.vue'
import UnifiedPagination from '@/components/common/UnifiedPagination.vue'
import ApplicationModal from '@/components/application/ApplicationModal.vue'
import DeleteConfirmDialog from '@/components/application/DeleteConfirmDialog.vue'

const {
  tableData,
  loading,
  total,
  currentSyncing,
  searchParams,
  pagination,
  handleSearch,
  handleReset,
  handlePageChange,
  handlePageSizeChange,
  handleSync,
  handleDelete: executeDelete
} = useApplicationData()

const modalVisible = ref(false)
const isEdit = ref(false)
const editData = ref(null)
const selectedRows = ref([])
const deleteDialogVisible = ref(false)
const deleteMode = ref('single')
const pendingDeleteIds = ref([])

const handleAdd = () => {
  isEdit.value = false
  editData.value = null
  modalVisible.value = true
}

const handleEdit = (id) => {
  const item = tableData.value.find(d => d.id === id)
  if (item) {
    isEdit.value = true
    editData.value = item
    modalVisible.value = true
  }
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleDelete = (id) => {
  deleteMode.value = 'single'
  pendingDeleteIds.value = [id]
  deleteDialogVisible.value = true
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的应用')
    return
  }

  deleteMode.value = 'batch'
  pendingDeleteIds.value = selectedRows.value.map(row => row.id)
  deleteDialogVisible.value = true
}

const confirmDelete = () => {
  executeDelete(pendingDeleteIds.value)
  if (deleteMode.value === 'batch') {
    selectedRows.value = []
  }
  deleteDialogVisible.value = false
  ElMessage.success(deleteMode.value === 'batch' ? `成功删除 ${pendingDeleteIds.value.length} 个应用` : '删除成功')
}

const handleSave = (data) => {
  if (isEdit.value) {
    const index = tableData.value.findIndex(d => d.id === editData.value.id)
    if (index > -1) {
      tableData.value[index] = {
        ...tableData.value[index],
        name: data.name,
        businessScene: data.businessScene,
        subScenes: data.subScenes,
        description: data.description
      }
    }
  } else {
    const newId = String(100001 + tableData.value.length)
    tableData.value.unshift({
      id: newId,
      name: data.name,
      businessScene: data.businessScene,
      subScenes: data.subScenes,
      auditStatus: 'pending',
      auditStatusText: '待审核',
      availableStatus: 'available',
      availableStatusText: '可用',
      description: data.description
    })
    total.value = total.value + 1
  }
  modalVisible.value = false
}
</script>

<style scoped>
.application-management {
  min-height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.header-actions .el-button {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
