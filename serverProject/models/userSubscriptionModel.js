const pool = require('../config/db');

const VALID_COLUMNS = ['phone', 'app_id', 'app_name', 'subscription_time', 'business_scene', 'sub_scenes', 'description', 'operator'];

const UserSubscriptionModel = {
  async findWithPagination({ page = 1, pageSize = 10, phone, startTime, endTime }) {
    page = Math.max(1, parseInt(page) || 1);
    pageSize = Math.min(100, Math.max(1, parseInt(pageSize) || 10));

    const conditions = [];
    const params = [];

    if (phone) {
      conditions.push('phone LIKE ?');
      params.push(`%${phone}%`);
    }
    if (startTime) {
      conditions.push('subscription_time >= ?');
      params.push(startTime);
    }
    if (endTime) {
      conditions.push('subscription_time <= ?');
      params.push(endTime);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) AS total FROM user_subscriptions ${whereClause}`;
    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0].total;

    const offset = (page - 1) * pageSize;
    const listSql = `SELECT * FROM user_subscriptions ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const [list] = await pool.query(listSql, [...params, pageSize, offset]);

    const formattedList = list.map(item => ({
      ...item,
      appId: item.app_id,
      appName: item.app_name,
      subscriptionTime: item.subscription_time,
      businessScene: item.business_scene,
      subScenes: item.sub_scenes,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));

    return { list: formattedList, total, page, pageSize };
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM user_subscriptions WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    const item = rows[0];
    return {
      ...item,
      appId: item.app_id,
      appName: item.app_name,
      subscriptionTime: item.subscription_time,
      businessScene: item.business_scene,
      subScenes: item.sub_scenes,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    };
  },

  async create(data) {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(data)) {
      if (!VALID_COLUMNS.includes(key)) continue;
      fields.push(key);
      values.push(value);
    }

    if (fields.length === 0) return null;

    const sql = `INSERT INTO user_subscriptions (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`;
    const [result] = await pool.query(sql, values);

    return await this.findById(result.insertId);
  },

  async update(id, data) {
    const setClauses = [];
    const values = [];

    for (const [key, value] of Object.entries(data)) {
      if (!VALID_COLUMNS.includes(key)) continue;
      setClauses.push(`${key} = ?`);
      values.push(value);
    }

    if (setClauses.length === 0) return null;

    values.push(id);
    const sql = `UPDATE user_subscriptions SET ${setClauses.join(', ')} WHERE id = ?`;
    await pool.query(sql, values);

    return await this.findById(id);
  },

  async delete(id) {
    const item = await this.findById(id);
    if (!item) return null;

    await pool.query('DELETE FROM user_subscriptions WHERE id = ?', [id]);
    return item;
  },

  async batchDelete(ids) {
    if (!ids || ids.length === 0) return 0;

    const placeholders = ids.map(() => '?').join(', ');
    const [result] = await pool.query(`DELETE FROM user_subscriptions WHERE id IN (${placeholders})`, ids);
    return result.affectedRows;
  }
};

module.exports = UserSubscriptionModel;
