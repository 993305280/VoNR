<template>
  <div class="cdr-detail">
    <div class="page-header">
      <h2 class="page-title">CDR明细</h2>
    </div>

    <div class="search-section">
      <el-form :model="searchForm" class="custom-form">
        <el-form-item label="应用ID" class="flex-item">
          <el-input v-model="searchForm.appId" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="操作内容" class="flex-item">
          <el-input v-model="searchForm.operationContent" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="操作时间" class="flex-item time-item">
          <div class="time-range">
            <el-date-picker v-model="searchForm.timeFrom" type="datetime" placeholder="开始时间" />
            <span class="time-separator">至</span>
            <el-date-picker v-model="searchForm.timeTo" type="datetime" placeholder="结束时间" />
          </div>
        </el-form-item>
        <el-form-item class="btn-group">
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset" class="reset-btn">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-section">
      <div class="table-wrap">
        <el-table
          :data="filteredData"
          height="100%"
          style="width: 100%"
          :header-cell-style="{ background: '#f8fafc', color: '#606266', fontWeight: 'bold' }"
          class="custom-table"
        >
          <el-table-column prop="serialNumber" label="流水号" min-width="130" />
          <el-table-column prop="userNumber" label="用户号码" min-width="140" />
          <el-table-column prop="appId" label="应用ID" min-width="130" />
          <el-table-column prop="callId" label="通话标识" min-width="130" />
          <el-table-column prop="operationContent" label="操作内容" min-width="120" />
          <el-table-column prop="operationType" label="操作类型" min-width="100" />
          <el-table-column label="操作结果" min-width="100">
            <template #default="scope">
              <span :class="{ 'result-error': scope.row.operationResult === '异常' }">
                {{ scope.row.operationResult }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="operationTime" label="操作时间" min-width="180" />
        </el-table>
      </div>

      <UnifiedPagination :total="360" />
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import UnifiedPagination from '@/components/common/UnifiedPagination.vue'

const searchForm = reactive({
  appId: '',
  operationContent: '',
  timeFrom: null,
  timeTo: null
})

const rawData = [
  { serialNumber: 'FW05689123', userNumber: '13869421569', appId: 'AP25518064', callId: 'FW25518064', operationContent: '智能翻译', operationType: '开启', operationResult: '正常', operationTime: '2024-03-25 10:08:00' },
  { serialNumber: 'FW05689123', userNumber: '18512489653', appId: 'AP25518064', callId: 'FW25518064', operationContent: '智能翻译', operationType: '停止', operationResult: '异常', operationTime: '2024-03-25 10:08:00' },
  { serialNumber: 'FW05689123', userNumber: '13689423581', appId: 'AP25518064', callId: 'FW25518064', operationContent: '通话字幕', operationType: '更新', operationResult: '正常', operationTime: '2024-03-25 10:08:00' },
  { serialNumber: 'FW05689123', userNumber: '13869421569', appId: 'AP25518064', callId: 'FW25518064', operationContent: '智能翻译', operationType: '开启', operationResult: '正常', operationTime: '2024-03-25 10:08:00' },
  { serialNumber: 'FW05689123', userNumber: '18512489653', appId: 'AP25518064', callId: 'FW25518064', operationContent: '智能翻译', operationType: '停止', operationResult: '异常', operationTime: '2024-03-25 10:08:00' },
  { serialNumber: 'FW05689123', userNumber: '13689423581', appId: 'AP25518064', callId: 'FW25518064', operationContent: '通话字幕', operationType: '更新', operationResult: '正常', operationTime: '2024-03-25 10:08:00' },
  { serialNumber: 'FW05689123', userNumber: '13689423581', appId: 'AP25518064', callId: 'FW25518064', operationContent: '通话字幕', operationType: '更新', operationResult: '正常', operationTime: '2024-03-25 10:08:00' },
  { serialNumber: 'FW05689123', userNumber: '13869421569', appId: 'AP25518064', callId: 'FW25518064', operationContent: '智能翻译', operationType: '开启', operationResult: '正常', operationTime: '2024-03-25 10:08:00' },
  { serialNumber: 'FW05689123', userNumber: '18512489653', appId: 'AP25518064', callId: 'FW25518064', operationContent: '智能翻译', operationType: '停止', operationResult: '异常', operationTime: '2024-03-25 10:08:00' },
  { serialNumber: 'FW05689123', userNumber: '13689423581', appId: 'AP25518064', callId: 'FW25518064', operationContent: '通话字幕', operationType: '更新', operationResult: '正常', operationTime: '2024-03-25 10:08:00' }
]

const filteredData = ref([...rawData])

const handleSearch = () => {
  filteredData.value = rawData.filter(item => {
    if (searchForm.appId && item.appId !== searchForm.appId) return false
    if (searchForm.operationContent && item.operationContent !== searchForm.operationContent) return false
    if (searchForm.timeFrom) {
      const itemTime = new Date(item.operationTime)
      if (itemTime < searchForm.timeFrom) return false
    }
    if (searchForm.timeTo) {
      const itemTime = new Date(item.operationTime)
      if (itemTime > searchForm.timeTo) return false
    }
    return true
  })
}

const handleReset = () => {
  searchForm.appId = ''
  searchForm.operationContent = ''
  searchForm.timeFrom = null
  searchForm.timeTo = null
  handleSearch()
}
</script>

<style scoped>
.cdr-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #333333;
}

.search-section {
  padding: 0 24px 20px;
}

.search-section :deep(.custom-form) {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 16px;
}

.search-section :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 0;
}

.search-section :deep(.el-form-item__label) {
  font-weight: 500;
  color: #333;
  white-space: nowrap;
}

.flex-item {
  flex: 1;
  min-width: 0;
}

.time-item {
  flex: 2;
}

.flex-item :deep(.el-input),
.flex-item :deep(.el-select) {
  width: 100% !important;
}

.time-item .time-range {
  width: 100%;
}

.time-item :deep(.el-date-editor) {
  flex: 1;
  min-width: 0;
}

.time-range {
  display: flex;
  align-items: center;
  gap: 6px;
}

.time-separator {
  color: #999;
  flex-shrink: 0;
}

.btn-group {
  flex-shrink: 0;
  margin-left: auto;
  margin-right: 0;
}

.reset-btn {
  background-color: #f0f2f5;
  color: #606266;
  border: 1px solid #dcdfe6;
}

.reset-btn:hover {
  background-color: #e4e7ed;
  color: #409eff;
}

.table-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0 24px 20px;
}

.table-wrap {
  flex: 1;
  min-height: 0;
}

.result-error {
  color: #f56c6c;
}

.custom-table :deep(.el-table__header-wrapper th) {
  border-bottom: 1px solid #ebeef5;
}

.custom-table :deep(.el-table__row td) {
  padding: 12px 0;
}
</style>
