const pool = require('../config/db');

// 合法的列名白名单，防止 SQL 注入
const VALID_COLUMNS = ['name', 'business_scene', 'sub_scenes', 'audit_status', 'available_status', 'description'];

const ApplicationModel = {
  // 分页查询应用列表
  async findWithPagination({ page = 1, pageSize = 10, name, auditStatus, availableStatus }) {
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
    if (availableStatus) {
      conditions.push('available_status = ?');
      params.push(availableStatus);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) AS total FROM applications ${whereClause}`;
    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0].total;

    const offset = (page - 1) * pageSize;
    const listSql = `SELECT * FROM applications ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const [list] = await pool.query(listSql, [...params, pageSize, offset]);

    // 格式化字段名，将 snake_case 转为 camelCase
    const formattedList = list.map(item => ({
      ...item,
      subScenes: typeof item.sub_scenes === 'string' ? JSON.parse(item.sub_scenes) : item.sub_scenes,
      businessScene: item.business_scene,
      auditStatus: item.audit_status,
      availableStatus: item.available_status,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));

    return { list: formattedList, total, page, pageSize };
  },

  // 根据 ID 查询单个应用
  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM applications WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    const item = rows[0];
    return {
      ...item,
      subScenes: typeof item.sub_scenes === 'string' ? JSON.parse(item.sub_scenes) : item.sub_scenes,
      businessScene: item.business_scene,
      auditStatus: item.audit_status,
      availableStatus: item.available_status,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    };
  },

  // 新增应用记录
  async create(data) {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(data)) {
      if (!VALID_COLUMNS.includes(key)) continue;
      if (key === 'sub_scenes') {
        fields.push(key);
        values.push(JSON.stringify(value));
      } else {
        fields.push(key);
        values.push(value);
      }
    }

    if (fields.length === 0) return null;

    const sql = `INSERT INTO applications (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`;
    const [result] = await pool.query(sql, values);

    return await this.findById(result.insertId);
  },

  // 更新应用记录
  async update(id, data) {
    const setClauses = [];
    const values = [];

    for (const [key, value] of Object.entries(data)) {
      if (!VALID_COLUMNS.includes(key)) continue;
      if (key === 'sub_scenes') {
        setClauses.push(`${key} = ?`);
        values.push(JSON.stringify(value));
      } else {
        setClauses.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (setClauses.length === 0) return null;

    values.push(id);
    const sql = `UPDATE applications SET ${setClauses.join(', ')} WHERE id = ?`;
    await pool.query(sql, values);

    return await this.findById(id);
  },

  // 删除应用记录
  async delete(id) {
    const item = await this.findById(id);
    if (!item) return null;

    await pool.query('DELETE FROM applications WHERE id = ?', [id]);
    return item;
  },

  // 批量删除应用记录
  async batchDelete(ids) {
    if (!ids || ids.length === 0) return 0;

    const placeholders = ids.map(() => '?').join(', ');
    const [result] = await pool.query(`DELETE FROM applications WHERE id IN (${placeholders})`, ids);
    return result.affectedRows;
  }
};

module.exports = ApplicationModel;
