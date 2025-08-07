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
  Badge,
  Input,
  Select,
  DatePicker,
  Modal,
  Form,
  Switch,
  Slider,
  Alert,
  Spin,
  Empty,
  Drawer
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
  ClockCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  SyncOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setBreadcrumbs } from '../../store/slices/uiSlice';
import './index.css';

const { TabPane } = Tabs;
const { Title, Paragraph, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface TableInfo {
  id: string;
  name: string;
  type: 'table' | 'view' | 'materialized_view';
  database: string;
  schema: string;
  description: string;
  businessDescription: string;
  technicalDescription: string;
  owner: string;
  createTime: string;
  updateTime: string;
  lastAnalyzedTime: string;
  rowCount: number;
  dataSize: string;
  avgRowSize: number;
  status: 'active' | 'inactive' | 'deprecated';
  healthScore: number;
  tags: string[];
  partitionInfo?: string;
  indexInfo?: string;
  compressionType?: string;
  storageFormat?: string;
}

interface ColumnInfo {
  name: string;
  type: string;
  length?: number;
  precision?: number;
  scale?: number;
  nullable: boolean;
  defaultValue?: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isIndexed: boolean;
  isSensitive: boolean;
  description: string;
  businessName?: string;
  dataClassification?: string;
  sampleData?: string[];
  distinctCount?: number;
  nullCount?: number;
  minValue?: string;
  maxValue?: string;
  avgLength?: number;
}

interface DataSample {
  [key: string]: any;
}

interface TableStatistics {
  totalRows: number;
  totalSize: string;
  avgRowSize: number;
  compressionRatio: number;
  lastUpdated: string;
  growthRate: number;
  accessFrequency: number;
  queryPerformance: {
    avgQueryTime: number;
    slowQueries: number;
    indexUsage: number;
  };
}

interface QualityMetrics {
  completeness: number;
  accuracy: number;
  consistency: number;
  timeliness: number;
  validity: number;
  uniqueness: number;
  issues: Array<{
    type: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
    count: number;
    lastDetected: string;
  }>;
}

const DataTable: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [dataSamples, setDataSamples] = useState<DataSample[]>([]);
  const [statistics, setStatistics] = useState<TableStatistics | null>(null);
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [columnSearchText, setColumnSearchText] = useState('');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [sampleSize, setSampleSize] = useState(100);
  const [refreshing, setRefreshing] = useState(false);
  // 字段详情抽屉相关状态
  const [fieldDetailVisible, setFieldDetailVisible] = useState(false);
  const [selectedField, setSelectedField] = useState<ColumnInfo | null>(null);

  // 模拟表信息数据
  const mockTableInfo: TableInfo = {
    id: '1',
    name: 'user_basic_info',
    type: 'table',
    database: 'user_db',
    schema: 'public',
    description: '用户基础信息表，包含用户ID、姓名、手机号等基本信息',
    businessDescription: '该表存储了平台所有注册用户的基础信息，是用户相关业务的核心数据表。包含用户的身份标识、联系方式、基本属性等关键信息。用于用户登录验证、信息展示、画像分析等多个业务场景。',
    technicalDescription: '表采用InnoDB存储引擎，按用户注册时间进行月分区。主键为user_id，在mobile和email字段上建有唯一索引。敏感字段已进行脱敏处理。',
    owner: '张三',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-20 14:20:00',
    lastAnalyzedTime: '2024-01-20 02:00:00',
    rowCount: 1250000,
    dataSize: '2.3 GB',
    avgRowSize: 1920,
    status: 'active',
    healthScore: 95,
    tags: ['核心表', '用户数据', 'PII', '生产环境'],
    partitionInfo: '按创建日期分区（月分区），当前有24个分区',
    indexInfo: '主键索引(user_id)，唯一索引(mobile, email)，普通索引(register_time)',
    compressionType: 'LZ4',
    storageFormat: 'InnoDB'
  };

  // 模拟列信息数据
  const mockColumns: ColumnInfo[] = [
    {
      name: 'user_id',
      type: 'bigint',
      nullable: false,
      isPrimaryKey: true,
      isForeignKey: false,
      isIndexed: true,
      isSensitive: false,
      description: '用户唯一标识，自增主键',
      businessName: '用户ID',
      dataClassification: '标识符',
      sampleData: ['1001', '1002', '1003', '1004', '1005'],
      distinctCount: 1250000,
      nullCount: 0,
      minValue: '1',
      maxValue: '1250000'
    },
    {
      name: 'username',
      type: 'varchar',
      length: 50,
      nullable: false,
      isPrimaryKey: false,
      isForeignKey: false,
      isIndexed: false,
      isSensitive: false,
      description: '用户名，用于登录',
      businessName: '用户名',
      dataClassification: '标识符',
      sampleData: ['john_doe', 'jane_smith', 'mike_wilson', 'sarah_jones', 'david_brown'],
      distinctCount: 1250000,
      nullCount: 0,
      avgLength: 12
    },
    {
      name: 'real_name',
      type: 'varchar',
      length: 100,
      nullable: true,
      isPrimaryKey: false,
      isForeignKey: false,
      isIndexed: false,
      isSensitive: true,
      description: '用户真实姓名',
      businessName: '真实姓名',
      dataClassification: 'PII',
      sampleData: ['张***', '李***', '王***', '刘***', '陈***'],
      distinctCount: 980000,
      nullCount: 125000,
      avgLength: 8
    },
    {
      name: 'mobile',
      type: 'varchar',
      length: 20,
      nullable: true,
      isPrimaryKey: false,
      isForeignKey: false,
      isIndexed: true,
      isSensitive: true,
      description: '手机号码，已脱敏处理',
      businessName: '手机号',
      dataClassification: 'PII',
      sampleData: ['138****8888', '139****9999', '186****1234', '187****5678', '188****0000'],
      distinctCount: 1200000,
      nullCount: 50000,
      avgLength: 11
    },
    {
      name: 'email',
      type: 'varchar',
      length: 100,
      nullable: true,
      isPrimaryKey: false,
      isForeignKey: false,
      isIndexed: true,
      isSensitive: true,
      description: '邮箱地址',
      businessName: '邮箱',
      dataClassification: 'PII',
      sampleData: ['user@example.com', 'test@domain.com', 'admin@company.com'],
      distinctCount: 1100000,
      nullCount: 150000,
      avgLength: 25
    },
    {
      name: 'gender',
      type: 'tinyint',
      nullable: true,
      isPrimaryKey: false,
      isForeignKey: false,
      isIndexed: false,
      isSensitive: false,
      description: '性别（1:男 2:女 0:未知）',
      businessName: '性别',
      dataClassification: '属性',
      sampleData: ['1', '2', '0'],
      distinctCount: 3,
      nullCount: 200000,
      minValue: '0',
      maxValue: '2'
    },
    {
      name: 'birth_date',
      type: 'date',
      nullable: true,
      isPrimaryKey: false,
      isForeignKey: false,
      isIndexed: false,
      isSensitive: true,
      description: '出生日期',
      businessName: '出生日期',
      dataClassification: 'PII',
      sampleData: ['1990-01-01', '1985-05-15', '1992-12-25', '1988-08-08'],
      distinctCount: 15000,
      nullCount: 300000,
      minValue: '1950-01-01',
      maxValue: '2005-12-31'
    },
    {
      name: 'register_time',
      type: 'timestamp',
      nullable: false,
      isPrimaryKey: false,
      isForeignKey: false,
      isIndexed: true,
      isSensitive: false,
      description: '用户注册时间',
      businessName: '注册时间',
      dataClassification: '时间戳',
      sampleData: ['2024-01-15 10:30:00', '2024-01-16 14:20:00', '2024-01-17 09:15:00'],
      distinctCount: 1250000,
      nullCount: 0,
      minValue: '2020-01-01 00:00:00',
      maxValue: '2024-01-20 23:59:59'
    },
    {
      name: 'last_login_time',
      type: 'timestamp',
      nullable: true,
      isPrimaryKey: false,
      isForeignKey: false,
      isIndexed: false,
      isSensitive: false,
      description: '最后登录时间',
      businessName: '最后登录时间',
      dataClassification: '时间戳',
      sampleData: ['2024-01-20 14:20:00', '2024-01-19 16:30:00', '2024-01-18 11:45:00'],
      distinctCount: 800000,
      nullCount: 100000,
      minValue: '2020-01-01 00:00:00',
      maxValue: '2024-01-20 23:59:59'
    },
    {
      name: 'status',
      type: 'tinyint',
      nullable: false,
      defaultValue: '1',
      isPrimaryKey: false,
      isForeignKey: false,
      isIndexed: true,
      isSensitive: false,
      description: '用户状态（1:正常 2:冻结 3:注销）',
      businessName: '用户状态',
      dataClassification: '状态',
      sampleData: ['1', '2', '3'],
      distinctCount: 3,
      nullCount: 0,
      minValue: '1',
      maxValue: '3'
    }
  ];

  // 模拟数据样本
  const mockDataSamples: DataSample[] = [
    {
      user_id: 1001,
      username: 'john_doe',
      real_name: '张***',
      mobile: '138****8888',
      email: 'user@example.com',
      gender: 1,
      birth_date: '1990-01-01',
      register_time: '2024-01-15 10:30:00',
      last_login_time: '2024-01-20 14:20:00',
      status: 1
    },
    {
      user_id: 1002,
      username: 'jane_smith',
      real_name: '李***',
      mobile: '139****9999',
      email: 'test@domain.com',
      gender: 2,
      birth_date: '1985-05-15',
      register_time: '2024-01-16 14:20:00',
      last_login_time: '2024-01-19 16:30:00',
      status: 1
    },
    {
      user_id: 1003,
      username: 'mike_wilson',
      real_name: '王***',
      mobile: '186****1234',
      email: null,
      gender: 1,
      birth_date: null,
      register_time: '2024-01-17 09:15:00',
      last_login_time: '2024-01-18 11:45:00',
      status: 1
    }
  ];

  // 模拟统计信息
  const mockStatistics: TableStatistics = {
    totalRows: 1250000,
    totalSize: '2.3 GB',
    avgRowSize: 1920,
    compressionRatio: 0.65,
    lastUpdated: '2024-01-20 14:20:00',
    growthRate: 12.5,
    accessFrequency: 1250,
    queryPerformance: {
      avgQueryTime: 125,
      slowQueries: 3,
      indexUsage: 85
    }
  };

  // 模拟质量指标
  const mockQualityMetrics: QualityMetrics = {
    completeness: 92,
    accuracy: 95,
    consistency: 88,
    timeliness: 96,
    validity: 94,
    uniqueness: 99,
    issues: [
      {
        type: '数据完整性',
        description: '手机号字段存在空值',
        severity: 'medium',
        count: 50000,
        lastDetected: '2024-01-20 02:15:00'
      },
      {
        type: '数据格式',
        description: '部分邮箱格式不正确',
        severity: 'low',
        count: 1200,
        lastDetected: '2024-01-19 02:15:00'
      },
      {
        type: '数据一致性',
        description: '性别字段存在异常值',
        severity: 'high',
        count: 15,
        lastDetected: '2024-01-18 02:15:00'
      }
    ]
  };

  useEffect(() => {
    // 如果没有ID参数，直接加载模拟数据
    if (id) {
      loadTableInfo(id);
    } else {
      loadTableInfo('default');
    }
  }, [id]);

  useEffect(() => {
    dispatch(setBreadcrumbs([
      { key: 'home', label: '首页', path: '/dashboard' },
      { key: 'data-management', label: '数据管理', path: '' },
      { key: 'data-catalog', label: '数据目录', path: '/data-catalog' },
      { key: 'table-detail', label: tableInfo?.name || '表详情', path: '' }
    ]));
  }, [dispatch, tableInfo]);

  const loadTableInfo = async (tableId: string) => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTableInfo(mockTableInfo);
      setColumns(mockColumns);
      setDataSamples(mockDataSamples);
      setStatistics(mockStatistics);
      setQualityMetrics(mockQualityMetrics);
    } catch (error) {
      message.error('加载表信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshData = async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      message.success('数据已刷新');
      loadTableInfo(id!);
    } catch (error) {
      message.error('刷新失败');
    } finally {
      setRefreshing(false);
    }
  };

  const handleAnalyzeTable = async () => {
    Modal.confirm({
      title: '分析表结构',
      content: '是否重新分析表结构和统计信息？这可能需要几分钟时间。',
      onOk: async () => {
        const hide = message.loading('正在分析表结构...', 0);
        try {
          await new Promise(resolve => setTimeout(resolve, 3000));
          message.success('表结构分析完成');
          loadTableInfo(id!);
        } catch (error) {
          message.error('分析失败');
        } finally {
          hide();
        }
      }
    });
  };

  const filteredColumns = columns.filter(col => 
    col.name.toLowerCase().includes(columnSearchText.toLowerCase()) ||
    col.description.toLowerCase().includes(columnSearchText.toLowerCase()) ||
    (col.businessName && col.businessName.toLowerCase().includes(columnSearchText.toLowerCase()))
  );

  /**
   * 处理字段点击事件，显示字段详情抽屉
   * @param field - 被点击的字段信息
   */
  const handleFieldClick = (field: ColumnInfo) => {
    setSelectedField(field);
    setFieldDetailVisible(true);
  };

  /**
   * 关闭字段详情抽屉
   */
  const handleCloseFieldDetail = () => {
    setFieldDetailVisible(false);
    setSelectedField(null);
  };

  const columnTableColumns = [
    {
      title: '字段名',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text: string, record: ColumnInfo) => (
        <Space direction="vertical" size={0}>
          <Space>
            {record.isPrimaryKey && <Tag color="gold">PK</Tag>}
            {record.isForeignKey && <Tag color="purple">FK</Tag>}
            {record.isIndexed && <Tag color="blue">IDX</Tag>}
            {record.isSensitive && <Tag color="red">敏感</Tag>}
          </Space>
          <Text 
            code 
            strong 
            style={{ cursor: 'pointer', color: '#1890ff' }}
            onClick={() => handleFieldClick(record)}
          >
            {text}
          </Text>
          {record.businessName && (
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.businessName}</Text>
          )}
        </Space>
      )
    },
    {
      title: '数据类型',
      key: 'dataType',
      width: 120,
      render: (record: ColumnInfo) => {
        let typeStr = record.type;
        if (record.length) typeStr += `(${record.length})`;
        if (record.precision && record.scale) typeStr += `(${record.precision},${record.scale})`;
        return <Text code>{typeStr}</Text>;
      }
    },
    {
      title: '约束',
      key: 'constraints',
      width: 100,
      render: (record: ColumnInfo) => (
        <Space direction="vertical" size={0}>
          <Tag color={record.nullable ? 'orange' : 'green'}>
            {record.nullable ? '可空' : '非空'}
          </Tag>
          {record.defaultValue && (
            <Text type="secondary" style={{ fontSize: '11px' }}>默认: {record.defaultValue}</Text>
          )}
        </Space>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string, record: ColumnInfo) => (
        <Tooltip title={text}>
          <div>
            <div>{text}</div>
            {record.dataClassification && (
              <Tag style={{ marginTop: 4 }}>{record.dataClassification}</Tag>
            )}
          </div>
        </Tooltip>
      )
    },
    {
      title: '数据分布',
      key: 'distribution',
      width: 150,
      render: (record: ColumnInfo) => (
        <Space direction="vertical" size={0}>
          {record.distinctCount !== undefined && (
            <Text type="secondary" style={{ fontSize: '11px' }}>唯一值: {record.distinctCount.toLocaleString()}</Text>
          )}
          {record.nullCount !== undefined && (
            <Text type="secondary" style={{ fontSize: '11px' }}>空值: {record.nullCount.toLocaleString()}</Text>
          )}
          {record.avgLength !== undefined && (
            <Text type="secondary" style={{ fontSize: '11px' }}>平均长度: {record.avgLength}</Text>
          )}
        </Space>
      )
    },
    {
      title: '示例数据',
      dataIndex: 'sampleData',
      key: 'sampleData',
      width: 200,
      render: (data: string[], record: ColumnInfo) => (
        <div style={{ maxHeight: '60px', overflow: 'hidden' }}>
          {data?.slice(0, 3).map((sample, index) => (
            <div key={index}>
              <Text code style={{ fontSize: '11px' }}>
                {record.isSensitive ? '***' : sample}
              </Text>
            </div>
          ))}
          {data?.length > 3 && <Text type="secondary" style={{ fontSize: '11px' }}>...</Text>}
        </div>
      )
    }
  ];

  const sampleTableColumns = columns.map(col => ({
    title: col.name,
    dataIndex: col.name,
    key: col.name,
    width: 120,
    ellipsis: true,
    render: (value: any) => {
      if (value === null || value === undefined) {
        return <Text type="secondary">NULL</Text>;
      }
      const displayValue = col.isSensitive ? '***' : String(value);
      return (
        <Tooltip title={displayValue}>
          <Text code style={{ fontSize: '12px' }}>{displayValue}</Text>
        </Tooltip>
      );
    }
  }));

  if (!tableInfo) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="data-table-detail">
      {/* 顶部信息和操作区 */}
      <Card className="header-card">
        <Row justify="space-between" align="middle">
          <Col>
            <Space size="large">
              <Space>
                <TableOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                <div>
                  <Title level={3} style={{ margin: 0 }}>
                    {tableInfo.database}.{tableInfo.schema}.{tableInfo.name}
                  </Title>
                  <Space wrap>
                    <Tag color="blue">{tableInfo.type === 'table' ? '数据表' : '视图'}</Tag>
                    <Tag color={tableInfo.status === 'active' ? 'green' : 'orange'}>
                      {tableInfo.status === 'active' ? '活跃' : '非活跃'}
                    </Tag>
                    {tableInfo.tags.map(tag => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </Space>
                </div>
              </Space>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button icon={<EditOutlined />}>
                编辑
              </Button>
              <Button icon={<StarOutlined />}>
                收藏
              </Button>
              <Button icon={<ShareAltOutlined />}>
                分享
              </Button>
              <Button icon={<SyncOutlined />} loading={refreshing} onClick={handleRefreshData}>
                刷新
              </Button>
              <Button icon={<BarChartOutlined />} onClick={handleAnalyzeTable}>
                分析
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 标签页内容 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* 概览标签页 */}
          <TabPane tab="概览" key="overview">
            <Row gutter={24}>
              <Col span={16}>
                <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
                  <Descriptions column={2} size="small">
                    <Descriptions.Item label="表名">{tableInfo.name}</Descriptions.Item>
                    <Descriptions.Item label="类型">{tableInfo.type}</Descriptions.Item>
                    <Descriptions.Item label="数据库">{tableInfo.database}</Descriptions.Item>
                    <Descriptions.Item label="模式">{tableInfo.schema}</Descriptions.Item>
                    <Descriptions.Item label="负责人">
                      <Space>
                        <Avatar size="small" icon={<UserOutlined />} />
                        {tableInfo.owner}
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="状态">
                      <Tag color={tableInfo.status === 'active' ? 'green' : 'orange'}>
                        {tableInfo.status === 'active' ? '活跃' : '非活跃'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="创建时间">{tableInfo.createTime}</Descriptions.Item>
                    <Descriptions.Item label="更新时间">{tableInfo.updateTime}</Descriptions.Item>
                    <Descriptions.Item label="最后分析时间">{tableInfo.lastAnalyzedTime}</Descriptions.Item>
                    <Descriptions.Item label="健康度">
                      <Space>
                        <Progress 
                          percent={tableInfo.healthScore} 
                          size="small" 
                          strokeColor={{
                            '0%': '#ff4d4f',
                            '50%': '#faad14',
                            '100%': '#52c41a'
                          }}
                        />
                        <Text strong>{tableInfo.healthScore}</Text>
                      </Space>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
                
                <Card title="技术信息" size="small">
                  <Descriptions column={2} size="small">
                    <Descriptions.Item label="存储格式">{tableInfo.storageFormat}</Descriptions.Item>
                    <Descriptions.Item label="压缩类型">{tableInfo.compressionType}</Descriptions.Item>
                    <Descriptions.Item label="分区信息" span={2}>{tableInfo.partitionInfo}</Descriptions.Item>
                    <Descriptions.Item label="索引信息" span={2}>{tableInfo.indexInfo}</Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              
              <Col span={8}>
                <Card title="数据统计" size="small" style={{ marginBottom: 16 }}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic title="数据行数" value={tableInfo.rowCount} formatter={(value) => value?.toLocaleString()} />
                    </Col>
                    <Col span={12}>
                      <Statistic title="数据大小" value={tableInfo.dataSize} />
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic title="平均行大小" value={tableInfo.avgRowSize} suffix="字节" />
                    </Col>
                    <Col span={12}>
                      <Statistic title="字段数量" value={columns.length} />
                    </Col>
                  </Row>
                  {statistics && (
                    <>
                      <Divider style={{ margin: '16px 0' }} />
                      <Row gutter={16}>
                        <Col span={12}>
                          <Statistic 
                            title="增长率" 
                            value={statistics.growthRate} 
                            suffix="%" 
                            valueStyle={{ color: statistics.growthRate > 0 ? '#3f8600' : '#cf1322' }}
                          />
                        </Col>
                        <Col span={12}>
                          <Statistic title="访问频次" value={statistics.accessFrequency} suffix="/日" />
                        </Col>
                      </Row>
                    </>
                  )}
                </Card>
                
                {qualityMetrics && (
                  <Card title="质量评分" size="small">
                    <Row gutter={8}>
                      <Col span={12}>
                        <div style={{ textAlign: 'center', marginBottom: 8 }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>完整性</Text>
                          <div>
                            <Progress 
                              type="circle" 
                              percent={qualityMetrics.completeness} 
                              width={60} 
                              strokeColor="#52c41a"
                              format={percent => <span style={{ fontSize: '12px' }}>{percent}</span>}
                            />
                          </div>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ textAlign: 'center', marginBottom: 8 }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>准确性</Text>
                          <div>
                            <Progress 
                              type="circle" 
                              percent={qualityMetrics.accuracy} 
                              width={60} 
                              strokeColor="#1890ff"
                              format={percent => <span style={{ fontSize: '12px' }}>{percent}</span>}
                            />
                          </div>
                        </div>
                      </Col>
                    </Row>
                    <Row gutter={8}>
                      <Col span={12}>
                        <div style={{ textAlign: 'center' }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>一致性</Text>
                          <div>
                            <Progress 
                              type="circle" 
                              percent={qualityMetrics.consistency} 
                              width={60} 
                              strokeColor="#faad14"
                              format={percent => <span style={{ fontSize: '12px' }}>{percent}</span>}
                            />
                          </div>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ textAlign: 'center' }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>及时性</Text>
                          <div>
                            <Progress 
                              type="circle" 
                              percent={qualityMetrics.timeliness} 
                              width={60} 
                              strokeColor="#722ed1"
                              format={percent => <span style={{ fontSize: '12px' }}>{percent}</span>}
                            />
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                )}
              </Col>
            </Row>
            
            <Divider />
            
            <Row gutter={24}>
              <Col span={12}>
                <Card title="业务描述" size="small">
                  <Paragraph>{tableInfo.businessDescription}</Paragraph>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="技术描述" size="small">
                  <Paragraph>{tableInfo.technicalDescription}</Paragraph>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* 字段信息标签页 */}
          <TabPane tab={`字段信息 (${columns.length})`} key="columns">
            <Card size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16} align="middle">
                <Col flex="auto">
                  <Search
                    placeholder="搜索字段名、描述..."
                    allowClear
                    value={columnSearchText}
                    onChange={(e) => setColumnSearchText(e.target.value)}
                    style={{ width: 300 }}
                  />
                </Col>
                <Col>
                  <Space>
                    <Text type="secondary">显示 {filteredColumns.length} / {columns.length} 个字段</Text>
                    <Button icon={<ReloadOutlined />} size="small">
                      刷新
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>
            
            <Card>
              <Table
                columns={columnTableColumns}
                dataSource={filteredColumns}
                rowKey="name"
                size="small"
                pagination={{
                  pageSize: 20,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
                }}
                scroll={{ x: 1000 }}
              />
            </Card>
          </TabPane>

          {/* 数据样本标签页 */}
          <TabPane tab="数据样本" key="samples">
            <Card size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16} align="middle">
                <Col>
                  <Space>
                    <Text>样本大小:</Text>
                    <Select value={sampleSize} onChange={setSampleSize} style={{ width: 120 }}>
                      <Option value={50}>50 行</Option>
                      <Option value={100}>100 行</Option>
                      <Option value={200}>200 行</Option>
                      <Option value={500}>500 行</Option>
                    </Select>
                  </Space>
                </Col>
                <Col>
                  <Space>
                    <Button icon={<ReloadOutlined />} onClick={() => message.info('重新采样功能开发中')}>
                      重新采样
                    </Button>
                    <Button icon={<DownloadOutlined />}>
                      导出样本
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>
            
            <Card>
              <Alert
                message="数据脱敏提示"
                description="敏感字段已进行脱敏处理，显示的数据仅供参考。"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Table
                columns={sampleTableColumns}
                dataSource={dataSamples}
                rowKey={(record, index) => index!}
                size="small"
                pagination={false}
                scroll={{ x: columns.length * 120 }}
              />
            </Card>
          </TabPane>

          {/* 统计信息标签页 */}
          <TabPane tab="统计信息" key="statistics">
            {statistics && (
              <Row gutter={24}>
                <Col span={12}>
                  <Card title="存储统计" size="small" style={{ marginBottom: 16 }}>
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="总行数">
                        <Statistic value={statistics.totalRows} formatter={(value) => value?.toLocaleString()} />
                      </Descriptions.Item>
                      <Descriptions.Item label="总大小">
                        <Statistic value={statistics.totalSize} />
                      </Descriptions.Item>
                      <Descriptions.Item label="平均行大小">
                        <Statistic value={statistics.avgRowSize} suffix="字节" />
                      </Descriptions.Item>
                      <Descriptions.Item label="压缩比">
                        <Statistic value={statistics.compressionRatio} formatter={(value) => `${(Number(value) * 100).toFixed(1)}%`} />
                      </Descriptions.Item>
                      <Descriptions.Item label="增长率">
                        <Statistic 
                          value={statistics.growthRate} 
                          suffix="%" 
                          valueStyle={{ color: statistics.growthRate > 0 ? '#3f8600' : '#cf1322' }}
                        />
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                  
                  <Card title="访问统计" size="small">
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="日访问频次">
                        <Statistic value={statistics.accessFrequency} />
                      </Descriptions.Item>
                      <Descriptions.Item label="最后更新">
                        <Text>{statistics.lastUpdated}</Text>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
                
                <Col span={12}>
                  <Card title="查询性能" size="small">
                    <Row gutter={16}>
                      <Col span={8}>
                        <Statistic 
                          title="平均查询时间" 
                          value={statistics.queryPerformance.avgQueryTime} 
                          suffix="ms"
                          valueStyle={{ color: statistics.queryPerformance.avgQueryTime > 1000 ? '#cf1322' : '#3f8600' }}
                        />
                      </Col>
                      <Col span={8}>
                        <Statistic 
                          title="慢查询数" 
                          value={statistics.queryPerformance.slowQueries}
                          valueStyle={{ color: statistics.queryPerformance.slowQueries > 0 ? '#cf1322' : '#3f8600' }}
                        />
                      </Col>
                      <Col span={8}>
                        <Statistic 
                          title="索引使用率" 
                          value={statistics.queryPerformance.indexUsage} 
                          suffix="%"
                          valueStyle={{ color: statistics.queryPerformance.indexUsage < 70 ? '#cf1322' : '#3f8600' }}
                        />
                      </Col>
                    </Row>
                    
                    <Divider />
                    
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <LineChartOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                      <div style={{ marginTop: 16, color: '#999' }}>
                        性能趋势图表开发中...
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>
            )}
          </TabPane>

          {/* 质量报告标签页 */}
          <TabPane tab="质量报告" key="quality">
            {qualityMetrics && (
              <>
                <Row gutter={24} style={{ marginBottom: 24 }}>
                  <Col span={16}>
                    <Card title="质量指标" size="small">
                      <Row gutter={16}>
                        <Col span={8}>
                          <div style={{ textAlign: 'center' }}>
                            <Progress 
                              type="circle" 
                              percent={qualityMetrics.completeness} 
                              strokeColor="#52c41a"
                              format={percent => (
                                <div>
                                  <div style={{ fontSize: 16, fontWeight: 'bold' }}>{percent}</div>
                                  <div style={{ fontSize: 12, color: '#999' }}>完整性</div>
                                </div>
                              )}
                            />
                          </div>
                        </Col>
                        <Col span={8}>
                          <div style={{ textAlign: 'center' }}>
                            <Progress 
                              type="circle" 
                              percent={qualityMetrics.accuracy} 
                              strokeColor="#1890ff"
                              format={percent => (
                                <div>
                                  <div style={{ fontSize: 16, fontWeight: 'bold' }}>{percent}</div>
                                  <div style={{ fontSize: 12, color: '#999' }}>准确性</div>
                                </div>
                              )}
                            />
                          </div>
                        </Col>
                        <Col span={8}>
                          <div style={{ textAlign: 'center' }}>
                            <Progress 
                              type="circle" 
                              percent={qualityMetrics.consistency} 
                              strokeColor="#faad14"
                              format={percent => (
                                <div>
                                  <div style={{ fontSize: 16, fontWeight: 'bold' }}>{percent}</div>
                                  <div style={{ fontSize: 12, color: '#999' }}>一致性</div>
                                </div>
                              )}
                            />
                          </div>
                        </Col>
                      </Row>
                      <Row gutter={16} style={{ marginTop: 24 }}>
                        <Col span={8}>
                          <div style={{ textAlign: 'center' }}>
                            <Progress 
                              type="circle" 
                              percent={qualityMetrics.timeliness} 
                              strokeColor="#722ed1"
                              format={percent => (
                                <div>
                                  <div style={{ fontSize: 16, fontWeight: 'bold' }}>{percent}</div>
                                  <div style={{ fontSize: 12, color: '#999' }}>及时性</div>
                                </div>
                              )}
                            />
                          </div>
                        </Col>
                        <Col span={8}>
                          <div style={{ textAlign: 'center' }}>
                            <Progress 
                              type="circle" 
                              percent={qualityMetrics.validity} 
                              strokeColor="#13c2c2"
                              format={percent => (
                                <div>
                                  <div style={{ fontSize: 16, fontWeight: 'bold' }}>{percent}</div>
                                  <div style={{ fontSize: 12, color: '#999' }}>有效性</div>
                                </div>
                              )}
                            />
                          </div>
                        </Col>
                        <Col span={8}>
                          <div style={{ textAlign: 'center' }}>
                            <Progress 
                              type="circle" 
                              percent={qualityMetrics.uniqueness} 
                              strokeColor="#eb2f96"
                              format={percent => (
                                <div>
                                  <div style={{ fontSize: 16, fontWeight: 'bold' }}>{percent}</div>
                                  <div style={{ fontSize: 12, color: '#999' }}>唯一性</div>
                                </div>
                              )}
                            />
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                  
                  <Col span={8}>
                    <Card title="综合评分" size="small">
                      <div style={{ textAlign: 'center' }}>
                        <Progress 
                          type="circle" 
                          percent={Math.round(
                            (Number(qualityMetrics.completeness) + 
                             Number(qualityMetrics.accuracy) + 
                             Number(qualityMetrics.consistency) + 
                             Number(qualityMetrics.timeliness) + 
                             Number(qualityMetrics.validity) + 
                             Number(qualityMetrics.uniqueness)) / 6
                          )} 
                          size={120}
                          strokeColor={{
                            '0%': '#ff4d4f',
                            '50%': '#faad14',
                            '100%': '#52c41a'
                          }}
                          format={percent => (
                            <div>
                              <div style={{ fontSize: 24, fontWeight: 'bold' }}>{percent}</div>
                              <div style={{ fontSize: 14, color: '#999' }}>质量评分</div>
                            </div>
                          )}
                        />
                      </div>
                    </Card>
                  </Col>
                </Row>
                
                <Card title="质量问题" size="small">
                  <List
                    dataSource={qualityMetrics.issues}
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
                              <Tag color={item.severity === 'high' ? 'red' : item.severity === 'medium' ? 'orange' : 'blue'}>
                                {item.severity === 'high' ? '高' : item.severity === 'medium' ? '中' : '低'}
                              </Tag>
                              <Text type="secondary">({item.count.toLocaleString()} 条记录)</Text>
                            </Space>
                          }
                          description={
                            <Space>
                              <Text type="secondary">类型: {item.type}</Text>
                              <Text type="secondary">发现时间: {item.lastDetected}</Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </>
            )}
          </TabPane>
        </Tabs>
      </Card>
      
      {/* 字段详情抽屉 */}
      <Drawer
        title={`字段详情 - ${selectedField?.name || ''}`}
        width={800}
        open={fieldDetailVisible}
        onClose={handleCloseFieldDetail}
        placement="right"
      >
        {selectedField && (
          <div>
            <Tabs defaultActiveKey="basic" type="card">
              {/* 基本信息标签页 */}
              <TabPane tab="基本信息" key="basic">
                <Card title="字段标识" size="small" style={{ marginBottom: 16 }}>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Text type="secondary">字段名称：</Text>
                      <Text strong>{selectedField.name}</Text>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary">业务名称：</Text>
                      <Text>{selectedField.businessName || '用户ID'}</Text>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary">数据类型：</Text>
                      <Tag color="blue">{selectedField.type}</Tag>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary">质量评分：</Text>
                      <Progress 
                        percent={95} 
                        size="small" 
                        status="success"
                        style={{ width: 120 }}
                      />
                    </Col>
                  </Row>
                </Card>
                
                <Card title="属性信息" size="small">
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <Text type="secondary">可空：</Text>
                      <Tag color={selectedField.nullable ? 'orange' : 'green'}>
                        {selectedField.nullable ? '否' : '否'}
                      </Tag>
                    </Col>
                    <Col span={8}>
                      <Text type="secondary">主键：</Text>
                      <Tag color={selectedField.isPrimaryKey ? 'red' : 'default'}>
                        {selectedField.isPrimaryKey ? '是' : '否'}
                      </Tag>
                    </Col>
                    <Col span={8}>
                      <Text type="secondary">敏感字段：</Text>
                      <Tag color={selectedField.isSensitive ? 'purple' : 'default'}>
                        {selectedField.isSensitive ? '是' : '否'}
                      </Tag>
                    </Col>
                  </Row>
                </Card>
              </TabPane>
              
              {/* 业务信息标签页 */}
              <TabPane tab="业务信息" key="business">
                <Card title="业务属性" size="small" style={{ marginBottom: 16 }}>
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="业务名称">
                      {selectedField.businessName || '用户ID'}
                    </Descriptions.Item>
                    <Descriptions.Item label="业务描述">
                      {selectedField.description || '用户唯一标识，自增主键标识符'}
                    </Descriptions.Item>
                    <Descriptions.Item label="数据分类">
                      {selectedField.dataClassification || '标识符'}
                    </Descriptions.Item>
                    <Descriptions.Item label="业务规则">
                      自动生成，不可重复
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
                
                <Card title="使用场景" size="small">
                  <List
                    size="small"
                    dataSource={[
                      '用户注册时自动生成',
                      '关联用户相关业务数据',
                      '用户行为分析的主要维度'
                    ]}
                    renderItem={(item) => (
                      <List.Item>
                        <Text>• {item}</Text>
                      </List.Item>
                    )}
                  />
                </Card>
              </TabPane>
              
              {/* 元数据标签页 */}
              <TabPane tab="元数据" key="metadata">
                <Card title="技术属性" size="small" style={{ marginBottom: 16 }}>
                  <Descriptions bordered column={2} size="small">
                    <Descriptions.Item label="数据类型">
                      <Tag color="blue">{selectedField.type}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="长度">
                      {selectedField.length || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="精度">
                      {selectedField.precision || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="小数位数">
                      {selectedField.scale || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="默认值">
                      {selectedField.defaultValue || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="是否索引">
                      <Tag color={selectedField.isIndexed ? 'blue' : 'default'}>
                        {selectedField.isIndexed ? '是' : '否'}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
                
                <Card title="数据统计" size="small" style={{ marginBottom: 16 }}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Statistic
                        title="唯一值数量"
                        value={selectedField.distinctCount || 1250000}
                        formatter={(value) => value.toLocaleString()}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="空值数量"
                        value={selectedField.nullCount || 0}
                        formatter={(value) => value.toLocaleString()}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="平均长度"
                        value={selectedField.avgLength || 8}
                        precision={1}
                      />
                    </Col>
                  </Row>
                </Card>
                
                {selectedField.sampleData && selectedField.sampleData.length > 0 && (
                  <Card title="示例数据" size="small">
                    <List
                      size="small"
                      bordered
                      dataSource={selectedField.sampleData.slice(0, 5)}
                      renderItem={(item, index) => (
                        <List.Item>
                          <Text code>{item}</Text>
                        </List.Item>
                      )}
                    />
                  </Card>
                )}
              </TabPane>
            </Tabs>
            
            {/* 底部操作按钮 */}
            <div style={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              padding: '16px 24px', 
              borderTop: '1px solid #f0f0f0',
              background: '#fff'
            }}>
              <Space>
                <Button type="primary" icon={<EditOutlined />}>
                  编辑字段
                </Button>
                <Button icon={<ShareAltOutlined />}>
                  查看血缘
                </Button>
                <Button icon={<BarChartOutlined />}>
                  质量报告
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default DataTable;