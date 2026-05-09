# VoNR 后端认证系统实现规划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 VoNR CDR 管理平台实现基于 JWT 的用户认证后端系统

**Architecture:** MVC 分层架构，Express 框架，MySQL 存储用户数据，JWT 实现无状态认证

**Tech Stack:** Node.js, Express, MySQL (mysql2), JWT (jsonwebtoken), bcryptjs, dotenv, cors

---

## 文件结构

```
serverProject/
├── config/
│   └── db.js                # MySQL 连接配置
├── controllers/
│   └── authController.js    # 登录/登出/获取用户信息控制器
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
├── .env.example             # 环境变量模板
└── .gitignore
```

---

### Task 1: 项目初始化

**Files:**
- Create: `serverProject/package.json`
- Create: `serverProject/.env`
- Create: `serverProject/.env.example`
- Create: `serverProject/.gitignore`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "vonr-server",
  "version": "1.0.0",
  "description": "VoNR CDR 管理平台后端",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "node app.js"
  },
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

- [ ] **Step 2: 创建 .env.example**

```env
# 服务器配置
PORT=3001

# MySQL 配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=vonr_admin

# JWT 配置
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h

# CORS 配置
CORS_ORIGIN=http://localhost:3000
```

- [ ] **Step 3: 创建 .env（复制 .env.example 并填写实际值）**

```env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=vonr_admin
JWT_SECRET=vonr_jwt_secret_2026
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:3000
```

- [ ] **Step 4: 创建 .gitignore**

```
node_modules/
.env
```

- [ ] **Step 5: 安装依赖**

```bash
cd serverProject
npm install
```

- [ ] **Step 6: 提交**

```bash
git add serverProject/package.json serverProject/.env.example serverProject/.gitignore
git commit -m "feat: initialize server project with dependencies"
```

---

### Task 2: 数据库配置

**Files:**
- Create: `serverProject/config/db.js`

- [ ] **Step 1: 创建 MySQL 数据库**

```sql
CREATE DATABASE IF NOT EXISTS vonr_admin DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

- [ ] **Step 2: 创建 db.js**

```javascript
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
```

- [ ] **Step 3: 测试数据库连接**

在 `serverProject/` 下创建临时测试文件 `test-db.js`：

```javascript
const pool = require('./config/db');

async function test() {
  try {
    const [rows] = await pool.query('SELECT 1 as test');
    console.log('数据库连接成功:', rows[0].test === 1);
    process.exit(0);
  } catch (error) {
    console.error('数据库连接失败:', error.message);
    process.exit(1);
  }
}

test();
```

运行: `node test-db.js`
预期输出: `数据库连接成功: true`

- [ ] **Step 4: 删除测试文件并提交**

```bash
rm serverProject/test-db.js
git add serverProject/config/db.js
git commit -m "feat: add MySQL database configuration"
```

---

### Task 3: 用户模型

**Files:**
- Create: `serverProject/models/userModel.js`

- [ ] **Step 1: 创建 users 表**

在 `serverProject/` 下创建 `init-db.js`：

```javascript
const pool = require('./config/db');
const bcrypt = require('bcryptjs');

async function initDatabase() {
  // 创建用户表
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      display_name VARCHAR(100),
      role ENUM('admin', 'user') DEFAULT 'user',
      status TINYINT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // 检查是否存在管理员用户
  const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', ['admin']);
  
  if (existing.length === 0) {
    // 创建默认管理员账号
    const hashedPassword = await bcrypt.hash('123456', 10);
    await pool.query(
      'INSERT INTO users (username, password, display_name, role) VALUES (?, ?, ?, ?)',
      ['admin', hashedPassword, '管理员', 'admin']
    );
    console.log('已创建默认管理员账号: admin/123456');
  }

  console.log('数据库初始化完成');
  process.exit(0);
}

initDatabase().catch(err => {
  console.error('数据库初始化失败:', err.message);
  process.exit(1);
});
```

运行: `node init-db.js`
预期输出: `已创建默认管理员账号: admin/123456` 或 `数据库初始化完成`

- [ ] **Step 2: 创建 userModel.js**

```javascript
const pool = require('../config/db');

const UserModel = {
  // 根据用户名查找用户
  async findByUsername(username) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return rows[0] || null;
  },

  // 根据 ID 查找用户
  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, username, display_name, role, status, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  // 更新最后登录时间（可选功能）
  async updateLastLogin(id) {
    await pool.query(
      'UPDATE users SET updated_at = NOW() WHERE id = ?',
      [id]
    );
  }
};

module.exports = UserModel;
```

- [ ] **Step 3: 提交**

```bash
git add serverProject/init-db.js serverProject/models/userModel.js
git commit -m "feat: add user model and database initialization"
```

---

### Task 4: JWT 认证中间件

**Files:**
- Create: `serverProject/middleware/auth.js`

- [ ] **Step 1: 创建 auth.js**

```javascript
const jwt = require('jsonwebtoken');
require('dotenv').config();

// JWT 认证中间件
function authMiddleware(req, res, next) {
  // 从请求头获取 token
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 401,
      message: '未提供认证令牌',
      data: null
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 将用户信息附加到请求对象
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        code: 401,
        message: '认证令牌已过期',
        data: null
      });
    }
    return res.status(401).json({
      code: 401,
      message: '无效的认证令牌',
      data: null
    });
  }
}

module.exports = authMiddleware;
```

- [ ] **Step 2: 提交**

```bash
git add serverProject/middleware/auth.js
git commit -m "feat: add JWT authentication middleware"
```

---

### Task 5: 认证服务

**Files:**
- Create: `serverProject/services/authService.js`

- [ ] **Step 1: 创建 authService.js**

```javascript
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');
require('dotenv').config();

const AuthService = {
  // 登录
  async login(username, password) {
    // 1. 查找用户
    const user = await UserModel.findByUsername(username);
    if (!user) {
      return { success: false, message: '用户名或密码错误' };
    }

    // 2. 检查用户状态
    if (user.status !== 1) {
      return { success: false, message: '账号已被禁用' };
    }

    // 3. 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return { success: false, message: '用户名或密码错误' };
    }

    // 4. 生成 JWT
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role
    };
    
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });

    // 5. 返回用户信息（不包含密码）
    return {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.display_name,
          role: user.role
        }
      }
    };
  },

  // 获取用户信息
  async getProfile(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      return { success: false, message: '用户不存在' };
    }
    return { success: true, data: user };
  }
};

module.exports = AuthService;
```

- [ ] **Step 2: 提交**

```bash
git add serverProject/services/authService.js
git commit -m "feat: add authentication service with login and profile"
```

---

### Task 6: 认证控制器

**Files:**
- Create: `serverProject/controllers/authController.js`

- [ ] **Step 1: 创建 authController.js**

```javascript
const AuthService = require('../services/authService');

const AuthController = {
  // POST /api/v1/auth/login
  async login(req, res) {
    try {
      const { username, password } = req.body;

      // 参数验证
      if (!username || !password) {
        return res.status(400).json({
          code: 400,
          message: '用户名和密码不能为空',
          data: null
        });
      }

      // 调用服务层
      const result = await AuthService.login(username, password);

      if (!result.success) {
        return res.status(401).json({
          code: 401,
          message: result.message,
          data: null
        });
      }

      // 登录成功
      return res.json({
        code: 200,
        message: '登录成功',
        data: result.data
      });
    } catch (error) {
      console.error('登录失败:', error);
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: null
      });
    }
  },

  // POST /api/v1/auth/logout
  async logout(req, res) {
    // JWT 是无状态的，服务端不需要做任何处理
    // 前端只需删除本地存储的 token
    return res.json({
      code: 200,
      message: '登出成功',
      data: null
    });
  },

  // GET /api/v1/auth/profile
  async getProfile(req, res) {
    try {
      // 从 JWT 中间件获取用户 ID
      const userId = req.user.userId;
      
      const result = await AuthService.getProfile(userId);

      if (!result.success) {
        return res.status(404).json({
          code: 404,
          message: result.message,
          data: null
        });
      }

      return res.json({
        code: 200,
        message: '获取成功',
        data: result.data
      });
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: null
      });
    }
  }
};

module.exports = AuthController;
```

- [ ] **Step 2: 提交**

```bash
git add serverProject/controllers/authController.js
git commit -m "feat: add authentication controller with login/logout/profile"
```

---

### Task 7: 路由配置

**Files:**
- Create: `serverProject/routes/auth.js`
- Create: `serverProject/routes/index.js`

- [ ] **Step 1: 创建 auth.js 路由**

```javascript
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// POST /api/v1/auth/login - 登录（不需要认证）
router.post('/login', AuthController.login);

// POST /api/v1/auth/logout - 登出（需要认证）
router.post('/logout', authMiddleware, AuthController.logout);

// GET /api/v1/auth/profile - 获取用户信息（需要认证）
router.get('/profile', authMiddleware, AuthController.getProfile);

module.exports = router;
```

- [ ] **Step 2: 创建 index.js 路由聚合**

```javascript
const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');

// 挂载路由
router.use('/auth', authRoutes);

module.exports = router;
```

- [ ] **Step 3: 提交**

```bash
git add serverProject/routes/auth.js serverProject/routes/index.js
git commit -m "feat: add authentication routes"
```

---

### Task 8: Express 应用入口

**Files:**
- Create: `serverProject/app.js`

- [ ] **Step 1: 创建 app.js**

```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件配置
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由挂载
app.use('/api/v1', routes);

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`VoNR 后端服务已启动: http://localhost:${PORT}`);
  console.log(`API 地址: http://localhost:${PORT}/api/v1`);
});

module.exports = app;
```

- [ ] **Step 2: 提交**

```bash
git add serverProject/app.js
git commit -m "feat: add Express application entry point"
```

---

### Task 9: 接口测试

- [ ] **Step 1: 启动服务器**

```bash
cd serverProject
npm start
```

预期输出: `VoNR 后端服务已启动: http://localhost:3001`

- [ ] **Step 2: 测试登录接口**

使用 curl 测试：

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'
```

预期响应：
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

- [ ] **Step 3: 测试获取用户信息接口**

使用上一步返回的 token：

```bash
curl http://localhost:3001/api/v1/auth/profile \
  -H "Authorization: Bearer <token>"
```

预期响应：
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "username": "admin",
    "display_name": "管理员",
    "role": "admin"
  }
}
```

- [ ] **Step 4: 测试错误密码**

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"wrong"}'
```

预期响应：
```json
{
  "code": 401,
  "message": "用户名或密码错误",
  "data": null
}
```

- [ ] **Step 5: 测试未认证访问**

```bash
curl http://localhost:3001/api/v1/auth/profile
```

预期响应：
```json
{
  "code": 401,
  "message": "未提供认证令牌",
  "data": null
}
```

- [ ] **Step 6: 提交最终代码**

```bash
git add .
git commit -m "feat: complete auth system with tests"
```

---

## 执行完成

后端认证系统已实现完成，包含：

- [x] 项目初始化和依赖安装
- [x] MySQL 数据库配置
- [x] 用户表创建和初始数据
- [x] JWT 认证中间件
- [x] 认证服务层
- [x] 认证控制器
- [x] 路由配置
- [x] Express 应用入口
- [x] 接口测试验证

**启动命令：**
```bash
cd serverProject
npm start
```

**默认账号：**
- 用户名: `admin`
- 密码: `123456`
