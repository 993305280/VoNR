const pool = require('../config/db');
const CallRecordModel = require('../models/callRecordModel');

async function seed() {
  try {
    const [existing] = await pool.query('SELECT COUNT(*) AS count FROM call_records');
    const count = existing[0].count;

    if (count === 0) {
      console.log('call_records 表为空，开始生成种子数据...');
      const inserted = await CallRecordModel.seedData(10000);
      console.log(`成功插入 ${inserted} 条通话记录`);
    } else {
      console.log(`call_records 表已有 ${count} 条数据`);
      const [nullScene] = await pool.query('SELECT COUNT(*) AS count FROM call_records WHERE business_scene IS NULL');
      const nullCount = nullScene[0].count;
      if (nullCount > 0) {
        console.log(`其中 ${nullCount} 条缺少 business_scene，正在随机补充...`);
        await pool.query(`
          UPDATE call_records SET business_scene = ELT(FLOOR(1 + RAND() * 4), 'funCall', 'smartTrans', 'screenLight', 'callSubtitle')
          WHERE business_scene IS NULL
        `);
        console.log('business_scene 补充完成');
      } else {
        console.log('所有记录已有 business_scene，跳过');
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('种子数据生成失败:', error.message);
    process.exit(1);
  }
}

seed();
