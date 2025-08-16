/**
 * 质量指标页面
 * 包含指标统计、趋势分析、评分分布等功能
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Button,
  Space,
  Tag,
  Select,
  DatePicker,
  Tabs,
  List,
  Avatar,
  Tooltip,
  Badge,
  Alert,
  Divider,
  Radio,
  Switch,
  message,
} from 'antd';
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  RiseOutlined,
  FallOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  FilterOutlined,
  ReloadOutlined,
  EyeOutlined,
  SettingOutlined,
  CalendarOutlined,
  DatabaseOutlined,
  TableOutlined,
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import type { ColumnsType } from 'antd/es/table';
import './index.css';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

// 指标数据类型
interface MetricData {
  date: string;
  completeness: number;
  accuracy: number;
  consistency: number;
  validity: number;
  uniqueness: number;
  overall: number;
}

// 数据源指标类型
interface DataSourceMetric {
  id: string;
  name: string;
  type: string;
  completeness: number;
  accuracy: number;
  consistency: number;
  validity: number;
  uniqueness: number;
  overall: number;
  recordCount: number;
  lastUpdate: string;
  status: 'excellent' | 'good' | 'fair' | 'poor';
}

// 表指标类型
interface TableMetric {
  id: string;
  tableName: string;
  database: string;
  completeness: number;
  accuracy: number;
  consistency: number;
  validity: number;
  uniqueness: number;
  overall: number;
  recordCount: number;
  columnCount: number;
  lastUpdate: string;
  issues: number;
}

// 评分分布类型
interface ScoreDistribution {
  range: string;
  count: number;
  percentage: number;
}

// 模拟历史指标数据
const mockHistoricalData: MetricData[] = [
  { date: '2024-01-01', completeness: 95.2, accuracy: 92.8, consistency: 89.5, validity: 94.1, uniqueness: 97.3, overall: 93.8 },
  { date: '2024-01-02', completeness: 96.1, accuracy: 93.5, consistency: 90.2, validity: 94.8, uniqueness: 97.8, overall: 94.5 },
  { date: '2024-01-03', completeness: 94.8, accuracy: 91.9, consistency: 88.7, validity: 93.2, uniqueness: 96.9, overall: 93.1 },
  { date: '2024-01-04', completeness: 97.3, accuracy: 94.2, consistency: 91.8, validity: 95.6, uniqueness: 98.1, overall: 95.4 },
  { date: '2024-01-05', completeness: 96.7, accuracy: 93.8, consistency: 90.9, validity: 94.9, uniqueness: 97.6, overall: 94.8 },
  { date: '2024-01-06', completeness: 95.9, accuracy: 92.6, consistency: 89.8, validity: 94.3, uniqueness: 97.2, overall: 94.0 },
  { date: '2024-01-07', completeness: 98.1, accuracy: 95.4, consistency: 92.7, validity: 96.2, uniqueness: 98.5, overall: 96.2 },
];

// 模拟数据源指标
const mockDataSourceMetrics: DataSourceMetric[] = [
  {
    id: '1',
    name: '用户数据库',
    type: 'MySQL',
    completeness: 98.5,
    accuracy: 96.2,
    consistency: 94.8,
    validity: 97.1,
    uniqueness: 99.2,
    overall: 97.2,
    recordCount: 1250000,
    lastUpdate: '2024-01-25 10:30:00',
    status: 'excellent',
  },
  {
    id: '2',
    name: '订单数据库',
    type: 'PostgreSQL',
    completeness: 94.3,
    accuracy: 91.8,
    consistency: 88.9,
    validity: 93.5,
    uniqueness: 96.7,
    overall: 93.0,
    recordCount: 850000,
    lastUpdate: '2024-01-25 10:25:00',
    status: 'good',
  },
  {
    id: '3',
    name: '产品数据库',
    type: 'MongoDB',
    completeness: 89.7,
    accuracy: 87.2,
    consistency: 85.1,
    validity: 88.9,
    uniqueness: 92.4,
    overall: 88.7,
    recordCount: 320000,
    lastUpdate: '2024-01-25 10:20:00',
    status: 'fair',
  },
];

// 模拟表指标
const mockTableMetrics: TableMetric[] = [
  {
    id: '1',
    tableName: 'users',
    database: '用户数据库',
    completeness: 98.5,
    accuracy: 96.2,
    consistency: 94.8,
    validity: 97.1,
    uniqueness: 99.2,
    overall: 97.2,
    recordCount: 125000,
    columnCount: 15,
    lastUpdate: '2024-01-25 10:30:00',
    issues: 2,
  },
  {
    id: '2',
    tableName: 'orders',
    database: '订单数据库',
    completeness: 94.3,
    accuracy: 91.8,
    consistency: 88.9,
    validity: 93.5,
    uniqueness: 96.7,
    overall: 93.0,
    recordCount: 85000,
    columnCount: 12,
    lastUpdate: '2024-01-25 10:25:00',
    issues: 5,
  },
  {
    id: '3',
    tableName: 'products',
    database: '产品数据库',
    completeness: 89.7,
    accuracy: 87.2,
    consistency: 85.1,
    validity: 88.9,
    uniqueness: 92.4,
    overall: 88.7,
    recordCount: 32000,
    columnCount: 8,
    lastUpdate: '2024-01-25 10:20:00',
    issues: 8,
  },
];

// 模拟评分分布
const mockScoreDistribution: ScoreDistribution[] = [
  { range: '90-100', count: 45, percentage: 37.5 },
  { range: '80-89', count: 38, percentage: 31.7 },
  { range: '70-79', count: 22, percentage: 18.3 },
  { range: '60-69', count: 10, percentage: 8.3 },
  { range: '0-59', count: 5, percentage: 4.2 },
];

/**
 * 质量指标页面组件
 */
const QualityMetricsPage: React.FC = () => {
  const [historicalData] = useState<MetricData[]>(mockHistoricalData);
  const [dataSourceMetrics] = useState<DataSourceMetric[]>(mockDataSourceMetrics);
  const [tableMetrics] = useState<TableMetric[]>(mockTableMetrics);
  const [scoreDistribution] = useState<ScoreDistribution[]>(mockScoreDistribution);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedDataSource, setSelectedDataSource] = useState('all');

  // 获取最新数据
  const latestData = historicalData[historicalData.length - 1];

  // 计算趋势
  const getTrend = (metric: keyof MetricData) => {
    if (historicalData.length < 2) return 0;
    const current = latestData[metric] as number;
    const previous = historicalData[historicalData.length - 2][metric] as number;
    return current - previous;
  };

  // 获取状态颜色
  const getStatusColor = (value: number) => {
    if (value >= 95) return '#52c41a';
    if (value >= 90) return '#faad14';
    if (value >= 80) return '#fa8c16';
    return '#ff4d4f';
  };

  // 获取状态文本
  const getStatusText = (value: number) => {
    if (value >= 95) return '优秀';
    if (value >= 90) return '良好';
    if (value >= 80) return '一般';
    return '较差';
  };

  // 获取状态标签
  const getStatusTag = (status: string) => {
    const statusConfig = {
      excellent: { label: '优秀', color: 'success' },
      good: { label: '良好', color: 'processing' },
      fair: { label: '一般', color: 'warning' },
      poor: { label: '较差', color: 'error' },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Tag color={config.color}>{config.label}</Tag>;
  };

  // 数据源表格列配置
  const dataSourceColumns: ColumnsType<DataSourceMetric> = [
    {
      title: '数据源',
      key: 'dataSource',
      width: 200,
      render: (_, record) => (
        <Space>
          <Avatar icon={<DatabaseOutlined />} size="small" />
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <div style={{ fontSize: 12, color: '#999' }}>{record.type}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '综合评分',
      dataIndex: 'overall',
      key: 'overall',
      width: 120,
      render: (value: number) => (
        <div>
          <div style={{ color: getStatusColor(value), fontWeight: 600 }}>
            {value}%
          </div>
          <Progress
            percent={value}
            showInfo={false}
            strokeColor={getStatusColor(value)}
            size="small"
          />
        </div>
      ),
      sorter: (a, b) => a.overall - b.overall,
    },
    {
      title: '完整性',
      dataIndex: 'completeness',
      key: 'completeness',
      width: 100,
      render: (value: number) => (
        <span style={{ color: getStatusColor(value) }}>{value}%</span>
      ),
      sorter: (a, b) => a.completeness - b.completeness,
    },
    {
      title: '准确性',
      dataIndex: 'accuracy',
      key: 'accuracy',
      width: 100,
      render: (value: number) => (
        <span style={{ color: getStatusColor(value) }}>{value}%</span>
      ),
      sorter: (a, b) => a.accuracy - b.accuracy,
    },
    {
      title: '一致性',
      dataIndex: 'consistency',
      key: 'consistency',
      width: 100,
      render: (value: number) => (
        <span style={{ color: getStatusColor(value) }}>{value}%</span>
      ),
      sorter: (a, b) => a.consistency - b.consistency,
    },
    {
      title: '记录数',
      dataIndex: 'recordCount',
      key: 'recordCount',
      width: 120,
      render: (count: number) => count.toLocaleString(),
      sorter: (a, b) => a.recordCount - b.recordCount,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '最后更新',
      dataIndex: 'lastUpdate',
      key: 'lastUpdate',
      width: 150,
    },
  ];

  // 表指标表格列配置
  const tableColumns: ColumnsType<TableMetric> = [
    {
      title: '表名',
      key: 'table',
      width: 200,
      render: (_, record) => (
        <Space>
          <Avatar icon={<TableOutlined />} size="small" />
          <div>
            <div style={{ fontWeight: 500 }}>{record.tableName}</div>
            <div style={{ fontSize: 12, color: '#999' }}>{record.database}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '综合评分',
      dataIndex: 'overall',
      key: 'overall',
      width: 120,
      render: (value: number) => (
        <div>
          <div style={{ color: getStatusColor(value), fontWeight: 600 }}>
            {value}%
          </div>
          <Progress
            percent={value}
            showInfo={false}
            strokeColor={getStatusColor(value)}
            size="small"
          />
        </div>
      ),
      sorter: (a, b) => a.overall - b.overall,
    },
    {
      title: '记录数',
      dataIndex: 'recordCount',
      key: 'recordCount',
      width: 100,
      render: (count: number) => count.toLocaleString(),
      sorter: (a, b) => a.recordCount - b.recordCount,
    },
    {
      title: '字段数',
      dataIndex: 'columnCount',
      key: 'columnCount',
      width: 80,
      sorter: (a, b) => a.columnCount - b.columnCount,
    },
    {
      title: '问题数',
      dataIndex: 'issues',
      key: 'issues',
      width: 80,
      render: (issues: number) => (
        <Badge
          count={issues}
          style={{ backgroundColor: issues > 5 ? '#ff4d4f' : '#faad14' }}
        />
      ),
      sorter: (a, b) => a.issues - b.issues,
    },
    {
      title: '最后更新',
      dataIndex: 'lastUpdate',
      key: 'lastUpdate',
      width: 150,
    },
  ];

  // 刷新数据
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('数据已刷新');
    }, 1000);
  };

  // 导出报告
  const handleExport = () => {
    message.success('报告导出成功');
  };

  // 雷达图数据
  const radarData = [
    {
      metric: '完整性',
      value: latestData.completeness,
      fullMark: 100,
    },
    {
      metric: '准确性',
      value: latestData.accuracy,
      fullMark: 100,
    },
    {
      metric: '一致性',
      value: latestData.consistency,
      fullMark: 100,
    },
    {
      metric: '有效性',
      value: latestData.validity,
      fullMark: 100,
    },
    {
      metric: '唯一性',
      value: latestData.uniqueness,
      fullMark: 100,
    },
  ];

  return (
    <div className="quality-metrics-page">
      {/* 页面头部 */}
      <div className="page-header">
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <BarChartOutlined style={{ fontSize: 24, color: '#1890ff' }} />
              <div>
                <h2 style={{ margin: 0 }}>质量指标</h2>
                <p style={{ margin: 0, color: '#666' }}>数据质量指标统计与分析</p>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Select
                value={timeRange}
                onChange={setTimeRange}
                style={{ width: 120 }}
              >
                <Option value="1d">近1天</Option>
                <Option value="7d">近7天</Option>
                <Option value="30d">近30天</Option>
                <Option value="90d">近90天</Option>
              </Select>
              <Select
                value={selectedDataSource}
                onChange={setSelectedDataSource}
                style={{ width: 150 }}
                placeholder="选择数据源"
              >
                <Option value="all">全部数据源</Option>
                {dataSourceMetrics.map(ds => (
                  <Option key={ds.id} value={ds.id}>{ds.name}</Option>
                ))}
              </Select>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={loading}
              >
                刷新
              </Button>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleExport}
              >
                导出报告
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* 标签页内容 */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} className="metrics-tabs">
        {/* 概览标签页 */}
        <TabPane tab="概览" key="overview">
          {/* 关键指标卡片 */}
          <Row gutter={[16, 16]} className="metrics-overview">
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card className="metric-card">
                <Statistic
                  title="综合评分"
                  value={latestData.overall}
                  precision={1}
                  suffix="%"
                  valueStyle={{ color: getStatusColor(latestData.overall) }}
                  prefix={
                    getTrend('overall') >= 0 ? (
                      <RiseOutlined style={{ color: '#52c41a' }} />
                    ) : (
                      <FallOutlined style={{ color: '#ff4d4f' }} />
                    )
                  }
                />
                <div className="metric-status">
                  {getStatusText(latestData.overall)}
                </div>
                <div className="metric-trend">
                  趋势: {getTrend('overall') >= 0 ? '+' : ''}{getTrend('overall').toFixed(1)}%
                </div>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card className="metric-card">
                <Statistic
                  title="完整性"
                  value={latestData.completeness}
                  precision={1}
                  suffix="%"
                  valueStyle={{ color: getStatusColor(latestData.completeness) }}
                  prefix={
                    getTrend('completeness') >= 0 ? (
                      <RiseOutlined style={{ color: '#52c41a' }} />
                    ) : (
                      <FallOutlined style={{ color: '#ff4d4f' }} />
                    )
                  }
                />
                <Progress
                  percent={latestData.completeness}
                  showInfo={false}
                  strokeColor={getStatusColor(latestData.completeness)}
                  size="small"
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card className="metric-card">
                <Statistic
                  title="准确性"
                  value={latestData.accuracy}
                  precision={1}
                  suffix="%"
                  valueStyle={{ color: getStatusColor(latestData.accuracy) }}
                  prefix={
                    getTrend('accuracy') >= 0 ? (
                      <RiseOutlined style={{ color: '#52c41a' }} />
                    ) : (
                      <FallOutlined style={{ color: '#ff4d4f' }} />
                    )
                  }
                />
                <Progress
                  percent={latestData.accuracy}
                  showInfo={false}
                  strokeColor={getStatusColor(latestData.accuracy)}
                  size="small"
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card className="metric-card">
                <Statistic
                  title="一致性"
                  value={latestData.consistency}
                  precision={1}
                  suffix="%"
                  valueStyle={{ color: getStatusColor(latestData.consistency) }}
                  prefix={
                    getTrend('consistency') >= 0 ? (
                      <RiseOutlined style={{ color: '#52c41a' }} />
                    ) : (
                      <FallOutlined style={{ color: '#ff4d4f' }} />
                    )
                  }
                />
                <Progress
                  percent={latestData.consistency}
                  showInfo={false}
                  strokeColor={getStatusColor(latestData.consistency)}
                  size="small"
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card className="metric-card">
                <Statistic
                  title="有效性"
                  value={latestData.validity}
                  precision={1}
                  suffix="%"
                  valueStyle={{ color: getStatusColor(latestData.validity) }}
                  prefix={
                    getTrend('validity') >= 0 ? (
                      <RiseOutlined style={{ color: '#52c41a' }} />
                    ) : (
                      <FallOutlined style={{ color: '#ff4d4f' }} />
                    )
                  }
                />
                <Progress
                  percent={latestData.validity}
                  showInfo={false}
                  strokeColor={getStatusColor(latestData.validity)}
                  size="small"
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card className="metric-card">
                <Statistic
                  title="唯一性"
                  value={latestData.uniqueness}
                  precision={1}
                  suffix="%"
                  valueStyle={{ color: getStatusColor(latestData.uniqueness) }}
                  prefix={
                    getTrend('uniqueness') >= 0 ? (
                      <RiseOutlined style={{ color: '#52c41a' }} />
                    ) : (
                      <FallOutlined style={{ color: '#ff4d4f' }} />
                    )
                  }
                />
                <Progress
                  percent={latestData.uniqueness}
                  showInfo={false}
                  strokeColor={getStatusColor(latestData.uniqueness)}
                  size="small"
                />
              </Card>
            </Col>
          </Row>

          {/* 图表区域 */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card title="质量趋势分析" className="chart-card">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[80, 100]} />
                    <RechartsTooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="overall"
                      stroke="#1890ff"
                      strokeWidth={3}
                      name="综合评分"
                    />
                    <Line
                      type="monotone"
                      dataKey="completeness"
                      stroke="#52c41a"
                      strokeWidth={2}
                      name="完整性"
                    />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#faad14"
                      strokeWidth={2}
                      name="准确性"
                    />
                    <Line
                      type="monotone"
                      dataKey="consistency"
                      stroke="#722ed1"
                      strokeWidth={2}
                      name="一致性"
                    />
                    <Line
                      type="monotone"
                      dataKey="validity"
                      stroke="#13c2c2"
                      strokeWidth={2}
                      name="有效性"
                    />
                    <Line
                      type="monotone"
                      dataKey="uniqueness"
                      stroke="#eb2f96"
                      strokeWidth={2}
                      name="唯一性"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            
            <Col xs={24} lg={8}>
              <Card title="质量雷达图" className="chart-card">
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={false}
                    />
                    <Radar
                      name="质量指标"
                      dataKey="value"
                      stroke="#1890ff"
                      fill="#1890ff"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* 数据源标签页 */}
        <TabPane tab="数据源" key="datasource">
          <Card title="数据源质量指标" className="table-card">
            <Table
              columns={dataSourceColumns}
              dataSource={dataSourceMetrics}
              rowKey="id"
              pagination={false}
              scroll={{ x: 1000 }}
            />
          </Card>
        </TabPane>

        {/* 表级指标标签页 */}
        <TabPane tab="表级指标" key="table">
          <Card title="表级质量指标" className="table-card">
            <Table
              columns={tableColumns}
              dataSource={tableMetrics}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
              scroll={{ x: 1000 }}
            />
          </Card>
        </TabPane>

        {/* 评分分布标签页 */}
        <TabPane tab="评分分布" key="distribution">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="评分分布统计" className="chart-card">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="count" fill="#1890ff" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            
            <Col xs={24} lg={12}>
              <Card title="评分分布占比" className="chart-card">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={scoreDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="percentage"
                      label={(props: any) => `${props.range}: ${props.percentage}%`}
                    >
                      {scoreDistribution.map((entry, index) => {
                        const colors = ['#52c41a', '#faad14', '#fa8c16', '#ff7875', '#ff4d4f'];
                        return <Cell key={`cell-${index}`} fill={colors[index]} />;
                      })}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
          
          <Card title="详细分布" className="distribution-detail">
            <List
              dataSource={scoreDistribution}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={`评分范围: ${item.range}`}
                    description={
                      <Space>
                        <span>数量: {item.count}</span>
                        <span>占比: {item.percentage}%</span>
                        <Progress
                          percent={item.percentage}
                          showInfo={false}
                          strokeColor={getStatusColor(parseInt(item.range.split('-')[0]))}
                          style={{ width: 200 }}
                        />
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default QualityMetricsPage;