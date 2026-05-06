<template>
  <div class="call-count-chart">
    <div v-if="xData.length === 0" class="no-data">暂无数据</div>
    <v-chart v-else :option="chartOption" autoresize />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent } from 'echarts/components'

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent
])

const props = defineProps({
  xData: {
    type: Array,
    required: true
  },
  yData: {
    type: Array,
    required: true
  },
  granularity: {
    type: String,
    required: true,
    validator: (val) => ['hour', 'day', 'month'].includes(val)
  }
})

const formatXAxisLabel = (value) => {
  if (props.granularity === 'hour') {
    return value
  } else if (props.granularity === 'day') {
    return value
  } else if (props.granularity === 'month') {
    return value
  }
  return value
}

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: '#ffffff',
    borderColor: '#e4e7ed',
    borderWidth: 1,
    textStyle: {
      color: '#333333'
    },
    formatter: (params) => {
      const item = params[0]
      return `
        <div style="padding: 12px;">
          <div style="font-weight: 600; margin-bottom: 8px; color: #333333;">${item.name}</div>
          <div>呼叫数量: <span style="color: #4285f4; font-weight: 600;">${item.value.toLocaleString()}</span></div>
        </div>
      `
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: props.xData,
    boundaryGap: false,
    axisLabel: {
      color: '#666666',
      fontSize: 12,
      formatter: formatXAxisLabel
    }
  },
  yAxis: {
    type: 'value',
    name: '呼叫数量',
    axisLabel: {
      color: '#666666',
      fontSize: 12
    },
    splitLine: {
      lineStyle: {
        color: '#f0f0f0',
        type: 'dashed'
      }
    }
  },
  series: [{
    type: 'line',
    data: props.yData,
    smooth: true,
    areaStyle: {
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          { offset: 0, color: 'rgba(66, 133, 244, 0.3)' },
          { offset: 1, color: 'rgba(66, 133, 244, 0.05)' }
        ]
      }
    },
    lineStyle: {
      color: '#4285f4',
      width: 2
    },
    itemStyle: {
      color: '#4285f4'
    },
    symbol: 'circle',
    symbolSize: 6
  }]
}))
</script>

<style scoped>
.call-count-chart {
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 400px;
  color: #999999;
  font-size: 14px;
}
</style>
