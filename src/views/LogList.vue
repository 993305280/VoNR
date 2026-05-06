<template>
  <div class="log-list">
    <div class="page-header">
      <h2 class="page-title">操作日志</h2>
    </div>

    <div class="search-section">
      <div class="search-row">
        <div class="flex-item">
          <span class="field-label">操作内容</span>
          <el-input v-model="searchForm.content" placeholder="请输入" clearable />
        </div>
        <div class="flex-item">
          <span class="field-label">操作类型</span>
          <el-select v-model="searchForm.type" placeholder="全部类型" clearable>
            <el-option label="全部类型" value="" />
            <el-option label="新增" value="新增" />
            <el-option label="编辑" value="编辑" />
            <el-option label="删除" value="删除" />
          </el-select>
        </div>
        <div class="flex-item">
          <span class="field-label">操作者</span>
          <el-input v-model="searchForm.operator" placeholder="请输入" clearable />
        </div>
        <div class="flex-item">
          <span class="field-label">IP地址</span>
          <el-input v-model="searchForm.ip" placeholder="请输入" clearable />
        </div>
      </div>

      <div class="search-row">
        <div class="time-item">
          <span class="field-label">操作时间</span>
          <el-date-picker
            v-model="searchForm.operationTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
        </div>
        <div class="btn-group">
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset" class="reset-btn">重置</el-button>
        </div>
      </div>
    </div>

    <div class="table-section">
      <div class="table-wrap">
        <el-table
          :data="filteredData"
          height="100%"
          style="width: 100%"
          stripe
          :header-cell-style="{ background: '#f8fafc', color: '#606266', fontWeight: 'bold' }"
          class="custom-table"
        >
          <el-table-column prop="serialNo" label="流水号" min-width="140" />
          <el-table-column prop="content" label="操作内容" min-width="130" />
          <el-table-column prop="type" label="操作类型" min-width="100" />
          <el-table-column prop="operator" label="操作者" min-width="150" />
          <el-table-column prop="operatorRole" label="操作者角色" min-width="110" />
          <el-table-column prop="operatorIp" label="操作者IP地址" min-width="140" />
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
  content: '',
  type: '',
  operator: '',
  ip: '',
  operationTime: null
})

const rawData = [
  { serialNo: 'CZ85123692', content: '新增业务', type: '新增', operator: 'admin@VoNR', operatorRole: '管理员', operatorIp: '192.16.64.88', operationTime: '2024-03-25 10:08:00' },
  { serialNo: 'CZ85123692', content: '编辑计费', type: '编辑', operator: 'admin@VoNR', operatorRole: '管理员', operatorIp: '192.16.64.88', operationTime: '2024-03-25 10:08:00' },
  { serialNo: 'CZ85123692', content: '删除业务', type: '删除', operator: 'admin@VoNR', operatorRole: '管理员', operatorIp: '192.16.64.88', operationTime: '2024-03-25 10:08:00' },
  { serialNo: 'CZ85123692', content: '新增业务', type: '新增', operator: 'admin@VoNR', operatorRole: '管理员', operatorIp: '192.16.64.88', operationTime: '2024-03-25 10:08:00' },
  { serialNo: 'CZ85123692', content: '编辑计费', type: '编辑', operator: 'admin@VoNR', operatorRole: '管理员', operatorIp: '192.16.64.88', operationTime: '2024-03-25 10:08:00' },
  { serialNo: 'CZ85123692', content: '删除业务', type: '删除', operator: 'admin@VoNR', operatorRole: '管理员', operatorIp: '192.16.64.88', operationTime: '2024-03-25 10:08:00' },
  { serialNo: 'CZ85123692', content: '删除业务', type: '删除', operator: 'admin@VoNR', operatorRole: '管理员', operatorIp: '192.16.64.88', operationTime: '2024-03-25 10:08:00' },
  { serialNo: 'CZ85123692', content: '新增业务', type: '新增', operator: 'admin@VoNR', operatorRole: '管理员', operatorIp: '192.16.64.88', operationTime: '2024-03-25 10:08:00' },
  { serialNo: 'CZ85123692', content: '编辑计费', type: '编辑', operator: 'admin@VoNR', operatorRole: '管理员', operatorIp: '192.16.64.88', operationTime: '2024-03-25 10:08:00' },
  { serialNo: 'CZ85123692', content: '删除业务', type: '删除', operator: 'admin@VoNR', operatorRole: '管理员', operatorIp: '192.16.64.88', operationTime: '2024-03-25 10:08:00' }
]

const filteredData = ref([...rawData])

const handleSearch = () => {
  filteredData.value = rawData.filter(item => {
    if (searchForm.content && !item.content.includes(searchForm.content)) return false
    if (searchForm.type && item.type !== searchForm.type) return false
    if (searchForm.operator && !item.operator.includes(searchForm.operator)) return false
    if (searchForm.ip && !item.operatorIp.includes(searchForm.ip)) return false
    if (searchForm.operationTime && searchForm.operationTime.length === 2) {
      const itemTime = new Date(item.operationTime)
      if (itemTime < searchForm.operationTime[0] || itemTime > searchForm.operationTime[1]) return false
    }
    return true
  })
}

const handleReset = () => {
  searchForm.content = ''
  searchForm.type = ''
  searchForm.operator = ''
  searchForm.ip = ''
  searchForm.operationTime = null
  handleSearch()
}
</script>

<style scoped>
.log-list {
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

.search-row {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-row + .search-row {
  margin-top: 16px;
}

.flex-item {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-item {
  flex: 2;
  display: flex;
  align-items: center;
  gap: 8px;
}

.field-label {
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  flex-shrink: 0;
}

.flex-item :deep(.el-input),
.flex-item :deep(.el-select) {
  width: 100% !important;
}

.time-item :deep(.el-date-editor) {
  flex: 1;
  min-width: 0;
}

.btn-group {
  flex-shrink: 0;
  display: flex;
  gap: 8px;
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

.custom-table :deep(.el-table__header-wrapper th) {
  border-bottom: 1px solid #ebeef5;
}

.custom-table :deep(.el-table__row td) {
  padding: 12px 0;
}
</style>
