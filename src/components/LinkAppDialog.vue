<template>
  <el-dialog v-model="visible" title="关联应用" width="900px">
    <div class="search-box">
      <span>应用名称</span>
      <el-input v-model="searchName" style="width: 240px; margin: 0 15px;" placeholder="请输入" />
      <el-button type="primary" class="btn-query" @click="query">查询</el-button>
      <el-button class="btn-reset" @click="reset">重置</el-button>
    </div>

    <el-table :data="filteredAppList" style="width: 100%" highlight-current-row>
      <el-table-column width="50">
        <template #default="scope">
          <el-radio v-model="selectedId" :label="scope.row.id">&nbsp;</el-radio>
        </template>
      </el-table-column>
      <el-table-column prop="id" label="应用ID" />
      <el-table-column prop="name" label="应用名称" />
      <el-table-column prop="scene" label="业务场景" />
      <el-table-column prop="subScene" label="子业务场景" />
      <el-table-column prop="desc" label="应用说明" show-overflow-tooltip />
    </el-table>

    <div class="pagination-wrapper">
       <el-pagination small background layout="total, prev, pager, next" :total="360" />
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="submit" class="btn-save">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const visible = ref(false)
const searchName = ref('')
const selectedId = ref('')

// 模拟数据
const appList = ref([
  { id: '001', name: '企业品牌宣传应用5', scene: '001趣味通话', subScene: '001001虚拟背景', desc: '企业品牌宣传应用说明' },
  { id: '002', name: '企业品牌宣传应用6', scene: '002视频彩铃', subScene: '002001个性化彩铃', desc: '企业品牌宣传应用说明' },
  { id: '003', name: '企业品牌宣传应用7', scene: '003智能客服', subScene: '003001语音导航', desc: '企业品牌宣传应用说明' },
  { id: '004', name: '企业品牌宣传应用8', scene: '004会议系统', subScene: '004001视频会议', desc: '企业品牌宣传应用说明' },
  { id: '005', name: '企业品牌宣传应用9', scene: '005远程协作', subScene: '005001文件共享', desc: '企业品牌宣传应用说明' },
])

const emit = defineEmits(['select'])

// 过滤后的应用列表
const filteredAppList = computed(() => {
  if (!searchName.value.trim()) {
    return appList.value
  }
  return appList.value.filter(app =>
    app.name.includes(searchName.value.trim()) ||
    app.id.includes(searchName.value.trim())
  )
})

// 打开弹窗
const open = () => {
  visible.value = true
  // 重置选择
  selectedId.value = ''
  searchName.value = ''
}

// 查询 - 实际过滤由计算属性处理，这里可以留空或添加API调用
const query = () => {
  console.log('查询应用:', searchName.value)
}

// 重置
const reset = () => {
  searchName.value = ''
}

// 提交选择
const submit = () => {
  if (!selectedId.value) {
    // 如果没有选择，可以给出提示
    console.log('请先选择应用')
    return
  }

  const selectedApp = appList.value.find(app => app.id === selectedId.value)
  if (selectedApp) {
    emit('select', selectedApp)
    visible.value = false
  }
}

// 暴露open方法给父组件
defineExpose({
  open
})
</script>

