<template>
  <div class="donut-chart">
    <div class="chart-wrapper">
      <div class="chart-container">
        <v-chart :option="chartOption" autoresize />
      </div>
    </div>
    <div class="chart-legend">
      <div class="legend-title">总计: {{ formatValue(data.total) }}</div>
      <div v-for="(item, index) in data.data" :key="item.name" class="legend-item">
        <span class="legend-color" :style="{ background: colors[index] }"></span>
        <span class="legend-name">{{ item.name }}</span>
        <span class="legend-value">{{ formatValue(item.value) }}</span>
        <span class="legend-percent">{{ getPercent(item.value) }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent } from 'echarts/components'

use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent
])

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const colors = ['#2196f3', '#4caf50', '#ff9800', '#9c27b0']

const getPercent = (value) => {
  return ((value / props.data.total) * 100).toFixed(1)
}

const formatValue = (val) => {
  return val.toLocaleString()
}

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)',
    backgroundColor: '#ffffff',
    borderColor: '#e4e7ed',
    borderWidth: 1,
    textStyle: {
      color: '#333333'
    }
  },
  series: [
    {
      type: 'pie',
      radius: ['55%', '75%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: false,
      label: {
        show: false
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold',
          color: '#333333'
        },
        scale: true,
        scaleSize: 10
      },
      data: props.data.data.map((item, index) => ({
        name: item.name,
        value: item.value,
        itemStyle: { color: colors[index] }
      }))
    }
  ]
}))
</script>

<style scoped>
.donut-chart {
  display: flex;
  height: 100%;
  gap: 40px;
}

.chart-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-container {
  width: 100%;
  height: 100%;
  max-width: 320px;
}

.chart-legend {
  width: 180px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.legend-title {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  padding-bottom: 12px;
  border-bottom: 2px solid #2196f3;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  padding: 8px 0;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  flex-shrink: 0;
}

.legend-name {
  color: #666666;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.legend-value {
  color: #333333;
  font-weight: 600;
  min-width: 80px;
  text-align: right;
}

.legend-percent {
  color: #2196f3;
  font-weight: 700;
  min-width: 50px;
  text-align: right;
}
</style>
