const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

async function initImages() {
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
    // 创建 images 表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL COMMENT '素材名称',
        file_path VARCHAR(500) NOT NULL COMMENT '文件存储路径',
        file_name VARCHAR(200) NOT NULL COMMENT '原始文件名',
        thumbnail_path VARCHAR(500) COMMENT '缩略图路径',
        resolution VARCHAR(50) COMMENT '分辨率，如 1920×1080',
        format VARCHAR(20) NOT NULL COMMENT '文件格式，如 png/jpg',
        file_size INT NOT NULL COMMENT '文件大小（字节）',
        audit_type ENUM('新增', '编辑', '删除') DEFAULT '新增' COMMENT '审核类型',
        audit_status ENUM('审核中', '审核成功', '审核失败') DEFAULT '审核中' COMMENT '审核状态',
        sync_status ENUM('未同步', '同步中', '同步成功', '同步失败') DEFAULT '未同步' COMMENT '同步状态',
        available TINYINT DEFAULT 1 COMMENT '可用状态：1-可用，0-不可用',
        description TEXT COMMENT '素材说明',
        operator VARCHAR(100) COMMENT '操作者',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='图片素材表'
    `);
    console.log('images 表创建成功');

    // 插入示例数据
    const images = [
      ['亚太银行数字化大会', '/uploads/images/2024/03/25/sample1.png', 'sample1.png', '1920×1080', 'png', 1065000, '新增', '审核中', '未同步', 0, '这是说明这是说明', 'admin@VoNR'],
      ['端午节活动图片', '/uploads/images/2024/03/25/sample2.png', 'sample2.png', '512×512', 'png', 980000, '新增', '审核失败', '未同步', 0, '这是说明这是说明这里...', 'admin@VoNR'],
      ['亚太银行数字化大会', '/uploads/images/2024/03/25/sample3.png', 'sample3.png', '1000×654', 'png', 1065000, '删除', '审核成功', '未同步', 0, '这是说明这是说明', 'admin@VoNR'],
      ['端午节活动图片', '/uploads/images/2024/03/25/sample4.png', 'sample4.png', '512×512', 'png', 980000, '编辑', '审核中', '未同步', 1, '这是说明这是说明这里...', 'admin@VoNR'],
      ['亚太银行数字化大会', '/uploads/images/2024/03/25/sample5.png', 'sample5.png', '1920×1080', 'png', 1065000, '编辑', '审核成功', '同步成功', 1, '这是说明这是说明', 'admin@VoNR'],
      ['端午节活动图片', '/uploads/images/2024/03/25/sample6.png', 'sample6.png', '512×512', 'png', 980000, '编辑', '审核成功', '同步失败', 1, '这是说明这是说明这里...', 'admin@VoNR']
    ];

    const insertSQL = `
      INSERT IGNORE INTO images (name, file_path, file_name, resolution, format, file_size, audit_type, audit_status, sync_status, available, description, operator)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (const image of images) {
      await pool.query(insertSQL, image);
    }
    console.log('示例数据插入成功');

    console.log('images 表初始化完成');
    process.exit(0);
  } catch (err) {
    console.error('images 表初始化失败:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 支持直接运行和作为模块导入两种方式
if (require.main === module) {
  initImages();
} else {
  module.exports = initImages;
}
