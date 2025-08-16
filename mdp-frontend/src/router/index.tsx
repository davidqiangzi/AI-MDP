/**
 * 路由配置
 */

import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Dashboard from '../pages/Dashboard';
import DataAssets from '../pages/DataAssets';
import DataAssetDetail from '../pages/DataAssets/Detail';
import DataCatalog from '../pages/DataCatalog';
import DataTable from '../pages/DataTable';
import Metadata from '../pages/Metadata';
import FieldManagementPage from '../pages/FieldManagement';
import LineageGraph from '../pages/LineageGraph';
import LineageTracking from '../pages/LineageTracking';
import ImpactAnalysis from '../pages/ImpactAnalysis';
// 数据质量页面组件
import QualityRules from '../pages/Quality/Rules';
import QualityReports from '../pages/Quality/Reports';
import QualityMonitoring from '../pages/Quality/Monitoring';
import QualityMetrics from '../pages/Quality/Metrics';
// 数据分析页面组件
import AnalyticsOverview from '../pages/Analytics/Overview';
import AnalyticsUsage from '../pages/Analytics/Usage';
import AnalyticsTrends from '../pages/Analytics/Trends';
// 系统管理页面组件
import SystemUsers from '../pages/System/Users';
import SystemRoles from '../pages/System/Roles';
import SystemPermissions from '../pages/System/Permissions';
import SystemLogs from '../pages/System/Logs';
import SystemSettings from '../pages/System/Settings';

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
            element: <DataAssets />,
          },
          {
            path: 'detail/:id',
            element: <DataAssetDetail />,
          },
        ],
      },
      {
        path: 'data-catalog',
        element: <DataCatalog />,
      },
      {
        path: 'data-table',
        children: [
          {
            index: true,
            element: <DataCatalog />,
          },
          {
            path: 'detail/:id',
            element: <DataTable />,
          },
        ],
      },
      {
        path: 'metadata',
        element: <Metadata />,
      },
      {
        path: 'field-management',
        element: <FieldManagementPage />,
      },
      {
        path: 'data-assets-old',
        children: [
          {
            index: true,
            element: <Navigate to="/data-assets/catalog" replace />,
          },
          {
            path: 'catalog',
            element: <DataCatalog />,
          },
          {
            path: 'tables',
            element: <DataTable />,
          },
          {
            path: 'fields',
            element: <div>字段管理页面开发中...</div>,
          },
          {
            path: 'metadata',
            element: <Metadata />,
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
            element: <LineageGraph />,
          },
          {
            path: 'analysis',
            element: <ImpactAnalysis />,
          },
          {
            path: 'tracking',
            element: <LineageTracking />,
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
            element: <QualityRules />,
          },
          {
            path: 'reports',
            element: <QualityReports />,
          },
          {
            path: 'monitoring',
            element: <QualityMonitoring />,
          },
          {
            path: 'metrics',
            element: <QualityMetrics />,
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
            element: <AnalyticsOverview />,
          },
          {
            path: 'usage',
            element: <AnalyticsUsage />,
          },
          {
            path: 'trends',
            element: <AnalyticsTrends />,
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
            element: <SystemUsers />,
          },
          {
            path: 'roles',
            element: <SystemRoles />,
          },
          {
            path: 'permissions',
            element: <SystemPermissions />,
          },
          {
            path: 'logs',
            element: <SystemLogs />,
          },
          {
            path: 'settings',
            element: <SystemSettings />,
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

export default router;