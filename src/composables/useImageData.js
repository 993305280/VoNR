import { ref, reactive } from 'vue'
import { getImageList, batchDeleteImages } from '@/api/image'
import { ElMessage } from 'element-plus'

export function useImageData() {
  const tableData = ref([])
  const loading = ref(false)
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const selectedRows = ref([])

  const searchForm = reactive({
    name: '',
    auditStatus: '',
    useStatus: ''
  })

  const fetchTableData = async () => {
    loading.value = true
    try {
      const params = {
        page: currentPage.value,
        pageSize: pageSize.value
      }
      if (searchForm.name) params.name = searchForm.name
      if (searchForm.auditStatus) params.auditStatus = searchForm.auditStatus
      if (searchForm.useStatus !== '') params.available = searchForm.useStatus === '可用' ? 1 : 0

      const res = await getImageList(params)
      tableData.value = res.data.list
      total.value = res.data.total
    } catch (error) {
      console.error('获取图片列表失败:', error)
      ElMessage.error('获取图片列表失败')
    } finally {
      loading.value = false
    }
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

  const handleBatchDelete = async () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请先选择要删除的图片')
      return false
    }

    try {
      const ids = selectedRows.value.map(row => row.id)
      await batchDeleteImages(ids)
      ElMessage.success(`成功删除 ${ids.length} 张图片`)
      selectedRows.value = []
      fetchTableData()
      return true
    } catch (error) {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
      return false
    }
  }

  // 初始加载
  fetchTableData()

  return {
    tableData,
    loading,
    total,
    currentPage,
    pageSize,
    selectedRows,
    searchForm,
    fetchTableData,
    handleSearch,
    handleReset,
    handlePageChange,
    handleSizeChange,
    handleSelectionChange,
    handleBatchDelete
  }
}
