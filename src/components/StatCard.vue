<template>
  <div class="stat-card">
    <div class="stat-icon">
      <el-icon><component :is="icon" /></el-icon>
    </div>
    <div class="stat-content">
      <div class="stat-title">{{ title }}</div>
      <div class="stat-value">{{ formatValue(value) }}</div>
      <div class="stat-monthly">
        <span class="monthly-label">本月</span>
        <span class="monthly-value">{{ formatValue(monthly) }}</span>
      </div>
      <div class="stat-trend">
        <span class="trend-label">同比</span>
        <span :class="{ positive: yoy > 0, negative: yoy < 0 }">
          {{ yoy > 0 ? '+' : '' }}{{ yoy.toFixed(2) }}%
        </span>
        <span class="trend-divider">|</span>
        <span class="trend-label">环比</span>
        <span :class="{ positive: mom > 0, negative: mom < 0 }">
          {{ mom > 0 ? '+' : '' }}{{ mom.toFixed(2) }}%
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: String,
  value: Number,
  monthly: Number,
  yoy: Number,
  mom: Number,
  icon: Object
})

const formatValue = (val) => {
  if (val === undefined || val === null) return '0'
  return val.toLocaleString()
}
</script>

<style scoped>
.stat-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.stat-card:hover {
  box-shadow: 0 4px 16px rgba(33, 150, 243, 0.2);
  transform: translateY(-2px);
}

.stat-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon .el-icon {
  font-size: 32px;
  color: #ffffff;
}

.stat-content {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #666666;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #333333;
  line-height: 1;
  margin-bottom: 12px;
}

.stat-monthly {
  font-size: 14px;
  color: #666666;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.monthly-label {
  font-weight: 400;
}

.monthly-value {
  font-weight: 600;
  color: #333333;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.trend-label {
  color: #999999;
}

.trend-divider {
  color: #e4e7ed;
  margin: 0 4px;
}

.stat-trend span.positive {
  color: #4caf50;
  font-weight: 500;
}

.stat-trend span.negative {
  color: #f44336;
  font-weight: 500;
}
</style>
