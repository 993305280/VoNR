<template>
  <div class="material-manager">
    <div class="tabs-header">
      <div 
        v-for="tab in ['图片', '音频', '视频', '文本']" 
        :key="tab" 
        :class="['tab-item', { active: currentTab === tab }]"
        @click="currentTab = tab"
      >
        {{ tab }}
      </div>
    </div>

    <div class="filter-bar">
      <el-form :inline="true" :model="searchForm" size="default">
        <el-form-item label="素材名称">
          <el-input v-model="searchForm.name" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="searchForm.auditStatus" placeholder="全部状态" style="width: 150px">
            <el-option label="审核中" value="审核中" />
            <el-option label="审核成功" value="审核成功" />
            <el-option label="审核失败" value="审核失败" />
          </el-select>
        </el-form-item>
        <el-form-item label="可用状态">
          <el-select v-model="searchForm.useStatus" placeholder="全部状态" style="width: 150px">
            <el-option label="可用" value="可用" />
            <el-option label="不可用" value="不可用" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" color="#1d4ed8">查询</el-button>
          <el-button plain>重置</el-button>
        </el-form-item>
      </el-form>

      <div class="action-buttons">
        <el-button type="primary" icon="Refresh" @click="handleSync">同步素材</el-button>
        <el-button type="primary" icon="Plus" @click="handleAdd">新增{{ currentTab }}素材</el-button>
        <el-button type="danger" icon="Delete" plain @click="handleBatchDelete">删除素材</el-button>
      </div>
    </div>

    <!-- 图片 Tab -->
    <ImageTab v-if="currentTab === '图片'" ref="imageTabRef" />

    <!-- 音频 Tab -->
    <AudioTab v-if="currentTab === '音频'" ref="audioTabRef" />

    <!-- 视频 Tab -->
    <VideoTab v-if="currentTab === '视频'" ref="videoTabRef" />

    <!-- 文本 Tab -->
    <TextTab v-if="currentTab === '文本'" ref="textTabRef" />

  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Plus, Refresh, Delete } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import AudioTab from '@/components/audio/AudioTab.vue'
import VideoTab from '@/components/video/VideoTab.vue'
import TextTab from '@/components/text/TextTab.vue'
import ImageTab from '@/components/image/ImageTab.vue'

const currentTab = ref('图片')
const audioTabRef = ref(null)
const videoTabRef = ref(null)
const textTabRef = ref(null)
const imageTabRef = ref(null)

const searchForm = reactive({
  name: '',
  auditStatus: '',
  useStatus: ''
})


const handleBatchDelete = async () => {
  if (currentTab.value === '图片') {
    const confirmed = await ElMessageBox.confirm(
      `确定要删除选中的图片素材吗？`,
      '批量删除确认',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).catch(() => false)
    if (confirmed) {
      imageTabRef.value?.handleBatchDelete()
    }
  } else if (currentTab.value === '音频') {
    audioTabRef.value?.handleBatchDelete()
  } else if (currentTab.value === '视频') {
    videoTabRef.value?.handleBatchDelete()
  } else if (currentTab.value === '文本') {
    textTabRef.value?.handleBatchDelete()
  }
}

const handleSync = () => {
  ElMessage.info('同步素材功能开发中')
}

const handleAdd = () => {
  if (currentTab.value === '图片') {
    imageTabRef.value?.openAdd()
  }
}

</script>

<style scoped>
/* 容器布局 */
.material-manager {
  /* padding: 20px; */
  background-color: #fff;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}

/* 顶部标签 */
.tabs-header {
  display: flex;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 20px;
  flex-shrink: 0;
}
.tab-item {
  padding: 10px 25px;
  cursor: pointer;
  color: #606266;
  font-size: 14px;
  /* transition: all 0.1s; */
}
.tab-item.active {
  color: #1d4ed8;
  font-weight: bold;
  border-bottom: 2px solid #1d4ed8;
}

/* 过滤栏 */
.filter-bar {
  background: #fff;
  padding: 20px 20px 0;
  border-radius: 4px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-shrink: 0;
}

/* 深度覆盖 Element Plus */
:deep(.el-button--primary) {
  --el-button-bg-color: #1d4ed8;
}
</style>