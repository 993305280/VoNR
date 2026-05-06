# 操作日志页面设计

## 概述

实现操作日志（LogList.vue）页面，提供操作记录的查询和浏览功能。页面遵循项目已有的只读数据页模式（CallRecords/ChargesDetail/CDRDetail），但查询区域采用固定两行布局。

## 页面结构

```
.page-content (flex-column, height:100%, 白色背景)
  .page-header          — 页面标题 "操作日志"
  .search-section       — 查询区域（固定两行）
    .search-row [第一行] — 操作内容 | 操作类型 | 操作者 | IP地址
    .search-row [第二行] — 操作时间 | 查询按钮 | 重置按钮
  .table-section        — 表格 + 分页
    el-table            — 数据表格（stripe）
    UnifiedPagination   — 分页组件
```

## 查询区域布局

采用两行 flex 布局，每行独立一个 `.search-row` 容器：

### 第一行

| 字段 | 组件 | flex 比例 |
|------|------|-----------|
| 操作内容 | el-input | flex:1 |
| 操作类型 | el-select（"全部类型"） | flex:1 |
| 操作者 | el-input | flex:1 |
| IP地址 | el-input | flex:1 |

### 第二行

| 字段 | 组件 | flex 比例 |
|------|------|-----------|
| 操作时间 | el-date-picker (daterange) | flex:2 |
| 查询按钮 | el-button type="primary" | flex-shrink:0 |
| 重置按钮 | el-button | flex-shrink:0 |

### 响应行为

- `.search-row` 使用 `display:flex; gap:16px; align-items:center`
- 字段使用 `flex:1; min-width:0`（第一行）或 `flex:2`（时间选择器）
- 按钮使用 `flex-shrink:0` 保持固定宽度
- 侧边栏收缩/展开时，外层容器宽度变化，flex 子项自动等比缩放，两行布局不变

## 表格列

| 列名 | 字段 | 宽度 |
|------|------|------|
| 流水号 | serialNo | auto |
| 操作内容 | content | auto |
| 操作类型 | type | auto |
| 操作者 | operator | auto |
| 操作者角色 | operatorRole | auto |
| 操作者IP地址 | operatorIp | auto |
| 操作时间 | operationTime | auto |

表格使用 `stripe` 斑马纹，表头背景 `#f8fafc`，与项目现有表格风格一致。

## Mock 数据

内联硬编码数组，每条记录包含以上 7 个字段。提供约 360 条模拟数据用于分页测试。

## 分页

使用 UnifiedPagination 组件，配置：
- total: 360
- page-size options: 10/20/50/100
- 默认每页 10 条

## 样式约定

- 遵循项目 scoped CSS 模式，不使用 Tailwind 工具类
- 颜色：主蓝 `#2196f3`，文字 `#333`/`#606266`，边框 `#e4e7ed`
- 重置按钮：背景 `#f0f2f5`，边框 `1px solid #dcdfe6`
- 表格单元格 padding: `12px 0`

## 文件变更

- `src/views/LogList.vue` — 从空壳重写为完整页面
