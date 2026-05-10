const express = require('express');
const router = express.Router();
const UserSubscriptionController = require('../controllers/userSubscriptionController');
const authMiddleware = require('../middleware/auth');

router.get('/user-subscriptions', authMiddleware, UserSubscriptionController.getList);
router.get('/user-subscriptions/:id', authMiddleware, UserSubscriptionController.getById);
router.post('/user-subscriptions', authMiddleware, UserSubscriptionController.create);
router.put('/user-subscriptions/:id', authMiddleware, UserSubscriptionController.update);
router.delete('/user-subscriptions/:id', authMiddleware, UserSubscriptionController.delete);
router.post('/user-subscriptions/batch-delete', authMiddleware, UserSubscriptionController.batchDelete);

module.exports = router;
