<template>
  <el-dialog
    :model-value="visible"
    :title="isEdit ? '编辑应用' : '新增应用'"
    width="600px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      label-position="left"
    >
      <el-form-item label="应用名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入应用名称"
          clearable
        />
      </el-form-item>

      <el-form-item label="业务场景" prop="businessScene">
        <el-select
          v-model="formData.businessScene"
          placeholder="请选择业务场景"
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="scene in businessScenes"
            :key="scene.value"
            :label="scene.label"
            :value="scene.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="子业务场景" prop="subScenes" required>
        <div class="sub-scenes-container">
          <div
            v-for="scene in subSceneOptions"
            :key="scene.code"
            class="sub-scene-item"
            :class="{ 'is-selected': isSelected(scene.code) }"
            @click="toggleSubScene(scene.code)"
          >
            <span class="scene-name">{{ scene.name }}</span>
            <el-icon v-if="isSelected(scene.code)" class="check-icon">
              <Check />
            </el-icon>
          </div>
        </div>
        <div v-if="subSceneError" class="error-text">{{ subSceneError }}</div>
      </el-form-item>

      <el-form-item label="应用说明" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="4"
          placeholder="请输入应用说明"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Check } from '@element-plus/icons-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  editData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'save'])

const formRef = ref(null)
const subSceneError = ref('')

const formData = reactive({
  name: '',
  businessScene: '',
  subScenes: [],
  description: ''
})

const businessScenes = [
  { label: '基础场景', value: '基础场景' },
  { label: '娱乐场景', value: '娱乐场景' },
  { label: '教育场景', value: '教育场景' },
  { label: '医疗场景', value: '医疗场景' }
]

const subSceneOptions = [
  { code: '001001', name: '虚拟背景' },
  { code: '001002', name: '虚拟头像' },
  { code: '001003', name: '通话特效' },
  { code: '001004', name: '美颜滤镜' },
  { code: '001005', name: '背景音乐' },
  { code: '001006', name: '贴纸特效' }
]

const rules = {
  name: [
    { required: true, message: '请输入应用名称', trigger: 'blur' }
  ],
  businessScene: [
    { required: true, message: '请选择业务场景', trigger: 'change' }
  ],
  description: []
}

const isSelected = (code) => {
  return formData.subScenes.some(item => item.code === code)
}

const toggleSubScene = (code) => {
  const index = formData.subScenes.findIndex(item => item.code === code)
  if (index > -1) {
    formData.subScenes.splice(index, 1)
  } else {
    const scene = subSceneOptions.find(s => s.code === code)
    if (scene) {
      formData.subScenes.push({ code: scene.code, name: scene.name })
    }
  }
  if (formData.subScenes.length > 0) {
    subSceneError.value = ''
  }
}

const validateSubScenes = () => {
  if (formData.subScenes.length === 0) {
    subSceneError.value = '请至少选择一个子业务场景'
    return false
  }
  subSceneError.value = ''
  return true
}

const handleClose = () => {
  resetForm()
  emit('update:visible', false)
}

const handleSave = async () => {
  if (!validateSubScenes()) {
    return
  }

  try {
    await formRef.value.validate()
    emit('save', { ...formData })
    resetForm()
    ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const resetForm = () => {
  formData.name = ''
  formData.businessScene = ''
  formData.subScenes = []
  formData.description = ''
  subSceneError.value = ''
  formRef.value?.clearValidate()
}

watch(() => props.visible, (newVal) => {
  if (newVal && props.isEdit && props.editData) {
    formData.name = props.editData.name || ''
    formData.businessScene = props.editData.businessScene || ''
    formData.subScenes = props.editData.subScenes ? [...props.editData.subScenes] : []
    formData.description = props.editData.description || ''
  } else if (newVal) {
    resetForm()
  }
})
</script>

<style scoped>
.sub-scenes-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
}

.sub-scene-item {
  position: relative;
  padding: 10px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background-color: #ffffff;
  cursor: pointer;
  transition: all 0.3s;
  user-select: none;
}

.sub-scene-item:hover {
  border-color: #3b82f6;
}

.sub-scene-item.is-selected {
  background-color: #e6f7ff;
  border-color: #3b82f6;
  color: #3b82f6;
}

.scene-name {
  font-size: 14px;
}

.check-icon {
  position: absolute;
  top: 2px;
  right: 4px;
  font-size: 14px;
  color: #3b82f6;
}

.error-text {
  color: #f5222d;
  font-size: 12px;
  margin-top: 4px;
}
</style>
