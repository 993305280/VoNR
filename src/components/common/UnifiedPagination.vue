<template>
  <div class="pagination-wrapper">
    <span>共{{ total }}条</span>
    <el-pagination
      background
      layout="prev, pager, next, jumper, sizes"
      :total="total"
    />
  </div>
</template>

<script setup>
defineProps({
  total: { type: Number, default: 360 }
})
</script>

<style lang="scss" scoped>
.pagination-wrapper {
  margin-top: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  color: #606266;
  font-size: 13px;
}
</style>
