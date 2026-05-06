<template>
  <div class="header">
    <div class="header-left">
      <h1 class="header-title">CDR管理平台</h1>
    </div>
    <div class="header-right">
      <div class="user-info">
        <el-icon><User /></el-icon>
        <span>{{ authStore.userInfo?.username || 'Admin' }}</span>
      </div>
      <el-button type="primary" :icon="SwitchButton" circle @click="handleLogout" />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { SwitchButton, User } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  ElMessageBox.confirm('确定退出登录？', '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(() => {
    authStore.logout()
    sessionStorage.removeItem('voNR_tabs')
    router.push('/login')
  }).catch(() => {})
}
</script>

<style scoped>
.header {
  width: 100%;
  height: 60px;
  background: #2196f3;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ffffff;
  font-size: 14px;
}

.user-info .el-icon {
  font-size: 18px;
}
</style>
