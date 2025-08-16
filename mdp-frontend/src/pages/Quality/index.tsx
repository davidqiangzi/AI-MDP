/**
 * 数据质量主页面
 * 包含质量规则、质量报告、质量监控、质量指标四个子页面
 */

import React from 'react';
import { Tabs } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  FileTextOutlined,
  BarChartOutlined,
  MonitorOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import './index.css';

const { TabPane } = Tabs;

/**
 * 数据质量主页面组件
 */
const QualityPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 获取当前激活的标签页
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/quality/rules')) return 'rules';
    if (path.includes('/quality/reports')) return 'reports';
    if (path.includes('/quality/monitoring')) return 'monitoring';
    if (path.includes('/quality/metrics')) return 'metrics';
    return 'rules'; // 默认显示质量规则
  };

  // 处理标签页切换
  const handleTabChange = (key: string) => {
    navigate(`/quality/${key}`);
  };

  // 标签页配置
  const tabItems = [
    {
      key: 'rules',
      label: (
        <span>
          <FileTextOutlined />
          质量规则
        </span>
      ),
    },
    {
      key: 'reports',
      label: (
        <span>
          <BarChartOutlined />
          质量报告
        </span>
      ),
    },
    {
      key: 'monitoring',
      label: (
        <span>
          <MonitorOutlined />
          质量监控
        </span>
      ),
    },
    {
      key: 'metrics',
      label: (
        <span>
          <LineChartOutlined />
          质量指标
        </span>
      ),
    },
  ];

  return (
    <div className="quality-page">
      <div className="quality-header">
        <h1 className="page-title">数据质量</h1>
        <p className="page-description">
          全面监控和管理数据质量，确保数据的准确性、完整性和一致性
        </p>
      </div>
      
      <div className="quality-content">
        <Tabs
          activeKey={getActiveTab()}
          onChange={handleTabChange}
          type="card"
          size="large"
          className="quality-tabs"
          items={tabItems}
        />
        
        <div className="quality-tab-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default QualityPage;