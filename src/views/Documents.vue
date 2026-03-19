<template>
  <div class="documents">
    <h1 class="page-title">文档管理</h1>
    
    <div class="action-bar">
      <button class="add-button" @click="openUploadForm">+ 上传文档</button>
      <div class="search-box">
        <input type="text" placeholder="搜索文档..." v-model="searchQuery" />
        <button class="search-button" @click="handleSearch">🔍</button>
      </div>
    </div>

    <div class="documents-table">
      <table>
        <thead>
          <tr>
            <th>文档名称</th>
            <th>客户</th>
            <th>类型</th>
            <th>版本</th>
            <th>上传日期</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="document in filteredDocuments" :key="document.id">
            <td>{{ document.name }}</td>
            <td>{{ document.customer }}</td>
            <td>{{ document.type }}</td>
            <td>{{ document.version }}</td>
            <td>{{ document.uploadDate }}</td>
            <td>
              <div class="action-buttons">
                <button class="download-button" @click="handleDownloadDocument(document)">下载</button>
                <button class="preview-button" @click="handlePreviewDocument(document)">预览</button>
                <button class="delete-button" @click="handleDeleteDocument(document)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 上传文档表单对话框 -->
    <div v-if="showUploadForm" class="form-dialog">
      <div class="form-dialog-content">
        <div class="form-dialog-header">
          <h3>上传文档</h3>
          <button class="close-button" @click="showUploadForm = false">×</button>
        </div>
        <div class="form-dialog-body">
          <form @submit.prevent="submitUpload">
            <div class="form-item">
              <label for="customer">客户 *</label>
              <select id="customer" v-model="uploadForm.customer" required>
                <option value="">请选择客户</option>
                <option v-for="customer in customers" :key="customer.id" :value="customer.name">
                  {{ customer.name }}
                </option>
              </select>
              <span v-if="errors.customer" class="error-message">{{ errors.customer }}</span>
            </div>
            <div class="form-item">
              <label for="documentType">文档类型</label>
              <select id="documentType" v-model="uploadForm.type">
                <option value="申请材料">申请材料</option>
                <option value="专利材料">专利材料</option>
                <option value="登记材料">登记材料</option>
                <option value="续展材料">续展材料</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div class="form-item">
              <label for="file">选择文件 *</label>
              <input type="file" id="file" ref="fileInput" @change="handleFileChange" required />
              <span v-if="errors.file" class="error-message">{{ errors.file }}</span>
              <div v-if="selectedFile" class="file-info">
                已选择: {{ selectedFile.name }}
              </div>
            </div>
            <div class="form-actions">
              <button type="button" class="cancel-button" @click="showUploadForm = false">取消</button>
              <button type="submit" class="submit-button">上传</button>
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
const documents = ref([
  { id: 1, name: '阿里云商标注册申请书', customer: '阿里巴巴集团', type: '申请材料', version: 1.0, uploadDate: '2026-01-15' },
  { id: 2, name: '人脸识别专利说明书', customer: '旷视科技', type: '专利材料', version: 1.2, uploadDate: '2026-02-01' },
  { id: 3, name: '软件著作权登记申请表', customer: '腾讯科技', type: '登记材料', version: 1.0, uploadDate: '2026-01-01' },
  { id: 4, name: '微信商标续展申请书', customer: '腾讯科技', type: '续展材料', version: 1.1, uploadDate: '2026-03-01' },
  { id: 5, name: '人工智能专利申请说明书', customer: '百度网讯', type: '专利材料', version: 1.0, uploadDate: '2026-03-15' }
])

const searchQuery = ref('')

// 上传表单状态
const showUploadForm = ref(false)
const uploadForm = ref({
  customer: '',
  type: '申请材料'
})
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

// 错误状态
const errors = ref({
  customer: '',
  file: ''
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
  title: '文档详情',
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

// 过滤后的文档列表
const filteredDocuments = computed(() => {
  if (!searchQuery.value) {
    return documents.value
  }
  const query = searchQuery.value.toLowerCase()
  return documents.value.filter(document => 
    document.name.toLowerCase().includes(query) ||
    document.customer.toLowerCase().includes(query) ||
    document.type.toLowerCase().includes(query)
  )
})

// 打开上传表单
const openUploadForm = () => {
  uploadForm.value = {
    customer: '',
    type: '申请材料'
  }
  selectedFile.value = null
  errors.value = {
    customer: '',
    file: ''
  }
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  showUploadForm.value = true
}

// 处理文件选择
const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
  }
}

// 验证上传表单
const validateUploadForm = () => {
  let isValid = true
  
  errors.value = {
    customer: '',
    file: ''
  }
  
  if (!uploadForm.value.customer) {
    errors.value.customer = '请选择客户'
    isValid = false
  }
  
  if (!selectedFile.value) {
    errors.value.file = '请选择文件'
    isValid = false
  }
  
  return isValid
}

// 提交上传表单
const submitUpload = () => {
  if (!validateUploadForm()) {
    return
  }
  
  // 模拟上传操作
  setTimeout(() => {
    const newDocument = {
      id: documents.value.length + 1,
      name: selectedFile.value?.name || '未知文档',
      customer: uploadForm.value.customer,
      type: uploadForm.value.type,
      version: 1.0,
      uploadDate: new Date().toISOString().split('T')[0]
    }
    documents.value.push(newDocument)
    showMessage('文档上传成功')
    showUploadForm.value = false
  }, 1000)
}

// 事件处理函数
const handleSearch = () => {
  console.log('搜索文档:', searchQuery.value)
  // 搜索逻辑已经通过computed实现
  showMessage('搜索完成', 'info')
}

const handleDownloadDocument = (document: any) => {
  console.log('下载文档:', document)
  // 模拟下载功能
  showMessage(`正在下载文档: ${document.name}`, 'info')
}

const handlePreviewDocument = (document: any) => {
  console.log('预览文档:', document)
  // 使用详情对话框显示文档信息
  showDetail('文档详情', {
    '文档名称': document.name,
    '客户': document.customer,
    '类型': document.type,
    '版本': document.version,
    '上传日期': document.uploadDate
  })
}

const handleDeleteDocument = (document: any) => {
  console.log('删除文档:', document)
  // 使用确认对话框进行删除操作
  showConfirm(`确定要删除文档 ${document.name} 吗？`, () => {
    const index = documents.value.findIndex(d => d.id === document.id)
    if (index > -1) {
      documents.value.splice(index, 1)
      showMessage('文档已删除')
    }
  })
}
</script>

<style scoped>
.documents {
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

.documents-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.documents-table table {
  width: 100%;
  border-collapse: collapse;
}

.documents-table th,
.documents-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.documents-table th {
  background: #fafafa;
  font-weight: bold;
  color: #333;
}

.documents-table tr:hover {
  background: #fafafa;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.download-button,
.preview-button,
.delete-button {
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

.preview-button {
  background: white;
  color: #10b981;
  border-color: #10b981;
}

.preview-button:hover {
  background: rgba(16, 185, 129, 0.1);
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

.error-message {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #f5222d;
}

.file-info {
  margin-top: 8px;
  font-size: 14px;
  color: #666;
  background: #fafafa;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #f0f0f0;
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