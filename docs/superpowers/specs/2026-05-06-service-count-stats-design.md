# 服务人次统计页面设计

## 概述

创建服务人次统计页面，展示不同时间范围和粒度下各业务分类的服务人次趋势。与呼叫记录数量统计页面功能类似，核心差异是图表从单条折线变为多系列折线图（5个业务分类），并增加图例和缩放条。

## 组件结构

### 1. ServiceCountStats.vue（主页面容器）
- 页面标题：服务人次统计
- 管理整体状态：时间范围、粒度、图表数据
- 复用 TimeGranularityFilter 组件进行筛选
- 调用 ServiceCountChart 组件展示多系列折线图

### 2. TimeGranularityFilter.vue（复用现有组件）
- 直接复用 `src/components/data-monitor/TimeGranularityFilter.vue`
- 无需修改

### 3. ServiceCountChart.vue（多系列折线图组件）
- **Props**: xData（X轴标签数组）, seriesData（5组数据对象）, granularity
- 使用 ECharts 展示多系列面积折线图
- 顶部图例显示5个业务分类
- 底部 DataZoom 缩放条，默认显示最近 70% 数据
- 鼠标悬浮 Tooltip 展示日期时间和所有分类数值，"全部"排第一
- Y 轴名称："服务人次数量"

## 数据流

### 状态定义（在 ServiceCountStats.vue 中）
```javascript
const timeRange = ref('month')     // 默认本月
const granularity = ref('day')     // 默认日粒度
const customDateRange = ref([])
const chartData = ref({
  xData: [],
  seriesData: {
    all: [],           // 全部
    funCall: [],       // 趣味通话
    smartTrans: [],    // 智能翻译
    screenLight: [],   // 点亮屏幕
    callSubtitle: []   // 通话字幕
  }
})
```

### 数据流
1. 用户点击时间筛选按钮 → 更新 `timeRange`
2. 用户点击粒度按钮 → 更新 `granularity`
3. `timeRange` 或 `granularity` 变化时 → 调用 `fetchData()` 生成新数据
4. `fetchData()` 更新 `chartData` → 传递给 `ServiceCountChart.vue` 展示

## 5个业务分类

| 系列名 | 数据键 | 颜色 | 说明 |
|--------|--------|------|------|
| 全部 | all | #4285f4（深蓝） | 其他4项之和 |
| 趣味通话 | funCall | #5ba0f5（浅蓝） | — |
| 智能翻译 | smartTrans | #34a853（绿色） | — |
| 点亮屏幕 | screenLight | #fbbc04（黄色） | — |
| 通话字幕 | callSubtitle | #ea4335（粉红） | — |

## Mock数据生成逻辑

- 4个子分类各自生成 0-1000 之间的随机数据
- "全部" = 趣味通话 + 智能翻译 + 点亮屏幕 + 通话字幕（最大值可达 4000）
- Y 轴自适应数据范围，无需固定最大值
- X 轴标签根据 timeRange + granularity 组合生成（与 CallCountStats 逻辑一致）：
  - 小时粒度：24个数据点（00:00 - 23:00）
  - 日粒度：当月天数的数据点（01-31）
  - 月粒度：12个月的数据点（1月-12月）

## ECharts 配置要点

```javascript
{
  tooltip: {
    trigger: 'axis',
    // 展示所有分类，"全部"排第一
  },
  legend: {
    top: 0,
    // 显示5个分类名称和颜色标识
  },
  dataZoom: [{
    type: 'slider',
    bottom: 10,
    start: 30,
    end: 100  // 默认显示最近70%
  }],
  grid: {
    left: '3%',
    right: '4%',
    bottom: '12%',  // 为 dataZoom 留空间
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false
  },
  yAxis: {
    type: 'value',
    name: '服务人次数量'
  },
  series: [
    // 5条 smooth 折线，各自带面积渐变
  ]
}
```

## 需修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/views/ServiceCountStats.vue` | 新建 | 页面主组件 |
| `src/components/data-monitor/ServiceCountChart.vue` | 新建 | 多系列折线图 |
| `src/router/index.js` | 修改 | 路由指向 ServiceCountStats（替换 DataMonitor 占位） |

## 不需要修改的文件

- `TimeGranularityFilter.vue` — 直接复用
- `Sidebar.vue` — 路由已配置
- `Layout.vue` — pageTitleMap 已包含 ServiceCountStats

## 边界情况处理

1. **图表数据为空** → 显示"暂无数据"提示
2. **自定义时间范围未选择完整** → 由 TimeGranularityFilter 处理

## 技术栈

- Vue 3 Composition API
- Element Plus（按钮、日期选择器）
- ECharts 5.4.0（vue-echarts 6.6.0）

## 文件结构

```
src/
├── views/
│   └── ServiceCountStats.vue          （新建）
├── components/
│   └── data-monitor/
│       ├── TimeGranularityFilter.vue  （复用）
│       └── ServiceCountChart.vue      （新建）
└── router/
    └── index.js                       （修改路由）
```
