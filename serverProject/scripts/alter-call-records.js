const pool = require('../config/db');

async function alterTable() {
  try {
    const [columns] = await pool.query("SHOW COLUMNS FROM call_records LIKE 'business_scene'");
    if (columns.length > 0) {
      console.log('call_records 表已有 business_scene 列，跳过');
      process.exit(0);
    }

    await pool.query(
      "ALTER TABLE call_records ADD COLUMN business_scene ENUM('funCall','smartTrans','screenLight','callSubtitle') COMMENT '业务场景' AFTER call_type"
    );
    console.log('成功添加 business_scene 列');
    process.exit(0);
  } catch (error) {
    console.error('修改表结构失败:', error.message);
    process.exit(1);
  }
}

alterTable();
