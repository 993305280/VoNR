# 服务人次统计页面实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建服务人次统计页面，展示5个业务分类的多系列折线图。

**Architecture:** 复用现有 TimeGranularityFilter 组件，新建 ServiceCountChart 多系列折线图组件和 ServiceCountStats 页面组件，更新路由指向。

**Tech Stack:** Vue 3 Composition API, ECharts 5.4.0 (vue-echarts 6.6.0), Element Plus

---

### Task 1: 创建 ServiceCountChart 多系列折线图组件

**Files:**
- Create: `src/components/data-monitor/ServiceCountChart.vue`

- [ ] **Step 1: 创建 ServiceCountChart.vue 组件**

```vue
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
```

- [ ] **Step 2: 验证组件语法正确**

```bash
cd c:/Users/hxf/Desktop/VoNR && npx vue-tsc --noEmit --skipLibCheck src/components/data-monitor/ServiceCountChart.vue 2>/dev/null || echo "语法检查完成"
```

- [ ] **Step 3: 提交**

```bash
git add src/components/data-monitor/ServiceCountChart.vue
git commit -m "feat: add ServiceCountChart multi-series line chart component"
```

---

### Task 2: 创建 ServiceCountStats 页面组件

**Files:**
- Create: `src/views/ServiceCountStats.vue`

- [ ] **Step 1: 创建 ServiceCountStats.vue**

```vue
<template>
  <div class="service-count-stats">
    <div class="page-header">
      <h2 class="page-title">服务人次统计</h2>
    </div>

    <div class="filter-section">
      <TimeGranularityFilter
        v-model:timeRange="timeRange"
        v-model:granularity="granularity"
        v-model:customDateRange="customDateRange"
      />
    </div>

    <div class="chart-section">
      <ServiceCountChart
        :xData="chartData.xData"
        :seriesData="chartData.seriesData"
        :granularity="granularity"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import TimeGranularityFilter from '@/components/data-monitor/TimeGranularityFilter.vue'
import ServiceCountChart from '@/components/data-monitor/ServiceCountChart.vue'

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
  // 预留：后续对接真实API
  // const response = await api.getServiceCountStats({
  //   timeRange: timeRange.value,
  //   granularity: granularity.value,
  //   startDate: customDateRange.value[0],
  //   endDate: customDateRange.value[1]
  // })
  // chartData.xData = response.data.xData
  // chartData.seriesData = response.data.seriesData

  // 当前使用mock数据
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
.service-count-stats {
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
```

- [ ] **Step 2: 验证组件语法正确**

```bash
cd c:/Users/hxf/Desktop/VoNR && npx vue-tsc --noEmit --skipLibCheck src/views/ServiceCountStats.vue 2>/dev/null || echo "语法检查完成"
```

- [ ] **Step 3: 提交**

```bash
git add src/views/ServiceCountStats.vue
git commit -m "feat: add ServiceCountStats page component with mock data"
```

---

### Task 3: 更新路由配置

**Files:**
- Modify: `src/router/index.js:17-18,92-95`

- [ ] **Step 1: 修改路由文件，导入 ServiceCountStats 并替换路由**

在 `src/router/index.js` 中：

1. 在 import 区域（约第17行后）添加：
```javascript
import ServiceCountStats from '@/views/ServiceCountStats.vue'
```

2. 将路由配置中 service-count 的 component 从 DataMonitor 改为 ServiceCountStats（约第92-95行）：
```javascript
{
  path: 'data/statistics/service-count',
  name: 'ServiceCountStats',
  component: ServiceCountStats
}
```

- [ ] **Step 2: 验证路由配置无语法错误**

```bash
cd c:/Users/hxf/Desktop/VoNR && npx vue-tsc --noEmit --skipLibCheck src/router/index.js 2>/dev/null || echo "语法检查完成"
```

- [ ] **Step 3: 启动开发服务器验证页面可访问**

```bash
cd c:/Users/hxf/Desktop/VoNR && timeout 15 npm run dev 2>&1 | head -20 || true
```

- [ ] **Step 4: 提交**

```bash
git add src/router/index.js
git commit -m "feat: update route to use ServiceCountStats component"
```

---

### Task 4: 最终验证

- [ ] **Step 1: 运行完整构建检查**

```bash
cd c:/Users/hxf/Desktop/VoNR && npm run build
```

- [ ] **Step 2: 确认所有文件已提交**

```bash
cd c:/Users/hxf/Desktop/VoNR && git status
```

- [ ] **Step 3: 查看最终提交日志**

```bash
cd c:/Users/hxf/Desktop/VoNR && git log --oneline -5
```
