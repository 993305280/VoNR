import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/views/Layout.vue'
import Login from '@/views/Login.vue'
import { useAuthStore } from '@/stores/auth'
import Dashboard from '@/views/Dashboard.vue'
import Overview from '@/views/Overview.vue'
import BusinessList from '@/views/BusinessList.vue'
import ApplicationManagement from '@/views/ApplicationManagement.vue'
import SceneConfiguration from '@/views/SceneConfiguration.vue'
import BusinessConfiguration from '@/views/BusinessConfiguration.vue'
import UserList from '@/views/UserList.vue'
import BillingPackage from '@/views/BillingPackage.vue'
import ChargesDetail from '@/views/ChargesDetail.vue'
import CDRDetail from '@/views/CDRDetail.vue'
import CallRecords from '@/views/CallRecords.vue'
import LogList from '@/views/LogList.vue'
import DataMonitor from '@/views/DataMonitor.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard
      },
      {
        path: 'system/overview',
        name: 'SystemOverview',
        component: Overview
      },
      {
        path: 'business/application',
        name: 'ApplicationManagement',
        component: ApplicationManagement
      },
      {
        path: 'business/config',
        name: 'BusinessConfiguration',
        component: BusinessConfiguration
      },
      {
        path: 'user/list',
        name: 'UserSubscription',
        component: UserList
      },
      {
        path: 'user/scene',
        name: 'SceneConfiguration',
        component: SceneConfiguration
      },
      {
        path: 'cdr/billing',
        name: 'BillingPackage',
        component: BillingPackage
      },
      {
        path: 'cdr/charges',
        name: 'ChargesDetail',
        component: ChargesDetail
      },
      {
        path: 'cdr/detail',
        name: 'CDRDetail',
        component: CDRDetail
      },
      {
        path: 'cdr/calls',
        name: 'CallRecords',
        component: CallRecords
      },
      {
        path: 'log/list',
        name: 'LogList',
        component: LogList
      },
      {
        path: 'data/monitor',
        name: 'DataMonitor',
        component: DataMonitor
      },
      {
        path: 'data/realtime/call',
        name: 'RealtimeCall',
        component: DataMonitor
      },
      {
        path: 'data/realtime/service',
        name: 'RealtimeService',
        component: DataMonitor
      },
      {
        path: 'data/history/call',
        name: 'HistoryCall',
        component: DataMonitor
      },
      {
        path: 'data/history/service',
        name: 'HistoryService',
        component: DataMonitor
      },
      {
        path: 'data/analysis/trend',
        name: 'AnalysisTrend',
        component: DataMonitor
      },
      {
        path: 'data/analysis/ranking',
        name: 'AnalysisRanking',
        component: DataMonitor
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.path !== '/login' && !authStore.isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && authStore.isLoggedIn) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
