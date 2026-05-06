<template>
  <div class="business-config-container">
    <div class="header-section">
      <h3 class="page-title">业务配置</h3>
      <div class="button-group">
        <el-button type="primary" :icon="Refresh" class="btn-sync">同步业务配置</el-button>
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
      <el-table :data="tableData" style="width: 100%" @selection-change="handleSelection">
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
            <el-switch v-model="scope.row.status" active-text="启用" inactive-text="禁用" inline-prompt />
          </template>
        </el-table-column>
        <el-table-column label="审核状态">
          <template #default="scope">
            <span class="audit-link" @click="showAuditDetail(scope.row)">
              【新增】<span class="text-green">审核成功</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="available" label="可用状态" />
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <UnifiedPagination :total="360" />
    </div>

    <ConfigDialog ref="configDialogRef" @refresh="fetchData" />
    <AuditDetailDialog ref="auditDialogRef" />
    <DeleteConfirmDialog ref="deleteDialogRef" @confirm="handleDeleteConfirm" />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Refresh, Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ConfigDialog from '@/components/ConfigDialog.vue'
import AuditDetailDialog from '@/components/AuditDetailDialog.vue'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog.vue'
import UnifiedPagination from '@/components/common/UnifiedPagination.vue'

const searchForm = reactive({ code: '', status: '', audit: '', available: '', appName: '' })
const tableData = ref([
  { id: '001', code: '*10#', appName: '企业品牌宣传应用5', scene: '001趣味通话', subScene: '001001虚拟背景', type: '开启', channel: 'DC', status: false, available: '可用' },
  { id: '002', code: '*11#', appName: '企业品牌宣传应用5', scene: '001趣味通话', subScene: '001001虚拟背景', type: '停止', channel: 'DC', status: true, available: '可用' },
  // ... 更多模拟数据
])

const selectedRows = ref([])
const currentRow = ref(null)
const configDialogRef = ref()
const auditDialogRef = ref()
const deleteDialogRef = ref()

const handleSelection = (selection) => {
  selectedRows.value = selection
}

// 刷新数据
const fetchData = () => {
  console.log('刷新数据')
  // 这里可以添加实际的数据获取逻辑
  // 例如: axios.get('/api/business-config').then(res => { tableData.value = res.data })
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
    // 可以给用户一个提示，没有选择任何行
    ElMessage.warning('请至少选择一条记录进行删除')
    return
  }
  deleteDialogRef.value.open(true)
}

const handleDeleteConfirm = (isBatch) => {
  if (isBatch) {
    // 批量删除逻辑
    // 从 tableData 中移除选中的行
    const selectedIds = selectedRows.value.map(item => item.id)
    tableData.value = tableData.value.filter(item => !selectedIds.includes(item.id))
    // 清空选中
    selectedRows.value = []
    ElMessage.success('批量删除成功')
  } else {
    // 单个删除逻辑
    if (currentRow.value) {
      const id = currentRow.value.id
      tableData.value = tableData.value.filter(item => item.id !== id)
      currentRow.value = null
      ElMessage.success('删除成功')
    }
  }
  // 这里可以添加实际的后端删除请求
  // 例如: axios.post('/api/business-config/delete', { ids: [...selectedIds] })
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
    .btn-sync { background-color: #4079de; }
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
    }
  }
}
</style>