<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="login-title">欢迎登录</h2>

      <el-form ref="formRef" :model="form" :rules="rules" @submit.prevent="handleLogin">
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
            size="large"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            size="large"
          >
            <template #suffix>
              <el-icon
                class="password-toggle"
                @click="showPassword = !showPassword"
              >
                <View v-if="showPassword" />
                <Hide v-else />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="captcha">
          <div class="captcha-row">
            <el-input
              v-model="form.captcha"
              placeholder="验证码"
              :prefix-icon="Picture"
              size="large"
              class="captcha-input"
              maxlength="4"
            />
            <canvas
              ref="captchaCanvas"
              class="captcha-canvas"
              width="120"
              height="40"
              @click="refreshCaptcha"
              title="点击刷新验证码"
            />
          </div>
        </el-form-item>

        <el-button
          type="primary"
          size="large"
          class="login-btn"
          :loading="loading"
          @click="handleLogin"
        >
          登录
        </el-button>
      </el-form>
    </div>

    <div class="login-footer">
      浏览器推荐使用：谷歌(Chrome)、火狐(Firefox)、360(极速模式)、IE10(以上)版本！
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, View, Hide, Picture } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref(null)
const captchaCanvas = ref(null)
const showPassword = ref(false)
const loading = ref(false)
const captchaCode = ref('')

const form = reactive({
  username: 'admin',
  password: '123456',
  captcha: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function generateCaptcha() {
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return code
}

function drawCaptcha() {
  const canvas = captchaCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  captchaCode.value = generateCaptcha()

  // 背景
  ctx.fillStyle = '#f0f0f0'
  ctx.fillRect(0, 0, 120, 40)

  // 绘制字符
  for (let i = 0; i < captchaCode.value.length; i++) {
    ctx.font = `${20 + Math.random() * 8}px Arial`
    ctx.fillStyle = `rgb(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 200})`
    ctx.textBaseline = 'middle'
    ctx.save()
    ctx.translate(20 + i * 25, 20)
    ctx.rotate((Math.random() - 0.5) * 0.4)
    ctx.fillText(captchaCode.value[i], 0, 0)
    ctx.restore()
  }

  // 干扰线
  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = `rgb(${Math.random() * 200}, ${Math.random() * 200}, ${Math.random() * 200})`
    ctx.beginPath()
    ctx.moveTo(Math.random() * 120, Math.random() * 40)
    ctx.lineTo(Math.random() * 120, Math.random() * 40)
    ctx.stroke()
  }

  // 噪点
  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`
    ctx.fillRect(Math.random() * 120, Math.random() * 40, 1, 1)
  }
}

function refreshCaptcha() {
  drawCaptcha()
  form.captcha = ''
}

function handleLogin() {
  if (!formRef.value) return
  formRef.value.validate((valid) => {
    if (!valid) return
    doLogin()
  })
}

function doLogin() {
  if (form.captcha.toLowerCase() !== captchaCode.value.toLowerCase()) {
    ElMessage.error('验证码错误')
    refreshCaptcha()
    return
  }

  if (form.username !== 'admin' || form.password !== '123456') {
    ElMessage.error('用户名或密码错误')
    return
  }

  loading.value = true
  setTimeout(() => {
    loading.value = false
    authStore.login(form.username)
    ElMessage.success('登录成功')
    router.push('/dashboard')
  }, 500)
}

onMounted(() => {
  drawCaptcha()
})
</script>

<style scoped>
.login-container {
  width: 100%;
  height: 100vh;
  background-color: #EBF4FF;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0;
  padding: 0;
}

.login-card {
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.login-title {
  text-align: center;
  color: #409EFF;
  font-size: 24px;
  margin: 0 0 30px 0;
  font-weight: 600;
}

.captcha-row {
  display: flex;
  gap: 12px;
  width: 100%;
}

.captcha-input {
  flex: 1;
}

.captcha-canvas {
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  flex-shrink: 0;
}

.password-toggle {
  cursor: pointer;
  color: #909399;
}

.password-toggle:hover {
  color: #409EFF;
}

.login-btn {
  width: 100%;
  margin-top: 10px;
}

.login-footer {
  position: fixed;
  bottom: 20px;
  color: #909399;
  font-size: 13px;
}
</style>
