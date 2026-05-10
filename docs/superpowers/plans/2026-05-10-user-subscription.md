# 用户订购关系页面实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 VoNR 管理系统添加用户订购关系管理功能，支持增删改查操作

**Architecture:** 遵循现有业务配置模式，创建完整的后端 API 和前端对接，包括数据库表、Model、Controller、Route、API 模块、Composable 和页面组件

**Tech Stack:** Vue 3 (Composition API) + Element Plus + Express.js + MySQL2 + JWT

---

## 文件结构总览

### 需要创建的文件

| 文件 | 说明 |
|------|------|
| `serverProject/models/userSubscriptionModel.js` | 数据库操作模型 |
| `serverProject/controllers/userSubscriptionController.js` | 请求处理器 |
| `serverProject/routes/userSubscription.js` | 路由定义 |
| `src/api/userSubscription.js` | 前端 API 模块 |
| `src/composables/useUserSubscriptionData.js` | 数据管理 composable |

### 需要修改的文件

| 文件 | 说明 |
|------|------|
| `serverProject/init-db.js` | 添加 user_subscriptions 表创建 |
| `serverProject/routes/index.js` | 注册新路由 |
| `src/views/UserList.vue` | 连接真实 API |

---

## Task 1: 创建数据库表

**Files:**
- Modify: `serverProject/init-db.js:77-100`

- [ ] **Step 1: 在 init-db.js 中添加 user_subscriptions 表创建语句**

在 `business_configs` 表创建语句之后添加：

```javascript
// 创建用户订购关系表
await tempPool.query(`
  CREATE TABLE IF NOT EXISTS user_subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    phone VARCHAR(20) NOT NULL COMMENT '用户号码',
    app_id INT COMMENT '应用ID',
    app_name VARCHAR(100) COMMENT '应用名称',
    subscription_time DATETIME COMMENT '订购时间',
    business_scene VARCHAR(100) COMMENT '业务场景',
    sub_scenes TEXT COMMENT '子业务场景',
    description TEXT COMMENT '应用说明',
    operator VARCHAR(100) COMMENT '操作者',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone),
    INDEX idx_app_id (app_id)
  )
`);
console.log('用户订购关系表创建成功');
```

- [ ] **Step 2: 运行数据库初始化脚本**

Run: `cd serverProject && node init-db.js`
Expected: 输出 "用户订购关系表创建成功"

- [ ] **Step 3: 验证表创建成功**

Run: `cd serverProject && node -e "const pool = require('./config/db'); pool.query('DESCRIBE user_subscriptions').then(([rows]) => console.log(JSON.stringify(rows, null, 2))).catch(console.error)"`
Expected: 显示 user_subscriptions 表的字段列表

- [ ] **Step 4: Commit**

```bash
git add serverProject/init-db.js
git commit -m "feat: add user_subscriptions table creation"
```

---

## Task 2: 创建后端 Model

**Files:**
- Create: `serverProject/models/userSubscriptionModel.js`

- [ ] **Step 1: 创建 userSubscriptionModel.js 文件**

```javascript
const pool = require('../config/db');

const VALID_COLUMNS = ['phone', 'app_id', 'app_name', 'subscription_time', 'business_scene', 'sub_scenes', 'description', 'operator'];

const UserSubscriptionModel = {
  async findWithPagination({ page = 1, pageSize = 10, phone, startTime, endTime }) {
    page = Math.max(1, parseInt(page) || 1);
    pageSize = Math.min(100, Math.max(1, parseInt(pageSize) || 10));

    const conditions = [];
    const params = [];

    if (phone) {
      conditions.push('phone LIKE ?');
      params.push(`%${phone}%`);
    }
    if (startTime) {
      conditions.push('subscription_time >= ?');
      params.push(startTime);
    }
    if (endTime) {
      conditions.push('subscription_time <= ?');
      params.push(endTime);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) AS total FROM user_subscriptions ${whereClause}`;
    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0].total;

    const offset = (page - 1) * pageSize;
    const listSql = `SELECT * FROM user_subscriptions ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const [list] = await pool.query(listSql, [...params, pageSize, offset]);

    const formattedList = list.map(item => ({
      ...item,
      appId: item.app_id,
      appName: item.app_name,
      subscriptionTime: item.subscription_time,
      businessScene: item.business_scene,
      subScenes: item.sub_scenes,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));

    return { list: formattedList, total, page, pageSize };
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM user_subscriptions WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    const item = rows[0];
    return {
      ...item,
      appId: item.app_id,
      appName: item.app_name,
      subscriptionTime: item.subscription_time,
      businessScene: item.business_scene,
      subScenes: item.sub_scenes,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    };
  },

  async create(data) {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(data)) {
      if (!VALID_COLUMNS.includes(key)) continue;
      fields.push(key);
      values.push(value);
    }

    if (fields.length === 0) return null;

    const sql = `INSERT INTO user_subscriptions (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`;
    const [result] = await pool.query(sql, values);

    return await this.findById(result.insertId);
  },

  async update(id, data) {
    const setClauses = [];
    const values = [];

    for (const [key, value] of Object.entries(data)) {
      if (!VALID_COLUMNS.includes(key)) continue;
      setClauses.push(`${key} = ?`);
      values.push(value);
    }

    if (setClauses.length === 0) return null;

    values.push(id);
    const sql = `UPDATE user_subscriptions SET ${setClauses.join(', ')} WHERE id = ?`;
    await pool.query(sql, values);

    return await this.findById(id);
  },

  async delete(id) {
    const item = await this.findById(id);
    if (!item) return null;

    await pool.query('DELETE FROM user_subscriptions WHERE id = ?', [id]);
    return item;
  },

  async batchDelete(ids) {
    if (!ids || ids.length === 0) return 0;

    const placeholders = ids.map(() => '?').join(', ');
    const [result] = await pool.query(`DELETE FROM user_subscriptions WHERE id IN (${placeholders})`, ids);
    return result.affectedRows;
  }
};

module.exports = UserSubscriptionModel;
```

- [ ] **Step 2: Commit**

```bash
git add serverProject/models/userSubscriptionModel.js
git commit -m "feat: add userSubscriptionModel for database operations"
```

---

## Task 3: 创建后端 Controller

**Files:**
- Create: `serverProject/controllers/userSubscriptionController.js`

- [ ] **Step 1: 创建 userSubscriptionController.js 文件**

```javascript
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
```

- [ ] **Step 2: Commit**

```bash
git add serverProject/controllers/userSubscriptionController.js
git commit -m "feat: add userSubscriptionController for request handling"
```

---

## Task 4: 创建后端 Route

**Files:**
- Create: `serverProject/routes/userSubscription.js`

- [ ] **Step 1: 创建 userSubscription.js 文件**

```javascript
const express = require('express');
const router = express.Router();
const UserSubscriptionController = require('../controllers/userSubscriptionController');
const authMiddleware = require('../middleware/auth');

router.get('/user-subscriptions', authMiddleware, UserSubscriptionController.getList);
router.get('/user-subscriptions/:id', authMiddleware, UserSubscriptionController.getById);
router.post('/user-subscriptions', authMiddleware, UserSubscriptionController.create);
router.put('/user-subscriptions/:id', authMiddleware, UserSubscriptionController.update);
router.delete('/user-subscriptions/:id', authMiddleware, UserSubscriptionController.delete);
router.post('/user-subscriptions/batch-delete', authMiddleware, UserSubscriptionController.batchDelete);

module.exports = router;
```

- [ ] **Step 2: Commit**

```bash
git add serverProject/routes/userSubscription.js
git commit -m "feat: add userSubscription routes"
```

---

## Task 5: 注册路由到 index.js

**Files:**
- Modify: `serverProject/routes/index.js:14-16`

- [ ] **Step 1: 在 routes/index.js 中注册 userSubscription 路由**

在 `businessConfigRoutes` 注册之后添加：

```javascript
const userSubscriptionRoutes = require('./userSubscription');
router.use('/', userSubscriptionRoutes);
```

- [ ] **Step 2: 验证路由注册成功**

Run: `cd serverProject && node -e "const app = require('./app'); console.log('Server loaded successfully')"`
Expected: 输出 "Server loaded successfully"

- [ ] **Step 3: Commit**

```bash
git add serverProject/routes/index.js
git commit -m "feat: register userSubscription routes"
```

---

## Task 6: 创建前端 API 模块

**Files:**
- Create: `src/api/userSubscription.js`

- [ ] **Step 1: 创建 userSubscription.js 文件**

```javascript
import request from '@/utils/request'

export function getUserSubscriptions(params) {
  return request.get('/api/v1/user-subscriptions', { params })
}

export function getUserSubscription(id) {
  return request.get(`/api/v1/user-subscriptions/${id}`)
}

export function createUserSubscription(data) {
  return request.post('/api/v1/user-subscriptions', data)
}

export function updateUserSubscription(id, data) {
  return request.put(`/api/v1/user-subscriptions/${id}`, data)
}

export function deleteUserSubscription(id) {
  return request.delete(`/api/v1/user-subscriptions/${id}`)
}

export function batchDeleteUserSubscriptions(ids) {
  return request.post('/api/v1/user-subscriptions/batch-delete', { ids })
}
```

- [ ] **Step 2: Commit**

```bash
git add src/api/userSubscription.js
git commit -m "feat: add userSubscription API module"
```

---

## Task 7: 创建 Composable

**Files:**
- Create: `src/composables/useUserSubscriptionData.js`

- [ ] **Step 1: 创建 useUserSubscriptionData.js 文件**

```javascript
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getUserSubscriptions,
  createUserSubscription,
  updateUserSubscription,
  deleteUserSubscription,
  batchDeleteUserSubscriptions
} from '@/api/userSubscription'

export function useUserSubscriptionData() {
  const tableData = ref([])
  const loading = ref(false)
  const total = ref(0)
  const pagination = reactive({
    current: 1,
    pageSize: 10
  })
  const searchParams = reactive({
    phone: '',
    startTime: '',
    endTime: ''
  })

  const fetchData = async () => {
    loading.value = true
    try {
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...searchParams
      }
      const res = await getUserSubscriptions(params)
      if (res.code === 200) {
        tableData.value = res.data.list
        total.value = res.data.total
      }
    } catch (error) {
      console.error('获取用户订购关系列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  const handleSearch = () => {
    pagination.current = 1
    fetchData()
  }

  const handleReset = () => {
    searchParams.phone = ''
    searchParams.startTime = ''
    searchParams.endTime = ''
    pagination.current = 1
    fetchData()
  }

  const handlePageChange = (page) => {
    pagination.current = page
    fetchData()
  }

  const handlePageSizeChange = (size) => {
    pagination.pageSize = size
    pagination.current = 1
    fetchData()
  }

  const handleCreate = async (data) => {
    try {
      const res = await createUserSubscription(data)
      if (res.code === 200) {
        ElMessage.success('创建成功')
        await fetchData()
        return true
      }
      return false
    } catch (error) {
      console.error('创建用户订购关系失败:', error)
      return false
    }
  }

  const handleUpdate = async (id, data) => {
    try {
      const res = await updateUserSubscription(id, data)
      if (res.code === 200) {
        ElMessage.success('更新成功')
        await fetchData()
        return true
      }
      return false
    } catch (error) {
      console.error('更新用户订购关系失败:', error)
      return false
    }
  }

  const handleDelete = async (ids) => {
    try {
      if (Array.isArray(ids)) {
        const res = await batchDeleteUserSubscriptions(ids)
        if (res.code === 200) {
          return true
        }
      } else {
        const res = await deleteUserSubscription(ids)
        if (res.code === 200) {
          return true
        }
      }
      return false
    } catch (error) {
      console.error('删除用户订购关系失败:', error)
      return false
    }
  }

  // 初始加载数据
  fetchData()

  return {
    tableData,
    loading,
    total,
    pagination,
    searchParams,
    handleSearch,
    handleReset,
    handlePageChange,
    handlePageSizeChange,
    handleCreate,
    handleUpdate,
    handleDelete
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/composables/useUserSubscriptionData.js
git commit -m "feat: add useUserSubscriptionData composable"
```

---

## Task 8: 修改 UserList.vue 连接真实 API

**Files:**
- Modify: `src/views/UserList.vue` (整个文件重写)

- [ ] **Step 1: 重写 UserList.vue 文件**

```vue
<template>
  <div class="user-subscription-container">
    <div class="header-section">
      <h3 class="page-title">用户订购关系</h3>
      <div class="button-group">
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增订购</el-button>
        <el-button type="danger" :icon="Delete" @click="handleBatchDelete">删除订购</el-button>
      </div>
    </div>

    <div class="search-card">
      <el-form :model="searchForm" label-width="80px">
        <div class="search-row">
          <el-form-item label="用户号码" class="search-item">
            <el-input v-model="searchForm.phone" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="订购时间" class="search-item search-item-wide">
            <el-date-picker
              v-model="searchForm.timeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
          <div class="search-item">
            <div class="search-btns">
              <el-button type="primary" class="btn-query" @click="handleSearchWithForm">查询</el-button>
              <el-button class="btn-reset" @click="handleResetWithForm">重置</el-button>
            </div>
          </div>
          <div class="search-item search-item-empty"></div>
        </div>
      </el-form>
    </div>

    <div class="table-container">
      <el-table :data="tableData" v-loading="loading" style="width: 100%" @selection-change="handleSelection">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="phone" label="用户号码" min-width="150" />
        <el-table-column prop="appId" label="应用ID" min-width="150">
          <template #default="scope">
            <el-popover
              placement="right"
              :width="450"
              trigger="hover"
              popper-class="app-detail-popover"
            >
              <template #reference>
                <el-link type="primary" :underline="false" class="app-id-link">{{ scope.row.appId }}</el-link>
              </template>
              <div class="popover-content">
                <div class="popover-title">应用详情</div>
                <div class="detail-item">
                  <div class="detail-label">应用ID</div>
                  <div class="detail-value">{{ scope.row.appId }}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">应用名称</div>
                  <div class="detail-value">{{ scope.row.appName }}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">业务场景</div>
                  <div class="detail-value">{{ scope.row.businessScene }}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">子业务场景</div>
                  <div class="detail-value">{{ scope.row.subScenes }}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">应用说明</div>
                  <div class="detail-value">{{ scope.row.description }}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">操作时间</div>
                  <div class="detail-value">{{ scope.row.subscriptionTime }}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">操作者</div>
                  <div class="detail-value">{{ scope.row.operator }}</div>
                </div>
              </div>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column prop="appName" label="应用名称" min-width="200" />
        <el-table-column prop="subscriptionTime" label="订购时间" min-width="180" />
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <UnifiedPagination
        :total="total"
        :current-page="pagination.current"
        :page-size="pagination.pageSize"
        @page-change="handlePageChange"
        @size-change="handlePageSizeChange"
      />
    </div>

    <SubscriptionDialog ref="subscriptionDialogRef" @save="handleSave" />
    <DeleteConfirmDialog ref="deleteDialogRef" @confirm="handleDeleteConfirm" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserSubscriptionData } from '@/composables/useUserSubscriptionData'
import SubscriptionDialog from '@/components/SubscriptionDialog.vue'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog.vue'
import UnifiedPagination from '@/components/common/UnifiedPagination.vue'

const {
  tableData,
  loading,
  total,
  pagination,
  searchParams,
  handleSearch,
  handleReset,
  handlePageChange,
  handlePageSizeChange,
  handleDelete: executeDelete,
  handleCreate,
  handleUpdate
} = useUserSubscriptionData()

const searchForm = ref({ phone: '', timeRange: [] })

const selectedRows = ref([])
const currentRow = ref(null)
const subscriptionDialogRef = ref()
const deleteDialogRef = ref()

const handleSelection = (selection) => {
  selectedRows.value = selection
}

const syncSearchParams = () => {
  searchParams.phone = searchForm.value.phone
  if (searchForm.value.timeRange && searchForm.value.timeRange.length === 2) {
    searchParams.startTime = searchForm.value.timeRange[0]
    searchParams.endTime = searchForm.value.timeRange[1]
  } else {
    searchParams.startTime = ''
    searchParams.endTime = ''
  }
}

const handleSearchWithForm = () => {
  syncSearchParams()
  handleSearch()
}

const handleResetWithForm = () => {
  searchForm.value = { phone: '', timeRange: [] }
  handleReset()
}

const handleAdd = () => subscriptionDialogRef.value.open('新增订购')
const handleEdit = (row) => subscriptionDialogRef.value.open('编辑订购', row)

const handleDelete = (row) => {
  currentRow.value = row
  deleteDialogRef.value.open(false)
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请至少选择一条记录进行删除')
    return
  }
  deleteDialogRef.value.open(true)
}

const handleDeleteConfirm = async (isBatch) => {
  try {
    if (isBatch) {
      const selectedIds = selectedRows.value.map(item => item.id)
      await executeDelete(selectedIds)
      selectedRows.value = []
      ElMessage.success('批量删除成功')
    } else {
      if (currentRow.value) {
        await executeDelete(currentRow.value.id)
        currentRow.value = null
        ElMessage.success('删除成功')
      }
    }
  } catch (error) {
    // Error already handled in composable
  }
  deleteDialogRef.value.close()
}

const handleSave = async (data) => {
  try {
    if (data.id) {
      await handleUpdate(data.id, data)
    } else {
      await handleCreate(data)
    }
    subscriptionDialogRef.value.close()
  } catch (error) {
    // Error already handled in composable
  }
}
</script>

<style lang="scss" scoped>
.user-subscription-container {
  padding: 20px;
  background-color: #fff;
  min-height: 100%;

  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    .page-title { margin: 0; font-size: 18px; }
  }

  .search-card {
    background: #fff;
    padding: 20px 20px 0;
    border-radius: 4px;
    margin-bottom: 15px;

    .search-row {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .search-item {
      flex: 0 0 calc(25% - 12px);
      min-width: 200px;
      margin-bottom: 0;

      :deep(.el-form-item__content) {
        flex: 1;
      }

      :deep(.el-select),
      :deep(.el-input) {
        width: 100%;
      }
    }

    .search-item-wide {
      flex: 0 0 calc(50% - 12px);
      min-width: 400px;
    }

    .search-item-empty {
      visibility: hidden;
    }

    .search-btns {
      display: flex;
      gap: 12px;
      padding-left: 30px;
    }

    .btn-query {
      background-color: #4079de;
      width: 70px;
    }

    .btn-reset {
      color: #4079de;
      border-color: #dcdfe6;
      width: 70px;
    }
  }

  .table-container {
    background: #fff;
    padding: 20px;
    border-radius: 4px;
    height: 540px;
    display: flex;
    flex-direction: column;

    .el-table {
      flex: 1;

      :deep(.el-table__body-wrapper) {
        overflow-y: auto;
      }
    }
  }
}

.app-id-link {
  font-weight: 500;
}

.app-detail-popover {
  background-color: #ffffff !important;
  border: 1px solid #e4e7ed !important;
  border-radius: 4px !important;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1) !important;
}

.app-detail-popover :deep(.popper__arrow::after) {
  border-right-color: #ffffff !important;
}

.popover-content {
  padding: 0;
}

.popover-title {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 12px;
}

.detail-item {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 16px;
  padding: 10px 20px;
  align-items: flex-start;
}

.detail-item:last-child {
  padding-bottom: 16px;
}

.detail-label {
  font-size: 14px;
  font-weight: 500;
  color: #666666;
  text-align: right;
  flex-shrink: 0;
}

.detail-value {
  font-size: 14px;
  color: #333333;
  line-height: 1.5;
  word-wrap: break-word;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/views/UserList.vue
git commit -m "feat: connect UserList.vue to real API"
```

---

## Task 9: 创建 SubscriptionDialog 组件

**Files:**
- Create: `src/components/SubscriptionDialog.vue`

- [ ] **Step 1: 创建 SubscriptionDialog.vue 文件**

```vue
<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="用户号码" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入用户号码" />
      </el-form-item>
      <el-form-item label="应用ID" prop="appId">
        <el-select v-model="form.appId" placeholder="请选择应用ID" class="w-full">
          <el-option label="1 - 企业品牌宣传应用5" :value="1" />
          <el-option label="2 - 公益宣传应用1" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="应用名称" prop="appName">
        <el-input v-model="form.appName" placeholder="请输入应用名称" />
      </el-form-item>
      <el-form-item label="订购时间" prop="subscriptionTime">
        <el-date-picker
          v-model="form.subscriptionTime"
          type="datetime"
          placeholder="选择订购时间"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          class="w-full"
        />
      </el-form-item>
      <el-form-item label="业务场景" prop="businessScene">
        <el-input v-model="form.businessScene" placeholder="请输入业务场景" />
      </el-form-item>
      <el-form-item label="子业务场景" prop="subScenes">
        <el-input v-model="form.subScenes" placeholder="请输入子业务场景" />
      </el-form-item>
      <el-form-item label="应用说明" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入应用说明" />
      </el-form-item>
      <el-form-item label="操作者" prop="operator">
        <el-input v-model="form.operator" placeholder="请输入操作者" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['save'])

const visible = ref(false)
const title = ref('新增订购')
const formRef = ref()

const form = reactive({
  id: null,
  phone: '',
  appId: null,
  appName: '',
  subscriptionTime: '',
  businessScene: '',
  subScenes: '',
  description: '',
  operator: ''
})

const rules = {
  phone: [
    { required: true, message: '请输入用户号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  appId: [
    { required: true, message: '请选择应用ID', trigger: 'change' }
  ],
  subscriptionTime: [
    { required: true, message: '请选择订购时间', trigger: 'change' }
  ]
}

const open = (dialogTitle, row = null) => {
  title.value = dialogTitle
  visible.value = true
  if (row) {
    form.id = row.id
    form.phone = row.phone
    form.appId = row.appId
    form.appName = row.appName
    form.subscriptionTime = row.subscriptionTime
    form.businessScene = row.businessScene
    form.subScenes = row.subScenes
    form.description = row.description
    form.operator = row.operator
  } else {
    resetForm()
  }
}

const close = () => {
  visible.value = false
}

const resetForm = () => {
  form.id = null
  form.phone = ''
  form.appId = null
  form.appName = ''
  form.subscriptionTime = ''
  form.businessScene = ''
  form.subScenes = ''
  form.description = ''
  form.operator = ''
  formRef.value?.clearValidate()
}

const handleClose = () => {
  resetForm()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    emit('save', { ...form })
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

defineExpose({ open, close })
</script>

<style lang="scss" scoped>
.w-full {
  width: 100%;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SubscriptionDialog.vue
git commit -m "feat: add SubscriptionDialog component"
```

---

## Task 10: 插入测试数据

**Files:**
- Create: `serverProject/seed-user-subscriptions.js`

- [ ] **Step 1: 创建 seed-user-subscriptions.js 文件**

```javascript
const pool = require('./config/db');

async function seedData() {
  const testData = [
    ['13869421569', 1, '企业品牌宣传应用5', '2024-03-25 10:00:00', '001趣味通话', '001002虚拟头像、001003通话特效', '企业品牌宣传测试', 'admin@VoNR'],
    ['18512489653', 1, '企业品牌宣传应用5', '2024-03-25 10:00:00', '001趣味通话', '001002虚拟头像、001003通话特效', '企业品牌宣传测试', 'admin@VoNR'],
    ['13912345678', 2, '公益宣传应用1', '2024-03-26 11:00:00', '002语音合成', '002001文字转语音', '公益宣传用途', 'admin@VoNR'],
    ['15012345678', 1, '企业品牌宣传应用5', '2024-03-27 12:00:00', '001趣味通话', '001004虚拟场景', '企业内部测试', 'admin@VoNR'],
    ['18812345678', 2, '公益宣传应用1', '2024-03-28 13:00:00', '002语音合成', '002002语音识别', '公益项目', 'admin@VoNR'],
    ['13612345678', 1, '企业品牌宣传应用5', '2024-03-29 14:00:00', '001趣味通话', '001005虚拟背景', '品牌推广', 'admin@VoNR'],
    ['15912345678', 2, '公益宣传应用1', '2024-03-30 15:00:00', '002语音合成', '002003语音克隆', '公益广告', 'admin@VoNR'],
    ['18712345678', 1, '企业品牌宣传应用5', '2024-04-01 10:00:00', '001趣味通话', '001006虚拟形象', '企业宣传', 'admin@VoNR'],
    ['13512345678', 2, '公益宣传应用1', '2024-04-02 11:00:00', '002语音合成', '002004语音翻译', '公益服务', 'admin@VoNR'],
    ['18612345678', 1, '企业品牌宣传应用5', '2024-04-03 12:00:00', '001趣味通话', '001007虚拟场景', '品牌活动', 'admin@VoNR'],
    ['13712345678', 2, '公益宣传应用1', '2024-04-04 13:00:00', '002语音合成', '002005语音合成', '公益宣传', 'admin@VoNR'],
    ['15812345678', 1, '企业品牌宣传应用5', '2024-04-05 14:00:00', '001趣味通话', '001008虚拟场景', '企业活动', 'admin@VoNR'],
    ['18912345678', 2, '公益宣传应用1', '2024-04-06 15:00:00', '002语音合成', '002006语音识别', '公益项目', 'admin@VoNR'],
    ['13812345678', 1, '企业品牌宣传应用5', '2024-04-07 10:00:00', '001趣味通话', '001009虚拟形象', '品牌推广', 'admin@VoNR'],
    ['15712345678', 2, '公益宣传应用1', '2024-04-08 11:00:00', '002语音合成', '002007语音克隆', '公益广告', 'admin@VoNR'],
    ['18812345679', 1, '企业品牌宣传应用5', '2024-04-09 12:00:00', '001趣味通话', '001010虚拟背景', '企业宣传', 'admin@VoNR'],
    ['13612345679', 2, '公益宣传应用1', '2024-04-10 13:00:00', '002语音合成', '002008语音翻译', '公益服务', 'admin@VoNR'],
    ['15912345679', 1, '企业品牌宣传应用5', '2024-04-11 14:00:00', '001趣味通话', '001011虚拟场景', '品牌活动', 'admin@VoNR'],
    ['18712345679', 2, '公益宣传应用1', '2024-04-12 15:00:00', '002语音合成', '002009语音合成', '公益宣传', 'admin@VoNR'],
    ['13512345679', 1, '企业品牌宣传应用5', '2024-04-13 10:00:00', '001趣味通话', '001012虚拟形象', '企业活动', 'admin@VoNR'],
    ['18612345679', 2, '公益宣传应用1', '2024-04-14 11:00:00', '002语音合成', '002010语音识别', '公益项目', 'admin@VoNR'],
    ['13712345679', 1, '企业品牌宣传应用5', '2024-04-15 12:00:00', '001趣味通话', '001013虚拟场景', '品牌推广', 'admin@VoNR'],
    ['15812345679', 2, '公益宣传应用1', '2024-04-16 13:00:00', '002语音合成', '002011语音克隆', '公益广告', 'admin@VoNR'],
    ['18912345679', 1, '企业品牌宣传应用5', '2024-04-17 14:00:00', '001趣味通话', '001014虚拟背景', '企业宣传', 'admin@VoNR'],
    ['13812345679', 2, '公益宣传应用1', '2024-04-18 15:00:00', '002语音合成', '002012语音翻译', '公益服务', 'admin@VoNR'],
    ['15712345679', 1, '企业品牌宣传应用5', '2024-04-19 10:00:00', '001趣味通话', '001015虚拟场景', '品牌活动', 'admin@VoNR'],
    ['18812345680', 2, '公益宣传应用1', '2024-04-20 11:00:00', '002语音合成', '002013语音合成', '公益宣传', 'admin@VoNR'],
    ['13612345680', 1, '企业品牌宣传应用5', '2024-04-21 12:00:00', '001趣味通话', '001016虚拟形象', '企业活动', 'admin@VoNR'],
    ['15912345680', 2, '公益宣传应用1', '2024-04-22 13:00:00', '002语音合成', '002014语音识别', '公益项目', 'admin@VoNR'],
    ['18712345680', 1, '企业品牌宣传应用5', '2024-04-23 14:00:00', '001趣味通话', '001017虚拟场景', '品牌推广', 'admin@VoNR'],
    ['13512345680', 2, '公益宣传应用1', '2024-04-24 15:00:00', '002语音合成', '002015语音克隆', '公益广告', 'admin@VoNR'],
    ['18612345680', 1, '企业品牌宣传应用5', '2024-04-25 10:00:00', '001趣味通话', '001018虚拟背景', '企业宣传', 'admin@VoNR']
  ];

  try {
    // 清空现有数据
    await pool.query('DELETE FROM user_subscriptions');
    console.log('已清空 user_subscriptions 表');

    // 插入测试数据
    const sql = `INSERT INTO user_subscriptions (phone, app_id, app_name, subscription_time, business_scene, sub_scenes, description, operator) VALUES ?`;
    await pool.query(sql, [testData]);
    console.log(`已插入 ${testData.length} 条测试数据`);

    process.exit(0);
  } catch (error) {
    console.error('插入测试数据失败:', error);
    process.exit(1);
  }
}

seedData();
```

- [ ] **Step 2: 运行种子脚本插入测试数据**

Run: `cd serverProject && node seed-user-subscriptions.js`
Expected: 输出 "已插入 32 条测试数据"

- [ ] **Step 3: Commit**

```bash
git add serverProject/seed-user-subscriptions.js
git commit -m "feat: add seed script for user subscriptions"
```

---

## Task 11: 功能测试

- [ ] **Step 1: 启动后端服务器**

Run: `cd serverProject && npm start`
Expected: 服务器启动成功，监听端口 3001

- [ ] **Step 2: 测试 API 接口**

使用 curl 或 Postman 测试：

1. 获取列表：`GET http://localhost:3001/api/v1/user-subscriptions?page=1&pageSize=10`
2. 搜索：`GET http://localhost:3001/api/v1/user-subscriptions?phone=138`
3. 新增：`POST http://localhost:3001/api/v1/user-subscriptions` (需要 JWT Token)
4. 编辑：`PUT http://localhost:3001/api/v1/user-subscriptions/1` (需要 JWT Token)
5. 删除：`DELETE http://localhost:3001/api/v1/user-subscriptions/1` (需要 JWT Token)

- [ ] **Step 3: 启动前端开发服务器**

Run: `cd /c/Users/hxf/Desktop/VoNR && npm run dev`
Expected: 前端服务器启动成功

- [ ] **Step 4: 测试前端功能**

1. 登录系统
2. 导航到用户订购关系页面
3. 验证列表显示正确
4. 测试搜索功能
5. 测试分页功能
6. 测试新增功能
7. 测试编辑功能
8. 测试删除功能
9. 测试批量删除功能

- [ ] **Step 5: 验证所有功能正常**

确认以下功能：
- [ ] 列表查询正常（分页、搜索）
- [ ] 新增订购正常（表单验证、保存）
- [ ] 编辑订购正常（回填数据、保存）
- [ ] 删除订购正常（单个、批量）
- [ ] 分页功能正常（页码切换、每页条数切换）
- [ ] 搜索功能正常（按号码、时间范围搜索）
