# RBAC 权限菜单系统设计文档

## 概述

为 VoNR 项目实现基于 RBAC（基于角色的访问控制）的菜单权限系统，支持菜单+按钮级别的权限控制。

## 需求

1. 登录成功后，根据用户角色动态获取菜单数据
2. 权限控制粒度：菜单级别（页面访问）+ 按钮级别（操作权限）
3. 菜单支持三级嵌套
4. 菜单支持自定义排序
5. 菜单数据先固定在数据库，预留后期管理功能

## 数据库设计

### menus 表（菜单表）

```sql
CREATE TABLE menus (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT DEFAULT 0 COMMENT '父菜单ID，0为顶级菜单',
  name VARCHAR(50) NOT NULL COMMENT '菜单名称',
  path VARCHAR(200) COMMENT '路由路径',
  icon VARCHAR(50) COMMENT '图标名称',
  sort_order INT DEFAULT 0 COMMENT '排序',
  type ENUM('menu', 'button') DEFAULT 'menu' COMMENT '类型：menu-菜单，button-按钮',
  permission VARCHAR(100) COMMENT '权限标识，如 system:overview:view',
  status TINYINT DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜单表';
```

### roles 表（角色表）

```sql
CREATE TABLE roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL COMMENT '角色名称',
  description VARCHAR(200) COMMENT '角色描述',
  status TINYINT DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';
```

### role_menus 表（角色-菜单关联）

```sql
CREATE TABLE role_menus (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role_id INT NOT NULL COMMENT '角色ID',
  menu_id INT NOT NULL COMMENT '菜单ID',
  UNIQUE KEY uk_role_menu (role_id, menu_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色菜单关联表';
```

### user_roles 表（用户-角色关联）

```sql
CREATE TABLE user_roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT '用户ID',
  role_id INT NOT NULL COMMENT '角色ID',
  UNIQUE KEY uk_user_role (user_id, role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联表';
```

## 菜单数据结构

### 一级菜单（6个）

| id | parent_id | name | path | icon | sort_order | type |
|----|-----------|------|------|------|------------|------|
| 1 | 0 | 素材管理 | /system | DataLine | 1 | menu |
| 2 | 0 | 业务管理 | /business | Management | 2 | menu |
| 3 | 0 | 用户管理 | /user | UserIcon | 3 | menu |
| 4 | 0 | CDR管理 | /cdr | Document | 4 | menu |
| 5 | 0 | 日志管控 | /log | Files | 5 | menu |
| 6 | 0 | 数据监管 | /data | TrendCharts | 6 | menu |

### 二级菜单（12个）

| id | parent_id | name | path | sort_order | permission |
|----|-----------|------|------|------------|------------|
| 7 | 1 | 素材库列表 | /system/overview | 1 | system:overview:view |
| 8 | 2 | 应用管理 | /business/application | 1 | business:application:view |
| 9 | 2 | 业务配置 | /business/config | 2 | business:config:view |
| 10 | 3 | 用户订购关系 | /user/list | 1 | user:list:view |
| 11 | 3 | 业务场景定制 | /user/scene | 2 | user:scene:view |
| 12 | 4 | 计费套餐 | /cdr/billing | 1 | cdr:billing:view |
| 13 | 4 | 费用明细 | /cdr/charges | 2 | cdr:charges:view |
| 14 | 4 | CDR明细 | /cdr/detail | 3 | cdr:detail:view |
| 15 | 4 | 通话记录 | /cdr/calls | 4 | cdr:calls:view |
| 16 | 5 | 操作日志 | /log/list | 1 | log:list:view |
| 17 | 6 | 业务统计 | null | 1 | data:statistics:view |
| 18 | 6 | 数据监控 | /data/monitor | 2 | data:monitor:view |

### 三级菜单（3个）

| id | parent_id | name | path | sort_order | permission |
|----|-----------|------|------|------------|------------|
| 19 | 17 | 呼叫记录数量统计 | /data/statistics/call-count | 1 | data:statistics:call-count:view |
| 20 | 17 | 服务人次统计 | /data/statistics/service-count | 2 | data:statistics:service-count:view |
| 21 | 17 | 服务用户数统计 | /data/statistics/user-count | 3 | data:statistics:user-count:view |

### 按钮权限（示例）

| id | parent_id | name | permission | type |
|----|-----------|------|------------|------|
| 22 | 7 | 新增 | system:overview:add | button |
| 23 | 7 | 编辑 | system:overview:edit | button |
| 24 | 7 | 删除 | system:overview:delete | button |

## API 设计

### 获取菜单列表

```
GET /api/v1/menus
```

**请求头：**
```
Authorization: Bearer <token>
```

**响应：**
```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "name": "素材管理",
      "path": "/system",
      "icon": "DataLine",
      "sort_order": 1,
      "children": [
        {
          "id": 7,
          "name": "素材库列表",
          "path": "/system/overview",
          "icon": null,
          "permission": "system:overview:view",
          "children": []
        }
      ]
    }
  ],
  "message": "获取成功"
}
```

### 获取用户权限列表

```
GET /api/v1/permissions
```

**响应：**
```json
{
  "code": 200,
  "data": [
    "system:overview:view",
    "system:overview:add",
    "system:overview:edit",
    "business:application:view"
  ],
  "message": "获取成功"
}
```

## 前端实现方案

### 1. 菜单获取流程

1. 用户登录成功，Pinia store 保存 token
2. Layout 组件 mounted 时调用 `GET /api/v1/menus` 获取菜单树
3. Sidebar.vue 接收菜单数据，替换静态 menuList

### 2. 按钮权限控制

1. 登录成功后调用 `GET /api/v1/permissions` 获取权限列表
2. 权限列表存储在 Pinia store 中
3. 提供自定义指令 `v-permission` 控制按钮显隐：
   ```vue
   <el-button v-permission="'system:overview:add'">新增</el-button>
   ```

### 3. 数据流向

```
Login.vue → Auth Store (token) → Layout.vue → Menu API → Menu Store → Sidebar.vue
                               → Permission API → Permission Store → v-permission 指令
```

## 后端实现方案

### 1. MVC 结构

```
serverProject/
  controllers/
    menuController.js     -- 菜单相关接口
  services/
    menuService.js        -- 菜单业务逻辑
  models/
    menuModel.js          -- 菜单数据查询
    roleModel.js          -- 角色数据查询
    permissionModel.js    -- 权限数据查询
  routes/
    menu.js               -- 菜单路由
```

### 2. 核心逻辑

**获取菜单树：**
1. 根据用户 ID 查询其角色
2. 根据角色 ID 查询关联的菜单 ID 列表
3. 根据菜单 ID 列表查询菜单详情
4. 将菜单列表构建为树形结构返回

**获取权限列表：**
1. 同上获取菜单 ID 列表
2. 查询所有 type='button' 的权限标识
3. 返回权限标识数组

## 初始化数据

### 默认角色

| id | name | description |
|----|------|-------------|
| 1 | admin | 系统管理员，拥有所有权限 |
| 2 | user | 普通用户，拥有基本查看权限 |

### 角色-菜单关联

**admin 角色：** 拥有所有菜单的访问权限（menus 表全部 ID）

**user 角色：** 拥有基本查看权限（仅 type='menu' 且 permission LIKE '%:view' 的菜单）

## 测试用例

1. **正常流程：** admin 用户登录 → 调用菜单接口 → 返回完整菜单树
2. **权限控制：** user 用户登录 → 调用菜单接口 → 只返回有权限的菜单
3. **按钮权限：** 页面中使用 v-permission 指令 → 无权限时不显示按钮
4. **菜单排序：** 菜单按 sort_order 字段正确排序
5. **菜单层级：** 返回的菜单树正确反映三级嵌套关系
