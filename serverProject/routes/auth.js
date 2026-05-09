const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// POST /api/v1/auth/login - 登录（不需要认证）
router.post('/login', AuthController.login);

// POST /api/v1/auth/logout - 登出（需要认证）
router.post('/logout', authMiddleware, AuthController.logout);

// GET /api/v1/auth/profile - 获取用户信息（需要认证）
router.get('/profile', authMiddleware, AuthController.getProfile);

module.exports = router;
