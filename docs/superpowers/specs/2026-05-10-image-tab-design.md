# 图片 Tab 接口与前端对接设计文档

## 概述

为 VoNR 项目"素材库列表"的图片 tab 实现完整的后端 API 和前端对接，包括文件上传、CRUD 操作、分页查询和批量删除功能。

## 需求

1. 将图片 tab 抽取为独立组件（ImageTab.vue），与其他 tab 保持一致架构
2. 实现后端 API：分页查询、新增、编辑、删除、批量删除
3. 图片文件上传到服务器本地存储
4. 后端实现分页查询，支持按名称、审核状态、可用状态筛选
5. 暂不实现同步素材功能

## 技术选型

- **文件存储**：服务器本地磁盘（`serverProject/uploads/images/`）
- **数据库**：MySQL（使用 mysql2 驱动）
- **后端框架**：Express.js
- **前端框架**：Vue 3 + Composition API
- **文件上传**：multer 中间件

## 数据库设计

### images 表（图片素材表）

```sql
CREATE TABLE images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT '素材名称',
  file_path VARCHAR(500) NOT NULL COMMENT '文件存储路径',
  file_name VARCHAR(200) NOT NULL COMMENT '原始文件名',
  thumbnail_path VARCHAR(500) COMMENT '缩略图路径',
  resolution VARCHAR(50) COMMENT '分辨率，如 1920×1080',
  format VARCHAR(20) NOT NULL COMMENT '文件格式，如 png/jpg',
  file_size INT NOT NULL COMMENT '文件大小（字节）',
  audit_type ENUM('新增', '编辑', '删除') DEFAULT '新增' COMMENT '审核类型',
  audit_status ENUM('审核中', '审核成功', '审核失败') DEFAULT '审核中' COMMENT '审核状态',
  sync_status ENUM('未同步', '同步中', '同步成功', '同步失败') DEFAULT '未同步' COMMENT '同步状态',
  available TINYINT DEFAULT 1 COMMENT '可用状态：1-可用，0-不可用',
  description TEXT COMMENT '素材说明',
  operator VARCHAR(100) COMMENT '操作者',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='图片素材表';
```

**字段说明：**
- `file_path`：存储相对于 uploads 目录的路径，如 `images/2024/03/25/abc123.png`（API 响应时转换为完整路径 `/uploads/images/2024/03/25/abc123.png`）
- `thumbnail_path`：可选，用于存储缩略图路径
- `audit_type`：记录是新增、编辑还是删除操作触发的审核
- `sync_status`：预留同步功能，初始值为"未同步"

## API 设计

### 1. 获取图片列表（分页 + 筛选）

```
GET /api/v1/images?page=1&pageSize=10&name=xxx&auditStatus=审核中&available=1
```

**查询参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Number | 否 | 页码，默认 1 |
| pageSize | Number | 否 | 每页条数，默认 10 |
| name | String | 否 | 素材名称（模糊搜索） |
| auditStatus | String | 否 | 审核状态（审核中/审核成功/审核失败） |
| available | Number | 否 | 可用状态：1-可用，0-不可用（前端对应字段 useStatus） |

**响应：**
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": 1,
        "name": "亚太银行数字化大会",
        "filePath": "/uploads/images/2024/03/25/abc123.png",
        "fileName": "original.png",
        "resolution": "1920×1080",
        "format": "png",
        "fileSize": 1065000,
        "fileSizeFormatted": "1.02 MB",
        "auditType": "新增",
        "auditStatus": "审核中",
        "syncStatus": "未同步",
        "available": false,
        "description": "这是说明",
        "operator": "admin@VoNR",
        "createdAt": "2024-03-25T10:00:00.000Z",
        "updatedAt": "2024-03-25T10:00:00.000Z"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10
  },
  "message": "获取成功"
}
```

### 2. 新增图片素材

```
POST /api/v1/images
Content-Type: multipart/form-data
```

**请求体：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | 是 | 图片文件（png/jpg，最大 10MB） |
| name | String | 是 | 素材名称 |
| description | String | 否 | 素材说明 |

**响应：**
```json
{
  "code": 200,
  "data": {
    "id": 1,
    "name": "素材名称",
    "filePath": "/uploads/images/2024/03/25/abc123.png",
    "fileName": "original.png",
    "resolution": "1920×1080",
    "format": "png",
    "fileSize": 1065000,
    "fileSizeFormatted": "1.02 MB",
    "auditType": "新增",
    "auditStatus": "审核中",
    "syncStatus": "未同步",
    "available": true,
    "description": "这是说明",
    "operator": "admin@VoNR",
    "createdAt": "2024-03-25T10:00:00.000Z"
  },
  "message": "上传成功"
}
```

### 3. 编辑图片素材

```
PUT /api/v1/images/:id
Content-Type: multipart/form-data
```

**请求体：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | 否 | 新图片文件（不传则不更新文件） |
| name | String | 是 | 素材名称 |
| description | String | 否 | 素材说明 |

**响应：**
```json
{
  "code": 200,
  "data": { ... },
  "message": "更新成功"
}
```

### 4. 删除图片素材

```
DELETE /api/v1/images/:id
```

**响应：**
```json
{
  "code": 200,
  "message": "删除成功"
}
```

### 5. 批量删除

```
POST /api/v1/images/batch-delete
Content-Type: application/json
```

**请求体：**
```json
{ "ids": [1, 2, 3] }
```

**响应：**
```json
{
  "code": 200,
  "message": "批量删除成功"
}
```

## 后端实现方案

### 文件结构

```
serverProject/
  controllers/
    imageController.js      -- 图片相关接口
  services/
    imageService.js         -- 图片业务逻辑
  models/
    imageModel.js           -- 图片数据查询
  routes/
    image.js                -- 图片路由
  uploads/
    images/                 -- 图片文件存储目录
  scripts/
    init-images.js          -- 初始化 images 表
```

### 核心逻辑

**文件上传：**
1. 使用 multer 中间件处理文件上传
2. 文件存储路径：`uploads/images/YYYY/MM/DD/uuid.ext`
3. 生成唯一文件名避免冲突
4. 返回文件访问路径

**分辨率提取：**
1. 使用 sharp 库读取图片元数据
2. 提取宽度和高度，格式化为 "宽×高"

**分页查询：**
1. 构建动态 WHERE 条件
2. 支持名称模糊搜索
3. 支持审核状态和可用状态筛选
4. 返回分页数据和总数

### 依赖包

```bash
npm install multer sharp
```

- `multer`：处理 multipart/form-data 文件上传
- `sharp`：图片处理，用于提取分辨率信息

## 前端实现方案

### 文件结构

```
src/
  components/
    image/
      ImageTab.vue          -- 图片 tab 主组件
      ImageTable.vue        -- 图片表格组件
      ImageFormModal.vue    -- 新增/编辑弹窗
      ImageDetailModal.vue  -- 预览弹窗
  composables/
    useImageData.js         -- 图片数据 composable
  api/
    image.js                -- 图片 API 接口
```

### ImageTab.vue

主组件，负责组合子组件，管理弹窗状态，处理批量删除等操作。

```vue
<template>
  <div class="image-tab">
    <ImageTable
      :data="tableData"
      :loading="loading"
      @edit="handleEdit"
      @delete="handleDelete"
      @preview="handlePreview"
      @selection-change="handleSelectionChange"
    />
    <UnifiedPagination
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    />
    <ImageFormModal
      v-model:visible="formVisible"
      :mode="formMode"
      :data="currentRow"
      @success="fetchTableData"
    />
    <ImageDetailModal
      v-model:visible="detailVisible"
      :data="currentRow"
    />
  </div>
</template>
```

### useImageData.js

数据 composable，负责调用 API、管理状态、处理筛选和分页。

```javascript
export function useImageData() {
  const tableData = ref([])
  const loading = ref(false)
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const selectedRows = ref([])
  const searchForm = reactive({ name: '', auditStatus: '', useStatus: '' })

  const fetchTableData = async () => {
    loading.value = true
    try {
      const res = await getImageList({
        page: currentPage.value,
        pageSize: pageSize.value,
        ...searchForm
      })
      tableData.value = res.data.list
      total.value = res.data.total
    } finally {
      loading.value = false
    }
  }

  return { tableData, loading, total, ... }
}
```

### ImageFormModal.vue

新增/编辑弹窗，支持文件上传和表单填写。

关键功能：
- 使用 `el-upload` 组件处理文件上传
- 上传前校验文件类型（png/jpg）和大小（≤10MB）
- 上传时显示进度条
- 支持预览已上传的图片

### ImageDetailModal.vue

预览弹窗，展示图片详情和大图预览。

### 数据流向

```
ImageTab.vue → useImageData.js → image.js API → 后端 /api/v1/images
    ↓
ImageTable.vue (展示数据)
ImageFormModal.vue (新增/编辑 → POST/PUT /api/v1/images)
ImageDetailModal.vue (预览)
UnifiedPagination.vue (分页)
```

## 文件存储方案

### 目录结构

```
serverProject/
  uploads/
    images/
      2024/
        03/
          25/
            a1b2c3d4-e5f6-7890-abcd-ef1234567890.png
            ...
```

### 文件命名规则

- 使用 UUID 生成唯一文件名，避免冲突
- 保留原始文件扩展名
- 按年/月/日组织目录，便于管理

### 文件访问

- 静态文件服务：`app.use('/uploads', express.static('uploads'))`
- 访问 URL：`http://localhost:3001/uploads/images/2024/03/25/uuid.png`

## 测试用例

1. **分页查询：** admin 用户登录 → 调用 GET /api/v1/images → 返回分页数据
2. **筛选查询：** 传入 name 参数 → 返回匹配的图片列表
3. **新增素材：** POST /api/v1/images 上传文件 → 创建记录并返回
4. **编辑素材：** PUT /api/v1/images/1 更新名称 → 更新成功
5. **删除素材：** DELETE /api/v1/images/1 → 删除记录和文件
6. **批量删除：** POST /api/v1/images/batch-delete 传入 ids → 批量删除
7. **文件校验：** 上传非图片文件 → 返回错误提示
8. **文件大小校验：** 上传超过 10MB 的文件 → 返回错误提示

## 注意事项

1. **文件大小限制**：单个文件最大 10MB
2. **文件格式限制**：仅支持 png/jpg/jpeg 格式
3. **并发安全**：使用 UUID 生成文件名，避免并发上传冲突
4. **磁盘空间**：定期清理无引用的文件（预留功能）
5. **权限控制**：所有 API 需要登录认证（authMiddleware）
