# 呼叫记录数量统计 - 后端对接设计

## 概述

将呼叫记录数量统计页面从 mock 数据切换为真实后端 API。需要创建 `call_records` 数据表、种子数据、后端统计聚合 API，以及前端 API 对接。

## 数据库设计

### call_records 表

```sql
CREATE TABLE IF NOT EXISTS call_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  call_id VARCHAR(50) NOT NULL COMMENT '通话标识',
  caller_number VARCHAR(20) NOT NULL COMMENT '主叫号码',
  callee_number VARCHAR(20) NOT NULL COMMENT '被叫号码',
  app_id VARCHAR(50) COMMENT '应用ID',
  call_direction ENUM('uplink', 'downlink') COMMENT '通话方向',
  call_type ENUM('audio', 'video') COMMENT '通话类型',
  start_time DATETIME NOT NULL COMMENT '开始时间',
  end_time DATETIME COMMENT '结束时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_start_time (start_time),
  INDEX idx_app_id (app_id)
);
```

字段说明：
- `call_id`: 通话唯一标识，格式如 `FW25518064`
- `caller_number` / `callee_number`: 主被叫号码
- `app_id`: 关联应用 ID
- `call_direction`: 上行(uplink)/下行(downlink)
- `call_type`: 音频(audio)/视频(video)
- `start_time` / `end_time`: 通话起止时间，用于时间范围筛选和聚合

### 索引设计

- `idx_start_time`: 统计查询的核心过滤和分组字段
- `idx_app_id`: 支持按应用筛选（预留）

## 种子数据

生成约 10000 条通话记录，时间跨度覆盖最近 12 个月：

- 时间分布：最近 365 天内随机分布
- 号码格式：11 位手机号码
- 通话方向：均匀分布 uplink/downlink
- 通话类型：70% audio，30% video
- 通话时长：10秒 ~ 30分钟随机
- call_id：前缀 FW + 随机 8 位数字

脚本位置：`serverProject/scripts/seed-call-records.js`

## 后端 API

### GET `/api/v1/statistics/call-count`

**认证**: 需要 JWT token（authMiddleware）

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| timeRange | string | 是 | today / month / year / custom |
| granularity | string | 是 | hour / day / month |
| startDate | string | 否 | custom 时的开始日期 (YYYY-MM-DD) |
| endDate | string | 否 | custom 时的结束日期 (YYYY-MM-DD) |

**响应**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "xData": ["00:00", "01:00", ...],
    "yData": [120, 345, ...]
  }
}
```

**SQL 聚合逻辑**:

根据 timeRange 确定查询的时间范围，根据 granularity 确定分组方式：

| granularity | DATE_FORMAT 格式 | X 轴标签格式 |
|-------------|-------------------|--------------|
| hour | `%Y-%m-%d %H:00` | `HH:00` |
| day | `%Y-%m-%d` | `MM-DD` |
| month | `%Y-%m` | `M月` |

**时间范围计算**:

| timeRange | 开始时间 | 结束时间 |
|-----------|---------|---------|
| today | 今天 00:00:00 | 今天 23:59:59 |
| month | 本月 1 日 00:00:00 | 本月最后一天 23:59:59 |
| year | 今年 1 月 1 日 00:00:00 | 今年 12 月 31 日 23:59:59 |
| custom | startDate 00:00:00 | endDate 23:59:59 |

**特殊处理**:
- 缺少数据的时间段补零（如某小时无通话，yData 对应位置为 0）
- custom 模式下如果 startDate/endDate 缺失，返回错误

### 文件结构

```
serverProject/
├── models/
│   └── callRecordModel.js          # 新建：查询和聚合方法
├── controllers/
│   └── statisticsController.js     # 新建：统计接口控制器
├── routes/
│   └── statistics.js               # 新建：统计路由
├── scripts/
│   └── seed-call-records.js        # 新建：种子数据脚本
└── init-db.js                      # 修改：添加 call_records 建表语句
```

## 前端改动

### 新建 src/api/statistics.js

```javascript
import request from '@/utils/request'

export function getCallCountStats(params) {
  return request.get('/statistics/call-count', { params })
}
```

### 修改 CallCountStats.vue

将 `fetchData()` 中的 mock 数据替换为 API 调用：

```javascript
import { getCallCountStats } from '@/api/statistics'

async function fetchData() {
  try {
    const params = {
      timeRange: timeRange.value,
      granularity: granularity.value
    }
    if (timeRange.value === 'custom' && customDateRange.value?.length === 2) {
      params.startDate = customDateRange.value[0]
      params.endDate = customDateRange.value[1]
    }
    const response = await getCallCountStats(params)
    chartData.xData = response.data.xData
    chartData.yData = response.data.yData
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}
```

## 测试计划

1. 运行种子脚本，确认数据写入成功
2. 启动后端，用 curl/Postman 测试统计 API 各种 timeRange + granularity 组合
3. 启动前端，验证 CallCountStats 页面图表正确展示
4. 测试筛选联动：切换时间范围和粒度，确认图表实时更新
5. 测试边界情况：无数据的时间段、自定义日期范围
