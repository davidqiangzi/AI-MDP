/**
 * 数据分析 - 趋势分析页面
 * 包含数据趋势图表、预测分析、同比环比分析
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Space,
  Typography,
  Spin,
  Button,
  Statistic,
  Alert,
  Radio,
  Tabs,
  Table,
  Tag,
  Progress,
  Tooltip
} from 'antd';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  ReferenceLine
} from 'recharts';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  ReloadOutlined,
  ExportOutlined,
  InfoCircleOutlined,
  RiseOutlined,
  FallOutlined,
  MinusOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import './index.css';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

// 数据类型定义
interface TrendData {
  date: string;
  visits: number;
  queries: number;
  downloads: number;
  users: number;
  predicted?: boolean;
}

interface ComparisonData {
  metric: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

interface PredictionData {
  date: string;
  actual?: number;
  predicted: number;
  confidence: number;
}

// 模拟趋势数据
const mockTrendData: TrendData[] = [
  { date: '2024-01-01', visits: 1200, queries: 890, downloads: 156, users: 89 },
  { date: '2024-01-02', visits: 1350, queries: 920, downloads: 178, users: 95 },
  { date: '2024-01-03', visits: 1180, queries: 850, downloads: 145, users: 82 },
  { date: '2024-01-04', visits: 1420, queries: 980, downloads: 189, users: 102 },
  { date: '2024-01-05', visits: 1560, queries: 1120, downloads: 234, users: 118 },
  { date: '2024-01-06', visits: 1380, queries: 1050, downloads: 198, users: 108 },
  { date: '2024-01-07', visits: 1650, queries: 1200, downloads: 267, users: 125 },
  { date: '2024-01-08', visits: 1720, queries: 1280, downloads: 289, users: 132 },
  { date: '2024-01-09', visits: 1590, queries: 1150, downloads: 245, users: 119 },
  { date: '2024-01-10', visits: 1780, queries: 1350, downloads: 312, users: 145 },
  { date: '2024-01-11', visits: 1820, queries: 1420, downloads: 334, users: 152 },
  { date: '2024-01-12', visits: 1690, queries: 1280, downloads: 298, users: 138 },
  { date: '2024-01-13', visits: 1950, queries: 1480, downloads: 356, users: 165 },
  { date: '2024-01-14', visits: 2100, queries: 1620, downloads: 398, users: 178 },
  { date: '2024-01-15', visits: 2250, queries: 1750, downloads: 445, users: 189, predicted: true },
  { date: '2024-01-16', visits: 2180, queries: 1680, downloads: 420, users: 182, predicted: true },
  { date: '2024-01-17', visits: 2350, queries: 1820, downloads: 467, users: 195, predicted: true },
  { date: '2024-01-18', visits: 2420, queries: 1890, downloads: 489, users: 203, predicted: true }
];

// 同比环比数据
const mockComparisonData: ComparisonData[] = [
  {
    metric: '总访问量',
    current: 28450,
    previous: 25680,
    change: 2770,
    changePercent: 10.8,
    trend: 'up'
  },
  {
    metric: '查询次数',
    current: 21340,
    previous: 19850,
    change: 1490,
    changePercent: 7.5,
    trend: 'up'
  },
  {
    metric: '下载次数',
    current: 4567,
    previous: 4890,
    change: -323,
    changePercent: -6.6,
    trend: 'down'
  },
  {
    metric: '活跃用户',
    current: 2156,
    previous: 2089,
    change: 67,
    changePercent: 3.2,
    trend: 'up'
  },
  {
    metric: '新增用户',
    current: 234,
    previous: 198,
    change: 36,
    changePercent: 18.2,
    trend: 'up'
  },
  {
    metric: '平均会话时长',
    current: 8.5,
    previous: 8.3,
    change: 0.2,
    changePercent: 2.4,
    trend: 'up'
  }
];

// 预测数据
const mockPredictionData: PredictionData[] = [
  { date: '2024-01-16', predicted: 2180, confidence: 85 },
  { date: '2024-01-17', predicted: 2350, confidence: 82 },
  { date: '2024-01-18', predicted: 2420, confidence: 78 },
  { date: '2024-01-19', predicted: 2580, confidence: 75 },
  { date: '2024-01-20', predicted: 2650, confidence: 72 },
  { date: '2024-01-21', predicted: 2480, confidence: 70 },
  { date: '2024-01-22', predicted: 2720, confidence: 68 }
];

const TrendAnalysis: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [chartType, setChartType] = useState('line');
  const [comparisonType, setComparisonType] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('visits');
  const [activeTab, setActiveTab] = useState('trends');

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleExport = () => {
    console.log('导出趋势分析报告');
  };

  // 同比环比表格列定义
  const comparisonColumns: ColumnsType<ComparisonData> = [
    {
      title: '指标',
      dataIndex: 'metric',
      key: 'metric',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: '当前值',
      dataIndex: 'current',
      key: 'current',
      render: (value, record) => {
        const unit = record.metric.includes('时长') ? 'min' : '';
        return <Statistic value={value} suffix={unit} valueStyle={{ fontSize: 14 }} />;
      }
    },
    {
      title: '对比值',
      dataIndex: 'previous',
      key: 'previous',
      render: (value, record) => {
        const unit = record.metric.includes('时长') ? 'min' : '';
        return <Text type="secondary">{value.toLocaleString()}{unit}</Text>;
      }
    },
    {
      title: '变化量',
      dataIndex: 'change',
      key: 'change',
      render: (value, record) => {
        const isPositive = value > 0;
        const color = isPositive ? '#52c41a' : value < 0 ? '#f5222d' : '#8c8c8c';
        const icon = isPositive ? <RiseOutlined /> : value < 0 ? <FallOutlined /> : <MinusOutlined />;
        const unit = record.metric.includes('时长') ? 'min' : '';
        
        return (
          <span style={{ color }}>
            {icon} {Math.abs(value).toLocaleString()}{unit}
          </span>
        );
      }
    },
    {
      title: '变化率',
      dataIndex: 'changePercent',
      key: 'changePercent',
      render: (value, record) => {
        const isPositive = value > 0;
        const color = isPositive ? '#52c41a' : value < 0 ? '#f5222d' : '#8c8c8c';
        
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color, fontWeight: 500 }}>
              {isPositive ? '+' : ''}{value.toFixed(1)}%
            </span>
            <Progress
              percent={Math.min(Math.abs(value), 100)}
              size="small"
              showInfo={false}
              strokeColor={color}
              style={{ width: 60 }}
            />
          </div>
        );
      }
    },
    {
      title: '趋势',
      dataIndex: 'trend',
      key: 'trend',
      render: (trend) => {
        const config = {
          up: { color: 'green', icon: <ArrowUpOutlined />, text: '上升' },
          down: { color: 'red', icon: <ArrowDownOutlined />, text: '下降' },
          stable: { color: '#8c8c8c', icon: <MinusOutlined />, text: '稳定' }
        };
        
        const { color, icon, text } = config[trend as keyof typeof config];
        
        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        );
      }
    }
  ];

  const renderTrendChart = () => {
    const ChartComponent = chartType === 'line' ? LineChart : chartType === 'area' ? AreaChart : BarChart;
    
    return (
      <ResponsiveContainer width="100%" height={400}>
        <ChartComponent data={mockTrendData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => new Date(value).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
          />
          <YAxis />
          <RechartsTooltip 
            labelFormatter={(value) => new Date(value).toLocaleDateString('zh-CN')}
            formatter={(value: number, name: string) => [
              value.toLocaleString(),
              name === 'visits' ? '访问量' : name === 'queries' ? '查询量' : name === 'downloads' ? '下载量' : '用户数'
            ]}
          />
          <Legend />
          
          {chartType === 'line' && (
            <>
              <Line
                type="monotone"
                dataKey={selectedMetric}
                stroke="#1890ff"
                strokeWidth={2}
                dot={{ fill: '#1890ff', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#1890ff', strokeWidth: 2 }}
                connectNulls={false}
                name={selectedMetric === 'visits' ? '访问量' : selectedMetric === 'queries' ? '查询量' : selectedMetric === 'downloads' ? '下载量' : '用户数'}
              />
              <ReferenceLine x="2024-01-14" stroke="#ff7875" strokeDasharray="5 5" label="预测起点" />
            </>
          )}
          
          {chartType === 'area' && (
            <Area
              type="monotone"
              dataKey={selectedMetric}
              stroke="#1890ff"
              fill="#1890ff"
              fillOpacity={0.3}
              strokeWidth={2}
              name={selectedMetric === 'visits' ? '访问量' : selectedMetric === 'queries' ? '查询量' : selectedMetric === 'downloads' ? '下载量' : '用户数'}
            />
          )}
          
          {chartType === 'bar' && (
            <Bar
              dataKey={selectedMetric}
              fill="#1890ff"
              name={selectedMetric === 'visits' ? '访问量' : selectedMetric === 'queries' ? '查询量' : selectedMetric === 'downloads' ? '下载量' : '用户数'}
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  const renderPredictionChart = () => {
    return (
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={mockPredictionData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => new Date(value).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
          />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
          <RechartsTooltip 
            labelFormatter={(value) => new Date(value).toLocaleDateString('zh-CN')}
            formatter={(value: number, name: string) => [
              name === 'confidence' ? `${value}%` : value.toLocaleString(),
              name === 'predicted' ? '预测值' : '置信度'
            ]}
          />
          <Legend />
          
          <Bar
            yAxisId="left"
            dataKey="predicted"
            fill="#1890ff"
            fillOpacity={0.6}
            name="预测值"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="confidence"
            stroke="#52c41a"
            strokeWidth={2}
            dot={{ fill: '#52c41a', strokeWidth: 2, r: 3 }}
            name="置信度"
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="trend-analysis">
      {/* 页面头部 */}
      <div className="page-header">
        <div className="header-content">
          <Title level={2}>趋势分析</Title>
          <Text type="secondary">数据趋势图表、预测分析和同比环比分析</Text>
        </div>
        <div className="header-actions">
          <Space>
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
            <Button type="primary" icon={<ExportOutlined />} onClick={handleExport}>
              导出报告
            </Button>
          </Space>
        </div>
      </div>

      <Spin spinning={loading}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} className="trend-tabs">
          {/* 趋势图表 */}
          <TabPane tab={<span><LineChartOutlined />趋势图表</span>} key="trends">
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Card 
                  title="数据趋势分析"
                  extra={
                    <Space>
                      <Select
                        value={selectedMetric}
                        onChange={setSelectedMetric}
                        style={{ width: 120 }}
                      >
                        <Option value="visits">访问量</Option>
                        <Option value="queries">查询量</Option>
                        <Option value="downloads">下载量</Option>
                        <Option value="users">用户数</Option>
                      </Select>
                      <Radio.Group value={chartType} onChange={(e) => setChartType(e.target.value)}>
                        <Radio.Button value="line"><LineChartOutlined /></Radio.Button>
                        <Radio.Button value="area"><BarChartOutlined /></Radio.Button>
                        <Radio.Button value="bar"><PieChartOutlined /></Radio.Button>
                      </Radio.Group>
                    </Space>
                  }
                  className="chart-card"
                >
                  {renderTrendChart()}
                  
                  <Alert
                    message="趋势分析说明"
                    description="虚线部分为预测数据，基于历史趋势和机器学习算法生成。预测准确性会随时间推移而降低。"
                    type="info"
                    icon={<InfoCircleOutlined />}
                    showIcon
                    style={{ marginTop: 16 }}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* 同比环比 */}
          <TabPane tab={<span><BarChartOutlined />同比环比</span>} key="comparison">
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Card 
                  title="同比环比分析"
                  extra={
                    <Radio.Group value={comparisonType} onChange={(e) => setComparisonType(e.target.value)}>
                      <Radio.Button value="week">周同比</Radio.Button>
                      <Radio.Button value="month">月同比</Radio.Button>
                      <Radio.Button value="year">年同比</Radio.Button>
                    </Radio.Group>
                  }
                  className="table-card"
                >
                  <Table
                    columns={comparisonColumns}
                    dataSource={mockComparisonData}
                    rowKey="metric"
                    pagination={false}
                    size="middle"
                  />
                  
                  <Alert
                    message="数据说明"
                    description={`当前显示的是与上${comparisonType === 'week' ? '周' : comparisonType === 'month' ? '月' : '年'}同期的对比数据。绿色表示增长，红色表示下降。`}
                    type="info"
                    icon={<InfoCircleOutlined />}
                    showIcon
                    style={{ marginTop: 16 }}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* 预测分析 */}
          <TabPane tab={<span><ArrowUpOutlined />预测分析</span>} key="prediction">
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Card 
                  title="访问量预测分析"
                  className="chart-card"
                >
                  {renderPredictionChart()}
                  
                  <Alert
                    message="预测模型说明"
                    description="基于ARIMA时间序列模型和机器学习算法，结合历史数据趋势、季节性因素和外部变量进行预测。置信度反映预测的可靠程度。"
                    type="warning"
                    icon={<InfoCircleOutlined />}
                    showIcon
                    style={{ marginTop: 16 }}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Spin>
    </div>
  );
};

export default TrendAnalysis;