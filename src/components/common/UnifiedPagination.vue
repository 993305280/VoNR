<template>
  <div class="pagination-wrapper">
    <span>共{{ total }}条</span>
    <el-pagination
      background
      layout="prev, pager, next, jumper, sizes"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      :page-sizes="[10, 20, 50, 100]"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  total: { type: Number, default: 360 },
  currentPage: { type: Number, default: 1 },
  pageSize: { type: Number, default: 10 }
})

const emit = defineEmits(['page-change', 'size-change'])

const handleCurrentChange = (page) => {
  emit('page-change', page)
}

const handleSizeChange = (size) => {
  emit('size-change', size)
}
</script>

<style lang="scss" scoped>
.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  color: #606266;
  font-size: 13px;
}
</style>
