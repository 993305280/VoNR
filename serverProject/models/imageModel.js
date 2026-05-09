const pool = require('../config/db');

// 合法的列名白名单，防止 SQL 注入
const VALID_COLUMNS = ['name', 'file_path', 'file_name', 'thumbnail_path', 'resolution', 'format', 'file_size', 'audit_type', 'audit_status', 'sync_status', 'available', 'description', 'operator'];

const ImageModel = {
  // 分页查询图片列表
  async findWithPagination({ page = 1, pageSize = 10, name, auditStatus, available }) {
    // 校验分页参数
    page = Math.max(1, parseInt(page) || 1);
    pageSize = Math.min(100, Math.max(1, parseInt(pageSize) || 10));

    const conditions = [];
    const params = [];

    if (name) {
      conditions.push('name LIKE ?');
      params.push(`%${name}%`);
    }
    if (auditStatus) {
      conditions.push('audit_status = ?');
      params.push(auditStatus);
    }
    if (available !== undefined && available !== null && available !== '') {
      conditions.push('available = ?');
      params.push(Number(available));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) AS total FROM images ${whereClause}`;
    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0].total;

    const offset = (page - 1) * pageSize;
    const listSql = `SELECT * FROM images ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const [list] = await pool.query(listSql, [...params, pageSize, offset]);

    return { list, total, page, pageSize };
  },

  // 根据 ID 查询单个图片
  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM images WHERE id = ?', [id]);
    return rows[0] || null;
  },

  // 新增图片记录
  async create(data) {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(data)) {
      if (!VALID_COLUMNS.includes(key)) continue;
      fields.push(key);
      values.push(value);
    }

    if (fields.length === 0) return null;

    const sql = `INSERT INTO images (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`;
    const [result] = await pool.query(sql, values);

    return await this.findById(result.insertId);
  },

  // 更新图片记录
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
    const sql = `UPDATE images SET ${setClauses.join(', ')} WHERE id = ?`;
    await pool.query(sql, values);

    return await this.findById(id);
  },

  // 删除图片记录
  async delete(id) {
    const item = await this.findById(id);
    if (!item) return null;

    await pool.query('DELETE FROM images WHERE id = ?', [id]);
    return item;
  },

  // 批量删除图片记录
  async batchDelete(ids) {
    if (!ids || ids.length === 0) return 0;

    const placeholders = ids.map(() => '?').join(', ');
    const [result] = await pool.query(`DELETE FROM images WHERE id IN (${placeholders})`, ids);
    return result.affectedRows;
  }
};

module.exports = ImageModel;
