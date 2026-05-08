<template>
  <el-dialog
    :model-value="visible"
    title="送审内容"
    width="600px"
    destroy-on-close
    @update:model-value="$emit('update:visible', $event)"
  >
    <div class="detail-content" v-if="data">
      <div class="info-row">
        <span class="label">编号</span>
        <span class="value">{{ data.id }}</span>
      </div>
      <div class="info-row">
        <span class="label">素材名称</span>
        <span class="value">{{ data.name }}</span>
      </div>

      <div class="video-section">
        <span class="label">素材</span>
        <div class="video-wrapper">
          <div class="thumbnail-container">
            <img :src="data.thumbnail" class="thumbnail" alt="" />
            <span class="duration">{{ data.duration }}</span>
          </div>
        </div>
      </div>

      <div class="info-row">
        <span class="label">分辨率</span>
        <span class="value">{{ data.resolution }}</span>
      </div>
      <div class="info-row">
        <span class="label">码率</span>
        <span class="value">{{ data.bitrate }}</span>
      </div>
      <div class="info-row">
        <span class="label">文件格式</span>
        <span class="value">{{ data.format }}</span>
      </div>
      <div class="info-row">
        <span class="label">文件大小</span>
        <span class="value">{{ data.size }}</span>
      </div>
      <div class="info-row">
        <span class="label">素材说明</span>
        <span class="value">{{ data.description || '--' }}</span>
      </div>
      <div class="info-row">
        <span class="label">操作时间</span>
        <span class="value">{{ data.updateTime }}</span>
      </div>
    </div>

    <template #footer>
      <el-button @click="$emit('update:visible', false)">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  data: { type: Object, default: () => ({}) }
})

defineEmits(['update:visible'])
</script>

<style scoped>
.detail-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-row {
  display: flex;
  font-size: 14px;
  line-height: 1.6;
}

.label {
  width: 80px;
  color: #909399;
  flex-shrink: 0;
}

.value {
  color: #333;
}

.video-section {
  display: flex;
  align-items: flex-start;
  gap: 0;
}

.video-section .label {
  width: 80px;
  color: #909399;
  flex-shrink: 0;
  padding-top: 8px;
}

.video-wrapper {
  flex: 1;
}

.thumbnail-container {
  position: relative;
  width: 200px;
  height: 112px;
  border-radius: 4px;
  overflow: hidden;
  background: #000;

  .thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .duration {
    position: absolute;
    bottom: 4px;
    right: 4px;
    padding: 2px 6px;
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    font-size: 12px;
    border-radius: 2px;
  }
}
</style>
