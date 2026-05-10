<template>
  <el-dialog v-model="visible" :title="isBatch ? '批量删除业务配置' : '删除业务配置'" width="400px" center>
    <div class="confirm-content">
      {{ isBatch ? '是否删除所有选业务配置？' : '是否删除此业务配置？' }}
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false" class="btn-cancel">取消</el-button>
        <el-button type="primary" @click="confirm" class="btn-delete">删除</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['confirm'])

const visible = ref(false)
const isBatch = ref(false)

const open = (batch = false) => {
  isBatch.value = batch
  visible.value = true
}

const close = () => {
  visible.value = false
}

const confirm = () => {
  emit('confirm', isBatch.value)
}

// 暴露方法给父组件
defineExpose({
  open,
  close
})
</script>

<style lang="scss" scoped>
.confirm-content {
  text-align: center;
  padding: 30px 0;
  font-size: 15px;
}
.btn-delete { background-color: #4079de; border: none; }
</style>