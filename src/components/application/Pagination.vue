<template>
  <div class="pagination">
    <span class="pagination-total">共 {{ total }} 条</span>
    <div class="pagination-controls">
      <el-button
        :disabled="currentPage === 1"
        class="pagination-btn"
        @click="handlePrev"
      >
        &lt;
      </el-button>
      <span class="pagination-page">{{ currentPage }} / {{ totalPages }}</span>
      <el-button
        :disabled="currentPage === totalPages"
        class="pagination-btn"
        @click="handleNext"
      >
        &gt;
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 10
  },
  total: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:currentPage', 'change'])

const totalPages = computed(() => {
  return Math.ceil(props.total / props.pageSize)
})

const handlePrev = () => {
  if (props.currentPage > 1) {
    emit('update:currentPage', props.currentPage - 1)
    emit('change', props.currentPage - 1)
  }
}

const handleNext = () => {
  if (props.currentPage < totalPages.value) {
    emit('update:currentPage', props.currentPage + 1)
    emit('change', props.currentPage + 1)
  }
}
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-top: none;
}

.pagination-total {
  font-size: 13px;
  color: #666666;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d9d9d9;
  background: #ffffff;
  font-size: 12px;
  color: #666666;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  color: #1890ff;
  border-color: #1890ff;
}

.pagination-btn:disabled {
  color: #cccccc;
  cursor: not-allowed;
  background: #fafafa;
}

.pagination-page {
  font-size: 13px;
  color: #666666;
  min-width: 50px;
  text-align: center;
}
</style>
