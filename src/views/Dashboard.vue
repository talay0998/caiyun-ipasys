<template>
  <div class="dashboard">
    <h1 class="page-title">仪表盘</h1>
    
    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card" @click="handleStatCardClick('customers')">
        <div class="stat-icon customers">👥</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.customers }}</div>
          <div class="stat-label">客户总数</div>
        </div>
        <div class="stat-arrow">›</div>
      </div>
      <div class="stat-card" @click="handleStatCardClick('projects')">
        <div class="stat-icon projects">📋</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.projects }}</div>
          <div class="stat-label">项目总数</div>
        </div>
        <div class="stat-arrow">›</div>
      </div>
      <div class="stat-card" @click="handleStatCardClick('cases')">
        <div class="stat-icon cases">⚖️</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.cases }}</div>
          <div class="stat-label">案件总数</div>
        </div>
        <div class="stat-arrow">›</div>
      </div>
      <div class="stat-card" @click="handleStatCardClick('revenue')">
        <div class="stat-icon revenue">💰</div>
        <div class="stat-content">
          <div class="stat-number">¥{{ stats.revenue.toLocaleString() }}</div>
          <div class="stat-label">总收入</div>
        </div>
        <div class="stat-arrow">›</div>
      </div>
    </div>

    <!-- 最近案件 -->
    <div class="section">
      <h2 class="section-title">最近案件</h2>
      <div class="cases-table">
        <table>
          <thead>
            <tr>
              <th>案件名称</th>
              <th>客户</th>
              <th>类型</th>
              <th>状态</th>
              <th>截止日期</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="caseItem in recentCases" :key="caseItem.id">
              <td>{{ caseItem.name }}</td>
              <td>{{ caseItem.customer }}</td>
              <td>{{ caseItem.type }}</td>
              <td>
                <span :class="['status-badge', caseItem.status]">
                  {{ caseItem.status }}
                </span>
              </td>
              <td>{{ caseItem.deadline }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 财务概览 -->
    <div class="section">
      <h2 class="section-title">财务概览</h2>
      <div class="finance-overview">
        <div class="finance-chart">
          <!-- 这里可以添加图表 -->
          <div class="chart-placeholder">
            <p>月度收入图表</p>
          </div>
        </div>
        <div class="finance-stats">
          <div class="finance-stat" @click="handleFinanceStatClick()">
            <div class="finance-label">本月收入</div>
            <div class="finance-value">¥{{ financeStats.monthlyRevenue.toLocaleString() }}</div>
            <div class="stat-arrow">›</div>
          </div>
          <div class="finance-stat" @click="handleFinanceStatClick()">
            <div class="finance-label">本月支出</div>
            <div class="finance-value">¥{{ financeStats.monthlyExpense.toLocaleString() }}</div>
            <div class="stat-arrow">›</div>
          </div>
          <div class="finance-stat" @click="handleFinanceStatClick()">
            <div class="finance-label">本月利润</div>
            <div class="finance-value profit">¥{{ (financeStats.monthlyRevenue - financeStats.monthlyExpense).toLocaleString() }}</div>
            <div class="stat-arrow">›</div>
          </div>
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
          <div v-if="detailDialog.type === 'customers'" class="detail-section">
            <h4>客户详情</h4>
            <div class="detail-item">
              <span class="detail-label">总客户数:</span>
              <span class="detail-value">{{ stats.customers }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">本月新增:</span>
              <span class="detail-value">12</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">活跃客户:</span>
              <span class="detail-value">86</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">客户转化率:</span>
              <span class="detail-value">45%</span>
            </div>
          </div>
          <div v-if="detailDialog.type === 'projects'" class="detail-section">
            <h4>项目详情</h4>
            <div class="detail-item">
              <span class="detail-label">总项目数:</span>
              <span class="detail-value">{{ stats.projects }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">进行中项目:</span>
              <span class="detail-value">32</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">已完成项目:</span>
              <span class="detail-value">54</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">项目完成率:</span>
              <span class="detail-value">62.8%</span>
            </div>
          </div>
          <div v-if="detailDialog.type === 'cases'" class="detail-section">
            <h4>案件详情</h4>
            <div class="detail-item">
              <span class="detail-label">总案件数:</span>
              <span class="detail-value">{{ stats.cases }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">进行中案件:</span>
              <span class="detail-value">78</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">已完成案件:</span>
              <span class="detail-value">176</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">案件完成率:</span>
              <span class="detail-value">69.3%</span>
            </div>
          </div>
          <div v-if="detailDialog.type === 'revenue'" class="detail-section">
            <h4>收入详情</h4>
            <div class="detail-item">
              <span class="detail-label">总收入:</span>
              <span class="detail-value">¥{{ stats.revenue.toLocaleString() }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">本月收入:</span>
              <span class="detail-value">¥{{ financeStats.monthlyRevenue.toLocaleString() }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">上月收入:</span>
              <span class="detail-value">¥215,000</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">同比增长:</span>
              <span class="detail-value">19.1%</span>
            </div>
          </div>
          <div v-if="detailDialog.type === 'finance'" class="detail-section">
            <h4>财务详情</h4>
            <div class="detail-item">
              <span class="detail-label">本月收入:</span>
              <span class="detail-value">¥{{ financeStats.monthlyRevenue.toLocaleString() }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">本月支出:</span>
              <span class="detail-value">¥{{ financeStats.monthlyExpense.toLocaleString() }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">本月利润:</span>
              <span class="detail-value profit">¥{{ (financeStats.monthlyRevenue - financeStats.monthlyExpense).toLocaleString() }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">利润率:</span>
              <span class="detail-value">65.2%</span>
            </div>
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
import { ref } from 'vue'

// 模拟数据
const stats = ref({
  customers: 128,
  projects: 86,
  cases: 254,
  revenue: 1568000
})

const recentCases = ref([
  { id: 1, name: '商标注册 - 阿里云', customer: '阿里巴巴集团', type: '商标', status: '进行中', deadline: '2026-04-15' },
  { id: 2, name: '专利申请 - 人脸识别', customer: '旷视科技', type: '专利', status: '已提交', deadline: '2026-04-10' },
  { id: 3, name: '版权登记 - 软件著作权', customer: '腾讯科技', type: '版权', status: '已完成', deadline: '2026-03-25' },
  { id: 4, name: '商标续展 - 微信', customer: '腾讯科技', type: '商标', status: '进行中', deadline: '2026-04-05' },
  { id: 5, name: '专利申请 - 人工智能', customer: '百度网讯', type: '专利', status: '准备中', deadline: '2026-04-20' }
])

const financeStats = ref({
  monthlyRevenue: 256000,
  monthlyExpense: 89000
})

// 详情对话框状态
const detailDialog = ref({
  show: false,
  title: '',
  type: ''
})

// 处理统计卡片点击
const handleStatCardClick = (type: string) => {
  let title = ''
  switch (type) {
    case 'customers':
      title = '客户详情'
      break
    case 'projects':
      title = '项目详情'
      break
    case 'cases':
      title = '案件详情'
      break
    case 'revenue':
      title = '收入详情'
      break
  }
  detailDialog.value = {
    show: true,
    title,
    type
  }
}

// 处理财务统计点击
const handleFinanceStatClick = () => {
  detailDialog.value = {
    show: true,
    title: '财务详情',
    type: 'finance'
  }
}
</script>

<style scoped>
.dashboard {
  height: 100%;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  cursor: pointer;
}

.stat-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.stat-arrow {
  margin-left: auto;
  font-size: 20px;
  color: #999;
  transition: all 0.3s;
}

.stat-card:hover .stat-arrow {
  color: #1890ff;
  transform: translateX(4px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  margin-right: 16px;
}

.stat-icon.customers {
  background: rgba(24, 144, 255, 0.1);
}

.stat-icon.projects {
  background: rgba(102, 126, 234, 0.1);
}

.stat-icon.cases {
  background: rgba(16, 185, 129, 0.1);
}

.stat-icon.revenue {
  background: rgba(245, 108, 108, 0.1);
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
}

.cases-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  overflow-x: auto;
}

.cases-table table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}

.cases-table th,
.cases-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.cases-table th {
  background: #fafafa;
  font-weight: bold;
  color: #333;
  white-space: nowrap;
}

.cases-table tr:hover {
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

.finance-overview {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.finance-chart {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.chart-placeholder {
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fafafa;
  border-radius: 4px;
}

.finance-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.finance-stat {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.finance-stat:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.finance-stat .stat-arrow {
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  font-size: 16px;
  color: #999;
  transition: all 0.3s;
}

.finance-stat:hover .stat-arrow {
  color: #1890ff;
  transform: translateY(-50%) translateX(4px);
}

.finance-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.finance-value {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.finance-value.profit {
  color: #10b981;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
    margin-right: 12px;
  }
  
  .stat-number {
    font-size: 20px;
  }
  
  .stat-label {
    font-size: 12px;
  }
  
  .finance-overview {
    grid-template-columns: 1fr;
  }
  
  .cases-table {
    font-size: 14px;
  }
  
  .cases-table th,
  .cases-table td {
    padding: 10px 12px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 18px;
    margin-bottom: 16px;
  }
  
  .stats-cards {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  
  .stat-card {
    padding: 12px;
    flex-direction: column;
    text-align: center;
  }
  
  .stat-icon {
    margin-right: 0;
    margin-bottom: 8px;
  }
  
  .stat-arrow {
    display: none;
  }
  
  .section-title {
    font-size: 14px;
    margin-bottom: 12px;
  }
  
  .finance-chart {
    padding: 16px;
  }
  
  .chart-placeholder {
    height: 150px;
  }
  
  .finance-stat {
    padding: 12px;
  }
  
  .finance-stat .stat-arrow {
    display: none;
  }
  
  .finance-value {
    font-size: 18px;
  }
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

.detail-dialog-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.detail-section h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: bold;
  color: #333;
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
  width: 120px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  flex-shrink: 0;
}

.detail-value {
  font-size: 14px;
  color: #333;
  flex: 1;
  font-weight: 500;
}

.detail-value.profit {
  color: #10b981;
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