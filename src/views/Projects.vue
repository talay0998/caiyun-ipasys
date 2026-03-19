<template>
  <div class="projects">
    <h1 class="page-title">项目管理</h1>
    
    <div class="action-bar">
      <button class="add-button" @click="openAddForm">+ 添加项目</button>
      <div class="search-box">
        <input type="text" placeholder="搜索项目..." v-model="searchQuery" />
        <button class="search-button" @click="handleSearch">🔍</button>
      </div>
    </div>

    <div class="projects-table">
      <table>
        <thead>
          <tr>
            <th>项目名称</th>
            <th>客户</th>
            <th>类型</th>
            <th>状态</th>
            <th>开始日期</th>
            <th>结束日期</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="project in filteredProjects" :key="project.id">
            <td>{{ project.name }}</td>
            <td>{{ project.customer }}</td>
            <td>{{ project.type }}</td>
            <td>
              <span :class="['status-badge', project.status]">
                {{ project.status }}
              </span>
            </td>
            <td>{{ project.startDate }}</td>
            <td>{{ project.endDate }}</td>
            <td>
              <div class="action-buttons">
                <button class="edit-button" @click="openEditForm(project)">编辑</button>
                <button class="view-button" @click="handleViewProject(project)">查看</button>
                <button class="delete-button" @click="handleDeleteProject(project)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 项目表单对话框 -->
    <div v-if="showForm" class="form-dialog">
      <div class="form-dialog-content">
        <div class="form-dialog-header">
          <h3>{{ isEditing ? '编辑项目' : '添加项目' }}</h3>
          <button class="close-button" @click="showForm = false">×</button>
        </div>
        <div class="form-dialog-body">
          <form @submit.prevent="submitForm">
            <div class="form-item">
              <label for="name">项目名称 *</label>
              <input type="text" id="name" v-model="formData.name" placeholder="请输入项目名称" required />
              <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
            </div>
            <div class="form-item">
              <label for="customer">客户 *</label>
              <select id="customer" v-model="formData.customer" required>
                <option value="">请选择客户</option>
                <option v-for="customer in customers" :key="customer.id" :value="customer.name">
                  {{ customer.name }}
                </option>
              </select>
              <span v-if="errors.customer" class="error-message">{{ errors.customer }}</span>
            </div>
            <div class="form-item">
              <label for="type">类型</label>
              <select id="type" v-model="formData.type">
                <option value="商标">商标</option>
                <option value="专利">专利</option>
                <option value="版权">版权</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div class="form-item">
              <label for="status">状态</label>
              <select id="status" v-model="formData.status">
                <option value="准备中">准备中</option>
                <option value="进行中">进行中</option>
                <option value="已提交">已提交</option>
                <option value="已完成">已完成</option>
              </select>
            </div>
            <div class="form-item">
              <label for="startDate">开始日期 *</label>
              <input type="date" id="startDate" v-model="formData.startDate" required />
              <span v-if="errors.startDate" class="error-message">{{ errors.startDate }}</span>
            </div>
            <div class="form-item">
              <label for="endDate">结束日期 *</label>
              <input type="date" id="endDate" v-model="formData.endDate" required />
              <span v-if="errors.endDate" class="error-message">{{ errors.endDate }}</span>
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

    <!-- 详情对话框 -->
    <div v-if="detailDialog.show" class="detail-dialog">
      <div class="detail-dialog-content">
        <div class="detail-dialog-header">
          <h3>{{ detailDialog.title }}</h3>
          <button class="close-button" @click="detailDialog.show = false">×</button>
        </div>
        <div class="detail-dialog-body">
          <div class="detail-item" v-for="(value, key) in detailDialog.data" :key="key">
            <span class="detail-label">{{ key }}:</span>
            <span class="detail-value">{{ value }}</span>
          </div>
        </div>
        <div class="detail-dialog-footer">
          <button class="close-button-full" @click="detailDialog.show = false">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 模拟客户数据
const customers = ref([
  { id: 1, name: '阿里巴巴集团' },
  { id: 2, name: '腾讯科技' },
  { id: 3, name: '百度网讯' },
  { id: 4, name: '旷视科技' },
  { id: 5, name: '字节跳动' }
])

// 模拟数据
const projects = ref([
  { id: 1, name: '阿里云商标注册项目', customer: '阿里巴巴集团', type: '商标', status: '进行中', startDate: '2026-01-15', endDate: '2026-04-15' },
  { id: 2, name: '人脸识别专利申请', customer: '旷视科技', type: '专利', status: '已提交', startDate: '2026-02-01', endDate: '2026-05-01' },
  { id: 3, name: '微信商标续展', customer: '腾讯科技', type: '商标', status: '进行中', startDate: '2026-03-01', endDate: '2026-04-15' },
  { id: 4, name: '软件著作权登记', customer: '百度网讯', type: '版权', status: '已完成', startDate: '2026-01-01', endDate: '2026-03-15' },
  { id: 5, name: '人工智能专利申请', customer: '字节跳动', type: '专利', status: '准备中', startDate: '2026-03-15', endDate: '2026-06-15' }
])

const searchQuery = ref('')
const showForm = ref(false)
const isEditing = ref(false)
const formData = ref({
  id: 0,
  name: '',
  customer: '',
  type: '商标',
  status: '准备中',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
})

// 错误状态
const errors = ref({
  name: '',
  customer: '',
  startDate: '',
  endDate: ''
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

// 详情对话框状态
const detailDialog = ref({
  show: false,
  title: '项目详情',
  data: {}
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

// 显示详情对话框
const showDetail = (title: string, data: any) => {
  detailDialog.value = {
    show: true,
    title,
    data
  }
}

// 过滤后的项目列表
const filteredProjects = computed(() => {
  if (!searchQuery.value) {
    return projects.value
  }
  const query = searchQuery.value.toLowerCase()
  return projects.value.filter(project => 
    project.name.toLowerCase().includes(query) ||
    project.customer.toLowerCase().includes(query) ||
    project.type.toLowerCase().includes(query)
  )
})

// 打开添加表单
const openAddForm = () => {
  isEditing.value = false
  formData.value = {
    id: 0,
    name: '',
    customer: '',
    type: '商标',
    status: '准备中',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
  showForm.value = true
}

// 打开编辑表单
const openEditForm = (project: any) => {
  isEditing.value = true
  formData.value = { ...project }
  showForm.value = true
}

// 验证表单数据
const validateForm = () => {
  let isValid = true
  
  // 清空错误信息
  errors.value = {
    name: '',
    customer: '',
    startDate: '',
    endDate: ''
  }
  
  // 验证项目名称
  if (!formData.value.name.trim()) {
    errors.value.name = '项目名称不能为空'
    isValid = false
  }
  
  // 验证客户
  if (!formData.value.customer.trim()) {
    errors.value.customer = '客户不能为空'
    isValid = false
  }
  
  // 验证开始日期
  if (!formData.value.startDate) {
    errors.value.startDate = '开始日期不能为空'
    isValid = false
  }
  
  // 验证结束日期
  if (!formData.value.endDate) {
    errors.value.endDate = '结束日期不能为空'
    isValid = false
  } else if (new Date(formData.value.endDate) < new Date(formData.value.startDate)) {
    errors.value.endDate = '结束日期不能早于开始日期'
    isValid = false
  }
  
  return isValid
}

// 提交表单
const submitForm = () => {
  if (!validateForm()) {
    return
  }

  if (isEditing.value) {
    // 编辑项目
    const index = projects.value.findIndex(p => p.id === formData.value.id)
    if (index > -1) {
      projects.value[index] = { ...formData.value }
      showMessage('项目编辑成功')
    }
  } else {
    // 添加项目
    const newProject = {
      ...formData.value,
      id: projects.value.length + 1
    }
    projects.value.push(newProject)
    showMessage('项目添加成功')
  }

  showForm.value = false
}

const handleSearch = () => {
  console.log('搜索项目:', searchQuery.value)
  // 搜索逻辑已经通过computed实现
  showMessage('搜索完成', 'info')
}

const handleViewProject = (project: any) => {
  console.log('查看项目:', project)
  // 使用详情对话框显示项目信息
  showDetail('项目详情', {
    '项目名称': project.name,
    '客户': project.customer,
    '类型': project.type,
    '状态': project.status,
    '开始日期': project.startDate,
    '结束日期': project.endDate
  })
}

const handleDeleteProject = (project: any) => {
  console.log('删除项目:', project)
  // 使用确认对话框进行删除操作
  showConfirm(`确定要删除项目 ${project.name} 吗？`, () => {
    const index = projects.value.findIndex(p => p.id === project.id)
    if (index > -1) {
      projects.value.splice(index, 1)
      showMessage('项目已删除')
    }
  })
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
.projects {
  height: 100%;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
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

.projects-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.projects-table table {
  width: 100%;
  border-collapse: collapse;
}

.projects-table th,
.projects-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.projects-table th {
  background: #fafafa;
  font-weight: bold;
  color: #333;
}

.projects-table tr:hover {
  background: #fafafa;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.status-badge.进行中 {
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}

.status-badge.已提交 {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-badge.已完成 {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.status-badge.准备中 {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.edit-button,
.view-button {
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

.view-button {
  background: white;
  color: #666;
}

.view-button:hover {
  background: #f0f0f0;
}

.delete-button {
  background: white;
  color: #f43f5e;
  border-color: #f43f5e;
}

.delete-button:hover {
  background: rgba(244, 63, 94, 0.1);
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

/* 详情对话框样式 */
.detail-dialog {
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

.detail-dialog-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 500px;
  max-width: 90%;
  max-height: 80%;
  overflow: hidden;
  animation: scaleIn 0.3s ease;
  display: flex;
  flex-direction: column;
}

.detail-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-dialog-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.detail-dialog-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.detail-item {
  display: flex;
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.detail-label {
  width: 100px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  flex-shrink: 0;
}

.detail-value {
  font-size: 14px;
  color: #333;
  flex: 1;
  word-break: break-all;
}

.detail-dialog-footer {
  display: flex;
  justify-content: center;
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.close-button-full {
  padding: 8px 32px;
  background: white;
  border: 1px solid #d9d9d9;
  color: #666;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.close-button-full:hover {
  background: #f0f0f0;
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