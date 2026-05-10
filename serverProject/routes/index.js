const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const menuRoutes = require('./menu');
const imageRoutes = require('./image');
const applicationRoutes = require('./application');

// 挂载路由
router.use('/auth', authRoutes);
router.use('/', menuRoutes);
router.use('/', imageRoutes);
router.use('/', applicationRoutes);
const businessConfigRoutes = require('./businessConfig');
router.use('/', businessConfigRoutes);
const userSubscriptionRoutes = require('./userSubscription');
router.use('/', userSubscriptionRoutes);

module.exports = router;
