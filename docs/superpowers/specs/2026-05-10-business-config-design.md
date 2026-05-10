# Business Configuration Backend Design

## Overview

Complete the backend API for the Business Configuration page and connect it with the frontend. Currently the frontend uses mock data; this design adds real CRUD operations via a MySQL database. The sync button will NOT be implemented per user request.

## Goals

1. Create backend API endpoints for business configuration CRUD operations
2. Connect frontend to real API endpoints
3. Support pagination, search, single/batch delete operations
4. Remove sync button functionality

## Data Model

### Database Table: `business_configs`

```sql
CREATE TABLE IF NOT EXISTS business_configs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL COMMENT 'Business instruction code',
  app_id INT COMMENT 'Associated application ID',
  app_name VARCHAR(100) COMMENT 'Application name',
  scene VARCHAR(100) COMMENT 'Business scene',
  sub_scene VARCHAR(100) COMMENT 'Sub business scene',
  type VARCHAR(20) COMMENT 'Operation type',
  channel VARCHAR(10) COMMENT 'Channel (DC/VC)',
  status ENUM('enabled', 'disabled') DEFAULT 'enabled',
  audit_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  available_status ENUM('available', 'unavailable') DEFAULT 'available',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary key, auto-increment |
| code | VARCHAR(50) | Business instruction code (required, unique) |
| app_id | INT | Associated application ID |
| app_name | VARCHAR(100) | Application name (for display) |
| scene | VARCHAR(100) | Business scene |
| sub_scene | VARCHAR(100) | Sub business scene |
| type | VARCHAR(20) | Operation type (启动/停止) |
| channel | VARCHAR(10) | Channel (DC/VC) |
| status | ENUM | Status: enabled/disabled |
| audit_status | ENUM | Audit status: pending/approved/rejected |
| available_status | ENUM | Availability: available/unavailable |
| description | TEXT | Description |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

## Backend Architecture

### File Structure

```
serverProject/
├── controllers/
│   └── businessConfigController.js
├── models/
│   └── businessConfigModel.js
├── routes/
│   └── businessConfig.js
└── init-db.js (modified to create business_configs table)
```

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/business-configs | Get business config list (with pagination and search) |
| POST | /api/business-configs | Create new business config |
| PUT | /api/business-configs/:id | Update business config |
| DELETE | /api/business-configs/:id | Delete single business config |
| POST | /api/business-configs/batch-delete | Batch delete business configs |

### Request/Response Format

**GET /api/business-configs**

Query Parameters:
- `page` (number, default: 1) - Page number
- `pageSize` (number, default: 10) - Items per page
- `code` (string, optional) - Filter by code
- `status` (string, optional) - Filter by status
- `auditStatus` (string, optional) - Filter by audit status
- `availableStatus` (string, optional) - Filter by availability
- `appName` (string, optional) - Filter by app name

Response:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "code": "*10#",
        "appId": 1,
        "appName": "企业品牌宣传应用5",
        "scene": "001趣味通话",
        "subScene": "001001虚拟背景",
        "type": "启动",
        "channel": "DC",
        "status": "enabled",
        "auditStatus": "approved",
        "availableStatus": "available",
        "description": "测试说明",
        "createdAt": "2026-05-10T00:00:00.000Z",
        "updatedAt": "2026-05-10T00:00:00.000Z"
      }
    ],
    "total": 100
  }
}
```

**POST /api/business-configs**

Request Body:
```json
{
  "code": "*12#",
  "appId": 1,
  "appName": "企业品牌宣传应用5",
  "scene": "001趣味通话",
  "subScene": "001001虚拟背景",
  "type": "启动",
  "channel": "DC",
  "status": "enabled",
  "description": "测试说明"
}
```

Response:
```json
{
  "code": 200,
  "message": "success",
  "data": { "id": 101 }
}
```

**PUT /api/business-configs/:id**

Request Body: Same as POST

Response:
```json
{
  "code": 200,
  "message": "success"
}
```

**DELETE /api/business-configs/:id**

Response:
```json
{
  "code": 200,
  "message": "success"
}
```

**POST /api/business-configs/batch-delete**

Request Body:
```json
{
  "ids": [1, 2, 3]
}
```

Response:
```json
{
  "code": 200,
  "message": "success"
}
```

## Frontend Integration

### New File: `src/api/businessConfig.js`

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

### New File: `src/composables/useBusinessConfigData.js`

Similar to `useApplicationData.js`:
- Fetch data with pagination and search params
- Handle create, update, delete operations
- Return reactive state and methods

### Modified File: `src/views/BusinessConfiguration.vue`

Changes:
1. Remove sync button (per user request)
2. Remove mock data, use composable
3. Connect search form to API filters
4. Connect table to real data
5. Implement pagination
6. Update ConfigDialog to call API on save

### Response Data Mapping

| Backend Field | Frontend Field |
|---------------|----------------|
| app_id | appId |
| app_name | appName |
| sub_scene | subScene |
| audit_status | auditStatus |
| available_status | availableStatus |
| created_at | createdAt |
| updated_at | updatedAt |

## Implementation Steps

### Phase 1: Backend (serverProject)

1. **Update init-db.js** - Add business_configs table creation
2. **Create businessConfigModel.js** - Database operations
3. **Create businessConfigController.js** - Business logic
4. **Create businessConfig.js routes** - API routes
5. **Update routes/index.js** - Register business config routes

### Phase 2: Frontend (src)

1. **Create api/businessConfig.js** - API request functions
2. **Create composables/useBusinessConfigData.js** - Data management
3. **Update views/BusinessConfiguration.vue** - Remove sync button, connect API
4. **Update components/ConfigDialog.vue** - Call API on save

## Error Handling

### Backend Errors

| Error | HTTP Code | Response |
|-------|-----------|----------|
| Invalid request body | 400 | `{ "code": 400, "message": "Invalid request" }` |
| Config not found | 404 | `{ "code": 404, "message": "Config not found" }` |
| Database error | 500 | `{ "code": 500, "message": "Internal server error" }` |

### Frontend Error Handling

- Show ElMessage.error for API failures
- Reset loading states on error
- Maintain UI state consistency

## Testing Checklist

- [ ] Create business config via API
- [ ] Edit business config via API
- [ ] Delete single config via API
- [ ] Batch delete configs via API
- [ ] Get paginated list via API
- [ ] Search/filter configs via API
- [ ] Frontend displays real data from API
- [ ] Frontend CRUD operations work correctly
- [ ] Error handling displays appropriate messages
- [ ] Pagination works correctly
- [ ] Sync button removed from UI
