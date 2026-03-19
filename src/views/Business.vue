<template>
  <div class="business">
    <h1 class="page-title">业务管理</h1>
    
    <div class="action-bar">
      <button class="add-button" @click="openAddForm">+ 添加业务</button>
      <div class="search-box">
        <input type="text" placeholder="搜索业务..." v-model="searchQuery" />
        <button class="search-button" @click="handleSearch">🔍</button>
      </div>
    </div>

    <div class="business-table">
      <table>
        <thead>
          <tr>
            <th>业务名称</th>
            <th>客户</th>
            <th>类型</th>
            <th>价格</th>
            <th>官费</th>
            <th>预计周期</th>
            <th>已支付</th>
            <th>欠款</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="business in filteredBusinesses" :key="business.id">
            <td>{{ business.name }}</td>
            <td>{{ business.customer }}</td>
            <td>{{ business.type }}</td>
            <td>¥{{ business.price.toLocaleString() }}</td>
            <td>¥{{ business.officialFee.toLocaleString() }}</td>
            <td>{{ business.estimatedPeriod }}天</td>
            <td>¥{{ business.paidAmount.toLocaleString() }}</td>
            <td>
              <span :class="['amount-badge', business.owedAmount > 0 ? 'owed' : 'paid']">
                ¥{{ business.owedAmount.toLocaleString() }}
              </span>
            </td>
            <td>
              <span :class="['status-badge', business.status]">
                {{ business.status }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button class="edit-button" @click="openEditForm(business)">编辑</button>
                <button class="view-button" @click="handleViewBusiness(business)">查看</button>
                <button class="delete-button" @click="handleDeleteBusiness(business)">删除</button>
                <button class="contract-button" @click="handleContract(business)">合同</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 业务表单对话框 -->
    <div v-if="showForm" class="form-dialog">
      <div class="form-dialog-content">
        <div class="form-dialog-header">
          <h3>{{ isEditing ? '编辑业务' : '添加业务' }}</h3>
          <button class="close-button" @click="showForm = false">×</button>
        </div>
        <div class="form-dialog-body">
          <form @submit.prevent="submitForm">
            <div class="form-item">
              <label for="name">业务名称 *</label>
              <input type="text" id="name" v-model="formData.name" placeholder="请输入业务名称" required />
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
              <label for="type">业务类型 *</label>
              <select id="type" v-model="formData.type" required>
                <option value="">请选择业务类型</option>
                <option value="商标注册">商标注册</option>
                <option value="商标续展">商标续展</option>
                <option value="商标转让">商标转让</option>
                <option value="专利申请">专利申请</option>
                <option value="专利转让">专利转让</option>
                <option value="版权登记">版权登记</option>
                <option value="版权转让">版权转让</option>
              </select>
              <span v-if="errors.type" class="error-message">{{ errors.type }}</span>
            </div>
            <div class="form-item">
              <label for="price">业务价格 *</label>
              <input type="number" id="price" v-model.number="formData.price" placeholder="请输入业务价格" min="0" step="0.01" required />
              <span v-if="errors.price" class="error-message">{{ errors.price }}</span>
            </div>
            <div class="form-item">
              <label for="officialFee">官费 *</label>
              <input type="number" id="officialFee" v-model.number="formData.officialFee" placeholder="请输入官费" min="0" step="0.01" required />
              <span v-if="errors.officialFee" class="error-message">{{ errors.officialFee }}</span>
            </div>
            <div class="form-item">
              <label for="estimatedPeriod">预计周期（天） *</label>
              <input type="number" id="estimatedPeriod" v-model.number="formData.estimatedPeriod" placeholder="请输入预计周期" min="1" required />
              <span v-if="errors.estimatedPeriod" class="error-message">{{ errors.estimatedPeriod }}</span>
            </div>
            <div class="form-item">
              <label for="status">状态</label>
              <select id="status" v-model="formData.status">
                <option value="待处理">待处理</option>
                <option value="进行中">进行中</option>
                <option value="已完成">已完成</option>
                <option value="已终止">已终止</option>
              </select>
            </div>
            <div class="form-item">
              <label for="needsContract">需要签订合同</label>
              <input type="checkbox" id="needsContract" v-model="formData.needsContract" />
            </div>
            <div class="form-item">
              <label for="tracking">业务追踪</label>
              <textarea id="tracking" v-model="formData.tracking" placeholder="记录业务事实情况" rows="4"></textarea>
            </div>
            <div class="form-item">
              <label for="paidAmount">已支付金额</label>
              <input type="number" id="paidAmount" v-model.number="formData.paidAmount" placeholder="请输入已支付金额" min="0" step="0.01" />
            </div>
            <div class="form-item">
              <label for="owedAmount">欠款金额</label>
              <input type="number" id="owedAmount" v-model.number="formData.owedAmount" placeholder="请输入欠款金额" min="0" step="0.01" />
            </div>
            <div class="form-actions">
              <button type="button" class="cancel-button" @click="showForm = false">取消</button>
              <button type="submit" class="submit-button">保存</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 合同对话框 -->
    <div v-if="showContractDialog" class="contract-dialog">
      <div class="contract-dialog-content">
        <div class="contract-dialog-header">
          <h3>{{ contractDialog.title }}</h3>
          <button class="close-button" @click="showContractDialog = false">×</button>
        </div>
        <div class="contract-dialog-body">
          <div class="contract-info">
            <div class="contract-item">
              <span class="contract-label">业务名称:</span>
              <span class="contract-value">{{ contractDialog.business?.name }}</span>
            </div>
            <div class="contract-item">
              <span class="contract-label">客户:</span>
              <span class="contract-value">{{ contractDialog.business?.customer }}</span>
            </div>
            <div class="contract-item">
              <span class="contract-label">业务类型:</span>
              <span class="contract-value">{{ contractDialog.business?.type }}</span>
            </div>
            <div class="contract-item">
              <span class="contract-label">合同状态:</span>
              <span :class="['status-badge', contractDialog.contractStatus]">
                {{ contractDialog.contractStatus }}
              </span>
            </div>
          </div>
          
          <!-- 合同模板选择 -->
          <div class="contract-template-section">
            <h4>合同模板</h4>
            <div class="template-selector">
              <div class="template-option" @click="selectTemplate('default')" :class="{ active: selectedTemplate === 'default' }">
                <div class="template-icon">📄</div>
                <div class="template-name">默认模板</div>
              </div>
              <div class="template-option" @click="selectTemplate('custom')" :class="{ active: selectedTemplate === 'custom' }">
                <div class="template-icon">✏️</div>
                <div class="template-name">自定义模板</div>
              </div>
              <div class="template-option" @click="selectTemplate('upload')" :class="{ active: selectedTemplate === 'upload' }">
                <div class="template-icon">📤</div>
                <div class="template-name">上传模板</div>
              </div>
            </div>
          </div>
          
          <!-- 自定义模板编辑器 -->
          <div v-if="selectedTemplate === 'custom'" class="custom-template-editor">
            <h4>自定义合同内容</h4>
            <textarea v-model="customTemplateContent" placeholder="请输入合同内容..." rows="8"></textarea>
          </div>
          
          <!-- 上传模板 -->
          <div v-if="selectedTemplate === 'upload'" class="upload-template-section">
            <h4>上传合同模板</h4>
            <input type="file" @change="handleTemplateUpload" accept=".html,.docx,.pdf" />
            <div v-if="uploadedTemplate" class="uploaded-file-info">
              已上传: {{ uploadedTemplate.name }}
            </div>
          </div>
          
          <div class="contract-actions">
            <button class="generate-button" @click="generateContract">生成合同</button>
            <button class="sign-button" @click="signContract">签署合同</button>
            <button class="view-button" @click="viewContract">查看合同</button>
          </div>
        </div>
        <div class="contract-dialog-footer">
          <button class="close-button-full" @click="showContractDialog = false">关闭</button>
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
          <div v-if="detailDialog.data.tracking" class="detail-item">
            <span class="detail-label">业务追踪:</span>
            <span class="detail-value">{{ detailDialog.data.tracking }}</span>
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

// 模拟业务数据
const businesses = ref([
  { id: 1, name: '阿里巴巴商标注册', customer: '阿里巴巴集团', type: '商标注册', price: 5000, officialFee: 300, estimatedPeriod: 120, status: '进行中', needsContract: true, tracking: '已提交商标注册申请，等待受理', paidAmount: 3000, owedAmount: 2300 },
  { id: 2, name: '旷视科技专利申请', customer: '旷视科技', type: '专利申请', price: 12000, officialFee: 1000, estimatedPeriod: 180, status: '待处理', needsContract: true, tracking: '准备专利申请材料', paidAmount: 0, owedAmount: 13000 },
  { id: 3, name: '腾讯科技版权登记', customer: '腾讯科技', type: '版权登记', price: 3000, officialFee: 200, estimatedPeriod: 60, status: '已完成', needsContract: false, tracking: '版权登记已完成，证书已发放', paidAmount: 3200, owedAmount: 0 },
  { id: 4, name: '百度网讯商标续展', customer: '百度网讯', type: '商标续展', price: 4000, officialFee: 2000, estimatedPeriod: 60, status: '进行中', needsContract: true, tracking: '商标续展申请已提交', paidAmount: 3000, owedAmount: 3000 },
  { id: 5, name: '字节跳动专利转让', customer: '字节跳动', type: '专利转让', price: 20000, officialFee: 500, estimatedPeriod: 30, status: '待处理', needsContract: true, tracking: '准备专利转让协议', paidAmount: 10000, owedAmount: 10500 }
])

const searchQuery = ref('')
const showForm = ref(false)
const isEditing = ref(false)
const formData = ref({
  id: 0,
  name: '',
  customer: '',
  type: '',
  price: 0,
  officialFee: 0,
  estimatedPeriod: 0,
  status: '待处理',
  needsContract: false,
  tracking: '',
  paidAmount: 0,
  owedAmount: 0
})

// 错误状态
const errors = ref({
  name: '',
  customer: '',
  type: '',
  price: '',
  officialFee: '',
  estimatedPeriod: ''
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
  title: '业务详情',
  data: {} as any
})

// 合同对话框状态
const showContractDialog = ref(false)
const contractDialog = ref({
  title: '合同管理',
  business: null as any,
  contractStatus: '未生成'
})

// 合同模板相关状态
const selectedTemplate = ref('default')
const customTemplateContent = ref('')
const uploadedTemplate = ref<File | null>(null)

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

// 过滤后的业务列表
const filteredBusinesses = computed(() => {
  if (!searchQuery.value) {
    return businesses.value
  }
  const query = searchQuery.value.toLowerCase()
  return businesses.value.filter(business => 
    business.name.toLowerCase().includes(query) ||
    business.customer.toLowerCase().includes(query) ||
    business.type.toLowerCase().includes(query)
  )
})

// 打开添加表单
const openAddForm = () => {
  isEditing.value = false
  formData.value = {
    id: 0,
    name: '',
    customer: '',
    type: '',
    price: 0,
    officialFee: 0,
    estimatedPeriod: 0,
    status: '待处理',
    needsContract: false,
    tracking: '',
    paidAmount: 0,
    owedAmount: 0
  }
  showForm.value = true
}

// 打开编辑表单
const openEditForm = (business: any) => {
  isEditing.value = true
  formData.value = { ...business }
  showForm.value = true
}

// 验证表单数据
const validateForm = () => {
  let isValid = true
  
  // 清空错误信息
  errors.value = {
    name: '',
    customer: '',
    type: '',
    price: '',
    officialFee: '',
    estimatedPeriod: ''
  }
  
  // 验证业务名称
  if (!formData.value.name.trim()) {
    errors.value.name = '业务名称不能为空'
    isValid = false
  }
  
  // 验证客户
  if (!formData.value.customer) {
    errors.value.customer = '请选择客户'
    isValid = false
  }
  
  // 验证业务类型
  if (!formData.value.type) {
    errors.value.type = '请选择业务类型'
    isValid = false
  }
  
  // 验证价格
  if (!formData.value.price || formData.value.price <= 0) {
    errors.value.price = '价格必须大于0'
    isValid = false
  }
  
  // 验证官费
  if (!formData.value.officialFee || formData.value.officialFee < 0) {
    errors.value.officialFee = '官费不能为负数'
    isValid = false
  }
  
  // 验证预计周期
  if (!formData.value.estimatedPeriod || formData.value.estimatedPeriod <= 0) {
    errors.value.estimatedPeriod = '预计周期必须大于0'
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
    // 编辑业务
    const index = businesses.value.findIndex(b => b.id === formData.value.id)
    if (index > -1) {
      businesses.value[index] = { ...formData.value }
      showMessage('业务编辑成功')
    }
  } else {
    // 添加业务
    const newBusiness = {
      ...formData.value,
      id: businesses.value.length + 1
    }
    businesses.value.push(newBusiness)
    showMessage('业务添加成功')
  }

  showForm.value = false
}

const handleSearch = () => {
  console.log('搜索业务:', searchQuery.value)
  // 搜索逻辑已经通过computed实现
  showMessage('搜索完成', 'info')
}

const handleViewBusiness = (business: any) => {
  console.log('查看业务:', business)
  // 使用详情对话框显示业务信息
  showDetail('业务详情', {
    '业务名称': business.name,
    '客户': business.customer,
    '类型': business.type,
    '价格': `¥${business.price.toLocaleString()}`,
    '官费': `¥${business.officialFee.toLocaleString()}`,
    '预计周期': `${business.estimatedPeriod}天`,
    '已支付': `¥${business.paidAmount.toLocaleString()}`,
    '欠款': `¥${business.owedAmount.toLocaleString()}`,
    '状态': business.status,
    '需要合同': business.needsContract ? '是' : '否',
    'tracking': business.tracking
  })
}

const handleDeleteBusiness = (business: any) => {
  console.log('删除业务:', business)
  // 使用确认对话框进行删除操作
  showConfirm(`确定要删除业务 ${business.name} 吗？`, () => {
    const index = businesses.value.findIndex(b => b.id === business.id)
    if (index > -1) {
      businesses.value.splice(index, 1)
      showMessage('业务已删除')
    }
  })
}

const handleContract = (business: any) => {
  console.log('合同管理:', business)
  contractDialog.value = {
    title: '合同管理',
    business,
    contractStatus: business.needsContract ? '未生成' : '不需要'
  }
  showContractDialog.value = true
}

// 选择合同模板
const selectTemplate = (template: string) => {
  selectedTemplate.value = template
  if (template !== 'upload') {
    uploadedTemplate.value = null
  }
  if (template !== 'custom') {
    customTemplateContent.value = ''
  }
}

// 处理模板上传
const handleTemplateUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    uploadedTemplate.value = target.files[0]
    showMessage('模板文件已上传', 'info')
  }
}

// 生成合同
const generateContract = () => {
  console.log('生成合同', { selectedTemplate: selectedTemplate.value })
  
  // 根据选择的模板类型生成合同
  let templateType = ''
  switch (selectedTemplate.value) {
    case 'default':
      templateType = '默认模板'
      break
    case 'custom':
      templateType = '自定义模板'
      break
    case 'upload':
      templateType = '上传模板'
      break
  }
  
  showMessage(`合同已生成，使用${templateType}`, 'success')
  contractDialog.value.contractStatus = '已生成'
}

const signContract = () => {
  console.log('签署合同')
  showMessage('合同签署成功', 'success')
  contractDialog.value.contractStatus = '已签署'
}

const viewContract = () => {
  console.log('查看合同')
  showMessage('合同查看功能开发中', 'info')
}
</script>

<style scoped>
.business {
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

.business-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.business-table table {
  width: 100%;
  border-collapse: collapse;
}

.business-table th,
.business-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.business-table th {
  background: #fafafa;
  font-weight: bold;
  color: #333;
}

.business-table tr:hover {
  background: #fafafa;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.status-badge.待处理 {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.status-badge.进行中 {
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}

.status-badge.已完成 {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-badge.已终止 {
  background: rgba(244, 63, 94, 0.1);
  color: #f43f5e;
}

.amount-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.amount-badge.paid {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.amount-badge.owed {
  background: rgba(244, 63, 94, 0.1);
  color: #f43f5e;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.edit-button,
.view-button,
.delete-button,
.contract-button {
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

.contract-button {
  background: white;
  color: #722ed1;
  border-color: #722ed1;
}

.contract-button:hover {
  background: rgba(114, 46, 209, 0.1);
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
  width: 600px;
  max-width: 90%;
  max-height: 90%;
  overflow-y: auto;
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
.form-item select,
.form-item textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s;
}

.form-item input:focus,
.form-item select:focus,
.form-item textarea:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.form-item input[type="checkbox"] {
  width: auto;
  margin-right: 8px;
}

.error-message {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #f5222d;
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

/* 合同对话框样式 */
.contract-dialog {
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

.contract-dialog-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 500px;
  max-width: 90%;
  overflow: hidden;
}

.contract-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.contract-dialog-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.contract-dialog-body {
  padding: 20px;
}

.contract-info {
  margin-bottom: 20px;
}

.contract-item {
  display: flex;
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.contract-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.contract-label {
  width: 100px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  flex-shrink: 0;
}

.contract-value {
  font-size: 14px;
  color: #333;
  flex: 1;
}

.contract-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

/* 合同模板选择样式 */
.contract-template-section {
  margin: 20px 0;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.contract-template-section h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.template-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.template-option {
  padding: 16px;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.template-option:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

.template-option.active {
  border-color: #1890ff;
  background: rgba(24, 144, 255, 0.05);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

.template-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.template-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

/* 自定义模板编辑器样式 */
.custom-template-editor {
  margin: 20px 0;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.custom-template-editor h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.custom-template-editor textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  min-height: 150px;
  font-family: inherit;
}

.custom-template-editor textarea:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

/* 上传模板样式 */
.upload-template-section {
  margin: 20px 0;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.upload-template-section h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.upload-template-section input[type="file"] {
  margin-bottom: 12px;
  width: 100%;
  padding: 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: white;
}

.uploaded-file-info {
  padding: 8px 12px;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  color: #666;
  margin-top: 8px;
}

.generate-button,
.sign-button,
.view-button {
  flex: 1;
  padding: 10px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #d9d9d9;
}

.generate-button {
  background: #1890ff;
  border-color: #1890ff;
  color: white;
}

.generate-button:hover {
  background: #40a9ff;
  border-color: #40a9ff;
}

.sign-button {
  background: #10b981;
  border-color: #10b981;
  color: white;
}

.sign-button:hover {
  background: #34d399;
  border-color: #34d399;
}

.view-button {
  background: white;
  color: #666;
}

.view-button:hover {
  background: #f0f0f0;
}

.contract-dialog-footer {
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

/* 响应式设计 */
@media (max-width: 768px) {
  .action-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .search-box input {
    width: 250px;
  }

  .business-table {
    overflow-x: auto;
  }

  .business-table table {
    min-width: 800px;
  }

  .action-buttons {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-buttons button {
    width: 100%;
    text-align: center;
  }

  .form-dialog-content {
    width: 95%;
    max-height: 95%;
  }

  .contract-actions {
    flex-direction: column;
  }
}
</style>