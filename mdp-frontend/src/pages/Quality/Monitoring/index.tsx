/**
 * 质量监控页面
 * 包含实时监控面板、告警设置、监控图表等功能
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
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Alert,
  Tooltip,
  Badge,
  Timeline,
  List,
  Avatar,
  Divider,
  DatePicker,
  message,
} from 'antd';
import {
  DashboardOutlined,
  AlertOutlined,
  RiseOutlined,
  FallOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  SettingOutlined,
  BellOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
  WarningOutlined,
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
} from 'recharts';
import type { ColumnsType } from 'antd/es/table';
import './index.css';

const { Option } = Select;
const { RangePicker } = DatePicker;

// 监控数据类型
interface MonitoringData {
  timestamp: string;
  completeness: number;
  accuracy: number;
  consistency: number;
  validity: number;
  uniqueness: number;
  overall: number;
}

// 告警规则类型
interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: 'gt' | 'lt' | 'eq';
  threshold: number;
  severity: 'high' | 'medium' | 'low';
  status: 'active' | 'inactive';
  recipients: string[];
  createTime: string;
  lastTriggered?: string;
}

// 告警记录类型
interface AlertRecord {
  id: string;
  ruleName: string;
  metric: string;
  value: number;
  threshold: number;
  severity: 'high' | 'medium' | 'low';
  status: 'active' | 'resolved' | 'acknowledged';
  triggerTime: string;
  resolveTime?: string;
  message: string;
}

// 模拟监控数据
const mockMonitoringData: MonitoringData[] = [
  { timestamp: '00:00', completeness: 98.5, accuracy: 96.2, consistency: 94.8, validity: 97.1, uniqueness: 99.2, overall: 97.2 },
  { timestamp: '02:00', completeness: 97.8, accuracy: 95.9, consistency: 95.2, validity: 96.8, uniqueness: 98.9, overall: 96.9 },
  { timestamp: '04:00', completeness: 98.2, accuracy: 96.5, consistency: 94.5, validity: 97.3, uniqueness: 99.1, overall: 97.1 },
  { timestamp: '06:00', completeness: 97.5, accuracy: 95.8, consistency: 93.9, validity: 96.5, uniqueness: 98.7, overall: 96.5 },
  { timestamp: '08:00', completeness: 98.8, accuracy: 97.1, consistency: 95.8, validity: 97.8, uniqueness: 99.3, overall: 97.8 },
  { timestamp: '10:00', completeness: 98.1, accuracy: 96.3, consistency: 94.7, validity: 97.0, uniqueness: 98.8, overall: 97.0 },
  { timestamp: '12:00', completeness: 97.9, accuracy: 96.0, consistency: 95.1, validity: 96.9, uniqueness: 99.0, overall: 96.8 },
  { timestamp: '14:00', completeness: 98.3, accuracy: 96.7, consistency: 94.9, validity: 97.2, uniqueness: 99.1, overall: 97.2 },
  { timestamp: '16:00', completeness: 98.0, accuracy: 96.1, consistency: 95.3, validity: 96.8, uniqueness: 98.9, overall: 96.9 },
  { timestamp: '18:00', completeness: 98.6, accuracy: 96.8, consistency: 95.6, validity: 97.5, uniqueness: 99.2, overall: 97.5 },
  { timestamp: '20:00', completeness: 98.2, accuracy: 96.4, consistency: 94.8, validity: 97.1, uniqueness: 98.8, overall: 97.1 },
  { timestamp: '22:00', completeness: 98.4, accuracy: 96.6, consistency: 95.2, validity: 97.3, uniqueness: 99.0, overall: 97.3 },
];

// 模拟告警规则
const mockAlertRules: AlertRule[] = [
  {
    id: '1',
    name: '数据完整性告警',
    metric: 'completeness',
    condition: 'lt',
    threshold: 95,
    severity: 'high',
    status: 'active',
    recipients: ['admin@company.com'],
    createTime: '2024-01-20 10:00:00',
    lastTriggered: '2024-01-25 08:30:00',
  },
  {
    id: '2',
    name: '数据准确性告警',
    metric: 'accuracy',
    condition: 'lt',
    threshold: 90,
    severity: 'medium',
    status: 'active',
    recipients: ['data@company.com'],
    createTime: '2024-01-18 14:30:00',
  },
];

// 模拟告警记录
const mockAlertRecords: AlertRecord[] = [
  {
    id: '1',
    ruleName: '数据完整性告警',
    metric: 'completeness',
    value: 94.2,
    threshold: 95,
    severity: 'high',
    status: 'resolved',
    triggerTime: '2024-01-25 08:30:00',
    resolveTime: '2024-01-25 09:15:00',
    message: '用户表数据完整性低于阈值',
  },
  {
    id: '2',
    ruleName: '数据准确性告警',
    metric: 'accuracy',
    value: 89.5,
    threshold: 90,
    severity: 'medium',
    status: 'acknowledged',
    triggerTime: '2024-01-25 10:20:00',
    message: '订单表数据准确性低于阈值',
  },
];

/**
 * 质量监控页面组件
 */
const QualityMonitoringPage: React.FC = () => {
  const [monitoringData] = useState<MonitoringData[]>(mockMonitoringData);
  const [alertRules, setAlertRules] = useState<AlertRule[]>(mockAlertRules);
  const [alertRecords, setAlertRecords] = useState<AlertRecord[]>(mockAlertRecords);
  const [loading, setLoading] = useState(false);
  const [isRuleModalVisible, setIsRuleModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [form] = Form.useForm();

  // 获取最新数据
  const latestData = monitoringData[monitoringData.length - 1];

  // 计算趋势
  const getTrend = (metric: keyof MonitoringData) => {
    if (monitoringData.length < 2) return 0;
    const current = latestData[metric] as number;
    const previous = monitoringData[monitoringData.length - 2][metric] as number;
    return current - previous;
  };

  // 获取状态颜色
  const getStatusColor = (value: number) => {
    if (value >= 95) return '#52c41a';
    if (value >= 90) return '#faad14';
    return '#ff4d4f';
  };

  // 获取状态文本
  const getStatusText = (value: number) => {
    if (value >= 95) return '优秀';
    if (value >= 90) return '良好';
    if (value >= 80) return '一般';
    return '较差';
  };

  // 告警规则表格列配置
  const alertRuleColumns: ColumnsType<AlertRule> = [
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '监控指标',
      dataIndex: 'metric',
      key: 'metric',
      width: 120,
      render: (metric: string) => {
        const metricMap: Record<string, string> = {
          completeness: '完整性',
          accuracy: '准确性',
          consistency: '一致性',
          validity: '有效性',
          uniqueness: '唯一性',
          overall: '综合评分',
        };
        return metricMap[metric] || metric;
      },
    },
    {
      title: '条件',
      key: 'condition',
      width: 120,
      render: (_, record) => {
        const conditionMap = {
          gt: '大于',
          lt: '小于',
          eq: '等于',
        };
        return `${conditionMap[record.condition]} ${record.threshold}%`;
      },
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (severity: string) => {
        const severityConfig = {
          high: { label: '高', color: 'error' },
          medium: { label: '中', color: 'warning' },
          low: { label: '低', color: 'success' },
        };
        const config = severityConfig[severity as keyof typeof severityConfig];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status === 'active' ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '最后触发',
      dataIndex: 'lastTriggered',
      key: 'lastTriggered',
      width: 150,
      render: (time?: string) => time || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditRule(record)}
            />
          </Tooltip>
          <Tooltip title={record.status === 'active' ? '禁用' : '启用'}>
            <Switch
              size="small"
              checked={record.status === 'active'}
              onChange={(checked) => handleToggleAlertRule(record.id, checked)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteRule(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // 告警记录表格列配置
  const alertRecordColumns: ColumnsType<AlertRecord> = [
    {
      title: '告警规则',
      dataIndex: 'ruleName',
      key: 'ruleName',
      width: 200,
    },
    {
      title: '指标值',
      key: 'value',
      width: 120,
      render: (_, record) => (
        <span style={{ color: getStatusColor(record.value) }}>
          {record.value}% / {record.threshold}%
        </span>
      ),
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (severity: string) => {
        const severityConfig = {
          high: { label: '高', color: 'error' },
          medium: { label: '中', color: 'warning' },
          low: { label: '低', color: 'success' },
        };
        const config = severityConfig[severity as keyof typeof severityConfig];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusConfig = {
          active: { label: '活跃', color: 'error' },
          acknowledged: { label: '已确认', color: 'warning' },
          resolved: { label: '已解决', color: 'success' },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '触发时间',
      dataIndex: 'triggerTime',
      key: 'triggerTime',
      width: 150,
    },
    {
      title: '解决时间',
      dataIndex: 'resolveTime',
      key: 'resolveTime',
      width: 150,
      render: (time?: string) => time || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          {record.status === 'active' && (
            <Button
              type="text"
              size="small"
              onClick={() => handleAcknowledgeAlert(record.id)}
            >
              确认
            </Button>
          )}
          {record.status !== 'resolved' && (
            <Button
              type="text"
              size="small"
              onClick={() => handleResolveAlert(record.id)}
            >
              解决
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // 处理新建告警规则
  const handleCreateRule = () => {
    setEditingRule(null);
    form.resetFields();
    setIsRuleModalVisible(true);
  };

  // 处理编辑告警规则
  const handleEditRule = (rule: AlertRule) => {
    setEditingRule(rule);
    form.setFieldsValue(rule);
    setIsRuleModalVisible(true);
  };

  // 处理保存告警规则
  const handleSaveRule = async (values: any) => {
    try {
      setLoading(true);
      
      if (editingRule) {
        const updatedRules = alertRules.map(rule => 
          rule.id === editingRule.id ? { ...rule, ...values } : rule
        );
        setAlertRules(updatedRules);
        message.success('告警规则更新成功');
      } else {
        const newRule: AlertRule = {
          ...values,
          id: Date.now().toString(),
          createTime: new Date().toLocaleString(),
          status: 'active',
        };
        setAlertRules([newRule, ...alertRules]);
        message.success('告警规则创建成功');
      }
      
      setIsRuleModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理告警规则启用/禁用
  const handleToggleAlertRule = (id: string, checked: boolean) => {
    const updatedRules = alertRules.map(rule => 
      rule.id === id ? { ...rule, status: (checked ? 'active' : 'inactive') as AlertRule['status'] } : rule
    );
    setAlertRules(updatedRules);
    message.success(`告警规则已${checked ? '启用' : '禁用'}`);
  };

  // 处理删除规则
  const handleDeleteRule = (id: string) => {
    setAlertRules(alertRules.filter(rule => rule.id !== id));
    message.success('告警规则删除成功');
  };

  // 处理确认告警
  const handleAcknowledgeAlert = (id: string) => {
    const updatedRecords = alertRecords.map(record => 
      record.id === id ? { ...record, status: 'acknowledged' as const } : record
    );
    setAlertRecords(updatedRecords);
    message.success('告警已确认');
  };

  // 处理解决告警
  const handleResolveAlert = (id: string) => {
    const updatedRecords = alertRecords.map(record => 
      record.id === id 
        ? { ...record, status: 'resolved' as const, resolveTime: new Date().toLocaleString() }
        : record
    );
    setAlertRecords(updatedRecords);
    message.success('告警已解决');
  };

  // 刷新数据
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('数据已刷新');
    }, 1000);
  };

  return (
    <div className="quality-monitoring-page">
      {/* 实时监控概览 */}
      <Row gutter={[16, 16]} className="monitoring-overview">
        <Col span={24}>
          <Card
            title={
              <Space>
                <DashboardOutlined />
                实时监控概览
                <Button
                  type="text"
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  loading={loading}
                >
                  刷新
                </Button>
              </Space>
            }
            extra={
              <Badge
                status="processing"
                text="实时更新中"
              />
            }
          >
            <Row gutter={[16, 16]}>
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
          </Card>
        </Col>
      </Row>

      {/* 监控图表 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="质量趋势图" className="chart-card">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monitoringData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
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
          <Card title="质量分布" className="chart-card">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: '完整性', value: latestData.completeness, fill: '#52c41a' },
                    { name: '准确性', value: latestData.accuracy, fill: '#faad14' },
                    { name: '一致性', value: latestData.consistency, fill: '#722ed1' },
                    { name: '有效性', value: latestData.validity, fill: '#13c2c2' },
                    { name: '唯一性', value: latestData.uniqueness, fill: '#eb2f96' },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={(props: any) => `${props.name}: ${props.value}%`}
                >
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 告警管理 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <SettingOutlined />
                告警规则
              </Space>
            }
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateRule}
              >
                新建规则
              </Button>
            }
          >
            <Table
              columns={alertRuleColumns}
              dataSource={alertRules}
              rowKey="id"
              size="small"
              pagination={false}
              scroll={{ x: 800 }}
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <AlertOutlined />
                告警记录
                <Badge count={alertRecords.filter(r => r.status === 'active').length} />
              </Space>
            }
          >
            <Table
              columns={alertRecordColumns}
              dataSource={alertRecords}
              rowKey="id"
              size="small"
              pagination={false}
              scroll={{ x: 800 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 新建/编辑告警规则弹窗 */}
      <Modal
        title={editingRule ? '编辑告警规则' : '新建告警规则'}
        open={isRuleModalVisible}
        onCancel={() => setIsRuleModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveRule}
          initialValues={{
            severity: 'medium',
            condition: 'lt',
            status: 'active',
          }}
        >
          <Form.Item
            name="name"
            label="规则名称"
            rules={[{ required: true, message: '请输入规则名称' }]}
          >
            <Input placeholder="请输入规则名称" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="metric"
                label="监控指标"
                rules={[{ required: true, message: '请选择监控指标' }]}
              >
                <Select placeholder="请选择监控指标">
                  <Option value="completeness">完整性</Option>
                  <Option value="accuracy">准确性</Option>
                  <Option value="consistency">一致性</Option>
                  <Option value="validity">有效性</Option>
                  <Option value="uniqueness">唯一性</Option>
                  <Option value="overall">综合评分</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="severity"
                label="严重程度"
                rules={[{ required: true, message: '请选择严重程度' }]}
              >
                <Select placeholder="请选择严重程度">
                  <Option value="high">高</Option>
                  <Option value="medium">中</Option>
                  <Option value="low">低</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="condition"
                label="条件"
                rules={[{ required: true, message: '请选择条件' }]}
              >
                <Select placeholder="请选择条件">
                  <Option value="gt">大于</Option>
                  <Option value="lt">小于</Option>
                  <Option value="eq">等于</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="threshold"
                label="阈值(%)"
                rules={[{ required: true, message: '请输入阈值' }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  style={{ width: '100%' }}
                  placeholder="请输入阈值"
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="recipients"
            label="接收人邮箱"
            rules={[{ required: true, message: '请输入接收人邮箱' }]}
          >
            <Select
              mode="tags"
              placeholder="请输入邮箱地址，支持多个"
              tokenSeparators={[',', ';']}
            />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingRule ? '更新' : '创建'}
              </Button>
              <Button onClick={() => setIsRuleModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QualityMonitoringPage;