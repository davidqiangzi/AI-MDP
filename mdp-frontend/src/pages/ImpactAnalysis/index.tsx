import React, { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Drawer,
  Descriptions,
  Tree,
  Alert,
  Tabs,
  Progress,
  Timeline,
  Tooltip,
  Modal,
  Form,
  message,
  Row,
  Col,
  Statistic,
  Badge,
  Switch,
  DatePicker,
  Radio
} from 'antd';
import {
  SearchOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  DownloadOutlined,
  SettingOutlined,
  EyeOutlined,
  BranchesOutlined,
  ClockCircleOutlined,
  UserOutlined,
  DatabaseOutlined,
  TableOutlined,
  ApiOutlined,
  FileTextOutlined,
  LineChartOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { DataNode } from 'antd/es/tree';
import './index.css';

const { Content } = Layout;
const { Option } = Select;
const { Search } = Input;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

interface ImpactItem {
  id: string;
  name: string;
  type: 'table' | 'view' | 'job' | 'report' | 'api' | 'dashboard';
  database: string;
  schema: string;
  owner: string;
  impactLevel: 'high' | 'medium' | 'low';
  impactType: 'direct' | 'indirect';
  affectedRows?: number;
  lastModified: string;
  status: 'active' | 'inactive' | 'deprecated';
  description: string;
  dependencies: string[];
  downstreamCount: number;
  riskScore: number;
  businessCriticality: 'critical' | 'important' | 'normal';
}

interface AnalysisResult {
  id: string;
  sourceObject: string;
  changeType: 'schema' | 'data' | 'structure' | 'permission';
  impactSummary: {
    totalAffected: number;
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
  };
  analysisTime: string;
  status: 'completed' | 'running' | 'failed';
  progress: number;
}

const ImpactAnalysis: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [impactData, setImpactData] = useState<ImpactItem[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ImpactItem | null>(null);
  const [analysisModalVisible, setAnalysisModalVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('impact-list');
  const [form] = Form.useForm();

  // 模拟数据
  const mockImpactData: ImpactItem[] = [
    {
      id: '1',
      name: 'user_profile_table',
      type: 'table',
      database: 'user_db',
      schema: 'public',
      owner: '张三',
      impactLevel: 'high',
      impactType: 'direct',
      affectedRows: 1500000,
      lastModified: '2024-01-15 14:30:00',
      status: 'active',
      description: '用户档案主表，存储用户基本信息',
      dependencies: ['user_auth_table', 'user_preference_table'],
      downstreamCount: 15,
      riskScore: 85,
      businessCriticality: 'critical'
    },
    {
      id: '2',
      name: 'order_summary_view',
      type: 'view',
      database: 'order_db',
      schema: 'analytics',
      owner: '李四',
      impactLevel: 'medium',
      impactType: 'indirect',
      lastModified: '2024-01-14 09:15:00',
      status: 'active',
      description: '订单汇总视图，用于报表分析',
      dependencies: ['order_table', 'order_item_table'],
      downstreamCount: 8,
      riskScore: 65,
      businessCriticality: 'important'
    },
    {
      id: '3',
      name: 'daily_etl_job',
      type: 'job',
      database: 'etl_db',
      schema: 'jobs',
      owner: '王五',
      impactLevel: 'high',
      impactType: 'direct',
      lastModified: '2024-01-13 22:00:00',
      status: 'active',
      description: '每日数据ETL作业',
      dependencies: ['source_table_a', 'source_table_b'],
      downstreamCount: 12,
      riskScore: 78,
      businessCriticality: 'critical'
    },
    {
      id: '4',
      name: 'sales_dashboard',
      type: 'dashboard',
      database: 'bi_db',
      schema: 'dashboards',
      owner: '赵六',
      impactLevel: 'medium',
      impactType: 'indirect',
      lastModified: '2024-01-12 16:45:00',
      status: 'active',
      description: '销售数据仪表板',
      dependencies: ['sales_fact_table', 'product_dim_table'],
      downstreamCount: 5,
      riskScore: 55,
      businessCriticality: 'important'
    },
    {
      id: '5',
      name: 'customer_api',
      type: 'api',
      database: 'api_db',
      schema: 'services',
      owner: '钱七',
      impactLevel: 'low',
      impactType: 'indirect',
      lastModified: '2024-01-11 11:20:00',
      status: 'active',
      description: '客户信息API接口',
      dependencies: ['customer_table'],
      downstreamCount: 3,
      riskScore: 35,
      businessCriticality: 'normal'
    }
  ];

  const mockAnalysisResults: AnalysisResult[] = [
    {
      id: 'analysis_1',
      sourceObject: 'user_profile_table',
      changeType: 'schema',
      impactSummary: {
        totalAffected: 23,
        highRisk: 5,
        mediumRisk: 12,
        lowRisk: 6
      },
      analysisTime: '2024-01-15 15:30:00',
      status: 'completed',
      progress: 100
    },
    {
      id: 'analysis_2',
      sourceObject: 'order_table',
      changeType: 'data',
      impactSummary: {
        totalAffected: 15,
        highRisk: 2,
        mediumRisk: 8,
        lowRisk: 5
      },
      analysisTime: '2024-01-14 10:15:00',
      status: 'running',
      progress: 75
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      setImpactData(mockImpactData);
      setAnalysisResults(mockAnalysisResults);
    } catch (error) {
      message.error('数据加载失败');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      table: <DatabaseOutlined />,
      view: <EyeOutlined />,
      job: <ThunderboltOutlined />,
      report: <FileTextOutlined />,
      api: <ApiOutlined />,
      dashboard: <LineChartOutlined />
    };
    return icons[type as keyof typeof icons] || <TableOutlined />;
  };

  const getImpactLevelColor = (level: string) => {
    const colors = {
      high: 'red',
      medium: 'orange',
      low: 'green'
    };
    return colors[level as keyof typeof colors] || 'default';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'green',
      inactive: 'orange',
      deprecated: 'red'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getCriticalityColor = (criticality: string) => {
    const colors = {
      critical: 'red',
      important: 'orange',
      normal: 'blue'
    };
    return colors[criticality as keyof typeof colors] || 'default';
  };

  const columns: ColumnsType<ImpactItem> = [
    {
      title: '对象名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text, record) => (
        <Space>
          {getTypeIcon(record.type)}
          <Button
            type="link"
            onClick={() => {
              setSelectedItem(record);
              setDrawerVisible(true);
            }}
          >
            {text}
          </Button>
        </Space>
      ),
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) =>
        record.name.toLowerCase().includes(value.toString().toLowerCase())
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => (
        <Tag color="blue">
          {type === 'table' ? '数据表' :
           type === 'view' ? '视图' :
           type === 'job' ? '作业' :
           type === 'report' ? '报表' :
           type === 'api' ? 'API' :
           type === 'dashboard' ? '仪表板' : type}
        </Tag>
      ),
      filters: [
        { text: '数据表', value: 'table' },
        { text: '视图', value: 'view' },
        { text: '作业', value: 'job' },
        { text: '报表', value: 'report' },
        { text: 'API', value: 'api' },
        { text: '仪表板', value: 'dashboard' }
      ],
      onFilter: (value, record) => record.type === value
    },
    {
      title: '数据库/模式',
      key: 'database_schema',
      width: 150,
      render: (_, record) => (
        <div>
          <div>{record.database}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>{record.schema}</div>
        </div>
      )
    },
    {
      title: '影响级别',
      dataIndex: 'impactLevel',
      key: 'impactLevel',
      width: 100,
      render: (level) => (
        <Tag color={getImpactLevelColor(level)}>
          {level === 'high' ? '高' : level === 'medium' ? '中' : '低'}
        </Tag>
      ),
      filters: [
        { text: '高', value: 'high' },
        { text: '中', value: 'medium' },
        { text: '低', value: 'low' }
      ],
      onFilter: (value, record) => record.impactLevel === value
    },
    {
      title: '影响类型',
      dataIndex: 'impactType',
      key: 'impactType',
      width: 100,
      render: (type) => (
        <Tag color={type === 'direct' ? 'red' : 'orange'}>
          {type === 'direct' ? '直接' : '间接'}
        </Tag>
      )
    },
    {
      title: '下游对象数',
      dataIndex: 'downstreamCount',
      key: 'downstreamCount',
      width: 100,
      render: (count) => (
        <Badge count={count} style={{ backgroundColor: '#52c41a' }} />
      ),
      sorter: (a, b) => a.downstreamCount - b.downstreamCount
    },
    {
      title: '风险评分',
      dataIndex: 'riskScore',
      key: 'riskScore',
      width: 120,
      render: (score) => (
        <Progress
          percent={score}
          size="small"
          strokeColor={score >= 80 ? '#ff4d4f' : score >= 60 ? '#faad14' : '#52c41a'}
          showInfo={false}
        />
      ),
      sorter: (a, b) => a.riskScore - b.riskScore
    },
    {
      title: '业务重要性',
      dataIndex: 'businessCriticality',
      key: 'businessCriticality',
      width: 100,
      render: (criticality) => (
        <Tag color={getCriticalityColor(criticality)}>
          {criticality === 'critical' ? '关键' :
           criticality === 'important' ? '重要' : '一般'}
        </Tag>
      )
    },
    {
      title: '负责人',
      dataIndex: 'owner',
      key: 'owner',
      width: 100,
      render: (owner) => (
        <Space>
          <UserOutlined />
          {owner}
        </Space>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status === 'active' ? '活跃' :
           status === 'inactive' ? '非活跃' : '已废弃'}
        </Tag>
      )
    },
    {
      title: '最后修改',
      dataIndex: 'lastModified',
      key: 'lastModified',
      width: 150,
      render: (time) => (
        <Tooltip title={time}>
          <Space>
            <ClockCircleOutlined />
            {time.split(' ')[0]}
          </Space>
        </Tooltip>
      ),
      sorter: (a, b) => new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime()
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedItem(record);
              setDrawerVisible(true);
            }}
          >
            查看
          </Button>
          <Button
            type="text"
            icon={<BranchesOutlined />}
            onClick={() => handleAnalyze(record)}
          >
            分析
          </Button>
        </Space>
      )
    }
  ];

  const handleAnalyze = (item: ImpactItem) => {
    Modal.confirm({
      title: '确认影响分析',
      content: `确定要对 "${item.name}" 进行影响分析吗？`,
      onOk: () => {
        message.success('影响分析已启动');
        // 这里可以调用实际的分析API
      }
    });
  };

  const handleBatchAnalyze = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要分析的对象');
      return;
    }
    setAnalysisModalVisible(true);
  };

  const handleExport = () => {
    message.success('导出功能开发中...');
  };

  const filteredData = impactData.filter(item => {
    const matchesSearch = !searchText || 
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesLevel = filterLevel === 'all' || item.impactLevel === filterLevel;
    return matchesSearch && matchesType && matchesLevel;
  });

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
    getCheckboxProps: (record: ImpactItem) => ({
      disabled: record.status === 'deprecated'
    })
  };

  const renderImpactTree = () => {
    if (!selectedItem) return null;

    const treeData: DataNode[] = [
      {
        title: selectedItem.name,
        key: selectedItem.id,
        icon: getTypeIcon(selectedItem.type),
        children: selectedItem.dependencies.map((dep, index) => ({
          title: dep,
          key: `${selectedItem.id}-dep-${index}`,
          icon: <DatabaseOutlined />
        }))
      }
    ];

    return (
      <Tree
        showIcon
        defaultExpandAll
        treeData={treeData}
        className="impact-tree"
      />
    );
  };

  const renderAnalysisHistory = () => {
    return (
      <Timeline>
        {analysisResults.map(result => (
          <Timeline.Item
            key={result.id}
            color={result.status === 'completed' ? 'green' : 
                   result.status === 'running' ? 'blue' : 'red'}
            dot={result.status === 'completed' ? <CheckCircleOutlined /> :
                 result.status === 'running' ? <ClockCircleOutlined /> :
                 <ExclamationCircleOutlined />}
          >
            <div>
              <strong>{result.sourceObject}</strong>
              <Tag color="blue" style={{ marginLeft: 8 }}>
                {result.changeType === 'schema' ? '结构变更' :
                 result.changeType === 'data' ? '数据变更' :
                 result.changeType === 'structure' ? '架构变更' : '权限变更'}
              </Tag>
            </div>
            <div style={{ marginTop: 4, fontSize: '12px', color: '#666' }}>
              {result.analysisTime} • 影响对象: {result.impactSummary.totalAffected}个
            </div>
            {result.status === 'running' && (
              <Progress percent={result.progress} size="small" style={{ marginTop: 4 }} />
            )}
          </Timeline.Item>
        ))}
      </Timeline>
    );
  };

  return (
    <div className="impact-analysis-page">
      <Layout>
        <Content>
          {/* 页面头部 */}
          <Card className="page-header">
            <Row justify="space-between" align="middle">
              <Col>
                <h2>影响分析</h2>
                <p>分析数据变更对下游对象的影响范围和风险等级</p>
              </Col>
              <Col>
                <Space>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={loadData}
                    loading={loading}
                  >
                    刷新
                  </Button>
                  <Button
                    icon={<SettingOutlined />}
                    onClick={() => setSettingsVisible(true)}
                  >
                    设置
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* 统计卡片 */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="总影响对象"
                  value={impactData.length}
                  prefix={<DatabaseOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="高风险对象"
                  value={impactData.filter(item => item.impactLevel === 'high').length}
                  prefix={<WarningOutlined />}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="关键业务对象"
                  value={impactData.filter(item => item.businessCriticality === 'critical').length}
                  prefix={<SafetyCertificateOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="平均风险评分"
                  value={Math.round(impactData.reduce((sum, item) => sum + item.riskScore, 0) / impactData.length)}
                  suffix="分"
                  prefix={<LineChartOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>

          {/* 主要内容 */}
          <Card>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="影响对象列表" key="impact-list">
                {/* 控制面板 */}
                <Card className="control-panel" style={{ marginBottom: 16 }}>
                  <Row gutter={16} align="middle">
                    <Col span={6}>
                      <Search
                        placeholder="搜索对象名称或描述"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        allowClear
                      />
                    </Col>
                    <Col span={4}>
                      <Select
                        placeholder="对象类型"
                        value={filterType}
                        onChange={setFilterType}
                        style={{ width: '100%' }}
                      >
                        <Option value="all">全部类型</Option>
                        <Option value="table">数据表</Option>
                        <Option value="view">视图</Option>
                        <Option value="job">作业</Option>
                        <Option value="report">报表</Option>
                        <Option value="api">API</Option>
                        <Option value="dashboard">仪表板</Option>
                      </Select>
                    </Col>
                    <Col span={4}>
                      <Select
                        placeholder="影响级别"
                        value={filterLevel}
                        onChange={setFilterLevel}
                        style={{ width: '100%' }}
                      >
                        <Option value="all">全部级别</Option>
                        <Option value="high">高</Option>
                        <Option value="medium">中</Option>
                        <Option value="low">低</Option>
                      </Select>
                    </Col>
                    <Col span={10}>
                      <Space>
                        <Button
                          type="primary"
                          icon={<BranchesOutlined />}
                          onClick={handleBatchAnalyze}
                          disabled={selectedRowKeys.length === 0}
                        >
                          批量分析 ({selectedRowKeys.length})
                        </Button>
                        <Button
                          icon={<DownloadOutlined />}
                          onClick={handleExport}
                        >
                          导出报告
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </Card>

                {/* 数据表格 */}
                <Table
                  columns={columns}
                  dataSource={filteredData}
                  rowKey="id"
                  loading={loading}
                  rowSelection={rowSelection}
                  scroll={{ x: 1500 }}
                  pagination={{
                    total: filteredData.length,
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
                  }}
                />
              </TabPane>

              <TabPane tab="分析历史" key="analysis-history">
                <Card title="分析历史记录">
                  {renderAnalysisHistory()}
                </Card>
              </TabPane>
            </Tabs>
          </Card>
        </Content>
      </Layout>

      {/* 详情抽屉 */}
      <Drawer
        title="影响分析详情"
        width={600}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {selectedItem && (
          <div>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="对象名称">
                <Space>
                  {getTypeIcon(selectedItem.type)}
                  {selectedItem.name}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="类型">
                <Tag color="blue">
                  {selectedItem.type === 'table' ? '数据表' :
                   selectedItem.type === 'view' ? '视图' :
                   selectedItem.type === 'job' ? '作业' :
                   selectedItem.type === 'report' ? '报表' :
                   selectedItem.type === 'api' ? 'API' :
                   selectedItem.type === 'dashboard' ? '仪表板' : selectedItem.type}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="数据库/模式">
                {selectedItem.database} / {selectedItem.schema}
              </Descriptions.Item>
              <Descriptions.Item label="影响级别">
                <Tag color={getImpactLevelColor(selectedItem.impactLevel)}>
                  {selectedItem.impactLevel === 'high' ? '高' :
                   selectedItem.impactLevel === 'medium' ? '中' : '低'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="影响类型">
                <Tag color={selectedItem.impactType === 'direct' ? 'red' : 'orange'}>
                  {selectedItem.impactType === 'direct' ? '直接影响' : '间接影响'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="风险评分">
                <Progress
                  percent={selectedItem.riskScore}
                  strokeColor={selectedItem.riskScore >= 80 ? '#ff4d4f' :
                             selectedItem.riskScore >= 60 ? '#faad14' : '#52c41a'}
                />
              </Descriptions.Item>
              <Descriptions.Item label="业务重要性">
                <Tag color={getCriticalityColor(selectedItem.businessCriticality)}>
                  {selectedItem.businessCriticality === 'critical' ? '关键' :
                   selectedItem.businessCriticality === 'important' ? '重要' : '一般'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="下游对象数">
                <Badge count={selectedItem.downstreamCount} style={{ backgroundColor: '#52c41a' }} />
              </Descriptions.Item>
              <Descriptions.Item label="负责人">
                <Space>
                  <UserOutlined />
                  {selectedItem.owner}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(selectedItem.status)}>
                  {selectedItem.status === 'active' ? '活跃' :
                   selectedItem.status === 'inactive' ? '非活跃' : '已废弃'}
                </Tag>
              </Descriptions.Item>
              {selectedItem.affectedRows && (
                <Descriptions.Item label="影响行数">
                  {selectedItem.affectedRows.toLocaleString()}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="最后修改">
                {selectedItem.lastModified}
              </Descriptions.Item>
              <Descriptions.Item label="描述">
                {selectedItem.description}
              </Descriptions.Item>
            </Descriptions>

            <Card title="依赖关系" style={{ marginTop: 16 }}>
              {renderImpactTree()}
            </Card>

            <div style={{ marginTop: 16 }}>
              <Button
                type="primary"
                icon={<BranchesOutlined />}
                onClick={() => handleAnalyze(selectedItem)}
                block
              >
                执行影响分析
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* 批量分析模态框 */}
      <Modal
        title="批量影响分析"
        open={analysisModalVisible}
        onCancel={() => setAnalysisModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setAnalysisModalVisible(false)}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              form.validateFields().then(() => {
                message.success('批量分析已启动');
                setAnalysisModalVisible(false);
              });
            }}
          >
            开始分析
          </Button>
        ]}
      >
        <Form form={form} layout="vertical">
          <Alert
            message={`已选择 ${selectedRowKeys.length} 个对象进行批量分析`}
            type="info"
            style={{ marginBottom: 16 }}
          />
          <Form.Item
            name="changeType"
            label="变更类型"
            rules={[{ required: true, message: '请选择变更类型' }]}
          >
            <Radio.Group>
              <Radio value="schema">结构变更</Radio>
              <Radio value="data">数据变更</Radio>
              <Radio value="structure">架构变更</Radio>
              <Radio value="permission">权限变更</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="analysisDepth"
            label="分析深度"
            rules={[{ required: true, message: '请选择分析深度' }]}
          >
            <Select placeholder="选择分析深度">
              <Option value="1">1级依赖</Option>
              <Option value="2">2级依赖</Option>
              <Option value="3">3级依赖</Option>
              <Option value="all">全部依赖</Option>
            </Select>
          </Form.Item>
          <Form.Item name="includeInactive" valuePropName="checked">
            <Switch /> 包含非活跃对象
          </Form.Item>
          <Form.Item name="timeRange" label="分析时间范围">
            <RangePicker showTime />
          </Form.Item>
        </Form>
      </Modal>

      {/* 设置抽屉 */}
      <Drawer
        title="分析设置"
        width={400}
        open={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      >
        <Form layout="vertical">
          <h4>风险评估设置</h4>
          <Form.Item label="高风险阈值">
            <Input placeholder="80" suffix="分" />
          </Form.Item>
          <Form.Item label="中风险阈值">
            <Input placeholder="60" suffix="分" />
          </Form.Item>
          
          <h4>通知设置</h4>
          <Form.Item>
            <Switch defaultChecked /> 分析完成通知
          </Form.Item>
          <Form.Item>
            <Switch defaultChecked /> 高风险对象告警
          </Form.Item>
          
          <h4>显示设置</h4>
          <Form.Item>
            <Switch defaultChecked /> 显示风险评分
          </Form.Item>
          <Form.Item>
            <Switch defaultChecked /> 显示依赖关系
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default ImpactAnalysis;