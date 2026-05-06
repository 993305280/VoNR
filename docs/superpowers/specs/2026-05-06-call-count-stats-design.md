# 呼叫记录数量统计页面设计

## 概述

创建呼叫记录数量统计页面，展示不同时间范围和粒度下的呼叫数量趋势图表。页面使用ECharts展示面积折线图，支持时间筛选和粒度筛选的联动逻辑。

## 组件结构

### 1. CallCountStats.vue（主页面容器）
- 页面标题：呼叫记录数量统计
- 管理整体状态：时间范围、粒度、图表数据
- 调用子组件并传递props
- 处理API调用逻辑（预留接口）

### 2. TimeGranularityFilter.vue（时间粒度筛选器）
- **Props**: timeRange, granularity, customDateRange
- **Emits**: update:timeRange, update:granularity, update:customDateRange
- 显示"统计时间筛选"行：本日、本月、本年按钮 + 自定义时间范围选择器
- 显示"统计粒度筛选"行：小时、日、月按钮（根据时间范围联动禁用）

### 3. CallCountChart.vue（图表组件）
- **Props**: xData（X轴数据）, yData（Y轴数据）, granularity（用于格式化X轴标签）
- 使用ECharts展示面积折线图
- X轴根据粒度格式化标签
- Y轴显示呼叫数量
- 鼠标悬浮显示tooltip

## 数据流

### 状态定义（在CallCountStats.vue中）
```javascript
const timeRange = ref('today')  // 'today' | 'month' | 'year' | 'custom'
const granularity = ref('hour')  // 'hour' | 'day' | 'month'
const customDateRange = ref([])  // [startDate, endDate]
const chartData = ref({ xData: [], yData: [] })
```

### 数据流
1. 用户点击时间筛选按钮 → 更新 `timeRange`
2. `timeRange` 变化时 → 自动调整 `granularity`（禁用不支持的选项）
3. 用户点击粒度按钮 → 更新 `granularity`
4. `timeRange` 或 `granularity` 变化时 → 调用 `fetchData()` 获取新数据
5. `fetchData()` 更新 `chartData` → 传递给 `CallCountChart.vue` 展示

## 联动逻辑

### 联动规则
- **本日** → 只能选"小时"
- **本月** → 只能选"小时"和"日"
- **本年** → 可以选"小时"、"日"、"月"
- **自定义时间范围**：
  - 1天内 → 只能选"小时"
  - 1-30天 → 只能选"小时"和"日"
  - 30天以上 → 全部支持

### 联动实现
```javascript
// 当timeRange变化时，自动调整granularity
watch(timeRange, (newVal) => {
  if (newVal === 'today') {
    granularity.value = 'hour'
  } else if (newVal === 'month') {
    if (granularity.value === 'month') {
      granularity.value = 'day'
    }
  }
})

// 自定义时间范围的粒度判断
const disabledGranularities = computed(() => {
  if (timeRange.value === 'today') return ['day', 'month']
  if (timeRange.value === 'month') return ['month']
  if (timeRange.value === 'year') return []
  
  if (customDateRange.value.length === 2) {
    const start = new Date(customDateRange.value[0])
    const end = new Date(customDateRange.value[1])
    const diffDays = (end - start) / (1000 * 60 * 60 * 24)
    
    if (diffDays < 1) return ['day', 'month']
    if (diffDays <= 30) return ['month']
    return []
  }
  return ['month']
})
```

## Mock数据

### 数据生成逻辑
- 根据 `timeRange` 和 `granularity` 生成对应的模拟数据
- 小时粒度：生成24个数据点（00:00 - 23:00）
- 日粒度：生成当月天数的数据点（01-31）
- 月粒度：生成12个月的数据点（1月-12月）
- 数据值范围：0-1000之间的随机数

## ECharts配置

```javascript
{
  tooltip: {
    trigger: 'axis',
    formatter: '{b}\n呼叫数量: {c}'
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: xData,
    boundaryGap: false
  },
  yAxis: {
    type: 'value',
    name: '呼叫数量'
  },
  series: [{
    type: 'line',
    data: yData,
    smooth: true,
    areaStyle: {
      color: 'rgba(66, 133, 244, 0.15)'
    },
    lineStyle: {
      color: '#4285f4',
      width: 2
    },
    itemStyle: {
      color: '#4285f4'
    }
  }]
}
```

### X轴标签格式
- 小时：`00:00`, `01:00`, ..., `23:00`
- 日：`01-01`, `01-02`, ..., `01-31`
- 月：`1月`, `2月`, ..., `12月`

## 边界情况处理

1. **自定义时间范围未选择完整** → 禁用粒度选择，显示提示
2. **选择的时间范围跨月** → 根据实际天数判断粒度
3. **图表数据为空** → 显示"暂无数据"提示
4. **API调用失败** → 显示错误提示，保留上次有效数据

## API预留接口

```javascript
async function fetchData() {
  // 预留：后续对接真实API
  // const response = await api.getCallCountStats({
  //   timeRange: timeRange.value,
  //   granularity: granularity.value,
  //   startDate: customDateRange.value[0],
  //   endDate: customDateRange.value[1]
  // })
  // chartData.value = response.data
  
  // 当前使用mock数据
  chartData.value = generateMockData()
}
```

## 技术栈

- Vue 3 Composition API
- Element Plus（按钮、日期选择器）
- ECharts（vue-echarts）

## 文件结构

```
src/
├── views/
│   └── CallCountStats.vue
├── components/
│   └── data-monitor/
│       ├── TimeGranularityFilter.vue
│       └── CallCountChart.vue
└── router/
    └── index.js（已配置路由：/data/statistics/call-count）
```
