<template>
  <div class="workflow">
    <h1 class="page-title">流程管理</h1>
    
    <div class="workflow-tabs">
      <button class="tab-button" :class="{ active: activeTab === 'processes' }" @click="activeTab = 'processes'">流程定义</button>
      <button class="tab-button" :class="{ active: activeTab === 'executions' }" @click="activeTab = 'executions'">流程执行</button>
      <button class="tab-button" :class="{ active: activeTab === 'history' }" @click="activeTab = 'history'">历史记录</button>
    </div>

    <!-- 流程定义 -->
    <div class="tab-content" v-if="activeTab === 'processes'">
      <div class="action-bar">
        <button class="add-button" @click="openAddProcessForm">+ 添加流程</button>
        <div class="search-box">
          <input type="text" placeholder="搜索流程..." v-model="searchQuery" />
          <button class="search-button" @click="handleSearch">🔍</button>
        </div>
      </div>

      <div class="processes-table">
        <table>
          <thead>
            <tr>
              <th>流程名称</th>
              <th>描述</th>
              <th>步骤数</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="process in filteredProcesses" :key="process.id">
              <td>{{ process.name }}</td>
              <td>{{ process.description }}</td>
              <td>{{ process.steps.length }}</td>
              <td>{{ process.createdAt }}</td>
              <td>
                <div class="action-buttons">
                  <button class="edit-button" @click="openEditProcessForm(process)">编辑</button>
                  <button class="run-button" @click="runProcess(process)">执行</button>
                  <button class="delete-button" @click="handleDeleteProcess(process)">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 流程执行 -->
    <div class="tab-content" v-else-if="activeTab === 'executions'">
      <div class="action-bar">
        <button class="add-button" @click="openRunProcessDialog">+ 执行流程</button>
      </div>

      <div class="executions-table">
        <table>
          <thead>
            <tr>
              <th>执行ID</th>
              <th>流程名称</th>
              <th>状态</th>
              <th>开始时间</th>
              <th>结束时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="execution in executions" :key="execution.id">
              <td>{{ execution.id }}</td>
              <td>{{ execution.processName }}</td>
              <td>
                <span :class="['status-badge', execution.status]">
                  {{ execution.status }}
                </span>
              </td>
              <td>{{ execution.startTime }}</td>
              <td>{{ execution.endTime || '进行中' }}</td>
              <td>
                <div class="action-buttons">
                  <button class="view-button" @click="viewExecution(execution)">查看</button>
                  <button class="stop-button" v-if="execution.status === '进行中'" @click="stopExecution(execution)">停止</button>
                  <button class="complete-button" v-if="execution.status === '进行中'" @click="completeExecution(execution)">一键完成</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 历史记录 -->
    <div class="tab-content" v-else-if="activeTab === 'history'">
      <div class="action-bar">
        <div class="search-box">
          <input type="text" placeholder="搜索历史..." v-model="historySearchQuery" />
          <button class="search-button" @click="handleHistorySearch">🔍</button>
        </div>
      </div>

      <div class="history-table">
        <table>
          <thead>
            <tr>
              <th>执行ID</th>
              <th>流程名称</th>
              <th>状态</th>
              <th>开始时间</th>
              <th>结束时间</th>
              <th>执行方式</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="history in filteredHistory" :key="history.id">
              <td>{{ history.id }}</td>
              <td>{{ history.processName }}</td>
              <td>
                <span :class="['status-badge', history.status]">
                  {{ history.status }}
                </span>
              </td>
              <td>{{ history.startTime }}</td>
              <td>{{ history.endTime }}</td>
              <td>{{ history.executionMode }}</td>
              <td>
                <div class="action-buttons">
                  <button class="view-button" @click="viewExecution(history)">查看</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 添加/编辑流程对话框 -->
    <div v-if="showProcessForm" class="form-dialog">
      <div class="form-dialog-content">
        <div class="form-dialog-header">
          <h3>{{ isEditingProcess ? '编辑流程' : '添加流程' }}</h3>
          <button class="close-button" @click="showProcessForm = false">×</button>
        </div>
        <div class="form-dialog-body">
          <form @submit.prevent="submitProcessForm">
            <div class="form-item">
              <label for="processName">流程名称 *</label>
              <input type="text" id="processName" v-model="processFormData.name" placeholder="请输入流程名称" required />
              <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
            </div>
            <div class="form-item">
              <label for="processDescription">描述</label>
              <textarea id="processDescription" v-model="processFormData.description" placeholder="请输入流程描述" rows="3"></textarea>
            </div>
            <div class="form-item">
              <label>流程步骤</label>
              <div class="steps-container">
                <div v-for="(step, index) in processFormData.steps" :key="index" class="step-item">
                  <div class="step-header">
                    <input type="text" v-model="step.name" placeholder="步骤名称" required />
                    <input type="text" v-model="step.description" placeholder="步骤描述" />
                    <button type="button" class="remove-step-button" @click="removeStep(index)">×</button>
                  </div>
                  <div class="step-config">
                    <label>
                      <input type="checkbox" v-model="step.autoComplete" />
                      自动完成
                    </label>
                    <input type="number" v-model.number="step.duration" placeholder="预计时长(分钟)" min="1" />
                  </div>
                </div>
                <button type="button" class="add-step-button" @click="addStep">+ 添加步骤</button>
              </div>
            </div>
            <div class="form-actions">
              <button type="button" class="cancel-button" @click="showProcessForm = false">取消</button>
              <button type="submit" class="submit-button">保存</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 执行流程对话框 -->
    <div v-if="showRunDialog" class="form-dialog">
      <div class="form-dialog-content">
        <div class="form-dialog-header">
          <h3>执行流程</h3>
          <button class="close-button" @click="showRunDialog = false">×</button>
        </div>
        <div class="form-dialog-body">
          <div class="form-item">
            <label for="processSelect">选择流程 *</label>
            <select id="processSelect" v-model="selectedProcessId" required>
              <option value="">请选择流程</option>
              <option v-for="process in processes" :key="process.id" :value="process.id">
                {{ process.name }}
              </option>
            </select>
          </div>
          <div class="form-item">
            <label for="executionMode">执行方式</label>
            <select id="executionMode" v-model="executionMode">
              <option value="manual">手动执行</option>
              <option value="auto">自动执行</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="button" class="cancel-button" @click="showRunDialog = false">取消</button>
            <button type="button" class="submit-button" @click="submitRunProcess">执行流程</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 执行详情对话框 -->
    <div v-if="showExecutionDetail" class="form-dialog">
      <div class="form-dialog-content">
        <div class="form-dialog-header">
          <h3>流程执行详情</h3>
          <button class="close-button" @click="showExecutionDetail = false">×</button>
        </div>
        <div class="form-dialog-body">
          <div class="execution-info">
            <div class="info-item">
              <span class="info-label">执行ID:</span>
              <span class="info-value">{{ executionDetail.id }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">流程名称:</span>
              <span class="info-value">{{ executionDetail.processName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">状态:</span>
              <span :class="['status-badge', executionDetail.status]">
                {{ executionDetail.status }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">开始时间:</span>
              <span class="info-value">{{ executionDetail.startTime }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">结束时间:</span>
              <span class="info-value">{{ executionDetail.endTime || '进行中' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">执行方式:</span>
              <span class="info-value">{{ executionDetail.executionMode }}</span>
            </div>
          </div>
          <div class="steps-progress">
            <h4>步骤进度</h4>
            <div v-for="(step, index) in executionDetail.steps" :key="index" class="step-progress-item">
              <div class="step-header">
                <span class="step-name">{{ step.name }}</span>
                <span :class="['step-status', step.status]">{{ step.status }}</span>
              </div>
              <div class="step-description">{{ step.description }}</div>
              <div class="step-timestamps">
                <span v-if="step.startTime">开始: {{ step.startTime }}</span>
                <span v-if="step.endTime">结束: {{ step.endTime }}</span>
              </div>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="close-button-full" @click="showExecutionDetail = false">关闭</button>
          </div>
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

// 模拟流程数据
const processes = ref([
  {
    id: 1,
    name: '商标注册流程',
    description: '完整的商标注册流程',
    steps: [
      { name: '客户信息收集', description: '收集客户基本信息和商标信息', autoComplete: false, duration: 30 },
      { name: '商标查询', description: '进行商标相似度查询', autoComplete: true, duration: 15 },
      { name: '材料准备', description: '准备商标注册申请材料', autoComplete: false, duration: 60 },
      { name: '提交申请', description: '向商标局提交注册申请', autoComplete: true, duration: 20 },
      { name: '跟踪进度', description: '跟踪商标注册审核进度', autoComplete: true, duration: 30 }
    ],
    createdAt: '2026-03-01'
  },
  {
    id: 2,
    name: '专利申请流程',
    description: '发明专利申请流程',
    steps: [
      { name: '技术交底', description: '收集技术交底材料', autoComplete: false, duration: 120 },
      { name: '专利检索', description: '进行专利新颖性检索', autoComplete: true, duration: 60 },
      { name: '撰写申请文件', description: '撰写专利申请文件', autoComplete: false, duration: 180 },
      { name: '提交申请', description: '向专利局提交申请', autoComplete: true, duration: 30 },
      { name: '审查答复', description: '答复审查意见', autoComplete: false, duration: 90 }
    ],
    createdAt: '2026-03-05'
  }
])

// 模拟执行数据
const executions = ref([
  {
    id: 1,
    processId: 1,
    processName: '商标注册流程',
    status: '进行中',
    startTime: '2026-03-19 10:00:00',
    endTime: null as string | null,
    executionMode: 'manual',
    steps: [
      { name: '客户信息收集', description: '收集客户基本信息和商标信息', status: '已完成', startTime: '2026-03-19 10:00:00', endTime: '2026-03-19 10:30:00' },
      { name: '商标查询', description: '进行商标相似度查询', status: '已完成', startTime: '2026-03-19 10:30:00', endTime: '2026-03-19 10:45:00' },
      { name: '材料准备', description: '准备商标注册申请材料', status: '进行中', startTime: '2026-03-19 10:45:00', endTime: null },
      { name: '提交申请', description: '向商标局提交注册申请', status: '未开始', startTime: null, endTime: null },
      { name: '跟踪进度', description: '跟踪商标注册审核进度', status: '未开始', startTime: null, endTime: null }
    ]
  }
])

// 模拟历史记录
const history = ref([
  {
    id: 2,
    processId: 2,
    processName: '专利申请流程',
    status: '已完成',
    startTime: '2026-03-18 09:00:00',
    endTime: '2026-03-18 16:00:00',
    executionMode: 'auto',
    steps: [
      { name: '技术交底', description: '收集技术交底材料', status: '已完成', startTime: '2026-03-18 09:00:00', endTime: '2026-03-18 11:00:00' },
      { name: '专利检索', description: '进行专利新颖性检索', status: '已完成', startTime: '2026-03-18 11:00:00', endTime: '2026-03-18 12:00:00' },
      { name: '撰写申请文件', description: '撰写专利申请文件', status: '已完成', startTime: '2026-03-18 13:00:00', endTime: '2026-03-18 16:00:00' },
      { name: '提交申请', description: '向专利局提交申请', status: '已完成', startTime: '2026-03-18 16:00:00', endTime: '2026-03-18 16:30:00' },
      { name: '审查答复', description: '答复审查意见', status: '已完成', startTime: '2026-03-18 16:30:00', endTime: '2026-03-18 18:00:00' }
    ]
  }
])

const activeTab = ref('processes')
const searchQuery = ref('')
const historySearchQuery = ref('')

// 流程表单状态
const showProcessForm = ref(false)
const isEditingProcess = ref(false)
const processFormData = ref({
  id: 0,
  name: '',
  description: '',
  steps: [] as Array<{
    name: string;
    description: string;
    autoComplete: boolean;
    duration: number;
  }>,
  createdAt: ''
})

// 执行流程状态
const showRunDialog = ref(false)
const selectedProcessId = ref('')
const executionMode = ref('manual')

// 执行详情状态
const showExecutionDetail = ref(false)
const executionDetail = ref({
  id: '',
  processName: '',
  status: '',
  startTime: '',
  endTime: null as string | null,
  executionMode: '',
  steps: [] as Array<{
    name: string;
    description: string;
    status: string;
    startTime: string | null;
    endTime: string | null;
  }>
})

// 错误状态
const errors = ref({
  name: ''
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

// 过滤后的流程列表
const filteredProcesses = computed(() => {
  if (!searchQuery.value) {
    return processes.value
  }
  const query = searchQuery.value.toLowerCase()
  return processes.value.filter(process => 
    process.name.toLowerCase().includes(query) ||
    process.description.toLowerCase().includes(query)
  )
})

// 过滤后的历史记录
const filteredHistory = computed(() => {
  if (!historySearchQuery.value) {
    return history.value
  }
  const query = historySearchQuery.value.toLowerCase()
  return history.value.filter(item => 
    item.processName.toLowerCase().includes(query) ||
    item.status.toLowerCase().includes(query)
  )
})

// 打开添加流程表单
const openAddProcessForm = () => {
  isEditingProcess.value = false
  processFormData.value = {
    id: 0,
    name: '',
    description: '',
    steps: []
  }
  addStep() // 添加默认步骤
  showProcessForm.value = true
}

// 打开编辑流程表单
const openEditProcessForm = (process: any) => {
  isEditingProcess.value = true
  processFormData.value = { ...process }
  showProcessForm.value = true
}

// 添加步骤
const addStep = () => {
  processFormData.value.steps.push({
    name: '',
    description: '',
    autoComplete: false,
    duration: 30
  })
}

// 删除步骤
const removeStep = (index: number) => {
  processFormData.value.steps.splice(index, 1)
}

// 提交流程表单
const submitProcessForm = () => {
  if (!processFormData.value.name.trim()) {
    errors.value.name = '流程名称不能为空'
    return
  }

  if (processFormData.value.steps.length === 0) {
    showMessage('至少需要添加一个步骤', 'error')
    return
  }

  if (isEditingProcess.value) {
    // 编辑流程
    const index = processes.value.findIndex(p => p.id === processFormData.value.id)
    if (index > -1) {
      processes.value[index] = { ...processFormData.value }
      showMessage('流程编辑成功')
    }
  } else {
    // 添加流程
    const newProcess = {
      ...processFormData.value,
      id: processes.value.length + 1,
      createdAt: new Date().toISOString().split('T')[0]
    }
    processes.value.push(newProcess)
    showMessage('流程添加成功')
  }

  showProcessForm.value = false
}

// 执行流程
const runProcess = (process: any) => {
  selectedProcessId.value = process.id.toString()
  executionMode.value = 'manual'
  submitRunProcess()
}

// 打开执行流程对话框
const openRunProcessDialog = () => {
  selectedProcessId.value = ''
  executionMode.value = 'manual'
  showRunDialog.value = true
}

// 提交执行流程
const submitRunProcess = () => {
  if (!selectedProcessId.value) {
    showMessage('请选择流程', 'error')
    return
  }

  const process = processes.value.find(p => p.id === parseInt(selectedProcessId.value))
  if (!process) {
    showMessage('流程不存在', 'error')
    return
  }

  // 创建新的执行记录
  const newExecution = {
    id: executions.value.length + 1 + history.value.length,
    processId: process.id,
    processName: process.name,
    status: '进行中',
    startTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    endTime: null,
    executionMode: executionMode.value,
    steps: process.steps.map((step: any) => ({
      name: step.name,
      description: step.description,
      status: '未开始',
      startTime: null,
      endTime: null
    }))
  }

  // 开始第一个步骤
  newExecution.steps[0].status = '进行中'
  newExecution.steps[0].startTime = newExecution.startTime

  executions.value.push(newExecution)
  showMessage('流程开始执行')
  showRunDialog.value = false

  // 如果是自动执行，自动完成流程
  if (executionMode.value === 'auto') {
    setTimeout(() => {
      completeExecution(newExecution)
    }, 1000)
  }
}

// 查看执行详情
const viewExecution = (execution: any) => {
  executionDetail.value = { ...execution }
  showExecutionDetail.value = true
}

// 停止执行
const stopExecution = (execution: any) => {
  showConfirm(`确定要停止执行流程 ${execution.processName} 吗？`, () => {
    const index = executions.value.findIndex(e => e.id === execution.id)
    if (index > -1) {
      executions.value[index].status = '已停止'
      executions.value[index].endTime = new Date().toISOString().replace('T', ' ').substring(0, 19)
      
      // 将停止的执行移到历史记录
      const stoppedExecution = executions.value.splice(index, 1)[0]
      history.value.push(stoppedExecution)
      
      showMessage('流程已停止')
    }
  })
}

// 一键完成流程
const completeExecution = (execution: any) => {
  const index = executions.value.findIndex(e => e.id === execution.id)
  if (index > -1) {
    const now = new Date()
    let currentTime = now

    // 完成所有步骤
    execution.steps.forEach((step: any) => {
      if (step.status === '未开始') {
        step.status = '进行中'
        step.startTime = currentTime.toISOString().replace('T', ' ').substring(0, 19)
      }
      
      // 模拟步骤执行时间
      currentTime = new Date(currentTime.getTime() + 5 * 60000) // 每个步骤5分钟
      
      step.status = '已完成'
      step.endTime = currentTime.toISOString().replace('T', ' ').substring(0, 19)
    })

    // 更新执行状态
    executions.value[index].status = '已完成'
    executions.value[index].endTime = currentTime.toISOString().replace('T', ' ').substring(0, 19) as string

    // 将完成的执行移到历史记录
    const completedExecution = executions.value.splice(index, 1)[0]
    history.value.push(completedExecution as any)

    showMessage('流程已完成')
  }
}

// 删除流程
const handleDeleteProcess = (process: any) => {
  showConfirm(`确定要删除流程 ${process.name} 吗？`, () => {
    const index = processes.value.findIndex(p => p.id === process.id)
    if (index > -1) {
      processes.value.splice(index, 1)
      showMessage('流程已删除')
    }
  })
}

const handleSearch = () => {
  console.log('搜索流程:', searchQuery.value)
  showMessage('搜索完成', 'info')
}

const handleHistorySearch = () => {
  console.log('搜索历史:', historySearchQuery.value)
  showMessage('搜索完成', 'info')
}
</script>

<style scoped>
.workflow {
  height: 100%;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

.workflow-tabs {
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

.processes-table,
.executions-table,
.history-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.processes-table table,
.executions-table table,
.history-table table {
  width: 100%;
  border-collapse: collapse;
}

.processes-table th,
.processes-table td,
.executions-table th,
.executions-table td,
.history-table th,
.history-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.processes-table th,
.executions-table th,
.history-table th {
  background: #fafafa;
  font-weight: bold;
  color: #333;
}

.processes-table tr:hover,
.executions-table tr:hover,
.history-table tr:hover {
  background: #fafafa;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.edit-button,
.run-button,
.delete-button,
.view-button,
.stop-button,
.complete-button {
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

.run-button {
  background: white;
  color: #10b981;
  border-color: #10b981;
}

.run-button:hover {
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

.view-button {
  background: white;
  color: #666;
}

.view-button:hover {
  background: #f0f0f0;
}

.stop-button {
  background: white;
  color: #f59e0b;
  border-color: #f59e0b;
}

.stop-button:hover {
  background: rgba(245, 158, 11, 0.1);
}

.complete-button {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.complete-button:hover {
  background: #34d399;
  border-color: #34d399;
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

.status-badge.已完成 {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-badge.已停止 {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.status-badge.未开始 {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
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

/* 步骤配置样式 */
.steps-container {
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 16px;
  background: #fafafa;
}

.step-item {
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 12px;
}

.step-header {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.step-header input {
  flex: 1;
}

.remove-step-button {
  background: none;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  color: #999;
  transition: all 0.3s;
}

.remove-step-button:hover {
  background: #f5222d;
  border-color: #f5222d;
  color: white;
}

.step-config {
  display: flex;
  gap: 20px;
  align-items: center;
  font-size: 14px;
}

.step-config label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 0;
  cursor: pointer;
}

.add-step-button {
  width: 100%;
  padding: 8px 16px;
  background: white;
  border: 1px dashed #1890ff;
  border-radius: 4px;
  font-size: 14px;
  color: #1890ff;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 8px;
}

.add-step-button:hover {
  background: rgba(24, 144, 255, 0.05);
  border-style: solid;
}

/* 执行详情样式 */
.execution-info {
  margin-bottom: 20px;
  padding: 16px;
  background: #fafafa;
  border-radius: 4px;
}

.info-item {
  display: flex;
  margin-bottom: 8px;
  align-items: center;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  width: 100px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.info-value {
  font-size: 14px;
  color: #333;
  flex: 1;
}

.steps-progress {
  margin-top: 20px;
}

.steps-progress h4 {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.step-progress-item {
  background: #fafafa;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 12px;
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.step-name {
  font-weight: 500;
  color: #333;
}

.step-status {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: bold;
}

.step-status.已完成 {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.step-status.进行中 {
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}

.step-status.未开始 {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.step-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.step-timestamps {
  font-size: 12px;
  color: #999;
  display: flex;
  gap: 16px;
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

  .processes-table,
  .executions-table,
  .history-table {
    overflow-x: auto;
  }

  .processes-table table,
  .executions-table table,
  .history-table table {
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

  .step-header {
    flex-direction: column;
    align-items: stretch;
  }

  .step-config {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
}
</style>