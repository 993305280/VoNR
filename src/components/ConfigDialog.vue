<template>
  <el-dialog v-model="visible" :title="title" width="600px" align-center>
    <el-form :model="form" label-width="100px" class="config-form">
      <el-form-item label="业务指令" required :error="isEdit ? '此业务指令已存在，请重新填写！' : ''">
        <el-input v-model="form.code" placeholder="请输入" :class="{ 'error-border': isEdit }" />
      </el-form-item>
      
      <el-form-item label="应用名称" required>
        <div class="input-with-icon">
          <el-input v-model="form.appName" placeholder="请关联应用" />
          <el-icon class="link-icon" @click="openLinkApp"><Link /></el-icon>
        </div>
      </el-form-item>

      <el-form-item label="业务场景" required>
        <el-input v-model="form.scene" placeholder="请关联应用" disabled />
      </el-form-item>

      <el-form-item label="子业务场景" required>
        <el-input v-model="form.subScene" placeholder="请关联应用" disabled />
      </el-form-item>

      <el-form-item label="操作类型" required>
        <el-select v-model="form.type" placeholder="请选择操作类型" class="w-100">
          <el-option label="启动" value="启动" />
        </el-select>
      </el-form-item>

      <el-form-item label="状态" required>
        <el-switch v-model="form.status" active-text="启用" inactive-text="禁用" inline-prompt />
      </el-form-item>

      <el-form-item label="渠道" required>
        <el-radio-group v-model="form.channel">
          <el-radio label="DC">DC</el-radio>
          <el-radio label="VC">VC</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="说明">
        <el-input v-model="form.desc" type="textarea" :rows="4" placeholder="请输入" />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false" class="btn-cancel">取消</el-button>
        <el-button type="primary" @click="save" class="btn-save">保存</el-button>
      </div>
    </template>

    <LinkAppDialog ref="linkAppRef" @select="handleAppSelect" />
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Link } from '@element-plus/icons-vue'
import LinkAppDialog from './LinkAppDialog.vue'

const visible = ref(false)
const title = ref('')
const isEdit = ref(false)
const linkAppRef = ref()

const emit = defineEmits(['refresh'])

const form = reactive({
  code: '',
  appName: '',
  scene: '',
  subScene: '',
  type: '',
  status: true,
  channel: 'DC',
  desc: ''
})

// 打开弹窗
const open = (dialogTitle, rowData) => {
  title.value = dialogTitle

  if (rowData) {
    // 编辑模式，填充数据
    isEdit.value = true
    form.code = rowData.code
    form.appName = rowData.appName
    form.scene = rowData.scene
    form.subScene = rowData.subScene
    form.type = rowData.type
    form.status = rowData.status
    form.channel = rowData.channel
    form.desc = rowData.desc || ''
  } else {
    // 新增模式，重置表单
    isEdit.value = false
    form.code = ''
    form.appName = ''
    form.scene = ''
    form.subScene = ''
    form.type = ''
    form.status = true
    form.channel = 'DC'
    form.desc = ''
  }

  visible.value = true
}

// 保存
const save = () => {
  // 这里添加保存逻辑，可以调用API
  console.log('保存数据:', { ...form })

  // 触发刷新事件
  emit('refresh')

  // 关闭弹窗
  visible.value = false
}

// 打开关联应用弹窗
const openLinkApp = () => {
  linkAppRef.value.open()
}

// 处理应用选择
const handleAppSelect = (appData) => {
  form.appName = appData.name
  form.scene = appData.scene
  form.subScene = appData.subScene
}

// 暴露方法给父组件
defineExpose({
  open
})
</script>

<style lang="scss" scoped>
.config-form {
  padding: 10px 20px;
  .error-border :deep(.el-input__wrapper) { box-shadow: 0 0 0 1px #f56c6c inset; }
  .input-with-icon {
    position: relative;
    width: 100%;
    .link-icon {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: #4079de;
      cursor: pointer;
    }
  }
}
.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
  .btn-cancel { background-color: #edf2fc; color: #4079de; border: none; width: 80px; }
  .btn-save { background-color: #4079de; width: 80px; }
}
</style>