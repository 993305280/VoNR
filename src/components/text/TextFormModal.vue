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
