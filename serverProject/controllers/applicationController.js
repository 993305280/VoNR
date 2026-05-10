const ApplicationModel = require('../models/applicationModel');

const ApplicationController = {
  async getList(req, res) {
    try {
      const { page, pageSize, name, auditStatus, availableStatus } = req.query;
      const result = await ApplicationModel.findWithPagination({
        page: parseInt(page) || 1,
        pageSize: parseInt(pageSize) || 10,
        name,
        auditStatus,
        availableStatus
      });

      return res.json({
        code: 200,
        message: '获取成功',
        data: result
      });
    } catch (error) {
      console.error('获取应用列表失败:', error);
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: null
      });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const result = await ApplicationModel.findById(id);

      if (!result) {
        return res.status(404).json({
          code: 404,
          message: '应用不存在',
          data: null
        });
      }

      return res.json({
        code: 200,
        message: '获取成功',
        data: result
      });
    } catch (error) {
      console.error('获取应用详情失败:', error);
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: null
      });
    }
  },

  async create(req, res) {
    try {
      const { name, businessScene, subScenes, description } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          code: 400,
          message: '应用名称不能为空',
          data: null
        });
      }

      const result = await ApplicationModel.create({
        name: name.trim(),
        business_scene: businessScene,
        sub_scenes: subScenes || [],
        description
      });

      return res.json({
        code: 200,
        message: '创建成功',
        data: { id: result.id }
      });
    } catch (error) {
      console.error('创建应用失败:', error);
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: null
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, businessScene, subScenes, description } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          code: 400,
          message: '应用名称不能为空',
          data: null
        });
      }

      const existing = await ApplicationModel.findById(id);
      if (!existing) {
        return res.status(404).json({
          code: 404,
          message: '应用不存在',
          data: null
        });
      }

      const result = await ApplicationModel.update(id, {
        name: name.trim(),
        business_scene: businessScene,
        sub_scenes: subScenes,
        description
      });

      return res.json({
        code: 200,
        message: '更新成功',
        data: result
      });
    } catch (error) {
      console.error('更新应用失败:', error);
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: null
      });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await ApplicationModel.delete(id);

      if (!result) {
        return res.status(404).json({
          code: 404,
          message: '应用不存在',
          data: null
        });
      }

      return res.json({
        code: 200,
        message: '删除成功',
        data: result
      });
    } catch (error) {
      console.error('删除应用失败:', error);
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: null
      });
    }
  },

  async batchDelete(req, res) {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          code: 400,
          message: '请选择要删除的应用',
          data: null
        });
      }

      const affectedRows = await ApplicationModel.batchDelete(ids);

      return res.json({
        code: 200,
        message: '批量删除成功',
        data: { affectedRows }
      });
    } catch (error) {
      console.error('批量删除应用失败:', error);
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: null
      });
    }
  }
};

module.exports = ApplicationController;
