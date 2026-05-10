const pool = require('../config/db');

const VALID_COLUMNS = ['code', 'app_id', 'app_name', 'scene', 'sub_scene', 'type', 'channel', 'status', 'audit_status', 'available_status', 'description'];

const BusinessConfigModel = {
  async findWithPagination({ page = 1, pageSize = 10, code, status, auditStatus, availableStatus, appName }) {
    page = Math.max(1, parseInt(page) || 1);
    pageSize = Math.min(100, Math.max(1, parseInt(pageSize) || 10));

    const conditions = [];
    const params = [];

    if (code) {
      conditions.push('code LIKE ?');
      params.push(`%${code}%`);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    if (auditStatus) {
      conditions.push('audit_status = ?');
      params.push(auditStatus);
    }
    if (availableStatus) {
      conditions.push('available_status = ?');
      params.push(availableStatus);
    }
    if (appName) {
      conditions.push('app_name LIKE ?');
      params.push(`%${appName}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) AS total FROM business_configs ${whereClause}`;
    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0].total;

    const offset = (page - 1) * pageSize;
    const listSql = `SELECT * FROM business_configs ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const [list] = await pool.query(listSql, [...params, pageSize, offset]);

    const formattedList = list.map(item => ({
      ...item,
      appId: item.app_id,
      appName: item.app_name,
      subScene: item.sub_scene,
      auditStatus: item.audit_status,
      availableStatus: item.available_status,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));

    return { list: formattedList, total, page, pageSize };
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM business_configs WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    const item = rows[0];
    return {
      ...item,
      appId: item.app_id,
      appName: item.app_name,
      subScene: item.sub_scene,
      auditStatus: item.audit_status,
      availableStatus: item.available_status,
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

    const sql = `INSERT INTO business_configs (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`;
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
    const sql = `UPDATE business_configs SET ${setClauses.join(', ')} WHERE id = ?`;
    await pool.query(sql, values);

    return await this.findById(id);
  },

  async delete(id) {
    const item = await this.findById(id);
    if (!item) return null;

    await pool.query('DELETE FROM business_configs WHERE id = ?', [id]);
    return item;
  },

  async batchDelete(ids) {
    if (!ids || ids.length === 0) return 0;

    const placeholders = ids.map(() => '?').join(', ');
    const [result] = await pool.query(`DELETE FROM business_configs WHERE id IN (${placeholders})`, ids);
    return result.affectedRows;
  }
};

module.exports = BusinessConfigModel;
