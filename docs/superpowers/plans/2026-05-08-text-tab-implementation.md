# 文本 Tab 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为素材库列表页面添加文本 Tab，支持文本素材的展示、新增、编辑、删除操作。

**Architecture:** 采用独立组件模式，与现有音频/视频 tab 保持一致的结构。创建 TextTab、TextTable、TextFormModal 三个组件，配合 useTextData composable 管理数据逻辑。

**Tech Stack:** Vue 3 Composition API, Element Plus, 原生 CSS/SCSS

---

## 文件结构

```
需要创建的文件：
- src/components/text/TextTable.vue      # 文本列表表格
- src/components/text/TextFormModal.vue  # 新增/编辑弹窗
- src/composables/useTextData.js         # 数据逻辑 composable

需要修改的文件：
- src/views/Overview.vue                 # 添加 TextTab 组件引用
```

---

## Task 1: 创建 useTextData composable

**Files:**
- Create: `src/composables/useTextData.js`

- [ ] **Step 1: 创建 composable 文件并定义 mock 数据**

```javascript
// src/composables/useTextData.js
import { ref, reactive } from 'vue'

// Mock 数据 - 覆盖各种审核状态组合
const generateMockData = () => [
  { id: '001', name: '清明节通知', content: '【广州市民政局、市应急管理局】提醒您：清明节祭扫高峰期，各墓园（骨灰楼）的人流量大，建议广大...', contentLength: 95, auditTag: '新增', syncStatus: '同步中', availableStatus: '不可用', description: '这是说明这是说明', updateTime: '2024-03-25 10:00:00', operator: 'admin@VoNR' },
  { id: '002', name: '反诈提醒', content: '近期有不法分子以优惠充值为幌子，诱导客户在非正规渠道进行话费充值，实际到账话费资金来源不明...', contentLength: 92, auditTag: '编辑', syncStatus: '审核中', availableStatus: '不可用', description: '这是说明这是说明', updateTime: '2024-03-25 10:00:00', operator: 'admin@VoNR' },
  { id: '003', name: '清明节通知', content: '【广州市民政局、市应急管理局】提醒您：清明节祭扫高峰期，各墓园（骨灰楼）的人流量大，建议广大...', contentLength: 95, auditTag: '编辑', syncStatus: '审核成功', availableStatus: '可用', description: '这是说明这是说明', updateTime: '2024-03-25 10:00:00', operator: 'admin@VoNR' },
  { id: '004', name: '反诈提醒', content: '近期有不法分子以优惠充值为幌子，诱导客户在非正规渠道进行话费充值，实际到账话费资金来源不明...', contentLength: 92, auditTag: '编辑', syncStatus: '同步失败', availableStatus: '可用', description: '这是说明这是说明', updateTime: '2024-03-25 10:00:00', operator: 'admin@VoNR' },
  { id: '005', name: '清明节通知', content: '【广州市民政局、市应急管理局】提醒您：清明节祭扫高峰期，各墓园（骨灰楼）的人流量大，建议广大...', contentLength: 95, auditTag: '编辑', syncStatus: '审核成功', availableStatus: '可用', description: '这是说明这是说明', updateTime: '2024-03-25 10:00:00', operator: 'admin@VoNR' },
  { id: '006', name: '反诈提醒', content: '近期有不法分子以优惠充值为幌子，诱导客户在非正规渠道进行话费充值，实际到账话费资金来源不明...', contentLength: 92, auditTag: '编辑', syncStatus: '审核成功', availableStatus: '可用', description: '这是说明这是说明', updateTime: '2024-03-25 10:00:00', operator: 'admin@VoNR' },
  { id: '007', name: '清明节通知', content: '【广州市民政局、市应急管理局】提醒您：清明节祭扫高峰期，各墓园（骨灰楼）的人流量大，建议广大...', contentLength: 95, auditTag: '编辑', syncStatus: '审核成功', availableStatus: '可用', description: '这是说明这是说明', updateTime: '2024-03-25 10:00:00', operator: 'admin@VoNR' },
  { id: '008', name: '反诈提醒', content: '近期有不法分子以优惠充值为幌子，诱导客户在非正规渠道进行话费充值，实际到账话费资金来源不明...', contentLength: 92, auditTag: '编辑', syncStatus: '审核成功', availableStatus: '可用', description: '这是说明这是说明', updateTime: '2024-03-25 10:00:00', operator: 'admin@VoNR' },
  { id: '009', name: '清明节通知', content: '【广州市民政局、市应急管理局】提醒您：清明节祭扫高峰期，各墓园（骨灰楼）的人流量大，建议广大...', contentLength: 95, auditTag: '编辑', syncStatus: '审核成功', availableStatus: '可用', description: '这是说明这是说明', updateTime: '2024-03-25 10:00:00', operator: 'admin@VoNR' },
  { id: '010', name: '反诈提醒', content: '近期有不法分子以优惠充值为幌子，诱导客户在非正规渠道进行话费充值，实际到账话费资金来源不明...', contentLength: 92, auditTag: '编辑', syncStatus: '审核成功', availableStatus: '可用', description: '这是说明这是说明', updateTime: '2024-03-25 10:00:00', operator: 'admin@VoNR' },
]

export function useTextData() {
  const tableData = ref(generateMockData())
  const loading = ref(false)
  const total = ref(360)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const selectedRows = ref([])

  const searchForm = reactive({
    name: '',
    auditStatus: '',
    useStatus: ''
  })

  const handlePageChange = (page) => {
    currentPage.value = page
  }

  const handleSizeChange = (size) => {
    pageSize.value = size
    currentPage.value = 1
  }

  const handleSelectionChange = (selection) => {
    selectedRows.value = selection
  }

  const handleSearch = () => {
    console.log('搜索:', searchForm)
  }

  const handleReset = () => {
    searchForm.name = ''
    searchForm.auditStatus = ''
    searchForm.useStatus = ''
  }

  const handleSync = () => {
    console.log('同步素材')
  }

  const handleBatchDelete = () => {
    if (selectedRows.value.length === 0) {
      return { success: false, message: '请先选择要删除的文本素材' }
    }
    return { success: true, count: selectedRows.value.length }
  }

  return {
    tableData,
    loading,
    total,
    currentPage,
    pageSize,
    selectedRows,
    searchForm,
    handlePageChange,
    handleSizeChange,
    handleSelectionChange,
    handleSearch,
    handleReset,
    handleSync,
    handleBatchDelete
  }
}
```

- [ ] **Step 2: 验证 composable 可正常导入**

运行: 无需运行，纯 JS 文件，后续组件会导入使用

- [ ] **Step 3: 提交**

```bash
git add src/composables/useTextData.js
git commit -m "feat: add useTextData composable for text tab"
```

---

## Task 2: 创建 TextTable 组件

**Files:**
- Create: `src/components/text/TextTable.vue`

- [ ] **Step 1: 创建 TextTable 组件**

```vue
<!-- src/components/text/TextTable.vue -->
<template>
  <div class="text-table-container">
    <el-table
      ref="tableRef"
      :data="data"
      :loading="loading"
      style="width: 100%"
      height="100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50" :selectable="canSelect" />
      <el-table-column prop="id" label="编号" width="70" />
      <el-table-column prop="name" label="素材名称" min-width="150">
        <template #default="{ row }">
          <span class="material-name">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="content" label="文本内容" min-width="300" show-overflow-tooltip />
      <el-table-column prop="contentLength" label="文本长度(字)" width="120" />
      <el-table-column label="审核状态" width="180">
        <template #default="{ row }">
          <span :class="getStatusClass(row.syncStatus)">
            【{{ row.auditTag }}】{{ row.syncStatus }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="可用状态" width="80">
        <template #default="{ row }">
          <span :class="row.availableStatus === '可用' ? 'text-green' : 'text-red'">
            {{ row.availableStatus }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="素材说明" min-width="200" show-overflow-tooltip />
      <el-table-column prop="updateTime" label="操作时间" width="160" />
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button
            type="primary"
            link
            size="small"
            :disabled="row.syncStatus !== '审核失败'"
            @click="$emit('edit', row)"
          >
            编辑
          </el-button>
          <el-button
            type="danger"
            link
            size="small"
            :disabled="row.syncStatus === '同步中' || row.syncStatus === '审核中'"
            @click="$emit('delete', row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['selection-change', 'edit', 'delete'])

const tableRef = ref(null)

const getStatusClass = (status) => {
  if (status.includes('失败')) return 'text-red'
  if (status.includes('成功')) return 'text-green'
  if (status.includes('中')) return 'text-blue'
  return 'text-gray'
}

const handleSelectionChange = (selection) => {
  emit('selection-change', selection)
}

const canSelect = (row) => {
  return row.syncStatus !== '同步中' && row.syncStatus !== '审核中'
}
</script>

<style scoped lang="scss">
.text-table-container {
  width: 100%;
  flex: 1;
  overflow: hidden;

  :deep(.el-table th) {
    background-color: #f8f9fb;
    color: #333;
  }

  :deep(.el-table__body-wrapper) {
    overflow-y: auto;
  }
}

.material-name {
  color: #1d4ed8;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

.text-red {
  color: #f56c6c;
}

.text-green {
  color: #67c23a;
}

.text-blue {
  color: #409eff;
}

.text-gray {
  color: #909399;
}
</style>
```

- [ ] **Step 2: 提交**

```bash
git add src/components/text/TextTable.vue
git commit -m "feat: add TextTable component for text tab"
```

---

## Task 3: 创建 TextFormModal 组件

**Files:**
- Create: `src/components/text/TextFormModal.vue`

- [ ] **Step 1: 创建 TextFormModal 组件**

```vue
<!-- src/components/text/TextFormModal.vue -->
<template>
  <el-dialog
    :model-value="visible"
    :title="mode === 'add' ? '新增文本素材' : '编辑文本素材'"
    width="600px"
    destroy-on-close
    @update:model-value="$emit('update:visible', $event)"
  >
    <el-form label-position="left" label-width="80px">
      <!-- 素材名称 -->
      <el-form-item label="素材名称" required>
        <el-input v-model="formData.name" placeholder="请输入" />
      </el-form-item>

      <!-- 文本内容 -->
      <el-form-item label="文本内容" required>
        <div class="content-input-wrapper">
          <el-input
            v-model="formData.content"
            type="textarea"
            :rows="6"
            placeholder="请输入文本内容"
            :maxlength="maxLength"
            show-word-limit
          />
          <div class="content-stats">
            <span>字数：{{ currentLength }}/{{ maxLength }}</span>
          </div>
        </div>
      </el-form-item>

      <!-- 素材说明 -->
      <el-form-item label="素材说明">
        <el-input v-model="formData.description" type="textarea" rows="3" placeholder="请输入" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="$emit('update:visible', false)">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: { type: Boolean, default: false },
  mode: { type: String, default: 'add', validator: (v) => ['add', 'edit'].includes(v) },
  data: { type: Object, default: () => ({}) },
  maxLength: { type: Number, default: 500 }
})

const emit = defineEmits(['update:visible', 'save'])

const formData = reactive({ name: '', content: '', description: '' })

const currentLength = computed(() => {
  return formData.content ? formData.content.length : 0
})

// 监听 visible 变化，填充/重置表单
watch(() => props.visible, (val) => {
  if (val) {
    if (props.mode === 'edit' && props.data?.content) {
      // 编辑模式：回显数据
      Object.assign(formData, {
        name: props.data?.name || '',
        content: props.data?.content || '',
        description: props.data?.description || ''
      })
    } else {
      // 新增模式：重置表单
      Object.assign(formData, {
        name: '',
        content: '',
        description: ''
      })
    }
  }
})

const handleSave = () => {
  if (!formData.name) {
    ElMessage.warning('请输入素材名称')
    return
  }
  if (!formData.content) {
    ElMessage.warning('请输入文本内容')
    return
  }
  if (currentLength.value > props.maxLength) {
    ElMessage.warning(`文本内容不能超过${props.maxLength}字`)
    return
  }
  emit('save', { ...formData })
  emit('update:visible', false)
}
</script>

<style scoped lang="scss">
.content-input-wrapper {
  width: 100%;
}

.content-stats {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  text-align: right;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}

:deep(.el-button--primary) {
  --el-button-bg-color: #1d4ed8;
}
</style>
```

- [ ] **Step 2: 提交**

```bash
git add src/components/text/TextFormModal.vue
git commit -m "feat: add TextFormModal component for text tab"
```

---

## Task 4: 创建 TextTab 主组件

**Files:**
- Create: `src/components/text/TextTab.vue`

- [ ] **Step 1: 创建 TextTab 组件**

```vue
<!-- src/components/text/TextTab.vue -->
<template>
  <div class="text-tab">
    <TextTable
      :data="tableData"
      :loading="loading"
      @selection-change="handleSelectionChange"
      @edit="handleEdit"
      @delete="handleDeleteClick"
    />

    <div class="pagination-wrapper">
      <UnifiedPagination
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>

    <TextFormModal
      v-model:visible="formModalVisible"
      :mode="formModalMode"
      :data="currentRow"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import TextTable from './TextTable.vue'
import TextFormModal from './TextFormModal.vue'
import UnifiedPagination from '@/components/common/UnifiedPagination.vue'
import { useTextData } from '@/composables/useTextData'

const {
  tableData,
  loading,
  total,
  currentPage,
  pageSize,
  selectedRows,
  handlePageChange,
  handleSizeChange,
  handleSelectionChange
} = useTextData()

const formModalVisible = ref(false)
const formModalMode = ref('add')
const currentRow = ref(null)

const handleEdit = (row) => {
  currentRow.value = row
  formModalMode.value = 'edit'
  formModalVisible.value = true
}

const handleDeleteClick = (row) => {
  if (row.syncStatus === '同步中' || row.syncStatus === '审核中') {
    ElMessage.warning('同步中或审核中的素材不能删除')
    return
  }

  ElMessageBox.confirm(
    '是否删除此文本素材？',
    '删除确认',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('删除成功')
    console.log('删除:', row)
  }).catch(() => {})
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的文本素材')
    return
  }

  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedRows.value.length} 个文本素材吗？`,
    '批量删除确认',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success(`成功删除 ${selectedRows.value.length} 个文本素材`)
    selectedRows.value = []
  }).catch(() => {})
}

const handleSave = (data) => {
  ElMessage.success('保存成功')
  console.log('保存:', data)
}

defineExpose({
  handleBatchDelete
})
</script>

<style scoped>
.text-tab {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  padding: 0 20px 20px;
  box-sizing: border-box;
}

.pagination-wrapper {
  flex-shrink: 0;
  padding-top: 16px;
}
</style>
```

- [ ] **Step 2: 提交**

```bash
git add src/components/text/TextTab.vue
git commit -m "feat: add TextTab main component"
```

---

## Task 5: 集成到 Overview.vue

**Files:**
- Modify: `src/views/Overview.vue`

- [ ] **Step 1: 添加 TextTab 导入**

在 `src/views/Overview.vue` 的 `<script setup>` 部分，添加 TextTab 导入（约第 180 行，在 VideoTab 导入下方）：

```javascript
import TextTab from '@/components/text/TextTab.vue'
```

- [ ] **Step 2: 添加 textTabRef 引用**

在 `src/views/Overview.vue` 的 `<script setup>` 部分，添加 textTabRef（约第 186 行，在 videoTabRef 下方）：

```javascript
const textTabRef = ref(null)
```

- [ ] **Step 3: 添加 TextTab 组件到模板**

在 `src/views/Overview.vue` 的 `<template>` 部分，在 VideoTab 下方添加 TextTab（约第 92 行）：

```vue
<!-- 文本 Tab -->
<TextTab v-if="currentTab === '文本'" ref="textTabRef" />
```

- [ ] **Step 4: 修改 handleBatchDelete 函数**

在 `src/views/Overview.vue` 的 `<script setup>` 部分，修改 handleBatchDelete 函数（约第 273 行），添加文本 tab 的处理：

```javascript
const handleBatchDelete = () => {
  if (currentTab.value === '音频') {
    audioTabRef.value?.handleBatchDelete()
  } else if (currentTab.value === '视频') {
    videoTabRef.value?.handleBatchDelete()
  } else if (currentTab.value === '文本') {
    textTabRef.value?.handleBatchDelete()
  } else {
    ElMessage.info('该功能开发中')
  }
}
```

- [ ] **Step 5: 提交**

```bash
git add src/views/Overview.vue
git commit -m "feat: integrate TextTab into Overview page"
```

---

## Task 6: 验证功能

- [ ] **Step 1: 启动开发服务器**

```bash
npm run dev
```

- [ ] **Step 2: 测试文本 Tab 功能**

1. 访问素材库列表页面
2. 点击"文本" tab
3. 验证表格显示 10 条 mock 数据
4. 测试搜索筛选功能
5. 测试新增按钮，打开表单弹窗
6. 测试编辑按钮（仅审核失败状态可点击）
7. 测试删除按钮（同步中/审核中状态禁用）
8. 测试批量删除功能
9. 验证分页功能

- [ ] **Step 3: 提交最终代码**

```bash
git add .
git commit -m "feat: complete text tab implementation"
```

---

## 自检清单

- [ ] 所有组件创建完成
- [ ] 数据逻辑 composable 正常工作
- [ ] Overview.vue 正确集成 TextTab
- [ ] 表格列显示正确
- [ ] 审核状态样式正确
- [ ] 表单弹窗功能正常
- [ ] 字数限制和统计功能正常
- [ ] 分页功能正常
- [ ] 批量删除功能正常
