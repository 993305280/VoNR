const pool = require('../config/db');

const RoleModel = {
  // 根据用户 ID 查询角色
  async findByUserId(userId) {
    const [rows] = await pool.query(`
      SELECT r.*
      FROM roles r
      INNER JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = ? AND r.status = 1
    `, [userId]);
    return rows;
  },

  // 根据 ID 查询角色
  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM roles WHERE id = ?', [id]);
    return rows[0] || null;
  },

  // 查询所有角色
  async findAll() {
    const [rows] = await pool.query('SELECT * FROM roles WHERE status = 1');
    return rows;
  }
};

module.exports = RoleModel;
