const MenuService = require('../services/menuService');

const MenuController = {
  // GET /api/v1/menus
  async getMenus(req, res) {
    try {
      const userId = req.user.userId;
      const menus = await MenuService.getMenuTree(userId);

      return res.json({
        code: 200,
        message: '获取成功',
        data: menus
      });
    } catch (error) {
      console.error('获取菜单失败:', error);
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: null
      });
    }
  },

  // GET /api/v1/permissions
  async getPermissions(req, res) {
    try {
      const userId = req.user.userId;
      const permissions = await MenuService.getPermissions(userId);

      return res.json({
        code: 200,
        message: '获取成功',
        data: permissions
      });
    } catch (error) {
      console.error('获取权限失败:', error);
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: null
      });
    }
  }
};

module.exports = MenuController;
