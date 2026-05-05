# Top Nav Tab Navigation Design

## Overview

Transform the current top-nav bar into a browser-style tab navigation system. Each opened page becomes a tab, pages are kept alive when switching, and tabs can be closed individually or in bulk.

## Requirements

1. Clicking a sidebar menu item adds a new tab (or switches to existing tab if already open)
2. Clicking the close button (×) on a tab closes it
3. Page state is preserved when switching between tabs (keep-alive)
4. Right-click context menu on tabs: close current, close others, close all
5. When all tabs are closed, redirect to Dashboard

## Architecture

### State Management (Layout.vue)

```
tabs: ref([{ path, title }])    -- array of open tabs
activeTab: ref(path)             -- currently active tab path
```

- `pageTitleMap` (existing) provides route name → title mapping
- On route change: add tab if new, or just switch activeTab

### Route Listener

```
watch(route.path, (newPath) => {
  activeTab.value = newPath
  if (!tabs.value.find(t => t.path === newPath)) {
    tabs.value.push({ path: newPath, title: pageTitleMap[route.name] })
  }
})
```

### Tab Close Logic

- **Close current**: Remove tab, navigate to adjacent tab (prev or next); if empty, navigate to `/dashboard`
- **Close others**: Keep current + Dashboard, remove rest
- **Close all**: Clear all tabs, navigate to `/dashboard`

### Page Keep-Alive

```html
<keep-alive>
  <router-view />
</keep-alive>
```

### UI Layout

- **Left**: Hamburger menu icon, back arrow, home icon
- **Center**: Tab list — each tab shows title + × close button; active tab has blue background
- **Right**: Overflow menu (>>) + close current tab button

### Right-Click Context Menu

On tab right-click, show a context menu with three options:
- 关闭当前标签页
- 关闭其他标签页
- 关闭全部标签页

## Files to Modify

- `src/views/Layout.vue` — main changes: tab state, tab bar template, keep-alive, close logic
- `src/components/Sidebar.vue` — no structural changes needed, el-menu with `router` prop handles navigation

## Out of Scope

- Tab overflow handling (scrolling when too many tabs)
- Drag-and-drop tab reordering
- Tab persistence across page refresh (localStorage)
