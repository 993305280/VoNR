const pool = require('../config/db');

const MenuModel = {
  // 根据用户 ID 查询有权限的菜单列表
  async findByUserId(userId) {
    const [rows] = await pool.query(`
      SELECT DISTINCT m.*
      FROM menus m
      INNER JOIN role_menus rm ON m.id = rm.menu_id
      INNER JOIN user_roles ur ON rm.role_id = ur.role_id
      WHERE ur.user_id = ? AND m.status = 1 AND m.type = 'menu'
      ORDER BY m.sort_order
    `, [userId]);
    return rows;
  },

  // 根据用户 ID 查询有权限的按钮权限标识
  async findPermissionsByUserId(userId) {
    const [rows] = await pool.query(`
      SELECT DISTINCT m.permission
      FROM menus m
      INNER JOIN role_menus rm ON m.id = rm.menu_id
      INNER JOIN user_roles ur ON rm.role_id = ur.role_id
      WHERE ur.user_id = ? AND m.status = 1 AND m.permission IS NOT NULL
    `, [userId]);
    return rows.map(row => row.permission);
  },

  // 根据 ID 查询菜单
  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM menus WHERE id = ?', [id]);
    return rows[0] || null;
  },

  // 查询所有菜单
  async findAll() {
    const [rows] = await pool.query('SELECT * FROM menus WHERE status = 1 ORDER BY sort_order');
    return rows;
  }
};

module.exports = MenuModel;
