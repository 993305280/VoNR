<template>
  <el-dialog
    :model-value="visible"
    :title="mode === 'add' ? '新增音频素材' : '编辑音频素材'"
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
          <el-upload
            :auto-upload="false"
            :show-file-list="false"
            accept=".mp3,.wav,.aac,.m4a"
            :on-change="handleFileChange"
          >
            <el-button type="primary" :icon="Upload">点击上传</el-button>
          </el-upload>
          <span class="upload-hint">
            请上传时长小于30分钟的音频，支持主流的音频格式
          </span>

          <div class="audio-preview">
            <AudioWavePlayer
              v-if="formData.url"
              :src="formData.url"
              :height="80"
              :show-controls="true"
            />
            <div v-else class="preview-placeholder">
              音频预览区域
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
import { Upload } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import AudioWavePlayer from './AudioWavePlayer.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  mode: { type: String, default: 'add', validator: (v) => ['add', 'edit'].includes(v) },
  data: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:visible', 'save'])

const formData = reactive({ name: '', url: '', description: '' })
const currentBlobUrl = ref(null)

// 监听 visible 变化，填充/重置表单
watch(() => props.visible, (val) => {
  if (val) {
    Object.assign(formData, {
      name: props.data?.name || '',
      url: props.data?.url || '',
      description: props.data?.description || ''
    })
  }
})

// 清理 blob URL
onBeforeUnmount(() => {
  if (currentBlobUrl.value) {
    URL.revokeObjectURL(currentBlobUrl.value)
  }
})

const handleFileChange = (file) => {
  // 撤销旧的 blob URL
  if (currentBlobUrl.value) {
    URL.revokeObjectURL(currentBlobUrl.value)
  }
  // 创建新的 blob URL
  currentBlobUrl.value = URL.createObjectURL(file.raw)
  formData.url = currentBlobUrl.value
}

const handleSave = () => {
  if (!formData.name) {
    ElMessage.warning('请输入素材名称')
    return
  }
  if (!formData.url) {
    ElMessage.warning('请上传音频素材')
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

.upload-hint {
  font-size: 12px;
  color: #a8abb2;
  margin-left: 12px;
}

.audio-preview {
  margin-top: 16px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
}

.preview-placeholder {
  height: 80px;
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
