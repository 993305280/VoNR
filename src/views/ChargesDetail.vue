<template>
  <div class="charges-detail">
    <!-- 顶部标题和操作按钮 -->
    <div class="page-header">
      <h2 class="page-title">费用明细</h2>
      <el-button type="primary" :icon="Refresh" class="action-btn" @click="handleSync">同步费用明细</el-button>
    </div>

    <!-- 搜索表单 -->
    <div class="search-section">
      <el-form :inline="true" :model="searchForm" class="custom-form">
        <el-form-item label="用户号码">
          <el-input v-model="searchForm.userNumber" placeholder="请输入" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="子业务场景">
          <el-select v-model="searchForm.subScene" placeholder="全部场景" clearable style="width: 150px">
            <el-option label="全部场景" value="" />
            <el-option label="001001虚拟背景" value="001001虚拟背景" />
            <el-option label="001002美颜滤镜" value="001002美颜滤镜" />
            <el-option label="002001高清视频" value="002001高清视频" />
            <el-option label="002002屏幕共享" value="002002屏幕共享" />
            <el-option label="003001语音留言" value="003001语音留言" />
          </el-select>
        </el-form-item>
        <el-form-item label="服务开始时间">
          <div class="time-range">
            <el-date-picker v-model="searchForm.startTimeFrom" type="datetime" placeholder="开始时间" style="width: 170px" />
            <span class="time-separator">至</span>
            <el-date-picker v-model="searchForm.startTimeTo" type="datetime" placeholder="结束时间" style="width: 170px" />
          </div>
        </el-form-item>
        <el-form-item label="服务结束时间">
          <div class="time-range">
            <el-date-picker v-model="searchForm.endTimeFrom" type="datetime" placeholder="开始时间" style="width: 170px" />
            <span class="time-separator">至</span>
            <el-date-picker v-model="searchForm.endTimeTo" type="datetime" placeholder="结束时间" style="width: 170px" />
          </div>
        </el-form-item>
        <el-form-item class="btn-group">
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset" class="reset-btn">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <div class="table-wrap">
        <el-table
          :data="filteredData"
          height="100%"
          style="width: 100%"
          :header-cell-style="{ background: '#f8fafc', color: '#606266', fontWeight: 'bold' }"
          class="custom-table"
        >
          <el-table-column prop="transactionId" label="流水号" min-width="130" />
          <el-table-column prop="userNumber" label="用户号码" min-width="140" />
          <el-table-column prop="callId" label="通话标识" min-width="130" />
          <el-table-column prop="appId" label="应用ID" min-width="130" />
          <el-table-column prop="businessScene" label="业务场景" min-width="120" />
          <el-table-column prop="subScene" label="子业务场景" min-width="140" />
          <el-table-column prop="billingMethod" label="计费方式" min-width="100" />
          <el-table-column label="业务单价" min-width="110">
            <template #default="scope">
              {{ scope.row.unitPrice }} {{ scope.row.billingMethod === '按时长' ? '元/分钟' : '元/次' }}
            </template>
          </el-table-column>
          <el-table-column prop="totalCost" label="业务总费用(元)" min-width="140" sortable />
          <el-table-column label="服务时长" min-width="100">
            <template #default="scope">
              {{ scope.row.billingMethod === '按时长' ? scope.row.duration : '--' }}
            </template>
          </el-table-column>
          <el-table-column label="服务次数" min-width="100">
            <template #default="scope">
              {{ scope.row.billingMethod === '按次' ? scope.row.count : '--' }}
            </template>
          </el-table-column>
          <el-table-column prop="startTime" label="服务开始时间" min-width="180" />
          <el-table-column prop="endTime" label="服务结束时间" min-width="180" />
        </el-table>
      </div>

      <UnifiedPagination :total="360" />
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import UnifiedPagination from '@/components/common/UnifiedPagination.vue'
import { ElMessage } from 'element-plus'

const searchForm = reactive({
  userNumber: '',
  subScene: '',
  startTimeFrom: null,
  startTimeTo: null,
  endTimeFrom: null,
  endTimeTo: null
})

const rawData = [
  { transactionId: 'JF05689123', userNumber: '13869421569', callId: 'FW25518064', appId: 'AP25518064', businessScene: '001趣味通话', subScene: '001001虚拟背景', billingMethod: '按时长', unitPrice: 1, totalCost: 8, duration: '07:56', count: null, startTime: '2024-03-25 10:00:00', endTime: '2024-03-25 10:08:00' },
  { transactionId: 'JF81236940', userNumber: '18512489653', callId: 'FW25691240', appId: 'AP25691240', businessScene: '001趣味通话', subScene: '001001虚拟背景', billingMethod: '按次', unitPrice: 5, totalCost: 5, duration: null, count: 1, startTime: '2024-03-24 10:00:00', endTime: '2024-03-25 10:08:00' },
  { transactionId: 'JF05689124', userNumber: '13869421569', callId: 'FW25518065', appId: 'AP25518064', businessScene: '001趣味通话', subScene: '001001虚拟背景', billingMethod: '按时长', unitPrice: 1, totalCost: 8, duration: '07:56', count: null, startTime: '2024-03-25 10:00:00', endTime: '2024-03-25 10:08:00' },
  { transactionId: 'JF81236941', userNumber: '18512489653', callId: 'FW25691241', appId: 'AP25691240', businessScene: '001趣味通话', subScene: '001001虚拟背景', billingMethod: '按次', unitPrice: 5, totalCost: 5, duration: null, count: 1, startTime: '2024-03-24 10:00:00', endTime: '2024-03-25 10:08:00' },
  { transactionId: 'JF05689125', userNumber: '13869421570', callId: 'FW25518066', appId: 'AP25518064', businessScene: '001趣味通话', subScene: '001002美颜滤镜', billingMethod: '按时长', unitPrice: 1, totalCost: 8, duration: '07:56', count: null, startTime: '2024-03-25 10:00:00', endTime: '2024-03-25 10:08:00' },
  { transactionId: 'JF81236942', userNumber: '18512489654', callId: 'FW25691242', appId: 'AP25691240', businessScene: '002视频通话', subScene: '002001高清视频', billingMethod: '按次', unitPrice: 3, totalCost: 3, duration: null, count: 1, startTime: '2024-03-24 10:00:00', endTime: '2024-03-25 10:08:00' },
  { transactionId: 'JF05689126', userNumber: '13869421570', callId: 'FW25518067', appId: 'AP25518065', businessScene: '002视频通话', subScene: '002001高清视频', billingMethod: '按时长', unitPrice: 2, totalCost: 16, duration: '08:00', count: null, startTime: '2024-03-25 10:00:00', endTime: '2024-03-25 10:08:00' },
  { transactionId: 'JF81236943', userNumber: '18512489654', callId: 'FW25691243', appId: 'AP25691241', businessScene: '002视频通话', subScene: '002002屏幕共享', billingMethod: '按次', unitPrice: 5, totalCost: 10, duration: null, count: 2, startTime: '2024-03-24 10:00:00', endTime: '2024-03-25 10:08:00' },
  { transactionId: 'JF05689127', userNumber: '13900001111', callId: 'FW25518068', appId: 'AP25518065', businessScene: '001趣味通话', subScene: '001001虚拟背景', billingMethod: '按时长', unitPrice: 1, totalCost: 12, duration: '12:00', count: null, startTime: '2024-03-25 10:00:00', endTime: '2024-03-25 10:12:00' },
  { transactionId: 'JF81236944', userNumber: '13900001111', callId: 'FW25691244', appId: 'AP25691241', businessScene: '003语音信箱', subScene: '003001语音留言', billingMethod: '按次', unitPrice: 2, totalCost: 6, duration: null, count: 3, startTime: '2024-03-24 10:00:00', endTime: '2024-03-25 10:08:00' },
  { transactionId: 'JF05689128', userNumber: '13869421569', callId: 'FW25518069', appId: 'AP25518064', businessScene: '001趣味通话', subScene: '001002美颜滤镜', billingMethod: '按时长', unitPrice: 1, totalCost: 5, duration: '05:00', count: null, startTime: '2024-03-25 10:00:00', endTime: '2024-03-25 10:05:00' },
  { transactionId: 'JF81236945', userNumber: '18512489653', callId: 'FW25691245', appId: 'AP25691240', businessScene: '001趣味通话', subScene: '001001虚拟背景', billingMethod: '按次', unitPrice: 5, totalCost: 15, duration: null, count: 3, startTime: '2024-03-24 10:00:00', endTime: '2024-03-25 10:08:00' }
]

const filteredData = computed(() => {
  return rawData.filter(item => {
    if (searchForm.userNumber && item.userNumber !== searchForm.userNumber) return false
    if (searchForm.subScene && item.subScene !== searchForm.subScene) return false
    if (searchForm.startTimeFrom) {
      const itemTime = new Date(item.startTime)
      if (itemTime < searchForm.startTimeFrom) return false
    }
    if (searchForm.startTimeTo) {
      const itemTime = new Date(item.startTime)
      if (itemTime > searchForm.startTimeTo) return false
    }
    if (searchForm.endTimeFrom) {
      const itemTime = new Date(item.endTime)
      if (itemTime < searchForm.endTimeFrom) return false
    }
    if (searchForm.endTimeTo) {
      const itemTime = new Date(item.endTime)
      if (itemTime > searchForm.endTimeTo) return false
    }
    return true
  })
})

const handleSearch = () => {}

const handleReset = () => {
  searchForm.userNumber = ''
  searchForm.subScene = ''
  searchForm.startTimeFrom = null
  searchForm.startTimeTo = null
  searchForm.endTimeFrom = null
  searchForm.endTimeTo = null
}

const handleSync = () => {
  ElMessage.info('同步功能开发中')
}
</script>

<style scoped>
.charges-detail {
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

.search-section :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 16px;
}

.search-section :deep(.el-form-item__label) {
  font-weight: 500;
  color: #333;
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
  margin-left: auto;
  margin-right: 0;
}

.action-btn {
  border-radius: 4px;
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
