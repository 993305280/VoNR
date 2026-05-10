const pool = require('../config/db');

const SCENES = ['funCall', 'smartTrans', 'screenLight', 'callSubtitle'];

function calcTimeRange(timeRange, granularity, startDate, endDate) {
  const now = new Date();
  let startTime, endTime;

  if (timeRange === 'today') {
    startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  } else if (timeRange === 'month') {
    startTime = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    endTime = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  } else if (timeRange === 'year') {
    startTime = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
    endTime = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
  } else if (timeRange === 'custom') {
    if (!startDate || !endDate) {
      throw new Error('自定义时间范围需要提供 startDate 和 endDate');
    }
    startTime = new Date(startDate + 'T00:00:00');
    endTime = new Date(endDate + 'T23:59:59');
  } else {
    throw new Error('无效的 timeRange 参数');
  }

  let dateFormat;
  if (granularity === 'hour') {
    dateFormat = '%Y-%m-%d %H:00';
  } else if (granularity === 'day') {
    dateFormat = '%Y-%m-%d';
  } else if (granularity === 'month') {
    dateFormat = '%Y-%m';
  } else {
    throw new Error('无效的 granularity 参数');
  }

  return { startTime, endTime, dateFormat };
}

function fillTimeSlots(startTime, endTime, granularity, dataMap) {
  const xData = [];
  const seriesData = {};
  SCENES.forEach(scene => { seriesData[scene] = []; });

  const current = new Date(startTime);
  while (current <= endTime) {
    let label;
    let slotKey;

    if (granularity === 'hour') {
      label = `${String(current.getHours()).padStart(2, '0')}:00`;
      slotKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')} ${String(current.getHours()).padStart(2, '0')}:00`;
      current.setHours(current.getHours() + 1);
    } else if (granularity === 'day') {
      label = `${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
      slotKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
      current.setDate(current.getDate() + 1);
    } else if (granularity === 'month') {
      label = `${current.getMonth() + 1}月`;
      slotKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      current.setMonth(current.getMonth() + 1);
    }

    xData.push(label);
    SCENES.forEach(scene => {
      const key = `${slotKey}|${scene}`;
      seriesData[scene].push(dataMap[key] || 0);
    });
  }

  const all = xData.map((_, i) =>
    SCENES.reduce((sum, scene) => sum + seriesData[scene][i], 0)
  );

  return { xData, seriesData: { ...seriesData, all } };
}

const CallRecordModel = {
  async countByTimeRange({ timeRange, granularity, startDate, endDate }) {
    const { startTime, endTime, dateFormat } = calcTimeRange(timeRange, granularity, startDate, endDate);

    const sql = `
      SELECT DATE_FORMAT(start_time, '${dateFormat}') AS time_slot, COUNT(*) AS count
      FROM call_records
      WHERE start_time >= ? AND start_time <= ?
      GROUP BY time_slot
      ORDER BY time_slot
    `;

    const [rows] = await pool.query(sql, [startTime, endTime]);

    const xData = [];
    const yData = [];
    const dataMap = {};

    rows.forEach(row => {
      dataMap[row.time_slot] = row.count;
    });

    const current = new Date(startTime);
    while (current <= endTime) {
      let label;
      let slotKey;

      if (granularity === 'hour') {
        label = `${String(current.getHours()).padStart(2, '0')}:00`;
        slotKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')} ${String(current.getHours()).padStart(2, '0')}:00`;
        current.setHours(current.getHours() + 1);
      } else if (granularity === 'day') {
        label = `${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
        slotKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
        current.setDate(current.getDate() + 1);
      } else if (granularity === 'month') {
        label = `${current.getMonth() + 1}月`;
        slotKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
        current.setMonth(current.getMonth() + 1);
      }

      xData.push(label);
      yData.push(dataMap[slotKey] || 0);
    }

    return { xData, yData };
  },

  async countServiceByTimeRange({ timeRange, granularity, startDate, endDate }) {
    const { startTime, endTime, dateFormat } = calcTimeRange(timeRange, granularity, startDate, endDate);

    const sql = `
      SELECT DATE_FORMAT(start_time, '${dateFormat}') AS time_slot,
             business_scene,
             COUNT(*) AS count
      FROM call_records
      WHERE start_time >= ? AND start_time <= ?
      GROUP BY time_slot, business_scene
      ORDER BY time_slot
    `;

    const [rows] = await pool.query(sql, [startTime, endTime]);

    const dataMap = {};
    rows.forEach(row => {
      if (row.business_scene) {
        dataMap[`${row.time_slot}|${row.business_scene}`] = row.count;
      }
    });

    return fillTimeSlots(startTime, endTime, granularity, dataMap);
  },

  async countUsersByTimeRange({ timeRange, granularity, startDate, endDate }) {
    const { startTime, endTime, dateFormat } = calcTimeRange(timeRange, granularity, startDate, endDate);

    const sql = `
      SELECT DATE_FORMAT(start_time, '${dateFormat}') AS time_slot,
             business_scene,
             COUNT(DISTINCT caller_number) AS count
      FROM call_records
      WHERE start_time >= ? AND start_time <= ?
      GROUP BY time_slot, business_scene
      ORDER BY time_slot
    `;

    const [rows] = await pool.query(sql, [startTime, endTime]);

    const dataMap = {};
    rows.forEach(row => {
      if (row.business_scene) {
        dataMap[`${row.time_slot}|${row.business_scene}`] = row.count;
      }
    });

    return fillTimeSlots(startTime, endTime, granularity, dataMap);
  },

  async seedData(count = 10000) {
    const records = [];
    const now = new Date();
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const sceneWeights = [0.3, 0.25, 0.25, 0.2];

    for (let i = 0; i < count; i++) {
      const startTime = new Date(oneYearAgo.getTime() + Math.random() * (now.getTime() - oneYearAgo.getTime()));
      const durationSeconds = Math.floor(Math.random() * 1800) + 10;
      const endTime = new Date(startTime.getTime() + durationSeconds * 1000);

      const callerNumber = `1${['3', '5', '7', '8', '9'][Math.floor(Math.random() * 5)]}${String(Math.floor(Math.random() * 1000000000)).padStart(9, '0')}`;
      const calleeNumber = `1${['3', '5', '7', '8', '9'][Math.floor(Math.random() * 5)]}${String(Math.floor(Math.random() * 1000000000)).padStart(9, '0')}`;

      const directions = ['uplink', 'downlink'];
      const types = ['audio', 'video'];
      const typeWeights = [0.7, 0.3];

      const rand = Math.random();
      let cumulative = 0;
      let scene = SCENES[0];
      for (let j = 0; j < sceneWeights.length; j++) {
        cumulative += sceneWeights[j];
        if (rand < cumulative) {
          scene = SCENES[j];
          break;
        }
      }

      records.push([
        `FW${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        callerNumber,
        calleeNumber,
        `AP${String(Math.floor(Math.random() * 100000000)).padStart(9, '0')}`,
        directions[Math.floor(Math.random() * 2)],
        Math.random() < typeWeights[0] ? types[0] : types[1],
        scene,
        startTime,
        endTime
      ]);
    }

    const chunkSize = 500;
    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize);
      const placeholders = chunk.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
      const flatValues = chunk.flat();
      await pool.query(
        `INSERT INTO call_records (call_id, caller_number, callee_number, app_id, call_direction, call_type, business_scene, start_time, end_time) VALUES ${placeholders}`,
        flatValues
      );
    }

    return count;
  }
};

module.exports = CallRecordModel;
