# 用户订购关系页面设计文档

## 概述

为 VoNR 管理系统添加用户订购关系管理功能，支持订购关系的增删改查操作。

## 技术栈

- **前端**：Vue 3 (Composition API) + Element Plus
- **后端**：Express.js + MySQL2
- **认证**：JWT Token（使用现有 authMiddleware）

## 数据库设计

### 表结构：user_subscriptions

```sql
CREATE TABLE user_subscriptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  phone VARCHAR(20) NOT NULL COMMENT '用户号码',
  app_id INT COMMENT '应用ID',
  app_name VARCHAR(100) COMMENT '应用名称',
  subscription_time DATETIME COMMENT '订购时间',
  business_scene VARCHAR(100) COMMENT '业务场景',
  sub_scenes TEXT COMMENT '子业务场景',
  description TEXT COMMENT '应用说明',
  operator VARCHAR(100) COMMENT '操作者',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone (phone),
  INDEX idx_app_id (app_id)
)
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | INT | 是 | 主键，自增 |
| phone | VARCHAR(20) | 是 | 用户号码（11位手机号） |
| app_id | INT | 否 | 关联应用ID |
| app_name | VARCHAR(100) | 否 | 应用名称 |
| subscription_time | DATETIME | 否 | 订购时间 |
| business_scene | VARCHAR(100) | 否 | 业务场景 |
| sub_scenes | TEXT | 否 | 子业务场景（逗号分隔） |
| description | TEXT | 否 | 应用说明 |
| operator | VARCHAR(100) | 否 | 操作者 |
| created_at | TIMESTAMP | - | 创建时间 |
| updated_at | TIMESTAMP | - | 更新时间 |

## 后端 API 设计

### 接口列表

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/v1/user-subscriptions` | 获取列表（分页、搜索） |
| GET | `/api/v1/user-subscriptions/:id` | 获取详情 |
| POST | `/api/v1/user-subscriptions` | 新增订购 |
| PUT | `/api/v1/user-subscriptions/:id` | 编辑订购 |
| DELETE | `/api/v1/user-subscriptions/:id` | 删除订购 |
| POST | `/api/v1/user-subscriptions/batch-delete` | 批量删除 |

### 请求/响应格式

#### GET /api/v1/user-subscriptions

**查询参数：**
- `page`：页码（默认 1）
- `pageSize`：每页条数（默认 10）
- `phone`：用户号码（模糊查询）
- `startTime`：开始时间（格式：YYYY-MM-DD HH:mm:ss）
- `endTime`：结束时间（格式：YYYY-MM-DD HH:mm:ss）

**响应示例：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "phone": "13869421569",
        "appId": 1,
        "appName": "企业品牌宣传应用5",
        "subscriptionTime": "2024-03-25 10:00:00",
        "businessScene": "001趣味通话",
        "subScenes": "001002虚拟头像、001003通话特效",
        "description": "这里是说明",
        "operator": "admin@VoNR",
        "createdAt": "2026-05-10T10:00:00.000Z",
        "updatedAt": "2026-05-10T10:00:00.000Z"
      }
    ],
    "total": 32,
    "page": 1,
    "pageSize": 10
  }
}
```

#### POST /api/v1/user-subscriptions

**请求体：**
```json
{
  "phone": "13869421569",
  "appId": 1,
  "appName": "企业品牌宣传应用5",
  "subscriptionTime": "2024-03-25 10:00:00",
  "businessScene": "001趣味通话",
  "subScenes": "001002虚拟头像、001003通话特效",
  "description": "这里是说明",
  "operator": "admin@VoNR"
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": 33
  }
}
```

### 错误响应

```json
{
  "code": 400,
  "message": "用户号码不能为空",
  "data": null
}
```

## 前端设计

### 文件结构

```
src/
├── api/
│   └── userSubscription.js          # API 模块
├── composables/
│   └── useUserSubscriptionData.js   # 数据管理 composable
└── views/
    └── UserList.vue                  # 页面组件（修改现有文件）
```

### API 模块 (src/api/userSubscription.js)

```javascript
import request from '@/utils/request'

export function getUserSubscriptions(params) {
  return request.get('/api/v1/user-subscriptions', { params })
}

export function getUserSubscription(id) {
  return request.get(`/api/v1/user-subscriptions/${id}`)
}

export function createUserSubscription(data) {
  return request.post('/api/v1/user-subscriptions', data)
}

export function updateUserSubscription(id, data) {
  return request.put(`/api/v1/user-subscriptions/${id}`, data)
}

export function deleteUserSubscription(id) {
  return request.delete(`/api/v1/user-subscriptions/${id}`)
}

export function batchDeleteUserSubscriptions(ids) {
  return request.post('/api/v1/user-subscriptions/batch-delete', { ids })
}
```

### Composable (src/composables/useUserSubscriptionData.js)

**功能：**
- 管理表格数据状态
- 处理分页逻辑
- 处理搜索参数
- 封装 CRUD 操作

**返回值：**
```javascript
{
  tableData,           // 表格数据
  loading,             // 加载状态
  total,               // 总记录数
  pagination,          // 分页状态 { current, pageSize }
  searchParams,        // 搜索参数
  handleSearch,        // 搜索方法
  handleReset,         // 重置方法
  handlePageChange,    // 页码变化
  handlePageSizeChange,// 每页条数变化
  handleCreate,        // 新增
  handleUpdate,        // 更新
  handleDelete         // 删除
}
```

### 页面组件 (src/views/UserList.vue)

**修改内容：**
1. 移除硬编码的 mock 数据
2. 引入 composable
3. 连接搜索表单到 composable
4. 连接表格到 composable
5. 连接分页组件到 composable
6. 连接新增/编辑对话框到 composable
7. 连接删除确认对话框到 composable

## 测试数据

### 插入 32 条测试数据

```sql
INSERT INTO user_subscriptions (phone, app_id, app_name, subscription_time, business_scene, sub_scenes, description, operator) VALUES
('13869421569', 1, '企业品牌宣传应用5', '2024-03-25 10:00:00', '001趣味通话', '001002虚拟头像、001003通话特效', '这里是说明', 'admin@VoNR'),
('18512489653', 1, '企业品牌宣传应用5', '2024-03-25 10:00:00', '001趣味通话', '001002虚拟头像、001003通话特效', '这里是说明', 'admin@VoNR'),
('13912345678', 2, '公益宣传应用1', '2024-03-26 11:00:00', '002语音合成', '002001文字转语音', '公益宣传用途', 'admin@VoNR'),
('15012345678', 1, '企业品牌宣传应用5', '2024-03-27 12:00:00', '001趣味通话', '001004虚拟场景', '企业内部测试', 'admin@VoNR'),
('18812345678', 2, '公益宣传应用1', '2024-03-28 13:00:00', '002语音合成', '002002语音识别', '公益项目', 'admin@VoNR'),
-- ... 共 32 条
```

## 文件清单

### 需要创建的文件

1. **serverProject/models/userSubscriptionModel.js** - 数据库操作模型
2. **serverProject/controllers/userSubscriptionController.js** - 请求处理器
3. **serverProject/routes/userSubscription.js** - 路由定义
4. **src/api/userSubscription.js** - 前端 API 模块
5. **src/composables/useUserSubscriptionData.js** - 数据管理 composable

### 需要修改的文件

1. **serverProject/init-db.js** - 添加 user_subscriptions 表创建
2. **serverProject/routes/index.js** - 注册新路由
3. **src/views/UserList.vue** - 连接真实 API

## 实现顺序

1. 创建数据库表
2. 创建后端 Model
3. 创建后端 Controller
4. 创建后端 Route
5. 注册路由到 index.js
6. 创建前端 API 模块
7. 创建 composable
8. 修改 UserList.vue
9. 插入测试数据
10. 测试所有功能

## 验证标准

1. 列表查询正常（分页、搜索）
2. 新增订购正常（表单验证、保存）
3. 编辑订购正常（回填数据、保存）
4. 删除订购正常（单个、批量）
5. 分页功能正常（页码切换、每页条数切换）
6. 搜索功能正常（按号码、时间范围搜索）
