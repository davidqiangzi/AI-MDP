import React, { useState, useEffect, useRef } from 'react';
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
  Steps,
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
  Radio,
  Tabs,
  Progress,
  Alert,
  Divider,
  Collapse,
  List,
  Avatar
} from 'antd';
import {
  SearchOutlined,
  BranchesOutlined,
  NodeIndexOutlined,
  ShareAltOutlined,
  ClockCircleOutlined,
  UserOutlined,
  DatabaseOutlined,
  TableOutlined,
  ApiOutlined,
  FileTextOutlined,
  LineChartOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  DownloadOutlined,
  ReloadOutlined,
  SettingOutlined,
  FilterOutlined,
  FullscreenOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  DragOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { DataNode } from 'antd/es/tree';
import './index.css';

const { Content } = Layout;
const { Option } = Select;
const { Search } = Input;
const { Step } = Steps;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;

interface LineageNode {
  id: string;
  name: string;
  type: 'table' | 'view' | 'job' | 'report' | 'api' | 'dashboard' | 'field';
  database: string;
  schema: string;
  owner: string;
  level: number;
  position: { x: number; y: number };
  status: 'active' | 'inactive' | 'deprecated';
  lastModified: string;
  description: string;
  metadata: Record<string, any>;
  businessTerms: string[];
  dataQuality: number;
  usage: number;
}

interface LineageEdge {
  id: string;
  source: string;
  target: string;
  type: 'data_flow' | 'dependency' | 'transformation';
  label: string;
  transformationLogic?: string;
  dataVolume?: number;
  frequency: string;
  lastExecuted: string;
  status: 'active' | 'inactive' | 'error';
}

interface TrackingPath {
  id: string;
  name: string;
  sourceNode: string;
  targetNode: string;
  path: string[];
  pathType: 'upstream' | 'downstream' | 'bidirectional';
  depth: number;
  totalNodes: number;
  createdTime: string;
  description: string;
  tags: string[];
}

interface TrackingSession {
  id: string;
  name: string;
  startNode: string;
  trackingType: 'impact' | 'origin' | 'full';
  maxDepth: number;
  includeInactive: boolean;
  createdTime: string;
  status: 'active' | 'completed' | 'paused';
  progress: number;
  results: {
    totalNodes: number;
    totalEdges: number;
    upstreamNodes: number;
    downstreamNodes: number;
  };
}

const LineageTracking: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [nodes, setNodes] = useState<LineageNode[]>([]);
  const [edges, setEdges] = useState<LineageEdge[]>([]);
  const [trackingPaths, setTrackingPaths] = useState<TrackingPath[]>([]);
  const [trackingSessions, setTrackingSessions] = useState<TrackingSession[]>([]);
  const [selectedNode, setSelectedNode] = useState<LineageNode | null>(null);
  const [selectedPath, setSelectedPath] = useState<TrackingPath | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [pathDrawerVisible, setPathDrawerVisible] = useState(false);
  const [trackingModalVisible, setTrackingModalVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('graph-view');
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [trackingDirection, setTrackingDirection] = useState<'upstream' | 'downstream' | 'both'>('both');
  const [maxDepth, setMaxDepth] = useState(3);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingProgress, setTrackingProgress] = useState(0);
  const [form] = Form.useForm();
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // 模拟数据
  const mockNodes: LineageNode[] = [
    {
      id: 'node_1',
      name: 'customer_profile',
      type: 'table',
      database: 'crm_db',
      schema: 'public',
      owner: '张三',
      level: 0,
      position: { x: 400, y: 200 },
      status: 'active',
      lastModified: '2024-01-15 14:30:00',
      description: '客户档案主表',
      metadata: { rows: 1500000, columns: 25, size: '2.5GB' },
      businessTerms: ['客户', '档案', '个人信息'],
      dataQuality: 95,
      usage: 85
    },
    {
      id: 'node_2',
      name: 'customer_orders',
      type: 'table',
      database: 'order_db',
      schema: 'public',
      owner: '李四',
      level: 1,
      position: { x: 200, y: 100 },
      status: 'active',
      lastModified: '2024-01-14 09:15:00',
      description: '客户订单表',
      metadata: { rows: 5000000, columns: 15, size: '8.2GB' },
      businessTerms: ['订单', '交易', '购买'],
      dataQuality: 92,
      usage: 78
    },
    {
      id: 'node_3',
      name: 'customer_analytics_view',
      type: 'view',
      database: 'analytics_db',
      schema: 'reporting',
      owner: '王五',
      level: -1,
      position: { x: 600, y: 150 },
      status: 'active',
      lastModified: '2024-01-13 16:45:00',
      description: '客户分析视图',
      metadata: { baseTable: 'customer_profile', complexity: 'medium' },
      businessTerms: ['分析', '报表', '统计'],
      dataQuality: 88,
      usage: 65
    },
    {
      id: 'node_4',
      name: 'daily_customer_etl',
      type: 'job',
      database: 'etl_db',
      schema: 'jobs',
      owner: '赵六',
      level: 1,
      position: { x: 400, y: 350 },
      status: 'active',
      lastModified: '2024-01-12 22:00:00',
      description: '每日客户数据ETL作业',
      metadata: { schedule: 'daily', runtime: '45min', success_rate: 98.5 },
      businessTerms: ['ETL', '数据处理', '定时任务'],
      dataQuality: 90,
      usage: 95
    },
    {
      id: 'node_5',
      name: 'customer_dashboard',
      type: 'dashboard',
      database: 'bi_db',
      schema: 'dashboards',
      owner: '钱七',
      level: -2,
      position: { x: 800, y: 200 },
      status: 'active',
      lastModified: '2024-01-11 11:20:00',
      description: '客户数据仪表板',
      metadata: { charts: 12, users: 45, views: 1250 },
      businessTerms: ['仪表板', '可视化', '监控'],
      dataQuality: 85,
      usage: 72
    }
  ];

  const mockEdges: LineageEdge[] = [
    {
      id: 'edge_1',
      source: 'node_2',
      target: 'node_1',
      type: 'data_flow',
      label: '客户ID关联',
      transformationLogic: 'JOIN ON customer_orders.customer_id = customer_profile.id',
      dataVolume: 1500000,
      frequency: 'real-time',
      lastExecuted: '2024-01-15 14:30:00',
      status: 'active'
    },
    {
      id: 'edge_2',
      source: 'node_1',
      target: 'node_3',
      type: 'dependency',
      label: '视图依赖',
      frequency: 'on-demand',
      lastExecuted: '2024-01-15 10:15:00',
      status: 'active'
    },
    {
      id: 'edge_3',
      source: 'node_3',
      target: 'node_5',
      type: 'data_flow',
      label: '数据展示',
      frequency: 'hourly',
      lastExecuted: '2024-01-15 14:00:00',
      status: 'active'
    },
    {
      id: 'edge_4',
      source: 'node_4',
      target: 'node_1',
      type: 'transformation',
      label: 'ETL处理',
      transformationLogic: 'Data cleansing and enrichment',
      dataVolume: 50000,
      frequency: 'daily',
      lastExecuted: '2024-01-15 02:00:00',
      status: 'active'
    }
  ];

  const mockTrackingPaths: TrackingPath[] = [
    {
      id: 'path_1',
      name: '客户数据完整链路',
      sourceNode: 'node_2',
      targetNode: 'node_5',
      path: ['node_2', 'node_1', 'node_3', 'node_5'],
      pathType: 'downstream',
      depth: 3,
      totalNodes: 4,
      createdTime: '2024-01-15 15:30:00',
      description: '从客户订单到仪表板的完整数据流向',
      tags: ['客户', '订单', '分析']
    },
    {
      id: 'path_2',
      name: 'ETL影响路径',
      sourceNode: 'node_4',
      targetNode: 'node_5',
      path: ['node_4', 'node_1', 'node_3', 'node_5'],
      pathType: 'downstream',
      depth: 3,
      totalNodes: 4,
      createdTime: '2024-01-14 10:15:00',
      description: 'ETL作业对下游分析的影响路径',
      tags: ['ETL', '影响分析']
    }
  ];

  const mockTrackingSessions: TrackingSession[] = [
    {
      id: 'session_1',
      name: '客户档案影响分析',
      startNode: 'node_1',
      trackingType: 'impact',
      maxDepth: 5,
      includeInactive: false,
      createdTime: '2024-01-15 16:00:00',
      status: 'completed',
      progress: 100,
      results: {
        totalNodes: 15,
        totalEdges: 23,
        upstreamNodes: 5,
        downstreamNodes: 10
      }
    },
    {
      id: 'session_2',
      name: '订单数据溯源',
      startNode: 'node_2',
      trackingType: 'origin',
      maxDepth: 3,
      includeInactive: true,
      createdTime: '2024-01-14 14:30:00',
      status: 'active',
      progress: 75,
      results: {
        totalNodes: 8,
        totalEdges: 12,
        upstreamNodes: 8,
        downstreamNodes: 0
      }
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
      setNodes(mockNodes);
      setEdges(mockEdges);
      setTrackingPaths(mockTrackingPaths);
      setTrackingSessions(mockTrackingSessions);
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
      dashboard: <LineChartOutlined />,
      field: <NodeIndexOutlined />
    };
    return icons[type as keyof typeof icons] || <TableOutlined />;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'green',
      inactive: 'orange',
      deprecated: 'red',
      error: 'red',
      completed: 'green',
      paused: 'orange'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getEdgeColor = (type: string) => {
    const colors = {
      data_flow: '#1890ff',
      dependency: '#52c41a',
      transformation: '#722ed1'
    };
    return colors[type as keyof typeof colors] || '#d9d9d9';
  };

  const handleNodeClick = (node: LineageNode) => {
    setSelectedNode(node);
    setDrawerVisible(true);
  };

  const handleStartTracking = (node: LineageNode) => {
    setSelectedNode(node);
    setTrackingModalVisible(true);
  };

  const executeTracking = async (values: any) => {
    setIsTracking(true);
    setTrackingProgress(0);
    
    try {
      // 模拟追踪过程
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setTrackingProgress(i);
      }
      
      message.success('血缘追踪完成');
      setTrackingModalVisible(false);
      
      // 创建新的追踪会话
      const newSession: TrackingSession = {
        id: `session_${Date.now()}`,
        name: values.sessionName || `${selectedNode?.name} 追踪`,
        startNode: selectedNode?.id || '',
        trackingType: values.trackingType,
        maxDepth: values.maxDepth,
        includeInactive: values.includeInactive,
        createdTime: new Date().toLocaleString(),
        status: 'completed',
        progress: 100,
        results: {
          totalNodes: Math.floor(Math.random() * 20) + 5,
          totalEdges: Math.floor(Math.random() * 30) + 10,
          upstreamNodes: Math.floor(Math.random() * 10) + 2,
          downstreamNodes: Math.floor(Math.random() * 15) + 3
        }
      };
      
      setTrackingSessions(prev => [newSession, ...prev]);
    } catch (error) {
      message.error('追踪失败');
    } finally {
      setIsTracking(false);
      setTrackingProgress(0);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.3));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const renderLineageGraph = () => {
    const svgWidth = 1200;
    const svgHeight = 600;
    
    return (
      <div className="lineage-graph-container">
        <div className="graph-controls">
          <Space>
            <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} />
            <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} />
            <Button onClick={handleResetView}>重置视图</Button>
            <Button icon={<FullscreenOutlined />}>全屏</Button>
          </Space>
        </div>
        
        <svg
          ref={svgRef}
          width={svgWidth}
          height={svgHeight}
          className="lineage-graph-svg"
          style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}
        >
          {/* 网格背景 */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* 渲染边 */}
          {edges.map(edge => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;
            
            return (
              <g key={edge.id}>
                <line
                  x1={sourceNode.position.x}
                  y1={sourceNode.position.y}
                  x2={targetNode.position.x}
                  y2={targetNode.position.y}
                  stroke={getEdgeColor(edge.type)}
                  strokeWidth={2}
                  markerEnd="url(#arrowhead)"
                  className={`edge edge-${edge.type}`}
                />
                <text
                  x={(sourceNode.position.x + targetNode.position.x) / 2}
                  y={(sourceNode.position.y + targetNode.position.y) / 2 - 5}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#666"
                >
                  {edge.label}
                </text>
              </g>
            );
          })}
          
          {/* 箭头标记 */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#666"
              />
            </marker>
          </defs>
          
          {/* 渲染节点 */}
          {nodes.map(node => (
            <g
              key={node.id}
              className="lineage-node"
              onClick={() => handleNodeClick(node)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={node.position.x}
                cy={node.position.y}
                r={30}
                fill={node.status === 'active' ? '#1890ff' : 
                      node.status === 'inactive' ? '#faad14' : '#ff4d4f'}
                stroke="#fff"
                strokeWidth={3}
                className="node-circle"
              />
              <text
                x={node.position.x}
                y={node.position.y + 5}
                textAnchor="middle"
                fontSize="14"
                fill="#fff"
                className="node-icon"
              >
                {getTypeIcon(node.type)}
              </text>
              <text
                x={node.position.x}
                y={node.position.y + 50}
                textAnchor="middle"
                fontSize="12"
                fill="#262626"
                className="node-label"
              >
                {node.name}
              </text>
            </g>
          ))}
        </svg>
        
        {/* 图例 */}
        <div className="graph-legend">
          <h4>图例</h4>
          <div className="legend-section">
            <div className="legend-title">节点类型</div>
            {[
              { type: 'table', label: '数据表', color: '#1890ff' },
              { type: 'view', label: '视图', color: '#52c41a' },
              { type: 'job', label: '作业', color: '#722ed1' },
              { type: 'dashboard', label: '仪表板', color: '#fa8c16' }
            ].map(item => (
              <div key={item.type} className="legend-item">
                <div className="legend-color" style={{ backgroundColor: item.color }} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          <div className="legend-section">
            <div className="legend-title">连接类型</div>
            {[
              { type: 'data_flow', label: '数据流', color: '#1890ff' },
              { type: 'dependency', label: '依赖关系', color: '#52c41a' },
              { type: 'transformation', label: '转换关系', color: '#722ed1' }
            ].map(item => (
              <div key={item.type} className="legend-item">
                <div className="legend-line" style={{ backgroundColor: item.color }} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const pathColumns: ColumnsType<TrackingPath> = [
    {
      title: '路径名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Button
          type="link"
          onClick={() => {
            setSelectedPath(record);
            setPathDrawerVisible(true);
          }}
        >
          {text}
        </Button>
      )
    },
    {
      title: '起始节点',
      dataIndex: 'sourceNode',
      key: 'sourceNode',
      render: (nodeId) => {
        const node = nodes.find(n => n.id === nodeId);
        return node ? (
          <Space>
            {getTypeIcon(node.type)}
            {node.name}
          </Space>
        ) : nodeId;
      }
    },
    {
      title: '目标节点',
      dataIndex: 'targetNode',
      key: 'targetNode',
      render: (nodeId) => {
        const node = nodes.find(n => n.id === nodeId);
        return node ? (
          <Space>
            {getTypeIcon(node.type)}
            {node.name}
          </Space>
        ) : nodeId;
      }
    },
    {
      title: '路径类型',
      dataIndex: 'pathType',
      key: 'pathType',
      render: (type) => (
        <Tag color={type === 'upstream' ? 'blue' : type === 'downstream' ? 'green' : 'orange'}>
          {type === 'upstream' ? '上游' : type === 'downstream' ? '下游' : '双向'}
        </Tag>
      )
    },
    {
      title: '深度',
      dataIndex: 'depth',
      key: 'depth',
      render: (depth) => <Badge count={depth} style={{ backgroundColor: '#52c41a' }} />
    },
    {
      title: '节点数',
      dataIndex: 'totalNodes',
      key: 'totalNodes',
      render: (count) => <Badge count={count} style={{ backgroundColor: '#1890ff' }} />
    },
    {
      title: '创建时间',
      dataIndex: 'createdTime',
      key: 'createdTime',
      render: (time) => (
        <Tooltip title={time}>
          <Space>
            <ClockCircleOutlined />
            {time.split(' ')[0]}
          </Space>
        </Tooltip>
      )
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags) => (
        <Space wrap>
          {tags.map((tag: string) => (
            <Tag key={tag} color="blue">{tag}</Tag>
          ))}
        </Space>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedPath(record);
              setPathDrawerVisible(true);
            }}
          >
            查看
          </Button>
          <Button
            type="text"
            icon={<ShareAltOutlined />}
            onClick={() => message.success('路径已复制到剪贴板')}
          >
            分享
          </Button>
        </Space>
      )
    }
  ];

  const sessionColumns: ColumnsType<TrackingSession> = [
    {
      title: '会话名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '起始节点',
      dataIndex: 'startNode',
      key: 'startNode',
      render: (nodeId) => {
        const node = nodes.find(n => n.id === nodeId);
        return node ? (
          <Space>
            {getTypeIcon(node.type)}
            {node.name}
          </Space>
        ) : nodeId;
      }
    },
    {
      title: '追踪类型',
      dataIndex: 'trackingType',
      key: 'trackingType',
      render: (type) => (
        <Tag color={type === 'impact' ? 'red' : type === 'origin' ? 'blue' : 'green'}>
          {type === 'impact' ? '影响分析' : type === 'origin' ? '数据溯源' : '完整追踪'}
        </Tag>
      )
    },
    {
      title: '最大深度',
      dataIndex: 'maxDepth',
      key: 'maxDepth',
      render: (depth) => <Badge count={depth} style={{ backgroundColor: '#722ed1' }} />
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <div>
          <Tag color={getStatusColor(status)}>
            {status === 'active' ? '进行中' : status === 'completed' ? '已完成' : '已暂停'}
          </Tag>
          {status === 'active' && (
            <Progress percent={record.progress} size="small" style={{ marginTop: 4 }} />
          )}
        </div>
      )
    },
    {
      title: '结果统计',
      key: 'results',
      render: (_, record) => (
        <div>
          <div>节点: {record.results.totalNodes}</div>
          <div>边: {record.results.totalEdges}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            上游: {record.results.upstreamNodes} | 下游: {record.results.downstreamNodes}
          </div>
        </div>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdTime',
      key: 'createdTime',
      render: (time) => (
        <Tooltip title={time}>
          <Space>
            <ClockCircleOutlined />
            {time.split(' ')[0]}
          </Space>
        </Tooltip>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => message.info('查看会话详情')}
          >
            查看
          </Button>
          {record.status === 'active' && (
            <Button
              type="text"
              icon={<PauseCircleOutlined />}
              onClick={() => message.success('会话已暂停')}
            >
              暂停
            </Button>
          )}
          {record.status === 'paused' && (
            <Button
              type="text"
              icon={<PlayCircleOutlined />}
              onClick={() => message.success('会话已恢复')}
            >
              恢复
            </Button>
          )}
        </Space>
      )
    }
  ];

  const renderPathSteps = () => {
    if (!selectedPath) return null;
    
    const pathNodes = selectedPath.path.map(nodeId => 
      nodes.find(n => n.id === nodeId)
    ).filter(Boolean) as LineageNode[];
    
    return (
      <Steps direction="vertical" size="small">
        {pathNodes.map((node, index) => (
          <Step
            key={node.id}
            title={node.name}
            description={`${node.database}.${node.schema}`}
            status={node.status === 'active' ? 'finish' : 'error'}
            icon={getTypeIcon(node.type)}
          />
        ))}
      </Steps>
    );
  };

  return (
    <div className="lineage-tracking-page">
      <Layout>
        <Content>
          {/* 页面头部 */}
          <Card className="page-header">
            <Row justify="space-between" align="middle">
              <Col>
                <h2>血缘追踪</h2>
                <p>追踪数据流向和依赖关系，分析数据血缘路径</p>
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
                  title="总节点数"
                  value={nodes.length}
                  prefix={<NodeIndexOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="连接关系"
                  value={edges.length}
                  prefix={<BranchesOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="追踪路径"
                  value={trackingPaths.length}
                  prefix={<ShareAltOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="活跃会话"
                  value={trackingSessions.filter(s => s.status === 'active').length}
                  prefix={<PlayCircleOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
          </Row>

          {/* 主要内容 */}
          <Card>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="血缘图谱" key="graph-view">
                {/* 控制面板 */}
                <Card className="control-panel" style={{ marginBottom: 16 }}>
                  <Row gutter={16} align="middle">
                    <Col span={6}>
                      <Search
                        placeholder="搜索节点名称"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        allowClear
                      />
                    </Col>
                    <Col span={4}>
                      <Select
                        placeholder="节点类型"
                        value={filterType}
                        onChange={setFilterType}
                        style={{ width: '100%' }}
                      >
                        <Option value="all">全部类型</Option>
                        <Option value="table">数据表</Option>
                        <Option value="view">视图</Option>
                        <Option value="job">作业</Option>
                        <Option value="dashboard">仪表板</Option>
                      </Select>
                    </Col>
                    <Col span={4}>
                      <Select
                        placeholder="追踪方向"
                        value={trackingDirection}
                        onChange={setTrackingDirection}
                        style={{ width: '100%' }}
                      >
                        <Option value="both">双向</Option>
                        <Option value="upstream">上游</Option>
                        <Option value="downstream">下游</Option>
                      </Select>
                    </Col>
                    <Col span={10}>
                      <Space>
                        <span>深度:</span>
                        <Select
                          value={maxDepth}
                          onChange={setMaxDepth}
                          style={{ width: 80 }}
                        >
                          {[1, 2, 3, 4, 5].map(d => (
                            <Option key={d} value={d}>{d}</Option>
                          ))}
                        </Select>
                        <Switch
                          checked={includeInactive}
                          onChange={setIncludeInactive}
                          checkedChildren="包含非活跃"
                          unCheckedChildren="仅活跃"
                        />
                      </Space>
                    </Col>
                  </Row>
                </Card>

                {/* 血缘图谱 */}
                {renderLineageGraph()}
              </TabPane>

              <TabPane tab="追踪路径" key="tracking-paths">
                <Table
                  columns={pathColumns}
                  dataSource={trackingPaths}
                  rowKey="id"
                  loading={loading}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
                  }}
                />
              </TabPane>

              <TabPane tab="追踪会话" key="tracking-sessions">
                <div style={{ marginBottom: 16 }}>
                  <Button
                    type="primary"
                    icon={<BranchesOutlined />}
                    onClick={() => setTrackingModalVisible(true)}
                  >
                    新建追踪会话
                  </Button>
                </div>
                
                <Table
                  columns={sessionColumns}
                  dataSource={trackingSessions}
                  rowKey="id"
                  loading={loading}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
                  }}
                />
              </TabPane>
            </Tabs>
          </Card>
        </Content>
      </Layout>

      {/* 节点详情抽屉 */}
      <Drawer
        title="节点详情"
        width={600}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {selectedNode && (
          <div>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="节点名称">
                <Space>
                  {getTypeIcon(selectedNode.type)}
                  {selectedNode.name}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="类型">
                <Tag color="blue">
                  {selectedNode.type === 'table' ? '数据表' :
                   selectedNode.type === 'view' ? '视图' :
                   selectedNode.type === 'job' ? '作业' :
                   selectedNode.type === 'dashboard' ? '仪表板' : selectedNode.type}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="数据库/模式">
                {selectedNode.database} / {selectedNode.schema}
              </Descriptions.Item>
              <Descriptions.Item label="负责人">
                <Space>
                  <UserOutlined />
                  {selectedNode.owner}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(selectedNode.status)}>
                  {selectedNode.status === 'active' ? '活跃' :
                   selectedNode.status === 'inactive' ? '非活跃' : '已废弃'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="数据质量">
                <Progress
                  percent={selectedNode.dataQuality}
                  strokeColor={selectedNode.dataQuality >= 90 ? '#52c41a' :
                             selectedNode.dataQuality >= 70 ? '#faad14' : '#ff4d4f'}
                />
              </Descriptions.Item>
              <Descriptions.Item label="使用频率">
                <Progress
                  percent={selectedNode.usage}
                  strokeColor="#1890ff"
                />
              </Descriptions.Item>
              <Descriptions.Item label="最后修改">
                {selectedNode.lastModified}
              </Descriptions.Item>
              <Descriptions.Item label="描述">
                {selectedNode.description}
              </Descriptions.Item>
            </Descriptions>

            <Card title="元数据信息" style={{ marginTop: 16 }}>
              <Descriptions column={2} size="small">
                {Object.entries(selectedNode.metadata).map(([key, value]) => (
                  <Descriptions.Item key={key} label={key}>
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </Descriptions.Item>
                ))}
              </Descriptions>
            </Card>

            <Card title="业务术语" style={{ marginTop: 16 }}>
              <Space wrap>
                {selectedNode.businessTerms.map(term => (
                  <Tag key={term} color="geekblue">{term}</Tag>
                ))}
              </Space>
            </Card>

            <div style={{ marginTop: 16 }}>
              <Button
                type="primary"
                icon={<BranchesOutlined />}
                onClick={() => handleStartTracking(selectedNode)}
                block
              >
                开始血缘追踪
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* 路径详情抽屉 */}
      <Drawer
        title="追踪路径详情"
        width={500}
        open={pathDrawerVisible}
        onClose={() => setPathDrawerVisible(false)}
      >
        {selectedPath && (
          <div>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="路径名称">
                {selectedPath.name}
              </Descriptions.Item>
              <Descriptions.Item label="路径类型">
                <Tag color={selectedPath.pathType === 'upstream' ? 'blue' : 
                           selectedPath.pathType === 'downstream' ? 'green' : 'orange'}>
                  {selectedPath.pathType === 'upstream' ? '上游追踪' :
                   selectedPath.pathType === 'downstream' ? '下游追踪' : '双向追踪'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="深度">
                {selectedPath.depth}
              </Descriptions.Item>
              <Descriptions.Item label="节点数量">
                {selectedPath.totalNodes}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {selectedPath.createdTime}
              </Descriptions.Item>
              <Descriptions.Item label="描述">
                {selectedPath.description}
              </Descriptions.Item>
            </Descriptions>

            <Card title="路径步骤" style={{ marginTop: 16 }}>
              {renderPathSteps()}
            </Card>

            <Card title="标签" style={{ marginTop: 16 }}>
              <Space wrap>
                {selectedPath.tags.map(tag => (
                  <Tag key={tag} color="blue">{tag}</Tag>
                ))}
              </Space>
            </Card>
          </div>
        )}
      </Drawer>

      {/* 追踪配置模态框 */}
      <Modal
        title="配置血缘追踪"
        open={trackingModalVisible}
        onCancel={() => setTrackingModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setTrackingModalVisible(false)}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isTracking}
            onClick={() => {
              form.validateFields().then(executeTracking);
            }}
          >
            开始追踪
          </Button>
        ]}
      >
        {isTracking && (
          <Alert
            message="正在执行血缘追踪..."
            description={<Progress percent={trackingProgress} />}
            type="info"
            style={{ marginBottom: 16 }}
          />
        )}
        
        <Form form={form} layout="vertical">
          <Form.Item
            name="sessionName"
            label="会话名称"
            rules={[{ required: true, message: '请输入会话名称' }]}
          >
            <Input placeholder="输入追踪会话名称" />
          </Form.Item>
          
          <Form.Item
            name="trackingType"
            label="追踪类型"
            rules={[{ required: true, message: '请选择追踪类型' }]}
          >
            <Radio.Group>
              <Radio value="impact">影响分析</Radio>
              <Radio value="origin">数据溯源</Radio>
              <Radio value="full">完整追踪</Radio>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item
            name="direction"
            label="追踪方向"
            rules={[{ required: true, message: '请选择追踪方向' }]}
          >
            <Select placeholder="选择追踪方向">
              <Option value="upstream">上游追踪</Option>
              <Option value="downstream">下游追踪</Option>
              <Option value="both">双向追踪</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="maxDepth"
            label="最大深度"
            rules={[{ required: true, message: '请选择最大深度' }]}
          >
            <Select placeholder="选择最大深度">
              {[1, 2, 3, 4, 5, 10].map(d => (
                <Option key={d} value={d}>{d === 10 ? '无限制' : `${d}级`}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item name="includeInactive" valuePropName="checked">
            <Switch /> 包含非活跃节点
          </Form.Item>
          
          <Form.Item name="includeMetadata" valuePropName="checked">
            <Switch /> 包含元数据信息
          </Form.Item>
          
          <Form.Item name="realTimeTracking" valuePropName="checked">
            <Switch /> 实时追踪模式
          </Form.Item>
        </Form>
      </Modal>

      {/* 设置抽屉 */}
      <Drawer
        title="追踪设置"
        width={400}
        open={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      >
        <Form layout="vertical">
          <h4>显示设置</h4>
          <Form.Item>
            <Switch defaultChecked /> 显示节点标签
          </Form.Item>
          <Form.Item>
            <Switch defaultChecked /> 显示连接标签
          </Form.Item>
          <Form.Item>
            <Switch defaultChecked /> 显示元数据
          </Form.Item>
          
          <h4>追踪设置</h4>
          <Form.Item label="默认最大深度">
            <Select defaultValue={3}>
              {[1, 2, 3, 4, 5].map(d => (
                <Option key={d} value={d}>{d}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Switch /> 自动保存追踪路径
          </Form.Item>
          <Form.Item>
            <Switch /> 启用实时更新
          </Form.Item>
          
          <h4>性能设置</h4>
          <Form.Item label="最大节点数">
            <Input placeholder="1000" suffix="个" />
          </Form.Item>
          <Form.Item>
            <Switch defaultChecked /> 启用缓存
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default LineageTracking;