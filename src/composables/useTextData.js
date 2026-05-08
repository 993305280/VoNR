import { ref, reactive } from 'vue'

// Mock 数据 - 覆盖各种审核状态组合
const generateMockData = () => [
  { id: '001', name: '清明节通知', content: '【广州市民政局、市应急管理局】提醒您：清明节祭扫高峰期，各墓园（骨灰楼）的人流量大，建议广大...', contentLength: 95, auditTag: '新增', syncStatus: '同步中', availableStatus: '不可用', description: '这是说明这是说明', updateTime: '2024-03-25 10:00:00', operator: 'admin@VoNR' },
  { id: '002', name: '反诈提醒', content: '近期有不法分子以优惠充值为幌子，诱导客户在非正规渠道进行话费充值，实际到账话费资金来源不明...', contentLength: 92, auditTag: '编辑', syncStatus: '审核中', availableStatus: '不可用', description: '这是说明这是说明', updateTime: '2024-03-25 10:00:00', operator: 'admin@VoNR' },
  { id: '003', name: '清明节通知', content: '【广州市民政局、市应急管理局】提醒您：清明节祭扫高峰期，各墓园（骨灰楼）的人流量大，建议广大...', contentLength: 95, auditTag: '编辑', syncStatus: '审核成功', availableStatus: '可用', description: '这是说明这是说明', updateTime: '2024-03-25 10:00:00', operator: 'admin@VoNR' },
  { id: '004', name: '反诈提醒', content: '近期有不法分子以优惠充值为幌子，诱导客户在非正规渠道进行话费充值，实际到账话费资金来源不明...', contentLength: 92, auditTag: '新增', syncStatus: '同步失败', availableStatus: '可用', description: '这是说明这是说明', updateTime: '2024-03-25 10:00:00', operator: 'admin@VoNR' },
  { id: '005', name: '清明节通知', content: '【广州市民政局、市应急管理局】提醒您：清明节祭扫高峰期，各墓园（骨灰楼）的人流量大，建议广大...', contentLength: 95, auditTag: '编辑', syncStatus: '审核成功', availableStatus: '可用', description: '这是说明这是说明', updateTime: '2024-03-25 10:00:00', operator: 'admin@VoNR' },
  { id: '006', name: '反诈提醒', content: '近期有不法分子以优惠充值为幌子，诱导客户在非正规渠道进行话费充值，实际到账话费资金来源不明...', contentLength: 92, auditTag: '编辑', syncStatus: '审核成功', availableStatus: '可用', description: '这是说明这是说明', updateTime: '2024-03-25 10:00:00', operator: 'admin@VoNR' },
  { id: '007', name: '清明节通知', content: '【广州市民政局、市应急管理局】提醒您：清明节祭扫高峰期，各墓园（骨灰楼）的人流量大，建议广大...', contentLength: 95, auditTag: '编辑', syncStatus: '审核成功', availableStatus: '可用', description: '这是说明这是说明', updateTime: '2024-03-25 10:00:00', operator: 'admin@VoNR' },
  { id: '008', name: '反诈提醒', content: '近期有不法分子以优惠充值为幌子，诱导客户在非正规渠道进行话费充值，实际到账话费资金来源不明...', contentLength: 92, auditTag: '编辑', syncStatus: '审核成功', availableStatus: '可用', description: '这是说明这是说明', updateTime: '2024-03-25 10:00:00', operator: 'admin@VoNR' },
  { id: '009', name: '清明节通知', content: '【广州市民政局、市应急管理局】提醒您：清明节祭扫高峰期，各墓园（骨灰楼）的人流量大，建议广大...', contentLength: 95, auditTag: '新增', syncStatus: '审核成功', availableStatus: '可用', description: '这是说明这是说明', updateTime: '2024-03-25 10:00:00', operator: 'admin@VoNR' },
  { id: '010', name: '反诈提醒', content: '近期有不法分子以优惠充值为幌子，诱导客户在非正规渠道进行话费充值，实际到账话费资金来源不明...', contentLength: 92, auditTag: '编辑', syncStatus: '审核成功', availableStatus: '可用', description: '这是说明这是说明', updateTime: '2024-03-25 10:00:00', operator: 'admin@VoNR' },
]

export function useTextData() {
  const tableData = ref(generateMockData())
  const loading = ref(false)
  const total = ref(360)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const selectedRows = ref([])

  const searchForm = reactive({
    name: '',
    auditStatus: '',
    useStatus: ''
  })

  const handlePageChange = (page) => {
    currentPage.value = page
  }

  const handleSizeChange = (size) => {
    pageSize.value = size
    currentPage.value = 1
  }

  const handleSelectionChange = (selection) => {
    selectedRows.value = selection
  }

  const handleSearch = () => {
    console.log('搜索:', searchForm)
    return { success: true, data: tableData.value }
  }

  const handleReset = () => {
    searchForm.name = ''
    searchForm.auditStatus = ''
    searchForm.useStatus = ''
  }

  const handleSync = () => {
    console.log('同步素材')
    return { success: true, message: '同步成功' }
  }

  const handleBatchDelete = () => {
    if (selectedRows.value.length === 0) {
      return { success: false, message: '请先选择要删除的文本素材' }
    }
    return { success: true, count: selectedRows.value.length }
  }

  return {
    tableData,
    loading,
    total,
    currentPage,
    pageSize,
    selectedRows,
    searchForm,
    handlePageChange,
    handleSizeChange,
    handleSelectionChange,
    handleSearch,
    handleReset,
    handleSync,
    handleBatchDelete
  }
}
