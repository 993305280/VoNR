# RBAC 权限菜单系统实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 VoNR 项目实现基于 RBAC 的菜单权限系统，支持菜单+按钮级别的权限控制

**Architecture:** 后端使用 MVC 分层架构（Model-Service-Controller），前端使用 Pinia 状态管理 + 自定义指令控制权限。数据库使用 MySQL 存储菜单、角色、权限关联数据。

**Tech Stack:** Node.js, Express, MySQL (mysql2), Vue 3, Pinia, Element Plus

---

## 文件结构

### 后端文件

```
serverProject/
├── config/
│   └── db.js                    (已存在，无需修改)
├── controllers/
│   ├── authController.js        (已存在，无需修改)
│   └── menuController.js        (新建)
├── middleware/
│   └── auth.js                  (已存在，无需修改)
├── models/
│   ├── userModel.js             (已存在，无需修改)
│   ├── menuModel.js             (新建)
│   └── roleModel.js             (新建)
├── routes/
│   ├── index.js                 (修改：挂载 menu 路由)
│   ├── auth.js                  (已存在，无需修改)
│   └── menu.js                  (新建)
├── services/
│   ├── authService.js           (已存在，无需修改)
│   └── menuService.js           (新建)
├── scripts/
│   └── init-rbac.js             (新建：初始化 RBAC 数据)
├── app.js                       (已存在，无需修改)
└── .env                         (已存在，无需修改)
```

### 前端文件

```
src/
├── api/
│   ├── auth.js                  (已存在，无需修改)
│   └── menu.js                  (新建)
├── components/
│   ├── Header.vue               (已存在，无需修改)
│   └── Sidebar.vue              (修改：使用动态菜单)
├── directives/
│   └── permission.js            (新建：v-permission 指令)
├── router/
│   └── index.js                 (已存在，无需修改)
├── stores/
│   ├── auth.js                  (修改：登录时获取权限)
│   ├── menu.js                  (新建：菜单状态管理)
│   └── permission.js            (新建：权限状态管理)
├── utils/
│   └── request.js               (已存在，无需修改)
└── views/
    └── Layout.vue               (修改：初始化时获取菜单)
```

---

## Task 1: 创建数据库表

**Files:**
- Create: `serverProject/scripts/init-rbac.js`

- [ ] **Step 1: 创建初始化脚本**

创建 `serverProject/scripts/init-rbac.js` 文件，包含创建数据库表和初始化数据的逻辑：

```javascript
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

async function initRBAC() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
  });

  try {
    // 创建 roles 表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) UNIQUE NOT NULL COMMENT '角色名称',
        description VARCHAR(200) COMMENT '角色描述',
        status TINYINT DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表'
    `);
    console.log('roles 表创建成功');

    // 创建 menus 表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS menus (
        id INT PRIMARY KEY AUTO_INCREMENT,
        parent_id INT DEFAULT 0 COMMENT '父菜单ID，0为顶级菜单',
        name VARCHAR(50) NOT NULL COMMENT '菜单名称',
        path VARCHAR(200) COMMENT '路由路径',
        icon VARCHAR(50) COMMENT '图标名称',
        sort_order INT DEFAULT 0 COMMENT '排序',
        type ENUM('menu', 'button') DEFAULT 'menu' COMMENT '类型：menu-菜单，button-按钮',
        permission VARCHAR(100) COMMENT '权限标识',
        status TINYINT DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜单表'
    `);
    console.log('menus 表创建成功');

    // 创建 role_menus 表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS role_menus (
        id INT PRIMARY KEY AUTO_INCREMENT,
        role_id INT NOT NULL COMMENT '角色ID',
        menu_id INT NOT NULL COMMENT '菜单ID',
        UNIQUE KEY uk_role_menu (role_id, menu_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色菜单关联表'
    `);
    console.log('role_menus 表创建成功');

    // 创建 user_roles 表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL COMMENT '用户ID',
        role_id INT NOT NULL COMMENT '角色ID',
        UNIQUE KEY uk_user_role (user_id, role_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联表'
    `);
    console.log('user_roles 表创建成功');

    // 初始化角色数据
    const [existingRoles] = await pool.query('SELECT id FROM roles');
    if (existingRoles.length === 0) {
      await pool.query(`
        INSERT INTO roles (name, description) VALUES
        ('admin', '系统管理员，拥有所有权限'),
        ('user', '普通用户，拥有基本查看权限')
      `);
      console.log('角色数据初始化成功');
    }

    // 初始化菜单数据
    const [existingMenus] = await pool.query('SELECT id FROM menus');
    if (existingMenus.length === 0) {
      // 一级菜单
      await pool.query(`
        INSERT INTO menus (id, parent_id, name, path, icon, sort_order, type) VALUES
        (1, 0, '素材管理', '/system', 'DataLine', 1, 'menu'),
        (2, 0, '业务管理', '/business', 'Management', 2, 'menu'),
        (3, 0, '用户管理', '/user', 'UserIcon', 3, 'menu'),
        (4, 0, 'CDR管理', '/cdr', 'Document', 4, 'menu'),
        (5, 0, '日志管控', '/log', 'Files', 5, 'menu'),
        (6, 0, '数据监管', '/data', 'TrendCharts', 6, 'menu')
      `);

      // 二级菜单
      await pool.query(`
        INSERT INTO menus (id, parent_id, name, path, sort_order, type, permission) VALUES
        (7, 1, '素材库列表', '/system/overview', 1, 'menu', 'system:overview:view'),
        (8, 2, '应用管理', '/business/application', 1, 'menu', 'business:application:view'),
        (9, 2, '业务配置', '/business/config', 2, 'menu', 'business:config:view'),
        (10, 3, '用户订购关系', '/user/list', 1, 'menu', 'user:list:view'),
        (11, 3, '业务场景定制', '/user/scene', 2, 'menu', 'user:scene:view'),
        (12, 4, '计费套餐', '/cdr/billing', 1, 'menu', 'cdr:billing:view'),
        (13, 4, '费用明细', '/cdr/charges', 2, 'menu', 'cdr:charges:view'),
        (14, 4, 'CDR明细', '/cdr/detail', 3, 'menu', 'cdr:detail:view'),
        (15, 4, '通话记录', '/cdr/calls', 4, 'menu', 'cdr:calls:view'),
        (16, 5, '操作日志', '/log/list', 1, 'menu', 'log:list:view'),
        (17, 6, '业务统计', NULL, 1, 'menu', 'data:statistics:view'),
        (18, 6, '数据监控', '/data/monitor', 2, 'menu', 'data:monitor:view')
      `);

      // 三级菜单
      await pool.query(`
        INSERT INTO menus (id, parent_id, name, path, sort_order, type, permission) VALUES
        (19, 17, '呼叫记录数量统计', '/data/statistics/call-count', 1, 'menu', 'data:statistics:call-count:view'),
        (20, 17, '服务人次统计', '/data/statistics/service-count', 2, 'menu', 'data:statistics:service-count:view'),
        (21, 17, '服务用户数统计', '/data/statistics/user-count', 3, 'menu', 'data:statistics:user-count:view')
      `);

      // 按钮权限
      await pool.query(`
        INSERT INTO menus (id, parent_id, name, type, permission) VALUES
        (22, 7, '新增', 'button', 'system:overview:add'),
        (23, 7, '编辑', 'button', 'system:overview:edit'),
        (24, 7, '删除', 'button', 'system:overview:delete')
      `);

      console.log('菜单数据初始化成功');
    }

    // 初始化角色-菜单关联
    const [existingRoleMenus] = await pool.query('SELECT id FROM role_menus');
    if (existingRoleMenus.length === 0) {
      // admin 角色拥有所有菜单
      const [allMenus] = await pool.query('SELECT id FROM menus');
      const adminValues = allMenus.map(menu => `(1, ${menu.id})`).join(',');
      await pool.query(`INSERT INTO role_menus (role_id, menu_id) VALUES ${adminValues}`);

      // user 角色拥有查看权限的菜单
      const [viewMenus] = await pool.query("SELECT id FROM menus WHERE permission LIKE '%:view'");
      const userValues = viewMenus.map(menu => `(2, ${menu.id})`).join(',');
      await pool.query(`INSERT INTO role_menus (role_id, menu_id) VALUES ${userValues}`);

      console.log('角色-菜单关联初始化成功');
    }

    // 初始化用户-角色关联
    const [existingUserRoles] = await pool.query('SELECT id FROM user_roles');
    if (existingUserRoles.length === 0) {
      // admin 用户关联 admin 角色
      const [adminUser] = await pool.query("SELECT id FROM users WHERE username = 'admin'");
      if (adminUser.length > 0) {
        await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [adminUser[0].id, 1]);
      }
      console.log('用户-角色关联初始化成功');
    }

    console.log('RBAC 初始化完成');
    process.exit(0);
  } catch (err) {
    console.error('RBAC 初始化失败:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initRBAC();
```

- [ ] **Step 2: 运行初始化脚本**

```bash
cd serverProject && node scripts/init-rbac.js
```

Expected: 输出 "RBAC 初始化完成"

- [ ] **Step 3: 验证数据库表**

```bash
mysql -u root -p vonr_admin -e "SHOW TABLES; SELECT COUNT(*) as menu_count FROM menus; SELECT COUNT(*) as role_count FROM roles;"
```

Expected: 显示 4 张表，menus 有 24 条记录，roles 有 2 条记录

- [ ] **Step 4: Commit**

```bash
git add serverProject/scripts/init-rbac.js
git commit -m "feat: add RBAC database schema and initialization script"
```

---

## Task 2: 创建后端 Model 层

**Files:**
- Create: `serverProject/models/menuModel.js`
- Create: `serverProject/models/roleModel.js`

- [ ] **Step 1: 创建 menuModel.js**

创建 `serverProject/models/menuModel.js`：

```javascript
const pool = require('../config/db');

const MenuModel = {
  // 根据用户 ID 查询有权限的菜单列表
  async findByUserId(userId) {
    const [rows] = await pool.query(`
      SELECT DISTINCT m.*
      FROM menus m
      INNER JOIN role_menus rm ON m.id = rm.menu_id
      INNER JOIN user_roles ur ON rm.role_id = ur.role_id
      WHERE ur.user_id = ? AND m.status = 1 AND m.type = 'menu'
      ORDER BY m.sort_order
    `, [userId]);
    return rows;
  },

  // 根据用户 ID 查询有权限的按钮权限标识
  async findPermissionsByUserId(userId) {
    const [rows] = await pool.query(`
      SELECT DISTINCT m.permission
      FROM menus m
      INNER JOIN role_menus rm ON m.id = rm.menu_id
      INNER JOIN user_roles ur ON rm.role_id = ur.role_id
      WHERE ur.user_id = ? AND m.status = 1 AND m.permission IS NOT NULL
    `, [userId]);
    return rows.map(row => row.permission);
  },

  // 根据 ID 查询菜单
  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM menus WHERE id = ?', [id]);
    return rows[0] || null;
  },

  // 查询所有菜单
  async findAll() {
    const [rows] = await pool.query('SELECT * FROM menus WHERE status = 1 ORDER BY sort_order');
    return rows;
  }
};

module.exports = MenuModel;
```

- [ ] **Step 2: 创建 roleModel.js**

创建 `serverProject/models/roleModel.js`：

```javascript
const pool = require('../config/db');

const RoleModel = {
  // 根据用户 ID 查询角色
  async findByUserId(userId) {
    const [rows] = await pool.query(`
      SELECT r.*
      FROM roles r
      INNER JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = ? AND r.status = 1
    `, [userId]);
    return rows;
  },

  // 根据 ID 查询角色
  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM roles WHERE id = ?', [id]);
    return rows[0] || null;
  },

  // 查询所有角色
  async findAll() {
    const [rows] = await pool.query('SELECT * FROM roles WHERE status = 1');
    return rows;
  }
};

module.exports = RoleModel;
```

- [ ] **Step 3: Commit**

```bash
git add serverProject/models/menuModel.js serverProject/models/roleModel.js
git commit -m "feat: add menu and role models"
```

---

## Task 3: 创建后端 Service 层

**Files:**
- Create: `serverProject/services/menuService.js`

- [ ] **Step 1: 创建 menuService.js**

创建 `serverProject/services/menuService.js`：

```javascript
const MenuModel = require('../models/menuModel');

const MenuService = {
  // 获取菜单树
  async getMenuTree(userId) {
    // 1. 查询用户有权限的菜单列表
    const menus = await MenuModel.findByUserId(userId);

    // 2. 构建菜单树
    const menuMap = {};
    const rootMenus = [];

    // 先将所有菜单放入 map
    menus.forEach(menu => {
      menuMap[menu.id] = {
        id: menu.id,
        name: menu.name,
        path: menu.path,
        icon: menu.icon,
        sort_order: menu.sort_order,
        permission: menu.permission,
        children: []
      };
    });

    // 构建树形结构
    menus.forEach(menu => {
      const menuItem = menuMap[menu.id];
      if (menu.parent_id === 0) {
        rootMenus.push(menuItem);
      } else if (menuMap[menu.parent_id]) {
        menuMap[menu.parent_id].children.push(menuItem);
      }
    });

    // 按 sort_order 排序
    const sortTree = (items) => {
      items.sort((a, b) => a.sort_order - b.sort_order);
      items.forEach(item => {
        if (item.children.length > 0) {
          sortTree(item.children);
        }
      });
    };
    sortTree(rootMenus);

    return rootMenus;
  },

  // 获取用户权限列表
  async getPermissions(userId) {
    return await MenuModel.findPermissionsByUserId(userId);
  }
};

module.exports = MenuService;
```

- [ ] **Step 2: Commit**

```bash
git add serverProject/services/menuService.js
git commit -m "feat: add menu service with tree building logic"
```

---

## Task 4: 创建后端 Controller 和 Route

**Files:**
- Create: `serverProject/controllers/menuController.js`
- Create: `serverProject/routes/menu.js`
- Modify: `serverProject/routes/index.js`

- [ ] **Step 1: 创建 menuController.js**

创建 `serverProject/controllers/menuController.js`：

```javascript
const MenuService = require('../services/menuService');

const MenuController = {
  // GET /api/v1/menus
  async getMenus(req, res) {
    try {
      const userId = req.user.userId;
      const menus = await MenuService.getMenuTree(userId);

      return res.json({
        code: 200,
        message: '获取成功',
        data: menus
      });
    } catch (error) {
      console.error('获取菜单失败:', error);
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: null
      });
    }
  },

  // GET /api/v1/permissions
  async getPermissions(req, res) {
    try {
      const userId = req.user.userId;
      const permissions = await MenuService.getPermissions(userId);

      return res.json({
        code: 200,
        message: '获取成功',
        data: permissions
      });
    } catch (error) {
      console.error('获取权限失败:', error);
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: null
      });
    }
  }
};

module.exports = MenuController;
```

- [ ] **Step 2: 创建 menu.js 路由**

创建 `serverProject/routes/menu.js`：

```javascript
const express = require('express');
const router = express.Router();
const MenuController = require('../controllers/menuController');
const authMiddleware = require('../middleware/auth');

// 获取菜单列表
router.get('/menus', authMiddleware, MenuController.getMenus);

// 获取权限列表
router.get('/permissions', authMiddleware, MenuController.getPermissions);

module.exports = router;
```

- [ ] **Step 3: 修改 routes/index.js 挂载新路由**

修改 `serverProject/routes/index.js`：

```javascript
const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const menuRoutes = require('./menu');

// 挂载路由
router.use('/auth', authRoutes);
router.use('/', menuRoutes);

module.exports = router;
```

- [ ] **Step 4: 测试后端接口**

启动后端服务：

```bash
cd serverProject && node app.js
```

使用 curl 测试：

```bash
# 先登录获取 token
TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# 获取菜单
curl -X GET http://localhost:3001/api/v1/menus \
  -H "Authorization: Bearer $TOKEN"

# 获取权限
curl -X GET http://localhost:3001/api/v1/permissions \
  -H "Authorization: Bearer $TOKEN"
```

Expected: 返回菜单树和权限列表

- [ ] **Step 5: Commit**

```bash
git add serverProject/controllers/menuController.js serverProject/routes/menu.js serverProject/routes/index.js
git commit -m "feat: add menu API endpoints with auth middleware"
```

---

## Task 5: 创建前端 API 和 Store

**Files:**
- Create: `src/api/menu.js`
- Create: `src/stores/menu.js`
- Create: `src/stores/permission.js`

- [ ] **Step 1: 创建 menu.js API**

创建 `src/api/menu.js`：

```javascript
import request from '@/utils/request'

export function getMenus() {
  return request.get('/menus')
}

export function getPermissions() {
  return request.get('/permissions')
}
```

- [ ] **Step 2: 创建 menu store**

创建 `src/stores/menu.js`：

```javascript
import { defineStore } from 'pinia'
import { getMenus } from '@/api/menu'

const STORAGE_KEY = 'menus'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  return []
}

export const useMenuStore = defineStore('menu', {
  state: () => ({
    menus: loadFromStorage(),
    loaded: false
  }),
  actions: {
    async fetchMenus() {
      try {
        const res = await getMenus()
        if (res.code === 200) {
          this.menus = res.data
          this.loaded = true
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.menus))
        }
      } catch (error) {
        console.error('获取菜单失败:', error)
      }
    },
    clearMenus() {
      this.menus = []
      this.loaded = false
      localStorage.removeItem(STORAGE_KEY)
    }
  }
})
```

- [ ] **Step 3: 创建 permission store**

创建 `src/stores/permission.js`：

```javascript
import { defineStore } from 'pinia'
import { getPermissions } from '@/api/menu'

const STORAGE_KEY = 'permissions'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  return []
}

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    permissions: loadFromStorage(),
    loaded: false
  }),
  getters: {
    hasPermission: (state) => {
      return (permission) => {
        return state.permissions.includes(permission)
      }
    }
  },
  actions: {
    async fetchPermissions() {
      try {
        const res = await getPermissions()
        if (res.code === 200) {
          this.permissions = res.data
          this.loaded = true
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.permissions))
        }
      } catch (error) {
        console.error('获取权限失败:', error)
      }
    },
    clearPermissions() {
      this.permissions = []
      this.loaded = false
      localStorage.removeItem(STORAGE_KEY)
    }
  }
})
```

- [ ] **Step 4: Commit**

```bash
git add src/api/menu.js src/stores/menu.js src/stores/permission.js
git commit -m "feat: add menu and permission stores with API integration"
```

---

## Task 6: 创建 v-permission 指令

**Files:**
- Create: `src/directives/permission.js`

- [ ] **Step 1: 创建 permission.js 指令**

创建 `src/directives/permission.js`：

```javascript
import { usePermissionStore } from '@/stores/permission'

export const permission = {
  mounted(el, binding) {
    const permissionStore = usePermissionStore()
    const value = binding.value

    if (value && !permissionStore.hasPermission(value)) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  },
  updated(el, binding) {
    const permissionStore = usePermissionStore()
    const value = binding.value

    if (value && !permissionStore.hasPermission(value)) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  }
}

export default permission
```

- [ ] **Step 2: Commit**

```bash
git add src/directives/permission.js
git commit -m "feat: add v-permission directive for button-level permission control"
```

---

## Task 7: 修改前端 Layout 和 Sidebar

**Files:**
- Modify: `src/views/Layout.vue`
- Modify: `src/components/Sidebar.vue`
- Modify: `src/stores/auth.js`
- Modify: `src/main.js`

- [ ] **Step 1: 修改 main.js 注册指令**

修改 `src/main.js`，添加 v-permission 指令注册：

```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import { permission } from './directives/permission'

const app = createApp(App)

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(ElementPlus)
app.use(router)

// 注册自定义指令
app.directive('permission', permission)

app.mount('#app')
```

- [ ] **Step 2: 修改 auth store 登录时获取权限**

修改 `src/stores/auth.js`，在登录成功后获取菜单和权限：

```javascript
import { defineStore } from 'pinia'
import { login as loginApi, logout as logoutApi, getProfile } from '@/api/auth'
import { useMenuStore } from './menu'
import { usePermissionStore } from './permission'

const STORAGE_KEY = 'auth'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  return { token: null, userInfo: null }
}

export const useAuthStore = defineStore('auth', {
  state: () => {
    const saved = loadFromStorage()
    return {
      token: saved.token,
      userInfo: saved.userInfo
    }
  },
  getters: {
    isLoggedIn: (state) => !!state.token
  },
  actions: {
    async login(username, password) {
      const res = await loginApi({ username, password })
      if (res.code === 200) {
        this.token = res.data.token
        this.userInfo = res.data.user
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          token: this.token,
          userInfo: this.userInfo
        }))

        // 登录成功后获取菜单和权限
        const menuStore = useMenuStore()
        const permissionStore = usePermissionStore()
        await Promise.all([
          menuStore.fetchMenus(),
          permissionStore.fetchPermissions()
        ])

        return { success: true }
      }
      return { success: false, message: res.message }
    },
    async logout() {
      try {
        await logoutApi()
      } catch {
        // 即使请求失败也清除本地状态
      }
      this.token = null
      this.userInfo = null
      localStorage.removeItem(STORAGE_KEY)

      // 清除菜单和权限
      const menuStore = useMenuStore()
      const permissionStore = usePermissionStore()
      menuStore.clearMenus()
      permissionStore.clearPermissions()
    },
    async fetchProfile() {
      const res = await getProfile()
      if (res.code === 200) {
        this.userInfo = res.data
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          token: this.token,
          userInfo: this.userInfo
        }))
      }
    }
  }
})
```

- [ ] **Step 3: 修改 Layout.vue 初始化时获取菜单**

修改 `src/views/Layout.vue`，在 onMounted 时检查并获取菜单数据：

```javascript
// 在 script setup 中添加
import { useMenuStore } from '@/stores/menu'
import { usePermissionStore } from '@/stores/permission'

const menuStore = useMenuStore()
const permissionStore = usePermissionStore()

// 在 onMounted 中添加
onMounted(async () => {
  // 从 sessionStorage 恢复 tabs
  const savedTabs = sessionStorage.getItem('voNR_tabs')
  if (savedTabs) {
    tabs.value = JSON.parse(savedTabs)
  } else {
    tabs.value = []
  }
  // 确保不包含 Dashboard（已由 HomeFilled 图标替代）
  tabs.value = tabs.value.filter(t => t.path !== '/dashboard')
  document.addEventListener('keydown', handleKeydown)

  // 如果菜单未加载，则获取菜单
  if (!menuStore.loaded) {
    await menuStore.fetchMenus()
  }
  if (!permissionStore.loaded) {
    await permissionStore.fetchPermissions()
  }
})
```

- [ ] **Step 4: 修改 Sidebar.vue 使用动态菜单**

修改 `src/components/Sidebar.vue`，使用 store 中的菜单数据替换静态 menuList：

```vue
<template>
  <div
    class="sidebar"
    :class="{ collapsed, collapsing: isCollapsing, expanding: isExpanding }"
    @transitionstart="onTransitionStart"
    @transitionend="onTransitionEnd"
  >
    <el-menu
      :default-active="activeMenu"
      :default-openeds="defaultOpeneds"
      :unique-opened="true"
      :collapse="collapsed"
      router
      background-color="#ffffff"
      text-color="#333333"
      active-text-color="#2196f3"
    >
      <template v-for="menu in menuList" :key="menu.id">
        <!-- 有子菜单的情况 -->
        <el-sub-menu v-if="menu.children && menu.children.length > 0" :index="menu.path || menu.id.toString()">
          <template #title>
            <el-icon><component :is="menu.icon" /></el-icon>
            <span>{{ menu.name }}</span>
          </template>

          <template v-for="item in menu.children" :key="item.id">
            <!-- 二级菜单项（无子菜单） -->
            <el-menu-item v-if="!item.children || item.children.length === 0" :index="item.path">
              {{ item.name }}
            </el-menu-item>

            <!-- 有三级子菜单 -->
            <el-sub-menu v-else :index="item.path || item.id.toString()">
              <template #title>{{ item.name }}</template>
              <el-menu-item
                v-for="subItem in item.children"
                :key="subItem.id"
                :index="subItem.path"
              >
                {{ subItem.name }}
              </el-menu-item>
            </el-sub-menu>
          </template>
        </el-sub-menu>

        <!-- 无子菜单的顶级菜单 -->
        <el-menu-item v-else :index="menu.path">
          <el-icon><component :is="menu.icon" /></el-icon>
          <span>{{ menu.name }}</span>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useMenuStore } from '@/stores/menu'
import {
  DataLine,
  Management,
  User as UserIcon,
  Document,
  Files,
  TrendCharts
} from '@element-plus/icons-vue'

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
})

const isCollapsing = ref(false)
const isExpanding = ref(false)

const onTransitionStart = (e) => {
  if (e.propertyName === 'width') {
    if (props.collapsed) {
      isCollapsing.value = true
    } else {
      isExpanding.value = true
    }
  }
}

const onTransitionEnd = (e) => {
  if (e.propertyName === 'width') {
    isCollapsing.value = false
    isExpanding.value = false
  }
}

const route = useRoute()
const menuStore = useMenuStore()
const activeMenu = computed(() => route.path)

// 图标映射
const iconMap = {
  DataLine,
  Management,
  UserIcon,
  Document,
  Files,
  TrendCharts
}

// 将 store 中的菜单数据转换为组件可用的格式
const menuList = computed(() => {
  return menuStore.menus.map(menu => ({
    ...menu,
    icon: iconMap[menu.icon] || DataLine
  }))
})

// 计算默认展开的菜单
const defaultOpeneds = computed(() => {
  const path = route.path
  const openeds = []

  const findOpeneds = (menus) => {
    for (const menu of menus) {
      if (menu.path && (path === menu.path || path.startsWith(menu.path + '/'))) {
        openeds.push(menu.path || menu.id.toString())
      }
      if (menu.children && menu.children.length > 0) {
        findOpeneds(menu.children)
      }
    }
  }

  findOpeneds(menuStore.menus)
  return openeds
})
</script>

<style scoped>
/* 保持原有样式不变 */
.sidebar {
  height: 100%;
  overflow-y: auto;
  border-right: 1px solid #e4e7ed;
  transition: width 0.3s ease;
}

.sidebar :deep(.el-menu) {
  border-right: none;
}

.sidebar :deep(.el-sub-menu__title) {
  height: 50px;
  line-height: 50px;
  font-weight: 500;
  font-size: 16px;
}

.sidebar :deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
  font-weight: 500;
  font-size: 15px;
}

.sidebar :deep(.el-sub-menu .el-sub-menu .el-sub-menu__title) {
  font-size: 14px;
}

.sidebar :deep(.el-sub-menu .el-sub-menu .el-menu-item) {
  font-size: 14px;
}

.sidebar :deep(.el-sub-menu .el-menu-item) {
  padding-left: 60px !important;
  min-width: 200px;
}

.sidebar :deep(.el-sub-menu .el-sub-menu .el-menu-item) {
  padding-left: 80px !important;
  min-width: 180px;
}

.sidebar :deep(.el-sub-menu .el-sub-menu .el-sub-menu__title) {
  padding-left: 60px !important;
  min-width: 180px;
}

.sidebar :deep(.el-menu-item.is-active) {
  background-color: #ecf5ff !important;
  color: #2196f3 !important;
}

.sidebar :deep(.el-sub-menu.is-opened > .el-sub-menu__title) {
  color: #2196f3 !important;
}

.sidebar :deep(.el-sub-menu.is-opened > .el-sub-menu__title .el-icon) {
  color: #2196f3 !important;
}

.sidebar :deep(.el-menu-item:hover),
.sidebar :deep(.el-sub-menu__title:hover) {
  background-color: #ecf5ff !important;
}

.sidebar :deep(.el-sub-menu__title .el-sub-menu__icon-arrow) {
  display: none !important;
}

.sidebar :deep(.el-sub-menu__title) {
  position: relative;
  padding-right: 30px !important;
}

.sidebar :deep(.el-sub-menu__title::after) {
  content: '';
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid #999;
  transition: transform 0.3s ease;
}

.sidebar :deep(.el-sub-menu.is-opened > .el-sub-menu__title::after) {
  transform: translateY(-50%) rotate(180deg);
  border-top-color: #2196f3;
}

.sidebar.collapsed {
  width: 64px;
}

.sidebar.collapsed :deep(.el-menu) {
  width: 64px;
}

.sidebar.collapsed :deep(.el-sub-menu__title span),
.sidebar.collapsed :deep(.el-menu-item span) {
  display: none;
}

.sidebar.collapsing :deep(.el-sub-menu__title::after),
.sidebar.expanding :deep(.el-sub-menu__title::after) {
  display: none;
}

.sidebar.collapsed:not(.collapsing):not(.expanding) :deep(.el-sub-menu__title::after) {
  display: none;
}
</style>
```

- [ ] **Step 5: Commit**

```bash
git add src/main.js src/stores/auth.js src/views/Layout.vue src/components/Sidebar.vue
git commit -m "feat: integrate dynamic menu with RBAC permission system"
```

---

## Task 8: 端到端测试

**Files:**
- 无新增文件

- [ ] **Step 1: 启动所有服务**

```bash
# 启动 MySQL（如果未运行）
# 启动后端
cd serverProject && node app.js &

# 启动前端
cd .. && npm run dev &
```

- [ ] **Step 2: 测试登录流程**

1. 打开浏览器访问 http://localhost:3000（或 3003）
2. 使用 admin/123456 登录
3. 验证：
   - 登录成功后跳转到 dashboard
   - 侧边栏显示所有菜单（admin 角色有所有权限）
   - 点击菜单项能正确跳转

- [ ] **Step 3: 测试权限控制**

1. 在 MySQL 中创建一个普通用户并关联 user 角色：

```sql
USE vonr_admin;
INSERT INTO users (username, password, display_name, role) VALUES ('testuser', '$2a$10$...', '测试用户', 'user');
INSERT INTO user_roles (user_id, role_id) VALUES (LAST_INSERT_ID(), 2);
```

2. 使用 testuser 登录
3. 验证：侧边栏只显示有查看权限的菜单

- [ ] **Step 4: 测试按钮权限**

1. 在页面中添加测试按钮：

```vue
<el-button v-permission="'system:overview:add'">新增</el-button>
<el-button v-permission="'system:overview:delete'">删除</el-button>
```

2. 验证：admin 用户能看到按钮，user 用户看不到（如果没有对应权限）

- [ ] **Step 5: 检查控制台错误**

打开浏览器开发者工具，检查是否有 JavaScript 错误或网络请求失败。

---

## 完成

所有任务完成后，RBAC 权限菜单系统已实现：

1. ✅ 数据库表创建和初始化数据
2. ✅ 后端 MVC 架构（Model-Service-Controller）
3. ✅ 菜单和权限 API 接口
4. ✅ 前端状态管理（Pinia）
5. ✅ 动态菜单渲染
6. ✅ 按钮级别权限控制（v-permission 指令）
