# Business Configuration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete backend API for business configuration CRUD and connect frontend to real database, removing sync button.

**Architecture:** Follow existing application module pattern: Model → Controller → Route → Frontend API → Composable → View. Backend uses MySQL2 with Express.js. Frontend uses Vue 3 Composition API with Element Plus.

**Tech Stack:** Express.js, MySQL2, Vue 3, Element Plus, Axios

---

## File Structure

### Backend (serverProject/)
| File | Action | Responsibility |
|------|--------|----------------|
| `init-db.js` | Modify | Add business_configs table creation |
| `models/businessConfigModel.js` | Create | Database CRUD operations |
| `controllers/businessConfigController.js` | Create | Request handlers |
| `routes/businessConfig.js` | Create | API route definitions |
| `routes/index.js` | Modify | Register business config routes |

### Frontend (src/)
| File | Action | Responsibility |
|------|--------|----------------|
| `api/businessConfig.js` | Create | API request functions |
| `composables/useBusinessConfigData.js` | Create | Data management composable |
| `views/BusinessConfiguration.vue` | Modify | Remove sync button, connect to API |
| `components/ConfigDialog.vue` | Modify | Call API on save |

---

### Task 1: Update init-db.js for business_configs table

**Files:**
- Modify: `serverProject/init-db.js`

- [ ] **Step 1: Add business_configs table creation**

Open `serverProject/init-db.js` and add the following SQL after the applications table creation:

```javascript
await tempPool.query(`
  CREATE TABLE IF NOT EXISTS business_configs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL COMMENT '业务指令',
    app_id INT COMMENT '关联应用ID',
    app_name VARCHAR(100) COMMENT '应用名称',
    scene VARCHAR(100) COMMENT '业务场景',
    sub_scene VARCHAR(100) COMMENT '子业务场景',
    type VARCHAR(20) COMMENT '操作类型',
    channel VARCHAR(10) COMMENT '渠道',
    status ENUM('enabled', 'disabled') DEFAULT 'enabled',
    audit_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    available_status ENUM('available', 'unavailable') DEFAULT 'available',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`);
```

- [ ] **Step 2: Run init-db.js to create table**

Run: `node serverProject/init-db.js`
Expected: Table business_configs created successfully

- [ ] **Step 3: Commit**

```bash
git add serverProject/init-db.js
git commit -m "feat: add business_configs table to init-db"
```

---

### Task 2: Create businessConfigModel.js

**Files:**
- Create: `serverProject/models/businessConfigModel.js`

- [ ] **Step 1: Create businessConfigModel.js**

```javascript
const pool = require('../config/db');

const VALID_COLUMNS = ['code', 'app_id', 'app_name', 'scene', 'sub_scene', 'type', 'channel', 'status', 'audit_status', 'available_status', 'description'];

const BusinessConfigModel = {
  async findWithPagination({ page = 1, pageSize = 10, code, status, auditStatus, availableStatus, appName }) {
    page = Math.max(1, parseInt(page) || 1);
    pageSize = Math.min(100, Math.max(1, parseInt(pageSize) || 10));

    const conditions = [];
    const params = [];

    if (code) {
      conditions.push('code LIKE ?');
      params.push(`%${code}%`);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    if (auditStatus) {
      conditions.push('audit_status = ?');
      params.push(auditStatus);
    }
    if (availableStatus) {
      conditions.push('available_status = ?');
      params.push(availableStatus);
    }
    if (appName) {
      conditions.push('app_name LIKE ?');
      params.push(`%${appName}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) AS total FROM business_configs ${whereClause}`;
    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0].total;

    const offset = (page - 1) * pageSize;
    const listSql = `SELECT * FROM business_configs ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const [list] = await pool.query(listSql, [...params, pageSize, offset]);

    const formattedList = list.map(item => ({
      ...item,
      appId: item.app_id,
      appName: item.app_name,
      subScene: item.sub_scene,
      auditStatus: item.audit_status,
      availableStatus: item.available_status,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));

    return { list: formattedList, total, page, pageSize };
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM business_configs WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    const item = rows[0];
    return {
      ...item,
      appId: item.app_id,
      appName: item.app_name,
      subScene: item.sub_scene,
      auditStatus: item.audit_status,
      availableStatus: item.available_status,
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

    const sql = `INSERT INTO business_configs (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`;
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
    const sql = `UPDATE business_configs SET ${setClauses.join(', ')} WHERE id = ?`;
    await pool.query(sql, values);

    return await this.findById(id);
  },

  async delete(id) {
    const item = await this.findById(id);
    if (!item) return null;

    await pool.query('DELETE FROM business_configs WHERE id = ?', [id]);
    return item;
  },

  async batchDelete(ids) {
    if (!ids || ids.length === 0) return 0;

    const placeholders = ids.map(() => '?').join(', ');
    const [result] = await pool.query(`DELETE FROM business_configs WHERE id IN (${placeholders})`, ids);
    return result.affectedRows;
  }
};

module.exports = BusinessConfigModel;
```

- [ ] **Step 2: Commit**

```bash
git add serverProject/models/businessConfigModel.js
git commit -m "feat: add businessConfigModel for database operations"
```

---

### Task 3: Create businessConfigController.js

**Files:**
- Create: `serverProject/controllers/businessConfigController.js`

- [ ] **Step 1: Create businessConfigController.js**

```javascript
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
```

- [ ] **Step 2: Commit**

```bash
git add serverProject/controllers/businessConfigController.js
git commit -m "feat: add businessConfigController for request handling"
```

---

### Task 4: Create businessConfig.js routes

**Files:**
- Create: `serverProject/routes/businessConfig.js`

- [ ] **Step 1: Create businessConfig.js routes**

```javascript
const express = require('express');
const router = express.Router();
const BusinessConfigController = require('../controllers/businessConfigController');
const authMiddleware = require('../middleware/auth');

router.get('/business-configs', authMiddleware, BusinessConfigController.getList);
router.get('/business-configs/:id', authMiddleware, BusinessConfigController.getById);
router.post('/business-configs', authMiddleware, BusinessConfigController.create);
router.put('/business-configs/:id', authMiddleware, BusinessConfigController.update);
router.delete('/business-configs/:id', authMiddleware, BusinessConfigController.delete);
router.post('/business-configs/batch-delete', authMiddleware, BusinessConfigController.batchDelete);

module.exports = router;
```

- [ ] **Step 2: Commit**

```bash
git add serverProject/routes/businessConfig.js
git commit -m "feat: add businessConfig routes"
```

---

### Task 5: Register business config routes in index.js

**Files:**
- Modify: `serverProject/routes/index.js`

- [ ] **Step 1: Add business config routes**

Open `serverProject/routes/index.js` and add:

```javascript
const businessConfigRoutes = require('./businessConfig');
router.use('/', businessConfigRoutes);
```

- [ ] **Step 2: Commit**

```bash
git add serverProject/routes/index.js
git commit -m "feat: register business config routes"
```

---

### Task 6: Create frontend API module

**Files:**
- Create: `src/api/businessConfig.js`

- [ ] **Step 1: Create businessConfig.js**

```javascript
import request from '@/utils/request'

export function getBusinessConfigs(params) {
  return request.get('/business-configs', { params })
}

export function createBusinessConfig(data) {
  return request.post('/business-configs', data)
}

export function updateBusinessConfig(id, data) {
  return request.put(`/business-configs/${id}`, data)
}

export function deleteBusinessConfig(id) {
  return request.delete(`/business-configs/${id}`)
}

export function batchDeleteBusinessConfigs(ids) {
  return request.post('/business-configs/batch-delete', { ids })
}
```

- [ ] **Step 2: Commit**

```bash
git add src/api/businessConfig.js
git commit -m "feat: add businessConfig API module"
```

---

### Task 7: Create useBusinessConfigData composable

**Files:**
- Create: `src/composables/useBusinessConfigData.js`

- [ ] **Step 1: Create useBusinessConfigData.js**

```javascript
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getBusinessConfigs,
  createBusinessConfig,
  updateBusinessConfig,
  deleteBusinessConfig,
  batchDeleteBusinessConfigs
} from '@/api/businessConfig'

export function useBusinessConfigData() {
  const loading = ref(false)
  const tableData = ref([])
  const total = ref(0)

  const searchParams = reactive({
    code: '',
    status: '',
    auditStatus: '',
    availableStatus: '',
    appName: ''
  })

  const pagination = reactive({
    current: 1,
    pageSize: 10
  })

  const fetchTableData = async () => {
    loading.value = true
    try {
      const result = await getBusinessConfigs({
        page: pagination.current,
        pageSize: pagination.pageSize,
        code: searchParams.code || undefined,
        status: searchParams.status || undefined,
        auditStatus: searchParams.auditStatus || undefined,
        availableStatus: searchParams.availableStatus || undefined,
        appName: searchParams.appName || undefined
      })

      tableData.value = result.data.list
      total.value = result.data.total
    } catch (error) {
      console.error('获取业务配置列表失败:', error)
      ElMessage.error('获取业务配置列表失败')
    } finally {
      loading.value = false
    }
  }

  const handleSearch = () => {
    pagination.current = 1
    fetchTableData()
  }

  const handleReset = () => {
    searchParams.code = ''
    searchParams.status = ''
    searchParams.auditStatus = ''
    searchParams.availableStatus = ''
    searchParams.appName = ''
    pagination.current = 1
    fetchTableData()
  }

  const handlePageChange = (page) => {
    pagination.current = page
    fetchTableData()
  }

  const handlePageSizeChange = (size) => {
    pagination.pageSize = size
    pagination.current = 1
    fetchTableData()
  }

  const handleDelete = async (ids) => {
    try {
      if (Array.isArray(ids)) {
        await batchDeleteBusinessConfigs(ids)
      } else {
        await deleteBusinessConfig(ids)
      }
      fetchTableData()
    } catch (error) {
      console.error('删除业务配置失败:', error)
      ElMessage.error('删除业务配置失败')
    }
  }

  const handleCreate = async (data) => {
    try {
      await createBusinessConfig(data)
      fetchTableData()
      ElMessage.success('创建成功')
    } catch (error) {
      console.error('创建业务配置失败:', error)
      ElMessage.error('创建业务配置失败')
      throw error
    }
  }

  const handleUpdate = async (id, data) => {
    try {
      await updateBusinessConfig(id, data)
      fetchTableData()
      ElMessage.success('更新成功')
    } catch (error) {
      console.error('更新业务配置失败:', error)
      ElMessage.error('更新业务配置失败')
      throw error
    }
  }

  fetchTableData()

  return {
    tableData,
    loading,
    total,
    searchParams,
    pagination,
    fetchTableData,
    handleSearch,
    handleReset,
    handlePageChange,
    handlePageSizeChange,
    handleDelete,
    handleCreate,
    handleUpdate
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/composables/useBusinessConfigData.js
git commit -m "feat: add useBusinessConfigData composable"
```

---

### Task 8: Update BusinessConfiguration.vue

**Files:**
- Modify: `src/views/BusinessConfiguration.vue`

- [ ] **Step 1: Replace script section**

Replace the entire `<script setup>` section with:

```javascript
import { ref } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useBusinessConfigData } from '@/composables/useBusinessConfigData'
import ConfigDialog from '@/components/ConfigDialog.vue'
import AuditDetailDialog from '@/components/AuditDetailDialog.vue'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog.vue'
import UnifiedPagination from '@/components/common/UnifiedPagination.vue'

const {
  tableData,
  loading,
  total,
  searchParams,
  handleSearch,
  handleReset,
  handleDelete: executeDelete,
  handleCreate,
  handleUpdate
} = useBusinessConfigData()

const selectedRows = ref([])
const currentRow = ref(null)
const configDialogRef = ref()
const auditDialogRef = ref()
const deleteDialogRef = ref()

const handleSelection = (selection) => {
  selectedRows.value = selection
}

const handleAdd = () => configDialogRef.value.open('新增业务配置')
const handleEdit = (row) => configDialogRef.value.open('编辑业务配置', row)
const showAuditDetail = (row) => auditDialogRef.value.open(row)

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
    configDialogRef.value.close()
  } catch (error) {
    // Error already handled in composable
  }
}
```

- [ ] **Step 2: Update template - Remove sync button**

Remove this line from the template:
```html
<el-button type="primary" :icon="Refresh" class="btn-sync">同步业务配置</el-button>
```

Also remove `Refresh` from the import:
```javascript
import { Plus, Delete } from '@element-plus/icons-vue'
```

- [ ] **Step 3: Update template - Add loading and pagination**

Replace the table section with:
```html
<div class="table-container">
  <el-table :data="tableData" v-loading="loading" style="width: 100%" @selection-change="handleSelection">
    <el-table-column type="selection" width="55" />
    <el-table-column prop="id" label="编号" width="70" />
    <el-table-column prop="code" label="业务指令" />
    <el-table-column prop="appName" label="应用名称" min-width="150" />
    <el-table-column prop="scene" label="业务场景" />
    <el-table-column prop="subScene" label="子业务场景" min-width="120" />
    <el-table-column prop="type" label="操作类型" />
    <el-table-column prop="channel" label="渠道" />
    <el-table-column label="状态">
      <template #default="scope">
        <el-tag :type="scope.row.status === 'enabled' ? 'success' : 'danger'">
          {{ scope.row.status === 'enabled' ? '启用' : '禁用' }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="审核状态">
      <template #default="scope">
        <span class="audit-link" @click="showAuditDetail(scope.row)">
          <span :class="{
            'text-green': scope.row.auditStatus === 'approved',
            'text-orange': scope.row.auditStatus === 'pending',
            'text-red': scope.row.auditStatus === 'rejected'
          }">
            {{ scope.row.auditStatus === 'approved' ? '审核成功' : scope.row.auditStatus === 'pending' ? '待审核' : '审核失败' }}
          </span>
        </span>
      </template>
    </el-table-column>
    <el-table-column prop="availableStatus" label="可用状态" />
    <el-table-column label="操作" width="120">
      <template #default="scope">
        <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
        <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
  
  <UnifiedPagination :total="total" />
</div>
```

- [ ] **Step 4: Update ConfigDialog events**

Replace the ConfigDialog line with:
```html
<ConfigDialog ref="configDialogRef" @save="handleSave" />
```

- [ ] **Step 5: Update DeleteConfirmDialog events**

Replace the DeleteConfirmDialog line with:
```html
<DeleteConfirmDialog ref="deleteDialogRef" @confirm="handleDeleteConfirm" />
```

- [ ] **Step 6: Update style section**

Remove the `.btn-sync` style since sync button is removed.

- [ ] **Step 7: Commit**

```bash
git add src/views/BusinessConfiguration.vue
git commit -m "feat: update BusinessConfiguration to use real API"
```

---

### Task 9: Update ConfigDialog.vue

**Files:**
- Modify: `src/components/ConfigDialog.vue`

- [ ] **Step 1: Update save function**

Replace the save function with:
```javascript
const emit = defineEmits(['refresh', 'save'])

const save = () => {
  const data = { ...form }
  if (isEdit.value) {
    data.id = form.id
  }
  emit('save', data)
}

const close = () => {
  visible.value = false
}
```

- [ ] **Step 2: Update open function to store id**

In the open function, add storing the id:
```javascript
const open = (dialogTitle, rowData) => {
  title.value = dialogTitle

  if (rowData) {
    isEdit.value = true
    form.id = rowData.id
    form.code = rowData.code
    // ... rest of fields
  } else {
    isEdit.value = false
    form.id = null
    // ... reset fields
  }

  visible.value = true
}
```

- [ ] **Step 3: Add id to form reactive**

```javascript
const form = reactive({
  id: null,
  code: '',
  // ... rest of fields
})
```

- [ ] **Step 4: Expose close method**

```javascript
defineExpose({
  open,
  close
})
```

- [ ] **Step 5: Commit**

```bash
git add src/components/ConfigDialog.vue
git commit -m "feat: update ConfigDialog to emit save event"
```

---

### Task 10: Add test data

**Files:**
- None (run SQL directly)

- [ ] **Step 1: Insert test data**

Run the following SQL in MySQL:

```sql
INSERT INTO business_configs (code, app_id, app_name, scene, sub_scene, type, channel, status, audit_status, available_status, description) VALUES
('*10#', 1, '企业品牌宣传应用5', '001趣味通话', '001001虚拟背景', '启动', 'DC', 'enabled', 'approved', 'available', '视频通话测试配置'),
('*11#', 2, '语音通话应用', '002基础通话', '002001语音通话', '停止', 'VC', 'enabled', 'pending', 'available', '语音通话配置'),
('*12#', 3, '即时通讯应用', '003即时通讯', '003001文字消息', '启动', 'DC', 'disabled', 'rejected', 'unavailable', '即时通讯配置'),
('*13#', 4, '会议系统应用', '004会议场景', '004001视频会议', '启动', 'VC', 'enabled', 'approved', 'available', '会议系统配置'),
('*14#', 5, '直播推流应用', '005直播场景', '005001推流配置', '启动', 'DC', 'enabled', 'sync_success', 'available', '直播推流配置'),
('*15#', 1, '企业品牌宣传应用5', '001趣味通话', '001002美颜效果', '停止', 'VC', 'disabled', 'pending', 'unavailable', '美颜效果配置'),
('*16#', 6, '远程医疗应用', '006医疗场景', '006001远程问诊', '启动', 'DC', 'enabled', 'approved', 'available', '远程医疗配置'),
('*17#', 7, '在线教育应用', '007教育场景', '007001直播课堂', '启动', 'VC', 'enabled', 'approved', 'available', '在线教育配置'),
('*18#', 8, '智能客服应用', '008客服场景', '008001语音客服', '启动', 'DC', 'enabled', 'pending', 'available', '智能客服配置'),
('*19#', 9, '视频会议Pro', '004会议场景', '004002大型会议', '启动', 'VC', 'enabled', 'approved', 'available', '视频会议Pro配置');
```

- [ ] **Step 2: Commit**

No commit needed for test data.

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Update init-db.js | serverProject/init-db.js |
| 2 | Create businessConfigModel.js | serverProject/models/businessConfigModel.js |
| 3 | Create businessConfigController.js | serverProject/controllers/businessConfigController.js |
| 4 | Create businessConfig.js routes | serverProject/routes/businessConfig.js |
| 5 | Register routes | serverProject/routes/index.js |
| 6 | Create frontend API | src/api/businessConfig.js |
| 7 | Create composable | src/composables/useBusinessConfigData.js |
| 8 | Update BusinessConfiguration.vue | src/views/BusinessConfiguration.vue |
| 9 | Update ConfigDialog.vue | src/components/ConfigDialog.vue |
| 10 | Add test data | SQL script |
