import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/app',
      name: 'App',
      component: () => import('../views/AppLayout.vue'),
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('../views/Dashboard.vue')
        },
        {
          path: 'customers',
          name: 'Customers',
          component: () => import('../views/Customers.vue')
        },
        {
          path: 'projects',
          name: 'Projects',
          component: () => import('../views/Projects.vue')
        },
        {
          path: 'cases',
          name: 'Cases',
          component: () => import('../views/Cases.vue')
        },
        {
          path: 'documents',
          name: 'Documents',
          component: () => import('../views/Documents.vue')
        },
        {
          path: 'finance',
          name: 'Finance',
          component: () => import('../views/Finance.vue')
        },
        {
          path: 'workflow',
          name: 'Workflow',
          component: () => import('../views/Workflow.vue')
        },
        {
          path: 'system',
          name: 'System',
          component: () => import('../views/System.vue')
        },
        {
          path: 'business',
          name: 'Business',
          component: () => import('../views/Business.vue')
        }
      ]
    }
  ]
})

export default router