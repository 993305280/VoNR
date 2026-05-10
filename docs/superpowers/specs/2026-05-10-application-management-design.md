# Application Management Backend Design

## Overview

Complete the backend API for the Application Management page and connect it with the frontend. Currently the frontend uses mock data; this design adds real CRUD operations via a MySQL database.

## Goals

1. Create backend API endpoints for application CRUD operations
2. Connect frontend to real API endpoints
3. Support pagination, search, single/batch delete operations

## Data Model

### Database Table: `applications`

```sql
CREATE TABLE IF NOT EXISTS applications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT 'Application name',
  business_scene VARCHAR(50) COMMENT 'Business scene',
  sub_scenes JSON COMMENT 'Sub-scenes array',
  audit_status ENUM('pending', 'approved', 'rejected', 'sync_success') DEFAULT 'pending',
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
| name | VARCHAR(100) | Application name (required) |
| business_scene | VARCHAR(50) | Business scene category |
| sub_scenes | JSON | Array of sub-scenes [{code, name}] |
| audit_status | ENUM | Audit status: pending/approved/rejected/sync_success |
| available_status | ENUM | Availability: available/unavailable |
| description | TEXT | Application description |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

## Backend Architecture

### File Structure

```
serverProject/
├── controllers/
│   └── applicationController.js
├── models/
│   └── applicationModel.js
├── routes/
│   └── application.js
└── init-db.js (modified to create applications table)
```

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/applications | Get application list (with pagination and search) |
| POST | /api/applications | Create new application |
| PUT | /api/applications/:id | Update application |
| DELETE | /api/applications/:id | Delete single application |
| DELETE | /api/applications | Batch delete applications |

### Request/Response Format

**GET /api/applications**

Query Parameters:
- `page` (number, default: 1) - Page number
- `pageSize` (number, default: 10) - Items per page
- `name` (string, optional) - Filter by name
- `auditStatus` (string, optional) - Filter by audit status
- `availableStatus` (string, optional) - Filter by availability

Response:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "Video Call",
        "businessScene": "Basic Scene",
        "subScenes": [{"code": "001001", "name": "Virtual Background"}],
        "auditStatus": "approved",
        "availableStatus": "available",
        "description": "A video call application...",
        "createdAt": "2026-05-10T00:00:00.000Z",
        "updatedAt": "2026-05-10T00:00:00.000Z"
      }
    ],
    "total": 360
  }
}
```

**POST /api/applications**

Request Body:
```json
{
  "name": "New App",
  "businessScene": "Basic Scene",
  "subScenes": [{"code": "001001", "name": "Virtual Background"}],
  "description": "Application description"
}
```

Response:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 101
  }
}
```

**PUT /api/applications/:id**

Request Body:
```json
{
  "name": "Updated App",
  "businessScene": "Entertainment Scene",
  "subScenes": [{"code": "001001", "name": "Virtual Background"}],
  "description": "Updated description"
}
```

Response:
```json
{
  "code": 0,
  "message": "success"
}
```

**DELETE /api/applications/:id**

Response:
```json
{
  "code": 0,
  "message": "success"
}
```

**DELETE /api/applications**

Request Body:
```json
{
  "ids": [1, 2, 3]
}
```

Response:
```json
{
  "code": 0,
  "message": "success"
}
```

## Frontend Integration

### New File: `src/api/application.js`

```javascript
import request from '@/utils/request'

export function getApplications(params) {
  return request.get('/applications', { params })
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
  return request.delete('/applications', { data: { ids } })
}
```

### Modified File: `src/composables/useApplicationData.js`

Changes:
1. Import API functions from `@/api/application`
2. Replace `generateMockData` with `getApplications` API call
3. Replace local delete operations with `deleteApplication` / `batchDeleteApplications` API calls
4. Handle loading states and error responses
5. Update pagination to use server-side pagination

Key changes:
- `fetchTableData()` calls API instead of generating mock data
- `handleDelete()` calls `deleteApplication()` then refreshes list
- `handleBatchDelete()` calls `batchDeleteApplications()` then refreshes list
- Remove `TOTAL_MOCK` constant, use `total` from API response
- Add error handling with try/catch and ElMessage

### Response Data Mapping

The API returns data in snake_case format, but the frontend uses camelCase. The mapping:

| Backend Field | Frontend Field |
|---------------|----------------|
| business_scene | businessScene |
| sub_scenes | subScenes |
| audit_status | auditStatus |
| available_status | availableStatus |
| created_at | createdAt |
| updated_at | updatedAt |

This mapping will be handled in `useApplicationData.js` when processing API responses.

## Implementation Steps

### Phase 1: Backend (serverProject)

1. **Update init-db.js** - Add applications table creation
2. **Create applicationModel.js** - Database operations
3. **Create applicationController.js** - Business logic
4. **Create application.js routes** - API routes
5. **Update routes/index.js** - Register application routes

### Phase 2: Frontend (src)

1. **Create api/application.js** - API request functions
2. **Update composables/useApplicationData.js** - Connect to real API
3. **Update views/ApplicationManagement.vue** - Handle pagination and data refresh

## Error Handling

### Backend Errors

| Error | HTTP Code | Response |
|-------|-----------|----------|
| Invalid request body | 400 | `{ "code": 400, "message": "Invalid request" }` |
| Application not found | 404 | `{ "code": 404, "message": "Application not found" }` |
| Database error | 500 | `{ "code": 500, "message": "Internal server error" }` |

### Frontend Error Handling

- Show ElMessage.error for API failures
- Reset loading states on error
- Maintain UI state consistency

## Testing Checklist

- [ ] Create application via API
- [ ] Edit application via API
- [ ] Delete single application via API
- [ ] Batch delete applications via API
- [ ] Get paginated list via API
- [ ] Search/filter applications via API
- [ ] Frontend displays real data from API
- [ ] Frontend CRUD operations work correctly
- [ ] Error handling displays appropriate messages
- [ ] Pagination works correctly
