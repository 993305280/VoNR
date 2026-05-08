<template>
  <el-dialog
    :model-value="visible"
    :title="mode === 'add' ? '新增视频素材' : '编辑视频素材'"
    width="600px"
    destroy-on-close
    @update:model-value="$emit('update:visible', $event)"
  >
    <el-form label-position="left" label-width="80px">
      <!-- 素材名称 -->
      <el-form-item label="素材名称" required>
        <el-input v-model="formData.name" placeholder="请输入" />
      </el-form-item>

      <!-- 上传素材 -->
      <el-form-item label="上传素材" required>
        <div class="upload-section">
          <!-- 上传按钮 -->
          <div class="upload-row">
            <el-upload
              ref="uploadRef"
              :auto-upload="false"
              :show-file-list="false"
              accept=".mp4,.avi,.mov,.mkv"
              :on-change="handleFileChange"
              :before-upload="beforeUpload"
            >
              <el-button type="primary" :icon="Upload">点击上传</el-button>
            </el-upload>
            <span class="upload-hint">
              请上传小于500MB的视频，支持mp4、avi、mov、mkv格式
            </span>
          </div>

          <!-- 上传进度 -->
          <el-progress
            v-if="uploadProgress > 0 && uploadProgress < 100"
            :percentage="uploadProgress"
            :stroke-width="8"
            class="upload-progress"
          />

          <!-- 已上传文件信息 -->
          <div v-if="fileInfo && formData.url" class="file-info">
            <div class="file-info-left">
              <el-icon class="file-icon"><Document /></el-icon>
              <span class="file-name">{{ fileInfo.name }}</span>
              <span class="file-size">{{ fileInfo.size }}</span>
            </div>
            <el-button
              type="danger"
              link
              size="small"
              :icon="Delete"
              @click="handleRemoveFile"
            >
              删除
            </el-button>
          </div>

          <!-- 视频预览 -->
          <div class="video-preview">
            <video
              v-if="formData.url"
              :src="formData.url"
              controls
              class="preview-video"
            />
            <div v-else class="preview-placeholder">
              视频预览区域
            </div>
          </div>
        </div>
      </el-form-item>

      <!-- 素材说明 -->
      <el-form-item label="素材说明">
        <el-input v-model="formData.description" type="textarea" rows="4" placeholder="请输入" />
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
import { ref, reactive, watch, onBeforeUnmount } from 'vue'
import { Upload, Delete, Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: { type: Boolean, default: false },
  mode: { type: String, default: 'add', validator: (v) => ['add', 'edit'].includes(v) },
  data: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:visible', 'save'])

const formData = reactive({ name: '', url: '', description: '' })
const currentBlobUrl = ref(null)
const uploadRef = ref(null)
const uploadProgress = ref(0)
const fileInfo = ref(null)

// 监听 visible 变化，填充/重置表单
watch(() => props.visible, (val) => {
  if (val) {
    // 重置状态
    uploadProgress.value = 0
    fileInfo.value = null

    if (props.mode === 'edit' && props.data?.url) {
      // 编辑模式：回显已上传文件
      Object.assign(formData, {
        name: props.data?.name || '',
        url: props.data?.url || '',
        description: props.data?.description || ''
      })
      fileInfo.value = {
        name: props.data?.name || '视频文件',
        size: props.data?.size || '未知',
        format: props.data?.format || 'mp4'
      }
    } else {
      // 新增模式：重置表单
      Object.assign(formData, {
        name: '',
        url: '',
        description: ''
      })
    }
  }
})

// 清理 blob URL
onBeforeUnmount(() => {
  if (currentBlobUrl.value) {
    URL.revokeObjectURL(currentBlobUrl.value)
  }
})

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

// 上传前校验
const beforeUpload = (file) => {
  const isVideo = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-matroska'].includes(file.type)
  if (!isVideo) {
    ElMessage.error('只能上传视频文件')
    return false
  }
  const isLt500M = file.size / 1024 / 1024 < 500
  if (!isLt500M) {
    ElMessage.error('视频文件大小不能超过 500MB')
    return false
  }
  return true
}

const handleFileChange = (file) => {
  if (!beforeUpload(file.raw)) return

  // 撤销旧的 blob URL
  if (currentBlobUrl.value) {
    URL.revokeObjectURL(currentBlobUrl.value)
  }

  // 模拟上传进度
  uploadProgress.value = 0
  const timer = setInterval(() => {
    uploadProgress.value += 10
    if (uploadProgress.value >= 100) {
      clearInterval(timer)
      // 创建新的 blob URL
      currentBlobUrl.value = URL.createObjectURL(file.raw)
      formData.url = currentBlobUrl.value
      fileInfo.value = {
        name: file.name,
        size: formatFileSize(file.size),
        format: file.name.split('.').pop()
      }
    }
  }, 50)
}

const handleRemoveFile = () => {
  if (currentBlobUrl.value) {
    URL.revokeObjectURL(currentBlobUrl.value)
    currentBlobUrl.value = null
  }
  formData.url = ''
  fileInfo.value = null
  uploadProgress.value = 0
}

const handleSave = () => {
  if (!formData.name) {
    ElMessage.warning('请输入素材名称')
    return
  }
  if (!formData.url) {
    ElMessage.warning('请上传视频素材')
    return
  }
  emit('save', { ...formData })
  emit('update:visible', false)
}
</script>

<style scoped lang="scss">
.upload-section {
  width: 100%;
}

.upload-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.upload-hint {
  font-size: 12px;
  color: #a8abb2;
}

.upload-progress {
  margin-top: 12px;
}

.file-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding: 10px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.file-info-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-icon {
  color: #909399;
  font-size: 18px;
}

.file-name {
  color: #333;
  font-size: 14px;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  color: #909399;
  font-size: 12px;
}

.video-preview {
  margin-top: 16px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
}

.preview-video {
  width: 100%;
  max-height: 300px;
  border-radius: 4px;
}

.preview-placeholder {
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
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
