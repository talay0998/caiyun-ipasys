<template>
  <div class="system">
    <h1 class="page-title">系统管理</h1>
    
    <div class="system-tabs">
      <button class="tab-button" :class="{ active: activeTab === 'users' }" @click="activeTab = 'users'">用户管理</button>
      <button class="tab-button" :class="{ active: activeTab === 'roles' }" @click="activeTab = 'roles'">角色权限</button>
      <button class="tab-button" :class="{ active: activeTab === 'settings' }" @click="activeTab = 'settings'">系统设置</button>
      <button class="tab-button" :class="{ active: activeTab === 'backup' }" @click="activeTab = 'backup'">数据备份</button>
    </div>

    <!-- 用户管理 -->
    <div class="tab-content" v-if="activeTab === 'users'">
      <div class="action-bar">
        <button class="add-button" @click="openAddForm">+ 添加用户</button>
        <button class="add-button" @click="openImportDialog">批量导入客户</button>
        <div class="search-box">
          <input type="text" placeholder="搜索用户..." v-model="searchQuery" />
          <button class="search-button" @click="handleSearch">🔍</button>
        </div>
      </div>

      <div class="users-table">
        <table>
          <thead>
            <tr>
              <th>用户名</th>
              <th>真实姓名</th>
              <th>角色</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>{{ user.username }}</td>
              <td>{{ user.name }}</td>
              <td>{{ user.role }}</td>
              <td>{{ user.createdAt }}</td>
              <td>
                <div class="action-buttons">
                  <button class="edit-button" @click="openEditForm(user)">编辑</button>
                  <button class="delete-button" @click="handleDeleteUser(user)">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 角色权限 -->
    <div class="tab-content" v-else-if="activeTab === 'roles'">
      <div class="action-bar">
        <button class="add-button" @click="openAddRoleForm">+ 添加角色</button>
      </div>
      
      <div class="roles-table">
        <table>
          <thead>
            <tr>
              <th>角色名称</th>
              <th>描述</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="role in roles" :key="role.id">
              <td>{{ role.name }}</td>
              <td>{{ role.description }}</td>
              <td>{{ role.createdAt }}</td>
              <td>
                <div class="action-buttons">
                  <button class="edit-button" @click="openEditRoleForm(role)">编辑</button>
                  <button class="permission-button" @click="openPermissionForm(role)">权限</button>
                  <button class="delete-button" @click="handleDeleteRole(role)">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 角色表单对话框 -->
    <div v-if="showRoleForm" class="form-dialog">
      <div class="form-dialog-content">
        <div class="form-dialog-header">
          <h3>{{ isEditingRole ? '编辑角色' : '添加角色' }}</h3>
          <button class="close-button" @click="showRoleForm = false">×</button>
        </div>
        <div class="form-dialog-body">
          <form @submit.prevent="submitRoleForm">
            <div class="form-item">
              <label for="roleName">角色名称 *</label>
              <input type="text" id="roleName" v-model="roleFormData.name" placeholder="请输入角色名称" required />
            </div>
            <div class="form-item">
              <label for="roleDescription">描述</label>
              <textarea id="roleDescription" v-model="roleFormData.description" placeholder="请输入角色描述" rows="3"></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="cancel-button" @click="showRoleForm = false">取消</button>
              <button type="submit" class="submit-button">保存</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 权限分配对话框 -->
    <div v-if="showPermissionForm" class="form-dialog">
      <div class="form-dialog-content">
        <div class="form-dialog-header">
          <h3>权限分配 - {{ selectedRole?.name }}</h3>
          <button class="close-button" @click="showPermissionForm = false">×</button>
        </div>
        <div class="form-dialog-body">
          <form @submit.prevent="submitPermissionForm">
            <div class="permission-section">
              <h4>模块权限</h4>
              <div class="permission-item" v-for="module in permissionModules" :key="module.name">
                <label>
                  <input type="checkbox" v-model="module.permitted" />
                  {{ module.name }}
                </label>
              </div>
            </div>
            <div class="form-actions">
              <button type="button" class="cancel-button" @click="showPermissionForm = false">取消</button>
              <button type="submit" class="submit-button">保存</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 系统设置 -->
    <div class="tab-content" v-else-if="activeTab === 'settings'">
      <div class="settings-content">
        <div class="settings-tabs">
          <button class="settings-tab-button" :class="{ active: settingsTab === 'basic' }" @click="settingsTab = 'basic'">基本信息</button>
          <button class="settings-tab-button" :class="{ active: settingsTab === 'params' }" @click="settingsTab = 'params'">参数配置</button>
          <button class="settings-tab-button" :class="{ active: settingsTab === 'email' }" @click="settingsTab = 'email'">邮件服务器</button>
          <button class="settings-tab-button" :class="{ active: settingsTab === 'api' }" @click="settingsTab = 'api'">API设置</button>
        </div>
        
        <!-- 基本信息设置 -->
        <div class="settings-panel" v-if="settingsTab === 'basic'">
          <form @submit.prevent="submitBasicSettings">
            <div class="form-item">
              <label for="companyName">公司名称 *</label>
              <input type="text" id="companyName" v-model="settingsData.companyName" placeholder="请输入公司名称" required />
            </div>
            <div class="form-item">
              <label for="companyAddress">公司地址</label>
              <input type="text" id="companyAddress" v-model="settingsData.companyAddress" placeholder="请输入公司地址" />
            </div>
            <div class="form-item">
              <label for="companyPhone">联系电话</label>
              <input type="tel" id="companyPhone" v-model="settingsData.companyPhone" placeholder="请输入联系电话" />
            </div>
            <div class="form-item">
              <label for="companyEmail">电子邮箱</label>
              <input type="email" id="companyEmail" v-model="settingsData.companyEmail" placeholder="请输入电子邮箱" />
            </div>
            <div class="form-actions">
              <button type="submit" class="submit-button">保存设置</button>
            </div>
          </form>
        </div>
        
        <!-- 参数配置设置 -->
        <div class="settings-panel" v-if="settingsTab === 'params'">
          <form @submit.prevent="submitParamsSettings">
            <div class="form-item">
              <label for="dateFormat">日期格式</label>
              <select id="dateFormat" v-model="settingsData.dateFormat">
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              </select>
            </div>
            <div class="form-item">
              <label for="currencyUnit">货币单位</label>
              <select id="currencyUnit" v-model="settingsData.currencyUnit">
                <option value="¥">人民币 (¥)</option>
                <option value="$">美元 ($)</option>
                <option value="€">欧元 (€)</option>
              </select>
            </div>
            <div class="form-item">
              <label for="pageSize">每页显示条数</label>
              <input type="number" id="pageSize" v-model.number="settingsData.pageSize" min="1" max="100" />
            </div>
            <div class="form-actions">
              <button type="submit" class="submit-button">保存设置</button>
            </div>
          </form>
        </div>
        
        <!-- 邮件服务器设置 -->
        <div class="settings-panel" v-if="settingsTab === 'email'">
          <form @submit.prevent="submitEmailSettings">
            <div class="form-item">
              <label for="smtpServer">SMTP服务器</label>
              <input type="text" id="smtpServer" v-model="settingsData.smtpServer" placeholder="请输入SMTP服务器地址" />
            </div>
            <div class="form-item">
              <label for="smtpPort">SMTP端口</label>
              <input type="number" id="smtpPort" v-model.number="settingsData.smtpPort" min="1" max="65535" />
            </div>
            <div class="form-item">
              <label for="smtpUsername">用户名</label>
              <input type="text" id="smtpUsername" v-model="settingsData.smtpUsername" placeholder="请输入用户名" />
            </div>
            <div class="form-item">
              <label for="smtpPassword">密码</label>
              <input type="password" id="smtpPassword" v-model="settingsData.smtpPassword" placeholder="请输入密码" />
            </div>
            <div class="form-item">
              <label for="smtpFrom">发件人邮箱</label>
              <input type="email" id="smtpFrom" v-model="settingsData.smtpFrom" placeholder="请输入发件人邮箱" />
            </div>
            <div class="form-actions">
              <button type="submit" class="submit-button">保存设置</button>
            </div>
          </form>
        </div>
        
        <!-- API设置 -->
        <div class="settings-panel" v-if="settingsTab === 'api'">
          <form @submit.prevent="submitApiSettings">
            <div class="form-item">
              <label>
                <input type="checkbox" v-model="settingsData.apiEnabled" />
                启用API接口
              </label>
            </div>
            <div class="form-item" v-if="settingsData.apiEnabled">
              <label for="apiKey">API密钥</label>
              <div style="display: flex; gap: 8px; align-items: center;">
                <input type="text" id="apiKey" v-model="settingsData.apiKey" placeholder="API密钥" readonly />
                <button type="button" class="add-button" style="padding: 4px 12px; font-size: 12px;" @click="generateApiKey">生成密钥</button>
              </div>
            </div>
            <div class="form-item" v-if="settingsData.apiEnabled">
              <label for="apiIpWhitelist">IP白名单（多个IP用逗号分隔）</label>
              <input type="text" id="apiIpWhitelist" v-model="settingsData.apiIpWhitelist" placeholder="例如：127.0.0.1,192.168.1.1" />
            </div>
            <div class="form-item" v-if="settingsData.apiEnabled">
              <label for="apiRateLimit">请求频率限制（次/分钟）</label>
              <input type="number" id="apiRateLimit" v-model.number="settingsData.apiRateLimit" min="1" max="1000" />
            </div>
            <div class="form-item" v-if="settingsData.apiEnabled">
              <label for="apiAllowedOrigins">允许的跨域来源（多个用逗号分隔）</label>
              <input type="text" id="apiAllowedOrigins" v-model="settingsData.apiAllowedOrigins" placeholder="例如：http://localhost:3000,https://example.com" />
            </div>
            <div class="form-actions">
              <button type="submit" class="submit-button">保存设置</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 数据备份 -->
    <div class="tab-content" v-else-if="activeTab === 'backup'">
      <div class="action-bar">
        <button class="add-button" @click="handleBackup">备份数据</button>
        <button class="add-button" @click="openRestoreDialog">恢复数据</button>
        <button class="add-button" @click="openExportDialog">导出数据</button>
      </div>
      
      <div class="backup-files">
        <h3>备份文件列表</h3>
        <div class="backup-table">
          <table>
            <thead>
              <tr>
                <th>文件名</th>
                <th>备份时间</th>
                <th>文件大小</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="backup in backupFiles" :key="backup.id">
                <td>{{ backup.filename }}</td>
                <td>{{ backup.timestamp }}</td>
                <td>{{ backup.size }}</td>
                <td>
                  <div class="action-buttons">
                    <button class="download-button" @click="downloadBackup(backup)">下载</button>
                    <button class="restore-button" @click="restoreFromBackup(backup)">恢复</button>
                    <button class="delete-button" @click="deleteBackup(backup)">删除</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 恢复数据对话框 -->
    <div v-if="showRestoreDialog" class="form-dialog">
      <div class="form-dialog-content">
        <div class="form-dialog-header">
          <h3>恢复数据</h3>
          <button class="close-button" @click="showRestoreDialog = false">×</button>
        </div>
        <div class="form-dialog-body">
          <div class="form-item">
            <label for="backupFile">选择备份文件</label>
            <input type="file" id="backupFile" @change="handleFileSelect" />
          </div>
          <div class="form-item">
            <label>
              <input type="checkbox" v-model="confirmRestore" />
              确认恢复数据，此操作将覆盖当前数据
            </label>
          </div>
          <div class="form-actions">
            <button type="button" class="cancel-button" @click="showRestoreDialog = false">取消</button>
            <button type="button" class="submit-button" @click="submitRestore" :disabled="!confirmRestore">恢复数据</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 导出数据对话框 -->
    <div v-if="showExportDialog" class="form-dialog">
      <div class="form-dialog-content">
        <div class="form-dialog-header">
          <h3>导出数据</h3>
          <button class="close-button" @click="showExportDialog = false">×</button>
        </div>
        <div class="form-dialog-body">
          <div class="form-item">
            <label for="exportType">导出类型</label>
            <select id="exportType" v-model="exportType">
              <option value="csv">CSV格式</option>
              <option value="excel">Excel格式</option>
              <option value="json">JSON格式</option>
            </select>
          </div>
          <div class="form-item">
            <label for="exportModule">导出模块</label>
            <select id="exportModule" v-model="exportModule">
              <option value="customers">客户数据</option>
              <option value="projects">项目数据</option>
              <option value="cases">案件数据</option>
              <option value="business">业务数据</option>
              <option value="all">全部数据</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="button" class="cancel-button" @click="showExportDialog = false">取消</button>
            <button type="button" class="submit-button" @click="submitExport">导出数据</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 批量导入客户对话框 -->
    <div v-if="showImportDialog" class="form-dialog">
      <div class="form-dialog-content">
        <div class="form-dialog-header">
          <h3>批量导入客户</h3>
          <button class="close-button" @click="showImportDialog = false">×</button>
        </div>
        <div class="form-dialog-body">
          <div class="form-item">
            <label for="importFile">选择导入文件</label>
            <input type="file" id="importFile" @change="handleImportFileSelect" accept=".csv,.xlsx,.xls" />
          </div>
          <div class="form-item">
            <label>
              <input type="checkbox" v-model="confirmImport" />
              确认导入客户数据
            </label>
          </div>
          <div class="form-actions">
            <button type="button" class="cancel-button" @click="showImportDialog = false">取消</button>
            <button type="button" class="submit-button" @click="submitImport" :disabled="!confirmImport">导入数据</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户表单对话框 -->
    <div v-if="showForm" class="form-dialog">
      <div class="form-dialog-content">
        <div class="form-dialog-header">
          <h3>{{ isEditing ? '编辑用户' : '添加用户' }}</h3>
          <button class="close-button" @click="showForm = false">×</button>
        </div>
        <div class="form-dialog-body">
          <form @submit.prevent="submitForm">
            <div class="form-item">
              <label for="username">用户名 *</label>
              <input type="text" id="username" v-model="formData.username" placeholder="请输入用户名" required :disabled="isEditing && formData.username === 'admin'" />
            </div>
            <div class="form-item">
              <label for="name">真实姓名 *</label>
              <input type="text" id="name" v-model="formData.name" placeholder="请输入真实姓名" required />
            </div>
            <div class="form-item">
              <label for="role">角色</label>
              <select id="role" v-model="formData.role" :disabled="isEditing && formData.username === 'admin'">
                <option value="超级管理员">超级管理员</option>
                <option value="普通用户">普通用户</option>
              </select>
            </div>
            <div class="form-actions">
              <button type="button" class="cancel-button" @click="showForm = false">取消</button>
              <button type="submit" class="submit-button">保存</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 消息提示组件 -->
    <div v-if="message.show" :class="['message', message.type]" @click="message.show = false">
      <div class="message-content">
        <span class="message-icon">{{ message.icon }}</span>
        <span class="message-text">{{ message.text }}</span>
      </div>
    </div>

    <!-- 确认对话框 -->
    <div v-if="confirmDialog.show" class="confirm-dialog">
      <div class="confirm-dialog-content">
        <div class="confirm-dialog-header">
          <h3>{{ confirmDialog.title }}</h3>
          <button class="close-button" @click="confirmDialog.show = false">×</button>
        </div>
        <div class="confirm-dialog-body">
          <p>{{ confirmDialog.message }}</p>
        </div>
        <div class="confirm-dialog-footer">
          <button class="cancel-button" @click="confirmDialog.show = false">取消</button>
          <button class="confirm-button" @click="handleConfirm">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const activeTab = ref('users')

// 模拟数据
const users = ref([
  { id: 1, username: 'admin', name: '管理员', role: '超级管理员', createdAt: '2026-01-01' },
  { id: 2, username: 'user1', name: '张三', role: '普通用户', createdAt: '2026-01-15' },
  { id: 3, username: 'user2', name: '李四', role: '普通用户', createdAt: '2026-02-01' },
  { id: 4, username: 'user3', name: '王五', role: '普通用户', createdAt: '2026-02-15' }
])

// 角色数据
const roles = ref([
  { id: 1, name: '超级管理员', description: '拥有系统所有权限', createdAt: '2026-01-01' },
  { id: 2, name: '普通用户', description: '拥有基本操作权限', createdAt: '2026-01-01' },
  { id: 3, name: '财务人员', description: '拥有财务管理权限', createdAt: '2026-01-01' }
])

// 角色表单状态
const showRoleForm = ref(false)
const isEditingRole = ref(false)
const roleFormData = ref({
  id: 0,
  name: '',
  description: '',
  createdAt: ''
})

// 权限分配状态
const showPermissionForm = ref(false)
const selectedRole = ref<any>(null)
const permissionModules = ref([
  { name: '客户管理', permitted: true },
  { name: '项目管理', permitted: true },
  { name: '案件管理', permitted: true },
  { name: '文档管理', permitted: true },
  { name: '财务管理', permitted: true },
  { name: '系统管理', permitted: false }
])

// 系统设置状态
const settingsTab = ref('basic')
const settingsData = ref({
  // 基本信息
  companyName: '知识产权代理公司',
  companyAddress: '北京市朝阳区建国路88号',
  companyPhone: '010-12345678',
  companyEmail: 'info@example.com',
  // 参数配置
  dateFormat: 'YYYY-MM-DD',
  currencyUnit: '¥',
  pageSize: 20,
  // 邮件服务器
  smtpServer: 'smtp.example.com',
  smtpPort: 587,
  smtpUsername: 'admin@example.com',
  smtpPassword: '',
  smtpFrom: 'admin@example.com',
  // API设置
  apiEnabled: false,
  apiKey: '',
  apiIpWhitelist: '127.0.0.1',
  apiRateLimit: 60,
  apiAllowedOrigins: 'http://localhost:3000'
})

// 数据备份状态
const backupFiles = ref([
  { id: 1, filename: 'backup_20260319_120000.sql', timestamp: '2026-03-19 12:00:00', size: '1.2 MB' },
  { id: 2, filename: 'backup_20260318_120000.sql', timestamp: '2026-03-18 12:00:00', size: '1.1 MB' },
  { id: 3, filename: 'backup_20260317_120000.sql', timestamp: '2026-03-17 12:00:00', size: '1.0 MB' }
])

const showRestoreDialog = ref(false)
const confirmRestore = ref(false)
const selectedBackupFile = ref<File | null>(null)

// 数据导出状态
const showExportDialog = ref(false)
const exportType = ref('csv')
const exportModule = ref('customers')

// 批量导入状态
const showImportDialog = ref(false)
const confirmImport = ref(false)
const selectedImportFile = ref<File | null>(null)

const searchQuery = ref('')
const showForm = ref(false)
const isEditing = ref(false)
const formData = ref({
  id: 0,
  username: '',
  name: '',
  role: '普通用户',
  createdAt: ''
})

// 消息提示状态
const message = ref({
  show: false,
  type: 'success', // success, error, warning, info
  text: '',
  icon: '✓'
})

// 确认对话框状态
const confirmDialog = ref({
  show: false,
  title: '确认操作',
  message: '',
  callback: null as Function | null
})

// 显示消息提示
const showMessage = (text: string, type: string = 'success') => {
  message.value = {
    show: true,
    type,
    text,
    icon: type === 'success' ? '✓' : type === 'error' ? '×' : type === 'warning' ? '!' : 'i'
  }
  setTimeout(() => {
    message.value.show = false
  }, 3000)
}

// 显示确认对话框
const showConfirm = (message: string, callback: Function) => {
  confirmDialog.value = {
    show: true,
    title: '确认操作',
    message,
    callback
  }
}

// 处理确认
const handleConfirm = () => {
  if (confirmDialog.value.callback) {
    confirmDialog.value.callback()
  }
  confirmDialog.value.show = false
}

// 过滤后的用户列表
const filteredUsers = computed(() => {
  if (!searchQuery.value) {
    return users.value
  }
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user => 
    user.username.toLowerCase().includes(query) ||
    user.name.toLowerCase().includes(query) ||
    user.role.toLowerCase().includes(query)
  )
})

// 打开添加表单
const openAddForm = () => {
  isEditing.value = false
  formData.value = {
    id: 0,
    username: '',
    name: '',
    role: '普通用户',
    createdAt: ''
  }
  showForm.value = true
}

// 打开编辑表单
const openEditForm = (user: any) => {
  isEditing.value = true
  formData.value = { ...user }
  showForm.value = true
}

// 提交表单
const submitForm = () => {
  if (!formData.value.username || !formData.value.name) {
    showMessage('请填写所有必填字段', 'error')
    return
  }

  if (isEditing.value) {
    // 编辑用户
    const index = users.value.findIndex(u => u.id === formData.value.id)
    if (index > -1) {
      users.value[index] = { ...formData.value }
      showMessage('用户编辑成功')
    }
  } else {
    // 添加用户
    const newUser = {
      ...formData.value,
      id: users.value.length + 1,
      createdAt: new Date().toISOString().split('T')[0]
    }
    users.value.push(newUser)
    showMessage('用户添加成功')
  }

  showForm.value = false
}

const handleSearch = () => {
  console.log('搜索用户:', searchQuery.value)
  // 搜索逻辑已经通过computed实现
  showMessage('搜索完成', 'info')
}

const handleDeleteUser = (user: any) => {
  console.log('删除用户:', user)
  // 模拟删除用户功能
  if (user.username === 'admin') {
    showMessage('超级管理员不能删除', 'warning')
    return
  }
  // 使用确认对话框进行删除操作
  showConfirm(`确定要删除用户 ${user.username} 吗？`, () => {
    const index = users.value.findIndex(u => u.id === user.id)
    if (index > -1) {
      users.value.splice(index, 1)
      showMessage('用户已删除')
    }
  })
}

// 打开添加角色表单
const openAddRoleForm = () => {
  isEditingRole.value = false
  roleFormData.value = {
    id: 0,
    name: '',
    description: '',
    createdAt: ''
  }
  showRoleForm.value = true
}

// 打开编辑角色表单
const openEditRoleForm = (role: any) => {
  isEditingRole.value = true
  roleFormData.value = { ...role }
  showRoleForm.value = true
}

// 提交角色表单
const submitRoleForm = () => {
  if (!roleFormData.value.name) {
    showMessage('请填写角色名称', 'error')
    return
  }

  if (isEditingRole.value) {
    // 编辑角色
    const index = roles.value.findIndex(r => r.id === roleFormData.value.id)
    if (index > -1) {
      roles.value[index] = { ...roleFormData.value }
      showMessage('角色编辑成功')
    }
  } else {
    // 添加角色
    const newRole = {
      ...roleFormData.value,
      id: roles.value.length + 1,
      createdAt: new Date().toISOString().split('T')[0]
    }
    roles.value.push(newRole)
    showMessage('角色添加成功')
  }

  showRoleForm.value = false
}

// 打开权限分配表单
const openPermissionForm = (role: any) => {
  selectedRole.value = role
  // 这里可以根据角色的实际权限设置permissionModules
  showPermissionForm.value = true
}

// 提交权限分配表单
const submitPermissionForm = () => {
  if (selectedRole.value) {
    showMessage('权限分配成功')
    showPermissionForm.value = false
  }
}

// 删除角色
const handleDeleteRole = (role: any) => {
  if (role.name === '超级管理员') {
    showMessage('超级管理员角色不能删除', 'warning')
    return
  }
  showConfirm(`确定要删除角色 ${role.name} 吗？`, () => {
    const index = roles.value.findIndex(r => r.id === role.id)
    if (index > -1) {
      roles.value.splice(index, 1)
      showMessage('角色已删除')
    }
  })
}

const handleBackup = () => {
  console.log('备份数据')
  // 模拟数据备份功能
  showMessage('数据备份成功')
}

// 保存基本信息设置
const submitBasicSettings = () => {
  if (!settingsData.value.companyName) {
    showMessage('请填写公司名称', 'error')
    return
  }
  showMessage('基本信息设置保存成功')
}

// 保存参数配置设置
const submitParamsSettings = () => {
  showMessage('参数配置设置保存成功')
}

// 保存邮件服务器设置
const submitEmailSettings = () => {
  showMessage('邮件服务器设置保存成功')
}

// 生成API密钥
const generateApiKey = () => {
  // 生成32位随机API密钥
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let apiKey = ''
  for (let i = 0; i < 32; i++) {
    apiKey += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  settingsData.value.apiKey = apiKey
  showMessage('API密钥生成成功')
}

// 保存API设置
const submitApiSettings = () => {
  showMessage('API设置保存成功')
}

// 打开恢复数据对话框
const openRestoreDialog = () => {
  confirmRestore.value = false
  selectedBackupFile.value = null
  showRestoreDialog.value = true
}

// 处理文件选择
const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedBackupFile.value = target.files[0]
  }
}

// 提交恢复操作
const submitRestore = () => {
  if (!selectedBackupFile.value) {
    showMessage('请选择备份文件', 'error')
    return
  }
  showMessage('数据恢复成功')
  showRestoreDialog.value = false
}

// 下载备份文件
const downloadBackup = (backup: any) => {
  showMessage(`正在下载备份文件: ${backup.filename}`, 'info')
}

// 从备份文件恢复
const restoreFromBackup = (backup: any) => {
  showConfirm(`确定要从备份文件 ${backup.filename} 恢复数据吗？此操作将覆盖当前数据。`, () => {
    showMessage('数据恢复成功')
  })
}

// 删除备份文件
const deleteBackup = (backup: any) => {
  showConfirm(`确定要删除备份文件 ${backup.filename} 吗？`, () => {
    const index = backupFiles.value.findIndex(b => b.id === backup.id)
    if (index > -1) {
      backupFiles.value.splice(index, 1)
      showMessage('备份文件已删除')
    }
  })
}

// 打开导出数据对话框
const openExportDialog = () => {
  showExportDialog.value = true
}

// 提交导出数据操作
const submitExport = () => {
  showMessage(`数据导出成功，格式: ${exportType.value}，模块: ${exportModule.value}`, 'success')
  showExportDialog.value = false
}

// 打开批量导入客户对话框
const openImportDialog = () => {
  confirmImport.value = false
  selectedImportFile.value = null
  showImportDialog.value = true
}

// 处理导入文件选择
const handleImportFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedImportFile.value = target.files[0]
  }
}

// 提交导入数据操作
const submitImport = () => {
  if (!selectedImportFile.value) {
    showMessage('请选择导入文件', 'error')
    return
  }
  showMessage('客户数据导入成功', 'success')
  showImportDialog.value = false
}
</script>

<style scoped>
/* 现有样式保持不变 */

/* 表单对话框样式 */
.form-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.form-dialog-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 500px;
  max-width: 90%;
  overflow: hidden;
}

.form-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.form-dialog-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s;
}

.close-button:hover {
  background: #f0f0f0;
  color: #666;
}

.form-dialog-body {
  padding: 20px;
}

.form-item {
  margin-bottom: 16px;
}

.form-item label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.form-item input,
.form-item select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s;
}

.form-item input:focus,
.form-item select:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.form-item input:disabled,
.form-item select:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.cancel-button,
.submit-button {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-button {
  background: white;
  border: 1px solid #d9d9d9;
  color: #666;
}

.cancel-button:hover {
  background: #f0f0f0;
}

.submit-button {
  background: #1890ff;
  border: 1px solid #1890ff;
  color: white;
}

.submit-button:hover {
  background: #40a9ff;
  border-color: #40a9ff;
}
</style>

<style scoped>
.system {
  height: 100%;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

.system-tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #e8e8e8;
}

.tab-button {
  padding: 10px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-button:hover {
  color: #1890ff;
}

.tab-button.active {
  color: #1890ff;
  border-bottom-color: #1890ff;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-button {
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.add-button:hover {
  background: #40a9ff;
}

.search-box {
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
  background: white;
}

.search-box input {
  padding: 10px 16px;
  border: 1px solid #d9d9d9;
  border-right: none;
  border-radius: 4px 0 0 4px;
  font-size: 14px;
  width: 300px;
  transition: all 0.3s;
}

.search-box input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.search-button {
  padding: 10px 20px;
  background: #1890ff;
  border: 1px solid #1890ff;
  border-radius: 0 4px 4px 0;
  font-size: 14px;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}

.search-button:hover {
  background: #40a9ff;
  border-color: #40a9ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
}

.search-button:active {
  background: #096dd9;
  border-color: #096dd9;
}

.users-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.users-table table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.users-table th {
  background: #fafafa;
  font-weight: bold;
  color: #333;
}

.users-table tr:hover {
  background: #fafafa;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.edit-button,
.delete-button {
  padding: 4px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.edit-button {
  background: white;
  color: #1890ff;
  border-color: #1890ff;
}

.edit-button:hover {
  background: rgba(24, 144, 255, 0.1);
}

.delete-button {
  background: white;
  color: #f43f5e;
  border-color: #f43f5e;
}

.delete-button:hover {
  background: rgba(244, 63, 94, 0.1);
}

.roles-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.roles-table table {
  width: 100%;
  border-collapse: collapse;
}

.roles-table th,
.roles-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.roles-table th {
  background: #fafafa;
  font-weight: bold;
  color: #333;
}

.roles-table tr:hover {
  background: #fafafa;
}

.permission-button {
  padding: 4px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
  color: #10b981;
  border-color: #10b981;
}

.permission-button:hover {
  background: rgba(16, 185, 129, 0.1);
}

.permission-section {
  margin-bottom: 20px;
}

.permission-section h4 {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.permission-item {
  margin-bottom: 8px;
}

.permission-item label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.permission-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.settings-tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #e8e8e8;
}

.settings-tab-button {
  padding: 10px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.settings-tab-button:hover {
  color: #1890ff;
}

.settings-tab-button.active {
  color: #1890ff;
  border-bottom-color: #1890ff;
}

.settings-panel {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.settings-panel form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.backup-files {
  margin-top: 20px;
}

.backup-files h3 {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.backup-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.backup-table table {
  width: 100%;
  border-collapse: collapse;
}

.backup-table th,
.backup-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.backup-table th {
  background: #fafafa;
  font-weight: bold;
  color: #333;
}

.backup-table tr:hover {
  background: #fafafa;
}

.download-button,
.restore-button {
  padding: 4px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.download-button {
  background: white;
  color: #1890ff;
  border-color: #1890ff;
}

.download-button:hover {
  background: rgba(24, 144, 255, 0.1);
}

.restore-button {
  background: white;
  color: #10b981;
  border-color: #10b981;
}

.restore-button:hover {
  background: rgba(16, 185, 129, 0.1);
}

/* 消息提示样式 */
.message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 1001;
  animation: slideIn 0.3s ease;
  cursor: pointer;
  transition: all 0.3s;
}

.message:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}

.message.success {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  color: #52c41a;
}

.message.error {
  background: #fff2f0;
  border: 1px solid #ffccc7;
  color: #f5222d;
}

.message.warning {
  background: #fff7e6;
  border: 1px solid #ffd591;
  color: #fa8c16;
}

.message.info {
  background: #f0f5ff;
  border: 1px solid #adc6ff;
  color: #1890ff;
}

.message-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.message-icon {
  font-size: 16px;
  font-weight: bold;
}

.message-text {
  font-size: 14px;
  font-weight: 500;
}

/* 确认对话框样式 */
.confirm-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.confirm-dialog-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 400px;
  max-width: 90%;
  overflow: hidden;
  animation: scaleIn 0.3s ease;
}

.confirm-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.confirm-dialog-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.confirm-dialog-body {
  padding: 20px;
}

.confirm-dialog-body p {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.confirm-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.confirm-button {
  padding: 8px 16px;
  background: #1890ff;
  border: 1px solid #1890ff;
  color: white;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.confirm-button:hover {
  background: #40a9ff;
  border-color: #40a9ff;
}

/* 动画 */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>