const express = require('express');
const router = express.Router();
const MenuController = require('../controllers/menuController');
const authMiddleware = require('../middleware/auth');

// 获取菜单列表
router.get('/menus', authMiddleware, MenuController.getMenus);

// 获取权限列表
router.get('/permissions', authMiddleware, MenuController.getPermissions);

module.exports = router;
