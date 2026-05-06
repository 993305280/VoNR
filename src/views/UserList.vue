<template>
  <div class="user-subscription p-6 bg-white min-h-full">
    <!-- 顶部标题和操作按钮 -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-lg font-medium text-gray-800">用户订购关系</h2>
      <div class="flex gap-2">
        <el-button type="primary" :icon="Plus" class="action-btn" @click="handleAdd">新增订购</el-button>
        <el-button type="danger" :icon="Delete" class="action-btn !bg-[#f56c6c]" @click="handleDeleteSelected">删除订购</el-button>
      </div>
    </div>

    <!-- 搜索表单 -->
    <div class="search-section mb-6">
      <el-form :inline="true" :model="searchForm" class="custom-form flex items-center">
        <el-form-item label="用户号码">
          <el-input v-model="searchForm.phone" placeholder="请输入" clearable class="!w-60" />
        </el-form-item>
        <el-form-item label="订购时间" class="!ml-8">
          <el-date-picker
            v-model="searchForm.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            class="!w-[420px]"
          />
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
        :data="tableData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        :header-cell-style="{ background: '#f8fafc', color: '#606266', fontWeight: 'bold' }"
        class="custom-table"
      >
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
                  <div class="detail-value">{{ scope.row.time }}</div>
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
        <el-table-column prop="time" label="订购时间" min-width="180" />
        <el-table-column label="操作" width="120" align="center">
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

    <!-- 新增/编辑订购对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        class="dialog-form"
      >
        <el-form-item label="用户号码" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入用户号码" />
        </el-form-item>
        <el-form-item label="应用ID" prop="appId">
          <el-select v-model="formData.appId" placeholder="请选择应用ID" class="w-full">
            <el-option label="AP12845121 - 企业品牌宣传应用5" value="AP12845121" />
            <el-option label="AP25518064 - 公益宣传应用1" value="AP25518064" />
          </el-select>
        </el-form-item>
        <el-form-item label="订购时间" prop="time">
          <el-date-picker
            v-model="formData.time"
            type="datetime"
            placeholder="选择订购时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            class="w-full"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="确认删除"
      width="400px"
    >
      <p>确定要删除选中的订购关系吗？此操作不可撤销。</p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmDelete">确定删除</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import UnifiedPagination from '@/components/common/UnifiedPagination.vue'
import { ElMessage } from 'element-plus'

// 搜索表单数据
const searchForm = reactive({
  phone: '',
  timeRange: []
})

// 模拟表格数据
const tableData = ref([
  {
    phone: '13869421569',
    appId: 'AP12845121',
    appName: '企业品牌宣传应用5',
    time: '2024-03-25 10:00:00',
    businessScene: '001趣味通话',
    subScenes: '001002虚拟头像、001003通话特效',
    description: '这里是说明这里是说明这里是说明这里是说明这里是说明这里是说明这里是说明这里是说明',
    operator: 'admin@VoNR'
  },
  {
    phone: '18512489653',
    appId: 'AP12845121',
    appName: '企业品牌宣传应用5',
    time: '2024-03-25 10:00:00',
    businessScene: '001趣味通话',
    subScenes: '001002虚拟头像、001003通话特效',
    description: '这里是说明这里是说明这里是说明这里是说明这里是说明这里是说明这里是说明这里是说明',
    operator: 'admin@VoNR'
  },
  {
    phone: '18512489653',
    appId: 'AP12845121',
    appName: '企业品牌宣传应用5',
    time: '2024-03-25 10:00:00',
    businessScene: '001趣味通话',
    subScenes: '001002虚拟头像、001003通话特效',
    description: '这里是说明这里是说明这里是说明这里是说明这里是说明这里是说明这里是说明这里是说明',
    operator: 'admin@VoNR'
  },
  {
    phone: '18512489653',
    appId: 'AP25518064',
    appName: '公益宣传应用1',
    time: '2024-03-25 10:00:00',
    businessScene: '001趣味通话',
    subScenes: '001002虚拟头像、001003通话特效',
    description: '这里是说明这里是说明这里是说明这里是说明这里是说明这里是说明这里是说明这里是说明',
    operator: 'admin@VoNR'
  },
  {
    phone: '13869421569',
    appId: 'AP12845121',
    appName: '企业品牌宣传应用5',
    time: '2024-03-25 10:00:00',
    businessScene: '001趣味通话',
    subScenes: '001002虚拟头像、001003通话特效',
    description: '这里是说明这里是说明这里是说明这里是说明这里是说明这里是说明这里是说明这里是说明',
    operator: 'admin@VoNR'
  },
  {
    phone: '18512489653',
    appId: 'AP12845121',
    appName: '企业品牌宣传应用5',
    time: '2024-03-25 10:00:00',
    businessScene: '001趣味通话',
    subScenes: '001002虚拟头像、001003通话特效',
    description: '这里是说明这里是说明这里是说明这里是说明这里是说明这里是说明这里是说明这里是说明',
    operator: 'admin@VoNR'
  },
  {
    phone: '18512489653',
    appId: 'AP12845121',
    appName: '企业品牌宣传应用5',
    time: '2024-03-25 10:00:00',
    businessScene: '001趣味通话',
    subScenes: '001002虚拟头像、001003通话特效',
    description: '这里是说明这里是说明这里是说明这里是说明这里是说明这里是说明这里是说明这里是说明',
    operator: 'admin@VoNR'
  },
  {
    phone: '18512489653',
    appId: 'AP25518064',
    appName: '公益宣传应用1',
    time: '2024-03-25 10:00:00',
    businessScene: '001趣味通话',
    subScenes: '001002虚拟头像、001003通话特效',
    description: '这里是说明这里是说明这里是说明这里是说明这里是说明这里是说明这里是说明这里是说明',
    operator: 'admin@VoNR'
  },
  {
    phone: '18512489653',
    appId: 'AP12845121',
    appName: '企业品牌宣传应用5',
    time: '2024-03-25 10:00:00',
    businessScene: '001趣味通话',
    subScenes: '001002虚拟头像、001003通话特效',
    description: '这里是说明这里是说明这里是说明这里是说明这里是说明这里是说明这里是说明这里是说明',
    operator: 'admin@VoNR'
  },
  {
    phone: '18512489653',
    appId: 'AP25518064',
    appName: '公益宣传应用1',
    time: '2024-03-25 10:00:00',
    businessScene: '001趣味通话',
    subScenes: '001002虚拟头像、001003通话特效',
    description: '这里是说明这里是说明这里是说明这里是说明这里是说明这里是说明这里是说明这里是说明',
    operator: 'admin@VoNR'
  }
])

const multipleSelection = ref([])

// 对话框相关
const dialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const dialogTitle = ref('新增订购')
const isEdit = ref(false)
const currentRow = ref(null)
const formRef = ref()

// 表单数据
const formData = reactive({
  phone: '',
  appId: '',
  time: ''
})

// 表单验证规则
const formRules = {
  phone: [
    { required: true, message: '请输入用户号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  appId: [
    { required: true, message: '请选择应用ID', trigger: 'change' }
  ],
  time: [
    { required: true, message: '请选择订购时间', trigger: 'change' }
  ]
}

// 应用选项映射
const appOptions = {
  'AP12845121': '企业品牌宣传应用5',
  'AP25518064': '公益宣传应用1'
}

const handleSelectionChange = (val) => {
  multipleSelection.value = val
}

const handleSearch = () => {
  console.log('search', searchForm)
  // 这里可以添加搜索逻辑
}

const handleReset = () => {
  searchForm.phone = ''
  searchForm.timeRange = []
}

// 新增订购
const handleAdd = () => {
  dialogTitle.value = '新增订购'
  isEdit.value = false
  currentRow.value = null
  resetForm()
  dialogVisible.value = true
}

// 删除选中的订购
const handleDeleteSelected = () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请先选择要删除的订购关系')
    return
  }
  deleteDialogVisible.value = true
}

// 编辑订购
const handleEdit = (row) => {
  dialogTitle.value = '编辑订购'
  isEdit.value = true
  currentRow.value = row
  formData.phone = row.phone
  formData.appId = row.appId
  formData.time = row.time
  dialogVisible.value = true
}

// 删除单个订购
const handleDelete = (row) => {
  currentRow.value = row
  deleteDialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    if (isEdit.value) {
      // 编辑逻辑
      const index = tableData.value.findIndex(item => item === currentRow.value)
      if (index !== -1) {
        tableData.value[index] = {
          ...tableData.value[index],
          phone: formData.phone,
          appId: formData.appId,
          appName: appOptions[formData.appId],
          time: formData.time
        }
        ElMessage.success('编辑成功')
      }
    } else {
      // 新增逻辑
      const newItem = {
        phone: formData.phone,
        appId: formData.appId,
        appName: appOptions[formData.appId],
        time: formData.time,
        businessScene: '001趣味通话',
        subScenes: '001002虚拟头像、001003通话特效',
        description: '这里是说明这里是说明这里是说明这里是说明这里是说明这里是说明这里是说明这里是说明',
        operator: 'admin@VoNR'
      }
      tableData.value.unshift(newItem)
      ElMessage.success('新增成功')
    }

    dialogVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 确认删除
const confirmDelete = () => {
  if (currentRow.value) {
    // 删除单个
    const index = tableData.value.findIndex(item => item === currentRow.value)
    if (index !== -1) {
      tableData.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  } else if (multipleSelection.value.length > 0) {
    // 删除选中
    multipleSelection.value.forEach(item => {
      const index = tableData.value.findIndex(row => row === item)
      if (index !== -1) {
        tableData.value.splice(index, 1)
      }
    })
    ElMessage.success(`成功删除 ${multipleSelection.value.length} 条记录`)
    multipleSelection.value = []
  }

  deleteDialogVisible.value = false
}

// 重置表单
const resetForm = () => {
  formData.phone = ''
  formData.appId = ''
  formData.time = ''
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}
</script>

<style scoped>
.user-subscription {
  padding: 13px 20px 0px;
  /* 移除之前的背景色，使用纯白背景以符合设计图 */
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

.custom-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #333;
}

.app-id-link {
  font-weight: 500;
}

.custom-table :deep(.el-table__header-wrapper th) {
  border-bottom: 1px solid #ebeef5;
}

.custom-table :deep(.el-table__row td) {
  padding: 12px 0;
}

/* Popover 样式 */
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

/* 对话框样式 */
.dialog-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #333;
}

.dialog-footer {
  text-align: right;
}
</style>
