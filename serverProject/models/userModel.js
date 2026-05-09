const pool = require('../config/db');

const UserModel = {
  // 根据用户名查找用户
  async findByUsername(username) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return rows[0] || null;
  },

  // 根据 ID 查找用户
  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, username, display_name, role, status, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  // 更新最后登录时间（可选功能）
  async updateLastLogin(id) {
    await pool.query(
      'UPDATE users SET updated_at = NOW() WHERE id = ?',
      [id]
    );
  }
};

module.exports = UserModel;
