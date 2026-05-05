# 登录功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 CDR管理平台添加登录功能，包含页面、状态管理和路由守卫。

**Architecture:** 新增 `Login.vue` 页面组件（含 canvas 验证码）、`stores/auth.js` Pinia 状态管理，修改路由配置添加守卫。先创建 store，再创建页面，最后接入路由。

**Tech Stack:** Vue 3, Pinia, Element Plus, Vue Router

---

## File Structure

| 操作 | 文件路径 | 职责 |
|------|----------|------|
| 新增 | `src/stores/auth.js` | 登录状态管理，localStorage 持久化 |
| 新增 | `src/views/Login.vue` | 登录页面，含表单、验证码、mock 验证 |
| 修改 | `src/router/index.js` | 新增 /login 路由 + beforeEach 守卫 |

---

### Task 1: 创建 Pinia 认证 Store

**Files:**
- Create: `src/stores/auth.js`

- [ ] **Step 1: 创建 auth store**

```js
// src/stores/auth.js
import { defineStore } from 'pinia'

const STORAGE_KEY = 'auth'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch {
    // ignore
  }
  return { isLoggedIn: false, userInfo: null }
}

export const useAuthStore = defineStore('auth', {
  state: () => {
    const saved = loadFromStorage()
    return {
      isLoggedIn: saved.isLoggedIn,
      userInfo: saved.userInfo
    }
  },
  actions: {
    login(username) {
      this.isLoggedIn = true
      this.userInfo = { username }
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        isLoggedIn: true,
        userInfo: { username }
      }))
    },
    logout() {
      this.isLoggedIn = false
      this.userInfo = null
      localStorage.removeItem(STORAGE_KEY)
    }
  }
})
```

- [ ] **Step 2: 验证 store 目录存在**

```bash
ls src/stores/
```

Expected: 显示 `auth.js`

- [ ] **Step 3: Commit**

```bash
git add src/stores/auth.js
git commit -m "feat: add auth pinia store with localStorage persistence"
```

---

### Task 2: 创建登录页面

**Files:**
- Create: `src/views/Login.vue`

- [ ] **Step 1: 创建 Login.vue 完整组件**

```vue
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
  username: '',
  password: '',
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

async function handleLogin() {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
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
```

- [ ] **Step 2: 验证文件创建成功**

```bash
ls src/views/Login.vue
```

Expected: 文件存在

- [ ] **Step 3: Commit**

```bash
git add src/views/Login.vue
git commit -m "feat: add login page with canvas captcha"
```

---

### Task 3: 修改路由配置

**Files:**
- Modify: `src/router/index.js`

- [ ] **Step 1: 在路由文件顶部添加 Login 导入和 store 导入**

在 `src/router/index.js` 文件中，在现有的 import 语句之后、`const routes` 之前，添加：

```js
import Login from '@/views/Login.vue'
import { useAuthStore } from '@/stores/auth'
```

- [ ] **Step 2: 在 routes 数组中新增 /login 路由**

在 `const routes = [` 的最前面（`{ path: '/',` 之前），添加：

```js
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
```

- [ ] **Step 3: 在 router 创建之后添加路由守卫**

在 `export default router` 之前，添加：

```js
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.path !== '/login' && !authStore.isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && authStore.isLoggedIn) {
    next('/dashboard')
  } else {
    next()
  }
})
```

- [ ] **Step 4: 验证路由文件语法正确**

```bash
node -e "import('./src/router/index.js').then(() => console.log('OK')).catch(e => console.error(e.message))"
```

Expected: 无语法错误（模块解析错误可忽略，那是 Node 环境差异）

- [ ] **Step 5: Commit**

```bash
git add src/router/index.js
git commit -m "feat: add /login route and auth guard"
```

---

### Task 4: 验证整体功能

- [ ] **Step 1: 启动开发服务器**

```bash
npm run dev
```

- [ ] **Step 2: 手动验证以下场景**

1. 访问 `http://localhost:5173/` → 应自动跳转到 `/login`
2. 登录页显示正确：标题、用户名/密码/验证码输入框、canvas 验证码图片
3. 点击验证码图片 → 验证码刷新
4. 不输入直接点登录 → 表单校验提示
5. 输入错误验证码 → 提示"验证码错误"，验证码刷新
6. 输入正确验证码 + 错误用户名密码 → 提示"用户名或密码错误"
7. 输入 `admin` / `123456` / 正确验证码 → 提示"登录成功"，跳转到 dashboard
8. 登录后刷新页面 → 保持登录状态，不跳回登录页
9. 访问 `http://localhost:5173/login` → 已登录状态下自动跳转到 dashboard

- [ ] **Step 3: Commit 最终状态**

```bash
git add -A
git commit -m "feat: login feature complete"
```
