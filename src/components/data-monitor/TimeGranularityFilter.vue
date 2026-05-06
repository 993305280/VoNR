<template>
  <div class="time-granularity-filter">
    <div class="filter-row">
      <span class="filter-label">统计时间筛选</span>
      <div class="filter-buttons">
        <el-button
          :type="timeRange === 'today' ? 'primary' : ''"
          @click="updateTimeRange('today')"
        >
          本日
        </el-button>
        <el-button
          :type="timeRange === 'month' ? 'primary' : ''"
          @click="updateTimeRange('month')"
        >
          本月
        </el-button>
        <el-button
          :type="timeRange === 'year' ? 'primary' : ''"
          @click="updateTimeRange('year')"
        >
          本年
        </el-button>
        <el-date-picker
          v-model="customDateRangeProxy"
          type="daterange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          :clearable="true"
          @change="handleCustomDateChange"
          class="custom-date-picker"
        />
      </div>
    </div>

    <div class="filter-row">
      <span class="filter-label">统计粒度筛选</span>
      <div class="filter-buttons">
        <el-button
          :type="granularity === 'hour' ? 'primary' : ''"
          :disabled="isDisabled('hour')"
          @click="updateGranularity('hour')"
        >
          小时
        </el-button>
        <el-button
          :type="granularity === 'day' ? 'primary' : ''"
          :disabled="isDisabled('day')"
          @click="updateGranularity('day')"
        >
          日
        </el-button>
        <el-button
          :type="granularity === 'month' ? 'primary' : ''"
          :disabled="isDisabled('month')"
          @click="updateGranularity('month')"
        >
          月
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'

const props = defineProps({
  timeRange: {
    type: String,
    required: true,
    validator: (val) => ['today', 'month', 'year', 'custom'].includes(val)
  },
  granularity: {
    type: String,
    required: true,
    validator: (val) => ['hour', 'day', 'month'].includes(val)
  },
  customDateRange: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:timeRange', 'update:granularity', 'update:customDateRange'])

const customDateRangeProxy = computed({
  get: () => props.customDateRange,
  set: (val) => emit('update:customDateRange', val)
})

const disabledGranularities = computed(() => {
  if (props.timeRange === 'today') return ['day', 'month']
  if (props.timeRange === 'month') return ['month']
  if (props.timeRange === 'year') return []

  if (props.customDateRange && props.customDateRange.length === 2) {
    const start = new Date(props.customDateRange[0])
    const end = new Date(props.customDateRange[1])
    const diffDays = (end - start) / (1000 * 60 * 60 * 24)

    if (diffDays < 1) return ['day', 'month']
    if (diffDays <= 30) return ['month']
    return []
  }
  return ['month']
})

const isDisabled = (granularityOption) => {
  return disabledGranularities.value.includes(granularityOption)
}

const updateTimeRange = (value) => {
  emit('update:timeRange', value)
  if (value === 'today') {
    emit('update:granularity', 'hour')
  } else if (value === 'month' && props.granularity === 'month') {
    emit('update:granularity', 'day')
  }
}

const updateGranularity = (value) => {
  if (!isDisabled(value)) {
    emit('update:granularity', value)
  }
}

const handleCustomDateChange = (value) => {
  if (value) {
    emit('update:timeRange', 'custom')

    const start = new Date(value[0])
    const end = new Date(value[1])
    const diffDays = (end - start) / (1000 * 60 * 60 * 24)

    if (diffDays < 1 && props.granularity !== 'hour') {
      emit('update:granularity', 'hour')
    } else if (diffDays <= 30 && diffDays >= 1 && props.granularity === 'month') {
      emit('update:granularity', 'day')
    }
  } else {
    emit('update:timeRange', 'today')
    emit('update:granularity', 'hour')
    emit('update:customDateRange', [])
  }
}

watch(() => props.timeRange, (newVal) => {
  if (newVal !== 'custom') {
    emit('update:customDateRange', [])
  }
})
</script>

<style scoped>
.time-granularity-filter {
  padding: 16px 0;
}

.filter-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.filter-label {
  font-weight: 500;
  color: #333333;
  margin-right: 16px;
  white-space: nowrap;
}

.filter-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.custom-date-picker {
  margin-left: 8px;
}

:deep(.el-button) {
  min-width: 60px;
}

:deep(.el-button.is-disabled) {
  opacity: 0.5;
}
</style>
