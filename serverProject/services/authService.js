const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');
require('dotenv').config();

const AuthService = {
  // 登录
  async login(username, password) {
    // 1. 查找用户
    const user = await UserModel.findByUsername(username);
    if (!user) {
      return { success: false, message: '用户名或密码错误' };
    }

    // 2. 检查用户状态
    if (user.status !== 1) {
      return { success: false, message: '账号已被禁用' };
    }

    // 3. 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return { success: false, message: '用户名或密码错误' };
    }

    // 4. 生成 JWT
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });

    // 5. 返回用户信息（不包含密码）
    return {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.display_name,
          role: user.role
        }
      }
    };
  },

  // 获取用户信息
  async getProfile(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      return { success: false, message: '用户不存在' };
    }
    return { success: true, data: user };
  }
};

module.exports = AuthService;
