# Application Management Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the backend API for Application Management page and connect it with the frontend, replacing mock data with real database operations.

**Architecture:** Create backend MVC pattern (Model-View-Controller) for application CRUD operations, then update frontend composable to use real API calls instead of mock data.

**Tech Stack:** Node.js, Express, MySQL2, Vue 3, Element Plus

---

## File Structure

### Backend (serverProject/)
- `init-db.js` - Add applications table creation
- `models/applicationModel.js` - Database operations (NEW)
- `controllers/applicationController.js` - Business logic (NEW)
- `routes/application.js` - API routes (NEW)
- `routes/index.js` - Register application routes (MODIFY)

### Frontend (src/)
- `api/application.js` - API request functions (NEW)
- `composables/useApplicationData.js` - Connect to real API (MODIFY)

---

## Task 1: Update init-db.js to Create Applications Table

**Files:**
- Modify: `serverProject/init-db.js:28-39`

- [ ] **Step 1: Add applications table SQL after users table creation**

Open `serverProject/init-db.js` and add the following code after line 39 (after users table creation):

```javascript
    // 创建应用表
    await tempPool.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        business_scene VARCHAR(50),
        sub_scenes JSON,
        audit_status ENUM('pending', 'approved', 'rejected', 'sync_success') DEFAULT 'pending',
        available_status ENUM('available', 'unavailable') DEFAULT 'available',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('应用表创建成功');
```

- [ ] **Step 2: Run init-db.js to create the table**

Run: `cd serverProject && node init-db.js`
Expected: Output should show "应用表创建成功"

- [ ] **Step 3: Commit changes**

```bash
git add serverProject/init-db.js
git commit -m "feat: add applications table to database initialization"
```

---

## Task 2: Create Application Model

**Files:**
- Create: `serverProject/models/applicationModel.js`

- [ ] **Step 1: Create applicationModel.js with CRUD operations**

Create `serverProject/models/applicationModel.js`:

```javascript
const pool = require('../config/db');

const VALID_COLUMNS = ['name', 'business_scene', 'sub_scenes', 'audit_status', 'available_status', 'description'];

const ApplicationModel = {
  async findWithPagination({ page = 1, pageSize = 10, name, auditStatus, availableStatus }) {
    page = Math.max(1, parseInt(page) || 1);
    pageSize = Math.min(100, Math.max(1, parseInt(pageSize) || 10));

    const conditions = [];
    const params = [];

    if (name) {
      conditions.push('name LIKE ?');
      params.push(`%${name}%`);
    }
    if (auditStatus) {
      conditions.push('audit_status = ?');
      params.push(auditStatus);
    }
    if (availableStatus) {
      conditions.push('available_status = ?');
      params.push(availableStatus);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) AS total FROM applications ${whereClause}`;
    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0].total;

    const offset = (page - 1) * pageSize;
    const listSql = `SELECT * FROM applications ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const [list] = await pool.query(listSql, [...params, pageSize, offset]);

    const formattedList = list.map(item => ({
      ...item,
      subScenes: typeof item.sub_scenes === 'string' ? JSON.parse(item.sub_scenes) : item.sub_scenes,
      businessScene: item.business_scene,
      auditStatus: item.audit_status,
      availableStatus: item.available_status,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));

    return { list: formattedList, total, page, pageSize };
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM applications WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    const item = rows[0];
    return {
      ...item,
      subScenes: typeof item.sub_scenes === 'string' ? JSON.parse(item.sub_scenes) : item.sub_scenes,
      businessScene: item.business_scene,
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
      if (key === 'sub_scenes') {
        fields.push(key);
        values.push(JSON.stringify(value));
      } else {
        fields.push(key);
        values.push(value);
      }
    }

    if (fields.length === 0) return null;

    const sql = `INSERT INTO applications (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`;
    const [result] = await pool.query(sql, values);

    return await this.findById(result.insertId);
  },

  async update(id, data) {
    const setClauses = [];
    const values = [];

    for (const [key, value] of Object.entries(data)) {
      if (!VALID_COLUMNS.includes(key)) continue;
      if (key === 'sub_scenes') {
        setClauses.push(`${key} = ?`);
        values.push(JSON.stringify(value));
      } else {
        setClauses.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (setClauses.length === 0) return null;

    values.push(id);
    const sql = `UPDATE applications SET ${setClauses.join(', ')} WHERE id = ?`;
    await pool.query(sql, values);

    return await this.findById(id);
  },

  async delete(id) {
    const item = await this.findById(id);
    if (!item) return null;

    await pool.query('DELETE FROM applications WHERE id = ?', [id]);
    return item;
  },

  async batchDelete(ids) {
    if (!ids || ids.length === 0) return 0;

    const placeholders = ids.map(() => '?').join(', ');
    const [result] = await pool.query(`DELETE FROM applications WHERE id IN (${placeholders})`, ids);
    return result.affectedRows;
  }
};

module.exports = ApplicationModel;
```

- [ ] **Step 2: Verify model file is created correctly**

Run: `ls -la serverProject/models/applicationModel.js`
Expected: File exists

- [ ] **Step 3: Commit changes**

```bash
git add serverProject/models/applicationModel.js
git commit -m "feat: add ApplicationModel with CRUD operations"
```

---

## Task 3: Create Application Controller

**Files:**
- Create: `serverProject/controllers/applicationController.js`

- [ ] **Step 1: Create applicationController.js with request handlers**

Create `serverProject/controllers/applicationController.js`:

```javascript
const ApplicationModel = require('../models/applicationModel');

const ApplicationController = {
  async getList(req, res) {
    try {
      const { page, pageSize, name, auditStatus, availableStatus } = req.query;
      const result = await ApplicationModel.findWithPagination({
        page: parseInt(page) || 1,
        pageSize: parseInt(pageSize) || 10,
        name,
        auditStatus,
        availableStatus
      });

      return res.json({
        code: 200,
        message: '获取成功',
        data: result
      });
    } catch (error) {
      console.error('获取应用列表失败:', error);
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
      const result = await ApplicationModel.findById(id);

      if (!result) {
        return res.status(404).json({
          code: 404,
          message: '应用不存在',
          data: null
        });
      }

      return res.json({
        code: 200,
        message: '获取成功',
        data: result
      });
    } catch (error) {
      console.error('获取应用详情失败:', error);
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: null
      });
    }
  },

  async create(req, res) {
    try {
      const { name, businessScene, subScenes, description } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          code: 400,
          message: '应用名称不能为空',
          data: null
        });
      }

      const result = await ApplicationModel.create({
        name: name.trim(),
        business_scene: businessScene,
        sub_scenes: subScenes || [],
        description
      });

      return res.json({
        code: 200,
        message: '创建成功',
        data: { id: result.id }
      });
    } catch (error) {
      console.error('创建应用失败:', error);
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
      const { name, businessScene, subScenes, description } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          code: 400,
          message: '应用名称不能为空',
          data: null
        });
      }

      const existing = await ApplicationModel.findById(id);
      if (!existing) {
        return res.status(404).json({
          code: 404,
          message: '应用不存在',
          data: null
        });
      }

      const result = await ApplicationModel.update(id, {
        name: name.trim(),
        business_scene: businessScene,
        sub_scenes: subScenes,
        description
      });

      return res.json({
        code: 200,
        message: '更新成功',
        data: result
      });
    } catch (error) {
      console.error('更新应用失败:', error);
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
      const result = await ApplicationModel.delete(id);

      if (!result) {
        return res.status(404).json({
          code: 404,
          message: '应用不存在',
          data: null
        });
      }

      return res.json({
        code: 200,
        message: '删除成功',
        data: result
      });
    } catch (error) {
      console.error('删除应用失败:', error);
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
          message: '请选择要删除的应用',
          data: null
        });
      }

      const affectedRows = await ApplicationModel.batchDelete(ids);

      return res.json({
        code: 200,
        message: '批量删除成功',
        data: { affectedRows }
      });
    } catch (error) {
      console.error('批量删除应用失败:', error);
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: null
      });
    }
  }
};

module.exports = ApplicationController;
```

- [ ] **Step 2: Verify controller file is created correctly**

Run: `ls -la serverProject/controllers/applicationController.js`
Expected: File exists

- [ ] **Step 3: Commit changes**

```bash
git add serverProject/controllers/applicationController.js
git commit -m "feat: add ApplicationController with request handlers"
```

---

## Task 4: Create Application Routes

**Files:**
- Create: `serverProject/routes/application.js`
- Modify: `serverProject/routes/index.js:1-12`

- [ ] **Step 1: Create application.js route file**

Create `serverProject/routes/application.js`:

```javascript
const express = require('express');
const router = express.Router();
const ApplicationController = require('../controllers/applicationController');
const authMiddleware = require('../middleware/auth');

router.get('/applications', authMiddleware, ApplicationController.getList);
router.get('/applications/:id', authMiddleware, ApplicationController.getById);
router.post('/applications', authMiddleware, ApplicationController.create);
router.put('/applications/:id', authMiddleware, ApplicationController.update);
router.delete('/applications/:id', authMiddleware, ApplicationController.delete);
router.post('/applications/batch-delete', authMiddleware, ApplicationController.batchDelete);

module.exports = router;
```

- [ ] **Step 2: Update routes/index.js to register application routes**

Modify `serverProject/routes/index.js`:

```javascript
const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const menuRoutes = require('./menu');
const imageRoutes = require('./image');
const applicationRoutes = require('./application');

// 挂载路由
router.use('/auth', authRoutes);
router.use('/', menuRoutes);
router.use('/', imageRoutes);
router.use('/', applicationRoutes);

module.exports = router;
```

- [ ] **Step 3: Verify route files**

Run: `ls -la serverProject/routes/`
Expected: application.js exists

- [ ] **Step 4: Commit changes**

```bash
git add serverProject/routes/application.js serverProject/routes/index.js
git commit -m "feat: add application routes and register in main router"
```

---

## Task 5: Create Frontend API Module

**Files:**
- Create: `src/api/application.js`

- [ ] **Step 1: Create application.js API file**

Create `src/api/application.js`:

```javascript
import request from '@/utils/request'

export function getApplications(params) {
  return request.get('/applications', { params })
}

export function getApplicationById(id) {
  return request.get(`/applications/${id}`)
}

export function createApplication(data) {
  return request.post('/applications', data)
}

export function updateApplication(id, data) {
  return request.put(`/applications/${id}`, data)
}

export function deleteApplication(id) {
  return request.delete(`/applications/${id}`)
}

export function batchDeleteApplications(ids) {
  return request.post('/applications/batch-delete', { ids })
}
```

- [ ] **Step 2: Verify API file is created correctly**

Run: `ls -la src/api/application.js`
Expected: File exists

- [ ] **Step 3: Commit changes**

```bash
git add src/api/application.js
git commit -m "feat: add application API module"
```

---

## Task 6: Update Frontend Composable to Use Real API

**Files:**
- Modify: `src/composables/useApplicationData.js`

- [ ] **Step 1: Replace useApplicationData.js with real API implementation**

Replace the entire content of `src/composables/useApplicationData.js`:

```javascript
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getApplications,
  deleteApplication,
  batchDeleteApplications
} from '@/api/application'

export function useApplicationData() {
  const loading = ref(false)
  const currentSyncing = ref(false)
  const tableData = ref([])
  const total = ref(0)

  const searchParams = reactive({
    name: '',
    auditStatus: '',
    availableStatus: ''
  })

  const pagination = reactive({
    current: 1,
    pageSize: 10
  })

  const fetchTableData = async () => {
    loading.value = true
    try {
      const result = await getApplications({
        page: pagination.current,
        pageSize: pagination.pageSize,
        name: searchParams.name || undefined,
        auditStatus: searchParams.auditStatus || undefined,
        availableStatus: searchParams.availableStatus || undefined
      })

      tableData.value = result.data.list
      total.value = result.data.total
    } catch (error) {
      console.error('获取应用列表失败:', error)
      ElMessage.error('获取应用列表失败')
    } finally {
      loading.value = false
    }
  }

  const handleSearch = () => {
    pagination.current = 1
    fetchTableData()
  }

  const handleReset = () => {
    searchParams.name = ''
    searchParams.auditStatus = ''
    searchParams.availableStatus = ''
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

  const handleSync = () => {
    currentSyncing.value = true
    setTimeout(() => {
      currentSyncing.value = false
      fetchTableData()
    }, 1500)
  }

  const handleDelete = async (ids) => {
    try {
      if (Array.isArray(ids)) {
        await batchDeleteApplications(ids)
      } else {
        await deleteApplication(ids)
      }
      fetchTableData()
    } catch (error) {
      console.error('删除应用失败:', error)
      ElMessage.error('删除应用失败')
    }
  }

  const handleEdit = (id) => {
    console.log('编辑应用:', id)
  }

  fetchTableData()

  return {
    tableData,
    loading,
    total,
    currentSyncing,
    searchParams,
    pagination,
    fetchTableData,
    handleSearch,
    handleReset,
    handlePageChange,
    handlePageSizeChange,
    handleSync,
    handleDelete,
    handleEdit
  }
}
```

- [ ] **Step 2: Verify composable file is updated correctly**

Run: `cat src/composables/useApplicationData.js | head -20`
Expected: Shows import from API module

- [ ] **Step 3: Commit changes**

```bash
git add src/composables/useApplicationData.js
git commit -m "feat: update useApplicationData to use real API"
```

---

## Task 7: Test Backend API

**Files:**
- None (testing only)

- [ ] **Step 1: Start backend server**

Run: `cd serverProject && npm run dev`
Expected: Server starts on port 3001

- [ ] **Step 2: Test GET /api/v1/applications**

Run: `curl http://localhost:3001/api/v1/applications`
Expected: Returns JSON with code 200 and empty list

- [ ] **Step 3: Test POST /api/v1/applications**

Run: `curl -X POST http://localhost:3001/api/v1/applications -H "Content-Type: application/json" -d '{"name":"Test App","businessScene":"Basic Scene","description":"Test"}'`
Expected: Returns JSON with code 200 and new application id

- [ ] **Step 4: Test GET /api/v1/applications after create**

Run: `curl http://localhost:3001/api/v1/applications`
Expected: Returns JSON with the newly created application

- [ ] **Step 5: Stop backend server**

Press Ctrl+C to stop the server

---

## Task 8: Test Frontend Integration

**Files:**
- None (testing only)

- [ ] **Step 1: Start backend server**

Run: `cd serverProject && npm run dev`
Expected: Server starts on port 3001

- [ ] **Step 2: Start frontend dev server**

Run: `npm run dev`
Expected: Frontend starts on port 5173

- [ ] **Step 3: Login and navigate to Application Management**

Open browser to http://localhost:5173/login
Login with admin/123456
Navigate to 应用管理 page

- [ ] **Step 4: Verify applications list loads**

Expected: Page shows applications from database (may be empty initially)

- [ ] **Step 5: Test creating new application**

Click 新增应用 button
Fill in form and submit
Expected: New application appears in the list

- [ ] **Step 6: Test editing application**

Click edit button on an application
Modify fields and save
Expected: Application updated in the list

- [ ] **Step 7: Test deleting application**

Click delete button on an application
Confirm deletion
Expected: Application removed from the list

- [ ] **Step 8: Stop both servers**

Press Ctrl+C to stop both servers

---

## Task 9: Final Commit and Cleanup

**Files:**
- None

- [ ] **Step 1: Verify all files are committed**

Run: `git status`
Expected: Working tree clean

- [ ] **Step 2: Create final commit with all changes**

```bash
git add -A
git commit -m "feat: complete application management backend and frontend integration

- Add applications table to database
- Create ApplicationModel with CRUD operations
- Create ApplicationController with request handlers
- Create application routes
- Create frontend API module
- Update useApplicationData composable to use real API
- Remove mock data and connect to real backend"
```

- [ ] **Step 3: Push to remote**

Run: `git push origin main`
Expected: Changes pushed to GitHub

---

## Summary

This plan completes the Application Management feature by:
1. Adding database table for applications
2. Creating backend API with full CRUD support
3. Connecting frontend to real API endpoints
4. Removing mock data and using real database operations

Total tasks: 9
Total steps: 37
Estimated time: 45-60 minutes
