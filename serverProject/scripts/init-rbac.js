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
