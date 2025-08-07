import React, { useState, useEffect } from 'react';
import {
  Layout,
  Table,
  Input,
  Select,
  Button,
  Tag,
  Space,
  Card,
  Row,
  Col,
  Breadcrumb,
  Modal,
  Form,
  message,
  Tooltip,
  Popconfirm,
  Switch,
  Divider,
  Badge,
  Statistic,
  Progress,
  Tree,
  Drawer,
  Tabs
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FilterOutlined,
  ReloadOutlined,
  ExportOutlined,
  ImportOutlined,
  SettingOutlined,
  DatabaseOutlined,
  TableOutlined,
  FieldTimeOutlined,
  SafetyOutlined,
  KeyOutlined,
  LinkOutlined,
  StarOutlined,
  BarChartOutlined,
  BranchesOutlined,
  CloseOutlined,
  MenuOutlined
} from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { setBreadcrumbs } from '../../store/slices/uiSlice';
import './index.css';

const { Content, Sider } = Layout;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface FieldInfo {
  id: string;
  fieldName: string;
  fieldType: string;
  dataType: string;
  length?: number;
  precision?: number;
  scale?: number;
  nullable: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isIndex: boolean;
  isSensitive: boolean;
  defaultValue?: string;
  description: string;
  businessName: string;
  businessDescription: string;
  tableName: string;
  databaseName: string;
  businessDomain: string;
  dataLayer: string;
  owner: string;
  createTime: string;
  updateTime: string;
  status: 'active' | 'inactive' | 'deprecated';
  tags: string[];
  qualityScore: number;
}

interface FilterState {
  status: string[];
  dataType: string[];
  businessDomain: string[];
  dataLayer: string[];
  isSensitive: boolean | null;
  isPrimaryKey: boolean | null;
}

const FieldManagementPage: React.FC = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [fields, setFields] = useState<FieldInfo[]>([]);
  const [filteredFields, setFilteredFields] = useState<FieldInfo[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<FieldInfo | null>(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    dataType: [],
    businessDomain: [],
    dataLayer: [],
    isSensitive: null,
    isPrimaryKey: null
  });
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState('list');
  const [fieldDetailVisible, setFieldDetailVisible] = useState(false);
  const [selectedField, setSelectedField] = useState<FieldInfo | null>(null);

  // 模拟字段数据
  const mockFields: FieldInfo[] = [
    {
      id: '1',
      fieldName: 'user_id',
      fieldType: 'BIGINT',
      dataType: 'NUMBER',
      length: 20,
      nullable: false,
      isPrimaryKey: true,
      isForeignKey: false,
      isIndex: true,
      isSensitive: false,
      description: '用户唯一标识',
      businessName: '用户ID',
      businessDescription: '系统中用户的唯一标识符，用于关联用户相关数据',
      tableName: 'user_basic_info',
      databaseName: 'user_db',
      businessDomain: '用户中心',
      dataLayer: 'ODS',
      owner: '张三',
      createTime: '2024-01-15 10:30:00',
      updateTime: '2024-01-20 14:20:00',
      status: 'active',
      tags: ['主键', '核心字段'],
      qualityScore: 98
    },
    {
      id: '2',
      fieldName: 'mobile_phone',
      fieldType: 'VARCHAR',
      dataType: 'STRING',
      length: 11,
      nullable: true,
      isPrimaryKey: false,
      isForeignKey: false,
      isIndex: true,
      isSensitive: true,
      description: '用户手机号码',
      businessName: '手机号',
      businessDescription: '用户注册和登录使用的手机号码，属于敏感信息',
      tableName: 'user_basic_info',
      databaseName: 'user_db',
      businessDomain: '用户中心',
      dataLayer: 'ODS',
      owner: '张三',
      createTime: '2024-01-15 10:30:00',
      updateTime: '2024-01-20 14:20:00',
      status: 'active',
      tags: ['敏感字段', 'PII'],
      qualityScore: 95
    },
    {
      id: '3',
      fieldName: 'order_amount',
      fieldType: 'DECIMAL',
      dataType: 'NUMBER',
      length: 10,
      precision: 10,
      scale: 2,
      nullable: false,
      isPrimaryKey: false,
      isForeignKey: false,
      isIndex: false,
      isSensitive: false,
      description: '订单金额',
      businessName: '订单金额',
      businessDescription: '订单的总金额，包含商品价格和运费等',
      tableName: 'order_main',
      databaseName: 'order_db',
      businessDomain: '订单中心',
      dataLayer: 'DWD',
      owner: '李四',
      createTime: '2024-01-10 09:15:00',
      updateTime: '2024-01-21 16:45:00',
      status: 'active',
      tags: ['金额字段', '核心指标'],
      qualityScore: 92
    },
    {
      id: '4',
      fieldName: 'product_name',
      fieldType: 'VARCHAR',
      dataType: 'STRING',
      length: 255,
      nullable: false,
      isPrimaryKey: false,
      isForeignKey: false,
      isIndex: false,
      isSensitive: false,
      description: '商品名称',
      businessName: '商品名称',
      businessDescription: '商品的完整名称，用于展示和搜索',
      tableName: 'product_basic_info',
      databaseName: 'product_db',
      businessDomain: '商品中心',
      dataLayer: 'ODS',
      owner: '王五',
      createTime: '2024-01-12 11:20:00',
      updateTime: '2024-01-19 13:30:00',
      status: 'active',
      tags: ['商品信息'],
      qualityScore: 88
    },
    {
      id: '5',
      fieldName: 'created_at',
      fieldType: 'TIMESTAMP',
      dataType: 'DATETIME',
      nullable: false,
      isPrimaryKey: false,
      isForeignKey: false,
      isIndex: true,
      isSensitive: false,
      defaultValue: 'CURRENT_TIMESTAMP',
      description: '记录创建时间',
      businessName: '创建时间',
      businessDescription: '数据记录的创建时间戳',
      tableName: 'user_basic_info',
      databaseName: 'user_db',
      businessDomain: '用户中心',
      dataLayer: 'ODS',
      owner: '张三',
      createTime: '2024-01-15 10:30:00',
      updateTime: '2024-01-20 14:20:00',
      status: 'active',
      tags: ['时间字段', '系统字段'],
      qualityScore: 100
    }
  ];

  // 表格列定义
  const columns = [
    {
      title: '字段名称',
      dataIndex: 'fieldName',
      key: 'fieldName',
      width: 150,
      render: (text: string, record: FieldInfo) => (
        <Space>
          <a onClick={() => handleViewDetail(record)}>{text}</a>
          {record.isPrimaryKey && <Tag color="red">PK</Tag>}
          {record.isForeignKey && <Tag color="orange">FK</Tag>}
          {record.isSensitive && <Tag color="purple">敏感</Tag>}
        </Space>
      ),
      sorter: (a: FieldInfo, b: FieldInfo) => a.fieldName.localeCompare(b.fieldName)
    },
    {
      title: '业务名称',
      dataIndex: 'businessName',
      key: 'businessName',
      width: 120,
      sorter: (a: FieldInfo, b: FieldInfo) => a.businessName.localeCompare(b.businessName)
    },
    {
      title: '数据类型',
      dataIndex: 'fieldType',
      key: 'fieldType',
      width: 100,
      render: (type: string, record: FieldInfo) => {
        let displayType = type;
        if (record.length) {
          displayType += `(${record.length}`;
          if (record.precision && record.scale) {
            displayType += `,${record.scale}`;
          }
          displayType += ')';
        }
        return <Tag color="blue">{displayType}</Tag>;
      },
      filters: [
        { text: 'VARCHAR', value: 'VARCHAR' },
        { text: 'BIGINT', value: 'BIGINT' },
        { text: 'DECIMAL', value: 'DECIMAL' },
        { text: 'TIMESTAMP', value: 'TIMESTAMP' },
        { text: 'TEXT', value: 'TEXT' }
      ],
      onFilter: (value: any, record: FieldInfo) => record.fieldType === value
    },
    {
      title: '所属表',
      dataIndex: 'tableName',
      key: 'tableName',
      width: 150,
      render: (text: string, record: FieldInfo) => (
        <Tooltip title={`${record.databaseName}.${text}`}>
          <a>{text}</a>
        </Tooltip>
      )
    },
    {
      title: '业务域',
      dataIndex: 'businessDomain',
      key: 'businessDomain',
      width: 100,
      filters: [
        { text: '用户中心', value: '用户中心' },
        { text: '订单中心', value: '订单中心' },
        { text: '商品中心', value: '商品中心' }
      ],
      onFilter: (value: any, record: FieldInfo) => record.businessDomain === value
    },
    {
      title: '数据层级',
      dataIndex: 'dataLayer',
      key: 'dataLayer',
      width: 80,
      render: (layer: string) => {
        const layerColors = {
          'ODS': 'green',
          'DWD': 'blue',
          'DWS': 'orange',
          'ADS': 'purple'
        };
        return <Tag color={layerColors[layer as keyof typeof layerColors]}>{layer}</Tag>;
      },
      filters: [
        { text: 'ODS', value: 'ODS' },
        { text: 'DWD', value: 'DWD' },
        { text: 'DWS', value: 'DWS' },
        { text: 'ADS', value: 'ADS' }
      ],
      onFilter: (value: any, record: FieldInfo) => record.dataLayer === value
    },
    {
      title: '可空',
      dataIndex: 'nullable',
      key: 'nullable',
      width: 60,
      render: (nullable: boolean) => (
        <Tag color={nullable ? 'orange' : 'green'}>
          {nullable ? '是' : '否'}
        </Tag>
      )
    },
    {
      title: '质量评分',
      dataIndex: 'qualityScore',
      key: 'qualityScore',
      width: 100,
      render: (score: number) => {
        let color = 'red';
        if (score >= 90) color = 'green';
        else if (score >= 70) color = 'orange';
        return <Tag color={color}>{score}</Tag>;
      },
      sorter: (a: FieldInfo, b: FieldInfo) => a.qualityScore - b.qualityScore
    },
    {
      title: '负责人',
      dataIndex: 'owner',
      key: 'owner',
      width: 80
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => {
        const statusMap = {
          active: { color: 'green', text: '活跃' },
          inactive: { color: 'orange', text: '非活跃' },
          deprecated: { color: 'red', text: '已废弃' }
        };
        const config = statusMap[status as keyof typeof statusMap];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
      filters: [
        { text: '活跃', value: 'active' },
        { text: '非活跃', value: 'inactive' },
        { text: '已废弃', value: 'deprecated' }
      ],
      onFilter: (value: any, record: FieldInfo) => record.status === value
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: FieldInfo) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个字段吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 初始化数据
  useEffect(() => {
    dispatch(setBreadcrumbs([
      { key: 'home', label: '首页', path: '/dashboard' },
      { key: 'data-management', label: '数据管理', path: '' },
      { key: 'field-management', label: '字段管理', path: '' }
    ]));
    loadFields();
  }, [dispatch]);

  // 加载字段数据
  const loadFields = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      setFields(mockFields);
      setFilteredFields(mockFields);
      setTotal(mockFields.length);
    } catch (error) {
      message.error('加载字段数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 搜索处理
  const handleSearch = (value: string) => {
    setSearchText(value);
    filterFields(value, filters);
  };

  // 筛选处理
  const filterFields = (searchText: string, filterState: FilterState) => {
    let filtered = fields.filter(field => {
      const matchSearch = !searchText || 
        field.fieldName.toLowerCase().includes(searchText.toLowerCase()) ||
        field.businessName.toLowerCase().includes(searchText.toLowerCase()) ||
        field.description.toLowerCase().includes(searchText.toLowerCase());
      
      const matchStatus = filterState.status.length === 0 || filterState.status.includes(field.status);
      const matchDataType = filterState.dataType.length === 0 || filterState.dataType.includes(field.fieldType);
      const matchBusinessDomain = filterState.businessDomain.length === 0 || filterState.businessDomain.includes(field.businessDomain);
      const matchDataLayer = filterState.dataLayer.length === 0 || filterState.dataLayer.includes(field.dataLayer);
      const matchSensitive = filterState.isSensitive === null || field.isSensitive === filterState.isSensitive;
      const matchPrimaryKey = filterState.isPrimaryKey === null || field.isPrimaryKey === filterState.isPrimaryKey;
      
      return matchSearch && matchStatus && matchDataType && matchBusinessDomain && matchDataLayer && matchSensitive && matchPrimaryKey;
    });
    
    setFilteredFields(filtered);
    setTotal(filtered.length);
    setCurrentPage(1);
  };

  // 计算统计数据
  const getStatistics = () => {
    const totalFields = fields.length;
    const sensitiveFields = fields.filter(f => f.isSensitive).length;
    const primaryKeys = fields.filter(f => f.isPrimaryKey).length;
    const avgQualityScore = fields.length > 0 ? Math.round(fields.reduce((sum, f) => sum + f.qualityScore, 0) / fields.length) : 0;
    const activeFields = fields.filter(f => f.status === 'active').length;
    
    return {
      totalFields,
      sensitiveFields,
      primaryKeys,
      avgQualityScore,
      activeFields,
      sensitiveRate: totalFields > 0 ? Math.round((sensitiveFields / totalFields) * 100) : 0,
      activeRate: totalFields > 0 ? Math.round((activeFields / totalFields) * 100) : 0
    };
  };

  // 查看详情
  const handleViewDetail = (field: FieldInfo) => {
    setSelectedField(field);
    setFieldDetailVisible(true);
  };

  // 编辑字段
  const handleEdit = (field: FieldInfo) => {
    setEditingField(field);
    form.setFieldsValue(field);
    setIsModalVisible(true);
  };

  // 删除字段
  const handleDelete = async (id: string) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      const newFields = fields.filter(field => field.id !== id);
      setFields(newFields);
      filterFields(searchText, filters);
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 保存字段
  const handleSave = async (values: any) => {
    try {
      setLoading(true);
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (editingField) {
        // 更新字段
        const newFields = fields.map(field => 
          field.id === editingField.id ? { ...field, ...values, updateTime: new Date().toLocaleString() } : field
        );
        setFields(newFields);
        message.success('更新成功');
      } else {
        // 新增字段
        const newField: FieldInfo = {
          ...values,
          id: Date.now().toString(),
          createTime: new Date().toLocaleString(),
          updateTime: new Date().toLocaleString()
        };
        setFields([...fields, newField]);
        message.success('创建成功');
      }
      
      setIsModalVisible(false);
      setEditingField(null);
      form.resetFields();
      filterFields(searchText, filters);
    } catch (error) {
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的字段');
      return;
    }
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      const newFields = fields.filter(field => !selectedRowKeys.includes(field.id));
      setFields(newFields);
      setSelectedRowKeys([]);
      filterFields(searchText, filters);
      message.success(`成功删除 ${selectedRowKeys.length} 个字段`);
    } catch (error) {
      message.error('批量删除失败');
    }
  };

  // 导出数据
  const handleExport = () => {
    message.info('导出功能开发中...');
  };

  // 导入数据
  const handleImport = () => {
    message.info('导入功能开发中...');
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as string[]),
  };

  const statistics = getStatistics();

  return (
    <Layout className="field-management-page">
      <Content>
        {/* 页面头部 */}
        <Card className="page-header" bordered={false}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space align="center">
                <DatabaseOutlined style={{ fontSize: 24, color: '#165DFF' }} />
                <div>
                  <h2>字段管理</h2>
                  <p>管理数据表字段的元数据信息，包括字段属性、业务含义和质量评分</p>
                </div>
              </Space>
            </Col>
            <Col>
              <Space>
                <Button icon={<ImportOutlined />} onClick={handleImport}>
                  导入
                </Button>
                <Button icon={<ExportOutlined />} onClick={handleExport}>
                  导出
                </Button>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={() => {
                    setEditingField(null);
                    form.resetFields();
                    setIsModalVisible(true);
                  }}
                >
                  新增字段
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 统计概览区域 */}
        <Card className="statistics-overview" bordered={false}>
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card className="stat-card" bordered={false}>
                <Statistic
                  title="字段总数"
                  value={statistics.totalFields}
                  prefix={<TableOutlined style={{ color: '#165DFF' }} />}
                  valueStyle={{ color: '#165DFF', fontSize: 28, fontWeight: 600 }}
                />
                <div className="stat-trend">
                  <span className="trend-text">活跃字段 {statistics.activeFields} 个</span>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="stat-card" bordered={false}>
                <Statistic
                  title="敏感字段"
                  value={statistics.sensitiveFields}
                  prefix={<SafetyOutlined style={{ color: '#722ED1' }} />}
                  valueStyle={{ color: '#722ED1', fontSize: 28, fontWeight: 600 }}
                />
                <div className="stat-trend">
                  <Progress 
                    percent={statistics.sensitiveRate} 
                    size="small" 
                    strokeColor="#722ED1"
                    showInfo={false}
                  />
                  <span className="trend-text">占比 {statistics.sensitiveRate}%</span>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="stat-card" bordered={false}>
                <Statistic
                  title="主键字段"
                  value={statistics.primaryKeys}
                  prefix={<KeyOutlined style={{ color: '#FA541C' }} />}
                  valueStyle={{ color: '#FA541C', fontSize: 28, fontWeight: 600 }}
                />
                <div className="stat-trend">
                  <span className="trend-text">核心标识字段</span>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="stat-card" bordered={false}>
                <Statistic
                  title="平均质量评分"
                  value={statistics.avgQualityScore}
                  prefix={<BarChartOutlined style={{ color: '#52C41A' }} />}
                  suffix="分"
                  valueStyle={{ color: '#52C41A', fontSize: 28, fontWeight: 600 }}
                />
                <div className="stat-trend">
                  <Progress 
                    percent={statistics.avgQualityScore} 
                    size="small" 
                    strokeColor="#52C41A"
                    showInfo={false}
                  />
                  <span className="trend-text">质量健康度良好</span>
                </div>
              </Card>
            </Col>
          </Row>
        </Card>

        {/* 搜索和筛选区域 */}
        <Card className="search-filter-card" bordered={false}>
          <Tabs activeKey={activeTab} onChange={setActiveTab} className="filter-tabs">
            <TabPane tab={<span><SearchOutlined />快速搜索</span>} key="search">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Search
                    placeholder="搜索字段名称、业务名称或描述"
                    allowClear
                    enterButton={<SearchOutlined />}
                    size="large"
                    onSearch={handleSearch}
                    onChange={(e) => !e.target.value && handleSearch('')}
                  />
                </Col>
                <Col xs={24} sm={12} md={4}>
                  <Select
                    mode="multiple"
                    placeholder="业务域"
                    style={{ width: '100%' }}
                    value={filters.businessDomain}
                    onChange={(value) => {
                      const newFilters = { ...filters, businessDomain: value };
                      setFilters(newFilters);
                      filterFields(searchText, newFilters);
                    }}
                  >
                    <Option value="用户中心">用户中心</Option>
                    <Option value="订单中心">订单中心</Option>
                    <Option value="商品中心">商品中心</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={4}>
                  <Select
                    mode="multiple"
                    placeholder="数据层级"
                    style={{ width: '100%' }}
                    value={filters.dataLayer}
                    onChange={(value) => {
                      const newFilters = { ...filters, dataLayer: value };
                      setFilters(newFilters);
                      filterFields(searchText, newFilters);
                    }}
                  >
                    <Option value="ODS">ODS</Option>
                    <Option value="DWD">DWD</Option>
                    <Option value="DWS">DWS</Option>
                    <Option value="ADS">ADS</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={4}>
                  <Select
                    placeholder="敏感字段"
                    style={{ width: '100%' }}
                    allowClear
                    value={filters.isSensitive}
                    onChange={(value) => {
                      const newFilters = { ...filters, isSensitive: value };
                      setFilters(newFilters);
                      filterFields(searchText, newFilters);
                    }}
                  >
                    <Option value={true}>是</Option>
                    <Option value={false}>否</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={4}>
                  <Space>
                    <Button 
                      icon={<FilterOutlined />} 
                      onClick={() => {
                        const resetFilters: FilterState = {
                          status: [],
                          dataType: [],
                          businessDomain: [],
                          dataLayer: [],
                          isSensitive: null,
                          isPrimaryKey: null
                        };
                        setFilters(resetFilters);
                        setSearchText('');
                        filterFields('', resetFilters);
                      }}
                    >
                      重置
                    </Button>
                    <Button icon={<ReloadOutlined />} onClick={loadFields}>
                      刷新
                    </Button>
                  </Space>
                </Col>
              </Row>
            </TabPane>
            <TabPane tab={<span><FilterOutlined />高级筛选</span>} key="advanced">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <div className="filter-group">
                    <label>数据类型</label>
                    <Select
                      mode="multiple"
                      placeholder="选择数据类型"
                      style={{ width: '100%' }}
                      allowClear
                      value={filters.dataType}
                      onChange={(value) => {
                        const newFilters = { ...filters, dataType: value };
                        setFilters(newFilters);
                        filterFields(searchText, newFilters);
                      }}
                    >
                      <Option value="VARCHAR">VARCHAR</Option>
                      <Option value="INT">INT</Option>
                      <Option value="BIGINT">BIGINT</Option>
                      <Option value="DECIMAL">DECIMAL</Option>
                      <Option value="TIMESTAMP">TIMESTAMP</Option>
                      <Option value="TEXT">TEXT</Option>
                    </Select>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div className="filter-group">
                    <label>字段属性</label>
                    <Select
                      placeholder="主键字段"
                      style={{ width: '100%' }}
                      allowClear
                      value={filters.isPrimaryKey}
                      onChange={(value) => {
                        const newFilters = { ...filters, isPrimaryKey: value };
                        setFilters(newFilters);
                        filterFields(searchText, newFilters);
                      }}
                    >
                      <Option value={true}>是</Option>
                      <Option value={false}>否</Option>
                    </Select>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div className="filter-group">
                    <label>质量评分</label>
                    <Select
                      placeholder="选择质量评分范围"
                      style={{ width: '100%' }}
                      allowClear
                    >
                      <Option value="high">高 (90-100)</Option>
                      <Option value="medium">中 (70-89)</Option>
                      <Option value="low">低 (0-69)</Option>
                    </Select>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div className="filter-group">
                    <label>状态</label>
                    <Select
                      mode="multiple"
                      placeholder="选择状态"
                      style={{ width: '100%' }}
                      allowClear
                      value={filters.status}
                      onChange={(value) => {
                        const newFilters = { ...filters, status: value };
                        setFilters(newFilters);
                        filterFields(searchText, newFilters);
                      }}
                    >
                      <Option value="active">活跃</Option>
                      <Option value="inactive">非活跃</Option>
                      <Option value="deprecated">已废弃</Option>
                    </Select>
                  </div>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        </Card>

        {/* 主要内容区域 */}
        <Layout className="main-content-layout">
          {/* 侧边栏 */}
          {showSidebar && (
            <Sider width={280} className="content-sider" theme="light">
              <Card className="sidebar-card" bordered={false}>
                <div className="sidebar-header">
                   <h4><BranchesOutlined /> 数据结构</h4>
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<CloseOutlined />}
                    onClick={() => setShowSidebar(false)}
                  />
                </div>
                <Tree
                  showIcon
                  defaultExpandAll
                  treeData={[
                    {
                      title: '用户中心',
                      key: 'user',
                      icon: <DatabaseOutlined />,
                      children: [
                        {
                          title: 'user_basic_info',
                          key: 'user_basic_info',
                          icon: <TableOutlined />,
                          children: [
                            { title: 'user_id', key: 'user_id', icon: <FieldTimeOutlined /> },
                            { title: 'mobile_phone', key: 'mobile_phone', icon: <FieldTimeOutlined /> },
                            { title: 'created_at', key: 'created_at', icon: <FieldTimeOutlined /> }
                          ]
                        }
                      ]
                    },
                    {
                      title: '订单中心',
                      key: 'order',
                      icon: <DatabaseOutlined />,
                      children: [
                        {
                          title: 'order_main',
                          key: 'order_main',
                          icon: <TableOutlined />,
                          children: [
                            { title: 'order_id', key: 'order_id', icon: <FieldTimeOutlined /> },
                            { title: 'order_amount', key: 'order_amount', icon: <FieldTimeOutlined /> }
                          ]
                        }
                      ]
                    },
                    {
                      title: '商品中心',
                      key: 'product',
                      icon: <DatabaseOutlined />,
                      children: [
                        {
                          title: 'product_basic_info',
                          key: 'product_basic_info',
                          icon: <TableOutlined />,
                          children: [
                            { title: 'product_name', key: 'product_name', icon: <FieldTimeOutlined /> }
                          ]
                        }
                      ]
                    }
                  ]}
                />
              </Card>
            </Sider>
          )}

          {/* 主内容区 */}
          <Content className="table-content">
            {/* 操作栏 */}
            {selectedRowKeys.length > 0 && (
              <Card className="batch-operations" bordered={false}>
                <Row justify="space-between" align="middle">
                  <Col>
                    <Space>
                      <Badge count={selectedRowKeys.length} showZero={false}>
                        <span>已选择 {selectedRowKeys.length} 项</span>
                      </Badge>
                      <Popconfirm
                        title={`确定要删除选中的 ${selectedRowKeys.length} 个字段吗？`}
                        onConfirm={handleBatchDelete}
                        okText="确定"
                        cancelText="取消"
                      >
                        <Button danger icon={<DeleteOutlined />}>
                          批量删除
                        </Button>
                      </Popconfirm>
                      <Button 
                        icon={<ExportOutlined />}
                        onClick={() => handleExport()}
                      >
                        导出选中
                      </Button>
                      <Button onClick={() => setSelectedRowKeys([])}>
                        取消选择
                      </Button>
                    </Space>
                  </Col>
                  <Col>
                    {!showSidebar && (
                      <Button 
                        icon={<MenuOutlined />}
                        onClick={() => setShowSidebar(true)}
                      >
                        显示结构树
                      </Button>
                    )}
                  </Col>
                </Row>
              </Card>
            )}

            {/* 数据表格 */}
            <Card bordered={false}>
              <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={filteredFields.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
                rowKey="id"
                loading={loading}
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: total,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                  onChange: (page, size) => {
                    setCurrentPage(page);
                    setPageSize(size || 20);
                  }
                }}
                scroll={{ x: 1500 }}
              />
            </Card>
          </Content>
        </Layout>

        {/* 字段详情抽屉 */}
        <Drawer
          title={selectedField ? `字段详情 - ${selectedField.fieldName}` : '字段详情'}
          placement="right"
          width={600}
          open={fieldDetailVisible}
          onClose={() => {
            setFieldDetailVisible(false);
            setSelectedField(null);
          }}
        >
          {selectedField && (
            <div className="field-detail-content">
              <Tabs defaultActiveKey="basic">
                <TabPane tab="基本信息" key="basic">
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <Card size="small" title="字段标识">
                        <Row gutter={[16, 8]}>
                          <Col span={12}>
                            <div className="detail-item">
                              <label>字段名称：</label>
                              <span>{selectedField.fieldName}</span>
                            </div>
                          </Col>
                          <Col span={12}>
                            <div className="detail-item">
                              <label>业务名称：</label>
                              <span>{selectedField.businessName}</span>
                            </div>
                          </Col>
                          <Col span={12}>
                            <div className="detail-item">
                              <label>数据类型：</label>
                              <Tag color="blue">{selectedField.fieldType}</Tag>
                            </div>
                          </Col>
                          <Col span={12}>
                            <div className="detail-item">
                              <label>质量评分：</label>
                              <Progress 
                                percent={selectedField.qualityScore} 
                                size="small" 
                                status={selectedField.qualityScore >= 90 ? 'success' : selectedField.qualityScore >= 70 ? 'normal' : 'exception'}
                              />
                            </div>
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                    <Col span={24}>
                      <Card size="small" title="属性信息">
                        <Row gutter={[16, 8]}>
                          <Col span={8}>
                            <div className="detail-item">
                              <label>可空：</label>
                              <Tag color={selectedField.nullable ? 'orange' : 'green'}>
                                {selectedField.nullable ? '是' : '否'}
                              </Tag>
                            </div>
                          </Col>
                          <Col span={8}>
                            <div className="detail-item">
                              <label>主键：</label>
                              <Tag color={selectedField.isPrimaryKey ? 'red' : 'default'}>
                                {selectedField.isPrimaryKey ? '是' : '否'}
                              </Tag>
                            </div>
                          </Col>
                          <Col span={8}>
                            <div className="detail-item">
                              <label>敏感字段：</label>
                              <Tag color={selectedField.isSensitive ? 'purple' : 'default'}>
                                {selectedField.isSensitive ? '是' : '否'}
                              </Tag>
                            </div>
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                  </Row>
                </TabPane>
                <TabPane tab="业务信息" key="business">
                  <Card size="small" title="业务描述">
                    <p>{selectedField.businessDescription}</p>
                  </Card>
                  <Card size="small" title="技术描述" style={{ marginTop: 16 }}>
                    <p>{selectedField.description}</p>
                  </Card>
                  <Card size="small" title="标签" style={{ marginTop: 16 }}>
                    <Space wrap>
                      {selectedField.tags.map(tag => (
                        <Tag key={tag} color="blue">{tag}</Tag>
                      ))}
                    </Space>
                  </Card>
                </TabPane>
                <TabPane tab="元数据" key="metadata">
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <Card size="small" title="位置信息">
                        <Row gutter={[16, 8]}>
                          <Col span={12}>
                            <div className="detail-item">
                              <label>数据库：</label>
                              <span>{selectedField.databaseName}</span>
                            </div>
                          </Col>
                          <Col span={12}>
                            <div className="detail-item">
                              <label>表名：</label>
                              <span>{selectedField.tableName}</span>
                            </div>
                          </Col>
                          <Col span={12}>
                            <div className="detail-item">
                              <label>业务域：</label>
                              <Tag>{selectedField.businessDomain}</Tag>
                            </div>
                          </Col>
                          <Col span={12}>
                            <div className="detail-item">
                              <label>数据层级：</label>
                              <Tag color="blue">{selectedField.dataLayer}</Tag>
                            </div>
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                    <Col span={24}>
                      <Card size="small" title="管理信息">
                        <Row gutter={[16, 8]}>
                          <Col span={12}>
                            <div className="detail-item">
                              <label>负责人：</label>
                              <span>{selectedField.owner}</span>
                            </div>
                          </Col>
                          <Col span={12}>
                            <div className="detail-item">
                              <label>状态：</label>
                              <Tag color={selectedField.status === 'active' ? 'green' : selectedField.status === 'inactive' ? 'orange' : 'red'}>
                                {selectedField.status === 'active' ? '活跃' : selectedField.status === 'inactive' ? '非活跃' : '已废弃'}
                              </Tag>
                            </div>
                          </Col>
                          <Col span={12}>
                            <div className="detail-item">
                              <label>创建时间：</label>
                              <span>{selectedField.createTime}</span>
                            </div>
                          </Col>
                          <Col span={12}>
                            <div className="detail-item">
                              <label>更新时间：</label>
                              <span>{selectedField.updateTime}</span>
                            </div>
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                  </Row>
                </TabPane>
              </Tabs>
              
              <Divider />
              
              <Space>
                <Button 
                  type="primary" 
                  icon={<EditOutlined />}
                  onClick={() => {
                    setFieldDetailVisible(false);
                    handleEdit(selectedField);
                  }}
                >
                  编辑字段
                </Button>
                <Button icon={<LinkOutlined />}>
                  查看血缘
                </Button>
                <Button icon={<BarChartOutlined />}>
                  质量报告
                </Button>
              </Space>
            </div>
          )}
        </Drawer>

        {/* 编辑/新增字段弹窗 */
        <Modal
          title={editingField ? '编辑字段' : '新增字段'}
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingField(null);
            form.resetFields();
          }}
          footer={null}
          width={800}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="fieldName"
                  label="字段名称"
                  rules={[{ required: true, message: '请输入字段名称' }]}
                >
                  <Input placeholder="请输入字段名称" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="businessName"
                  label="业务名称"
                  rules={[{ required: true, message: '请输入业务名称' }]}
                >
                  <Input placeholder="请输入业务名称" />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="fieldType"
                  label="数据类型"
                  rules={[{ required: true, message: '请选择数据类型' }]}
                >
                  <Select placeholder="请选择数据类型">
                    <Option value="VARCHAR">VARCHAR</Option>
                    <Option value="BIGINT">BIGINT</Option>
                    <Option value="DECIMAL">DECIMAL</Option>
                    <Option value="TIMESTAMP">TIMESTAMP</Option>
                    <Option value="TEXT">TEXT</Option>
                    <Option value="INT">INT</Option>
                    <Option value="DOUBLE">DOUBLE</Option>
                    <Option value="DATE">DATE</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="length" label="长度">
                  <Input type="number" placeholder="字段长度" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="precision" label="精度">
                  <Input type="number" placeholder="数值精度" />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="tableName"
                  label="所属表"
                  rules={[{ required: true, message: '请输入表名' }]}
                >
                  <Input placeholder="请输入表名" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="databaseName"
                  label="数据库"
                  rules={[{ required: true, message: '请输入数据库名' }]}
                >
                  <Input placeholder="请输入数据库名" />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="businessDomain"
                  label="业务域"
                  rules={[{ required: true, message: '请选择业务域' }]}
                >
                  <Select placeholder="请选择业务域">
                    <Option value="用户中心">用户中心</Option>
                    <Option value="订单中心">订单中心</Option>
                    <Option value="商品中心">商品中心</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="dataLayer"
                  label="数据层级"
                  rules={[{ required: true, message: '请选择数据层级' }]}
                >
                  <Select placeholder="请选择数据层级">
                    <Option value="ODS">ODS</Option>
                    <Option value="DWD">DWD</Option>
                    <Option value="DWS">DWS</Option>
                    <Option value="ADS">ADS</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item name="description" label="字段描述">
              <Input.TextArea rows={3} placeholder="请输入字段描述" />
            </Form.Item>
            
            <Form.Item name="businessDescription" label="业务描述">
              <Input.TextArea rows={3} placeholder="请输入业务描述" />
            </Form.Item>
            
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item name="nullable" valuePropName="checked" label="可空">
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="isPrimaryKey" valuePropName="checked" label="主键">
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="isForeignKey" valuePropName="checked" label="外键">
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="isSensitive" valuePropName="checked" label="敏感字段">
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="owner" label="负责人">
                  <Input placeholder="请输入负责人" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="status" label="状态">
                  <Select placeholder="请选择状态">
                    <Option value="active">活跃</Option>
                    <Option value="inactive">非活跃</Option>
                    <Option value="deprecated">已废弃</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {editingField ? '更新' : '创建'}
                </Button>
                <Button onClick={() => {
                  setIsModalVisible(false);
                  setEditingField(null);
                  form.resetFields();
                }}>
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
        }
      </Content>
    </Layout>
  );
};

export default FieldManagementPage;