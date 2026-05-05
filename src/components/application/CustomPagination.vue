<template>
  <div class="custom-pagination">
    <span class="total-text">共{{ total }}条</span>
    <el-pagination
      :current-page="current"
      :page-size="pageSize"
      :total="total"
      :page-sizes="[10, 20, 50, 100]"
      layout="prev, pager, next"
      @current-change="handlePageChange"
    />
    <div class="page-size-wrapper">
      <span class="goto-text">前往</span>
      <el-input
        v-model.number="gotoPage"
        class="goto-input"
        :min="1"
        :max="Math.ceil(total / pageSize)"
        @keyup.enter="handleGoto"
      />
      <span class="goto-text">页</span>
      <el-select v-model="localPageSize" style="width: 100px" @change="handleSizeChange">
        <el-option label="10条/页" :value="10" />
        <el-option label="20条/页" :value="20" />
        <el-option label="50条/页" :value="50" />
        <el-option label="100条/页" :value="100" />
      </el-select>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  total: {
    type: Number,
    default: 0
  },
  current: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits(['page-change', 'size-change'])

const gotoPage = ref(props.current)
const localPageSize = ref(props.pageSize)

watch(() => props.current, (val) => {
  gotoPage.value = val
})

watch(() => props.pageSize, (val) => {
  localPageSize.value = val
})

const handlePageChange = (page) => {
  gotoPage.value = page
  emit('page-change', page)
}

const handleSizeChange = (size) => {
  emit('size-change', size)
}

const handleGoto = () => {
  const maxPage = Math.ceil(props.total / props.pageSize)
  if (gotoPage.value >= 1 && gotoPage.value <= maxPage) {
    emit('page-change', gotoPage.value)
  } else {
    gotoPage.value = props.current
  }
}
</script>

<style scoped>
.custom-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  padding: 16px 20px;
  border-radius: 8px;
  margin-top: 16px;
}

.total-text {
  color: #262626;
  font-size: 14px;
}

.page-size-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.goto-text {
  color: #262626;
  font-size: 14px;
}

.goto-input {
  width: 50px;
}

.goto-input :deep(.el-input__inner) {
  text-align: center;
}
</style>
