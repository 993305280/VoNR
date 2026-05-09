# VoNR 后端认证系统设计

## 概述

为 VoNR CDR 管理平台开发 Node.js 后端，实现基于 JWT 的用户认证功能。

## 技术选型

| 项目 | 选择 |
|------|------|
| 认证方式 | JWT Token |
| 数据库 | MySQL |
| 注册功能 | 不需要（预定义用户） |
| 框架 | Express |
| 项目结构 | MVC 分层 |
| 端口 | 3001 |
| API 前缀 | /api/v1 |

## 项目结构

```
serverProject/
├── config/
│   └── db.js                # MySQL 连接配置
├── controllers/
│   └── authController.js    # 登录/登出/获取用户信息
├── middleware/
│   └── auth.js              # JWT 认证中间件
├── models/
│   └── userModel.js         # 用户表模型
├── routes/
│   ├── auth.js              # 认证相关路由
│   └── index.js             # 路由聚合
├── services/
│   └── authService.js       # 认证业务逻辑
├── app.js                   # Express 入口
├── package.json
├── .env                     # 环境变量
└── .env.example             # 环境变量模板
```

## 依赖列表

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "mysql2": "^3.6.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "dotenv": "^16.3.0",
    "cors": "^2.8.5"
  }
}
```

## 数据库设计

### 用户表 (users)

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  role ENUM('admin', 'user') DEFAULT 'user',
  status TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 字段说明

| 字段 | 说明 |
|------|------|
| `password` | 使用 bcrypt 加密，salt rounds = 10 |
| `role` | 预留角色字段，便于后续扩展权限管理 |
| `status` | 软删除，1=启用, 0=禁用 |
| `display_name` | 前端显示的用户名 |

### 初始数据

```sql
INSERT INTO users (username, password, display_name, role) VALUES 
  ('admin', '$2a$10$...', '管理员', 'admin');
```

## API 接口设计

### 认证相关接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/v1/auth/login` | 用户登录 | 否 |
| POST | `/api/v1/auth/logout` | 用户登出 | 是 |
| GET | `/api/v1/auth/profile` | 获取当前用户信息 | 是 |

### 请求/响应格式

**登录请求：**
```json
POST /api/v1/auth/login
{
  "username": "admin",
  "password": "123456"
}
```

**登录响应：**
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "username": "admin",
      "displayName": "管理员",
      "role": "admin"
    }
  }
}
```

**登出响应：**
```json
{
  "code": 200,
  "message": "登出成功"
}
```

### 错误响应格式

```json
{
  "code": 401,
  "message": "用户名或密码错误",
  "data": null
}
```

### 统一错误码

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未认证或认证失败 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 认证流程

```
前端登录 → POST /login → 服务端验证 → 返回 JWT
                                          ↓
前端存储 token → 请求携带 Authorization: Bearer <token>
                                          ↓
服务端中间件验证 → 通过 → 返回数据
                  失败 → 401 Unauthorized
```

### JWT 配置

- **有效期：** 24 小时
- **密钥：** 存储在 `.env` 文件中
- **载荷：** 包含 `userId`、`username`、`role`

## 安全措施

| 措施 | 说明 |
|------|------|
| 密码加密 | 使用 bcrypt，salt rounds = 10 |
| JWT 密钥 | 存储在 `.env`，不提交到 git |
| CORS 配置 | 仅允许前端域名 (`http://localhost:3000`) |
| 输入验证 | 验证必填字段、长度限制 |
| SQL 注入防护 | 使用参数化查询（mysql2 自带） |

## 前端对接要点

1. 前端需添加 `axios` 依赖
2. 创建 axios 实例，配置 `baseURL` 和拦截器
3. 请求拦截器自动附加 `Authorization` 头
4. 响应拦截器处理 401 跳转登录页
