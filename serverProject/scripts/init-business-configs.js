const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

async function initBusinessConfigs() {
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
    // 检查是否已有数据
    const [existing] = await pool.query('SELECT COUNT(*) as count FROM business_configs');

    if (existing[0].count > 0) {
      console.log(`business_configs 表已有 ${existing[0].count} 条数据，跳过插入`);
      process.exit(0);
    }

    // 插入测试数据
    await pool.query(`
      INSERT INTO business_configs (code, app_id, app_name, scene, sub_scene, type, channel, status, audit_status, available_status, description) VALUES
      ('*10#', 1, '企业品牌宣传应用5', '001趣味通话', '001001虚拟背景', '启动', 'DC', 'enabled', 'approved', 'available', '视频通话测试配置'),
      ('*11#', 2, '语音通话应用', '002基础通话', '002001语音通话', '停止', 'VC', 'enabled', 'pending', 'available', '语音通话配置'),
      ('*12#', 3, '即时通讯应用', '003即时通讯', '003001文字消息', '启动', 'DC', 'disabled', 'rejected', 'unavailable', '即时通讯配置'),
      ('*13#', 4, '会议系统应用', '004会议场景', '004001视频会议', '启动', 'VC', 'enabled', 'approved', 'available', '会议系统配置'),
      ('*14#', 5, '直播推流应用', '005直播场景', '005001推流配置', '启动', 'DC', 'enabled', 'approved', 'available', '直播推流配置'),
      ('*15#', 1, '企业品牌宣传应用5', '001趣味通话', '001002美颜效果', '停止', 'VC', 'disabled', 'pending', 'unavailable', '美颜效果配置'),
      ('*16#', 6, '远程医疗应用', '006医疗场景', '006001远程问诊', '启动', 'DC', 'enabled', 'approved', 'available', '远程医疗配置'),
      ('*17#', 7, '在线教育应用', '007教育场景', '007001直播课堂', '启动', 'VC', 'enabled', 'approved', 'available', '在线教育配置'),
      ('*18#', 8, '智能客服应用', '008客服场景', '008001语音客服', '启动', 'DC', 'enabled', 'pending', 'available', '智能客服配置'),
      ('*19#', 9, '视频会议Pro', '004会议场景', '004002大型会议', '启动', 'VC', 'enabled', 'approved', 'available', '视频会议Pro配置')
    `);

    console.log('成功插入 10 条 business_configs 测试数据');

    // 验证数据
    const [result] = await pool.query('SELECT id, code, app_name, scene FROM business_configs');
    console.log('插入的数据:');
    result.forEach(row => {
      console.log(`  id=${row.id}, code=${row.code}, app=${row.app_name}, scene=${row.scene}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('插入 business_configs 测试数据失败:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initBusinessConfigs();
