# 计费套餐页面 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 BillingPackage.vue 从占位页替换为完整的计费套餐 CRUD 页面。

**Architecture:** 单文件实现，遵循 UserList.vue 的模式：标题栏 + 搜索区 + 表格 + 分页 + 新增/编辑弹框 + 删除确认弹框。Mock 数据内联硬编码。

**Tech Stack:** Vue 3 `<script setup>`, Element Plus, Tailwind CSS, UnifiedPagination

---

## 文件变更

- **修改:** `src/views/BillingPackage.vue` — 从占位页替换为完整实现

---

### Task 1: 构建模板结构（标题栏 + 搜索区 + 表格）

**Files:**
- Modify: `src/views/BillingPackage.vue`

- [ ] **Step 1: 替换 BillingPackage.vue 模板和脚本**

将 `src/views/BillingPackage.vue` 的完整内容替换为以下代码：

```vue
<template>
  <div class="billing-package p-6 bg-white min-h-full">
    <!-- 顶部标题和操作按钮 -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-lg font-medium text-gray-800">计费套餐</h2>
      <div class="flex gap-2">
        <el-button type="primary" :icon="Plus" class="action-btn" @click="handleAdd">新增计费套餐</el-button>
        <el-button type="danger" :icon="Delete" class="action-btn !bg-[#f56c6c]" @click="handleDeleteSelected">删除计费套餐</el-button>
      </div>
    </div>

    <!-- 搜索表单 -->
    <div class="search-section mb-6">
      <el-form :inline="true" :model="searchForm" class="custom-form flex items-center">
        <el-form-item label="计费套餐名称">
          <el-input v-model="searchForm.billingName" placeholder="请输入" clearable class="!w-60" />
        </el-form-item>
        <el-form-item class="!mr-0 ml-auto">
          <el-button type="primary" @click="handleSearch" class="px-6 !bg-[#2196f3]">查询</el-button>
          <el-button @click="handleReset" class="px-6 reset-btn">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <el-table
        :data="filteredData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        :header-cell-style="{ background: '#f8fafc', color: '#606266', fontWeight: 'bold' }"
        class="custom-table"
      >
        <el-table-column type="selection" width="40" />
        <el-table-column prop="billingId" label="计费ID" min-width="130" />
        <el-table-column prop="billingName" label="计费套餐名称" min-width="150" />
        <el-table-column prop="billingType" label="计费方式" min-width="100" />
        <el-table-column label="费用" min-width="120">
          <template #default="scope">
            {{ scope.row.cost }} {{ scope.row.unit }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="计费说明" min-width="200" show-overflow-tooltip />
        <el-table-column prop="operationTime" label="操作时间" min-width="170" />
        <el-table-column prop="operator" label="操作者" min-width="140" />
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="scope">
            <div class="flex justify-center gap-4">
              <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <UnifiedPagination :total="360" />
    </div>

    <!-- 新增/编辑弹框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑计费套餐' : '新增计费套餐'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="110px"
        class="dialog-form"
      >
        <el-form-item label="计费套餐名称" prop="billingName">
          <el-input v-model="formData.billingName" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="计费方式" prop="billingType">
          <el-radio-group v-model="formData.billingType">
            <el-radio value="按次">按次</el-radio>
            <el-radio value="按时长">按时长</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="费用" prop="cost">
          <div class="flex gap-2 w-full">
            <el-input-number v-model="formData.cost" :min="0" :precision="2" placeholder="请输入" controls-position="right" class="flex-1" />
            <template v-if="formData.billingType === '按次'">
              <span class="leading-[32px] text-gray-600 whitespace-nowrap">元/次</span>
            </template>
            <template v-else>
              <el-select v-model="formData.unit" class="!w-[120px]">
                <el-option label="元/分钟" value="元/分钟" />
                <el-option label="元/小时" value="元/小时" />
              </el-select>
            </template>
          </div>
        </el-form-item>
        <el-form-item label="计费说明" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请输入" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 删除确认弹框 -->
    <el-dialog
      v-model="deleteDialogVisible"
      :title="isBatchDelete ? '批量删除计费' : '删除计费'"
      width="480px"
    >
      <div class="text-center py-4">
        <p class="text-base text-gray-800 mb-3">{{ isBatchDelete ? '是否删除所选计费？' : '是否删除此计费？' }}</p>
        <p class="text-sm text-red-500">{{ isBatchDelete ? '删除后，关联所选计费的业务配置将不再按所选计费方式计费，请谨慎操作！' : '删除后，关联此计费的业务配置将不再按此计费方式计费，请谨慎操作！' }}</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmDelete">删除</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import UnifiedPagination from '@/components/common/UnifiedPagination.vue'
import { ElMessage } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  billingName: ''
})

// Mock 数据
const rawData = ref([
  { billingId: 'JF00526314', billingName: '趣味通话计费', billingType: '按时长', cost: 5, unit: '元/小时', description: '这是说明这是说明这是说明这是说明', operationTime: '2024-03-25 10:00:00', operator: 'admin@VoNR' },
  { billingId: 'JF15698421', billingName: '虚拟背景计费', billingType: '按次', cost: 1, unit: '元/次', description: '这是说明这是说明这是说明', operationTime: '2024-03-25 10:00:00', operator: 'admin@VoNR' },
  { billingId: 'JF00526314', billingName: '趣味通话计费', billingType: '按时长', cost: 0.1, unit: '元/分钟', description: '这是说明这是说明这是说明这是说明', operationTime: '2024-03-25 10:00:00', operator: 'admin@VoNR' },
  { billingId: 'JF15698421', billingName: '虚拟背景计费', billingType: '按次', cost: 1, unit: '元/次', description: '这是说明这是说明这是说明这是说明这里是说...', operationTime: '2024-03-25 10:00:00', operator: 'admin@VoNR' },
  { billingId: 'JF00526314', billingName: '趣味通话计费', billingType: '按时长', cost: 5, unit: '元/小时', description: '这是说明这是说明这是说明这是说明', operationTime: '2024-03-25 10:00:00', operator: 'admin@VoNR' },
  { billingId: 'JF15698421', billingName: '虚拟背景计费', billingType: '按次', cost: 1, unit: '元/次', description: '这是说明这是说明这是说明', operationTime: '2024-03-25 10:00:00', operator: 'admin@VoNR' },
  { billingId: 'JF00526314', billingName: '趣味通话计费', billingType: '按时长', cost: 0.1, unit: '元/分钟', description: '这是说明这是说明这是说明这是说明', operationTime: '2024-03-25 10:00:00', operator: 'admin@VoNR' },
  { billingId: 'JF15698421', billingName: '虚拟背景计费', billingType: '按次', cost: 1, unit: '元/次', description: '这是说明这是说明这是说明这是说明这里是说...', operationTime: '2024-03-25 10:00:00', operator: 'admin@VoNR' },
  { billingId: 'JF00526314', billingName: '趣味通话计费', billingType: '按时长', cost: 0.1, unit: '元/分钟', description: '这是说明这是说明这是说明这是说明', operationTime: '2024-03-25 10:00:00', operator: 'admin@VoNR' },
  { billingId: 'JF15698421', billingName: '虚拟背景计费', billingType: '按次', cost: 1, unit: '元/次', description: '这是说明这是说明这是说明这是说明这里是说...', operationTime: '2024-03-25 10:00:00', operator: 'admin@VoNR' }
])

// 搜索过滤
const filteredData = computed(() => {
  if (!searchForm.billingName) return rawData.value
  return rawData.value.filter(item =>
    item.billingName.includes(searchForm.billingName)
  )
})

const multipleSelection = ref([])

// 新增/编辑弹框
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentRow = ref(null)
const formRef = ref()

const formData = reactive({
  billingName: '',
  billingType: '按次',
  cost: undefined,
  unit: '元/分钟',
  description: ''
})

const formRules = {
  billingName: [
    { required: true, message: '请输入计费套餐名称', trigger: 'blur' }
  ],
  cost: [
    { required: true, message: '请输入费用', trigger: 'blur' }
  ]
}

// 删除弹框
const deleteDialogVisible = ref(false)
const isBatchDelete = ref(false)

const handleSelectionChange = (val) => {
  multipleSelection.value = val
}

const handleSearch = () => {
  // 搜索通过 computed 自动过滤
}

const handleReset = () => {
  searchForm.billingName = ''
}

const handleAdd = () => {
  isEdit.value = false
  currentRow.value = null
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  currentRow.value = row
  formData.billingName = row.billingName
  formData.billingType = row.billingType
  formData.cost = row.cost
  formData.unit = row.unit
  formData.description = row.description
  dialogVisible.value = true
}

const handleDelete = (row) => {
  currentRow.value = row
  isBatchDelete.value = false
  deleteDialogVisible.value = true
}

const handleDeleteSelected = () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请先选择要删除的记录')
    return
  }
  isBatchDelete.value = true
  deleteDialogVisible.value = true
}

const generateBillingId = () => {
  const num = String(Math.floor(10000000 + Math.random() * 90000000))
  return 'JF' + num
}

const formatNow = () => {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    if (isEdit.value) {
      const index = rawData.value.findIndex(item => item === currentRow.value)
      if (index !== -1) {
        rawData.value[index] = {
          ...rawData.value[index],
          billingName: formData.billingName,
          billingType: formData.billingType,
          cost: formData.cost,
          unit: formData.billingType === '按次' ? '元/次' : formData.unit,
          description: formData.description
        }
        ElMessage.success('编辑成功')
      }
    } else {
      const newItem = {
        billingId: generateBillingId(),
        billingName: formData.billingName,
        billingType: formData.billingType,
        cost: formData.cost,
        unit: formData.billingType === '按次' ? '元/次' : formData.unit,
        description: formData.description,
        operationTime: formatNow(),
        operator: 'admin@VoNR'
      }
      rawData.value.unshift(newItem)
      ElMessage.success('新增成功')
    }

    dialogVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const confirmDelete = () => {
  if (isBatchDelete.value) {
    multipleSelection.value.forEach(item => {
      const index = rawData.value.findIndex(row => row === item)
      if (index !== -1) {
        rawData.value.splice(index, 1)
      }
    })
    ElMessage.success(`成功删除 ${multipleSelection.value.length} 条记录`)
    multipleSelection.value = []
  } else if (currentRow.value) {
    const index = rawData.value.findIndex(item => item === currentRow.value)
    if (index !== -1) {
      rawData.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }

  deleteDialogVisible.value = false
}

const resetForm = () => {
  formData.billingName = ''
  formData.billingType = '按次'
  formData.cost = undefined
  formData.unit = '元/分钟'
  formData.description = ''
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}
</script>

<style scoped>
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

.custom-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #333;
}

.custom-table :deep(.el-table__header-wrapper th) {
  border-bottom: 1px solid #ebeef5;
}

.custom-table :deep(.el-table__row td) {
  padding: 12px 0;
}

.dialog-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #333;
}

.dialog-footer {
  text-align: right;
}
</style>
```

- [ ] **Step 2: 验证页面加载**

Run: `npm run dev`
Expected: 浏览器访问 `/cdr/billing`，页面显示计费套餐表格，包含 10 条 mock 数据，搜索、新增、编辑、删除功能均可正常操作。

- [ ] **Step 3: Commit**

```bash
git add src/views/BillingPackage.vue
git commit -m "feat: implement billing package CRUD page"
```
