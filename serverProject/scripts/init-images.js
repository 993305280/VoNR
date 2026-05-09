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
      { name: '亚太银行数字化大会', filePath: '/uploads/images/2024/03/25/sample1.png', fileName: 'sample1.png', resolution: '1920×1080', format: 'png', fileSize: 1065000, auditType: '新增', auditStatus: '审核中', syncStatus: '未同步', available: 0, description: '银行数字化转型大会宣传图', operator: 'admin@VoNR' },
      { name: '端午节活动图片', filePath: '/uploads/images/2024/03/25/sample2.png', fileName: 'sample2.png', resolution: '512×512', format: 'png', fileSize: 980000, auditType: '新增', auditStatus: '审核失败', syncStatus: '未同步', available: 0, description: '端午节主题活动海报', operator: 'admin@VoNR' },
      { name: '亚太银行数字化大会', filePath: '/uploads/images/2024/03/25/sample3.png', fileName: 'sample3.png', resolution: '1000×654', format: 'png', fileSize: 1065000, auditType: '删除', auditStatus: '审核成功', syncStatus: '未同步', available: 0, description: '大会现场照片', operator: 'admin@VoNR' },
      { name: '端午节活动图片', filePath: '/uploads/images/2024/03/25/sample4.png', fileName: 'sample4.png', resolution: '512×512', format: 'png', fileSize: 980000, auditType: '编辑', auditStatus: '审核中', syncStatus: '未同步', available: 1, description: '端午节活动 banner 图', operator: 'admin@VoNR' },
      { name: '亚太银行数字化大会', filePath: '/uploads/images/2024/03/25/sample5.png', fileName: 'sample5.png', resolution: '1920×1080', format: 'png', fileSize: 1065000, auditType: '编辑', auditStatus: '审核成功', syncStatus: '同步成功', available: 1, description: '银行数字化大会主视觉', operator: 'admin@VoNR' },
      { name: '端午节活动图片', filePath: '/uploads/images/2024/03/25/sample6.png', fileName: 'sample6.png', resolution: '512×512', format: 'png', fileSize: 980000, auditType: '编辑', auditStatus: '审核成功', syncStatus: '同步失败', available: 1, description: '端午节祝福图片', operator: 'admin@VoNR' }
    ];

    const insertSQL = `
      INSERT IGNORE INTO images (name, file_path, file_name, resolution, format, file_size, audit_type, audit_status, sync_status, available, description, operator)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (const image of images) {
      await pool.query(insertSQL, [
        image.name,
        image.filePath,
        image.fileName,
        image.resolution,
        image.format,
        image.fileSize,
        image.auditType,
        image.auditStatus,
        image.syncStatus,
        image.available,
        image.description,
        image.operator
      ]);
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
