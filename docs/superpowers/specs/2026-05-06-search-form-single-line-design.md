# 搜索表单单行布局设计规格

## 概述

全局修复：侧边栏收缩/展开时，所有页面的搜索条件和按钮始终保持在同一行，不换行。

## 问题

Element Plus `el-form :inline="true"` 默认 `flex-wrap: wrap`，当容器宽度变化时表单项会换行。

## 解决方案

在 `src/styles/main.css` 添加全局 CSS 规则：

```css
.el-form--inline {
  flex-wrap: nowrap !important;
}
.el-form--inline .el-form-item {
  flex-shrink: 1;
  min-width: 0;
}
```

## 影响页面

| 页面 | 筛选项数量 | 当前状态 |
|------|-----------|---------|
| ChargesDetail | 5 | 已单行，确认保持 |
| BillingPackage | 2 | 已单行，确认保持 |
| UserList | 3 | 已单行，确认保持 |
| Overview | 4 | 已单行，确认保持 |
| BusinessConfiguration | 5 | 当前两行，需改为一行 |
| ApplicationManagement | 4 | 已单行，确认保持 |

## BusinessConfiguration 特殊处理

该页面当前使用两个 `.search-row` div 分两行。需移除行分隔，让所有表单项在同一行显示。

## 不包含

- 不修改各页面的 scoped CSS
- 不引入新的组件或抽象
- 不改变搜索功能逻辑
