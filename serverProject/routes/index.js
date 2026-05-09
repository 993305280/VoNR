const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');

// 挂载路由
router.use('/auth', authRoutes);

module.exports = router;
