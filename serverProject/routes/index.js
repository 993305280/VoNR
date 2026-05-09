const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const menuRoutes = require('./menu');
const imageRoutes = require('./image');

// 挂载路由
router.use('/auth', authRoutes);
router.use('/', menuRoutes);
router.use('/', imageRoutes);

module.exports = router;
