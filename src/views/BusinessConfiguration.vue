<template>
  <div class="business-config-container">
    <div class="header-section">
      <h3 class="page-title">业务配置</h3>
      <div class="button-group">
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增业务配置</el-button>
        <el-button type="danger" :icon="Delete" @click="handleBatchDelete">删除业务配置</el-button>
      </div>
    </div>

    <div class="search-card">
      <el-form :inline="true" :model="searchForm" label-width="70px">
        <div class="search-row">
          <el-form-item label="业务指令">
            <el-input v-model="searchForm.code" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" style="width: 150px;"  placeholder="全部状态">
              <el-option label="全部状态"  value="" />
            </el-select>
          </el-form-item>
          <el-form-item label="审核状态">
            <el-select v-model="searchForm.audit" style="width: 150px;" placeholder="全部状态">
              <el-option label="全部状态" value="" />
            </el-select>
          </el-form-item>
          <el-form-item label="可用状态">
            <el-select v-model="searchForm.available" style="width: 150px;" placeholder="全部状态">
              <el-option label="全部状态" value="" />
            </el-select>
          </el-form-item>
        </div>
        <div class="search-row">
          <el-form-item label="应用名称">
            <el-input v-model="searchForm.appName" placeholder="请输入" />
          </el-form-item>
          <div class="search-btns">
            <el-button type="primary" class="btn-query">查询</el-button>
            <el-button class="btn-reset">重置</el-button>
          </div>
        </div>
      </el-form>
    </div>

    <div class="table-container">
      <el-table :data="tableData" v-loading="loading" style="width: 100%" @selection-change="handleSelection">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="编号" width="70" />
        <el-table-column prop="code" label="业务指令" />
        <el-table-column prop="appName" label="应用名称" min-width="150" />
        <el-table-column prop="scene" label="业务场景" />
        <el-table-column prop="subScene" label="子业务场景" min-width="120" />
        <el-table-column prop="type" label="操作类型" />
        <el-table-column prop="channel" label="渠道" />
        <el-table-column label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'enabled' ? 'success' : 'danger'">
              {{ scope.row.status === 'enabled' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="审核状态">
          <template #default="scope">
            <span class="audit-link" @click="showAuditDetail(scope.row)">
              <span :class="{
                'text-green': scope.row.auditStatus === 'approved',
                'text-orange': scope.row.auditStatus === 'pending',
                'text-red': scope.row.auditStatus === 'rejected'
              }">
                {{ scope.row.auditStatus === 'approved' ? '审核成功' : scope.row.auditStatus === 'pending' ? '待审核' : '审核失败' }}
              </span>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="availableStatus" label="可用状态" />
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <UnifiedPagination :total="total" />
    </div>

    <ConfigDialog ref="configDialogRef" @save="handleSave" />
    <AuditDetailDialog ref="auditDialogRef" />
    <DeleteConfirmDialog ref="deleteDialogRef" @confirm="handleDeleteConfirm" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useBusinessConfigData } from '@/composables/useBusinessConfigData'
import ConfigDialog from '@/components/ConfigDialog.vue'
import AuditDetailDialog from '@/components/AuditDetailDialog.vue'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog.vue'
import UnifiedPagination from '@/components/common/UnifiedPagination.vue'

const {
  tableData,
  loading,
  total,
  searchParams,
  handleSearch,
  handleReset,
  handleDelete: executeDelete,
  handleCreate,
  handleUpdate
} = useBusinessConfigData()

const selectedRows = ref([])
const currentRow = ref(null)
const configDialogRef = ref()
const auditDialogRef = ref()
const deleteDialogRef = ref()

const handleSelection = (selection) => {
  selectedRows.value = selection
}

const handleAdd = () => configDialogRef.value.open('新增业务配置')
const handleEdit = (row) => configDialogRef.value.open('编辑业务配置', row)
const showAuditDetail = (row) => auditDialogRef.value.open(row)

const handleDelete = (row) => {
  currentRow.value = row
  deleteDialogRef.value.open(false)
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请至少选择一条记录进行删除')
    return
  }
  deleteDialogRef.value.open(true)
}

const handleDeleteConfirm = async (isBatch) => {
  try {
    if (isBatch) {
      const selectedIds = selectedRows.value.map(item => item.id)
      await executeDelete(selectedIds)
      selectedRows.value = []
      ElMessage.success('批量删除成功')
    } else {
      if (currentRow.value) {
        await executeDelete(currentRow.value.id)
        currentRow.value = null
        ElMessage.success('删除成功')
      }
    }
  } catch (error) {
    // Error already handled in composable
  }
  deleteDialogRef.value.close()
}

const handleSave = async (data) => {
  try {
    if (data.id) {
      await handleUpdate(data.id, data)
    } else {
      await handleCreate(data)
    }
    configDialogRef.value.close()
  } catch (error) {
    // Error already handled in composable
  }
}
</script>

<style lang="scss" scoped>
.business-config-container {
  padding: 20px;
  background-color: #fff;
  min-height: 100%;

  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    .page-title { margin: 0; font-size: 18px; }
  }

  .search-card {
    background: #fff;
    padding: 20px 20px 0;
    border-radius: 4px;
    margin-bottom: 15px;
    .search-row { display: flex; gap: 20px; }
    .search-btns { margin-left: 20px; padding-top: 4px; }
    .btn-query { background-color: #4079de; width: 70px; }
    .btn-reset { color: #4079de; border-color: #dcdfe6; width: 70px; }
  }

  .table-container {
    background: #fff;
    padding: 20px;
    border-radius: 4px;
    
    .audit-link {
      cursor: pointer;
      color: #333;
      .text-green { color: #67c23a; }
      .text-orange { color: #e6a23c; }
      .text-red { color: #f56c6c; }
    }
  }
}
</style>