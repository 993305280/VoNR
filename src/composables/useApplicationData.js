import { ref, reactive, computed } from 'vue'

export function useApplicationData() {
  const loading = ref(false)
  const currentSyncing = ref(false)
  const tableData = ref([])
  const total = ref(0)

  const searchParams = reactive({
    name: '',
    auditStatus: '',
    availableStatus: ''
  })

  const pagination = reactive({
    current: 1,
    pageSize: 10
  })

  const TOTAL_MOCK = 360

  const generateMockData = (page, pageSize) => {
    const start = (page - 1) * pageSize
    const end = Math.min(start + pageSize, TOTAL_MOCK)

    const data = []
    for (let i = start; i < end; i++) {
      const idNum = 100001 + i
      const hasMultiple = i % 3 !== 0

      const subScenes = hasMultiple
        ? [
            { code: `001001`, name: '虚拟背景' },
            { code: `001002`, name: '虚拟头像' },
            { code: `001003`, name: '通话特效' }
          ]
        : [{ code: `001001`, name: '虚拟背景' }]

      data.push({
        id: String(idNum),
        name: ['视频通话', '语音通话', '即时通讯', '会议系统', '直播推流'][i % 5],
        businessScene: ['基础场景', '娱乐场景', '教育场景', '医疗场景'][i % 4],
        subScenes,
        auditStatus: ['sync_success', 'pending', 'approved', 'rejected'][i % 4],
        auditStatusText: ['【新增】同步成功', '待审核', '审核通过', '审核失败'][i % 4],
        availableStatus: i % 5 === 0 ? 'unavailable' : 'available',
        availableStatusText: i % 5 === 0 ? '不可用' : '可用',
        description: `这是一个${['视频通话', '语音通话', '即时通讯', '会议系统', '直播推流'][i % 5]}应用，支持多种场景切换，提供高质量的用户体验。`
      })
    }

    return data
  }

  const fetchTableData = () => {
    loading.value = true
    setTimeout(() => {
      let data = generateMockData(pagination.current, pagination.pageSize)

      if (searchParams.name) {
        data = data.filter(item => item.name.includes(searchParams.name))
      }
      if (searchParams.auditStatus) {
        data = data.filter(item => item.auditStatus === searchParams.auditStatus)
      }
      if (searchParams.availableStatus) {
        data = data.filter(item => item.availableStatus === searchParams.availableStatus)
      }

      tableData.value = data
      total.value = searchParams.name || searchParams.auditStatus || searchParams.availableStatus
        ? data.length
        : TOTAL_MOCK

      loading.value = false
    }, 300)
  }

  const handleSearch = () => {
    pagination.current = 1
    fetchTableData()
  }

  const handleReset = () => {
    searchParams.name = ''
    searchParams.auditStatus = ''
    searchParams.availableStatus = ''
    pagination.current = 1
    fetchTableData()
  }

  const handlePageChange = (page) => {
    pagination.current = page
    fetchTableData()
  }

  const handlePageSizeChange = (size) => {
    pagination.pageSize = size
    pagination.current = 1
    fetchTableData()
  }

  const handleSync = () => {
    currentSyncing.value = true
    setTimeout(() => {
      currentSyncing.value = false
      fetchTableData()
    }, 1500)
  }

  const handleDelete = (ids) => {
    if (Array.isArray(ids)) {
      // 批量删除
      for (const id of ids) {
        const index = tableData.value.findIndex(item => item.id === id)
        if (index > -1) {
          tableData.value.splice(index, 1)
        }
      }
      total.value = Math.max(0, total.value - ids.length)
    } else {
      // 单个删除
      const index = tableData.value.findIndex(item => item.id === ids)
      if (index > -1) {
        tableData.value.splice(index, 1)
        total.value = Math.max(0, total.value - 1)
      }
    }
  }

  const handleEdit = (id) => {
    console.log('编辑应用:', id)
  }

  fetchTableData()

  return {
    tableData,
    loading,
    total,
    currentSyncing,
    searchParams,
    pagination,
    fetchTableData,
    handleSearch,
    handleReset,
    handlePageChange,
    handlePageSizeChange,
    handleSync,
    handleDelete,
    handleEdit
  }
}
