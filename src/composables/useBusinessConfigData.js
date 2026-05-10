import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getBusinessConfigs,
  createBusinessConfig,
  updateBusinessConfig,
  deleteBusinessConfig,
  batchDeleteBusinessConfigs
} from '@/api/businessConfig'

export function useBusinessConfigData() {
  const loading = ref(false)
  const tableData = ref([])
  const total = ref(0)

  const searchParams = reactive({
    code: '',
    status: '',
    auditStatus: '',
    availableStatus: '',
    appName: ''
  })

  const pagination = reactive({
    current: 1,
    pageSize: 10
  })

  const fetchTableData = async () => {
    loading.value = true
    try {
      const result = await getBusinessConfigs({
        page: pagination.current,
        pageSize: pagination.pageSize,
        code: searchParams.code || undefined,
        status: searchParams.status || undefined,
        auditStatus: searchParams.auditStatus || undefined,
        availableStatus: searchParams.availableStatus || undefined,
        appName: searchParams.appName || undefined
      })

      tableData.value = result.data.list
      total.value = result.data.total
    } catch (error) {
      console.error('获取业务配置列表失败:', error)
      ElMessage.error('获取业务配置列表失败')
    } finally {
      loading.value = false
    }
  }

  const handleSearch = () => {
    pagination.current = 1
    fetchTableData()
  }

  const handleReset = () => {
    searchParams.code = ''
    searchParams.status = ''
    searchParams.auditStatus = ''
    searchParams.availableStatus = ''
    searchParams.appName = ''
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

  const handleDelete = async (ids) => {
    try {
      if (Array.isArray(ids)) {
        await batchDeleteBusinessConfigs(ids)
      } else {
        await deleteBusinessConfig(ids)
      }
      fetchTableData()
    } catch (error) {
      console.error('删除业务配置失败:', error)
      ElMessage.error('删除业务配置失败')
    }
  }

  const handleCreate = async (data) => {
    try {
      await createBusinessConfig(data)
      fetchTableData()
      ElMessage.success('创建成功')
    } catch (error) {
      console.error('创建业务配置失败:', error)
      ElMessage.error('创建业务配置失败')
      throw error
    }
  }

  const handleUpdate = async (id, data) => {
    try {
      await updateBusinessConfig(id, data)
      fetchTableData()
      ElMessage.success('更新成功')
    } catch (error) {
      console.error('更新业务配置失败:', error)
      ElMessage.error('更新业务配置失败')
      throw error
    }
  }

  fetchTableData()

  return {
    tableData,
    loading,
    total,
    searchParams,
    pagination,
    fetchTableData,
    handleSearch,
    handleReset,
    handlePageChange,
    handlePageSizeChange,
    handleDelete,
    handleCreate,
    handleUpdate
  }
}
