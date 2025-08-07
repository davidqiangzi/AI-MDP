import React, { useState, useEffect } from 'react';
import {
  Layout,
  Tree,
  Input,
  Select,
  Button,
  Table,
  Tag,
  Space,
  Card,
  Row,
  Col,
  Breadcrumb,
  Pagination,
  Tooltip,
  Rate,
  message,
  Dropdown,
  Menu,
  Modal,
  Form,
  DatePicker,
  Checkbox,
  Radio,
  Divider,
  Statistic,
  Progress,
  Empty
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  SettingOutlined,
  DatabaseOutlined,
  TableOutlined,
  FileOutlined,
  ApiOutlined,
  StarOutlined,
  EyeOutlined,
  DownOutlined,
  PlusOutlined,
  ExportOutlined,
  ImportOutlined,
  DeleteOutlined,
  EditOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setBreadcrumbs } from '../../store/slices/uiSlice';
import './index.css';

const { Sider, Content } = Layout;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const CheckboxGroup = Checkbox.Group;

interface CatalogNode {
  key: string;
  title: string;
  icon?: React.ReactNode;
  children?: CatalogNode[];
  type: 'database' | 'schema' | 'table' | 'view' | 'folder';
  count?: number;
}

interface DataTable {
  id: string;
  name: string;
  type: 'table' | 'view' | 'materialized_view';
  database: string;
  schema: string;
  description: string;
  owner: string;
  createTime: string;
  updateTime: string;
  rowCount: number;
  dataSize: string;
  status: 'active' | 'inactive' | 'deprecated';
  healthScore: number;
  tags: string[];
  isFavorite: boolean;
  accessCount: number;
  lastAccessTime: string;
}

interface FilterState {
  status: string[];
  type: string[];
  database: string[];
  schema: string[];
  healthScore: [number, number];
  dateRange: [string, string] | null;
  tags: string[];
  hasDescription: boolean;
  isOwned: boolean;
}

const DataCatalog: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['database-1', 'database-2']);
  const [dataTables, setDataTables] = useState<DataTable[]>([]);
  const [filteredTables, setFilteredTables] = useState<DataTable[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    type: [],
    database: [],
    schema: [],
    healthScore: [0, 100],
    dateRange: null,
    tags: [],
    hasDescription: false,
    isOwned: false
  });
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [sortField, setSortField] = useState<string>('updateTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 模拟目录树数据
  const catalogTree: CatalogNode[] = [
    {
      key: 'database-1',
      title: 'user_db',
      icon: <DatabaseOutlined />,
      type: 'database',
      count: 25,
      children: [
        {
          key: 'schema-1-1',
          title: 'public',
          type: 'schema',
          count: 15,
          children: [
            { key: 'table-1-1-1', title: 'user_basic_info', icon: <TableOutlined />, type: 'table' },
            { key: 'table-1-1-2', title: 'user_profile', icon: <TableOutlined />, type: 'table' },
            { key: 'table-1-1-3', title: 'user_behavior', icon: <TableOutlined />, type: 'table' },
            { key: 'view-1-1-1', title: 'user_summary_view', icon: <EyeOutlined />, type: 'view' }
          ]
        },
        {
          key: 'schema-1-2',
          title: 'analytics',
          type: 'schema',
          count: 10,
          children: [
            { key: 'table-1-2-1', title: 'user_metrics', icon: <TableOutlined />, type: 'table' },
            { key: 'table-1-2-2', title: 'user_segments', icon: <TableOutlined />, type: 'table' }
          ]
        }
      ]
    },
    {
      key: 'database-2',
      title: 'order_db',
      icon: <DatabaseOutlined />,
      type: 'database',
      count: 18,
      children: [
        {
          key: 'schema-2-1',
          title: 'public',
          type: 'schema',
          count: 12,
          children: [
            { key: 'table-2-1-1', title: 'orders', icon: <TableOutlined />, type: 'table' },
            { key: 'table-2-1-2', title: 'order_items', icon: <TableOutlined />, type: 'table' },
            { key: 'table-2-1-3', title: 'payments', icon: <TableOutlined />, type: 'table' }
          ]
        },
        {
          key: 'schema-2-2',
          title: 'reporting',
          type: 'schema',
          count: 6,
          children: [
            { key: 'view-2-2-1', title: 'order_summary', icon: <EyeOutlined />, type: 'view' },
            { key: 'view-2-2-2', title: 'revenue_report', icon: <EyeOutlined />, type: 'view' }
          ]
        }
      ]
    },
    {
      key: 'database-3',
      title: 'product_db',
      icon: <DatabaseOutlined />,
      type: 'database',
      count: 12,
      children: [
        {
          key: 'schema-3-1',
          title: 'public',
          type: 'schema',
          count: 8,
          children: [
            { key: 'table-3-1-1', title: 'products', icon: <TableOutlined />, type: 'table' },
            { key: 'table-3-1-2', title: 'categories', icon: <TableOutlined />, type: 'table' },
            { key: 'table-3-1-3', title: 'inventory', icon: <TableOutlined />, type: 'table' }
          ]
        }
      ]
    }
  ];

  // 模拟数据表数据
  const mockDataTables: DataTable[] = [
    {
      id: '1',
      name: 'user_basic_info',
      type: 'table',
      database: 'user_db',
      schema: 'public',
      description: '用户基础信息表，包含用户ID、姓名、手机号等基本信息',
      owner: '张三',
      createTime: '2024-01-15 10:30:00',
      updateTime: '2024-01-20 14:20:00',
      rowCount: 1250000,
      dataSize: '2.3 GB',
      status: 'active',
      healthScore: 95,
      tags: ['核心表', '用户数据', 'PII'],
      isFavorite: true,
      accessCount: 1250,
      lastAccessTime: '2024-01-20 15:30:00'
    },
    {
      id: '2',
      name: 'user_profile',
      type: 'table',
      database: 'user_db',
      schema: 'public',
      description: '用户画像信息表，包含用户偏好、标签等扩展信息',
      owner: '李四',
      createTime: '2024-01-10 09:15:00',
      updateTime: '2024-01-19 16:45:00',
      rowCount: 980000,
      dataSize: '1.8 GB',
      status: 'active',
      healthScore: 88,
      tags: ['用户数据', '画像'],
      isFavorite: false,
      accessCount: 890,
      lastAccessTime: '2024-01-19 14:20:00'
    },
    {
      id: '3',
      name: 'orders',
      type: 'table',
      database: 'order_db',
      schema: 'public',
      description: '订单主表，记录所有订单的基本信息',
      owner: '王五',
      createTime: '2024-01-05 14:20:00',
      updateTime: '2024-01-20 18:30:00',
      rowCount: 2500000,
      dataSize: '4.2 GB',
      status: 'active',
      healthScore: 92,
      tags: ['核心表', '订单数据'],
      isFavorite: true,
      accessCount: 2100,
      lastAccessTime: '2024-01-20 17:45:00'
    },
    {
      id: '4',
      name: 'user_summary_view',
      type: 'view',
      database: 'user_db',
      schema: 'public',
      description: '用户汇总视图，聚合用户基础信息和行为数据',
      owner: '赵六',
      createTime: '2024-01-12 11:00:00',
      updateTime: '2024-01-18 10:15:00',
      rowCount: 1250000,
      dataSize: '0 B',
      status: 'active',
      healthScore: 85,
      tags: ['视图', '汇总'],
      isFavorite: false,
      accessCount: 450,
      lastAccessTime: '2024-01-18 13:20:00'
    },
    {
      id: '5',
      name: 'products',
      type: 'table',
      database: 'product_db',
      schema: 'public',
      description: '商品信息表，包含商品基本信息、价格、库存等',
      owner: '孙七',
      createTime: '2024-01-08 16:30:00',
      updateTime: '2024-01-20 12:00:00',
      rowCount: 150000,
      dataSize: '800 MB',
      status: 'active',
      healthScore: 90,
      tags: ['商品数据'],
      isFavorite: false,
      accessCount: 680,
      lastAccessTime: '2024-01-20 11:30:00'
    },
    {
      id: '6',
      name: 'legacy_user_data',
      type: 'table',
      database: 'user_db',
      schema: 'archive',
      description: '历史用户数据表，已废弃',
      owner: '张三',
      createTime: '2023-06-15 10:30:00',
      updateTime: '2023-12-20 14:20:00',
      rowCount: 500000,
      dataSize: '1.2 GB',
      status: 'deprecated',
      healthScore: 45,
      tags: ['历史数据', '已废弃'],
      isFavorite: false,
      accessCount: 12,
      lastAccessTime: '2023-12-25 09:15:00'
    }
  ];

  /**
   * 设置面包屑导航
   */
  useEffect(() => {
    dispatch(setBreadcrumbs([
      { key: 'home', label: '首页', path: '/dashboard' },
      { key: 'data-management', label: '数据管理', path: '' },
      { 
        key: 'data-catalog', 
        label: '数据目录', 
        path: '' 
      }
    ]));
  }, [dispatch]);

  useEffect(() => {
    loadDataTables();
  }, []);

  useEffect(() => {
    filterAndSortTables();
  }, [dataTables, searchText, filters, selectedKeys, sortField, sortOrder]);

  const loadDataTables = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDataTables(mockDataTables);
    } catch (error) {
      message.error('加载数据表失败');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortTables = () => {
    let filtered = [...dataTables];

    // 搜索过滤
    if (searchText) {
      filtered = filtered.filter(table => 
        table.name.toLowerCase().includes(searchText.toLowerCase()) ||
        table.description.toLowerCase().includes(searchText.toLowerCase()) ||
        table.owner.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // 目录树选择过滤
    if (selectedKeys.length > 0) {
      const selectedKey = selectedKeys[0];
      if (selectedKey.startsWith('database-')) {
        const dbName = catalogTree.find(db => db.key === selectedKey)?.title;
        if (dbName) {
          filtered = filtered.filter(table => table.database === dbName);
        }
      } else if (selectedKey.startsWith('schema-')) {
        // 根据schema过滤
        const parts = selectedKey.split('-');
        const dbIndex = parseInt(parts[1]) - 1;
        const schemaIndex = parseInt(parts[2]) - 1;
        const dbName = catalogTree[dbIndex]?.title;
        const schemaName = catalogTree[dbIndex]?.children?.[schemaIndex]?.title;
        if (dbName && schemaName) {
          filtered = filtered.filter(table => 
            table.database === dbName && table.schema === schemaName
          );
        }
      }
    }

    // 高级过滤
    if (filters.status.length > 0) {
      filtered = filtered.filter(table => filters.status.includes(table.status));
    }
    if (filters.type.length > 0) {
      filtered = filtered.filter(table => filters.type.includes(table.type));
    }
    if (filters.database.length > 0) {
      filtered = filtered.filter(table => filters.database.includes(table.database));
    }
    if (filters.schema.length > 0) {
      filtered = filtered.filter(table => filters.schema.includes(table.schema));
    }
    if (filters.healthScore[0] > 0 || filters.healthScore[1] < 100) {
      filtered = filtered.filter(table => 
        table.healthScore >= filters.healthScore[0] && 
        table.healthScore <= filters.healthScore[1]
      );
    }
    if (filters.hasDescription) {
      filtered = filtered.filter(table => table.description && table.description.trim() !== '');
    }
    if (filters.isOwned) {
      filtered = filtered.filter(table => table.owner === '当前用户'); // 实际应该是当前登录用户
    }

    // 排序
    filtered.sort((a, b) => {
      let aValue: any = a[sortField as keyof DataTable];
      let bValue: any = b[sortField as keyof DataTable];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredTables(filtered);
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleTreeSelect = (keys: React.Key[]) => {
    setSelectedKeys(keys as string[]);
  };

  const handleTreeExpand = (keys: React.Key[]) => {
    setExpandedKeys(keys as string[]);
  };

  /**
   * 处理查看详情点击事件
   * 根据记录类型跳转到对应的详情页面
   */
  const handleViewDetail = (record: DataTable) => {
    if (record.type === 'table' || record.type === 'view' || record.type === 'materialized_view') {
      // 数据表相关类型跳转到数据表详情页
      navigate(`/data-table/detail/${record.id}`);
    } else {
      // 其他类型跳转到数据资产详情页
      navigate(`/data-assets/detail/${record.id}`);
    }
  };

  const handleFavorite = (record: DataTable) => {
    const updated = dataTables.map(table => 
      table.id === record.id ? { ...table, isFavorite: !table.isFavorite } : table
    );
    setDataTables(updated);
    message.success(record.isFavorite ? '已取消收藏' : '已添加到收藏');
  };

  const handleRefresh = () => {
    loadDataTables();
  };

  const handleResetFilters = () => {
    setFilters({
      status: [],
      type: [],
      database: [],
      schema: [],
      healthScore: [0, 100],
      dateRange: null,
      tags: [],
      hasDescription: false,
      isOwned: false
    });
    setSearchText('');
    setSelectedKeys([]);
    message.success('筛选条件已重置');
  };

  const handleBatchOperation = (operation: string) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要操作的数据表');
      return;
    }
    
    switch (operation) {
      case 'favorite':
        message.success(`已将 ${selectedRowKeys.length} 个数据表添加到收藏`);
        break;
      case 'export':
        message.success(`正在导出 ${selectedRowKeys.length} 个数据表的元数据`);
        break;
      case 'delete':
        Modal.confirm({
          title: '确认删除',
          content: `确定要删除选中的 ${selectedRowKeys.length} 个数据表吗？`,
          onOk: () => {
            message.success('删除成功');
            setSelectedRowKeys([]);
          }
        });
        break;
    }
  };

  const renderTreeTitle = (node: CatalogNode) => (
    <Space>
      {node.icon}
      <span>{node.title}</span>
      {node.count !== undefined && (
        <Tag color="blue">{node.count}</Tag>
      )}
    </Space>
  );

  const columns = [
    {
      title: '表名',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string, record: DataTable) => (
        <Space>
          {record.type === 'table' ? <TableOutlined /> : <EyeOutlined />}
          <Button 
            type="link" 
            onClick={() => handleViewDetail(record)}
            style={{ padding: 0, height: 'auto' }}
          >
            {text}
          </Button>
          {record.isFavorite && <StarOutlined style={{ color: '#faad14' }} />}
        </Space>
      ),
      sorter: true
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => {
        const typeMap = {
          table: { text: '表', color: 'blue' },
          view: { text: '视图', color: 'green' },
          materialized_view: { text: '物化视图', color: 'purple' }
        };
        const config = typeMap[type as keyof typeof typeMap] || { text: type, color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
      filters: [
        { text: '表', value: 'table' },
        { text: '视图', value: 'view' },
        { text: '物化视图', value: 'materialized_view' }
      ]
    },
    {
      title: '数据库/模式',
      key: 'location',
      width: 150,
      render: (record: DataTable) => (
        <div>
          <div>{record.database}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>{record.schema}</div>
        </div>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      )
    },
    {
      title: '负责人',
      dataIndex: 'owner',
      key: 'owner',
      width: 100
    },
    {
      title: '数据行数',
      dataIndex: 'rowCount',
      key: 'rowCount',
      width: 120,
      render: (count: number) => count.toLocaleString(),
      sorter: true
    },
    {
      title: '数据大小',
      dataIndex: 'dataSize',
      key: 'dataSize',
      width: 100
    },
    {
      title: '健康度',
      dataIndex: 'healthScore',
      key: 'healthScore',
      width: 100,
      render: (score: number) => (
        <div>
          <Progress 
            percent={score} 
            size="small" 
            strokeColor={{
              '0%': '#ff4d4f',
              '50%': '#faad14',
              '100%': '#52c41a'
            }}
            showInfo={false}
          />
          <div style={{ fontSize: '12px', textAlign: 'center' }}>{score}</div>
        </div>
      ),
      sorter: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => {
        const statusMap = {
          active: { text: '活跃', color: 'green' },
          inactive: { text: '非活跃', color: 'orange' },
          deprecated: { text: '已废弃', color: 'red' }
        };
        const config = statusMap[status as keyof typeof statusMap];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
      filters: [
        { text: '活跃', value: 'active' },
        { text: '非活跃', value: 'inactive' },
        { text: '已废弃', value: 'deprecated' }
      ]
    },
    {
      title: '最后更新',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 150,
      sorter: true
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (record: DataTable) => (
        <Space>
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title={record.isFavorite ? '取消收藏' : '添加收藏'}>
            <Button 
              type="text" 
              icon={<StarOutlined />} 
              style={{ color: record.isFavorite ? '#faad14' : undefined }}
              onClick={() => handleFavorite(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button type="text" icon={<EditOutlined />} />
          </Tooltip>
        </Space>
      )
    }
  ];

  const batchOperationMenu = (
    <Menu>
      <Menu.Item key="favorite" icon={<StarOutlined />} onClick={() => handleBatchOperation('favorite')}>
        批量收藏
      </Menu.Item>
      <Menu.Item key="export" icon={<ExportOutlined />} onClick={() => handleBatchOperation('export')}>
        导出元数据
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="delete" icon={<DeleteOutlined />} onClick={() => handleBatchOperation('delete')} danger>
        批量删除
      </Menu.Item>
    </Menu>
  );

  const filterMenu = (
    <div style={{ padding: 16, width: 300 }}>
      <Form layout="vertical">
        <Form.Item label="状态">
          <CheckboxGroup
            options={[
              { label: '活跃', value: 'active' },
              { label: '非活跃', value: 'inactive' },
              { label: '已废弃', value: 'deprecated' }
            ]}
            value={filters.status}
            onChange={(values: string[]) => setFilters({ ...filters, status: values })}
          />
        </Form.Item>
        <Form.Item label="类型">
          <CheckboxGroup
            options={[
              { label: '表', value: 'table' },
              { label: '视图', value: 'view' },
              { label: '物化视图', value: 'materialized_view' }
            ]}
            value={filters.type}
            onChange={(values: string[]) => setFilters({ ...filters, type: values })}
          />
        </Form.Item>
        <Form.Item label="健康度范围">
          <div style={{ padding: '0 8px' }}>
            <Progress 
              percent={100} 
              strokeColor="#f0f0f0"
              showInfo={false}
              style={{ marginBottom: 8 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{filters.healthScore[0]}</span>
              <span>{filters.healthScore[1]}</span>
            </div>
          </div>
        </Form.Item>
        <Form.Item>
          <Checkbox
            checked={filters.hasDescription}
            onChange={(e) => setFilters({ ...filters, hasDescription: e.target.checked })}
          >
            有描述信息
          </Checkbox>
        </Form.Item>
        <Form.Item>
          <Checkbox
            checked={filters.isOwned}
            onChange={(e) => setFilters({ ...filters, isOwned: e.target.checked })}
          >
            我负责的
          </Checkbox>
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" size="small" onClick={() => setFilterVisible(false)}>
              应用筛选
            </Button>
            <Button size="small" onClick={handleResetFilters}>
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );

  const paginatedData = filteredTables.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="data-catalog">
      <Layout>
        {/* 左侧目录树 */}
        <Sider width={280} className="catalog-sider">
          <Card title="数据目录" size="small" className="tree-card">
            <Tree
              showIcon
              selectedKeys={selectedKeys}
              expandedKeys={expandedKeys}
              onSelect={handleTreeSelect}
              onExpand={handleTreeExpand}
              treeData={catalogTree.map(node => ({
                ...node,
                title: renderTreeTitle(node),
                children: node.children?.map(child => ({
                  ...child,
                  title: renderTreeTitle(child),
                  children: child.children?.map(grandChild => ({
                    ...grandChild,
                    title: renderTreeTitle(grandChild)
                  }))
                }))
              }))}
            />
          </Card>
        </Sider>

        {/* 右侧内容区 */}
        <Content className="catalog-content">
          {/* 搜索和筛选区 */}
          <Card className="search-card">
            <Row gutter={16} align="middle">
              <Col flex="auto">
                <Search
                  placeholder="搜索表名、描述、负责人..."
                  allowClear
                  enterButton
                  size="large"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onSearch={handleSearch}
                />
              </Col>
              <Col>
                <Space>
                  <Dropdown 
                    overlay={filterMenu} 
                    trigger={['click']}
                    visible={filterVisible}
                    onVisibleChange={setFilterVisible}
                  >
                    <Button icon={<FilterOutlined />}>
                      高级筛选 <DownOutlined />
                    </Button>
                  </Dropdown>
                  <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                    刷新
                  </Button>
                  <Button icon={<SettingOutlined />}>
                    设置
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* 统计信息 */}
          <Row gutter={16} className="stats-row">
            <Col span={6}>
              <Card size="small">
                <Statistic title="总表数" value={filteredTables.length} />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic 
                  title="活跃表" 
                  value={filteredTables.filter(t => t.status === 'active').length} 
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic 
                  title="平均健康度" 
                  value={Math.round(filteredTables.reduce((sum, t) => sum + t.healthScore, 0) / filteredTables.length || 0)} 
                  suffix="%"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic 
                  title="我的收藏" 
                  value={filteredTables.filter(t => t.isFavorite).length} 
                />
              </Card>
            </Col>
          </Row>

          {/* 操作栏 */}
          <Card className="action-card">
            <Row justify="space-between" align="middle">
              <Col>
                <Space>
                  <span>已选择 {selectedRowKeys.length} 项</span>
                  {selectedRowKeys.length > 0 && (
                    <Dropdown overlay={batchOperationMenu}>
                      <Button>
                        批量操作 <DownOutlined />
                      </Button>
                    </Dropdown>
                  )}
                </Space>
              </Col>
              <Col>
                <Space>
                  <span>排序：</span>
                  <Select
                    value={`${sortField}-${sortOrder}`}
                    style={{ width: 150 }}
                    onChange={(value) => {
                      const [field, order] = value.split('-');
                      setSortField(field);
                      setSortOrder(order as 'asc' | 'desc');
                    }}
                  >
                    <Option value="updateTime-desc">最新更新</Option>
                    <Option value="updateTime-asc">最早更新</Option>
                    <Option value="name-asc">名称升序</Option>
                    <Option value="name-desc">名称降序</Option>
                    <Option value="rowCount-desc">数据量大到小</Option>
                    <Option value="rowCount-asc">数据量小到大</Option>
                    <Option value="healthScore-desc">健康度高到低</Option>
                    <Option value="healthScore-asc">健康度低到高</Option>
                  </Select>
                  <Radio.Group
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                    buttonStyle="solid"
                    size="small"
                  >
                    <Radio.Button value="table">表格</Radio.Button>
                    <Radio.Button value="card">卡片</Radio.Button>
                  </Radio.Group>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* 数据表格 */}
          <Card className="table-card">
            {filteredTables.length === 0 ? (
              <Empty description="暂无数据" />
            ) : (
              <>
                <Table
                  columns={columns}
                  dataSource={paginatedData}
                  rowKey="id"
                  loading={loading}
                  pagination={false}
                  scroll={{ x: 1400 }}
                  size="small"
                  rowSelection={{
                    selectedRowKeys,
                    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as string[]),
                    preserveSelectedRowKeys: true
                  }}
                  onChange={(pagination, filters, sorter) => {
                    if (sorter && !Array.isArray(sorter)) {
                      setSortField(sorter.field as string);
                      setSortOrder(sorter.order === 'ascend' ? 'asc' : 'desc');
                    }
                  }}
                />
                <div className="pagination-wrapper">
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={filteredTables.length}
                    showSizeChanger
                    showQuickJumper
                    showTotal={(total, range) => 
                      `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
                    }
                    onChange={(page, size) => {
                      setCurrentPage(page);
                      setPageSize(size || 20);
                    }}
                  />
                </div>
              </>
            )}
          </Card>
        </Content>
      </Layout>
    </div>
  );
};

export default DataCatalog;