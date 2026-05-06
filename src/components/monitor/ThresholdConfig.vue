<template>
  <div class="threshold-config">
    <h3 class="config-title">告警阈值配置</h3>

    <div class="config-form">
      <div class="config-item">
        <label class="config-label">短信服务告警阈值:</label>
        <el-slider
          v-model="modelValue"
          :min="min"
          :max="max"
          :step="1"
          show-input
          input-size="small"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, toRefs } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    required: true,
    default: 85
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 100
  }
})

const emit = defineEmits(['update:modelValue'])

const { min, max } = toRefs(props)

const modelValue = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})

const validateValue = () => {
  if (!props.modelValue) {
    return
  }
  if (parseInt(props.modelValue, 10) > max.value) {
    emit('update:modelValue', max.value)
  }
}
</script>

<style scoped>
.threshold-config {
  padding: 16px 0;
}

.config-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.config-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.config-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.config-label {
  min-width: 160px;
  font-size: 13px;
  color: #666;
}
</style>
