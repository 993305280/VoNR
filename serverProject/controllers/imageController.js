const ImageService = require('../services/imageService');

const ImageController = {
  // GET /api/v1/images
  async getList(req, res) {
    try {
      const { page, pageSize, name, auditStatus, syncStatus } = req.query;
      const result = await ImageService.getImages({
        page: parseInt(page) || 1,
        pageSize: parseInt(pageSize) || 10,
        name,
        auditStatus,
        syncStatus
      });

      return res.json({
        code: 200,
        message: '获取成功',
        data: result
      });
    } catch (error) {
      console.error('获取图片列表失败:', error);
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: null
      });
    }
  },

  // GET /api/v1/images/:id
  async getById(req, res) {
    try {
      const { id } = req.params;
      const result = await ImageService.getImageById(id);

      if (!result) {
        return res.status(404).json({
          code: 404,
          message: '图片不存在',
          data: null
        });
      }

      return res.json({
        code: 200,
        message: '获取成功',
        data: result
      });
    } catch (error) {
      console.error('获取图片详情失败:', error);
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: null
      });
    }
  },

  // POST /api/v1/images
  async create(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          code: 400,
          message: '请上传图片文件',
          data: null
        });
      }

      const { name, description, auditType, auditStatus, syncStatus, available } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          code: 400,
          message: '图片名称不能为空',
          data: null
        });
      }

      const operator = req.user ? req.user.username : '';

      const result = await ImageService.createImage(req.file, {
        name: name.trim(),
        description,
        auditType,
        auditStatus,
        syncStatus,
        available: available !== undefined ? parseInt(available) : undefined,
        operator
      });

      return res.json({
        code: 200,
        message: '上传成功',
        data: result
      });
    } catch (error) {
      console.error('上传图片失败:', error);
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: null
      });
    }
  },

  // PUT /api/v1/images/:id
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description, auditType, auditStatus, syncStatus, available } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          code: 400,
          message: '图片名称不能为空',
          data: null
        });
      }

      const existing = await ImageService.getImageById(id);
      if (!existing) {
        return res.status(404).json({
          code: 404,
          message: '图片不存在',
          data: null
        });
      }

      const operator = req.user ? req.user.username : '';

      const result = await ImageService.updateImage(id, {
        name: name.trim(),
        description,
        auditType,
        auditStatus,
        syncStatus,
        available: available !== undefined ? parseInt(available) : undefined,
        operator
      }, req.file);

      return res.json({
        code: 200,
        message: '更新成功',
        data: result
      });
    } catch (error) {
      console.error('更新图片失败:', error);
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: null
      });
    }
  },

  // DELETE /api/v1/images/:id
  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await ImageService.deleteImage(id);

      if (!result) {
        return res.status(404).json({
          code: 404,
          message: '图片不存在',
          data: null
        });
      }

      return res.json({
        code: 200,
        message: '删除成功',
        data: result
      });
    } catch (error) {
      console.error('删除图片失败:', error);
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: null
      });
    }
  },

  // POST /api/v1/images/batch-delete
  async batchDelete(req, res) {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          code: 400,
          message: '请选择要删除的图片',
          data: null
        });
      }

      const affectedRows = await ImageService.batchDeleteImages(ids);

      return res.json({
        code: 200,
        message: '批量删除成功',
        data: { affectedRows }
      });
    } catch (error) {
      console.error('批量删除图片失败:', error);
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: null
      });
    }
  }
};

module.exports = ImageController;
