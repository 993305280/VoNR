const AuthService = require('../services/authService');

const AuthController = {
  // POST /api/v1/auth/login
  async login(req, res) {
    try {
      const { username, password } = req.body;

      // 参数验证
      if (!username || !password) {
        return res.status(400).json({
          code: 400,
          message: '用户名和密码不能为空',
          data: null
        });
      }

      // 调用服务层
      const result = await AuthService.login(username, password);

      if (!result.success) {
        return res.status(401).json({
          code: 401,
          message: result.message,
          data: null
        });
      }

      // 登录成功
      return res.json({
        code: 200,
        message: '登录成功',
        data: result.data
      });
    } catch (error) {
      console.error('登录失败:', error);
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: null
      });
    }
  },

  // POST /api/v1/auth/logout
  async logout(req, res) {
    // JWT 是无状态的，服务端不需要做任何处理
    // 前端只需删除本地存储的 token
    return res.json({
      code: 200,
      message: '登出成功',
      data: null
    });
  },

  // GET /api/v1/auth/profile
  async getProfile(req, res) {
    try {
      // 从 JWT 中间件获取用户 ID
      const userId = req.user.userId;

      const result = await AuthService.getProfile(userId);

      if (!result.success) {
        return res.status(404).json({
          code: 404,
          message: result.message,
          data: null
        });
      }

      return res.json({
        code: 200,
        message: '获取成功',
        data: result.data
      });
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: null
      });
    }
  }
};

module.exports = AuthController;
