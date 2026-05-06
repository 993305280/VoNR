# 通话记录页面实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现通话记录页面（`/cdr/calls`），包含搜索筛选、数据表格和分页，遵循 CDRDetail.vue 现有模式。

**Architecture:** 单文件修改 `src/views/CallRecords.vue`，使用 Vue 3 Composition API + Element Plus，复用 `UnifiedPagination` 公共分页组件。搜索行 `flex-wrap: nowrap` 随侧边栏自适应。

**Tech Stack:** Vue 3, Element Plus, UnifiedPagination, scoped CSS

---

### Task 1: 实现 CallRecords.vue

**Files:**
- Modify: `src/views/CallRecords.vue`

- [ ] **Step 1: 写入完整组件代码**

```vue
<template>
  <div class="call-records">
    <div class="page-header">
      <h2 class="page-title">通话记录</h2>
    </div>

    <div class="search-section">
      <el-form :model="searchForm" class="custom-form">
        <el-form-item label="主叫号码" class="flex-item">
          <el-input v-model="searchForm.callerNumber" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="被叫号码" class="flex-item">
          <el-input v-model="searchForm.calleeNumber" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="开始时间" class="flex-item time-item">
          <div class="time-range">
            <el-date-picker v-model="searchForm.startTimeFrom" type="datetime" placeholder="开始时间" />
            <span class="time-separator">至</span>
            <el-date-picker v-model="searchForm.startTimeTo" type="datetime" placeholder="结束时间" />
          </div>
        </el-form-item>
        <el-form-item label="结束时间" class="flex-item time-item">
          <div class="time-range">
            <el-date-picker v-model="searchForm.endTimeFrom" type="datetime" placeholder="开始时间" />
            <span class="time-separator">至</span>
            <el-date-picker v-model="searchForm.endTimeTo" type="datetime" placeholder="结束时间" />
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
          <el-table-column prop="callId" label="通话标识" min-width="130" />
          <el-table-column prop="callerNumber" label="主叫号码" min-width="140" />
          <el-table-column prop="calleeNumber" label="被叫号码" min-width="140" />
          <el-table-column prop="appId" label="应用ID" min-width="130" />
          <el-table-column prop="callDirection" label="通话方向" min-width="100" />
          <el-table-column prop="callType" label="通话类型" min-width="100" />
          <el-table-column prop="startTime" label="开始时间" min-width="180" />
          <el-table-column prop="endTime" label="结束时间" min-width="180" />
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
  callerNumber: '',
  calleeNumber: '',
  startTimeFrom: null,
  startTimeTo: null,
  endTimeFrom: null,
  endTimeTo: null
})

const rawData = [
  { callId: 'FW25518064', callerNumber: '13869421569', calleeNumber: '18562039456', appId: 'AP12845121', callDirection: '上行', callType: '音频', startTime: '2024-03-25 10:08:00', endTime: '2024-03-25 10:09:20' },
  { callId: 'FW25518064', callerNumber: '13869421569', calleeNumber: '18562039456', appId: 'AP12845121', callDirection: '下行', callType: '音频', startTime: '2024-03-25 10:08:00', endTime: '2024-03-25 10:09:20' },
  { callId: 'FW25518064', callerNumber: '13869421569', calleeNumber: '18562039456', appId: 'AP12845121', callDirection: '上行', callType: '视频', startTime: '2024-03-25 10:08:00', endTime: '2024-03-25 10:09:20' },
  { callId: 'FW25518064', callerNumber: '13869421569', calleeNumber: '18562039456', appId: 'AP12845121', callDirection: '下行', callType: '视频', startTime: '2024-03-25 10:08:00', endTime: '2024-03-25 10:09:20' },
  { callId: 'FW25518064', callerNumber: '13869421569', calleeNumber: '18562039456', appId: 'AP12845121', callDirection: '上行', callType: '音频', startTime: '2024-03-25 10:08:00', endTime: '2024-03-25 10:09:20' },
  { callId: 'FW25518064', callerNumber: '13869421569', calleeNumber: '18562039456', appId: 'AP12845121', callDirection: '下行', callType: '音频', startTime: '2024-03-25 10:08:00', endTime: '2024-03-25 10:09:20' },
  { callId: 'FW25518064', callerNumber: '13869421569', calleeNumber: '18562039456', appId: 'AP12845121', callDirection: '上行', callType: '视频', startTime: '2024-03-25 10:08:00', endTime: '2024-03-25 10:09:20' },
  { callId: 'FW25518064', callerNumber: '13869421569', calleeNumber: '18562039456', appId: 'AP12845121', callDirection: '下行', callType: '视频', startTime: '2024-03-25 10:08:00', endTime: '2024-03-25 10:09:20' },
  { callId: 'FW25518064', callerNumber: '13869421569', calleeNumber: '18562039456', appId: 'AP12845121', callDirection: '上行', callType: '视频', startTime: '2024-03-25 10:08:00', endTime: '2024-03-25 10:09:20' },
  { callId: 'FW25518064', callerNumber: '13869421569', calleeNumber: '18562039456', appId: 'AP12845121', callDirection: '下行', callType: '视频', startTime: '2024-03-25 10:08:00', endTime: '2024-03-25 10:09:20' }
]

const filteredData = ref([...rawData])

const handleSearch = () => {
  filteredData.value = rawData.filter(item => {
    if (searchForm.callerNumber && item.callerNumber !== searchForm.callerNumber) return false
    if (searchForm.calleeNumber && item.calleeNumber !== searchForm.calleeNumber) return false
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
}

const handleReset = () => {
  searchForm.callerNumber = ''
  searchForm.calleeNumber = ''
  searchForm.startTimeFrom = null
  searchForm.startTimeTo = null
  searchForm.endTimeFrom = null
  searchForm.endTimeTo = null
  handleSearch()
}
</script>

<style scoped>
.call-records {
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

.custom-table :deep(.el-table__header-wrapper th) {
  border-bottom: 1px solid #ebeef5;
}

.custom-table :deep(.el-table__row td) {
  padding: 12px 0;
}
</style>
```

- [ ] **Step 2: 启动开发服务器验证**

Run: `npm run dev`
Expected: 页面正常加载，搜索栏所有条件在同一行，表格显示 10 条 mock 数据，分页显示"共360条"

- [ ] **Step 3: 验证侧边栏收缩响应**

点击侧边栏折叠按钮，确认搜索行和表格跟随内容区宽度变化自适应。

- [ ] **Step 4: 验证搜索和重置功能**

在主叫号码输入 `13869421569` 后点击查询，确认只显示匹配数据；点击重置，确认恢复全部数据。

- [ ] **Step 5: Commit**

```bash
git add src/views/CallRecords.vue docs/superpowers/specs/2026-05-06-call-records-design.md docs/superpowers/plans/2026-05-06-call-records.md
git commit -m "feat: implement call records page with search, table, and pagination"
```
