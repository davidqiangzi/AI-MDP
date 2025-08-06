/**
 * 路由配置
 */

import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Dashboard from '../pages/Dashboard';

/**
 * 路由配置
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      // 数据资产路由
      {
        path: 'data-assets',
        children: [
          {
            index: true,
            element: <Navigate to="/data-assets/catalog" replace />,
          },
          {
            path: 'catalog',
            element: <div>数据目录页面开发中...</div>,
          },
          {
            path: 'tables',
            element: <div>数据表页面开发中...</div>,
          },
          {
            path: 'fields',
            element: <div>字段管理页面开发中...</div>,
          },
          {
            path: 'metadata',
            element: <div>元数据页面开发中...</div>,
          },
        ],
      },
      // 数据血缘路由
      {
        path: 'lineage',
        children: [
          {
            index: true,
            element: <Navigate to="/lineage/graph" replace />,
          },
          {
            path: 'graph',
            element: <div>血缘图谱页面开发中...</div>,
          },
          {
            path: 'analysis',
            element: <div>血缘分析页面开发中...</div>,
          },
        ],
      },
      // 数据质量路由
      {
        path: 'quality',
        children: [
          {
            index: true,
            element: <Navigate to="/quality/rules" replace />,
          },
          {
            path: 'rules',
            element: <div>质量规则页面开发中...</div>,
          },
          {
            path: 'reports',
            element: <div>质量报告页面开发中...</div>,
          },
          {
            path: 'monitoring',
            element: <div>质量监控页面开发中...</div>,
          },
          {
            path: 'metrics',
            element: <div>质量指标页面开发中...</div>,
          },
        ],
      },
      // 数据分析路由
      {
        path: 'analytics',
        children: [
          {
            index: true,
            element: <Navigate to="/analytics/overview" replace />,
          },
          {
            path: 'overview',
            element: <div>分析概览页面开发中...</div>,
          },
          {
            path: 'usage',
            element: <div>使用统计页面开发中...</div>,
          },
          {
            path: 'trends',
            element: <div>趋势分析页面开发中...</div>,
          },
        ],
      },
      // 系统管理路由
      {
        path: 'system',
        children: [
          {
            index: true,
            element: <Navigate to="/system/users" replace />,
          },
          {
            path: 'users',
            element: <div>用户管理页面开发中...</div>,
          },
          {
            path: 'roles',
            element: <div>角色管理页面开发中...</div>,
          },
          {
            path: 'permissions',
            element: <div>权限管理页面开发中...</div>,
          },
          {
            path: 'logs',
            element: <div>系统日志页面开发中...</div>,
          },
          {
            path: 'settings',
            element: <div>系统设置页面开发中...</div>,
          },
        ],
      },
    ],
  },
  // 404页面
  {
    path: '*',
    element: <div>页面未找到</div>,
  },
]);