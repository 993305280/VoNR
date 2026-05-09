<template>
  <el-dialog
    :model-value="visible"
    :title="mode === 'add' ? '新增图片素材' : '编辑图片素材'"
    width="560px"
    destroy-on-close
    @update:model-value="$emit('update:visible', $event)"
  >
    <el-form label-position="left" label-width="80px">
      <el-form-item label="素材名称" required>
        <el-input v-model="formData.name" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="上传素材" required>
        <div class="upload-area">
          <el-upload
            v-if="!formData.previewUrl"
            class="upload-uploader"
            :auto-upload="false"
            :show-file-list="false"
            accept=".png,.jpg,.jpeg"
            :on-change="handleImageChange"
          >
            <div class="upload-placeholder">
              <el-icon><Plus /></el-icon>
              <p>点击上传</p>
            </div>
          </el-upload>
          <div v-else class="preview-wrapper">
            <img :src="formData.previewUrl" class="preview-img-form" />
            <el-button
              class="delete-btn"
              type="danger"
              :icon="Delete"
              circle
              size="small"
              @click="handleRemoveImage"
            />
          </div>
          <span class="upload-hint">请上传文件大小不超过10M的图片，仅支持png/jpg格式</span>
        </div>
      </el-form-item>
      <el-form-item label="素材说明">
        <el-input v-model="formData.description" type="textarea" rows="4" placeholder="请输入" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="$emit('update:visible', false)">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleConfirm">
          {{ submitting ? '保存中...' : '保存' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { createImage, updateImage } from '@/api/image'

const props = defineProps({
  visible: { type: Boolean, default: false },
  mode: { type: String, default: 'add' },
  data: { type: Object, default: null }
})

const emit = defineEmits(['update:visible', 'success'])

const submitting = ref(false)
const currentFile = ref(null)

const formData = reactive({
  name: '',
  description: '',
  previewUrl: ''
})

watch(() => props.visible, (val) => {
  if (val) {
    if (props.mode === 'edit' && props.data) {
      formData.name = props.data.name
      formData.description = props.data.description
      formData.previewUrl = props.data.filePath
    } else {
      formData.name = ''
      formData.description = ''
      formData.previewUrl = ''
    }
    currentFile.value = null
  }
})

const handleImageChange = (file) => {
  const isImage = ['image/png', 'image/jpeg'].includes(file.raw.type)
  if (!isImage) {
    ElMessage.error('只能上传 png/jpg 格式的图片')
    return
  }
  const isLt10M = file.raw.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB')
    return
  }

  currentFile.value = file.raw
  formData.previewUrl = URL.createObjectURL(file.raw)
}

const handleRemoveImage = () => {
  if (formData.previewUrl && formData.previewUrl.startsWith('blob:')) {
    URL.revokeObjectURL(formData.previewUrl)
  }
  formData.previewUrl = ''
  currentFile.value = null
}

const handleConfirm = async () => {
  if (!formData.name) {
    ElMessage.warning('请输入素材名称')
    return
  }
  if (props.mode === 'add' && !currentFile.value) {
    ElMessage.warning('请上传图片')
    return
  }

  submitting.value = true
  try {
    const submitData = new FormData()
    submitData.append('name', formData.name)
    submitData.append('description', formData.description)
    if (currentFile.value) {
      submitData.append('file', currentFile.value)
    }

    if (props.mode === 'edit') {
      await updateImage(props.data.id, submitData)
      ElMessage.success('更新成功')
    } else {
      await createImage(submitData)
      ElMessage.success('上传成功')
    }

    emit('update:visible', false)
    emit('success')
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.upload-area {
  width: 100%;
}

.upload-uploader {
  :deep(.el-upload) {
    border: 1px dashed #dcdfe6;
    border-radius: 6px;
    cursor: pointer;
    transition: border-color 0.2s;

    &:hover {
      border-color: #1d4ed8;
    }
  }
}

.upload-placeholder {
  width: 120px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 12px;

  .el-icon {
    font-size: 28px;
    margin-bottom: 8px;
  }
}

.preview-wrapper {
  position: relative;
  display: inline-block;

  .delete-btn {
    position: absolute;
    top: -8px;
    right: -8px;
  }
}

.preview-img-form {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
  display: block;
}

.upload-hint {
  font-size: 12px;
  color: #a8abb2;
  display: block;
  margin-top: 8px;
}
</style>
