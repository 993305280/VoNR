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

const generateRandomArray = (count, max = 1000) => {
  return Array.from({ length: count }, () => Math.floor(Math.random() * max))
}

const calculateAll = (seriesData, count) => {
  return Array.from({ length: count }, (_, i) =>
    (seriesData.funCall[i] || 0) +
    (seriesData.smartTrans[i] || 0) +
    (seriesData.screenLight[i] || 0) +
    (seriesData.callSubtitle[i] || 0)
  )
}

const generateMockData = () => {
  const xData = []
  let dataCount = 0

  if (timeRange.value === 'today') {
    for (let i = 0; i < 24; i++) {
      xData.push(`${String(i).padStart(2, '0')}:00`)
    }
    dataCount = 24
  } else if (timeRange.value === 'month') {
    if (granularity.value === 'hour') {
      for (let i = 0; i < 24; i++) {
        xData.push(`${String(i).padStart(2, '0')}:00`)
      }
      dataCount = 24
    } else if (granularity.value === 'day') {
      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
      for (let i = 1; i <= daysInMonth; i++) {
        xData.push(String(i).padStart(2, '0'))
      }
      dataCount = daysInMonth
    } else if (granularity.value === 'month') {
      for (let i = 1; i <= 12; i++) {
        xData.push(`${i}月`)
      }
      dataCount = 12
    }
  } else if (timeRange.value === 'year') {
    if (granularity.value === 'hour') {
      for (let i = 0; i < 24; i++) {
        xData.push(`${String(i).padStart(2, '0')}:00`)
      }
      dataCount = 24
    } else if (granularity.value === 'day') {
      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
      for (let i = 1; i <= daysInMonth; i++) {
        xData.push(String(i).padStart(2, '0'))
      }
      dataCount = daysInMonth
    } else if (granularity.value === 'month') {
      for (let i = 1; i <= 12; i++) {
        xData.push(`${i}月`)
      }
      dataCount = 12
    }
  } else if (timeRange.value === 'custom') {
    if (customDateRange.value && customDateRange.value.length === 2) {
      const start = new Date(customDateRange.value[0])
      const end = new Date(customDateRange.value[1])
      const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24))

      if (granularity.value === 'hour') {
        for (let i = 0; i < 24; i++) {
          xData.push(`${String(i).padStart(2, '0')}:00`)
        }
        dataCount = 24
      } else if (granularity.value === 'day') {
        for (let i = 0; i <= diffDays; i++) {
          const date = new Date(start)
          date.setDate(date.getDate() + i)
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          xData.push(`${month}-${day}`)
        }
        dataCount = diffDays + 1
      } else if (granularity.value === 'month') {
        const months = Math.ceil(diffDays / 30)
        for (let i = 1; i <= months; i++) {
          xData.push(`${i}月`)
        }
        dataCount = months
      }
    }
  }

  const seriesData = {
    funCall: generateRandomArray(dataCount),
    smartTrans: generateRandomArray(dataCount),
    screenLight: generateRandomArray(dataCount),
    callSubtitle: generateRandomArray(dataCount),
    all: []
  }
  seriesData.all = calculateAll(seriesData, dataCount)

  return { xData, seriesData }
}

async function fetchData() {
  const mockData = generateMockData()
  chartData.xData = mockData.xData
  chartData.seriesData = mockData.seriesData
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
