# 顶部导航标签页与侧边栏联动设计

## 背景

当前项目中，顶部导航栏的标签页和左侧菜单栏是独立运作的。点击顶部标签页切换页面时，侧边栏不会同步高亮对应的菜单项，也不会自动展开对应的父菜单。这导致用户无法通过侧边栏直观了解当前所在页面的位置。

## 目标

当用户点击顶部导航标签页打开页面时，侧边栏应：
1. **高亮**对应的菜单项
2. **自动展开**该菜单项所属的父菜单（sub-menu）
3. 侧边栏处于折叠状态时，保持折叠不变，不做额外行为

## 技术方案

### 修改文件

仅修改 `src/components/Sidebar.vue`。

### 具体改动

#### 1. `activeMenu` 从 ref 改为 computed

**现状：**
```js
const activeMenu = ref(route.path)
```

初始化后不会随路由变化更新。

**改为：**
```js
const activeMenu = computed(() => route.path)
```

使 `default-active` 随路由变化自动更新高亮状态。

#### 2. 新增 `defaultOpeneds` 计算属性

根据当前路由路径，自动推导需要展开的父菜单路径列表。

算法逻辑：
- 从 `route.path` 中提取前缀路径
- 在 `menuList` 中查找哪些 `path` 前缀匹配当前路由
- 返回匹配到的 sub-menu path 列表

示例：
| 当前路由 | 展开的菜单 |
|---------|-----------|
| `/system/overview` | `['/system']` |
| `/data/realtime/call` | `['/data', '/data/realtime']` |
| `/cdr/billing` | `['/cdr']` |
| `/dashboard` | `[]`（无对应菜单） |

#### 3. el-menu 绑定 default-openeds

在 `<el-menu>` 上添加 `:default-openeds="defaultOpeneds"`。

### 不改动的部分

- **Layout.vue**：无需改动。标签页点击已通过 `router.push` 改变路由，Sidebar 的 computed 会自动响应。
- **菜单数据结构**：保持不变。
- **折叠行为**：侧边栏折叠状态不受影响。
- **`router` 属性**：el-menu 的路由功能保持不变。

## 边界情况

- `/dashboard` 路由在侧边栏中无对应菜单项，不高亮任何菜单
- 侧边栏折叠时点击标签页，侧边栏保持折叠状态
- 关闭标签页后跳转到其他页面，侧边栏自动更新高亮和展开状态
- `unique-opened` 属性保持不变，同一时间只展开一个父菜单组

## 验证方式

1. 点击顶部标签页切换不同页面，确认侧边栏高亮正确跟随
2. 确认多级菜单（如数据监管 > 实时监控 > 呼叫监控）的父菜单能正确展开
3. 确认 Dashboard 页面不高亮任何菜单项
4. 确认折叠状态下点击标签页无异常行为
5. 确认通过侧边栏点击菜单导航时，功能不受影响
