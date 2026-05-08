import { ref, reactive } from 'vue'

export function useTextData() {
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

    const names = ['清明节通知', '反诈提醒', '电费缴纳通知', '社保缴费提醒', '交通违章通知',
      '疫苗接种通知', '公积金提取通知', '医保缴费提醒', '高考成绩通知', '录取通知书',
      '水电费欠费通知', '物业费缴纳提醒', '宽带续费通知', '手机话费提醒', '银行账单通知',
      '信用卡还款提醒', '房贷还款通知', '车险到期提醒', '年检到期通知', '驾照到期换证']

    const contents = [
      '【广州市民政局、市应急管理局】提醒您：清明节祭扫高峰期，各墓园（骨灰楼）的人流量大，建议广大...',
      '近期有不法分子以优惠充值为幌子，诱导客户在非正规渠道进行话费充值，实际到账话费资金来源不明...',
      '尊敬的客户，您本月电费账单已出，共计156.80元，请于本月25日前完成缴纳，避免影响正常用电...',
      '尊敬的参保人，2024年度城乡居民基本医疗保险缴费工作已启动，个人缴费标准为380元/年...',
      '【广州交警】您的小型汽车粤A12345于2024-03-20 14:30在天河路因违反禁止标线指示被记录...',
      '尊敬的市民，根据国家免疫规划安排，请您携带儿童预防接种证前往就近社区卫生服务中心...',
      '您好！您的住房公积金账户余额已满足提取条件，可通过广州住房公积金管理中心APP申请提取...',
      '尊敬的参保人，您2024年度城镇职工基本医疗保险个人账户已划入，共计2400.00元...',
      '考生您好，2024年广东省普通高考成绩将于6月25日公布，请通过省教育考试院官方渠道查询...',
      '恭喜您被XX大学录取！请于8月25日至8月28日携带本通知书、身份证、准考证到校报到...',
      '尊敬的业主，您家水费账户已欠费2个月，累计欠费89.50元，请尽快缴纳，否则将影响供水...',
      '尊敬的业主，2024年第一季度物业费已出，共计1200.00元，缴费截止日期为3月31日...',
      '尊敬的客户，您的宽带套餐将于2024年4月15日到期，为避免断网，请及时续费...',
      '尊敬的用户，您本月手机话费为78.50元，套餐外流量费用12.00元，请确保账户余额充足...',
      '【XX银行】您尾号8888的信用卡本期账单金额为3560.00元，到期还款日为4月20日...',
      '尊敬的客户，您尾号6666的信用卡最低还款额为356.00元，还款日为4月20日...',
      '尊敬的客户，您本月房贷应还金额为5200.00元，将于4月1日从您绑定的银行卡中自动扣款...',
      '尊敬的车主，您名下粤A12345的车险将于2024年5月15日到期，请提前办理续保手续...',
      '尊敬的车主，您名下粤A12345的年检有效期至2024年6月，请在有效期内完成检验...',
      '您的驾驶证（证号440123199001011234）有效期至2024年8月，请在到期前90日内申请换证...'
    ]

    const contentLengths = [95, 92, 88, 91, 96, 89, 93, 90, 87, 94, 86, 85, 88, 92, 91, 89, 93, 87, 90, 95]
    const auditTags = ['新增', '编辑', '删除']
    const syncStatuses = ['同步中', '同步成功', '同步失败', '审核中', '审核成功', '审核失败']
    const availableStatuses = ['可用', '不可用']
    const operators = ['admin@VoNR', 'zhangsan@VoNR', 'lisi@VoNR', 'wangwu@VoNR']

    const data = []
    for (let i = start; i < end; i++) {
      const nameIndex = i % names.length
      data.push({
        id: String(i + 1).padStart(3, '0'),
        name: names[nameIndex],
        content: contents[nameIndex],
        contentLength: contentLengths[nameIndex],
        auditTag: auditTags[i % auditTags.length],
        syncStatus: syncStatuses[i % syncStatuses.length],
        availableStatus: availableStatuses[i % availableStatuses.length],
        description: '这是说明这是说明',
        updateTime: '2024-03-25 10:00:00',
        operator: operators[i % operators.length]
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
    console.log('同步素材')
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
