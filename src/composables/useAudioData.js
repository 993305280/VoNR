import { ref, reactive } from 'vue'

export function useAudioData() {
  const tableData = ref([])
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

  const generateMockData = (page, size) => {
    const start = (page - 1) * size
    const end = Math.min(start + size, 360)
    const durations = ['00:56', '01:20', '02:15', '00:45', '01:08', '03:22', '00:33', '01:47', '02:58', '01:05']
    const bitrates = ['128 kbps', '96 kbps', '160 kbps']
    const auditTags = ['新增', '编辑', '删除']
    const syncStatuses = ['同步中', '同步成功', '同步失败', '审核中', '审核成功', '审核失败']
    const sizes = ['1.02 M', '980 KB', '1.15 M', '856 KB', '1.08 M']

    const data = []
    for (let i = start; i < end; i++) {
      const idNum = (i + 1) % 10 === 0 ? 10 : (i + 1) % 10
      data.push({
        id: String(idNum).padStart(3, '0'),
        name: '音频文件名称音频文件名称',
        duration: durations[i % durations.length],
        bitrate: bitrates[i % bitrates.length],
        format: 'mp3',
        size: sizes[i % sizes.length],
        auditTag: auditTags[i % auditTags.length],
        syncStatus: syncStatuses[i % syncStatuses.length],
        availableStatus: '可用',
        description: '这是说明这是说明这里...',
        updateTime: '2024-03-25 10:00:00',
        operator: 'admin@VoNR',
        url: `/audio/demo${i + 1}.mp3`
      })
    }
    return data
  }

  const fetchTableData = () => {
    loading.value = true
    setTimeout(() => {
      let data = generateMockData(currentPage.value, pageSize.value)

      if (searchForm.name) {
        data = data.filter(item => item.name.includes(searchForm.name))
      }
      if (searchForm.auditStatus) {
        data = data.filter(item => item.auditTag === searchForm.auditStatus)
      }
      if (searchForm.useStatus) {
        data = data.filter(item => item.availableStatus === searchForm.useStatus)
      }

      tableData.value = data
      total.value = searchForm.name || searchForm.auditStatus || searchForm.useStatus
        ? data.length
        : 360
      loading.value = false
    }, 300)
  }

  const handleSearch = () => {
    currentPage.value = 1
    fetchTableData()
  }

  const handleReset = () => {
    searchForm.name = ''
    searchForm.auditStatus = ''
    searchForm.useStatus = ''
    handleSearch()
  }

  const handlePageChange = (page) => {
    currentPage.value = page
    fetchTableData()
  }

  const handleSizeChange = (size) => {
    pageSize.value = size
    currentPage.value = 1
    fetchTableData()
  }

  const handleSelectionChange = (rows) => {
    selectedRows.value = rows
  }

  const handleBatchDelete = () => {
    console.log('批量删除:', selectedRows.value)
  }

  const handleSync = () => {
    console.log('同步操作')
  }

  fetchTableData()

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
