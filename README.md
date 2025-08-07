# 元数据管理平台 (MDP)

## 项目简介

元数据管理平台（Metadata Management Platform，简称MDP）是一个现代化的企业级数据治理平台，旨在帮助企业统一管理、发现和治理数据资产，提升数据质量和数据价值。

## 功能特性

### 🏠 工作台
- 数据资产概览统计
- 个性化数据资产推荐
- 实时数据质量监控
- 个人工作区管理

### 📊 数据资产管理
- 全面的数据资产目录
- 智能搜索和多维筛选
- 详细的资产元数据信息
- 数据血缘关系可视化

### 🔍 血缘分析
- 交互式血缘图谱
- 影响分析和路径分析
- 多层级血缘关系展示
- 数据流向追踪

### 📈 数据质量管理
- 质量规则配置和管理
- 实时质量监控
- 质量问题跟踪处理
- 质量报告生成

### ⚙️ 系统管理
- 用户和角色权限管理
- 数据源配置管理
- 数据采集任务调度
- 系统参数配置

## 技术栈

### 前端技术
- **框架**: React 18+ / Vue 3+
- **语言**: TypeScript
- **UI组件库**: Ant Design / Element Plus
- **状态管理**: Redux Toolkit / Pinia
- **路由**: React Router / Vue Router
- **图表库**: ECharts / Chart.js
- **图谱可视化**: D3.js / G6
- **构建工具**: Vite / Webpack

### 后端技术
- **框架**: Spring Boot / Node.js
- **数据库**: MySQL / PostgreSQL
- **缓存**: Redis
- **消息队列**: RabbitMQ / Kafka
- **搜索引擎**: Elasticsearch

### 开发工具
- **代码规范**: ESLint + Prettier
- **测试框架**: Jest + Testing Library
- **版本控制**: Git
- **CI/CD**: GitHub Actions / Jenkins

## 设计规范

### 视觉设计
- **主色调**: 深蓝色 (#165DFF)
- **背景色**: 浅灰色 (#F5F7FA)
- **卡片底色**: 白色 (#FFFFFF)
- **字体**: Inter
- **圆角**: 4-8px
- **阴影**: 轻微阴影效果

### 布局规范
- **侧边导航栏**: 220px 固定宽度
- **顶部功能栏**: 64px 固定高度
- **主内容区**: 响应式网格布局
- **断点设置**: 桌面端(≥1200px)、平板端(768px-1199px)、移动端(<768px)

### 交互规范
- **页面切换**: 300ms 淡入淡出
- **弹窗显示**: 200ms 中心放大
- **按钮反馈**: 0.98倍缩放效果
- **数据加载**: 骨架屏过渡

## 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0
- Git

### 安装依赖
```bash
# 克隆项目
git clone <repository-url>
cd AI\ MDP

# 安装依赖
npm install
# 或
yarn install
```

### 开发环境启动
```bash
# 启动开发服务器
npm run dev
# 或
yarn dev

# 访问地址
http://localhost:3000
```

### 构建生产版本
```bash
# 构建生产版本
npm run build
# 或
yarn build

# 预览生产版本
npm run preview
# 或
yarn preview
```

## 项目结构

```
AI MDP/
├── public/                 # 静态资源
├── src/
│   ├── components/         # 公共组件
│   │   ├── Layout/        # 布局组件
│   │   ├── Charts/        # 图表组件
│   │   ├── DataTable/     # 数据表格组件
│   │   └── Common/        # 通用组件
│   ├── pages/             # 页面组件
│   │   ├── Dashboard/     # 工作台
│   │   ├── DataAssets/    # 数据资产
│   │   ├── Lineage/       # 血缘分析
│   │   ├── Quality/       # 数据质量
│   │   └── System/        # 系统管理
│   ├── hooks/             # 自定义Hooks
│   ├── services/          # API服务
│   ├── store/             # 状态管理
│   ├── utils/             # 工具函数
│   ├── styles/            # 样式文件
│   └── types/             # TypeScript类型定义
├── tests/                 # 测试文件
├── docs/                  # 项目文档
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 开发指南

### 代码规范
- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 和 Prettier 配置的代码规范
- 组件命名使用 PascalCase
- 文件命名使用 kebab-case
- 函数和变量命名使用 camelCase

### 组件开发
- 优先使用函数组件和 Hooks
- 组件应该具有良好的可复用性
- 添加适当的 PropTypes 或 TypeScript 类型
- 编写组件文档和使用示例

### 状态管理
- 全局状态使用 Redux/Pinia 管理
- 局部状态优先使用 useState/ref
- 异步操作使用 Redux Toolkit Query 或 Pinia 的异步 actions

### API 接口
- 统一使用 axios 进行 HTTP 请求
- 实现请求和响应拦截器
- 错误处理统一管理
- 接口类型定义完整

## 测试

### 运行测试
```bash
# 运行所有测试
npm run test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行端到端测试
npm run test:e2e
```

### 测试策略
- **单元测试**: 测试组件和函数的基本功能
- **集成测试**: 测试组件间的交互
- **端到端测试**: 测试完整的用户流程

## 部署

### 环境配置
```bash
# 开发环境
NODE_ENV=development
VITE_API_BASE_URL=http://localhost:8080/api

# 生产环境
NODE_ENV=production
VITE_API_BASE_URL=https://api.mdp.company.com
```

### Docker 部署
```bash
# 构建镜像
docker build -t mdp-frontend .

# 运行容器
docker run -p 80:80 mdp-frontend
```

## 贡献指南

### 提交代码
1. Fork 项目到个人仓库
2. 创建功能分支: `git checkout -b feature/new-feature`
3. 提交更改: `git commit -m 'Add new feature'`
4. 推送分支: `git push origin feature/new-feature`
5. 创建 Pull Request

### 提交信息规范
```
type(scope): description

[optional body]

[optional footer]
```

**类型 (type)**:
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 代码审查
- 确保代码通过所有测试
- 遵循项目的代码规范
- 添加必要的文档和注释
- 考虑性能和安全性影响

## 常见问题

### Q: 如何添加新的页面？
A: 在 `src/pages` 目录下创建新的页面组件，然后在路由配置中添加对应的路由。

### Q: 如何自定义主题？
A: 修改 `src/styles/theme.ts` 文件中的主题变量，或者在 UI 组件库的配置中自定义主题。

### Q: 如何处理权限控制？
A: 使用路由守卫和组件级权限控制，具体实现参考 `src/utils/auth.ts`。

### Q: 如何优化性能？
A: 使用代码分割、懒加载、虚拟滚动等技术，具体优化策略参考性能优化文档。

## 更新日志

### v1.0.0 (计划中)
- 🎉 初始版本发布
- ✨ 完整的数据资产管理功能
- ✨ 血缘分析可视化
- ✨ 数据质量监控
- ✨ 系统管理功能

## 许可证

本项目采用 [MIT License](LICENSE) 许可证。

## 联系我们

- **项目负责人**: [项目负责人姓名]
- **邮箱**: [联系邮箱]
- **问题反馈**: [GitHub Issues](https://github.com/your-org/mdp/issues)
- **文档**: [项目文档地址]

## 致谢

感谢所有为本项目做出贡献的开发者和设计师。

---

**注意**: 本项目目前处于开发阶段，功能和API可能会发生变化。请关注更新日志获取最新信息。