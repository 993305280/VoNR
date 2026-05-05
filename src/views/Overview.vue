<template>
  <div class="material-manager">
    <div class="tabs-header">
      <div 
        v-for="tab in ['图片', '音频', '视频', '文本']" 
        :key="tab" 
        :class="['tab-item', { active: currentTab === tab }]"
        @click="currentTab = tab"
      >
        {{ tab }}
      </div>
    </div>

    <div class="filter-bar">
      <el-form :inline="true" :model="searchForm" size="default">
        <el-form-item label="素材名称">
          <el-input v-model="searchForm.name" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="searchForm.auditStatus" placeholder="全部状态" style="width: 150px">
            <el-option label="审核中" value="1" />
            <el-option label="审核成功" value="2" />
            <el-option label="审核失败" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="可用状态">
          <el-select v-model="searchForm.useStatus" placeholder="全部状态" style="width: 150px">
            <el-option label="可用" value="1" />
            <el-option label="不可用" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" color="#1d4ed8">查询</el-button>
          <el-button plain>重置</el-button>
        </el-form-item>
      </el-form>

      <div class="action-buttons">
        <el-button color="#1d4ed8" @click="handleSync">同步素材</el-button>
        <el-button type="primary" icon="Plus" @click="openModal('add')">新增素材</el-button>
        <el-button type="danger" plain @click="handleBatchDelete">批量删除</el-button>
      </div>
    </div>

    <div class="table-container">
      <el-table :data="tableData" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="编号" width="80" />
        <el-table-column label="素材名称" min-width="200">
          <template #default="scope">
            <div class="material-info" @click="openModal('preview', scope.row)">
              <el-image :src="scope.row.url" class="thumbnail-img" fit="cover" />
              <span class="material-name">{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="resolution" label="分辨率" width="120" />
        <el-table-column prop="format" label="文件格式" width="100" />
        <el-table-column prop="size" label="文件大小" width="100" />
        <el-table-column label="审核状态" width="150">
          <template #default="scope">
            <span :class="['status-tag', getAuditClass(scope.row.auditStatus)]">
              【{{ scope.row.auditType }}】{{ scope.row.auditStatus }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="可用状态" width="100">
          <template #default="scope">
            <span :class="scope.row.available ? 'text-gray' : 'text-red'">
              {{ scope.row.available ? '可用' : '不可用' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="desc" label="素材说明" show-overflow-tooltip />
        <el-table-column prop="time" label="操作时间" width="180" />
        <el-table-column prop="operator" label="操作者" width="150" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="openModal('edit', scope.row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          layout="total, prev, pager, next, jumper, sizes"
          :total="360"
          :page-sizes="[10, 20, 50]"
          v-model:current-page="currentPage"
        />
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      :width="dialogMode === 'delete' ? '400px' : '560px'"
      destroy-on-close
    >
      <el-form v-if="['add', 'edit'].includes(dialogMode)" label-position="left" label-width="80px">
        <el-form-item label="素材名称" required>
          <el-input v-model="formData.name" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="上传素材" required>
          <div class="upload-area">
            <div v-if="!formData.url" class="upload-placeholder">
              <el-icon><Plus /></el-icon>
              <p>点击上传</p>
            </div>
            <img v-else :src="formData.url" class="preview-img-form" />
            <span class="upload-hint">请上传文件大小不超过10M的图片，仅支持png格式</span>
          </div>
        </el-form-item>
        <el-form-item label="素材说明">
          <el-input v-model="formData.desc" type="textarea" rows="4" placeholder="请输入" />
        </el-form-item>
      </el-form>

      <div v-else-if="dialogMode === 'preview'" class="detail-preview">
        <div class="preview-content">
          <img :src="formData.url" class="full-preview-img" />
        </div>
        <div class="preview-info-list">
          <div class="info-item"><span>编号</span> {{ formData.id }}</div>
          <div class="info-item"><span>素材名称</span> {{ formData.name }}</div>
          <div class="info-item"><span>分辨率</span> {{ formData.resolution }}</div>
          <div class="info-item"><span>文件格式</span> {{ formData.format }}</div>
          <div class="info-item"><span>文件大小</span> {{ formData.size }}</div>
          <div class="info-item"><span>素材说明</span> {{ formData.desc }}</div>
          <div class="info-item"><span>操作时间</span> {{ formData.time }}</div>
          <div class="info-item"><span>操作者</span> {{ formData.operator }}</div>
        </div>
      </div>

      <div v-else-if="dialogMode === 'delete'" class="delete-confirm">
        <p class="delete-text">是否删除此图片素材？</p>
        <p class="delete-warning">删除后，关联此图片素材的业务场景将无法使用此图片素材，请谨慎操作！</p>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button 
            :type="dialogMode === 'delete' ? 'danger' : 'primary'" 
            @click="handleConfirm"
          >
            {{ dialogMode === 'delete' ? '删除' : '保存' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

const currentTab = ref('图片')
const currentPage = ref(1)
const dialogVisible = ref(false)
const dialogMode = ref('add') // add, edit, preview, delete

const searchForm = reactive({
  name: '',
  auditStatus: '',
  useStatus: ''
})

const formData = reactive({
  id: '',
  name: '',
  url: '',
  desc: '',
  resolution: '',
  format: '',
  size: '',
  time: '',
  operator: ''
})

// 模拟数据
const tableData = ref([
  { id: '001', name: '亚太银行数字化大会', resolution: '1920 × 1080', format: 'png', size: '1.02 M', auditType: '新增', auditStatus: '审核中', available: false, desc: '这是说明这是说明', time: '2024-03-25 10:00:00', operator: 'admin@VoNR', url: 'https://picsum.photos/200/120' },
  { id: '002', name: '端午节活动图片', resolution: '512 × 512', format: 'png', size: '980 KB', auditType: '新增', auditStatus: '审核失败', available: false, desc: '这是说明这是说明这里...', time: '2024-03-25 10:00:00', operator: 'admin@VoNR', url: 'https://picsum.photos/120/120' },
  { id: '003', name: '亚太银行数字化大会', resolution: '1000 × 654', format: 'png', size: '1.02 M', auditType: '删除', auditStatus: '审核成功', available: false, desc: '这是说明这是说明', time: '2024-03-25 10:00:00', operator: 'admin@VoNR', url: 'https://picsum.photos/200/150' },
  { id: '004', name: '端午节活动图片', resolution: '512 × 512', format: 'png', size: '980 KB', auditType: '编辑', auditStatus: '审核中', available: true, desc: '这是说明这是说明这里...', time: '2024-03-25 10:00:00', operator: 'admin@VoNR', url: 'https://picsum.photos/120/120' },
  { id: '005', name: '亚太银行数字化大会', resolution: '1920 × 1080', format: 'png', size: '1.02 M', auditType: '编辑', auditStatus: '同步成功', available: true, desc: '这是说明这是说明', time: '2024-03-25 10:00:00', operator: 'admin@VoNR', url: 'https://picsum.photos/200/120' },
  { id: '006', name: '端午节活动图片', resolution: '512 × 512', format: 'png', size: '980 KB', auditType: '编辑', auditStatus: '同步失败', available: true, desc: '这是说明这是说明这里...', time: '2024-03-25 10:00:00', operator: 'admin@VoNR', url: 'https://picsum.photos/120/120' },
])

const dialogTitle = computed(() => {
  const titles = { add: '新增图片素材', edit: '编辑图片素材', preview: '送审内容', delete: '删除图片素材' }
  return titles[dialogMode.value]
})

const getAuditClass = (status) => {
  if (status.includes('失败')) return 'text-red'
  if (status.includes('成功')) return 'text-green'
  return 'text-gray'
}

const openModal = (mode, row = null) => {
  dialogMode.value = mode
  if (row) {
    Object.assign(formData, row)
  } else {
    // 重置表单
    Object.keys(formData).forEach(key => formData[key] = '')
  }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  Object.assign(formData, row)
  openModal('delete')
}

const handleConfirm = () => {
  // 处理各种逻辑
  console.log('Action Confirmed:', dialogMode.value)
  dialogVisible.value = false
}
</script>

<style scoped>
/* 容器布局 */
.material-manager {
  /* padding: 20px; */
  background-color: #f5f7fa;
  height: 100%;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}

/* 顶部标签 */
.tabs-header {
  display: flex;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 20px;
}
.tab-item {
  padding: 10px 25px;
  cursor: pointer;
  color: #606266;
  font-size: 14px;
  /* transition: all 0.1s; */
}
.tab-item.active {
  color: #1d4ed8;
  font-weight: bold;
  border-bottom: 2px solid #1d4ed8;
}

/* 过滤栏 */
.filter-bar {
  background: #fff;
  padding: 20px 20px 0;
  border-radius: 4px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

/* 表格样式 */
.table-container {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}
.material-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}
.thumbnail-img {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  flex-shrink: 0;
}
.material-name {
  color: #1d4ed8;
  text-decoration: none;
}

/* 状态颜色 */
.status-tag { font-size: 13px; }
.text-red { color: #f56c6c; }
.text-green { color: #67c23a; }
.text-gray { color: #909399; }

/* 分页 */
.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 弹窗内部样式 */
.upload-area {
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  padding: 15px;
  text-align: center;
  background: #fafafa;
}
.upload-placeholder {
  color: #909399;
  font-size: 12px;
}
.preview-img-form {
  width: 120px;
  height: 120px;
  object-fit: cover;
}
.upload-hint {
  font-size: 12px;
  color: #a8abb2;
  display: block;
  margin-top: 8px;
}

/* 详情预览样式 */
.detail-preview {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.preview-content {
  background: #333;
  padding: 20px;
  display: flex;
  justify-content: center;
  border-radius: 4px;
}
.full-preview-img {
  max-width: 100%;
  max-height: 400px;
}
.preview-info-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}
.info-item {
  display: flex;
  font-size: 14px;
}
.info-item span {
  width: 80px;
  color: #909399;
  flex-shrink: 0;
}

/* 删除警告样式 */
.delete-confirm {
  text-align: center;
  padding: 20px 0;
}
.delete-text {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
}
.delete-warning {
  font-size: 14px;
  color: #f56c6c;
  line-height: 1.6;
}

/* 深度覆盖 Element Plus */
:deep(.el-table th) {
  background-color: #f8f9fb;
  color: #333;
}
:deep(.el-button--primary) {
  --el-button-bg-color: #1d4ed8;
}
</style>