const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function initDatabase() {
  // 先创建不指定数据库的连接（用于创建数据库）
  const tempPool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
  });

  try {
    // 创建数据库
    await tempPool.query(
      'CREATE DATABASE IF NOT EXISTS vonr_admin DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'
    );
    console.log('数据库 vonr_admin 创建成功');

    // 切换到 vonr_admin 数据库
    await tempPool.query('USE vonr_admin');

    // 创建用户表
    await tempPool.query(`
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
    console.log('用户表创建成功');

    // 创建应用表
    await tempPool.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        business_scene VARCHAR(50),
        sub_scenes JSON,
        audit_status ENUM('pending', 'approved', 'rejected', 'sync_success') DEFAULT 'pending',
        available_status ENUM('available', 'unavailable') DEFAULT 'available',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('应用表创建成功');

    // 创建业务配置表
    await tempPool.query(`
      CREATE TABLE IF NOT EXISTS business_configs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        code VARCHAR(50) NOT NULL COMMENT '业务指令',
        app_id INT COMMENT '关联应用ID',
        app_name VARCHAR(100) COMMENT '应用名称',
        scene VARCHAR(100) COMMENT '业务场景',
        sub_scene VARCHAR(100) COMMENT '子业务场景',
        type VARCHAR(20) COMMENT '操作类型',
        channel VARCHAR(10) COMMENT '渠道',
        status ENUM('enabled', 'disabled') DEFAULT 'enabled',
        audit_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        available_status ENUM('available', 'unavailable') DEFAULT 'available',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('业务配置表创建成功');

    // 创建用户订购关系表
    await tempPool.query(`
      CREATE TABLE IF NOT EXISTS user_subscriptions (
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
    `);
    console.log('用户订购关系表创建成功');

    // 检查是否存在管理员用户
    const [existing] = await tempPool.query('SELECT id FROM users WHERE username = ?', ['admin']);

    if (existing.length === 0) {
      // 创建默认管理员账号
      const hashedPassword = await bcrypt.hash('123456', 10);
      await tempPool.query(
        'INSERT INTO users (username, password, display_name, role) VALUES (?, ?, ?, ?)',
        ['admin', hashedPassword, '管理员', 'admin']
      );
      console.log('已创建默认管理员账号: admin/123456');
    } else {
      console.log('管理员账号已存在，跳过创建');
    }

    console.log('数据库初始化完成');
    process.exit(0);
  } catch (err) {
    console.error('数据库初始化失败:', err.message);
    process.exit(1);
  } finally {
    await tempPool.end();
  }
}

initDatabase();
