const express = require('express');
const router = express.Router();
const BusinessConfigController = require('../controllers/businessConfigController');
const authMiddleware = require('../middleware/auth');

router.get('/business-configs', authMiddleware, BusinessConfigController.getList);
router.get('/business-configs/:id', authMiddleware, BusinessConfigController.getById);
router.post('/business-configs', authMiddleware, BusinessConfigController.create);
router.put('/business-configs/:id', authMiddleware, BusinessConfigController.update);
router.delete('/business-configs/:id', authMiddleware, BusinessConfigController.delete);
router.post('/business-configs/batch-delete', authMiddleware, BusinessConfigController.batchDelete);

module.exports = router;
