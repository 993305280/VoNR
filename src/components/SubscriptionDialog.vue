<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="用户号码" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入用户号码" />
      </el-form-item>
      <el-form-item label="应用ID" prop="appId">
        <el-select v-model="form.appId" placeholder="请选择应用ID" class="w-full">
          <el-option label="1 - 企业品牌宣传应用5" :value="1" />
          <el-option label="2 - 公益宣传应用1" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="应用名称" prop="appName">
        <el-input v-model="form.appName" placeholder="请输入应用名称" />
      </el-form-item>
      <el-form-item label="订购时间" prop="subscriptionTime">
        <el-date-picker
          v-model="form.subscriptionTime"
          type="datetime"
          placeholder="选择订购时间"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          class="w-full"
        />
      </el-form-item>
      <el-form-item label="业务场景" prop="businessScene">
        <el-input v-model="form.businessScene" placeholder="请输入业务场景" />
      </el-form-item>
      <el-form-item label="子业务场景" prop="subScenes">
        <el-input v-model="form.subScenes" placeholder="请输入子业务场景" />
      </el-form-item>
      <el-form-item label="应用说明" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入应用说明" />
      </el-form-item>
      <el-form-item label="操作者" prop="operator">
        <el-input v-model="form.operator" placeholder="请输入操作者" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['save'])

const visible = ref(false)
const title = ref('新增订购')
const formRef = ref()

const form = reactive({
  id: null,
  phone: '',
  appId: null,
  appName: '',
  subscriptionTime: '',
  businessScene: '',
  subScenes: '',
  description: '',
  operator: ''
})

const rules = {
  phone: [
    { required: true, message: '请输入用户号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  appId: [
    { required: true, message: '请选择应用ID', trigger: 'change' }
  ],
  subscriptionTime: [
    { required: true, message: '请选择订购时间', trigger: 'change' }
  ]
}

const open = (dialogTitle, row = null) => {
  title.value = dialogTitle
  visible.value = true
  if (row) {
    form.id = row.id
    form.phone = row.phone
    form.appId = row.appId
    form.appName = row.appName
    form.subscriptionTime = row.subscriptionTime
    form.businessScene = row.businessScene
    form.subScenes = row.subScenes
    form.description = row.description
    form.operator = row.operator
  } else {
    resetForm()
  }
}

const close = () => {
  visible.value = false
}

const resetForm = () => {
  form.id = null
  form.phone = ''
  form.appId = null
  form.appName = ''
  form.subscriptionTime = ''
  form.businessScene = ''
  form.subScenes = ''
  form.description = ''
  form.operator = ''
  formRef.value?.clearValidate()
}

const handleClose = () => {
  resetForm()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    emit('save', { ...form })
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

defineExpose({ open, close })
</script>

<style lang="scss" scoped>
.w-full {
  width: 100%;
}
</style>
