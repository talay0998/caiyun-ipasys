# 彩云知识产权代理管理系统

## 项目简介

彩云知识产权代理管理系统是一款基于 Tauri 框架开发的跨平台桌面应用，专为知识产权代理公司设计。系统采用蓝色商务风格，参考 Ant Design 设计理念，提供了完整的客户管理、业务管理、项目管理、案件管理、文档管理、财务管理和流程管理功能。

## 功能特性

### 核心功能
- **客户管理**：客户信息管理、批量导入客户、客户搜索和筛选
- **业务管理**：业务类型管理、合同管理、业务追踪
- **项目管理**：项目创建和管理、进度跟踪
- **案件管理**：案件信息管理、状态跟踪、费用管理
- **文档管理**：文档上传和管理、客户关联
- **财务管理**：收支管理、应收账款管理、财务报表
- **流程管理**：流程定义、流程执行、一键完成流程、状态跟踪
- **系统管理**：用户管理、角色权限管理、系统设置、数据备份与恢复
- **仪表盘**：关键数据可视化、业务概览

### 技术特性
- **跨平台**：基于 Tauri 框架，支持 Windows、macOS 和 Linux
- **响应式设计**：适配不同屏幕尺寸
- **数据导出**：支持 CSV、Excel 等格式
- **批量操作**：支持批量导入客户
- **流程自动化**：支持流程的自动执行
- **美观界面**：蓝色商务风格，参考 Ant Design

## 技术栈

- **前端**：Vue 3 + TypeScript + Vue Router + Pinia
- **构建工具**：Vite
- **桌面应用框架**：Tauri
- **后端**：Rust (Tauri 后端)
- **数据存储**：SQLite

## 安装和运行

### 前置要求
- Node.js 16+
- Rust 1.64+
- Tauri CLI

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/talay0998/caiyun-ipasys.git
   cd caiyun-ipasys
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **开发模式运行**
   ```bash
   npm run dev
   ```

4. **构建生产版本**
   ```bash
   npm run build
   npm run tauri build
   ```

## 项目结构

```
caiyun-ipasys/
├── src/                 # 前端源代码
│   ├── router/          # 路由配置
│   ├── views/           # 页面组件
│   │   ├── AppLayout.vue    # 应用布局
│   │   ├── Dashboard.vue    # 仪表盘
│   │   ├── Customers.vue    # 客户管理
│   │   ├── Business.vue     # 业务管理
│   │   ├── Projects.vue     # 项目管理
│   │   ├── Cases.vue        # 案件管理
│   │   ├── Documents.vue    # 文档管理
│   │   ├── Finance.vue      # 财务管理
│   │   ├── Workflow.vue     # 流程管理
│   │   ├── System.vue       # 系统管理
│   │   └── Login.vue        # 登录页面
│   ├── App.vue          # 应用入口
│   └── main.ts          # 主文件
├── src-tauri/           # Tauri 后端代码
│   ├── src/             # Rust 源代码
│   └── tauri.conf.json  # Tauri 配置
├── package.json         # 项目配置
├── tsconfig.json        # TypeScript 配置
├── vite.config.ts       # Vite 配置
├── README.md            # 项目说明
├── 测试计划书.md         # 测试计划
├── 测试报告.md           # 测试报告
└── 开发问题与解决方案.md   # 开发问题与解决方案
```

## 核心功能模块

### 1. 客户管理
- 客户信息的增删改查
- 客户分类和标签管理
- 批量导入客户数据
- 客户搜索和筛选

### 2. 业务管理
- 业务类型管理（商标、专利、版权等）
- 业务创建和编辑
- 合同管理
- 业务进度跟踪
- 费用管理

### 3. 项目管理
- 项目创建和管理
- 项目进度跟踪
- 项目成员管理
- 项目文档管理

### 4. 案件管理
- 案件信息管理
- 案件状态跟踪
- 案件费用管理
- 案件文档管理

### 5. 文档管理
- 文档上传和管理
- 文档分类和标签
- 文档与客户/案件关联
- 文档预览和下载

### 6. 财务管理
- 收支管理
- 应收账款管理
- 财务报表生成
- 费用统计和分析

### 7. 流程管理
- 流程定义和配置
- 流程执行和监控
- 一键完成流程
- 流程历史记录
- 手动和自动执行模式

### 8. 系统管理
- 用户管理和权限控制
- 系统设置
- 数据备份与恢复
- 日志管理

## 部署指南

### 桌面应用部署
1. 构建生产版本：`npm run tauri build`
2. 在 `src-tauri/target/release` 目录中找到生成的可执行文件
3. 分发可执行文件给用户

### 开发环境配置
1. 确保安装了 Node.js 16+ 和 Rust 1.64+
2. 安装 Tauri CLI：`npm install -g @tauri-apps/cli`
3. 克隆仓库并安装依赖
4. 运行开发服务器：`npm run dev`

## 贡献指南

1. Fork 项目仓库
2. 创建特性分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m 'Add some feature'`
4. 推送到分支：`git push origin feature/your-feature`
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 开发团队

- 开发团队：喀什财运商标代理有限责任公司
- 项目负责人：阿力木江
- 官网：[talay.ltd](https://talay.ltd)
- 邮箱：[work@talay.work](mailto:work@talay.work)

## 项目说明

- 项目完全开源免费
- 需求：保留开发信息，免版权

---