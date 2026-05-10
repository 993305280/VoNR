const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const StatisticsController = require('../controllers/statisticsController');

router.get('/statistics/call-count', authMiddleware, StatisticsController.getCallCountStats);
router.get('/statistics/service-count', authMiddleware, StatisticsController.getServiceCountStats);
router.get('/statistics/user-count', authMiddleware, StatisticsController.getUserCountStats);

module.exports = router;
