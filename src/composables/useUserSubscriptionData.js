import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getUserSubscriptions,
  createUserSubscription,
  updateUserSubscription,
  deleteUserSubscription,
  batchDeleteUserSubscriptions
} from '@/api/userSubscription'

export function useUserSubscriptionData() {
  const tableData = ref([])
  const loading = ref(false)
  const total = ref(0)
  const pagination = reactive({
    current: 1,
    pageSize: 10
  })
  const searchParams = reactive({
    phone: '',
    startTime: '',
    endTime: ''
  })

  const fetchData = async () => {
    loading.value = true
    try {
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...searchParams
      }
      const res = await getUserSubscriptions(params)
      if (res.code === 200) {
        tableData.value = res.data.list
        total.value = res.data.total
      }
    } catch (error) {
      console.error('获取用户订购关系列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  const handleSearch = () => {
    pagination.current = 1
    fetchData()
  }

  const handleReset = () => {
    searchParams.phone = ''
    searchParams.startTime = ''
    searchParams.endTime = ''
    pagination.current = 1
    fetchData()
  }

  const handlePageChange = (page) => {
    pagination.current = page
    fetchData()
  }

  const handlePageSizeChange = (size) => {
    pagination.pageSize = size
    pagination.current = 1
    fetchData()
  }

  const handleCreate = async (data) => {
    try {
      const res = await createUserSubscription(data)
      if (res.code === 200) {
        ElMessage.success('创建成功')
        await fetchData()
        return true
      }
      return false
    } catch (error) {
      console.error('创建用户订购关系失败:', error)
      return false
    }
  }

  const handleUpdate = async (id, data) => {
    try {
      const res = await updateUserSubscription(id, data)
      if (res.code === 200) {
        ElMessage.success('更新成功')
        await fetchData()
        return true
      }
      return false
    } catch (error) {
      console.error('更新用户订购关系失败:', error)
      return false
    }
  }

  const handleDelete = async (ids) => {
    try {
      if (Array.isArray(ids)) {
        const res = await batchDeleteUserSubscriptions(ids)
        if (res.code === 200) {
          return true
        }
      } else {
        const res = await deleteUserSubscription(ids)
        if (res.code === 200) {
          return true
        }
      }
      return false
    } catch (error) {
      console.error('删除用户订购关系失败:', error)
      return false
    }
  }

  // 初始加载数据
  fetchData()

  return {
    tableData,
    loading,
    total,
    pagination,
    searchParams,
    handleSearch,
    handleReset,
    handlePageChange,
    handlePageSizeChange,
    handleCreate,
    handleUpdate,
    handleDelete
  }
}
