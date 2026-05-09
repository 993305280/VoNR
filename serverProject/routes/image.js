const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const ImageController = require('../controllers/imageController');
const authMiddleware = require('../middleware/auth');

// 配置 multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'images'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('只能上传 png/jpg 格式的图片'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// 获取图片列表
router.get('/images', authMiddleware, ImageController.getList);

// 获取图片详情
router.get('/images/:id', authMiddleware, ImageController.getById);

// 新增图片
router.post('/images', authMiddleware, upload.single('file'), ImageController.create);

// 更新图片
router.put('/images/:id', authMiddleware, upload.single('file'), ImageController.update);

// 删除图片
router.delete('/images/:id', authMiddleware, ImageController.delete);

// 批量删除
router.post('/images/batch-delete', authMiddleware, ImageController.batchDelete);

module.exports = router;
