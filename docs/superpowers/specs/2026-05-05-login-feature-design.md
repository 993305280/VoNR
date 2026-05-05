# 登录功能设计文档

## 目标

为 CDR管理平台（交互通话业务平台）添加登录功能。用户访问系统时先进入登录页，登录成功后才能进入后台管理页面。当前阶段使用前端模拟验证，后续对接真实 API。

## 页面结构

### 路由

- 新增 `/login` 路由，指向 `Login.vue`，独立于 Layout 之外
- `/` 路由保持不变，作为登录后的主入口（重定向到 `/dashboard`）

### 页面布局

- 全屏容器，背景色 `#EBF4FF`（浅蓝）
- 登录卡片水平垂直居中，宽度约 400px，白色圆角
- 卡片内从上到下：标题"欢迎登录" → 用户名输入框 → 密码输入框（含显示/隐藏切换） → 验证码输入框 + canvas 图片 → 登录按钮
- 底部居中显示浏览器推荐信息："浏览器推荐使用：谷歌(Chrome)、火狐(Firefox)、360(极速模式)、IE10(以上)版本！"

## 表单字段

| 字段 | 组件 | 说明 |
|------|------|------|
| 用户名 | el-input | placeholder "请输入用户名"，用户图标前缀 |
| 密码 | el-input type="password" | placeholder "请输入密码"，锁图标前缀，末尾眼睛图标切换明文/密文 |
| 验证码 | el-input + canvas | 左侧输入框 placeholder "验证码"，右侧 canvas 图片，点击刷新 |

## Mock 验证码逻辑

- 随机生成 4 位字符（数字 + 大写字母组合）
- canvas 绘制字符，加干扰线和噪点增加识别难度
- 点击图片刷新验证码（重新随机生成）
- 验证时不区分大小写

## Mock 登录验证

- 硬编码用户名：`admin`，密码：`123456`
- 验证码：用户输入与 canvas 生成的字符匹配（不区分大小写）
- 字段为空时 el-input 显示"请输入xxx"提示

## 状态管理

### Pinia Store（`stores/auth.js`）

**State：**
- `isLoggedIn`（boolean）— 登录状态
- `userInfo`（object）— 用户信息，包含 username 等字段

**Actions：**
- `login(username)` — 设置 isLoggedIn 为 true，写入 userInfo，同步写入 localStorage
- `logout()` — 清除登录状态，清除 localStorage

**初始化：**
- store 创建时从 localStorage 恢复 isLoggedIn 和 userInfo

### 持久化

- localStorage key：`auth`，存储 JSON 格式的 `{ isLoggedIn, userInfo }`
- 刷新页面时从 localStorage 恢复状态，保持登录

## 路由守卫

在 `router/index.js` 中添加 `beforeEach` 全局前置守卫：

- `/login` 路由不需要登录验证
- 其他所有路由需要登录验证
- 未登录访问需要验证的路由 → 跳转 `/login`
- 已登录访问 `/login` → 跳转 `/dashboard`

## 交互细节

- 登录按钮点击后显示 loading 状态，mock 0.5 秒延迟模拟请求
- 验证码错误：el-message 提示"验证码错误"，自动刷新验证码图片
- 用户名或密码错误：el-message 提示"用户名或密码错误"
- 登录成功：el-message 提示"登录成功"，跳转 `/dashboard`

## 涉及文件

| 操作 | 文件路径 |
|------|----------|
| 新增 | `src/views/Login.vue` |
| 新增 | `src/stores/auth.js` |
| 修改 | `src/router/index.js` |
