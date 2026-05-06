# 费用明细页面设计规格

## 概述

费用明细页面（`/cdr/charges`）是 CDR 管理模块下的纯只读数据展示页面，用于展示用户的费用记录明细，支持多条件筛选和按业务总费用排序。

## 页面结构

### 1. 页面头部

- 左侧标题："费用明细"（h2，font-size 18px，color #333333）
- 右侧按钮："同步费用明细"（`el-button type="primary"` + `Refresh` 图标）
- 同步按钮行为：点击后显示 `ElMessage.info('同步功能开发中')`，暂不实现真实同步逻辑

### 2. 搜索筛选区

采用 `el-form :inline="true"` 布局，4 个筛选条件：

| 字段 | 组件 | 占位文本/选项 |
|------|------|--------------|
| 用户号码 | `el-input` | placeholder: "请输入" |
| 子业务场景 | `el-select` | 默认值: "全部场景"；选项: "全部场景", "001趣味通话" 等 |
| 服务开始时间 | 两个 `el-date-picker type="datetime"` | placeholder: "开始时间" / "结束时间"，中间"至"分隔 |
| 服务结束时间 | 两个 `el-date-picker type="datetime"` | placeholder: "开始时间" / "结束时间"，中间"至"分隔 |

右侧操作按钮：
- 查询（`type="primary"`）
- 重置

查询行为：前端过滤 mock 数据（computed），按用户号码精确匹配、子业务场景精确匹配、时间范围筛选。
重置行为：清空所有筛选条件，恢复显示全部数据。

### 3. 数据表格

`el-table`，只读展示，无 selection 列，无操作列。

**列定义（13列）：**

| 列名 | 字段名 | 宽度 | 特殊处理 |
|------|--------|------|----------|
| 流水号 | `transactionId` | 130px | 无 |
| 用户号码 | `userNumber` | 140px | 无 |
| 通话标识 | `callId` | 130px | 无 |
| 应用ID | `appId` | 130px | 无 |
| 业务场景 | `businessScene` | 120px | 无 |
| 子业务场景 | `subScene` | 140px | 无 |
| 计费方式 | `billingMethod` | 100px | 显示"按时长"/"按次" |
| 业务单价 | `unitPrice` | 110px | 显示"X 元/分钟"或"X 元/次" |
| 业务总费用(元) | `totalCost` | 140px | **唯一可排序列**（`sortable`） |
| 服务时长 | `duration` | 100px | 格式 MM:SS；按次计费时显示"--" |
| 服务次数 | `count` | 100px | 按时长计费时显示"--" |
| 服务开始时间 | `startTime` | 180px | 格式: YYYY-MM-DD HH:mm:ss |
| 服务结束时间 | `endTime` | 180px | 格式: YYYY-MM-DD HH:mm:ss |

表头样式：`background: #f8fafc, color: #606266, fontWeight: bold`

### 4. 分页

复用 `UnifiedPagination` 组件，`total` 绑定为 360。

### 5. Mock 数据

提供 10-15 条 mock 数据，覆盖两种计费方式：
- 按时长：有服务时长，服务次数为"--"
- 按次：有服务次数，服务时长为"--"

## 技术实现

### 文件

- 修改：`src/views/ChargesDetail.vue`（当前为空占位）

### 代码模式

遵循 `BillingPackage.vue` 的代码结构：
- `<script setup>` + Composition API
- `ref` / `reactive` 管理状态
- `computed` 实现前端搜索过滤
- Tailwind CSS 工具类 + scoped styles
- Element Plus 组件库

### 不包含

- 无编辑/删除操作（纯只读）
- 无新增弹窗
- 无删除确认弹窗
- 无 selection 多选
- 同步功能暂不实现（仅占位提示）
