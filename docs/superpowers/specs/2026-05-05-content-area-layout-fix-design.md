# content-area 撑满剩余空间 + 子页面滚动修复

## 问题

1. 子页面使用 `min-height: 100vh`（视口高度）强制撑开，导致 content-area 被撑大或出现双重滚动条
2. content-area 高度链断裂，高度未正确传递给子组件

## 根因

- `100vh` 测量的是整个浏览器视口，而非 `.content-area` 的可用空间
- 子页面撑到视口高度后，`.content-area` 的 `overflow: auto` 滚动行为被破坏

## 修改方案

### 1. 修复子页面的 vh 问题

| 文件 | 行号 | 原值 | 新值 |
|------|------|------|------|
| `src/views/BusinessConfiguration.vue` | 164 | `min-height: 100vh` | `min-height: 100%` |
| `src/views/SceneConfiguration.vue` | 107 | `min-height: 100vh` | `min-height: 100%` |
| `src/views/UserList.vue` | 2 | 移除 `min-h-screen` 类 | - |
| `src/views/Dashboard.vue` | 131 | `min-height: 83vh` | `min-height: 100%` |

### 2. content-area 加 min-height: 0

在 `src/views/Layout.vue` 的 `.content-area` 样式中添加 `min-height: 0`，确保 flex 子元素能正确计算高度。

## 效果

- content-area 正确占满 header + top-nav 下方的全部剩余空间
- 子页面内容超出时，content-area 出现独立滚动条
- 子页面内容较少时，content-area 仍然撑满剩余空间
