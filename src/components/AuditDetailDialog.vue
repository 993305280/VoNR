<template>
  <el-dialog v-model="visible" title="送审内容" width="550px" custom-class="audit-dialog">
    <div class="detail-list">
      <div class="detail-item" v-for="item in details" :key="item.label">
        <div class="label-box">{{ item.label }}</div>
        <div class="content-box">{{ item.value }}</div>
      </div>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
.detail-list {
  padding: 10px;
  .detail-item {
    display: flex;
    margin-bottom: 12px;
    align-items: flex-start;
    .label-box {
      width: 100px;
      background-color: #f5f7fa;
      color: #333;
      text-align: center;
      padding: 8px 0;
      border-radius: 4px;
      font-weight: bold;
      font-size: 13px;
      margin-right: 15px;
    }
    .content-box {
      flex: 1;
      padding: 8px 0;
      color: #333;
      line-height: 1.5;
    }
  }
}
</style>