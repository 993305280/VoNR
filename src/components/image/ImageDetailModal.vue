<template>
  <el-dialog
    :model-value="visible"
    title="送审内容"
    width="560px"
    destroy-on-close
    @update:model-value="$emit('update:visible', $event)"
  >
    <div class="detail-preview" v-if="data">
      <div class="preview-content">
        <img :src="data.filePath" class="full-preview-img" />
      </div>
      <div class="preview-info-list">
        <div class="info-item"><span>编号</span> {{ data.id }}</div>
        <div class="info-item"><span>素材名称</span> {{ data.name }}</div>
        <div class="info-item"><span>分辨率</span> {{ data.resolution }}</div>
        <div class="info-item"><span>文件格式</span> {{ data.format }}</div>
        <div class="info-item"><span>文件大小</span> {{ data.fileSizeFormatted }}</div>
        <div class="info-item"><span>素材说明</span> {{ data.description }}</div>
        <div class="info-item"><span>操作时间</span> {{ formatDate(data.createdAt) }}</div>
        <div class="info-item"><span>操作者</span> {{ data.operator }}</div>
      </div>
    </div>

    <template #footer>
      <el-button @click="$emit('update:visible', false)">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
const props = defineProps({
  visible: { type: Boolean, default: false },
  data: { type: Object, default: null }
})

defineEmits(['update:visible'])

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}
</script>

<style scoped>
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
</style>
