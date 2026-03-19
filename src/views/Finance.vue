<template>
  <div class="finance">
    <h1 class="page-title">财务管理</h1>
    
    <!-- 标签页 -->
    <div class="tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="['tab-button', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.name }}
      </button>
    </div>

    <!-- 费用管理 -->
    <div v-if="activeTab === 'expenses'" class="tab-content">
      <div class="action-bar">
        <button class="add-button" @click="openAddForm('expense')">+ 添加费用</button>
        <div class="search-box">
          <input type="text" placeholder="搜索费用..." v-model="searchQuery.expense" />
          <button class="search-button" @click="handleSearch('expense')">🔍</button>
        </div>
      </div>

      <div class="finance-table">
        <table>
          <thead>
            <tr>
              <th>费用名称</th>
              <th>客户</th>
              <th>类型</th>
              <th>金额</th>
              <th>日期</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="expense in filteredExpenses" :key="expense.id">
              <td>{{ expense.name }}</td>
              <td>{{ expense.customer }}</td>
              <td>{{ expense.type }}</td>
              <td>¥{{ expense.amount.toLocaleString() }}</td>
              <td>{{ expense.date }}</td>
              <td>
                <div class="action-buttons">
                  <button class="edit-button" @click="openEditForm('expense', expense)">编辑</button>
                  <button class="delete-button" @click="handleDelete('expense', expense)">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 应收管理 -->
    <div v-if="activeTab === 'receivables'" class="tab-content">
      <div class="action-bar">
        <button class="add-button" @click="openAddForm('receivable')">+ 添加应收</button>
        <div class="search-box">
          <input type="text" placeholder="搜索应收..." v-model="searchQuery.receivable" />
          <button class="search-button" @click="handleSearch('receivable')">🔍</button>
        </div>
      </div>

      <div class="finance-table">
        <table>
          <thead>
            <tr>
              <th>项目名称</th>
              <th>客户</th>
              <th>金额</th>
              <th>到期日期</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="receivable in filteredReceivables" :key="receivable.id">
              <td>{{ receivable.projectName }}</td>
              <td>{{ receivable.customer }}</td>
              <td>¥{{ receivable.amount.toLocaleString() }}</td>
              <td>{{ receivable.dueDate }}</td>
              <td :class="['status-badge', receivable.status]">{{ receivable.status }}</td>
              <td>
                <div class="action-buttons">
                  <button class="edit-button" @click="openEditForm('receivable', receivable)">编辑</button>
                  <button class="delete-button" @click="handleDelete('receivable', receivable)">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 欠款管理 -->
    <div v-if="activeTab === 'debts'" class="tab-content">
      <div class="action-bar">
        <button class="add-button" @click="openAddForm('debt')">+ 添加欠款</button>
        <div class="search-box">
          <input type="text" placeholder="搜索欠款..." v-model="searchQuery.debt" />
          <button class="search-button" @click="handleSearch('debt')">🔍</button>
        </div>
      </div>

      <div class="finance-table">
        <table>
          <thead>
            <tr>
              <th>欠款名称</th>
              <th>供应商</th>
              <th>金额</th>
              <th>到期日期</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="debt in filteredDebts" :key="debt.id">
              <td>{{ debt.name }}</td>
              <td>{{ debt.supplier }}</td>
              <td>¥{{ debt.amount.toLocaleString() }}</td>
              <td>{{ debt.dueDate }}</td>
              <td :class="['status-badge', debt.status]">{{ debt.status }}</td>
              <td>
                <div class="action-buttons">
                  <button class="edit-button" @click="openEditForm('debt', debt)">编辑</button>
                  <button class="delete-button" @click="handleDelete('debt', debt)">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 财务统计 -->
    <div class="finance-stats">
      <h2 class="section-title">财务统计</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">总收入</div>
          <div class="stat-value income">¥{{ stats.totalIncome.toLocaleString() }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">总支出</div>
          <div class="stat-value expense">¥{{ stats.totalExpense.toLocaleString() }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">净利润</div>
          <div class="stat-value profit">¥{{ (stats.totalIncome - stats.totalExpense).toLocaleString() }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">应收总额</div>
          <div class="stat-value receivable">¥{{ stats.totalReceivables.toLocaleString() }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">欠款总额</div>
          <div class="stat-value debt">¥{{ stats.totalDebts.toLocaleString() }}</div>
        </div>
      </div>
    </div>

    <!-- 表单对话框 -->
    <div v-if="showForm" class="form-dialog">
      <div class="form-dialog-content">
        <div class="form-dialog-header">
          <h3>{{ isEditing ? `编辑${getFormTitle()}` : `添加${getFormTitle()}` }}</h3>
          <button class="close-button" @click="showForm = false">×</button>
        </div>
        <div class="form-dialog-body">
          <form @submit.prevent="submitForm">
            <!-- 费用表单 -->
            <template v-if="formType === 'expense'">
              <div class="form-item">
                <label for="name">费用名称 *</label>
                <input type="text" id="name" v-model="formData.name" placeholder="请输入费用名称" required />
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
                  <option value="收入">收入</option>
                  <option value="支出">支出</option>
                </select>
              </div>
              <div class="form-item">
                <label for="businessId">关联业务</label>
                <select id="businessId" v-model="formData.businessId">
                  <option value="">请选择业务</option>
                  <option v-for="business in businesses" :key="business.id" :value="business.id">
                    {{ business.name }}
                  </option>
                </select>
              </div>
              <div class="form-item">
                <label for="amount">金额 *</label>
                <input type="number" id="amount" v-model.number="formData.amount" placeholder="请输入金额" min="0" step="0.01" required />
                <span v-if="errors.amount" class="error-message">{{ errors.amount }}</span>
              </div>
              <div class="form-item">
                <label for="date">日期 *</label>
                <input type="date" id="date" v-model="formData.date" required />
                <span v-if="errors.date" class="error-message">{{ errors.date }}</span>
              </div>
            </template>

            <!-- 应收表单 -->
            <template v-if="formType === 'receivable'">
              <div class="form-item">
                <label for="projectName">项目名称 *</label>
                <input type="text" id="projectName" v-model="formData.projectName" placeholder="请输入项目名称" required />
                <span v-if="errors.projectName" class="error-message">{{ errors.projectName }}</span>
              </div>
              <div class="form-item">
                <label for="customer">客户 *</label>
                <input type="text" id="customer" v-model="formData.customer" placeholder="请输入客户名称" required />
                <span v-if="errors.customer" class="error-message">{{ errors.customer }}</span>
              </div>
              <div class="form-item">
                <label for="amount">金额 *</label>
                <input type="number" id="amount" v-model.number="formData.amount" placeholder="请输入金额" min="0" step="0.01" required />
                <span v-if="errors.amount" class="error-message">{{ errors.amount }}</span>
              </div>
              <div class="form-item">
                <label for="dueDate">到期日期 *</label>
                <input type="date" id="dueDate" v-model="formData.dueDate" required />
                <span v-if="errors.dueDate" class="error-message">{{ errors.dueDate }}</span>
              </div>
              <div class="form-item">
                <label for="status">状态</label>
                <select id="status" v-model="formData.status">
                  <option value="未到期">未到期</option>
                  <option value="已到期">已到期</option>
                  <option value="已结清">已结清</option>
                </select>
              </div>
            </template>

            <!-- 欠款表单 -->
            <template v-if="formType === 'debt'">
              <div class="form-item">
                <label for="name">欠款名称 *</label>
                <input type="text" id="name" v-model="formData.name" placeholder="请输入欠款名称" required />
                <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
              </div>
              <div class="form-item">
                <label for="supplier">供应商 *</label>
                <input type="text" id="supplier" v-model="formData.supplier" placeholder="请输入供应商名称" required />
                <span v-if="errors.supplier" class="error-message">{{ errors.supplier }}</span>
              </div>
              <div class="form-item">
                <label for="amount">金额 *</label>
                <input type="number" id="amount" v-model.number="formData.amount" placeholder="请输入金额" min="0" step="0.01" required />
                <span v-if="errors.amount" class="error-message">{{ errors.amount }}</span>
              </div>
              <div class="form-item">
                <label for="dueDate">到期日期 *</label>
                <input type="date" id="dueDate" v-model="formData.dueDate" required />
                <span v-if="errors.dueDate" class="error-message">{{ errors.dueDate }}</span>
              </div>
              <div class="form-item">
                <label for="status">状态</label>
                <select id="status" v-model="formData.status">
                  <option value="未到期">未到期</option>
                  <option value="已到期">已到期</option>
                  <option value="已结清">已结清</option>
                </select>
              </div>
            </template>

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

// 标签页配置
const tabs = ref([
  { id: 'expenses', name: '费用管理' },
  { id: 'receivables', name: '应收管理' },
  { id: 'debts', name: '欠款管理' }
])

const activeTab = ref('expenses')

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
  { id: 1, name: '阿里巴巴商标注册' },
  { id: 2, name: '旷视科技专利申请' },
  { id: 3, name: '腾讯科技版权登记' },
  { id: 4, name: '百度网讯商标续展' },
  { id: 5, name: '字节跳动专利转让' }
])

// 模拟数据
const expenses = ref([
  { id: 1, name: '商标注册费用', customer: '阿里巴巴集团', type: '收入', amount: 5000, date: '2026-01-15', businessId: 1 },
  { id: 2, name: '专利申请费用', customer: '旷视科技', type: '收入', amount: 12000, date: '2026-02-01', businessId: 2 },
  { id: 3, name: '版权登记费用', customer: '腾讯科技', type: '收入', amount: 3000, date: '2026-01-01', businessId: 3 },
  { id: 4, name: '商标续展费用', customer: '腾讯科技', type: '收入', amount: 4000, date: '2026-03-01', businessId: 4 },
  { id: 5, name: '办公费用', customer: '公司内部', type: '支出', amount: 1500, date: '2026-03-10', businessId: null }
])

const receivables = ref([
  { id: 1, projectName: '商标注册项目', customer: '阿里巴巴集团', amount: 10000, dueDate: '2026-04-15', status: '未到期' },
  { id: 2, projectName: '专利申请项目', customer: '旷视科技', amount: 20000, dueDate: '2026-05-01', status: '未到期' },
  { id: 3, projectName: '版权登记项目', customer: '腾讯科技', amount: 5000, dueDate: '2026-03-15', status: '已到期' },
  { id: 4, projectName: '商标续展项目', customer: '腾讯科技', amount: 8000, dueDate: '2026-06-01', status: '未到期' }
])

const debts = ref([
  { id: 1, name: '办公设备采购', supplier: '联想科技', amount: 5000, dueDate: '2026-03-20', status: '未到期' },
  { id: 2, name: '办公用品采购', supplier: '得力文具', amount: 1000, dueDate: '2026-03-15', status: '已到期' },
  { id: 3, name: '软件授权费用', supplier: '微软中国', amount: 3000, dueDate: '2026-04-01', status: '未到期' }
])

const stats = ref({
  totalIncome: 24000,
  totalExpense: 1500,
  totalReceivables: 43000,
  totalDebts: 9000
})

const searchQuery = ref({
  expense: '',
  receivable: '',
  debt: ''
})

const showForm = ref(false)
const isEditing = ref(false)
const formType = ref('expense')
const formData = ref({
  id: 0,
  name: '',
  customer: '',
  projectName: '',
  supplier: '',
  type: '收入',
  amount: 0,
  date: new Date().toISOString().split('T')[0],
  dueDate: new Date().toISOString().split('T')[0],
  status: '未到期',
  businessId: null
})

// 错误状态
const errors = ref({
  name: '',
  customer: '',
  projectName: '',
  supplier: '',
  amount: '',
  date: '',
  dueDate: ''
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

// 过滤后的费用列表
const filteredExpenses = computed(() => {
  if (!searchQuery.value.expense) {
    return expenses.value
  }
  const query = searchQuery.value.expense.toLowerCase()
  return expenses.value.filter(expense => 
    expense.name.toLowerCase().includes(query) ||
    expense.customer.toLowerCase().includes(query) ||
    expense.type.toLowerCase().includes(query)
  )
})

// 过滤后的应收列表
const filteredReceivables = computed(() => {
  if (!searchQuery.value.receivable) {
    return receivables.value
  }
  const query = searchQuery.value.receivable.toLowerCase()
  return receivables.value.filter(receivable => 
    receivable.projectName.toLowerCase().includes(query) ||
    receivable.customer.toLowerCase().includes(query) ||
    receivable.status.toLowerCase().includes(query)
  )
})

// 过滤后的欠款列表
const filteredDebts = computed(() => {
  if (!searchQuery.value.debt) {
    return debts.value
  }
  const query = searchQuery.value.debt.toLowerCase()
  return debts.value.filter(debt => 
    debt.name.toLowerCase().includes(query) ||
    debt.supplier.toLowerCase().includes(query) ||
    debt.status.toLowerCase().includes(query)
  )
})

// 获取表单标题
const getFormTitle = () => {
  switch (formType.value) {
    case 'expense': return '费用'
    case 'receivable': return '应收'
    case 'debt': return '欠款'
    default: return ''
  }
}

// 打开添加表单
const openAddForm = (type: string) => {
  formType.value = type
  isEditing.value = false
  formData.value = {
    id: 0,
    name: '',
    customer: '',
    projectName: '',
    supplier: '',
    type: '收入',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    status: '未到期',
    businessId: null
  }
  showForm.value = true
}

// 打开编辑表单
const openEditForm = (type: string, item: any) => {
  formType.value = type
  isEditing.value = true
  formData.value = { ...item, businessId: item.businessId || null }
  showForm.value = true
}

// 验证表单数据
const validateForm = () => {
  let isValid = true
  
  // 清空错误信息
  errors.value = {
    name: '',
    customer: '',
    projectName: '',
    supplier: '',
    amount: '',
    date: '',
    dueDate: ''
  }
  
  if (formType.value === 'expense') {
    // 验证费用名称
    if (!formData.value.name.trim()) {
      errors.value.name = '费用名称不能为空'
      isValid = false
    }
    
    // 验证客户
    if (!formData.value.customer.trim()) {
      errors.value.customer = '客户不能为空'
      isValid = false
    }
    
    // 验证金额
    if (!formData.value.amount || formData.value.amount <= 0) {
      errors.value.amount = '金额必须大于0'
      isValid = false
    }
    
    // 验证日期
    if (!formData.value.date) {
      errors.value.date = '日期不能为空'
      isValid = false
    }
  } else if (formType.value === 'receivable') {
    // 验证项目名称
    if (!formData.value.projectName.trim()) {
      errors.value.projectName = '项目名称不能为空'
      isValid = false
    }
    
    // 验证客户
    if (!formData.value.customer.trim()) {
      errors.value.customer = '客户不能为空'
      isValid = false
    }
    
    // 验证金额
    if (!formData.value.amount || formData.value.amount <= 0) {
      errors.value.amount = '金额必须大于0'
      isValid = false
    }
    
    // 验证到期日期
    if (!formData.value.dueDate) {
      errors.value.dueDate = '到期日期不能为空'
      isValid = false
    }
  } else if (formType.value === 'debt') {
    // 验证欠款名称
    if (!formData.value.name.trim()) {
      errors.value.name = '欠款名称不能为空'
      isValid = false
    }
    
    // 验证供应商
    if (!formData.value.supplier.trim()) {
      errors.value.supplier = '供应商不能为空'
      isValid = false
    }
    
    // 验证金额
    if (!formData.value.amount || formData.value.amount <= 0) {
      errors.value.amount = '金额必须大于0'
      isValid = false
    }
    
    // 验证到期日期
    if (!formData.value.dueDate) {
      errors.value.dueDate = '到期日期不能为空'
      isValid = false
    }
  }
  
  return isValid
}

// 提交表单
const submitForm = () => {
  if (!validateForm()) {
    return
  }

  if (isEditing.value) {
    // 编辑操作
    if (formType.value === 'expense') {
      const index = expenses.value.findIndex(e => e.id === formData.value.id)
      if (index > -1) {
        expenses.value[index] = { ...formData.value }
        updateStats()
        showMessage('费用编辑成功')
      }
    } else if (formType.value === 'receivable') {
      const index = receivables.value.findIndex(r => r.id === formData.value.id)
      if (index > -1) {
        receivables.value[index] = { ...formData.value }
        updateStats()
        showMessage('应收编辑成功')
      }
    } else if (formType.value === 'debt') {
      const index = debts.value.findIndex(d => d.id === formData.value.id)
      if (index > -1) {
        debts.value[index] = { ...formData.value }
        updateStats()
        showMessage('欠款编辑成功')
      }
    }
  } else {
    // 添加操作
    if (formType.value === 'expense') {
      const newExpense = {
        ...formData.value,
        id: expenses.value.length + 1
      }
      expenses.value.push(newExpense)
      updateStats()
      showMessage('费用添加成功')
    } else if (formType.value === 'receivable') {
      const newReceivable = {
        ...formData.value,
        id: receivables.value.length + 1
      }
      receivables.value.push(newReceivable)
      updateStats()
      showMessage('应收添加成功')
    } else if (formType.value === 'debt') {
      const newDebt = {
        ...formData.value,
        id: debts.value.length + 1
      }
      debts.value.push(newDebt)
      updateStats()
      showMessage('欠款添加成功')
    }
  }

  showForm.value = false
}

const handleSearch = (type: string) => {
  console.log(`搜索${type}:`, (searchQuery.value as any)[type])
  // 搜索逻辑已经通过computed实现
  showMessage('搜索完成', 'info')
}

const handleDelete = (type: string, item: any) => {
  console.log(`删除${type}:`, item)
  // 使用确认对话框进行删除操作
  showConfirm(`确定要删除${getFormTitle()} ${item.name || item.projectName} 吗？`, () => {
    if (type === 'expense') {
      const index = expenses.value.findIndex(e => e.id === item.id)
      if (index > -1) {
        expenses.value.splice(index, 1)
        updateStats()
        showMessage('费用已删除')
      }
    } else if (type === 'receivable') {
      const index = receivables.value.findIndex(r => r.id === item.id)
      if (index > -1) {
        receivables.value.splice(index, 1)
        updateStats()
        showMessage('应收已删除')
      }
    } else if (type === 'debt') {
      const index = debts.value.findIndex(d => d.id === item.id)
      if (index > -1) {
        debts.value.splice(index, 1)
        updateStats()
        showMessage('欠款已删除')
      }
    }
  })
}

// 更新统计数据
const updateStats = () => {
  const totalIncome = expenses.value
    .filter(e => e.type === '收入')
    .reduce((sum, e) => sum + e.amount, 0)
  const totalExpense = expenses.value
    .filter(e => e.type === '支出')
    .reduce((sum, e) => sum + e.amount, 0)
  const totalReceivables = receivables.value
    .reduce((sum, r) => sum + r.amount, 0)
  const totalDebts = debts.value
    .reduce((sum, d) => sum + d.amount, 0)
  
  stats.value = {
    totalIncome,
    totalExpense,
    totalReceivables,
    totalDebts
  }
}
</script>

<style scoped>
.finance {
  height: 100%;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

/* 标签页样式 */
.tabs {
  display: flex;
  gap: 2px;
  margin-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.tab-button {
  padding: 10px 20px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-bottom: none;
  border-radius: 4px 4px 0 0;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  color: #666;
}

.tab-button:hover {
  background: #f0f0f0;
  color: #333;
}

.tab-button.active {
  background: white;
  border-color: #1890ff;
  color: #1890ff;
  font-weight: 500;
  box-shadow: 0 -2px 0 0 #1890ff inset;
}

.tab-content {
  margin-bottom: 30px;
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

.finance-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 30px;
}

.finance-table table {
  width: 100%;
  border-collapse: collapse;
}

.finance-table th,
.finance-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.finance-table th {
  background: #fafafa;
  font-weight: bold;
  color: #333;
}

.finance-table tr:hover {
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

/* 状态徽章样式 */
.status-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.未到期 {
  background: #e6f7ff;
  color: #1890ff;
}

.status-badge.已到期 {
  background: #fff7e6;
  color: #fa8c16;
}

.status-badge.已结清 {
  background: #f6ffed;
  color: #52c41a;
}

.finance-stats {
  margin-top: 30px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
}

.stat-value.income {
  color: #10b981;
}

.stat-value.expense {
  color: #f43f5e;
}

.stat-value.profit {
  color: #1890ff;
}

.stat-value.receivable {
  color: #722ed1;
}

.stat-value.debt {
  color: #fa8c16;
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