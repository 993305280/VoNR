<template>
  <div class="user-subscription-container">
    <div class="header-section">
      <h3 class="page-title">用户订购关系</h3>
      <div class="button-group">
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增订购</el-button>
        <el-button type="danger" :icon="Delete" @click="handleBatchDelete">删除订购</el-button>
      </div>
    </div>

    <div class="search-card">
      <el-form :model="searchForm" label-width="80px">
        <div class="search-row">
          <el-form-item label="用户号码" class="search-item">
            <el-input v-model="searchForm.phone" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="订购时间" class="search-item search-item-wide">
            <el-date-picker
              v-model="searchForm.timeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
          <div class="search-item">
            <div class="search-btns">
              <el-button type="primary" class="btn-query" @click="handleSearchWithForm">查询</el-button>
              <el-button class="btn-reset" @click="handleResetWithForm">重置</el-button>
            </div>
          </div>
          <div class="search-item search-item-empty"></div>
        </div>
      </el-form>
    </div>

    <div class="table-container">
      <el-table :data="tableData" v-loading="loading" style="width: 100%" @selection-change="handleSelection">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="phone" label="用户号码" min-width="150" />
        <el-table-column prop="appId" label="应用ID" min-width="150">
          <template #default="scope">
            <el-popover
              placement="right"
              :width="450"
              trigger="hover"
              popper-class="app-detail-popover"
            >
              <template #reference>
                <el-link type="primary" :underline="false" class="app-id-link">{{ scope.row.appId }}</el-link>
              </template>
              <div class="popover-content">
                <div class="popover-title">应用详情</div>
                <div class="detail-item">
                  <div class="detail-label">应用ID</div>
                  <div class="detail-value">{{ scope.row.appId }}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">应用名称</div>
                  <div class="detail-value">{{ scope.row.appName }}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">业务场景</div>
                  <div class="detail-value">{{ scope.row.businessScene }}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">子业务场景</div>
                  <div class="detail-value">{{ scope.row.subScenes }}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">应用说明</div>
                  <div class="detail-value">{{ scope.row.description }}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">操作时间</div>
                  <div class="detail-value">{{ scope.row.subscriptionTime }}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">操作者</div>
                  <div class="detail-value">{{ scope.row.operator }}</div>
                </div>
              </div>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column prop="appName" label="应用名称" min-width="200" />
        <el-table-column prop="subscriptionTime" label="订购时间" min-width="180" />
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <UnifiedPagination
        :total="total"
        :current-page="pagination.current"
        :page-size="pagination.pageSize"
        @page-change="handlePageChange"
        @size-change="handlePageSizeChange"
      />
    </div>

    <SubscriptionDialog ref="subscriptionDialogRef" @save="handleSave" />
    <DeleteConfirmDialog ref="deleteDialogRef" @confirm="handleDeleteConfirm" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserSubscriptionData } from '@/composables/useUserSubscriptionData'
import SubscriptionDialog from '@/components/SubscriptionDialog.vue'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog.vue'
import UnifiedPagination from '@/components/common/UnifiedPagination.vue'

const {
  tableData,
  loading,
  total,
  pagination,
  searchParams,
  handleSearch,
  handleReset,
  handlePageChange,
  handlePageSizeChange,
  handleDelete: executeDelete,
  handleCreate,
  handleUpdate
} = useUserSubscriptionData()

const searchForm = ref({ phone: '', timeRange: [] })

const selectedRows = ref([])
const currentRow = ref(null)
const subscriptionDialogRef = ref()
const deleteDialogRef = ref()

const handleSelection = (selection) => {
  selectedRows.value = selection
}

const syncSearchParams = () => {
  searchParams.phone = searchForm.value.phone
  if (searchForm.value.timeRange && searchForm.value.timeRange.length === 2) {
    searchParams.startTime = searchForm.value.timeRange[0]
    searchParams.endTime = searchForm.value.timeRange[1]
  } else {
    searchParams.startTime = ''
    searchParams.endTime = ''
  }
}

const handleSearchWithForm = () => {
  syncSearchParams()
  handleSearch()
}

const handleResetWithForm = () => {
  searchForm.value = { phone: '', timeRange: [] }
  handleReset()
}

const handleAdd = () => subscriptionDialogRef.value.open('新增订购')
const handleEdit = (row) => subscriptionDialogRef.value.open('编辑订购', row)

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
    subscriptionDialogRef.value.close()
  } catch (error) {
    // Error already handled in composable
  }
}
</script>

<style lang="scss" scoped>
.user-subscription-container {
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

    .search-row {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .search-item {
      flex: 0 0 calc(25% - 12px);
      min-width: 200px;
      margin-bottom: 0;

      :deep(.el-form-item__content) {
        flex: 1;
      }

      :deep(.el-select),
      :deep(.el-input) {
        width: 100%;
      }
    }

    .search-item-wide {
      flex: 0 0 calc(50% - 12px);
      min-width: 400px;
    }

    .search-item-empty {
      visibility: hidden;
    }

    .search-btns {
      display: flex;
      gap: 12px;
      padding-left: 30px;
    }

    .btn-query {
      background-color: #4079de;
      width: 70px;
    }

    .btn-reset {
      color: #4079de;
      border-color: #dcdfe6;
      width: 70px;
    }
  }

  .table-container {
    background: #fff;
    padding: 20px;
    border-radius: 4px;
    height: 540px;
    display: flex;
    flex-direction: column;

    .el-table {
      flex: 1;

      :deep(.el-table__body-wrapper) {
        overflow-y: auto;
      }
    }
  }
}

.app-id-link {
  font-weight: 500;
}

.app-detail-popover {
  background-color: #ffffff !important;
  border: 1px solid #e4e7ed !important;
  border-radius: 4px !important;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1) !important;
}

.app-detail-popover :deep(.popper__arrow::after) {
  border-right-color: #ffffff !important;
}

.popover-content {
  padding: 0;
}

.popover-title {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 12px;
}

.detail-item {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 16px;
  padding: 10px 20px;
  align-items: flex-start;
}

.detail-item:last-child {
  padding-bottom: 16px;
}

.detail-label {
  font-size: 14px;
  font-weight: 500;
  color: #666666;
  text-align: right;
  flex-shrink: 0;
}

.detail-value {
  font-size: 14px;
  color: #333333;
  line-height: 1.5;
  word-wrap: break-word;
}
</style>
