const BusinessConfigModel = require('../models/businessConfigModel');

const BusinessConfigController = {
  async getList(req, res) {
    try {
      const { page, pageSize, code, status, auditStatus, availableStatus, appName } = req.query;
      const result = await BusinessConfigModel.findWithPagination({
        page: parseInt(page) || 1,
        pageSize: parseInt(pageSize) || 10,
        code,
        status,
        auditStatus,
        availableStatus,
        appName
      });

      return res.json({
        code: 200,
        message: '获取成功',
        data: result
      });
    } catch (error) {
      console.error('获取业务配置列表失败:', error);
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
      const result = await BusinessConfigModel.findById(id);

      if (!result) {
        return res.status(404).json({
          code: 404,
          message: '业务配置不存在',
          data: null
        });
      }

      return res.json({
        code: 200,
        message: '获取成功',
        data: result
      });
    } catch (error) {
      console.error('获取业务配置详情失败:', error);
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: null
      });
    }
  },

  async create(req, res) {
    try {
      const { code, appId, appName, scene, subScene, type, channel, status, description } = req.body;

      if (!code || !code.trim()) {
        return res.status(400).json({
          code: 400,
          message: '业务指令不能为空',
          data: null
        });
      }

      const result = await BusinessConfigModel.create({
        code: code.trim(),
        app_id: appId,
        app_name: appName,
        scene,
        sub_scene: subScene,
        type,
        channel,
        status: status || 'enabled',
        description
      });

      return res.json({
        code: 200,
        message: '创建成功',
        data: { id: result.id }
      });
    } catch (error) {
      console.error('创建业务配置失败:', error);
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
      const { code, appId, appName, scene, subScene, type, channel, status, description } = req.body;

      if (!code || !code.trim()) {
        return res.status(400).json({
          code: 400,
          message: '业务指令不能为空',
          data: null
        });
      }

      const existing = await BusinessConfigModel.findById(id);
      if (!existing) {
        return res.status(404).json({
          code: 404,
          message: '业务配置不存在',
          data: null
        });
      }

      const result = await BusinessConfigModel.update(id, {
        code: code.trim(),
        app_id: appId,
        app_name: appName,
        scene,
        sub_scene: subScene,
        type,
        channel,
        status,
        description
      });

      return res.json({
        code: 200,
        message: '更新成功',
        data: result
      });
    } catch (error) {
      console.error('更新业务配置失败:', error);
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
      const result = await BusinessConfigModel.delete(id);

      if (!result) {
        return res.status(404).json({
          code: 404,
          message: '业务配置不存在',
          data: null
        });
      }

      return res.json({
        code: 200,
        message: '删除成功',
        data: result
      });
    } catch (error) {
      console.error('删除业务配置失败:', error);
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
          message: '请选择要删除的业务配置',
          data: null
        });
      }

      const affectedRows = await BusinessConfigModel.batchDelete(ids);

      return res.json({
        code: 200,
        message: '批量删除成功',
        data: { affectedRows }
      });
    } catch (error) {
      console.error('批量删除业务配置失败:', error);
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: null
      });
    }
  }
};

module.exports = BusinessConfigController;
