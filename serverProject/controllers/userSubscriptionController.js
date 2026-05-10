const UserSubscriptionModel = require('../models/userSubscriptionModel');

const UserSubscriptionController = {
  async getList(req, res) {
    try {
      const { page, pageSize, phone, startTime, endTime } = req.query;
      const result = await UserSubscriptionModel.findWithPagination({
        page: parseInt(page) || 1,
        pageSize: parseInt(pageSize) || 10,
        phone,
        startTime,
        endTime
      });

      return res.json({
        code: 200,
        message: '获取成功',
        data: result
      });
    } catch (error) {
      console.error('获取用户订购关系列表失败:', error);
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
      const result = await UserSubscriptionModel.findById(id);

      if (!result) {
        return res.status(404).json({
          code: 404,
          message: '用户订购关系不存在',
          data: null
        });
      }

      return res.json({
        code: 200,
        message: '获取成功',
        data: result
      });
    } catch (error) {
      console.error('获取用户订购关系详情失败:', error);
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: null
      });
    }
  },

  async create(req, res) {
    try {
      const { phone, appId, appName, subscriptionTime, businessScene, subScenes, description, operator } = req.body;

      if (!phone || !phone.trim()) {
        return res.status(400).json({
          code: 400,
          message: '用户号码不能为空',
          data: null
        });
      }

      const result = await UserSubscriptionModel.create({
        phone: phone.trim(),
        app_id: appId,
        app_name: appName,
        subscription_time: subscriptionTime,
        business_scene: businessScene,
        sub_scenes: subScenes,
        description,
        operator
      });

      return res.json({
        code: 200,
        message: '创建成功',
        data: { id: result.id }
      });
    } catch (error) {
      console.error('创建用户订购关系失败:', error);
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
      const { phone, appId, appName, subscriptionTime, businessScene, subScenes, description, operator } = req.body;

      if (!phone || !phone.trim()) {
        return res.status(400).json({
          code: 400,
          message: '用户号码不能为空',
          data: null
        });
      }

      const existing = await UserSubscriptionModel.findById(id);
      if (!existing) {
        return res.status(404).json({
          code: 404,
          message: '用户订购关系不存在',
          data: null
        });
      }

      const result = await UserSubscriptionModel.update(id, {
        phone: phone.trim(),
        app_id: appId,
        app_name: appName,
        subscription_time: subscriptionTime,
        business_scene: businessScene,
        sub_scenes: subScenes,
        description,
        operator
      });

      return res.json({
        code: 200,
        message: '更新成功',
        data: result
      });
    } catch (error) {
      console.error('更新用户订购关系失败:', error);
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
      const result = await UserSubscriptionModel.delete(id);

      if (!result) {
        return res.status(404).json({
          code: 404,
          message: '用户订购关系不存在',
          data: null
        });
      }

      return res.json({
        code: 200,
        message: '删除成功',
        data: result
      });
    } catch (error) {
      console.error('删除用户订购关系失败:', error);
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
          message: '请选择要删除的用户订购关系',
          data: null
        });
      }

      const affectedRows = await UserSubscriptionModel.batchDelete(ids);

      return res.json({
        code: 200,
        message: '批量删除成功',
        data: { affectedRows }
      });
    } catch (error) {
      console.error('批量删除用户订购关系失败:', error);
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: null
      });
    }
  }
};

module.exports = UserSubscriptionController;
