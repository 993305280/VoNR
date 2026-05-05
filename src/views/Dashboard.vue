<template>
  <div class="dashboard-root">
    <header class="header">
      <h2 class="title">CDR数据统计</h2>
    </header>

    <section class="stats-container">
      <div v-for="(stat, idx) in topStats" :key="idx" :class="['stat-card', stat.type]">
        <div class="card-top">
          <div class="info">
            <span class="label">{{ stat.title }}</span>
            <span class="number">{{ stat.value }}</span>
          </div>
          <div :class="['icon-box', stat.iconBg]">
            <span class="icon">{{ stat.icon }}</span>
          </div>
        </div>
        <div class="card-bottom">
          <span class="period">本月 <b class="dark">{{ stat.monthly }}</b></span>
          <span class="trend up">同比 +{{ stat.yoy }}% ↗</span>
          <span class="trend down">环比 -{{ stat.qoq }}% ↘</span>
        </div>
      </div>
    </section>

    <section class="details-container">
      <div class="chart-panel pie-panel">
        <div class="panel-header">
          <h3 class="panel-title">业务场景使用情况</h3>
          <div class="filter-tabs">
            <span class="active">近一周</span><span>近一月</span><span>累计</span>
          </div>
        </div>
        <div ref="pieRef" class="pie-chart-dom"></div>
        <div class="legend-container">
          <div v-for="item in chartData" :key="item.name" class="legend-row">
            <div class="legend-label">
              <i class="dot" :style="{ backgroundColor: item.color }"></i>
              {{ item.name }}
            </div>
            <div class="legend-data">
              <span class="val">{{ item.value.toLocaleString() }}</span>
              <span class="pct">{{ item.percent }}%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-panel rank-panel">
        <div class="panel-header">
          <h3 class="panel-title">子业务场景使用情况</h3>
          <div class="filter-tabs">
            <span class="active">近一周</span><span>近一月</span><span>累计</span>
          </div>
        </div>
        <div class="rank-list">
          <div v-for="(item, index) in rankingData" :key="index" class="rank-item">
            <span :class="['index-tag', { 'top': index < 3 }]">{{ index + 1 }}</span>
            <span class="scene-name">{{ item.name }}</span>
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: item.percent }"></div>
            </div>
            <div class="rank-data">
              <span class="val">{{ item.value.toLocaleString() }}</span>
              <span class="pct">{{ item.percent }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import * as echarts from 'echarts';

// 模拟数据
const topStats = [
  { title: '呼叫记录总数量', value: '130,534', monthly: '5190', yoy: '0.52', qoq: '1.64', type: 'blue', icon: '📞', iconBg: 'bg-blue' },
  { title: '服务人次数量', value: '109,081', monthly: '2316', yoy: '0.52', qoq: '1.64', type: 'teal', icon: '👥', iconBg: 'bg-teal' },
  { title: '服务用户数量', value: '6,897', monthly: '368', yoy: '0.52', qoq: '1.64', type: 'orange', icon: '👤', iconBg: 'bg-orange' }
];

const chartData = [
  { name: '趣味通话', value: 41782, percent: '42.34', color: '#4d7cfe' },
  { name: '智能翻译', value: 20645, percent: '22.92', color: '#46d1c2' },
  { name: '点亮屏幕', value: 22874, percent: '21.18', color: '#ff9f43' },
  { name: '通话字幕', value: 13381, percent: '13.56', color: '#b37feb' }
];

const rankingData = [
  { name: '趣味通话 - 虚拟背景', value: 13815, percent: '14.00%' },
  { name: '智能翻译 - 智能翻译', value: 13564, percent: '13.75%' },
  { name: '点亮屏幕 - 点亮屏幕', value: 12782, percent: '12.95%' },
  { name: '趣味通话 - 虚拟头像', value: 10697, percent: '10.84%' },
  { name: '趣味通话 - 通话特效', value: 10352, percent: '10.49%' },
  { name: '智能翻译 - 虚拟背景', value: 9053, percent: '9.17%' },
  { name: '点亮屏幕 - 数字人', value: 8627, percent: '8.74%' },
  { name: '点亮屏幕 - 虚拟背景', value: 7820, percent: '7.92%' },
  { name: '通话字幕 - 虚拟背景', value: 6782, percent: '6.87%' },
  { name: '智能翻译 - 虚拟背景', value: 5200, percent: '5.27%' }
];

const pieRef = ref(null);

onMounted(() => {
  const chart = echarts.init(pieRef.value);
  chart.setOption({
    title: {
      text: '{val|98,682}\n{label|使用总数量}',
      left: 'center', top: 'center',
      textStyle: { rich: { val: { fontSize: 24, fontWeight: 'bold', color: '#333' }, label: { fontSize: 12, color: '#999', lineHeight: 20 } } }
    },
    series: [{
      type: 'pie', radius: ['65%', '85%'],
      label: { show: false },
      data: chartData.map(d => ({ value: d.value, itemStyle: { color: d.color } }))
    }]
  });
});
</script>

<style scoped>
/* 全局容器使用 Flex 垂直排列 */
.dashboard-root {
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: #f0f4f8;
  min-height: 100%;
  gap: 20px;
}

/* Header 使用 Flex 两端对齐 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
}
.title { font-size: 16px; font-weight: bold; margin: 0; }
.tag-menu {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  width: 120px;
  font-size: 12px;
}
.menu-item { padding: 8px 12px; color: #666; cursor: pointer; }
.menu-item.active { background: #eef4ff; color: #4d7cfe; }

/* 统计卡片行 Flex 布局 */
.stats-container {
  display: flex;
  gap: 20px;
}
.stat-card {
  flex: 1; /* 等分宽度 */
  display: flex;
  flex-direction: column;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.7);
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}
.blue { background: linear-gradient(135deg, #f2f6ff, #e8eeff); }
.teal { background: linear-gradient(135deg, #f2faf9, #e8f5f3); }
.orange { background: linear-gradient(135deg, #fff9f2, #fff3e6); }

.card-top { display: flex; justify-content: space-between; margin-bottom: 15px; }
.info { display: flex; flex-direction: column; }
.label { font-size: 12px; color: #666; }
.number { font-size: 24px; font-weight: bold; margin-top: 4px; }
.icon-box { 
  display: flex; align-items: center; justify-content: center;
  width: 44px; height: 44px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
.bg-blue { background: #4d7cfe; }
.bg-teal { background: #46d1c2; }
.bg-orange { background: #ff9f43; }

.card-bottom { display: flex; gap: 15px; font-size: 11px; color: #999; }
.dark { color: #333; }
.up { color: #f5222d; }
.down { color: #52c41a; }

/* 详情区布局 */
.details-container {
  display: flex;
  gap: 20px;
}
.pie-panel { flex: 1; }
.rank-panel { flex: 2; }
.chart-panel {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.panel-title { font-size: 14px; font-weight: bold; margin: 0; }
.filter-tabs { display: flex; background: #f5f5f5; padding: 2px; border-radius: 4px; font-size: 11px; }
.filter-tabs span { padding: 4px 12px; cursor: pointer; color: #999; }
.filter-tabs span.active { background: #fff; color: #4d7cfe; border-radius: 3px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }

/* 环形图区域 Flex */
.pie-chart-dom { height: 220px; }
.legend-container { display: flex; flex-direction: column; gap: 10px; margin-top: 10px; }
.legend-row { display: flex; justify-content: space-between; font-size: 12px; }
.legend-label { display: flex; align-items: center; color: #666; }
.dot { width: 8px; height: 8px; border-radius: 50%; margin-right: 8px; }
.legend-data { display: flex; width: 120px; justify-content: space-between; font-weight: 500; }
.pct { color: #bbb; }

/* 排行榜 Flex */
.rank-list { display: flex; flex-direction: column; gap: 14px; }
.rank-item { display: flex; align-items: center; font-size: 12px; }
.index-tag { 
  display: flex; align-items: center; justify-content: center;
  width: 20px; height: 20px; border-radius: 50%; background: #f0f0f0; color: #999; font-weight: bold; margin-right: 12px;
}
.index-tag.top { background: #fff1e6; color: #ff9f43; }
.scene-name { width: 140px; color: #666; }
.progress-track { flex: 1; background: #f0f5ff; height: 8px; border-radius: 4px; margin: 0 15px; position: relative; }
.progress-fill { height: 100%; background: linear-gradient(to right, #a0c4ff, #4d7cfe); border-radius: 4px; }
.rank-data { display: flex; width: 110px; justify-content: space-between; font-weight: bold; }
</style>