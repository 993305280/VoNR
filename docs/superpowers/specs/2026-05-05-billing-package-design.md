# 计费套餐页面设计

## 概述

实现 CDR 管理下的「计费套餐」子菜单页面，提供计费套餐的增删改查功能。单文件实现（方案A），与项目中 UserList.vue 风格一致。

## 技术选型

- Vue 3 `<script setup>` + Composition API
- Element Plus 组件库（el-table, el-dialog, el-form 等）
- Tailwind CSS 辅助布局
- Mock 数据内联硬编码，无后端 API

## 页面结构

### 1. 标题栏

- 左侧：页面标题 "计费套餐"
- 右侧：两个操作按钮
  - "+ 新增计费套餐"（el-button type="primary"）
  - "删除计费套餐"（el-button type="danger"，批量删除）

### 2. 搜索区

- 计费套餐名称：el-input，placeholder "请输入"
- 查询按钮：el-button type="primary"
- 重置按钮：el-button

### 3. 数据表格

| 列名 | 字段 | 宽度 | 说明 |
|------|------|------|------|
| 复选框 | selection | 40px | 多选列 |
| 计费ID | billingId | auto | 唯一标识 |
| 计费套餐名称 | billingName | auto | — |
| 计费方式 | billingType | auto | 显示"按次"或"按时长" |
| 费用 | cost + unit | auto | 格式如"5 元/小时" |
| 计费说明 | description | auto | 超长文本省略显示 |
| 操作时间 | operationTime | auto | 格式: YYYY-MM-DD HH:mm:ss |
| 操作者 | operator | auto | 如 "admin@VoNR" |
| 操作 | — | 120px | "编辑"和"删除"链接按钮 |

### 4. 分页

使用 `<UnifiedPagination :total="360" />` 组件。

### 5. 新增/编辑弹框

共用一个 `el-dialog`，通过 `isEdit` 标志切换模式。

表单字段：

| 字段 | 组件 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| 计费套餐名称 | el-input | 是 | 空 | — |
| 计费方式 | el-radio-group | 是 | 按次 | 选项：按次 / 按时长 |
| 费用 | el-input-number | 是 | 空 | 配合右侧单位选择 |
| 费用单位（按次） | 静态文本 | — | "元/次" | 固定不可选 |
| 费用单位（按时长） | el-select | — | "元/分钟" | 选项：元/分钟 / 元/小时 |
| 计费说明 | el-input textarea | 否 | 空 | — |

弹框标题：新增时 "新增计费套餐"，编辑时 "编辑计费套餐"
底部按钮：取消 + 保存

### 6. 删除确认弹框

共用一个 `el-dialog`，通过 `isBatchDelete` 标志区分单条/批量。

- **单条删除**：标题 "删除计费"，正文 "是否删除此计费？"，红色警告 "删除后，关联此计费的业务配置将不再按此计费方式计费，请谨慎操作！"
- **批量删除**：标题 "批量删除计费"，正文 "是否删除所选计费？"，红色警告 "删除后，关联所选计费的业务配置将不再按所选计费方式计费，请谨慎操作！"
- 底部按钮：取消 + 删除（蓝色）

## 数据模型

```js
{
  billingId: 'JF00526314',     // 计费ID
  billingName: '趣味通话计费',   // 计费套餐名称
  billingType: '按时长',        // 按次 | 按时长
  cost: 5,                      // 费用数值
  unit: '元/小时',              // 元/次 | 元/分钟 | 元/小时
  description: '这是说明...',    // 计费说明
  operationTime: '2024-03-25 10:00:00',  // 操作时间
  operator: 'admin@VoNR'       // 操作者
}
```

## 交互逻辑

### 搜索与重置
- 查询：前端过滤 tableData，按 billingName 模糊匹配
- 重置：清空搜索框，恢复全部数据

### 新增
1. 点击 "+ 新增计费套餐" → 打开弹框（isEdit=false）
2. 填写表单 → 校验通过 → 生成随机 billingId（格式: "JF" + 8位随机数字，如 "JF00526314"），操作时间为当前时间，操作者固定 "admin@VoNR"
3. 插入 tableData 首位，关闭弹框，提示成功

### 编辑
1. 点击行内 "编辑" → 打开弹框（isEdit=true），回填当前行数据
2. 修改后校验通过 → 更新 tableData 中对应行
3. 关闭弹框，提示成功

### 单条删除
1. 点击行内 "删除" → 打开删除确认弹框（isBatchDelete=false）
2. 确认 → 从 tableData 中 splice 移除，提示成功

### 批量删除
1. 勾选表格行 → 点击 "删除计费套餐" 按钮
2. 未选中任何行时提示 "请先选择要删除的记录"
3. 选中后打开批量删除确认弹框（isBatchDelete=true）
4. 确认 → 移除所有选中行，提示成功

## 表单校验规则

- 计费套餐名称：必填，`[{ required: true, message: '请输入计费套餐名称', trigger: 'blur' }]`
- 费用：必填，`[{ required: true, message: '请输入费用', trigger: 'blur' }]`

## 文件变更

- 修改：`src/views/BillingPackage.vue`（从占位页替换为完整实现）

## Mock 数据

内联 10 条硬编码数据，包含"按次"和"按时长"两种类型，与设计图中的示例数据风格一致。
