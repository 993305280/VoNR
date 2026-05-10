const express = require('express');
const router = express.Router();
const ApplicationController = require('../controllers/applicationController');
const authMiddleware = require('../middleware/auth');

router.get('/applications', authMiddleware, ApplicationController.getList);
router.get('/applications/:id', authMiddleware, ApplicationController.getById);
router.post('/applications', authMiddleware, ApplicationController.create);
router.put('/applications/:id', authMiddleware, ApplicationController.update);
router.delete('/applications/:id', authMiddleware, ApplicationController.delete);
router.post('/applications/batch-delete', authMiddleware, ApplicationController.batchDelete);

module.exports = router;
