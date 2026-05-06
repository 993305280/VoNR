# 通话记录页面设计规格

## 概述

通话记录页面（`/cdr/calls`）是 CDR 管理模块下的纯只读数据展示页面，用于展示通话记录明细，支持按主叫/被叫号码和时间范围筛选。

## 页面结构

### 1. 页面头部

- 标题："通话记录"（h2，font-size 18px，color #333333）
- 无操作按钮（纯查询页面）

### 2. 搜索筛选区

采用 `el-form` + `flex-wrap: nowrap` 横向布局，所有条件和按钮在同一行，跟随侧边栏收缩/扩展自适应宽度。

| 字段 | 组件 | 占位文本 | flex |
|------|------|----------|------|
| 主叫号码 | `el-input` | "请输入" | flex: 1 |
| 被叫号码 | `el-input` | "请输入" | flex: 1 |
| 开始时间 | 两个 `el-date-picker type="datetime"` | "开始时间" / "结束时间"，中间"至"分隔 | flex: 2 |
| 结束时间 | 两个 `el-date-picker type="datetime"` | "开始时间" / "结束时间"，中间"至"分隔 | flex: 2 |

右侧操作按钮（`margin-left: auto`）：
- 查询（`type="primary"`）
- 重置

查询行为：前端过滤 mock 数据，按主叫号码精确匹配、被叫号码精确匹配、开始时间范围筛选、结束时间范围筛选。
重置行为：清空所有筛选条件，恢复显示全部数据。

### 3. 数据表格

`el-table`，只读展示，无 selection 列，无操作列。

**列定义（8列）：**

| 列名 | 字段名 | min-width | 特殊处理 |
|------|--------|-----------|----------|
| 通话标识 | `callId` | 130px | 无 |
| 主叫号码 | `callerNumber` | 140px | 无 |
| 被叫号码 | `calleeNumber` | 140px | 无 |
| 应用ID | `appId` | 130px | 无 |
| 通话方向 | `callDirection` | 100px | 显示"上行"/"下行" |
| 通话类型 | `callType` | 100px | 显示"音频"/"视频" |
| 开始时间 | `startTime` | 180px | 格式: YYYY-MM-DD HH:mm:ss |
| 结束时间 | `endTime` | 180px | 格式: YYYY-MM-DD HH:mm:ss |

表头样式：`background: #f8fafc, color: #606266, fontWeight: bold`

### 4. 分页

复用 `UnifiedPagination` 组件，`total` 绑定为 360。

### 5. Mock 数据

提供 10 条 mock 数据，覆盖两种通话方向（上行/下行）和两种通话类型（音频/视频）。

## 技术实现

### 文件

- 修改：`src/views/CallRecords.vue`（当前为空占位）

### 代码模式

遵循 `CDRDetail.vue` 的代码结构：
- `<script setup>` + Composition API
- `reactive` 管理搜索表单状态
- `ref` + `rawData` 实现前端搜索过滤
- scoped `<style>` 块（非 Tailwind）
- Element Plus 组件库
- `UnifiedPagination` 公共分页组件

### 响应式行为

搜索行使用 `flex-wrap: nowrap`，每个 `el-form-item` 设为 `flex: 1`（时间范围 `flex: 2`），侧边栏收缩时内容区自动变宽，表单项等比扩展。

### 不包含

- 无编辑/删除操作（纯只读）
- 无新增弹窗
- 无 selection 多选
- 无导出功能
