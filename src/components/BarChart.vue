<template>
  <div class="bar-chart">
    <v-chart :option="chartOption" autoresize />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent } from 'echarts/components'

use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent
])

const props = defineProps({
  data: {
    type: Array,
    required: true
  }
})

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    },
    backgroundColor: '#ffffff',
    borderColor: '#e4e7ed',
    borderWidth: 1,
    textStyle: {
      color: '#333333'
    },
    formatter: (params) => {
      const item = params[0]
      const dataItem = props.data[item.dataIndex]
      return `
        <div style="padding: 12px;">
          <div style="font-weight: 600; margin-bottom: 8px; color: #333333;">${dataItem.name}</div>
          <div style="margin-bottom: 4px;">使用量: <span style="color: #2196f3; font-weight: 600;">${dataItem.value.toLocaleString()}</span></div>
          <div>占比: <span style="color: #4caf50; font-weight: 600;">${dataItem.percent}%</span></div>
        </div>
      `
    }
  },
  grid: {
    left: '3%',
    right: '28%',
    bottom: '3%',
    top: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'value',
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    splitLine: {
      lineStyle: {
        color: '#f0f0f0',
        type: 'dashed'
      }
    },
    axisLabel: {
      color: '#999999',
      fontSize: 11
    }
  },
  yAxis: {
    type: 'category',
    data: props.data.map(item => item.name),
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    axisLabel: {
      color: '#666666',
      fontSize: 13,
      width: 140,
      overflow: 'truncate',
      margin: 12
    }
  },
  series: [
    {
      type: 'bar',
      data: props.data.map((item, index) => ({
        value: item.value,
        itemStyle: {
          color: new Array(10).fill(0).map((_, i) => {
            const opacity = 0.85 - (i * 0.06)
            return `rgba(33, 150, 243, ${opacity.toFixed(2)})`
          })[index],
          borderRadius: [0, 3, 3, 0]
        }
      })),
      barWidth: '65%',
      label: {
        show: true,
        position: 'right',
        formatter: (params) => {
          const dataItem = props.data[params.dataIndex]
          return `${dataItem.value.toLocaleString()} (${dataItem.percent}%)`
        },
        color: '#333333',
        fontSize: 12,
        fontWeight: 500,
        width: 200
      },
      showBackground: true,
      backgroundStyle: {
        color: 'rgba(243, 244, 246, 0.6)',
        borderRadius: [0, 3, 3, 0]
      }
    }
  ]
}))
</script>

<style scoped>
.bar-chart {
  width: 100%;
  height: 100%;
}
</style>
