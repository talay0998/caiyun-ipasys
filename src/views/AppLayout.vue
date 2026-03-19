<template>
  <div class="app-layout">
    <!-- 左侧导航栏 -->
    <aside :class="['sidebar', { collapsed: sidebarCollapsed, 'sidebar-mobile': isMobile }]">
      <div class="sidebar-header">
        <h1 class="logo" v-show="!sidebarCollapsed">Caiyun IPA</h1>
        <span class="logo-icon" v-show="sidebarCollapsed">CY</span>
      </div>
      <nav class="sidebar-menu">
        <router-link to="/app/dashboard" class="menu-item">
          <span class="menu-icon">📊</span>
          <span class="menu-text" v-show="!sidebarCollapsed">仪表盘</span>
        </router-link>
        <router-link to="/app/customers" class="menu-item">
          <span class="menu-icon">👥</span>
          <span class="menu-text" v-show="!sidebarCollapsed">客户管理</span>
        </router-link>
        <router-link to="/app/business" class="menu-item">
          <span class="menu-icon">💼</span>
          <span class="menu-text" v-show="!sidebarCollapsed">业务管理</span>
        </router-link>
        <router-link to="/app/projects" class="menu-item">
          <span class="menu-icon">📋</span>
          <span class="menu-text" v-show="!sidebarCollapsed">项目管理</span>
        </router-link>
        <router-link to="/app/cases" class="menu-item">
          <span class="menu-icon">⚖️</span>
          <span class="menu-text" v-show="!sidebarCollapsed">案件管理</span>
        </router-link>
        <router-link to="/app/documents" class="menu-item">
          <span class="menu-icon">📄</span>
          <span class="menu-text" v-show="!sidebarCollapsed">文档管理</span>
        </router-link>
        <router-link to="/app/finance" class="menu-item">
          <span class="menu-icon">💰</span>
          <span class="menu-text" v-show="!sidebarCollapsed">财务管理</span>
        </router-link>
        <router-link to="/app/workflow" class="menu-item">
          <span class="menu-icon">📋</span>
          <span class="menu-text" v-show="!sidebarCollapsed">流程管理</span>
        </router-link>
        <router-link to="/app/system" class="menu-item">
          <span class="menu-icon">⚙️</span>
          <span class="menu-text" v-show="!sidebarCollapsed">系统管理</span>
        </router-link>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 顶部状态栏 -->
      <header class="top-bar">
        <div class="top-bar-left">
          <button class="menu-toggle" @click="toggleSidebar">
            ☰
          </button>
        </div>
        <div class="top-bar-right">
          <div class="user-info">
            <span class="user-name" v-show="!isMobile">管理员</span>
            <button class="user-avatar" @click="handleUserMenu">
              管
            </button>
          </div>
        </div>
      </header>

      <!-- 页面内容 -->
      <div class="page-content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const sidebarCollapsed = ref(false)
const isMobile = ref(false)

const toggleSidebar = () => {
  if (isMobile.value) {
    // 在移动设备上，点击切换按钮时，直接显示或隐藏侧边栏
    sidebarCollapsed.value = !sidebarCollapsed.value
  } else {
    // 在桌面设备上，点击切换按钮时，切换侧边栏的展开/折叠状态
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
}

const handleUserMenu = () => {
  console.log('用户菜单点击')
  // 模拟用户菜单功能
  if (confirm('是否退出登录？')) {
    router.push('/login')
  }
}

const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768
  // 在移动设备上默认折叠侧边栏
  if (isMobile.value) {
    sidebarCollapsed.value = true
  } else {
    sidebarCollapsed.value = false
  }
}

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.sidebar {
  width: 240px;
  background: #001529;
  color: white;
  transition: width 0.3s, transform 0.3s;
  overflow-y: auto;
  flex-shrink: 0;
}

.sidebar.collapsed {
  width: 64px;
}

.sidebar.sidebar-mobile {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1000;
  transform: translateX(0);
}

.sidebar.sidebar-mobile.collapsed {
  transform: translateX(-100%);
  width: 240px;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #1f2329;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo {
  font-size: 18px;
  font-weight: bold;
  color: white;
  margin: 0;
}

.logo-icon {
  font-size: 18px;
  font-weight: bold;
  color: white;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.sidebar-menu {
  padding: 20px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  transition: all 0.3s;
  justify-content: center;
}

.sidebar:not(.collapsed) .menu-item {
  justify-content: flex-start;
}

.menu-item:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.menu-item.router-link-active {
  color: white;
  background: #1890ff;
}

.menu-icon {
  margin-right: 12px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
}

.sidebar.collapsed .menu-icon {
  margin-right: 0;
}

.menu-text {
  font-size: 14px;
  white-space: nowrap;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
  overflow: hidden;
  transition: margin-left 0.3s;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 64px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.menu-toggle {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s;
}

.menu-toggle:hover {
  background: #f0f0f0;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-name {
  margin-right: 12px;
  font-size: 14px;
  white-space: nowrap;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #1890ff;
  color: white;
  border: none;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar:hover {
  background: #40a9ff;
}

.page-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-content {
    padding: 10px;
  }
  
  .top-bar {
    padding: 0 10px;
  }
  
  .user-name {
    display: none;
  }
}

@media (max-width: 480px) {
  .page-content {
    padding: 8px;
  }
  
  .top-bar {
    height: 56px;
  }
  
  .menu-toggle {
    font-size: 16px;
    padding: 6px;
  }
  
  .user-avatar {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
}
</style>