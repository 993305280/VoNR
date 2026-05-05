<template>
  <div class="search-form">
    <el-form :model="modelValue" inline>
      <el-form-item label="应用名称">
        <el-input
          v-model="modelValue.name"
          placeholder="请输入"
          clearable
          style="width: 200px"
          @clear="emit('search')"
        />
      </el-form-item>
      <el-form-item label="审核状态">
        <el-select
          v-model="modelValue.auditStatus"
          placeholder="全部状态"
          clearable
          style="width: 150px"
          @change="emit('search')"
        >
          <el-option label="待审核" value="pending" />
          <el-option label="审核通过" value="approved" />
          <el-option label="审核失败" value="rejected" />
        </el-select>
      </el-form-item>
      <el-form-item label="可用状态">
        <el-select
          v-model="modelValue.availableStatus"
          placeholder="全部状态"
          clearable
          style="width: 150px"
          @change="emit('search')"
        >
          <el-option label="可用" value="available" />
          <el-option label="不可用" value="unavailable" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="emit('search')">查询</el-button>
        <el-button @click="emit('reset')">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['search', 'reset'])
</script>

<style scoped>
.search-form {
  background: #ffffff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.search-form :deep(.el-form-item) {
  margin-bottom: 0;
}
</style>
