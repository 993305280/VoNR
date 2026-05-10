<template>
  <div class="user-count-stats">
    <div class="page-header">
      <h2 class="page-title">服务用户数统计</h2>
    </div>

    <div class="filter-section">
      <TimeGranularityFilter
        v-model:timeRange="timeRange"
        v-model:granularity="granularity"
        v-model:customDateRange="customDateRange"
      />
    </div>

    <div class="chart-section">
      <UserCountChart
        :xData="chartData.xData"
        :seriesData="chartData.seriesData"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import TimeGranularityFilter from '@/components/data-monitor/TimeGranularityFilter.vue'
import UserCountChart from '@/components/data-monitor/UserCountChart.vue'
import { getUserCountStats } from '@/api/statistics'

const timeRange = ref('month')
const granularity = ref('day')
const customDateRange = ref([])

const chartData = reactive({
  xData: [],
  seriesData: {
    all: [],
    funCall: [],
    smartTrans: [],
    screenLight: [],
    callSubtitle: []
  }
})

async function fetchData() {
  try {
    const params = {
      timeRange: timeRange.value,
      granularity: granularity.value
    }
    if (timeRange.value === 'custom' && customDateRange.value?.length === 2) {
      const start = new Date(customDateRange.value[0])
      const end = new Date(customDateRange.value[1])
      params.startDate = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`
      params.endDate = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`
    }
    const response = await getUserCountStats(params)
    chartData.xData = response.data.xData
    chartData.seriesData = response.data.seriesData
  } catch (error) {
    console.error('获取服务用户数统计失败:', error)
  }
}

watch([timeRange, granularity, customDateRange], () => {
  fetchData()
})

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.user-count-stats {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #333333;
}

.filter-section {
  padding: 0 24px 20px;
}

.chart-section {
  flex: 1;
  min-height: 0;
  padding: 0 24px 20px;
}
</style>
