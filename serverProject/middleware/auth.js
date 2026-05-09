const jwt = require('jsonwebtoken');
require('dotenv').config();

// JWT 认证中间件
function authMiddleware(req, res, next) {
  // 从请求头获取 token
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 401,
      message: '未提供认证令牌',
      data: null
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 将用户信息附加到请求对象
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        code: 401,
        message: '认证令牌已过期',
        data: null
      });
    }
    return res.status(401).json({
      code: 401,
      message: '无效的认证令牌',
      data: null
    });
  }
}

module.exports = authMiddleware;
