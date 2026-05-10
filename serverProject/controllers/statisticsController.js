const CallRecordModel = require('../models/callRecordModel');

const StatisticsController = {
  async getCallCountStats(req, res) {
    try {
      const { timeRange, granularity, startDate, endDate } = req.query;

      if (!timeRange || !granularity) {
        return res.status(400).json({
          code: 400,
          message: '缺少必要参数 timeRange 或 granularity',
          data: null
        });
      }

      const data = await CallRecordModel.countByTimeRange({
        timeRange,
        granularity,
        startDate,
        endDate
      });

      res.json({
        code: 200,
        message: '获取成功',
        data
      });
    } catch (error) {
      console.error('获取呼叫统计失败:', error);
      res.status(500).json({
        code: 500,
        message: error.message || '服务器内部错误',
        data: null
      });
    }
  },

  async getServiceCountStats(req, res) {
    try {
      const { timeRange, granularity, startDate, endDate } = req.query;

      if (!timeRange || !granularity) {
        return res.status(400).json({
          code: 400,
          message: '缺少必要参数 timeRange 或 granularity',
          data: null
        });
      }

      const data = await CallRecordModel.countServiceByTimeRange({
        timeRange,
        granularity,
        startDate,
        endDate
      });

      res.json({
        code: 200,
        message: '获取成功',
        data
      });
    } catch (error) {
      console.error('获取服务人次统计失败:', error);
      res.status(500).json({
        code: 500,
        message: error.message || '服务器内部错误',
        data: null
      });
    }
  },

  async getUserCountStats(req, res) {
    try {
      const { timeRange, granularity, startDate, endDate } = req.query;

      if (!timeRange || !granularity) {
        return res.status(400).json({
          code: 400,
          message: '缺少必要参数 timeRange 或 granularity',
          data: null
        });
      }

      const data = await CallRecordModel.countUsersByTimeRange({
        timeRange,
        granularity,
        startDate,
        endDate
      });

      res.json({
        code: 200,
        message: '获取成功',
        data
      });
    } catch (error) {
      console.error('获取服务用户数统计失败:', error);
      res.status(500).json({
        code: 500,
        message: error.message || '服务器内部错误',
        data: null
      });
    }
  }
};

module.exports = StatisticsController;
