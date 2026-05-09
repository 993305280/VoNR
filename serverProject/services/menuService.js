const MenuModel = require('../models/menuModel');

const MenuService = {
  // 获取菜单树
  async getMenuTree(userId) {
    // 1. 查询用户有权限的菜单列表
    const menus = await MenuModel.findByUserId(userId);

    // 2. 构建菜单树
    const menuMap = {};
    const rootMenus = [];

    // 先将所有菜单放入 map
    menus.forEach(menu => {
      menuMap[menu.id] = {
        id: menu.id,
        name: menu.name,
        path: menu.path,
        icon: menu.icon,
        sort_order: menu.sort_order,
        permission: menu.permission,
        children: []
      };
    });

    // 构建树形结构
    menus.forEach(menu => {
      const menuItem = menuMap[menu.id];
      if (menu.parent_id === 0) {
        rootMenus.push(menuItem);
      } else if (menuMap[menu.parent_id]) {
        menuMap[menu.parent_id].children.push(menuItem);
      }
    });

    // 按 sort_order 排序
    const sortTree = (items) => {
      items.sort((a, b) => a.sort_order - b.sort_order);
      items.forEach(item => {
        if (item.children.length > 0) {
          sortTree(item.children);
        }
      });
    };
    sortTree(rootMenus);

    return rootMenus;
  },

  // 获取用户权限列表
  async getPermissions(userId) {
    return await MenuModel.findPermissionsByUserId(userId);
  }
};

module.exports = MenuService;
