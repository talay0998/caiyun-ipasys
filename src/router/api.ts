import { createRouter, createWebHistory } from 'vue-router'

const apiRoutes = [
  // 认证接口
  {
    path: '/api/auth/login',
    method: 'POST',
    handler: (req: any, res: any) => {
      const { username, password } = req.body
      // 模拟认证逻辑
      if (username === 'admin' && password === 'admin123') {
        return res.json({
          success: true,
          token: 'mock-token-123456',
          user: {
            id: 1,
            username: 'admin',
            name: '管理员',
            role: '超级管理员'
          }
        })
      }
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      })
    }
  },
  
  // 客户管理接口
  {
    path: '/api/customers',
    method: 'GET',
    handler: (req: any, res: any) => {
      // 模拟客户数据
      const customers = [
        { id: 1, name: '张三', phone: '13800138000', email: 'zhangsan@example.com', createdAt: '2026-01-01' },
        { id: 2, name: '李四', phone: '13900139000', email: 'lisi@example.com', createdAt: '2026-01-15' },
        { id: 3, name: '王五', phone: '13700137000', email: 'wangwu@example.com', createdAt: '2026-02-01' }
      ]
      return res.json({
        success: true,
        data: customers,
        total: customers.length
      })
    }
  },
  
  {
    path: '/api/customers',
    method: 'POST',
    handler: (req: any, res: any) => {
      const customerData = req.body
      // 模拟添加客户
      return res.json({
        success: true,
        data: {
          id: Date.now(),
          ...customerData,
          createdAt: new Date().toISOString().split('T')[0]
        }
      })
    }
  },
  
  {
    path: '/api/customers/:id',
    method: 'PUT',
    handler: (req: any, res: any) => {
      const { id } = req.params
      const customerData = req.body
      // 模拟更新客户
      return res.json({
        success: true,
        data: {
          id: parseInt(id),
          ...customerData
        }
      })
    }
  },
  
  {
    path: '/api/customers/:id',
    method: 'DELETE',
    handler: (req: any, res: any) => {
      const { id } = req.params
      // 模拟删除客户
      return res.json({
        success: true,
        message: '客户删除成功'
      })
    }
  },
  
  // 案件管理接口
  {
    path: '/api/cases',
    method: 'GET',
    handler: (req: any, res: any) => {
      // 模拟案件数据
      const cases = [
        { id: 1, name: '商标注册', customerId: 1, status: '进行中', createdAt: '2026-01-01' },
        { id: 2, name: '专利申请', customerId: 2, status: '已完成', createdAt: '2026-01-15' },
        { id: 3, name: '版权登记', customerId: 3, status: '待处理', createdAt: '2026-02-01' }
      ]
      return res.json({
        success: true,
        data: cases,
        total: cases.length
      })
    }
  },
  
  {
    path: '/api/cases',
    method: 'POST',
    handler: (req: any, res: any) => {
      const caseData = req.body
      // 模拟添加案件
      return res.json({
        success: true,
        data: {
          id: Date.now(),
          ...caseData,
          createdAt: new Date().toISOString().split('T')[0]
        }
      })
    }
  },
  
  {
    path: '/api/cases/:id',
    method: 'PUT',
    handler: (req: any, res: any) => {
      const { id } = req.params
      const caseData = req.body
      // 模拟更新案件
      return res.json({
        success: true,
        data: {
          id: parseInt(id),
          ...caseData
        }
      })
    }
  },
  
  {
    path: '/api/cases/:id',
    method: 'DELETE',
    handler: (req: any, res: any) => {
      const { id } = req.params
      // 模拟删除案件
      return res.json({
        success: true,
        message: '案件删除成功'
      })
    }
  },
  
  // 项目管理接口
  {
    path: '/api/projects',
    method: 'GET',
    handler: (req: any, res: any) => {
      // 模拟项目数据
      const projects = [
        { id: 1, name: '品牌保护计划', customerId: 1, status: '进行中', createdAt: '2026-01-01' },
        { id: 2, name: '专利战略规划', customerId: 2, status: '已完成', createdAt: '2026-01-15' },
        { id: 3, name: '版权管理系统', customerId: 3, status: '待处理', createdAt: '2026-02-01' }
      ]
      return res.json({
        success: true,
        data: projects,
        total: projects.length
      })
    }
  },
  
  // 财务管理接口
  {
    path: '/api/finance/transactions',
    method: 'GET',
    handler: (req: any, res: any) => {
      // 模拟财务交易数据
      const transactions = [
        { id: 1, type: '收入', amount: 10000, description: '商标注册费用', customerId: 1, createdAt: '2026-01-01' },
        { id: 2, type: '支出', amount: 2000, description: '专利申请代理费', createdAt: '2026-01-15' },
        { id: 3, type: '收入', amount: 5000, description: '版权登记费用', customerId: 3, createdAt: '2026-02-01' }
      ]
      return res.json({
        success: true,
        data: transactions,
        total: transactions.length
      })
    }
  },
  
  // 报表接口
  {
    path: '/api/reports/financial',
    method: 'GET',
    handler: (req: any, res: any) => {
      // 模拟财务报表数据
      const report = {
        period: '2026-03',
        income: 25000,
        expenses: 5000,
        profit: 20000,
        breakdown: {
          income: {
            商标注册: 10000,
            专利申请: 10000,
            版权登记: 5000
          },
          expenses: {
            代理费: 2000,
            办公费用: 1500,
            其他费用: 1500
          }
        }
      }
      return res.json({
        success: true,
        data: report
      })
    }
  },
  
  // Webhook接口
  {
    path: '/api/webhook',
    method: 'POST',
    handler: (req: any, res: any) => {
      const { platform, event, data } = req.body
      
      // 根据不同平台处理webhook
      switch (platform) {
        case 'workbuddy':
          // 腾讯WorkBuddy处理
          console.log('WorkBuddy webhook:', event, data)
          break
        case 'jvsclaw':
          // 阿里JVS Claw处理
          console.log('JVS Claw webhook:', event, data)
          break
        case 'feishu':
          // 飞书处理
          console.log('Feishu webhook:', event, data)
          break
        default:
          console.log('Unknown platform:', platform)
      }
      
      return res.json({
        success: true,
        message: 'Webhook received'
      })
    }
  },
  
  // 飞书回调接口
  {
    path: '/api/feishu/callback',
    method: 'POST',
    handler: (req: any, res: any) => {
      const { challenge, event } = req.body
      
      // 飞书验证回调
      if (challenge) {
        return res.json({ challenge })
      }
      
      // 处理飞书事件
      if (event) {
        console.log('Feishu event:', event)
        // 处理具体事件逻辑
      }
      
      return res.json({
        success: true
      })
    }
  },
  
  // 健康检查接口
  {
    path: '/api/health',
    method: 'GET',
    handler: (req: any, res: any) => {
      return res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString()
      })
    }
  }
]

export default apiRoutes