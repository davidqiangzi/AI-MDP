# AI MDP - 元数据管理平台

## 项目简介

元数据管理平台 (Metadata Management Platform) 是一个企业级数据治理和元数据管理系统，旨在帮助企业更好地管理和治理数据资产。

## 技术栈

### 前端
- React 18
- TypeScript
- Ant Design
- React Router
- Redux Toolkit

### 开发工具
- Create React App
- ESLint
- Prettier

## 项目结构

```
mdp-frontend/
├── public/                 # 静态资源
├── src/
│   ├── components/         # 通用组件
│   │   ├── layout/        # 布局组件
│   │   └── common/        # 公共组件
│   ├── pages/             # 页面组件
│   │   └── Dashboard/     # 仪表板页面
│   ├── router/            # 路由配置
│   ├── store/             # 状态管理
│   ├── services/          # API服务
│   ├── types/             # TypeScript类型定义
│   ├── utils/             # 工具函数
│   └── styles/            # 样式文件
├── package.json
└── tsconfig.json
```

## 快速开始

### 安装依赖

```bash
cd mdp-frontend
npm install
```

### 启动开发服务器

```bash
npm start
```

应用将在 http://localhost:3000 启动

### 构建生产版本

```bash
npm run build
```

## 功能特性

- ✅ 响应式布局设计
- ✅ 侧边栏导航
- ✅ 仪表板概览
- ✅ 数据统计展示
- ✅ 系统监控面板
- ✅ TypeScript 类型安全
- ✅ Ant Design UI组件

## 开发进度

- [x] 项目初始化和基础配置
- [x] 主布局组件开发
- [x] 路由系统配置
- [x] 状态管理集成
- [x] 仪表板页面开发
- [x] 响应式设计优化
- [ ] 数据管理模块
- [ ] 用户权限系统
- [ ] API集成
- [ ] 测试覆盖

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情
