import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Row,
  Col,
  Descriptions,
  Table,
  Tag,
  Button,
  Space,
  Statistic,
  Progress,
  Timeline,
  List,
  Avatar,
  Rate,
  Tooltip,
  message,
  Divider,
  Typography,
  Badge
} from 'antd';
import {
  EditOutlined,
  StarOutlined,
  ShareAltOutlined,
  DownloadOutlined,
  DatabaseOutlined,
  TableOutlined,
  UserOutlined,
  CalendarOutlined,
  EyeOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setBreadcrumbs } from '../../store/slices/uiSlice';
import './Detail.css';

const { TabPane } = Tabs;
const { Title, Paragraph, Text } = Typography;

interface DataAssetDetail {
  id: string;
  name: string;
  type: 'table' | 'view' | 'file' | 'api';
  businessDomain: string;
  database: string;
  schema?: string;
  description: string;
  businessDescription: string;
  usageScenario: string;
  notes: string;
  owner: string;
  createTime: string;
  updateTime: string;
  healthScore: number;
  status: 'active' | 'inactive' | 'deprecated';
  tags: string[];
  rowCount: number;
  dataSize: string;
  partitionInfo?: string;
  // 业务价值相关字段
  businessValue: {
    valueScore: number; // 业务价值评分 (0-100)
    impactLevel: 'low' | 'medium' | 'high' | 'critical'; // 业务影响级别
    businessCriticality: string; // 业务关键性描述
    revenueImpact: string; // 收入影响
    costSaving: string; // 成本节约
    riskLevel: 'low' | 'medium' | 'high'; // 风险等级
  };
  usageMetrics: {
    monthlyActiveUsers: number; // 月活跃用户数
    dailyQueries: number; // 日查询量
    businessReports: number; // 关联业务报表数
    downstreamSystems: number; // 下游系统数
    dataFreshness: string; // 数据新鲜度
  };
}

interface FieldInfo {
  name: string;
  type: string;
  length?: number;
  nullable: boolean;
  isPrimaryKey: boolean;
  isSensitive: boolean;
  description: string;
  sampleData?: string;
}

interface QualityRule {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive';
  lastExecuteTime: string;
  result: 'pass' | 'fail' | 'warning';
  score: number;
}

interface QualityIssue {
  id: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  discoveryTime: string;
  status: 'open' | 'resolved' | 'ignored';
  assignee?: string;
}

interface UsageInfo {
  dailyAccess: number;
  weeklyAccess: number;
  monthlyAccess: number;
  topUsers: Array<{
    name: string;
    accessCount: number;
    lastAccess: string;
  }>;
  relatedReports: Array<{
    name: string;
    type: string;
    lastUsed: string;
  }>;
}

const DataAssetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [assetDetail, setAssetDetail] = useState<DataAssetDetail | null>(null);
  const [fields, setFields] = useState<FieldInfo[]>([]);
  const [qualityRules, setQualityRules] = useState<QualityRule[]>([]);
  const [qualityIssues, setQualityIssues] = useState<QualityIssue[]>([]);
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);
  const [activeTab, setActiveTab] = useState('business-value');

  // 模拟数据
  const mockAssetDetail: DataAssetDetail = {
    id: '1',
    name: 'user_basic_info',
    type: 'table',
    businessDomain: '用户中心',
    database: 'user_db',
    schema: 'public',
    description: '用户基础信息表，包含用户ID、姓名、手机号等基本信息',
    businessDescription: '该表存储了平台所有注册用户的基础信息，是用户相关业务的核心数据表。包含用户的身份标识、联系方式、基本属性等关键信息。',
    usageScenario: '1. 用户登录验证\n2. 用户信息展示\n3. 用户画像分析\n4. 营销活动推送',
    notes: '注意：该表包含敏感个人信息，访问需要相应权限。手机号字段已脱敏处理。',
    owner: '张三',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-20 14:20:00',
    healthScore: 95,
    status: 'active',
    tags: ['核心表', '用户数据', 'PII'],
    rowCount: 1250000,
    dataSize: '2.3 GB',
    partitionInfo: '按创建日期分区（月分区）',
    // 业务价值相关数据
    businessValue: {
      valueScore: 92,
      impactLevel: 'critical',
      businessCriticality: '核心用户数据表，支撑用户登录、身份验证、个性化推荐等关键业务流程，是平台运营的基础数据资产',
      revenueImpact: '直接支撑用户增长和留存，预估年度收入贡献约500万元',
      costSaving: '统一用户数据管理，减少重复开发成本约30万元/年',
      riskLevel: 'high'
    },
    usageMetrics: {
      monthlyActiveUsers: 156,
      dailyQueries: 8500,
      businessReports: 23,
      downstreamSystems: 12,
      dataFreshness: '实时更新'
    }
  };

  const mockFields: FieldInfo[] = [
    {
      name: 'user_id',
      type: 'bigint',
      nullable: false,
      isPrimaryKey: true,
      isSensitive: false,
      description: '用户唯一标识',
      sampleData: '1001'
    },
    {
      name: 'username',
      type: 'varchar',
      length: 50,
      nullable: false,
      isPrimaryKey: false,
      isSensitive: false,
      description: '用户名',
      sampleData: 'john_doe'
    },
    {
      name: 'real_name',
      type: 'varchar',
      length: 100,
      nullable: true,
      isPrimaryKey: false,
      isSensitive: true,
      description: '真实姓名',
      sampleData: '张***'
    },
    {
      name: 'mobile',
      type: 'varchar',
      length: 20,
      nullable: true,
      isPrimaryKey: false,
      isSensitive: true,
      description: '手机号码',
      sampleData: '138****8888'
    },
    {
      name: 'email',
      type: 'varchar',
      length: 100,
      nullable: true,
      isPrimaryKey: false,
      isSensitive: true,
      description: '邮箱地址',
      sampleData: 'user@example.com'
    },
    {
      name: 'gender',
      type: 'tinyint',
      nullable: true,
      isPrimaryKey: false,
      isSensitive: false,
      description: '性别（1:男 2:女 0:未知）',
      sampleData: '1'
    },
    {
      name: 'birth_date',
      type: 'date',
      nullable: true,
      isPrimaryKey: false,
      isSensitive: true,
      description: '出生日期',
      sampleData: '1990-01-01'
    },
    {
      name: 'register_time',
      type: 'timestamp',
      nullable: false,
      isPrimaryKey: false,
      isSensitive: false,
      description: '注册时间',
      sampleData: '2024-01-15 10:30:00'
    },
    {
      name: 'last_login_time',
      type: 'timestamp',
      nullable: true,
      isPrimaryKey: false,
      isSensitive: false,
      description: '最后登录时间',
      sampleData: '2024-01-20 14:20:00'
    },
    {
      name: 'status',
      type: 'tinyint',
      nullable: false,
      isPrimaryKey: false,
      isSensitive: false,
      description: '用户状态（1:正常 2:冻结 3:注销）',
      sampleData: '1'
    }
  ];

  const mockQualityRules: QualityRule[] = [
    {
      id: '1',
      name: '用户ID非空检查',
      type: '完整性',
      status: 'active',
      lastExecuteTime: '2024-01-20 02:00:00',
      result: 'pass',
      score: 100
    },
    {
      id: '2',
      name: '手机号格式检查',
      type: '有效性',
      status: 'active',
      lastExecuteTime: '2024-01-20 02:00:00',
      result: 'warning',
      score: 95
    },
    {
      id: '3',
      name: '邮箱格式检查',
      type: '有效性',
      status: 'active',
      lastExecuteTime: '2024-01-20 02:00:00',
      result: 'pass',
      score: 98
    },
    {
      id: '4',
      name: '重复数据检查',
      type: '唯一性',
      status: 'active',
      lastExecuteTime: '2024-01-20 02:00:00',
      result: 'pass',
      score: 100
    }
  ];

  const mockQualityIssues: QualityIssue[] = [
    {
      id: '1',
      description: '发现3条手机号格式不正确的记录',
      severity: 'medium',
      discoveryTime: '2024-01-20 02:15:00',
      status: 'open',
      assignee: '李四'
    },
    {
      id: '2',
      description: '部分用户邮箱字段为空',
      severity: 'low',
      discoveryTime: '2024-01-19 02:15:00',
      status: 'resolved',
      assignee: '王五'
    }
  ];

  const mockUsageInfo: UsageInfo = {
    dailyAccess: 1250,
    weeklyAccess: 8750,
    monthlyAccess: 35000,
    topUsers: [
      { name: '数据分析师A', accessCount: 156, lastAccess: '2024-01-20 15:30:00' },
      { name: '产品经理B', accessCount: 89, lastAccess: '2024-01-20 14:20:00' },
      { name: '开发工程师C', accessCount: 67, lastAccess: '2024-01-20 13:10:00' }
    ],
    relatedReports: [
      { name: '用户增长分析报告', type: '分析报告', lastUsed: '2024-01-20 10:00:00' },
      { name: '用户画像仪表盘', type: '仪表盘', lastUsed: '2024-01-19 16:30:00' },
      { name: '月度用户统计', type: '定期报告', lastUsed: '2024-01-18 09:00:00' }
    ]
  };

  useEffect(() => {
    if (id) {
      loadAssetDetail(id);
    }
  }, [id]);

  useEffect(() => {
    dispatch(setBreadcrumbs([
      { key: 'home', label: '首页', path: '/dashboard' },
      { key: 'data-assets', label: '数据资产', path: '/data-assets' },
      { key: 'detail', label: assetDetail?.name || '详情', path: '' }
    ]));
  }, [dispatch, assetDetail]);

  const loadAssetDetail = async (assetId: string) => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAssetDetail(mockAssetDetail);
      setFields(mockFields);
      setQualityRules(mockQualityRules);
      setQualityIssues(mockQualityIssues);
      setUsageInfo(mockUsageInfo);
    } catch (error) {
      message.error('加载数据资产详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    message.info('编辑功能开发中');
  };

  const handleFavorite = () => {
    message.success('已添加到收藏');
  };

  const handleShare = () => {
    message.info('分享功能开发中');
  };

  const handleExport = () => {
    message.info('导出功能开发中');
  };

  const fieldColumns = [
    {
      title: '字段名',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text: string, record: FieldInfo) => (
        <Space>
          {record.isPrimaryKey && <Tag color="gold">PK</Tag>}
          {record.isSensitive && <Tag color="red">敏感</Tag>}
          <Text code>{text}</Text>
        </Space>
      )
    },
    {
      title: '数据类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string, record: FieldInfo) => (
        <Text>{type}{record.length ? `(${record.length})` : ''}</Text>
      )
    },
    {
      title: '可空',
      dataIndex: 'nullable',
      key: 'nullable',
      width: 80,
      render: (nullable: boolean) => (
        <Tag color={nullable ? 'orange' : 'green'}>
          {nullable ? '是' : '否'}
        </Tag>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '示例数据',
      dataIndex: 'sampleData',
      key: 'sampleData',
      width: 120,
      render: (data: string, record: FieldInfo) => (
        <Text code style={{ fontSize: '12px' }}>
          {record.isSensitive ? '***' : data}
        </Text>
      )
    }
  ];

  const qualityRuleColumns = [
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '启用' : '禁用'}
        </Tag>
      )
    },
    {
      title: '最后执行',
      dataIndex: 'lastExecuteTime',
      key: 'lastExecuteTime',
      width: 150
    },
    {
      title: '执行结果',
      dataIndex: 'result',
      key: 'result',
      width: 100,
      render: (result: string) => {
        const config = {
          pass: { color: 'green', icon: <CheckCircleOutlined />, text: '通过' },
          fail: { color: 'red', icon: <WarningOutlined />, text: '失败' },
          warning: { color: 'orange', icon: <WarningOutlined />, text: '警告' }
        };
        const item = config[result as keyof typeof config];
        return (
          <Tag color={item.color} icon={item.icon}>
            {item.text}
          </Tag>
        );
      }
    },
    {
      title: '得分',
      dataIndex: 'score',
      key: 'score',
      width: 80,
      render: (score: number) => (
        <Text strong style={{ color: score >= 95 ? '#52c41a' : score >= 80 ? '#faad14' : '#ff4d4f' }}>
          {score}
        </Text>
      )
    }
  ];

  if (!assetDetail) {
    return <div>加载中...</div>;
  }

  return (
    <div className="data-asset-detail">
      {/* 顶部信息和操作区 */}
      <Card className="header-card">
        <Row justify="space-between" align="middle">
          <Col>
            <Space size="large">
              <Space>
                <DatabaseOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                <div>
                  <Title level={3} style={{ margin: 0 }}>
                    {assetDetail.name}
                  </Title>
                  <Space>
                    <Tag color="blue">{assetDetail.type === 'table' ? '数据表' : '视图'}</Tag>
                    <Tag color="green">{assetDetail.status === 'active' ? '活跃' : '非活跃'}</Tag>
                    {assetDetail.tags.map(tag => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </Space>
                </div>
              </Space>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button icon={<EditOutlined />} onClick={handleEdit}>
                编辑
              </Button>
              <Button icon={<StarOutlined />} onClick={handleFavorite}>
                收藏
              </Button>
              <Button icon={<ShareAltOutlined />} onClick={handleShare}>
                分享
              </Button>
              <Button icon={<DownloadOutlined />} onClick={handleExport}>
                导出
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 标签页内容 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* 业务价值标签页 */}
          <TabPane tab="业务价值" key="business-value">
            <Row gutter={24}>
              <Col span={8}>
                <Card title="价值评估" size="small">
                  <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <Progress
                      type="circle"
                      percent={assetDetail.businessValue.valueScore}
                      format={percent => `${percent}分`}
                      strokeColor={{
                        '0%': '#108ee9',
                        '100%': '#87d068',
                      }}
                    />
                    <div style={{ marginTop: 8, fontSize: 14, color: '#666' }}>业务价值评分</div>
                  </div>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="影响级别">
                      <Tag color={assetDetail.businessValue.impactLevel === 'critical' ? 'red' : 
                                 assetDetail.businessValue.impactLevel === 'high' ? 'orange' : 
                                 assetDetail.businessValue.impactLevel === 'medium' ? 'blue' : 'green'}>
                        {assetDetail.businessValue.impactLevel === 'critical' ? '关键' :
                         assetDetail.businessValue.impactLevel === 'high' ? '高' :
                         assetDetail.businessValue.impactLevel === 'medium' ? '中' : '低'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="风险等级">
                      <Tag color={assetDetail.businessValue.riskLevel === 'high' ? 'red' : 
                                 assetDetail.businessValue.riskLevel === 'medium' ? 'orange' : 'green'}>
                        {assetDetail.businessValue.riskLevel === 'high' ? '高风险' :
                         assetDetail.businessValue.riskLevel === 'medium' ? '中风险' : '低风险'}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col span={16}>
                <Card title="业务关键性" size="small">
                  <Paragraph>{assetDetail.businessValue.businessCriticality}</Paragraph>
                  <Divider />
                  <Row gutter={16}>
                    <Col span={12}>
                      <div style={{ marginBottom: 16 }}>
                        <Title level={5}>收入影响</Title>
                        <Text>{assetDetail.businessValue.revenueImpact}</Text>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ marginBottom: 16 }}>
                        <Title level={5}>成本节约</Title>
                        <Text>{assetDetail.businessValue.costSaving}</Text>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
            <Row gutter={24} style={{ marginTop: 16 }}>
              <Col span={24}>
                <Card title="使用指标" size="small">
                  <Row gutter={16}>
                    <Col span={6}>
                      <Statistic
                        title="月活跃用户"
                        value={assetDetail.usageMetrics.monthlyActiveUsers}
                        suffix="人"
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="日查询量"
                        value={assetDetail.usageMetrics.dailyQueries}
                        suffix="次"
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="关联报表"
                        value={assetDetail.usageMetrics.businessReports}
                        suffix="个"
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="下游系统"
                        value={assetDetail.usageMetrics.downstreamSystems}
                        suffix="个"
                      />
                    </Col>
                  </Row>
                  <Divider />
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="数据新鲜度">
                      <Badge status="success" text={assetDetail.usageMetrics.dataFreshness} />
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
          </TabPane>
          
          {/* 基本信息标签页 */}
          <TabPane tab="基本信息" key="basic">
            <Row gutter={24}>
              <Col span={12}>
                <Card title="基础属性" size="small">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="资产名称">{assetDetail.name}</Descriptions.Item>
                    <Descriptions.Item label="资产类型">{assetDetail.type}</Descriptions.Item>
                    <Descriptions.Item label="所属业务域">{assetDetail.businessDomain}</Descriptions.Item>
                    <Descriptions.Item label="数据库">{assetDetail.database}</Descriptions.Item>
                    {assetDetail.schema && (
                      <Descriptions.Item label="模式">{assetDetail.schema}</Descriptions.Item>
                    )}
                    <Descriptions.Item label="负责人">
                      <Space>
                        <Avatar size="small" icon={<UserOutlined />} />
                        {assetDetail.owner}
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="创建时间">
                      <Space>
                        <CalendarOutlined />
                        {assetDetail.createTime}
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="更新时间">
                      <Space>
                        <CalendarOutlined />
                        {assetDetail.updateTime}
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="数据行数">
                      <Statistic value={assetDetail.rowCount} suffix="行" />
                    </Descriptions.Item>
                    <Descriptions.Item label="数据大小">{assetDetail.dataSize}</Descriptions.Item>
                    {assetDetail.partitionInfo && (
                      <Descriptions.Item label="分区信息">{assetDetail.partitionInfo}</Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="业务描述" size="small">
                  <div style={{ marginBottom: 16 }}>
                    <Title level={5}>业务定义</Title>
                    <Paragraph>{assetDetail.businessDescription}</Paragraph>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <Title level={5}>使用场景</Title>
                    <Paragraph>
                      <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                        {assetDetail.usageScenario}
                      </pre>
                    </Paragraph>
                  </div>
                  <div>
                    <Title level={5}>注意事项</Title>
                    <Paragraph type="warning">{assetDetail.notes}</Paragraph>
                  </div>
                </Card>
              </Col>
            </Row>
            
            <Divider />
            
            {/* 字段信息表格 */}
            <Card title="字段信息" size="small">
              <Table
                columns={fieldColumns}
                dataSource={fields}
                rowKey="name"
                size="small"
                pagination={false}
                scroll={{ x: 800 }}
              />
            </Card>
          </TabPane>

          {/* 血缘关系标签页 */}
          <TabPane tab="血缘关系" key="lineage">
            <Card>
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <DatabaseOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                <div style={{ marginTop: 16, color: '#999' }}>
                  血缘关系图谱功能开发中...
                </div>
              </div>
            </Card>
          </TabPane>

          {/* 质量信息标签页 */}
          <TabPane tab="质量信息" key="quality">
            <Row gutter={24}>
              <Col span={8}>
                <Card title="质量评分" size="small">
                  <div style={{ textAlign: 'center' }}>
                    <Progress
                      type="circle"
                      percent={assetDetail.healthScore}
                      format={percent => (
                        <div>
                          <div style={{ fontSize: 24, fontWeight: 'bold' }}>{percent}</div>
                          <div style={{ fontSize: 12, color: '#999' }}>健康度</div>
                        </div>
                      )}
                      strokeColor={{
                        '0%': '#ff4d4f',
                        '50%': '#faad14',
                        '100%': '#52c41a'
                      }}
                    />
                  </div>
                  <Divider />
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic title="完整性" value={98} suffix="%" />
                    </Col>
                    <Col span={12}>
                      <Statistic title="准确性" value={95} suffix="%" />
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic title="一致性" value={92} suffix="%" />
                    </Col>
                    <Col span={12}>
                      <Statistic title="及时性" value={96} suffix="%" />
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col span={16}>
                <Card title="质量趋势" size="small">
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{ color: '#999' }}>质量趋势图表开发中...</div>
                  </div>
                </Card>
              </Col>
            </Row>
            
            <Row gutter={24} style={{ marginTop: 24 }}>
              <Col span={12}>
                <Card title="质量规则" size="small">
                  <Table
                    columns={qualityRuleColumns}
                    dataSource={qualityRules}
                    rowKey="id"
                    size="small"
                    pagination={false}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="质量问题" size="small">
                  <List
                    dataSource={qualityIssues}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <Badge
                              status={item.severity === 'high' ? 'error' : item.severity === 'medium' ? 'warning' : 'default'}
                            />
                          }
                          title={
                            <Space>
                              <Text>{item.description}</Text>
                              <Tag color={item.status === 'open' ? 'red' : item.status === 'resolved' ? 'green' : 'gray'}>
                                {item.status === 'open' ? '待处理' : item.status === 'resolved' ? '已解决' : '已忽略'}
                              </Tag>
                            </Space>
                          }
                          description={
                            <Space>
                              <Text type="secondary">{item.discoveryTime}</Text>
                              {item.assignee && (
                                <Text type="secondary">负责人: {item.assignee}</Text>
                              )}
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* 使用信息标签页 */}
          <TabPane tab="使用信息" key="usage">
            <Row gutter={24}>
              <Col span={8}>
                <Card title="访问统计" size="small">
                  <Row gutter={16}>
                    <Col span={24}>
                      <Statistic title="今日访问" value={usageInfo?.dailyAccess} suffix="次" />
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic title="本周访问" value={usageInfo?.weeklyAccess} suffix="次" />
                    </Col>
                    <Col span={12}>
                      <Statistic title="本月访问" value={usageInfo?.monthlyAccess} suffix="次" />
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col span={16}>
                <Card title="访问趋势" size="small">
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{ color: '#999' }}>访问趋势图表开发中...</div>
                  </div>
                </Card>
              </Col>
            </Row>
            
            <Row gutter={24} style={{ marginTop: 24 }}>
              <Col span={12}>
                <Card title="主要使用者" size="small">
                  <List
                    dataSource={usageInfo?.topUsers}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<UserOutlined />} />}
                          title={item.name}
                          description={
                            <Space>
                              <Text type="secondary">访问 {item.accessCount} 次</Text>
                              <Text type="secondary">最后访问: {item.lastAccess}</Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="关联报表/应用" size="small">
                  <List
                    dataSource={usageInfo?.relatedReports}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<EyeOutlined />} />}
                          title={item.name}
                          description={
                            <Space>
                              <Tag>{item.type}</Tag>
                              <Text type="secondary">最后使用: {item.lastUsed}</Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default DataAssetDetail;