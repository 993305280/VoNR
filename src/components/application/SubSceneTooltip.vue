<template>
  <div class="sub-scene-wrapper">
    <span class="scene-text">{{ displayText }}</span>
    <CustomTooltip v-if="scenes.length > 1" placement="top" :show-after="200">
      <template #content>
        <div class="tooltip-content">
          <div v-for="scene in scenes" :key="scene.code" class="scene-item">
            <span class="scene-code">{{ scene.code }}</span>
            <span class="scene-name">{{ scene.name }}</span>
          </div>
        </div>
      </template>
      <el-icon class="more-icon">
        <MoreFilled />
      </el-icon>
    </CustomTooltip>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { MoreFilled } from '@element-plus/icons-vue'
import CustomTooltip from './CustomTooltip.vue'

const props = defineProps({
  scenes: {
    type: Array,
    default: () => []
  }
})

const displayText = computed(() => {
  return props.scenes.length > 0 ? props.scenes[0].name : '-'
})
</script>

<style scoped>
.sub-scene-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
}

.scene-text {
  color: #262626;
}

.more-icon {
  font-size: 16px;
  color: #8c8c8c;
  cursor: pointer;
  transition: color 0.3s;
}

.more-icon:hover {
  color: #1890ff;
}

.tooltip-content {
  display: flex;
  gap: 16px;
  padding: 8px 0;
}

.scene-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.scene-code {
  font-size: 12px;
  color: #8c8c8c;
}

.scene-name {
  font-size: 14px;
  color: #262626;
  white-space: nowrap;
}
</style>
