const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const menuRoutes = require('./menu');

// 挂载路由
router.use('/auth', authRoutes);
router.use('/', menuRoutes);

module.exports = router;
