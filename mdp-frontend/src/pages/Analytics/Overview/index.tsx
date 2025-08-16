/**
 * 数据分析 - 分析概览页面
 * 包含数据分析总览、关键指标展示、图表可视化
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Select,
  DatePicker,
  Space,
  Typography,
  Spin,
  Button,
  Tooltip
} from 'antd';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DatabaseOutlined,
  UserOutlined,
  FileTextOutlined,
  ReloadOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import './index.css';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// 模拟数据
const mockOverviewData = {
  totalAssets: 15420,
  totalUsers: 1256,
  totalReports: 3847,
  dataQualityScore: 92.5,
  assetGrowth: 12.5,
  userGrowth: 8.3,
  reportGrowth: 15.2,
  qualityTrend: -2.1
};

const mockAssetDistribution = [
  { name: '数据表', value: 6580, color: '#1890ff' },
  { name: '视图', value: 3240, color: '#52c41a' },
  { name: '存储过程', value: 2150, color: '#faad14' },
  { name: '函数', value: 1890, color: '#f5222d' },
  { name: '其他', value: 1560, color: '#722ed1' }
];

const mockUsageTrend = [
  { date: '01-01', visits: 1200, queries: 850, downloads: 320 },
  { date: '01-02', visits: 1350, queries: 920, downloads: 380 },
  { date: '01-03', visits: 1180, queries: 780, downloads: 290 },
  { date: '01-04', visits: 1420, queries: 1050, downloads: 450 },
  { date: '01-05', visits: 1680, queries: 1200, downloads: 520 },
  { date: '01-06', visits: 1520, queries: 1080, downloads: 480 },
  { date: '01-07', visits: 1750, queries: 1350, downloads: 580 }
];

const mockTopAssets = [
  { name: '用户行为分析表', category: '数据表', visits: 2340, score: 95 },
  { name: '销售数据视图', category: '视图', visits: 1890, score: 92 },
  { name: '财务报表', category: '数据表', visits: 1650, score: 88 },
  { name: '库存管理表', category: '数据表', visits: 1420, score: 90 },
  { name: '客户信息表', category: '数据表', visits: 1280, score: 94 }
];

const AnalyticsOverview: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedDomain, setSelectedDomain] = useState('all');

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleExport = () => {
    // 导出功能实现
    console.log('导出分析报告');
  };

  const renderStatisticCard = (title: string, value: number | string, suffix: string, growth: number, icon: React.ReactNode, color: string) => (
    <Card className="statistic-card" hoverable>
      <div className="statistic-content">
        <div className="statistic-icon" style={{ backgroundColor: `${color}15`, color }}>
          {icon}
        </div>
        <div className="statistic-info">
          <Text type="secondary" className="statistic-title">{title}</Text>
          <div className="statistic-value">
            <Statistic value={value} suffix={suffix} />
          </div>
          <div className="statistic-growth">
            {growth > 0 ? (
              <span className="growth-positive">
                <ArrowUpOutlined /> {Math.abs(growth)}%
              </span>
            ) : (
              <span className="growth-negative">
                <ArrowDownOutlined /> {Math.abs(growth)}%
              </span>
            )}
            <Text type="secondary" style={{ marginLeft: 8 }}>较上周</Text>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="analytics-overview">
      {/* 页面头部 */}
      <div className="page-header">
        <div className="header-content">
          <Title level={2}>分析概览</Title>
          <Text type="secondary">数据资产使用情况和趋势分析</Text>
        </div>
        <div className="header-actions">
          <Space>
            <Select
              value={selectedDomain}
              onChange={setSelectedDomain}
              style={{ width: 120 }}
            >
              <Option value="all">全部业务域</Option>
              <Option value="finance">财务</Option>
              <Option value="sales">销售</Option>
              <Option value="hr">人力资源</Option>
            </Select>
            <Select
              value={timeRange}
              onChange={setTimeRange}
              style={{ width: 100 }}
            >
              <Option value="7d">近7天</Option>
              <Option value="30d">近30天</Option>
              <Option value="90d">近90天</Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
              刷新
            </Button>
            <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
              导出报告
            </Button>
          </Space>
        </div>
      </div>

      <Spin spinning={loading}>
        {/* 关键指标卡片 */}
        <Row gutter={[24, 24]} className="metrics-row">
          <Col xs={24} sm={12} lg={6}>
            {renderStatisticCard(
              '数据资产总数',
              mockOverviewData.totalAssets,
              '',
              mockOverviewData.assetGrowth,
              <DatabaseOutlined />,
              '#1890ff'
            )}
          </Col>
          <Col xs={24} sm={12} lg={6}>
            {renderStatisticCard(
              '活跃用户数',
              mockOverviewData.totalUsers,
              '',
              mockOverviewData.userGrowth,
              <UserOutlined />,
              '#52c41a'
            )}
          </Col>
          <Col xs={24} sm={12} lg={6}>
            {renderStatisticCard(
              '生成报告数',
              mockOverviewData.totalReports,
              '',
              mockOverviewData.reportGrowth,
              <FileTextOutlined />,
              '#faad14'
            )}
          </Col>
          <Col xs={24} sm={12} lg={6}>
            {renderStatisticCard(
              '数据质量评分',
              mockOverviewData.dataQualityScore,
              '分',
              mockOverviewData.qualityTrend,
              <ArrowUpOutlined />,
              '#f5222d'
            )}
          </Col>
        </Row>

        {/* 图表区域 */}
        <Row gutter={[24, 24]} className="charts-row">
          {/* 数据资产分布 */}
          <Col xs={24} lg={12}>
            <Card title="数据资产分布" className="chart-card">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mockAssetDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {mockAssetDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* 使用趋势 */}
          <Col xs={24} lg={12}>
            <Card title="使用趋势" className="chart-card">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mockUsageTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="visits"
                    stackId="1"
                    stroke="#1890ff"
                    fill="#1890ff"
                    fillOpacity={0.6}
                    name="访问量"
                  />
                  <Area
                    type="monotone"
                    dataKey="queries"
                    stackId="1"
                    stroke="#52c41a"
                    fill="#52c41a"
                    fillOpacity={0.6}
                    name="查询量"
                  />
                  <Area
                    type="monotone"
                    dataKey="downloads"
                    stackId="1"
                    stroke="#faad14"
                    fill="#faad14"
                    fillOpacity={0.6}
                    name="下载量"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* 热门资产排行 */}
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card title="热门数据资产 TOP5" className="top-assets-card">
              <div className="top-assets-list">
                {mockTopAssets.map((asset, index) => (
                  <div key={index} className="asset-item">
                    <div className="asset-rank">{index + 1}</div>
                    <div className="asset-info">
                      <div className="asset-name">{asset.name}</div>
                      <div className="asset-category">{asset.category}</div>
                    </div>
                    <div className="asset-stats">
                      <div className="stat-item">
                        <Text type="secondary">访问量</Text>
                        <Text strong>{asset.visits}</Text>
                      </div>
                      <div className="stat-item">
                        <Text type="secondary">质量评分</Text>
                        <Text strong style={{ color: asset.score >= 90 ? '#52c41a' : '#faad14' }}>
                          {asset.score}分
                        </Text>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default AnalyticsOverview;