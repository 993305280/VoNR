# 呼叫记录数量统计页面实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建呼叫记录数量统计页面，展示不同时间范围和粒度下的呼叫数量趋势图表

**Architecture:** 使用Vue 3 Composition API + Element Plus + ECharts实现，包含三个组件：主页面容器、时间粒度筛选器、图表组件。采用组件拆分方案，职责清晰，易于维护。

**Tech Stack:** Vue 3, Element Plus, ECharts (vue-echarts)

---

## 文件结构

```
src/
├── views/
│   └── CallCountStats.vue (新建 - 主页面容器)
├── components/
│   └── data-monitor/
│       ├── TimeGranularityFilter.vue (新建 - 时间粒度筛选器)
│       └── CallCountChart.vue (新建 - 图表组件)
└── router/
    └── index.js (已配置路由：/data/statistics/call-count)
```

---

### Task 1: 创建CallCountChart.vue图表组件

**Files:**
- Create: `src/components/data-monitor/CallCountChart.vue`

- [ ] **Step 1: 创建图表组件基础结构**

```vue
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
      fontSize: 12
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
```

- [ ] **Step 2: 测试图表组件渲染**

启动开发服务器验证组件是否正常渲染：
```bash
npm run dev
```
预期：开发服务器正常启动，组件无报错

- [ ] **Step 3: 提交代码**

```bash
git add src/components/data-monitor/CallCountChart.vue
git commit -m "feat: add CallCountChart component with ECharts line chart"
```

---

### Task 2: 创建TimeGranularityFilter.vue筛选器组件

**Files:**
- Create: `src/components/data-monitor/TimeGranularityFilter.vue`

- [ ] **Step 1: 创建筛选器组件基础结构**

```vue
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
          v-model="customDateRange"
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
import { ref, computed, watch } from 'vue'

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
  }
})

const emit = defineEmits(['update:timeRange', 'update:granularity', 'update:customDateRange'])

const customDateRange = ref([])

const disabledGranularities = computed(() => {
  if (props.timeRange === 'today') return ['day', 'month']
  if (props.timeRange === 'month') return ['month']
  if (props.timeRange === 'year') return []
  
  if (customDateRange.value && customDateRange.value.length === 2) {
    const start = new Date(customDateRange.value[0])
    const end = new Date(customDateRange.value[1])
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
    emit('update:customDateRange', value)
    
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
    customDateRange.value = []
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
```

- [ ] **Step 2: 测试筛选器组件渲染**

启动开发服务器验证组件是否正常渲染：
```bash
npm run dev
```
预期：开发服务器正常启动，组件无报错

- [ ] **Step 3: 提交代码**

```bash
git add src/components/data-monitor/TimeGranularityFilter.vue
git commit -m "feat: add TimeGranularityFilter component with time and granularity selection"
```

---

### Task 3: 创建CallCountStats.vue主页面

**Files:**
- Create: `src/views/CallCountStats.vue`

- [ ] **Step 1: 创建主页面容器**

```vue
<template>
  <div class="call-count-stats">
    <div class="page-header">
      <h2 class="page-title">呼叫记录数量统计</h2>
    </div>
    
    <div class="filter-section">
      <TimeGranularityFilter
        v-model:timeRange="timeRange"
        v-model:granularity="granularity"
        @update:customDateRange="handleCustomDateRange"
      />
    </div>
    
    <div class="chart-section">
      <CallCountChart
        :xData="chartData.xData"
        :yData="chartData.yData"
        :granularity="granularity"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import TimeGranularityFilter from '@/components/data-monitor/TimeGranularityFilter.vue'
import CallCountChart from '@/components/data-monitor/CallCountChart.vue'

const timeRange = ref('today')
const granularity = ref('hour')
const customDateRange = ref([])

const chartData = reactive({
  xData: [],
  yData: []
})

const generateMockData = () => {
  const xData = []
  const yData = []
  
  if (timeRange.value === 'today') {
    for (let i = 0; i < 24; i++) {
      xData.push(`${String(i).padStart(2, '0')}:00`)
      yData.push(Math.floor(Math.random() * 1000))
    }
  } else if (timeRange.value === 'month') {
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
    for (let i = 1; i <= daysInMonth; i++) {
      const day = String(i).padStart(2, '0')
      xData.push(`${day}`)
      yData.push(Math.floor(Math.random() * 1000))
    }
  } else if (timeRange.value === 'year') {
    if (granularity.value === 'hour') {
      for (let i = 0; i < 24; i++) {
        xData.push(`${String(i).padStart(2, '0')}:00`)
        yData.push(Math.floor(Math.random() * 1000))
      }
    } else if (granularity.value === 'day') {
      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
      for (let i = 1; i <= daysInMonth; i++) {
        const day = String(i).padStart(2, '0')
        xData.push(`${day}`)
        yData.push(Math.floor(Math.random() * 1000))
      }
    } else if (granularity.value === 'month') {
      for (let i = 1; i <= 12; i++) {
        xData.push(`${i}月`)
        yData.push(Math.floor(Math.random() * 1000))
      }
    }
  } else if (timeRange.value === 'custom') {
    if (customDateRange.value && customDateRange.value.length === 2) {
      const start = new Date(customDateRange.value[0])
      const end = new Date(customDateRange.value[1])
      const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
      
      if (granularity.value === 'hour') {
        for (let i = 0; i < 24; i++) {
          xData.push(`${String(i).padStart(2, '0')}:00`)
          yData.push(Math.floor(Math.random() * 1000))
        }
      } else if (granularity.value === 'day') {
        for (let i = 0; i <= diffDays; i++) {
          const date = new Date(start)
          date.setDate(date.getDate() + i)
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          xData.push(`${month}-${day}`)
          yData.push(Math.floor(Math.random() * 1000))
        }
      } else if (granularity.value === 'month') {
        const months = Math.ceil(diffDays / 30)
        for (let i = 1; i <= months; i++) {
          xData.push(`${i}月`)
          yData.push(Math.floor(Math.random() * 1000))
        }
      }
    }
  }
  
  return { xData, yData }
}

async function fetchData() {
  // 预留：后续对接真实API
  // const response = await api.getCallCountStats({
  //   timeRange: timeRange.value,
  //   granularity: granularity.value,
  //   startDate: customDateRange.value[0],
  //   endDate: customDateRange.value[1]
  // })
  // chartData.xData = response.data.xData
  // chartData.yData = response.data.yData
  
  // 当前使用mock数据
  const mockData = generateMockData()
  chartData.xData = mockData.xData
  chartData.yData = mockData.yData
}

const handleCustomDateRange = (range) => {
  customDateRange.value = range
}

watch([timeRange, granularity], () => {
  fetchData()
})

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.call-count-stats {
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

- [ ] **Step 2: 测试主页面渲染**

启动开发服务器验证页面是否正常渲染：
```bash
npm run dev
```
预期：开发服务器正常启动，页面显示标题、筛选器和图表

- [ ] **Step 3: 测试筛选功能**

在浏览器中测试：
1. 点击"本日"按钮，验证粒度自动切换为"小时"
2. 点击"本月"按钮，验证"月"粒度被禁用
3. 点击"本年"按钮，验证所有粒度都可用
4. 选择自定义日期范围，验证粒度根据天数自动调整

预期：所有筛选功能正常工作

- [ ] **Step 4: 提交代码**

```bash
git add src/views/CallCountStats.vue
git commit -m "feat: add CallCountStats page with time and granularity filters"
```

---

### Task 4: 验证路由和集成

**Files:**
- Modify: `src/router/index.js` (确认路由配置)
- Modify: `src/views/Layout.vue` (确认侧边栏菜单)

- [ ] **Step 1: 验证路由配置**

检查 `src/router/index.js` 文件，确认以下路由配置存在：
```javascript
{
  path: 'data/statistics/call-count',
  name: 'CallCountStats',
  component: DataMonitor
}
```

预期：路由配置已存在

- [ ] **Step 2: 更新路由配置**

如果路由配置中的component是DataMonitor，需要更新为CallCountStats：
```javascript
import CallCountStats from '@/views/CallCountStats.vue'

// 在routes数组中修改
{
  path: 'data/statistics/call-count',
  name: 'CallCountStats',
  component: CallCountStats
}
```

预期：路由配置正确指向CallCountStats组件

- [ ] **Step 3: 验证侧边栏菜单**

检查 `src/views/Layout.vue` 文件，确认侧边栏菜单中有"呼叫记录数量统计"菜单项，并且路由路径正确。

预期：侧边栏菜单配置正确

- [ ] **Step 4: 完整功能测试**

启动开发服务器进行完整测试：
```bash
npm run dev
```

在浏览器中测试：
1. 点击侧边栏"呼叫记录数量统计"菜单
2. 验证页面正确加载
3. 测试所有筛选功能
4. 验证图表正确更新

预期：所有功能正常工作

- [ ] **Step 5: 提交代码**

```bash
git add src/router/index.js src/views/CallCountStats.vue
git commit -m "feat: integrate CallCountStats page with router and sidebar"
```

---

## 完成

所有任务完成后，呼叫记录数量统计页面将具备以下功能：
1. 显示页面标题"呼叫记录数量统计"
2. 提供时间筛选按钮：本日、本月、本年、自定义日期范围
3. 提供粒度筛选按钮：小时、日、月（根据时间范围自动禁用不支持的选项）
4. 使用ECharts展示面积折线图
5. 根据选择的时间范围和粒度自动更新图表数据
6. 支持鼠标悬浮查看详细数据

预留的API接口可以在后续对接真实后端服务时使用。
