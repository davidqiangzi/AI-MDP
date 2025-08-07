import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Row,
  Col,
  Table,
  Tag,
  Button,
  Space,
  Input,
  Select,
  DatePicker,
  Tree,
  Tooltip,
  message,
  Modal,
  Form,
  Switch,
  Drawer,
  Descriptions,
  Timeline,
  List,
  Avatar,
  Badge,
  Progress,
  Statistic,
  Alert,
  Divider,
  Typography,
  Breadcrumb,
  Pagination,
  Empty,
  Spin,
  Popconfirm,
  Upload,
  Radio
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
  ImportOutlined,
  SettingOutlined,
  EyeOutlined,
  DatabaseOutlined,
  TableOutlined,
  FieldTimeOutlined,
  UserOutlined,
  TagOutlined,
  FileTextOutlined,
  HistoryOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  DownOutlined,
  RightOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  LinkOutlined,
  BranchesOutlined,
  NodeIndexOutlined,
  ApartmentOutlined,
  CloudUploadOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { setBreadcrumbs } from '../../store/slices/uiSlice';
import './index.css';

const { TabPane } = Tabs;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TreeNode } = Tree;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface MetadataItem {
  id: string;
  name: string;
  type: 'database' | 'schema' | 'table' | 'view' | 'column' | 'index' | 'constraint';
  parentId?: string;
  path: string;
  description: string;
  owner: string;
  createTime: string;
  updateTime: string;
  lastSyncTime: string;
  status: 'active' | 'inactive' | 'deprecated' | 'pending';
  tags: string[];
  properties: Record<string, any>;
  children?: MetadataItem[];
  hasChildren?: boolean;
  level: number;
  syncStatus: 'success' | 'failed' | 'syncing' | 'pending';
  changeCount: number;
  version: string;
}

interface MetadataChange {
  id: string;
  metadataId: string;
  changeType: 'create' | 'update' | 'delete' | 'rename' | 'move';
  fieldName?: string;
  oldValue?: any;
  newValue?: any;
  operator: string;
  changeTime: string;
  description: string;
  approved: boolean;
  approver?: string;
  approveTime?: string;
}

interface SyncTask {
  id: string;
  name: string;
  sourceType: 'mysql' | 'postgresql' | 'oracle' | 'sqlserver' | 'hive' | 'spark';
  sourceConfig: Record<string, any>;
  targetPath: string;
  schedule: string;
  status: 'running' | 'stopped' | 'failed' | 'completed';
  lastRunTime: string;
  nextRunTime: string;
  successCount: number;
  failedCount: number;
  totalCount: number;
  createTime: string;
  updateTime: string;
}

interface FilterState {
  type: string[];
  status: string[];
  owner: string;
  tags: string[];
  syncStatus: string[];
  dateRange: [string, string] | null;
  hasDescription: boolean | null;
}

const Metadata: React.FC = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('catalog');
  const [searchText, setSearchText] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['root']);
  const [metadataItems, setMetadataItems] = useState<MetadataItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MetadataItem[]>([]);
  const [changes, setChanges] = useState<MetadataChange[]>([]);
  const [syncTasks, setSyncTasks] = useState<SyncTask[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    type: [],
    status: [],
    owner: '',
    tags: [],
    syncStatus: [],
    dateRange: null,
    hasDescription: null
  });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MetadataItem | null>(null);
  const [editVisible, setEditVisible] = useState(false);
  const [syncVisible, setSyncVisible] = useState(false);
  const [form] = Form.useForm();
  const [syncForm] = Form.useForm();

  // 模拟元数据目录树数据
  const mockTreeData = [
    {
      title: '生产环境',
      key: 'prod',
      icon: <DatabaseOutlined />,
      children: [
        {
          title: 'user_db',
          key: 'prod-user_db',
          icon: <DatabaseOutlined />,
          children: [
            {
              title: 'public',
              key: 'prod-user_db-public',
              icon: <FolderOutlined />,
              children: [
                {
                  title: 'user_basic_info',
                  key: 'prod-user_db-public-user_basic_info',
                  icon: <TableOutlined />
                },
                {
                  title: 'user_profile',
                  key: 'prod-user_db-public-user_profile',
                  icon: <TableOutlined />
                }
              ]
            }
          ]
        },
        {
          title: 'order_db',
          key: 'prod-order_db',
          icon: <DatabaseOutlined />,
          children: [
            {
              title: 'public',
              key: 'prod-order_db-public',
              icon: <FolderOutlined />,
              children: [
                {
                  title: 'orders',
                  key: 'prod-order_db-public-orders',
                  icon: <TableOutlined />
                },
                {
                  title: 'order_items',
                  key: 'prod-order_db-public-order_items',
                  icon: <TableOutlined />
                }
              ]
            }
          ]
        }
      ]
    },
    {
      title: '测试环境',
      key: 'test',
      icon: <DatabaseOutlined />,
      children: [
        {
          title: 'test_db',
          key: 'test-test_db',
          icon: <DatabaseOutlined />,
          children: [
            {
              title: 'public',
              key: 'test-test_db-public',
              icon: <FolderOutlined />,
              children: [
                {
                  title: 'test_table',
                  key: 'test-test_db-public-test_table',
                  icon: <TableOutlined />
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  // 模拟元数据项数据
  const mockMetadataItems: MetadataItem[] = [
    {
      id: '1',
      name: 'user_basic_info',
      type: 'table',
      path: 'prod.user_db.public.user_basic_info',
      description: '用户基础信息表，包含用户ID、姓名、手机号等基本信息',
      owner: '张三',
      createTime: '2024-01-15 10:30:00',
      updateTime: '2024-01-20 14:20:00',
      lastSyncTime: '2024-01-20 02:00:00',
      status: 'active',
      tags: ['核心表', '用户数据', 'PII'],
      properties: {
        rowCount: 1250000,
        dataSize: '2.3 GB',
        columns: 10,
        indexes: 3,
        partitions: 24
      },
      level: 3,
      syncStatus: 'success',
      changeCount: 5,
      version: '1.2.3'
    },
    {
      id: '2',
      name: 'user_profile',
      type: 'table',
      path: 'prod.user_db.public.user_profile',
      description: '用户画像信息表，包含用户偏好、行为标签等扩展信息',
      owner: '李四',
      createTime: '2024-01-10 09:15:00',
      updateTime: '2024-01-19 16:45:00',
      lastSyncTime: '2024-01-20 02:05:00',
      status: 'active',
      tags: ['画像表', '用户数据', '分析'],
      properties: {
        rowCount: 980000,
        dataSize: '1.8 GB',
        columns: 15,
        indexes: 2,
        partitions: 12
      },
      level: 3,
      syncStatus: 'success',
      changeCount: 3,
      version: '1.1.0'
    },
    {
      id: '3',
      name: 'orders',
      type: 'table',
      path: 'prod.order_db.public.orders',
      description: '订单主表，记录所有订单的基本信息',
      owner: '王五',
      createTime: '2024-01-08 14:20:00',
      updateTime: '2024-01-20 18:30:00',
      lastSyncTime: '2024-01-20 02:10:00',
      status: 'active',
      tags: ['核心表', '订单数据', '交易'],
      properties: {
        rowCount: 5600000,
        dataSize: '8.9 GB',
        columns: 12,
        indexes: 5,
        partitions: 36
      },
      level: 3,
      syncStatus: 'success',
      changeCount: 8,
      version: '2.1.5'
    },
    {
      id: '4',
      name: 'order_items',
      type: 'table',
      path: 'prod.order_db.public.order_items',
      description: '订单明细表，记录订单中的商品详情',
      owner: '王五',
      createTime: '2024-01-08 14:25:00',
      updateTime: '2024-01-20 18:35:00',
      lastSyncTime: '2024-01-20 02:15:00',
      status: 'active',
      tags: ['明细表', '订单数据', '商品'],
      properties: {
        rowCount: 12800000,
        dataSize: '15.2 GB',
        columns: 8,
        indexes: 4,
        partitions: 36
      },
      level: 3,
      syncStatus: 'failed',
      changeCount: 2,
      version: '1.3.2'
    },
    {
      id: '5',
      name: 'test_table',
      type: 'table',
      path: 'test.test_db.public.test_table',
      description: '测试表，用于功能验证和数据测试',
      owner: '赵六',
      createTime: '2024-01-18 11:00:00',
      updateTime: '2024-01-20 15:20:00',
      lastSyncTime: '2024-01-20 02:20:00',
      status: 'inactive',
      tags: ['测试表', '临时数据'],
      properties: {
        rowCount: 1000,
        dataSize: '2.5 MB',
        columns: 5,
        indexes: 1,
        partitions: 1
      },
      level: 3,
      syncStatus: 'pending',
      changeCount: 1,
      version: '0.1.0'
    }
  ];

  // 模拟变更记录数据
  const mockChanges: MetadataChange[] = [
    {
      id: '1',
      metadataId: '1',
      changeType: 'update',
      fieldName: 'description',
      oldValue: '用户基础信息表',
      newValue: '用户基础信息表，包含用户ID、姓名、手机号等基本信息',
      operator: '张三',
      changeTime: '2024-01-20 14:20:00',
      description: '更新表描述信息',
      approved: true,
      approver: '管理员',
      approveTime: '2024-01-20 14:25:00'
    },
    {
      id: '2',
      metadataId: '1',
      changeType: 'create',
      fieldName: 'index',
      newValue: 'idx_mobile',
      operator: '李四',
      changeTime: '2024-01-19 16:30:00',
      description: '新增手机号索引',
      approved: true,
      approver: '张三',
      approveTime: '2024-01-19 16:35:00'
    },
    {
      id: '3',
      metadataId: '3',
      changeType: 'update',
      fieldName: 'tags',
      oldValue: ['核心表', '订单数据'],
      newValue: ['核心表', '订单数据', '交易'],
      operator: '王五',
      changeTime: '2024-01-18 10:15:00',
      description: '添加交易标签',
      approved: false
    }
  ];

  // 模拟同步任务数据
  const mockSyncTasks: SyncTask[] = [
    {
      id: '1',
      name: '生产环境用户库同步',
      sourceType: 'mysql',
      sourceConfig: {
        host: 'prod-mysql-01.company.com',
        port: 3306,
        database: 'user_db',
        username: 'sync_user'
      },
      targetPath: 'prod.user_db',
      schedule: '0 2 * * *',
      status: 'completed',
      lastRunTime: '2024-01-20 02:00:00',
      nextRunTime: '2024-01-21 02:00:00',
      successCount: 156,
      failedCount: 2,
      totalCount: 158,
      createTime: '2024-01-01 10:00:00',
      updateTime: '2024-01-20 02:30:00'
    },
    {
      id: '2',
      name: '生产环境订单库同步',
      sourceType: 'mysql',
      sourceConfig: {
        host: 'prod-mysql-02.company.com',
        port: 3306,
        database: 'order_db',
        username: 'sync_user'
      },
      targetPath: 'prod.order_db',
      schedule: '0 2 * * *',
      status: 'failed',
      lastRunTime: '2024-01-20 02:10:00',
      nextRunTime: '2024-01-21 02:00:00',
      successCount: 89,
      failedCount: 5,
      totalCount: 94,
      createTime: '2024-01-01 10:30:00',
      updateTime: '2024-01-20 02:40:00'
    },
    {
      id: '3',
      name: '测试环境同步',
      sourceType: 'postgresql',
      sourceConfig: {
        host: 'test-pg-01.company.com',
        port: 5432,
        database: 'test_db',
        username: 'sync_user'
      },
      targetPath: 'test.test_db',
      schedule: '0 */6 * * *',
      status: 'running',
      lastRunTime: '2024-01-20 14:00:00',
      nextRunTime: '2024-01-20 20:00:00',
      successCount: 25,
      failedCount: 1,
      totalCount: 26,
      createTime: '2024-01-15 09:00:00',
      updateTime: '2024-01-20 14:30:00'
    }
  ];

  useEffect(() => {
    dispatch(setBreadcrumbs([
      { key: 'home', label: '首页', path: '/dashboard' },
      { key: 'data-management', label: '数据管理', path: '' },
      { key: 'metadata', label: '元数据', path: '' }
    ]));
    loadData();
  }, [dispatch]);

  useEffect(() => {
    filterData();
  }, [metadataItems, searchText, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMetadataItems(mockMetadataItems);
      setChanges(mockChanges);
      setSyncTasks(mockSyncTasks);
      setPagination(prev => ({ ...prev, total: mockMetadataItems.length }));
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filtered = metadataItems.filter(item => {
      // 搜索过滤
      if (searchText && !(
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.description.toLowerCase().includes(searchText.toLowerCase()) ||
        item.path.toLowerCase().includes(searchText.toLowerCase())
      )) {
        return false;
      }

      // 类型过滤
      if (filters.type.length > 0 && !filters.type.includes(item.type)) {
        return false;
      }

      // 状态过滤
      if (filters.status.length > 0 && !filters.status.includes(item.status)) {
        return false;
      }

      // 负责人过滤
      if (filters.owner && !item.owner.includes(filters.owner)) {
        return false;
      }

      // 标签过滤
      if (filters.tags.length > 0 && !filters.tags.some(tag => item.tags.includes(tag))) {
        return false;
      }

      // 同步状态过滤
      if (filters.syncStatus.length > 0 && !filters.syncStatus.includes(item.syncStatus)) {
        return false;
      }

      // 描述过滤
      if (filters.hasDescription !== null) {
        const hasDesc = item.description && item.description.trim().length > 0;
        if (filters.hasDescription !== hasDesc) {
          return false;
        }
      }

      return true;
    });

    setFilteredItems(filtered);
    setPagination(prev => ({ ...prev, total: filtered.length, current: 1 }));
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      type: [],
      status: [],
      owner: '',
      tags: [],
      syncStatus: [],
      dateRange: null,
      hasDescription: null
    });
    setSearchText('');
  };

  const handleViewDetail = (item: MetadataItem) => {
    setSelectedItem(item);
    setDetailVisible(true);
  };

  const handleEdit = (item: MetadataItem) => {
    setSelectedItem(item);
    form.setFieldsValue({
      name: item.name,
      description: item.description,
      tags: item.tags,
      status: item.status
    });
    setEditVisible(true);
  };

  const handleDelete = async (item: MetadataItem) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('删除成功');
      loadData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSync = (item?: MetadataItem) => {
    if (item) {
      syncForm.setFieldsValue({
        targetPath: item.path
      });
    }
    setSyncVisible(true);
  };

  const handleBatchSync = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要同步的项目');
      return;
    }

    Modal.confirm({
      title: '批量同步',
      content: `确定要同步选中的 ${selectedRowKeys.length} 个项目吗？`,
      onOk: async () => {
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 2000));
          message.success('批量同步已启动');
          setSelectedRowKeys([]);
          loadData();
        } catch (error) {
          message.error('批量同步失败');
        }
      }
    });
  };

  const handleExport = () => {
    message.info('导出功能开发中');
  };

  const handleImport = () => {
    message.info('导入功能开发中');
  };

  const metadataColumns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string, record: MetadataItem) => (
        <Space direction="vertical" size={0}>
          <Space>
            {record.type === 'database' && <DatabaseOutlined style={{ color: '#1890ff' }} />}
            {record.type === 'schema' && <FolderOutlined style={{ color: '#52c41a' }} />}
            {record.type === 'table' && <TableOutlined style={{ color: '#fa8c16' }} />}
            {record.type === 'view' && <EyeOutlined style={{ color: '#722ed1' }} />}
            <Text strong>{text}</Text>
          </Space>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.path}</Text>
        </Space>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const typeMap = {
          database: { color: 'blue', text: '数据库' },
          schema: { color: 'green', text: '模式' },
          table: { color: 'orange', text: '表' },
          view: { color: 'purple', text: '视图' },
          column: { color: 'cyan', text: '字段' },
          index: { color: 'geekblue', text: '索引' },
          constraint: { color: 'magenta', text: '约束' }
        };
        const config = typeMap[type as keyof typeof typeMap] || { color: 'default', text: type };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap = {
          active: { color: 'green', text: '活跃' },
          inactive: { color: 'orange', text: '非活跃' },
          deprecated: { color: 'red', text: '已废弃' },
          pending: { color: 'blue', text: '待处理' }
        };
        const config = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '同步状态',
      dataIndex: 'syncStatus',
      key: 'syncStatus',
      width: 120,
      render: (status: string, record: MetadataItem) => {
        const statusMap = {
          success: { color: 'green', icon: <CheckCircleOutlined />, text: '成功' },
          failed: { color: 'red', icon: <ExclamationCircleOutlined />, text: '失败' },
          syncing: { color: 'blue', icon: <SyncOutlined spin />, text: '同步中' },
          pending: { color: 'orange', icon: <ClockCircleOutlined />, text: '待同步' }
        };
        const config = statusMap[status as keyof typeof statusMap] || { color: 'default', icon: null, text: status };
        return (
          <Space>
            <Tag color={config.color} icon={config.icon}>{config.text}</Tag>
            <Text type="secondary" style={{ fontSize: '11px' }}>{record.lastSyncTime}</Text>
          </Space>
        );
      }
    },
    {
      title: '负责人',
      dataIndex: 'owner',
      key: 'owner',
      width: 100,
      render: (owner: string) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <Text>{owner}</Text>
        </Space>
      )
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 200,
      render: (tags: string[]) => (
        <Space wrap>
          {tags.slice(0, 3).map(tag => (
            <Tag key={tag} style={{ margin: '2px' }}>{tag}</Tag>
          ))}
          {tags.length > 3 && (
            <Tooltip title={tags.slice(3).join(', ')}>
              <Tag>+{tags.length - 3}</Tag>
            </Tooltip>
          )}
        </Space>
      )
    },
    {
      title: '属性',
      key: 'properties',
      width: 150,
      render: (record: MetadataItem) => (
        <Space direction="vertical" size={0}>
          {record.properties.rowCount && (
            <Text type="secondary" style={{ fontSize: '11px' }}>行数: {record.properties.rowCount.toLocaleString()}</Text>
          )}
          {record.properties.dataSize && (
            <Text type="secondary" style={{ fontSize: '11px' }}>大小: {record.properties.dataSize}</Text>
          )}
          {record.properties.columns && (
            <Text type="secondary" style={{ fontSize: '11px' }}>字段: {record.properties.columns}</Text>
          )}
        </Space>
      )
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 150,
      render: (time: string) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: '12px' }}>{time}</Text>
        </Space>
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right' as const,
      render: (record: MetadataItem) => (
        <Space>
          <Tooltip title="查看详情">
            <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)} />
          </Tooltip>
          <Tooltip title="编辑">
            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title="同步">
            <Button type="text" size="small" icon={<SyncOutlined />} onClick={() => handleSync(record)} />
          </Tooltip>
          <Popconfirm title="确定要删除吗？" onConfirm={() => handleDelete(record)}>
            <Tooltip title="删除">
              <Button type="text" size="small" icon={<DeleteOutlined />} danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const changeColumns = [
    {
      title: '变更时间',
      dataIndex: 'changeTime',
      key: 'changeTime',
      width: 150
    },
    {
      title: '变更类型',
      dataIndex: 'changeType',
      key: 'changeType',
      width: 100,
      render: (type: string) => {
        const typeMap = {
          create: { color: 'green', text: '新增' },
          update: { color: 'blue', text: '更新' },
          delete: { color: 'red', text: '删除' },
          rename: { color: 'orange', text: '重命名' },
          move: { color: 'purple', text: '移动' }
        };
        const config = typeMap[type as keyof typeof typeMap] || { color: 'default', text: type };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '对象',
      key: 'object',
      width: 200,
      render: (record: MetadataChange) => {
        const item = metadataItems.find(item => item.id === record.metadataId);
        return item ? (
          <Space>
            <TableOutlined style={{ color: '#fa8c16' }} />
            <Text>{item.name}</Text>
          </Space>
        ) : (
          <Text type="secondary">未知对象</Text>
        );
      }
    },
    {
      title: '字段',
      dataIndex: 'fieldName',
      key: 'fieldName',
      width: 120,
      render: (field: string) => field ? <Text code>{field}</Text> : <Text type="secondary">-</Text>
    },
    {
      title: '变更内容',
      key: 'change',
      render: (record: MetadataChange) => (
        <Space direction="vertical" size={0}>
          {record.oldValue && (
            <Text type="secondary" style={{ fontSize: '11px' }}>旧值: {JSON.stringify(record.oldValue)}</Text>
          )}
          {record.newValue && (
            <Text style={{ fontSize: '11px' }}>新值: {JSON.stringify(record.newValue)}</Text>
          )}
          <Text style={{ fontSize: '12px' }}>{record.description}</Text>
        </Space>
      )
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 100,
      render: (operator: string) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <Text>{operator}</Text>
        </Space>
      )
    },
    {
      title: '审批状态',
      key: 'approval',
      width: 120,
      render: (record: MetadataChange) => (
        <Space direction="vertical" size={0}>
          <Tag color={record.approved ? 'green' : 'orange'}>
            {record.approved ? '已审批' : '待审批'}
          </Tag>
          {record.approved && record.approver && (
            <Text type="secondary" style={{ fontSize: '11px' }}>审批人: {record.approver}</Text>
          )}
        </Space>
      )
    }
  ];

  const syncTaskColumns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      width: 200
    },
    {
      title: '数据源',
      key: 'source',
      width: 150,
      render: (record: SyncTask) => (
        <Space direction="vertical" size={0}>
          <Tag color="blue">{record.sourceType.toUpperCase()}</Tag>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {record.sourceConfig.host}:{record.sourceConfig.port}
          </Text>
        </Space>
      )
    },
    {
      title: '目标路径',
      dataIndex: 'targetPath',
      key: 'targetPath',
      width: 200,
      render: (path: string) => <Text code>{path}</Text>
    },
    {
      title: '调度',
      dataIndex: 'schedule',
      key: 'schedule',
      width: 120,
      render: (schedule: string) => <Text code>{schedule}</Text>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap = {
          running: { color: 'blue', icon: <SyncOutlined spin />, text: '运行中' },
          stopped: { color: 'orange', icon: <ClockCircleOutlined />, text: '已停止' },
          failed: { color: 'red', icon: <ExclamationCircleOutlined />, text: '失败' },
          completed: { color: 'green', icon: <CheckCircleOutlined />, text: '完成' }
        };
        const config = statusMap[status as keyof typeof statusMap] || { color: 'default', icon: null, text: status };
        return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>;
      }
    },
    {
      title: '执行统计',
      key: 'stats',
      width: 150,
      render: (record: SyncTask) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: '11px' }}>成功: {record.successCount}</Text>
          <Text style={{ fontSize: '11px' }}>失败: {record.failedCount}</Text>
          <Text style={{ fontSize: '11px' }}>总计: {record.totalCount}</Text>
        </Space>
      )
    },
    {
      title: '最后运行',
      dataIndex: 'lastRunTime',
      key: 'lastRunTime',
      width: 150,
      render: (time: string) => <Text style={{ fontSize: '12px' }}>{time}</Text>
    },
    {
      title: '下次运行',
      dataIndex: 'nextRunTime',
      key: 'nextRunTime',
      width: 150,
      render: (time: string) => <Text style={{ fontSize: '12px' }}>{time}</Text>
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      fixed: 'right' as const,
      render: (record: SyncTask) => (
        <Space>
          <Tooltip title="编辑">
            <Button type="text" size="small" icon={<EditOutlined />} />
          </Tooltip>
          <Tooltip title="立即执行">
            <Button type="text" size="small" icon={<SyncOutlined />} />
          </Tooltip>
          <Popconfirm title="确定要删除吗？">
            <Tooltip title="删除">
              <Button type="text" size="small" icon={<DeleteOutlined />} danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as string[]),
    getCheckboxProps: (record: MetadataItem) => ({
      disabled: record.status === 'deprecated'
    })
  };

  return (
    <div className="metadata-management">
      <Row gutter={24}>
        {/* 左侧目录树 */}
        <Col span={6}>
          <Card title="元数据目录" size="small" className="tree-card">
            <Tree
              showIcon
              defaultExpandedKeys={expandedKeys}
              selectedKeys={selectedKeys}
              onSelect={(keys) => setSelectedKeys(keys as string[])}
              onExpand={(keys) => setExpandedKeys(keys as string[])}
              treeData={mockTreeData}
            />
          </Card>
        </Col>

        {/* 右侧内容区 */}
        <Col span={18}>
          <Card>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              {/* 元数据目录标签页 */}
              <TabPane tab="元数据目录" key="catalog">
                {/* 搜索和过滤区 */}
                <Card size="small" style={{ marginBottom: 16 }}>
                  <Row gutter={16} align="middle">
                    <Col flex="auto">
                      <Search
                        placeholder="搜索名称、描述、路径..."
                        allowClear
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onSearch={handleSearch}
                        style={{ width: '100%' }}
                      />
                    </Col>
                    <Col>
                      <Space>
                        <Select
                          mode="multiple"
                          placeholder="类型"
                          value={filters.type}
                          onChange={(value) => handleFilterChange('type', value)}
                          style={{ width: 120 }}
                        >
                          <Option value="database">数据库</Option>
                          <Option value="schema">模式</Option>
                          <Option value="table">表</Option>
                          <Option value="view">视图</Option>
                        </Select>
                        <Select
                          mode="multiple"
                          placeholder="状态"
                          value={filters.status}
                          onChange={(value) => handleFilterChange('status', value)}
                          style={{ width: 120 }}
                        >
                          <Option value="active">活跃</Option>
                          <Option value="inactive">非活跃</Option>
                          <Option value="deprecated">已废弃</Option>
                          <Option value="pending">待处理</Option>
                        </Select>
                        <Select
                          mode="multiple"
                          placeholder="同步状态"
                          value={filters.syncStatus}
                          onChange={(value) => handleFilterChange('syncStatus', value)}
                          style={{ width: 120 }}
                        >
                          <Option value="success">成功</Option>
                          <Option value="failed">失败</Option>
                          <Option value="syncing">同步中</Option>
                          <Option value="pending">待同步</Option>
                        </Select>
                        <Button icon={<FilterOutlined />} onClick={handleResetFilters}>
                          重置
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </Card>

                {/* 操作按钮区 */}
                <Card size="small" style={{ marginBottom: 16 }}>
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Space>
                        <Button type="primary" icon={<PlusOutlined />}>
                          新增
                        </Button>
                        <Button icon={<SyncOutlined />} onClick={handleBatchSync} disabled={selectedRowKeys.length === 0}>
                          批量同步
                        </Button>
                        <Button icon={<ExportOutlined />} onClick={handleExport}>
                          导出
                        </Button>
                        <Button icon={<ImportOutlined />} onClick={handleImport}>
                          导入
                        </Button>
                      </Space>
                    </Col>
                    <Col>
                      <Space>
                        <Text type="secondary">
                          显示 {filteredItems.length} / {metadataItems.length} 项
                        </Text>
                        <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>
                          刷新
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </Card>

                {/* 数据表格 */}
                <Card>
                  <Table
                    columns={metadataColumns}
                    dataSource={filteredItems}
                    rowKey="id"
                    rowSelection={rowSelection}
                    loading={loading}
                    size="small"
                    pagination={{
                      ...pagination,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                      onChange: (page, pageSize) => setPagination(prev => ({ ...prev, current: page, pageSize }))
                    }}
                    scroll={{ x: 1400 }}
                  />
                </Card>
              </TabPane>

              {/* 变更记录标签页 */}
              <TabPane tab={`变更记录 (${changes.length})`} key="changes">
                <Card>
                  <Table
                    columns={changeColumns}
                    dataSource={changes}
                    rowKey="id"
                    size="small"
                    pagination={{
                      pageSize: 20,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
                    }}
                    scroll={{ x: 1200 }}
                  />
                </Card>
              </TabPane>

              {/* 同步任务标签页 */}
              <TabPane tab={`同步任务 (${syncTasks.length})`} key="sync">
                <Card size="small" style={{ marginBottom: 16 }}>
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Space>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleSync()}>
                          新建任务
                        </Button>
                        <Button icon={<SyncOutlined />}>
                          批量执行
                        </Button>
                      </Space>
                    </Col>
                    <Col>
                      <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>
                        刷新
                      </Button>
                    </Col>
                  </Row>
                </Card>

                <Card>
                  <Table
                    columns={syncTaskColumns}
                    dataSource={syncTasks}
                    rowKey="id"
                    size="small"
                    pagination={{
                      pageSize: 20,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
                    }}
                    scroll={{ x: 1400 }}
                  />
                </Card>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      {/* 详情抽屉 */}
      <Drawer
        title="元数据详情"
        placement="right"
        width={600}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
      >
        {selectedItem && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Descriptions title="基本信息" column={1} size="small">
              <Descriptions.Item label="名称">{selectedItem.name}</Descriptions.Item>
              <Descriptions.Item label="类型">{selectedItem.type}</Descriptions.Item>
              <Descriptions.Item label="路径">{selectedItem.path}</Descriptions.Item>
              <Descriptions.Item label="描述">{selectedItem.description}</Descriptions.Item>
              <Descriptions.Item label="负责人">{selectedItem.owner}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={selectedItem.status === 'active' ? 'green' : 'orange'}>
                  {selectedItem.status === 'active' ? '活跃' : '非活跃'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="版本">{selectedItem.version}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{selectedItem.createTime}</Descriptions.Item>
              <Descriptions.Item label="更新时间">{selectedItem.updateTime}</Descriptions.Item>
              <Descriptions.Item label="最后同步">{selectedItem.lastSyncTime}</Descriptions.Item>
            </Descriptions>

            <Descriptions title="属性信息" column={1} size="small">
              {Object.entries(selectedItem.properties).map(([key, value]) => (
                <Descriptions.Item key={key} label={key}>
                  {typeof value === 'number' ? value.toLocaleString() : String(value)}
                </Descriptions.Item>
              ))}
            </Descriptions>

            <div>
              <Title level={5}>标签</Title>
              <Space wrap>
                {selectedItem.tags.map(tag => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </Space>
            </div>
          </Space>
        )}
      </Drawer>

      {/* 编辑模态框 */}
      <Modal
        title="编辑元数据"
        open={editVisible}
        onCancel={() => setEditVisible(false)}
        onOk={() => {
          form.validateFields().then(values => {
            console.log('编辑表单值:', values);
            message.success('保存成功');
            setEditVisible(false);
            loadData();
          });
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item label="标签" name="tags">
            <Select mode="tags" placeholder="输入标签" />
          </Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}>
            <Select>
              <Option value="active">活跃</Option>
              <Option value="inactive">非活跃</Option>
              <Option value="deprecated">已废弃</Option>
              <Option value="pending">待处理</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 同步任务模态框 */}
      <Modal
        title="同步任务配置"
        open={syncVisible}
        onCancel={() => setSyncVisible(false)}
        onOk={() => {
          syncForm.validateFields().then(values => {
            console.log('同步任务配置:', values);
            message.success('同步任务创建成功');
            setSyncVisible(false);
            loadData();
          });
        }}
        width={800}
      >
        <Form form={syncForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="任务名称" name="name" rules={[{ required: true, message: '请输入任务名称' }]}>
                <Input placeholder="输入任务名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="数据源类型" name="sourceType" rules={[{ required: true, message: '请选择数据源类型' }]}>
                <Select placeholder="选择数据源类型">
                  <Option value="mysql">MySQL</Option>
                  <Option value="postgresql">PostgreSQL</Option>
                  <Option value="oracle">Oracle</Option>
                  <Option value="sqlserver">SQL Server</Option>
                  <Option value="hive">Hive</Option>
                  <Option value="spark">Spark</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="主机地址" name="host" rules={[{ required: true, message: '请输入主机地址' }]}>
                <Input placeholder="输入主机地址" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="端口" name="port" rules={[{ required: true, message: '请输入端口' }]}>
                <Input placeholder="输入端口" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="数据库" name="database" rules={[{ required: true, message: '请输入数据库名' }]}>
                <Input placeholder="输入数据库名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                <Input placeholder="输入用户名" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password placeholder="输入密码" />
          </Form.Item>
          <Form.Item label="目标路径" name="targetPath" rules={[{ required: true, message: '请输入目标路径' }]}>
            <Input placeholder="输入目标路径" />
          </Form.Item>
          <Form.Item label="调度表达式" name="schedule" rules={[{ required: true, message: '请输入调度表达式' }]}>
            <Input placeholder="输入Cron表达式，如：0 2 * * *" />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <TextArea rows={3} placeholder="输入任务描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Metadata;