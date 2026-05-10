import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getApplications,
  deleteApplication,
  batchDeleteApplications
} from '@/api/application'

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

  const fetchTableData = async () => {
    loading.value = true
    try {
      const result = await getApplications({
        page: pagination.current,
        pageSize: pagination.pageSize,
        name: searchParams.name || undefined,
        auditStatus: searchParams.auditStatus || undefined,
        availableStatus: searchParams.availableStatus || undefined
      })

      tableData.value = result.data.list
      total.value = result.data.total
    } catch (error) {
      console.error('获取应用列表失败:', error)
      ElMessage.error('获取应用列表失败')
    } finally {
      loading.value = false
    }
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

  const handleDelete = async (ids) => {
    try {
      if (Array.isArray(ids)) {
        await batchDeleteApplications(ids)
      } else {
        await deleteApplication(ids)
      }
      fetchTableData()
    } catch (error) {
      console.error('删除应用失败:', error)
      ElMessage.error('删除应用失败')
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
