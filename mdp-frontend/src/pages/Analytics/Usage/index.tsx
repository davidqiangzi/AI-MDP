/**
 * 数据分析 - 使用统计页面
 * 包含用户使用情况统计、访问量分析、热门资产排行
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Select,
  DatePicker,
  Space,
  Typography,
  Spin,
  Button,
  Tag,
  Progress,
  Avatar,
  Tooltip,
  Input
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  SearchOutlined,
  UserOutlined,
  EyeOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  ReloadOutlined,
  ExportOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import './index.css';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;

// 模拟数据类型定义
interface UserUsage {
  id: string;
  name: string;
  department: string;
  avatar?: string;
  totalVisits: number;
  totalQueries: number;
  totalDownloads: number;
  lastActive: string;
  favoriteAssets: number;
  activeHours: number;
}

interface AssetUsage {
  id: string;
  name: string;
  type: string;
  category: string;
  visits: number;
  uniqueUsers: number;
  avgDuration: number;
  lastAccessed: string;
  qualityScore: number;
}

interface HourlyUsage {
  hour: string;
  visits: number;
  queries: number;
  downloads: number;
}

// 模拟数据
const mockUserUsage: UserUsage[] = [
  {
    id: '1',
    name: '张三',
    department: '数据分析部',
    totalVisits: 1250,
    totalQueries: 890,
    totalDownloads: 156,
    lastActive: '2024-01-15 14:30',
    favoriteAssets: 23,
    activeHours: 45.5
  },
  {
    id: '2',
    name: '李四',
    department: '财务部',
    totalVisits: 980,
    totalQueries: 720,
    totalDownloads: 134,
    lastActive: '2024-01-15 16:45',
    favoriteAssets: 18,
    activeHours: 38.2
  },
  {
    id: '3',
    name: '王五',
    department: '销售部',
    totalVisits: 756,
    totalQueries: 542,
    totalDownloads: 89,
    lastActive: '2024-01-15 11:20',
    favoriteAssets: 15,
    activeHours: 32.8
  },
  {
    id: '4',
    name: '赵六',
    department: '人力资源部',
    totalVisits: 634,
    totalQueries: 445,
    totalDownloads: 67,
    lastActive: '2024-01-15 09:15',
    favoriteAssets: 12,
    activeHours: 28.5
  },
  {
    id: '5',
    name: '钱七',
    department: '运营部',
    totalVisits: 523,
    totalQueries: 378,
    totalDownloads: 45,
    lastActive: '2024-01-14 17:30',
    favoriteAssets: 9,
    activeHours: 24.3
  }
];

const mockAssetUsage: AssetUsage[] = [
  {
    id: '1',
    name: '用户行为分析表',
    type: '数据表',
    category: '用户分析',
    visits: 2340,
    uniqueUsers: 156,
    avgDuration: 8.5,
    lastAccessed: '2024-01-15 16:30',
    qualityScore: 95
  },
  {
    id: '2',
    name: '销售数据视图',
    type: '视图',
    category: '销售分析',
    visits: 1890,
    uniqueUsers: 134,
    avgDuration: 6.2,
    lastAccessed: '2024-01-15 15:45',
    qualityScore: 92
  },
  {
    id: '3',
    name: '财务报表',
    type: '数据表',
    category: '财务分析',
    visits: 1650,
    uniqueUsers: 89,
    avgDuration: 12.3,
    lastAccessed: '2024-01-15 14:20',
    qualityScore: 88
  },
  {
    id: '4',
    name: '库存管理表',
    type: '数据表',
    category: '库存管理',
    visits: 1420,
    uniqueUsers: 67,
    avgDuration: 5.8,
    lastAccessed: '2024-01-15 13:10',
    qualityScore: 90
  },
  {
    id: '5',
    name: '客户信息表',
    type: '数据表',
    category: '客户管理',
    visits: 1280,
    uniqueUsers: 78,
    avgDuration: 7.4,
    lastAccessed: '2024-01-15 12:30',
    qualityScore: 94
  }
];

const mockHourlyUsage: HourlyUsage[] = [
  { hour: '00:00', visits: 45, queries: 23, downloads: 8 },
  { hour: '02:00', visits: 32, queries: 18, downloads: 5 },
  { hour: '04:00', visits: 28, queries: 15, downloads: 3 },
  { hour: '06:00', visits: 56, queries: 34, downloads: 12 },
  { hour: '08:00', visits: 189, queries: 145, downloads: 45 },
  { hour: '10:00', visits: 267, queries: 198, downloads: 67 },
  { hour: '12:00', visits: 234, queries: 178, downloads: 56 },
  { hour: '14:00', visits: 298, queries: 234, downloads: 78 },
  { hour: '16:00', visits: 312, queries: 245, downloads: 89 },
  { hour: '18:00', visits: 198, queries: 156, downloads: 45 },
  { hour: '20:00', visits: 134, queries: 98, downloads: 23 },
  { hour: '22:00', visits: 89, queries: 67, downloads: 15 }
];

const mockDepartmentUsage = [
  { name: '数据分析部', value: 3450, color: '#1890ff' },
  { name: '财务部', value: 2890, color: '#52c41a' },
  { name: '销售部', value: 2340, color: '#faad14' },
  { name: '人力资源部', value: 1890, color: '#f5222d' },
  { name: '运营部', value: 1560, color: '#722ed1' },
  { name: '技术部', value: 1230, color: '#13c2c2' }
];

const UsageStatistics: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [userSearchText, setUserSearchText] = useState('');
  const [assetSearchText, setAssetSearchText] = useState('');

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleExport = () => {
    console.log('导出使用统计报告');
  };

  // 用户使用统计表格列定义
  const userColumns: ColumnsType<UserUsage> = [
    {
      title: '用户',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="user-info">
          <Avatar icon={<UserOutlined />} size="small" />
          <div className="user-details">
            <div className="user-name">{text}</div>
            <div className="user-department">{record.department}</div>
          </div>
        </div>
      ),
      filteredValue: userSearchText ? [userSearchText] : null,
      onFilter: (value, record) => 
        record.name.toLowerCase().includes(value.toString().toLowerCase()) ||
        record.department.toLowerCase().includes(value.toString().toLowerCase())
    },
    {
      title: '访问次数',
      dataIndex: 'totalVisits',
      key: 'totalVisits',
      sorter: (a, b) => a.totalVisits - b.totalVisits,
      render: (value) => <Text strong>{value.toLocaleString()}</Text>
    },
    {
      title: '查询次数',
      dataIndex: 'totalQueries',
      key: 'totalQueries',
      sorter: (a, b) => a.totalQueries - b.totalQueries,
      render: (value) => value.toLocaleString()
    },
    {
      title: '下载次数',
      dataIndex: 'totalDownloads',
      key: 'totalDownloads',
      sorter: (a, b) => a.totalDownloads - b.totalDownloads,
      render: (value) => value.toLocaleString()
    },
    {
      title: '活跃时长(h)',
      dataIndex: 'activeHours',
      key: 'activeHours',
      sorter: (a, b) => a.activeHours - b.activeHours,
      render: (value) => `${value}h`
    },
    {
      title: '收藏资产',
      dataIndex: 'favoriteAssets',
      key: 'favoriteAssets',
      sorter: (a, b) => a.favoriteAssets - b.favoriteAssets
    },
    {
      title: '最后活跃',
      dataIndex: 'lastActive',
      key: 'lastActive',
      render: (value) => (
        <Tooltip title={value}>
          <span><ClockCircleOutlined /> {value.split(' ')[1]}</span>
        </Tooltip>
      )
    }
  ];

  // 资产使用统计表格列定义
  const assetColumns: ColumnsType<AssetUsage> = [
    {
      title: '资产名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="asset-info">
          <div className="asset-name">{text}</div>
          <div className="asset-meta">
            <Tag color="blue">{record.type}</Tag>
            <span className="asset-category">{record.category}</span>
          </div>
        </div>
      ),
      filteredValue: assetSearchText ? [assetSearchText] : null,
      onFilter: (value, record) => 
        record.name.toLowerCase().includes(value.toString().toLowerCase()) ||
        record.category.toLowerCase().includes(value.toString().toLowerCase())
    },
    {
      title: '访问量',
      dataIndex: 'visits',
      key: 'visits',
      sorter: (a, b) => a.visits - b.visits,
      render: (value) => (
        <div className="visit-stats">
          <Text strong>{value.toLocaleString()}</Text>
          <Progress 
            percent={Math.min((value / 2500) * 100, 100)} 
            size="small" 
            showInfo={false}
            strokeColor="#1890ff"
          />
        </div>
      )
    },
    {
      title: '独立用户',
      dataIndex: 'uniqueUsers',
      key: 'uniqueUsers',
      sorter: (a, b) => a.uniqueUsers - b.uniqueUsers,
      render: (value) => (
        <span>
          <UserOutlined style={{ marginRight: 4 }} />
          {value}
        </span>
      )
    },
    {
      title: '平均时长(min)',
      dataIndex: 'avgDuration',
      key: 'avgDuration',
      sorter: (a, b) => a.avgDuration - b.avgDuration,
      render: (value) => `${value}min`
    },
    {
      title: '质量评分',
      dataIndex: 'qualityScore',
      key: 'qualityScore',
      sorter: (a, b) => a.qualityScore - b.qualityScore,
      render: (value) => (
        <span style={{ color: value >= 90 ? '#52c41a' : value >= 80 ? '#faad14' : '#f5222d' }}>
          {value}分
        </span>
      )
    },
    {
      title: '最后访问',
      dataIndex: 'lastAccessed',
      key: 'lastAccessed',
      render: (value) => (
        <Tooltip title={value}>
          <span><EyeOutlined /> {value.split(' ')[1]}</span>
        </Tooltip>
      )
    }
  ];

  return (
    <div className="usage-statistics">
      {/* 页面头部 */}
      <div className="page-header">
        <div className="header-content">
          <Title level={2}>使用统计</Title>
          <Text type="secondary">用户使用情况统计和资产访问分析</Text>
        </div>
        <div className="header-actions">
          <Space>
            <Select
              value={selectedDepartment}
              onChange={setSelectedDepartment}
              style={{ width: 120 }}
            >
              <Option value="all">全部部门</Option>
              <Option value="analytics">数据分析部</Option>
              <Option value="finance">财务部</Option>
              <Option value="sales">销售部</Option>
              <Option value="hr">人力资源部</Option>
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
            <Button type="primary" icon={<ExportOutlined />} onClick={handleExport}>
              导出报告
            </Button>
          </Space>
        </div>
      </div>

      <Spin spinning={loading}>
        {/* 使用趋势图表 */}
        <Row gutter={[24, 24]} className="charts-row">
          <Col xs={24} lg={16}>
            <Card title="24小时使用趋势" className="chart-card">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockHourlyUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="visits"
                    stroke="#1890ff"
                    strokeWidth={2}
                    name="访问量"
                  />
                  <Line
                    type="monotone"
                    dataKey="queries"
                    stroke="#52c41a"
                    strokeWidth={2}
                    name="查询量"
                  />
                  <Line
                    type="monotone"
                    dataKey="downloads"
                    stroke="#faad14"
                    strokeWidth={2}
                    name="下载量"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          
          <Col xs={24} lg={8}>
            <Card title="部门使用分布" className="chart-card">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mockDepartmentUsage}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {mockDepartmentUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* 用户使用统计 */}
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card 
              title={
                <div className="table-header">
                  <span><TrophyOutlined /> 用户使用排行</span>
                  <Search
                    placeholder="搜索用户或部门"
                    allowClear
                    style={{ width: 200 }}
                    value={userSearchText}
                    onChange={(e) => setUserSearchText(e.target.value)}
                  />
                </div>
              }
              className="table-card"
            >
              <Table
                columns={userColumns}
                dataSource={mockUserUsage}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `共 ${total} 条记录`
                }}
                scroll={{ x: 800 }}
              />
            </Card>
          </Col>
        </Row>

        {/* 资产使用统计 */}
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card 
              title={
                <div className="table-header">
                  <span><EyeOutlined /> 热门资产排行</span>
                  <Search
                    placeholder="搜索资产名称或分类"
                    allowClear
                    style={{ width: 200 }}
                    value={assetSearchText}
                    onChange={(e) => setAssetSearchText(e.target.value)}
                  />
                </div>
              }
              className="table-card"
            >
              <Table
                columns={assetColumns}
                dataSource={mockAssetUsage}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `共 ${total} 条记录`
                }}
                scroll={{ x: 900 }}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default UsageStatistics;