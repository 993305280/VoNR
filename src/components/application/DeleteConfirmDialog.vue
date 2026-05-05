<template>
  <el-dialog
    :model-value="modelValue"
    :title="isBatch ? '批量删除应用' : '删除应用'"
    :width="480"
    @update:model-value="handleClose"
    :close-on-click-modal="false"
  >
    <div class="delete-dialog-content">
      <div class="confirm-text">{{ isBatch ? '是否删除所选应用？' : '是否删除此应用？' }}</div>
      <div class="warning-text">删除后，关联此应用的业务配置信息将一并删除，请谨慎操作！</div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm">删除</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  isBatch: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleConfirm = () => {
  emit('confirm')
}
</script>

<style scoped>
.delete-dialog-content {
  padding: 20px 0;
}

.confirm-text {
  font-size: 14px;
  color: #262626;
  line-height: 22px;
  margin-bottom: 12px;
}

.warning-text {
  font-size: 14px;
  color: #f5222d;
  line-height: 22px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-footer .el-button {
  min-width: 72px;
}
</style>
