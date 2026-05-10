# CDR管理平台

基于 Vue3 + Vite + Element Plus + ECharts 的后台管理系统
花了几天利用claude code + mimo模型，按照还可以打开的ui设计图从0到1模仿出的公司项目。
前端功能完成度90%，ui还原度80%，换成Gemini模型ui还原度还能更高，期间没有手敲或手修改过一行代码。

VoNR 交互通话业务平台 — 功能与技术栈总结
前端
技术栈： Vue 3 (Composition API / <script setup>) + Vite + Pinia + Vue Router 4 + Element Plus + ECharts + Sass
已完成功能（前后端已对接）
登录认证 (/login) — 用户名密码登录 + Canvas 验证码，JWT Token 自动管理
动态菜单与权限 — RBAC 权限体系，根据角色动态生成侧边栏菜单，支持三级嵌套
主框架布局 (/) — 顶栏 + 可折叠侧边栏 + 多标签页导航（支持右键关闭）
应用管理 (/business/application) — 增删改查 + 搜索筛选 + 批量删除 + 同步
业务配置管理 (/business/config) — 增删改查 + 多条件搜索 + 审核详情查看
用户订购关系 (/user/list) — 增删改查 + 手机号/时间范围搜索 + 悬浮气泡查看详情
素材库-图片 (/system/overview) — 增删改查 + 多文件上传 + 缩略图 + 审核状态
呼叫记录数量统计 (/data/statistics/call-count) — 时间序列折线图，支持 今日/本月/本年/自定义 + 小时/日/月粒度
服务人次统计 (/data/statistics/service-count) — 多系列面积图，按业务场景（趣味通话/智能翻译/点亮屏幕/通话字幕）分组
服务用户数统计 (/data/statistics/user-count) — 多系列面积图，按业务场景分组，统计独立用户数
UI 完成但使用模拟数据
数据概览仪表盘 (/dashboard) — KPI 卡片 + 环形图 + 排行榜，目前为硬编码数据
CDR 明细 (/cdr/detail) — 通话明细表格，硬编码数据
通话记录 (/cdr/calls) — 通话记录表格，硬编码数据
计费明细 (/cdr/charges) — 计费信息表格，硬编码数据
计费套餐 (/cdr/billing) — 套餐增删改查（客户端内存 CRUD）
操作日志 (/log/list) — 审计日志表格，硬编码数据
素材库-音频/视频/文字 (/system/overview) — UI 完整，composable 中使用模拟数据

后端
技术栈： Express.js + MySQL2 + JWT (jsonwebtoken + bcryptjs) + Multer (文件上传) + Sharp (图片处理) + dotenv
API 端点（全部挂载在 /api/v1 下）
认证
POST /auth/login — 登录，返回 JWT Token
POST /auth/logout — 登出
GET /auth/profile — 获取当前用户信息
菜单/权限
GET /menus — 根据角色返回动态菜单树
GET /permissions — 返回当前用户权限列表
图片素材
GET/POST/PUT/DELETE /images — 增删改查 + 文件上传
POST /images/batch-delete — 批量删除
应用管理
GET/POST/PUT/DELETE /applications — 增删改查 + 分页
POST /applications/batch-delete — 批量删除
业务配置
GET/POST/PUT/DELETE /business-configs — 增删改查 + 多条件筛选
POST /business-configs/batch-delete — 批量删除
用户订购
GET/POST/PUT/DELETE /user-subscriptions — 增删改查 + 手机号/时间筛选
POST /user-subscriptions/batch-delete — 批量删除
统计
GET /statistics/call-count — 呼叫数量按时间聚合
GET /statistics/service-count — 服务人次按场景+时间聚合
GET /statistics/user-count — 独立用户数按场景+时间聚合
数据库表
users — 用户账号（bcrypt 密码）
roles / user_roles / role_menus / menus — RBAC 权限体系
images — 图片素材
applications — 应用管理
business_configs — 业务配置
user_subscriptions — 用户订购关系
call_records — 通话记录（含 business_scene 业务场景字段）
架构模式
Model / Controller / Service / Route 四层分离
所有业务接口需 JWT 认证（authMiddleware）
MySQL2 连接池，参数化查询防 SQL 注入
图片存储按 uploads/images/YYYY/MM/DD/ 日期目录组织
## 前端技术栈

核心框架
Vue 3.4 — 渲染框架，使用 Composition API + <script setup> 语法
Vite 5 — 构建工具
Vue Router 4 — 路由管理
Pinia 2 — 状态管理

UI 组件
Element Plus 2.5 — UI 组件库（表格、表单、弹窗、分页等）
@element-plus/icons-vue 2.3 — Element Plus 图标库

图表
ECharts 5.4 — 图表引擎
vue-echarts 6.6 — Vue 3 的 ECharts 封装组件

样式
Sass — CSS 预处理器
Tailwind CSS 4.2 — 原子化 CSS（通过 PostCSS 集成）
PostCSS + Autoprefixer — CSS 后处理

其他
Axios 1.16 — HTTP 请求库
wavesurfer.js 7.12 — 音频波形可视化播放器
ESLint + eslint-plugin-vue — 代码规范检查

## 后端技术栈

核心框架
Express 4.18 — Web 框架
dotenv 16.3 — 环境变量管理（从 .env 加载配置）

数据库
MySQL2 3.6 — MySQL 驱动（支持 Promise 异步调用、连接池）

认证
jsonwebtoken 9.0 — JWT Token 签发与验证
bcryptjs 2.4 — 密码加密（bcrypt 哈希）

文件处理
Multer 2.1 — 文件上传中间件（处理 multipart/form-data）
Sharp 0.34 — 图片处理（提取分辨率、格式转换）

跨域
CORS 2.8 — 跨域资源共享配置
## 安装依赖

```bash
npm install
```

## 开发

```bash
npm run dev
```

## 构建

```bash
npm run build
```

## 预览

```bash
npm run preview
```
