const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const crypto = require('crypto');
const ImageModel = require('../models/imageModel');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'images');

const ImageService = {
  // 分页查询图片列表
  async getImages(params) {
    const { list, total, page, pageSize } = await ImageModel.findWithPagination(params);
    return {
      list: list.map(item => this.formatImageItem(item)),
      total,
      page,
      pageSize
    };
  },

  // 根据 ID 查询单个图片
  async getImageById(id) {
    const item = await ImageModel.findById(id);
    if (!item) return null;
    return this.formatImageItem(item);
  },

  // 新增图片
  async createImage(file, data) {
    // 用 sharp 提取图片分辨率
    const metadata = await sharp(file.path).metadata();
    const resolution = metadata.width && metadata.height
      ? `${metadata.width}×${metadata.height}`
      : '';

    // 生成存储路径：uploads/images/YYYY/MM/DD/uuid.ext
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const ext = path.extname(file.originalname);
    const fileName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    const relativeDir = `/${year}/${month}/${day}`;
    const targetDir = path.join(UPLOAD_DIR, String(year), month, day);
    const targetPath = path.join(targetDir, fileName);

    // 确保目录存在
    fs.mkdirSync(targetDir, { recursive: true });
    // 移动文件
    fs.renameSync(file.path, targetPath);

    const filePath = `/uploads/images${relativeDir}/${fileName}`;
    const format = ext.replace('.', '').toLowerCase();

    const record = await ImageModel.create({
      name: data.name,
      file_path: filePath,
      file_name: file.originalname,
      thumbnail_path: data.thumbnailPath || '',
      resolution,
      format,
      file_size: file.size,
      audit_type: data.auditType || '新增',
      audit_status: data.auditStatus || '审核中',
      sync_status: data.syncStatus || '未同步',
      available: data.available !== undefined ? data.available : 1,
      description: data.description || '',
      operator: data.operator || ''
    });

    return this.formatImageItem(record);
  },

  // 更新图片
  async updateImage(id, data, file) {
    const updateData = { ...data };

    if (file) {
      // 获取旧记录信息，用于删除旧文件
      const oldItem = await ImageModel.findById(id);
      if (oldItem && oldItem.file_path) {
        const oldFullPath = path.join(__dirname, '..', oldItem.file_path);
        if (fs.existsSync(oldFullPath)) {
          fs.unlinkSync(oldFullPath);
        }
      }

      // 用 sharp 提取新图片分辨率
      const metadata = await sharp(file.path).metadata();
      updateData.resolution = metadata.width && metadata.height
        ? `${metadata.width}×${metadata.height}`
        : '';

      // 生成新的存储路径
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const ext = path.extname(file.originalname);
      const fileName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
      const targetDir = path.join(UPLOAD_DIR, String(year), month, day);
      const targetPath = path.join(targetDir, fileName);

      fs.mkdirSync(targetDir, { recursive: true });
      fs.renameSync(file.path, targetPath);

      updateData.file_path = `/uploads/images/${year}/${month}/${day}/${fileName}`;
      updateData.file_name = file.originalname;
      updateData.format = ext.replace('.', '').toLowerCase();
      updateData.file_size = file.size;
    }

    // 将驼峰字段转为下划线字段
    const dbData = {};
    const fieldMap = {
      name: 'name',
      description: 'description',
      auditType: 'audit_type',
      auditStatus: 'audit_status',
      syncStatus: 'sync_status',
      available: 'available',
      operator: 'operator'
    };
    for (const [key, value] of Object.entries(updateData)) {
      if (fieldMap[key]) {
        dbData[fieldMap[key]] = value;
      } else if (['file_path', 'file_name', 'thumbnail_path', 'resolution', 'format', 'file_size'].includes(key)) {
        dbData[key] = value;
      }
    }

    const record = await ImageModel.update(id, dbData);
    return this.formatImageItem(record);
  },

  // 删除图片
  async deleteImage(id) {
    const item = await ImageModel.findById(id);
    if (!item) return null;

    // 删除文件
    if (item.file_path) {
      const fullPath = path.join(__dirname, '..', item.file_path);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    const deleted = await ImageModel.delete(id);
    return this.formatImageItem(deleted);
  },

  // 批量删除图片
  async batchDeleteImages(ids) {
    // 获取所有要删除的图片信息
    const items = await Promise.all(ids.map(id => ImageModel.findById(id)));

    // 删除所有文件
    for (const item of items) {
      if (item && item.file_path) {
        const fullPath = path.join(__dirname, '..', item.file_path);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
    }

    const affectedRows = await ImageModel.batchDelete(ids);
    return affectedRows;
  },

  // 格式化单个图片对象
  formatImageItem(item) {
    if (!item) return null;
    return {
      id: item.id,
      name: item.name,
      filePath: item.file_path,
      fileName: item.file_name,
      thumbnailPath: item.thumbnail_path,
      resolution: item.resolution,
      format: item.format,
      fileSize: item.file_size,
      fileSizeFormatted: this.formatFileSize(item.file_size),
      auditType: item.audit_type,
      auditStatus: item.audit_status,
      syncStatus: item.sync_status,
      available: item.available,
      description: item.description,
      operator: item.operator,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    };
  },

  // 格式化文件大小
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = (bytes / Math.pow(k, i)).toFixed(2);
    return `${size} ${units[i]}`;
  }
};

module.exports = ImageService;
