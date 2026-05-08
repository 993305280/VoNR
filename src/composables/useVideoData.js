import { ref, reactive } from 'vue'

// 模拟视频数据
const generateMockData = () => [
  {
    id: '001',
    name: '宽带套餐活动视频材料',
    thumbnail: '/video/thumb1.jpg',
    duration: '01:52',
    resolution: '1920 × 1080',
    bitrate: '128 kbps',
    format: 'mp4',
    size: '8.88 M',
    auditTag: '编辑',
    syncStatus: '审核失败',
    availableStatus: '可用',
    description: '这是说明这是说明',
    updateTime: '2024-03-25 10:00:00',
    url: '/video/demo1.mp4'
  },
  {
    id: '002',
    name: '青年志愿者服务日',
    thumbnail: '/video/thumb2.jpg',
    duration: '00:49',
    resolution: '1920 × 1080',
    bitrate: '128 kbps',
    format: 'mp4',
    size: '10.26 M',
    auditTag: '编辑',
    syncStatus: '同步中',
    availableStatus: '可用',
    description: '这是说明这是说明这里...',
    updateTime: '2024-03-25 10:00:00',
    url: '/video/demo2.mp4'
  },
  {
    id: '003',
    name: '宽带套餐活动视频材料',
    thumbnail: '/video/thumb3.jpg',
    duration: '01:25',
    resolution: '1080 × 1920',
    bitrate: '128 kbps',
    format: 'mp4',
    size: '8.88 M',
    auditTag: '编辑',
    syncStatus: '审核中',
    availableStatus: '可用',
    description: '这是说明这是说明',
    updateTime: '2024-03-25 10:00:00',
    url: '/video/demo3.mp4'
  },
  {
    id: '004',
    name: '青年志愿者服务日',
    thumbnail: '/video/thumb4.jpg',
    duration: '00:43',
    resolution: '720 × 720',
    bitrate: '128 kbps',
    format: 'mp4',
    size: '10.26 M',
    auditTag: '新增',
    syncStatus: '同步成功',
    availableStatus: '可用',
    description: '这是说明这是说明这里...',
    updateTime: '2024-03-25 10:00:00',
    url: '/video/demo4.mp4'
  },
  {
    id: '005',
    name: '宽带套餐活动视频材料',
    thumbnail: '/video/thumb5.jpg',
    duration: '01:52',
    resolution: '1920 × 1080',
    bitrate: '128 kbps',
    format: 'mp4',
    size: '8.88 M',
    auditTag: '删除',
    syncStatus: '审核中',
    availableStatus: '可用',
    description: '这是说明这是说明',
    updateTime: '2024-03-25 10:00:00',
    url: '/video/demo5.mp4'
  },
  {
    id: '006',
    name: '宽带套餐活动视频材料',
    thumbnail: '/video/thumb6.jpg',
    duration: '01:52',
    resolution: '1920 × 1080',
    bitrate: '128 kbps',
    format: 'mp4',
    size: '8.88 M',
    auditTag: '编辑',
    syncStatus: '审核成功',
    availableStatus: '可用',
    description: '这是说明这是说明',
    updateTime: '2024-03-25 10:00:00',
    url: '/video/demo6.mp4'
  },
  {
    id: '007',
    name: '宽带套餐活动视频材料',
    thumbnail: '/video/thumb7.jpg',
    duration: '01:52',
    resolution: '1920 × 1080',
    bitrate: '128 kbps',
    format: 'mp4',
    size: '8.88 M',
    auditTag: '新增',
    syncStatus: '同步中',
    availableStatus: '可用',
    description: '这是说明这是说明',
    updateTime: '2024-03-25 10:00:00',
    url: '/video/demo7.mp4'
  },
  {
    id: '008',
    name: '青年志愿者服务日',
    thumbnail: '/video/thumb8.jpg',
    duration: '00:49',
    resolution: '1920 × 1080',
    bitrate: '128 kbps',
    format: 'mp4',
    size: '10.26 M',
    auditTag: '编辑',
    syncStatus: '同步失败',
    availableStatus: '可用',
    description: '这是说明这是说明这里...',
    updateTime: '2024-03-25 10:00:00',
    url: '/video/demo8.mp4'
  },
  {
    id: '009',
    name: '宽带套餐活动视频材料',
    thumbnail: '/video/thumb9.jpg',
    duration: '01:25',
    resolution: '1080 × 1920',
    bitrate: '128 kbps',
    format: 'mp4',
    size: '8.88 M',
    auditTag: '编辑',
    syncStatus: '审核中',
    availableStatus: '可用',
    description: '这是说明这是说明',
    updateTime: '2024-03-25 10:00:00',
    url: '/video/demo9.mp4'
  },
  {
    id: '010',
    name: '青年志愿者服务日',
    thumbnail: '/video/thumb10.jpg',
    duration: '00:43',
    resolution: '720 × 720',
    bitrate: '128 kbps',
    format: 'mp4',
    size: '10.26 M',
    auditTag: '新增',
    syncStatus: '同步成功',
    availableStatus: '可用',
    description: '这是说明这是说明这里...',
    updateTime: '2024-03-25 10:00:00',
    url: '/video/demo10.mp4'
  }
]

export function useVideoData() {
  const tableData = ref(generateMockData())
  const loading = ref(false)
  const total = ref(360)
  const currentPage = ref(1)
  const pageSize = ref(10)

  const searchForm = reactive({
    name: '',
    auditStatus: '',
    useStatus: ''
  })

  const selectedRows = ref([])

  // 搜索
  const handleSearch = () => {
    loading.value = true
    setTimeout(() => {
      loading.value = false
    }, 500)
  }

  // 重置
  const handleReset = () => {
    searchForm.name = ''
    searchForm.auditStatus = ''
    searchForm.useStatus = ''
    handleSearch()
  }

  // 分页
  const handlePageChange = (page) => {
    currentPage.value = page
    handleSearch()
  }

  const handleSizeChange = (size) => {
    pageSize.value = size
    currentPage.value = 1
    handleSearch()
  }

  // 选择
  const handleSelectionChange = (rows) => {
    selectedRows.value = rows
  }

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedRows.value.length === 0) return
    console.log('批量删除:', selectedRows.value)
  }

  // 同步
  const handleSync = () => {
    console.log('同步素材')
  }

  return {
    tableData,
    loading,
    total,
    currentPage,
    pageSize,
    searchForm,
    selectedRows,
    handleSearch,
    handleReset,
    handlePageChange,
    handleSizeChange,
    handleSelectionChange,
    handleBatchDelete,
    handleSync
  }
}
