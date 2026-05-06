<template>
  <div class="service-count-chart">
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
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent
} from 'echarts/components'

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent
])

const SERIES_CONFIG = [
  { key: 'all', name: '全部', color: '#4285f4' },
  { key: 'funCall', name: '趣味通话', color: '#5ba0f5' },
  { key: 'smartTrans', name: '智能翻译', color: '#34a853' },
  { key: 'screenLight', name: '点亮屏幕', color: '#fbbc04' },
  { key: 'callSubtitle', name: '通话字幕', color: '#ea4335' }
]

const props = defineProps({
  xData: {
    type: Array,
    required: true
  },
  seriesData: {
    type: Object,
    required: true
  },
  granularity: {
    type: String,
    required: true,
    validator: (val) => ['hour', 'day', 'month'].includes(val)
  }
})

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
      let html = `<div style="padding: 12px;">`
      html += `<div style="font-weight: 600; margin-bottom: 8px; color: #333333;">${params[0].name}</div>`
      params.forEach(item => {
        html += `<div style="margin: 4px 0;">
          <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${item.color}; margin-right: 6px;"></span>
          ${item.seriesName}: <span style="font-weight: 600;">${item.value.toLocaleString()}</span>
        </div>`
      })
      html += `</div>`
      return html
    }
  },
  legend: {
    top: 0,
    itemGap: 20,
    textStyle: {
      color: '#666666',
      fontSize: 12
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '12%',
    containLabel: true
  },
  dataZoom: [{
    type: 'slider',
    bottom: 10,
    height: 20,
    start: 30,
    end: 100,
    borderColor: '#e4e7ed',
    fillerColor: 'rgba(66, 133, 244, 0.1)',
    handleStyle: {
      color: '#4285f4'
    }
  }],
  xAxis: {
    type: 'category',
    data: props.xData,
    boundaryGap: false,
    axisLabel: {
      color: '#666666',
      fontSize: 12
    }
  },
  yAxis: {
    type: 'value',
    name: '服务人次数量',
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
  series: SERIES_CONFIG.map(config => ({
    name: config.name,
    type: 'line',
    data: props.seriesData[config.key] || [],
    smooth: true,
    areaStyle: {
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          { offset: 0, color: `${config.color}4D` },
          { offset: 1, color: `${config.color}0D` }
        ]
      }
    },
    lineStyle: {
      color: config.color,
      width: 2
    },
    itemStyle: {
      color: config.color
    },
    symbol: 'circle',
    symbolSize: 6
  }))
}))
</script>

<style scoped>
.service-count-chart {
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
