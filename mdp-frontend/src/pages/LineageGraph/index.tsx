import React, { useState, useEffect, useRef } from 'react';
import {
  Layout,
  Card,
  Row,
  Col,
  Input,
  Select,
  Button,
  Space,
  Tooltip,
  Drawer,
  Descriptions,
  Tag,
  Tree,
  Tabs,
  Table,
  message,
  Switch,
  Slider,
  Divider
} from 'antd';
import {
  SearchOutlined,
  FullscreenOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ReloadOutlined,
  SettingOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  FilterOutlined,
  EyeOutlined,
  NodeIndexOutlined,
  BranchesOutlined
} from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { setBreadcrumbs } from '../../store/slices/uiSlice';
import './index.css';

const { Content } = Layout;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface LineageNode {
  id: string;
  name: string;
  type: 'table' | 'view' | 'field' | 'job' | 'report' | 'api';
  database?: string;
  schema?: string;
  description: string;
  owner: string;
  businessDomain: string;
  dataLayer: string;
  status: 'active' | 'inactive' | 'deprecated';
  level: number;
  x: number;
  y: number;
  children?: string[];
  parents?: string[];
  metadata?: Record<string, any>;
}

interface LineageEdge {
  id: string;
  source: string;
  target: string;
  type: 'data_flow' | 'dependency' | 'transformation';
  description?: string;
  transformationLogic?: string;
  updateFrequency?: string;
  lastUpdateTime?: string;
}

interface LineageGraph {
  nodes: LineageNode[];
  edges: LineageEdge[];
  rootNode: string;
  direction: 'upstream' | 'downstream' | 'both';
  maxDepth: number;
}

interface FilterOptions {
  nodeTypes: string[];
  businessDomains: string[];
  dataLayers: string[];
  status: string[];
  showInactive: boolean;
}

const LineageGraphPage: React.FC = () => {
  const dispatch = useDispatch();
  const svgRef = useRef<SVGSVGElement>(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedNode, setSelectedNode] = useState<LineageNode | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [lineageGraph, setLineageGraph] = useState<LineageGraph | null>(null);
  const [viewMode, setViewMode] = useState<'graph' | 'tree' | 'table'>('graph');
  const [direction, setDirection] = useState<'upstream' | 'downstream' | 'both'>('both');
  const [maxDepth, setMaxDepth] = useState(3);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [filters, setFilters] = useState<FilterOptions>({
    nodeTypes: [],
    businessDomains: [],
    dataLayers: [],
    status: [],
    showInactive: false
  });
  const [settingsVisible, setSettingsVisible] = useState(false);

  // 模拟血缘数据
  const mockLineageData: LineageGraph = {
    nodes: [
      {
        id: 'user_basic_info',
        name: 'user_basic_info',
        type: 'table',
        database: 'user_db',
        schema: 'public',
        description: '用户基础信息表',
        owner: '张三',
        businessDomain: '用户中心',
        dataLayer: 'ODS',
        status: 'active',
        level: 0,
        x: 400,
        y: 300,
        children: ['user_profile_view', 'user_analysis_job'],
        metadata: {
          rowCount: 1000000,
          updateFrequency: 'daily',
          lastUpdateTime: '2024-01-20 02:00:00'
        }
      },
      {
        id: 'user_profile_view',
        name: 'user_profile_view',
        type: 'view',
        database: 'user_db',
        schema: 'public',
        description: '用户画像视图',
        owner: '李四',
        businessDomain: '用户中心',
        dataLayer: 'DWD',
        status: 'active',
        level: 1,
        x: 600,
        y: 200,
        parents: ['user_basic_info'],
        children: ['user_report'],
        metadata: {
          updateFrequency: 'hourly',
          lastUpdateTime: '2024-01-20 15:00:00'
        }
      },
      {
        id: 'user_analysis_job',
        name: 'user_analysis_job',
        type: 'job',
        description: '用户行为分析任务',
        owner: '王五',
        businessDomain: '用户中心',
        dataLayer: 'DWS',
        status: 'active',
        level: 1,
        x: 600,
        y: 400,
        parents: ['user_basic_info', 'user_behavior_log'],
        children: ['user_insight_table'],
        metadata: {
          jobType: 'spark',
          schedule: '0 2 * * *',
          lastRunTime: '2024-01-20 02:30:00'
        }
      },
      {
        id: 'user_behavior_log',
        name: 'user_behavior_log',
        type: 'table',
        database: 'log_db',
        schema: 'public',
        description: '用户行为日志表',
        owner: '赵六',
        businessDomain: '用户中心',
        dataLayer: 'ODS',
        status: 'active',
        level: 0,
        x: 200,
        y: 400,
        children: ['user_analysis_job'],
        metadata: {
          rowCount: 50000000,
          updateFrequency: 'realtime',
          lastUpdateTime: '2024-01-20 16:30:00'
        }
      },
      {
        id: 'user_insight_table',
        name: 'user_insight_table',
        type: 'table',
        database: 'analytics_db',
        schema: 'public',
        description: '用户洞察分析表',
        owner: '王五',
        businessDomain: '用户中心',
        dataLayer: 'ADS',
        status: 'active',
        level: 2,
        x: 800,
        y: 400,
        parents: ['user_analysis_job'],
        children: ['user_dashboard'],
        metadata: {
          rowCount: 100000,
          updateFrequency: 'daily',
          lastUpdateTime: '2024-01-20 03:00:00'
        }
      },
      {
        id: 'user_report',
        name: 'user_report',
        type: 'report',
        description: '用户分析报告',
        owner: '孙七',
        businessDomain: '用户中心',
        dataLayer: 'ADS',
        status: 'active',
        level: 2,
        x: 800,
        y: 200,
        parents: ['user_profile_view'],
        metadata: {
          reportType: 'dashboard',
          updateFrequency: 'daily',
          lastUpdateTime: '2024-01-20 08:00:00'
        }
      },
      {
        id: 'user_dashboard',
        name: 'user_dashboard',
        type: 'report',
        description: '用户数据仪表盘',
        owner: '周八',
        businessDomain: '用户中心',
        dataLayer: 'ADS',
        status: 'active',
        level: 3,
        x: 1000,
        y: 400,
        parents: ['user_insight_table'],
        metadata: {
          reportType: 'realtime_dashboard',
          updateFrequency: 'realtime',
          lastUpdateTime: '2024-01-20 16:35:00'
        }
      }
    ],
    edges: [
      {
        id: 'edge_1',
        source: 'user_basic_info',
        target: 'user_profile_view',
        type: 'data_flow',
        description: '用户基础信息流向用户画像视图',
        transformationLogic: 'SELECT * FROM user_basic_info WHERE status = "active"',
        updateFrequency: 'hourly',
        lastUpdateTime: '2024-01-20 15:00:00'
      },
      {
        id: 'edge_2',
        source: 'user_basic_info',
        target: 'user_analysis_job',
        type: 'dependency',
        description: '用户分析任务依赖用户基础信息',
        updateFrequency: 'daily',
        lastUpdateTime: '2024-01-20 02:30:00'
      },
      {
        id: 'edge_3',
        source: 'user_behavior_log',
        target: 'user_analysis_job',
        type: 'dependency',
        description: '用户分析任务依赖行为日志',
        updateFrequency: 'daily',
        lastUpdateTime: '2024-01-20 02:30:00'
      },
      {
        id: 'edge_4',
        source: 'user_analysis_job',
        target: 'user_insight_table',
        type: 'transformation',
        description: '分析任务生成洞察数据',
        transformationLogic: 'Spark SQL aggregation and ML processing',
        updateFrequency: 'daily',
        lastUpdateTime: '2024-01-20 03:00:00'
      },
      {
        id: 'edge_5',
        source: 'user_profile_view',
        target: 'user_report',
        type: 'data_flow',
        description: '用户画像数据用于报告生成',
        updateFrequency: 'daily',
        lastUpdateTime: '2024-01-20 08:00:00'
      },
      {
        id: 'edge_6',
        source: 'user_insight_table',
        target: 'user_dashboard',
        type: 'data_flow',
        description: '洞察数据展示在仪表盘',
        updateFrequency: 'realtime',
        lastUpdateTime: '2024-01-20 16:35:00'
      }
    ],
    rootNode: 'user_basic_info',
    direction: 'both',
    maxDepth: 3
  };

  useEffect(() => {
    dispatch(setBreadcrumbs([
      { key: 'home', label: '首页', path: '/dashboard' },
      { key: 'lineage', label: '数据血缘', path: '' },
      { key: 'lineage-graph', label: '血缘图谱', path: '' }
    ]));
    loadLineageData();
  }, [dispatch]);

  // 加载血缘数据
  const loadLineageData = async (nodeId?: string) => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLineageGraph(mockLineageData);
    } catch (error) {
      message.error('加载血缘数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 搜索节点
  const handleSearch = (value: string) => {
    setSearchText(value);
    if (value && lineageGraph) {
      const foundNode = lineageGraph.nodes.find(node => 
        node.name.toLowerCase().includes(value.toLowerCase())
      );
      if (foundNode) {
        setSelectedNode(foundNode);
        // 高亮显示找到的节点
        highlightNode(foundNode.id);
      } else {
        message.warning('未找到匹配的节点');
      }
    }
  };

  // 高亮节点
  const highlightNode = (nodeId: string) => {
    // 实现节点高亮逻辑
    console.log('Highlighting node:', nodeId);
  };

  // 节点点击处理
  const handleNodeClick = (node: LineageNode) => {
    setSelectedNode(node);
    setDrawerVisible(true);
  };

  // 缩放控制
  const handleZoom = (type: 'in' | 'out' | 'reset') => {
    switch (type) {
      case 'in':
        setZoomLevel(prev => Math.min(prev + 25, 200));
        break;
      case 'out':
        setZoomLevel(prev => Math.max(prev - 25, 25));
        break;
      case 'reset':
        setZoomLevel(100);
        break;
    }
  };

  // 导出图谱
  const handleExport = () => {
    message.info('导出功能开发中...');
  };

  // 全屏显示
  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  // 获取节点图标
  const getNodeIcon = (type: string) => {
    const iconMap = {
      table: '📊',
      view: '👁️',
      job: '⚙️',
      report: '📈',
      api: '🔌',
      field: '🏷️'
    };
    return iconMap[type as keyof typeof iconMap] || '📄';
  };

  // 获取节点颜色
  const getNodeColor = (type: string, status: string) => {
    if (status === 'deprecated') return '#ff4d4f';
    if (status === 'inactive') return '#faad14';
    
    const colorMap = {
      table: '#1890ff',
      view: '#52c41a',
      job: '#722ed1',
      report: '#fa8c16',
      api: '#13c2c2',
      field: '#eb2f96'
    };
    return colorMap[type as keyof typeof colorMap] || '#666666';
  };

  // 渲染SVG图谱
  const renderGraph = () => {
    if (!lineageGraph) return null;

    const { nodes, edges } = lineageGraph;
    const filteredNodes = nodes.filter(node => {
      if (filters.nodeTypes.length > 0 && !filters.nodeTypes.includes(node.type)) return false;
      if (filters.businessDomains.length > 0 && !filters.businessDomains.includes(node.businessDomain)) return false;
      if (filters.dataLayers.length > 0 && !filters.dataLayers.includes(node.dataLayer)) return false;
      if (filters.status.length > 0 && !filters.status.includes(node.status)) return false;
      if (!filters.showInactive && node.status !== 'active') return false;
      return true;
    });

    const filteredEdges = edges.filter(edge => {
      const sourceExists = filteredNodes.some(node => node.id === edge.source);
      const targetExists = filteredNodes.some(node => node.id === edge.target);
      return sourceExists && targetExists;
    });

    return (
      <svg
        ref={svgRef}
        width="100%"
        height="600px"
        viewBox="0 0 1200 600"
        style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center' }}
        className="lineage-graph-svg"
      >
        {/* 定义箭头标记 */}
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

        {/* 渲染边 */}
        {filteredEdges.map(edge => {
          const sourceNode = filteredNodes.find(n => n.id === edge.source);
          const targetNode = filteredNodes.find(n => n.id === edge.target);
          if (!sourceNode || !targetNode) return null;

          const strokeColor = edge.type === 'data_flow' ? '#1890ff' : 
                            edge.type === 'dependency' ? '#52c41a' : '#722ed1';
          const strokeDasharray = edge.type === 'dependency' ? '5,5' : 'none';

          return (
            <line
              key={edge.id}
              x1={sourceNode.x}
              y1={sourceNode.y}
              x2={targetNode.x}
              y2={targetNode.y}
              stroke={strokeColor}
              strokeWidth="2"
              strokeDasharray={strokeDasharray}
              markerEnd="url(#arrowhead)"
            />
          );
        })}

        {/* 渲染节点 */}
        {filteredNodes.map(node => (
          <g key={node.id} className="lineage-node">
            <circle
              cx={node.x}
              cy={node.y}
              r="30"
              fill={getNodeColor(node.type, node.status)}
              stroke="#fff"
              strokeWidth="3"
              className="node-circle"
              onClick={() => handleNodeClick(node)}
              style={{ cursor: 'pointer' }}
            />
            <text
              x={node.x}
              y={node.y - 40}
              textAnchor="middle"
              fontSize="12"
              fill="#333"
              className="node-label"
            >
              {node.name.length > 15 ? `${node.name.substring(0, 15)}...` : node.name}
            </text>
            <text
              x={node.x}
              y={node.y + 5}
              textAnchor="middle"
              fontSize="16"
              fill="#fff"
              className="node-icon"
            >
              {getNodeIcon(node.type)}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  // 渲染树形视图
  const renderTreeView = () => {
    if (!lineageGraph) return null;

    const buildTreeData = (nodes: LineageNode[], edges: LineageEdge[]) => {
      const nodeMap = new Map(nodes.map(node => [node.id, node]));
      const treeData: any[] = [];

      const buildNode = (nodeId: string, visited = new Set()): any => {
        if (visited.has(nodeId)) return null;
        visited.add(nodeId);

        const node = nodeMap.get(nodeId);
        if (!node) return null;

        const children = edges
          .filter(edge => edge.source === nodeId)
          .map(edge => buildNode(edge.target, new Set(visited)))
          .filter(Boolean);

        return {
          title: (
            <Space>
              <span>{getNodeIcon(node.type)}</span>
              <span>{node.name}</span>
              <Tag color={getNodeColor(node.type, node.status)}>
                {node.type}
              </Tag>
            </Space>
          ),
          key: node.id,
          children: children.length > 0 ? children : undefined,
          data: node
        };
      };

      // 找到根节点（没有父节点的节点）
      const rootNodes = nodes.filter(node => 
        !edges.some(edge => edge.target === node.id)
      );

      rootNodes.forEach(rootNode => {
        const treeNode = buildNode(rootNode.id);
        if (treeNode) treeData.push(treeNode);
      });

      return treeData;
    };

    const treeData = buildTreeData(lineageGraph.nodes, lineageGraph.edges);

    return (
      <Tree
        treeData={treeData}
        defaultExpandAll
        onSelect={(selectedKeys, info) => {
          if (info.node.data) {
            handleNodeClick(info.node.data as LineageNode);
          }
        }}
        className="lineage-tree"
      />
    );
  };

  // 渲染表格视图
  const renderTableView = () => {
    if (!lineageGraph) return null;

    const columns = [
      {
        title: '节点名称',
        dataIndex: 'name',
        key: 'name',
        render: (text: string, record: LineageNode) => (
          <Space>
              <span>{getNodeIcon(record.type)}</span>
              <a onClick={() => handleNodeClick(record)}>{text}</a>
            </Space>
        )
      },
      {
        title: '类型',
        dataIndex: 'type',
        key: 'type',
        render: (type: string, record: LineageNode) => (
          <Tag color={getNodeColor(type, record.status)}>{type}</Tag>
        ),
        filters: [
          { text: 'Table', value: 'table' },
          { text: 'View', value: 'view' },
          { text: 'Job', value: 'job' },
          { text: 'Report', value: 'report' },
          { text: 'API', value: 'api' }
        ],
        onFilter: (value: any, record: LineageNode) => record.type === value
      },
      {
        title: '业务域',
        dataIndex: 'businessDomain',
        key: 'businessDomain',
        filters: [
          { text: '用户中心', value: '用户中心' },
          { text: '订单中心', value: '订单中心' },
          { text: '商品中心', value: '商品中心' }
        ],
        onFilter: (value: any, record: LineageNode) => record.businessDomain === value
      },
      {
        title: '数据层级',
        dataIndex: 'dataLayer',
        key: 'dataLayer',
        render: (layer: string) => {
          const layerColors = {
            'ODS': 'green',
            'DWD': 'blue',
            'DWS': 'orange',
            'ADS': 'purple'
          };
          return <Tag color={layerColors[layer as keyof typeof layerColors]}>{layer}</Tag>;
        }
      },
      {
        title: '负责人',
        dataIndex: 'owner',
        key: 'owner'
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => {
          const statusMap = {
            active: { color: 'green', text: '活跃' },
            inactive: { color: 'orange', text: '非活跃' },
            deprecated: { color: 'red', text: '已废弃' }
          };
          const config = statusMap[status as keyof typeof statusMap];
          return <Tag color={config.color}>{config.text}</Tag>;
        }
      },
      {
        title: '层级',
        dataIndex: 'level',
        key: 'level',
        sorter: (a: LineageNode, b: LineageNode) => a.level - b.level
      }
    ];

    return (
      <Table
        columns={columns}
        dataSource={lineageGraph.nodes}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
        }}
      />
    );
  };

  return (
    <Layout className="lineage-graph-page">
      <Content>
        {/* 页面头部 */}
        <Card className="page-header" bordered={false}>
          <Row justify="space-between" align="middle">
            <Col>
              <h2>血缘图谱</h2>
              <p>可视化展示数据资产之间的血缘关系和依赖关系</p>
            </Col>
            <Col>
              <Space>
                <Button icon={<DownloadOutlined />} onClick={handleExport}>
                  导出
                </Button>
                <Button icon={<ShareAltOutlined />}>
                  分享
                </Button>
                <Button icon={<SettingOutlined />} onClick={() => setSettingsVisible(true)}>
                  设置
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 搜索和控制区域 */}
        <Card className="control-panel" bordered={false}>
          <Row gutter={[16, 16]} align="middle">
            <Col span={8}>
              <Search
                placeholder="搜索节点名称"
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
                onChange={(e) => !e.target.value && setSearchText('')}
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="血缘方向"
                style={{ width: '100%' }}
                value={direction}
                onChange={(value) => setDirection(value)}
              >
                <Option value="upstream">上游</Option>
                <Option value="downstream">下游</Option>
                <Option value="both">双向</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="视图模式"
                style={{ width: '100%' }}
                value={viewMode}
                onChange={(value) => setViewMode(value)}
              >
                <Option value="graph">图谱视图</Option>
                <Option value="tree">树形视图</Option>
                <Option value="table">表格视图</Option>
              </Select>
            </Col>
            <Col span={8}>
              <Space>
                <span>层级深度:</span>
                <Slider
                  min={1}
                  max={5}
                  value={maxDepth}
                  onChange={setMaxDepth}
                  style={{ width: 100 }}
                />
                <span>{maxDepth}</span>
                <Divider type="vertical" />
                <Tooltip title="放大">
                  <Button icon={<ZoomInOutlined />} onClick={() => handleZoom('in')} />
                </Tooltip>
                <Tooltip title="缩小">
                  <Button icon={<ZoomOutOutlined />} onClick={() => handleZoom('out')} />
                </Tooltip>
                <Tooltip title="重置">
                  <Button onClick={() => handleZoom('reset')}>100%</Button>
                </Tooltip>
                <Tooltip title="全屏">
                  <Button icon={<FullscreenOutlined />} onClick={handleFullscreen} />
                </Tooltip>
                <Tooltip title="刷新">
                  <Button icon={<ReloadOutlined />} onClick={() => loadLineageData()} />
                </Tooltip>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 主要内容区域 */}
        <Card bordered={false} loading={loading}>
          {viewMode === 'graph' && (
            <div className="graph-container">
              {renderGraph()}
            </div>
          )}
          {viewMode === 'tree' && (
            <div className="tree-container">
              {renderTreeView()}
            </div>
          )}
          {viewMode === 'table' && (
            <div className="table-container">
              {renderTableView()}
            </div>
          )}
        </Card>

        {/* 节点详情抽屉 */}
        <Drawer
          title={selectedNode ? `节点详情 - ${selectedNode.name}` : '节点详情'}
          placement="right"
          width={600}
          open={drawerVisible}
          onClose={() => setDrawerVisible(false)}
        >
          {selectedNode && (
            <div>
              <Descriptions title="基本信息" bordered column={1}>
                <Descriptions.Item label="节点名称">{selectedNode.name}</Descriptions.Item>
                <Descriptions.Item label="节点类型">
                  <Tag color={getNodeColor(selectedNode.type, selectedNode.status)}>
                    {selectedNode.type}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="数据库">{selectedNode.database || '-'}</Descriptions.Item>
                <Descriptions.Item label="模式">{selectedNode.schema || '-'}</Descriptions.Item>
                <Descriptions.Item label="业务域">{selectedNode.businessDomain}</Descriptions.Item>
                <Descriptions.Item label="数据层级">
                  <Tag color={{
                    'ODS': 'green',
                    'DWD': 'blue', 
                    'DWS': 'orange',
                    'ADS': 'purple'
                  }[selectedNode.dataLayer as 'ODS' | 'DWD' | 'DWS' | 'ADS']}>
                    {selectedNode.dataLayer}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="负责人">{selectedNode.owner}</Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color={{
                    active: 'green',
                    inactive: 'orange',
                    deprecated: 'red'
                  }[selectedNode.status as 'active' | 'inactive' | 'deprecated']}>
                    {{
                      active: '活跃',
                      inactive: '非活跃', 
                      deprecated: '已废弃'
                    }[selectedNode.status as 'active' | 'inactive' | 'deprecated']}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="层级">{selectedNode.level}</Descriptions.Item>
                <Descriptions.Item label="描述">{selectedNode.description}</Descriptions.Item>
              </Descriptions>

              {selectedNode.metadata && (
                <>
                  <Divider />
                  <Descriptions title="元数据信息" bordered column={1}>
                    {Object.entries(selectedNode.metadata).map(([key, value]) => (
                      <Descriptions.Item key={key} label={key}>
                        {String(value)}
                      </Descriptions.Item>
                    ))}
                  </Descriptions>
                </>
              )}

              <Divider />
              <Tabs defaultActiveKey="upstream">
                <TabPane tab="上游依赖" key="upstream">
                  {selectedNode.parents && selectedNode.parents.length > 0 ? (
                    <ul>
                      {selectedNode.parents.map(parentId => {
                        const parentNode = lineageGraph?.nodes.find(n => n.id === parentId);
                        return parentNode ? (
                          <li key={parentId}>
                            <Space>
                              <span>{getNodeIcon(parentNode.type)}</span>
                              <a onClick={() => handleNodeClick(parentNode)}>{parentNode.name}</a>
                              <Tag>{parentNode.type}</Tag>
                            </Space>
                          </li>
                        ) : null;
                      })}
                    </ul>
                  ) : (
                    <p>无上游依赖</p>
                  )}
                </TabPane>
                <TabPane tab="下游影响" key="downstream">
                  {selectedNode.children && selectedNode.children.length > 0 ? (
                    <ul>
                      {selectedNode.children.map(childId => {
                        const childNode = lineageGraph?.nodes.find(n => n.id === childId);
                        return childNode ? (
                          <li key={childId}>
                            <Space>
                              <span>{getNodeIcon(childNode.type)}</span>
                              <a onClick={() => handleNodeClick(childNode)}>{childNode.name}</a>
                              <Tag>{childNode.type}</Tag>
                            </Space>
                          </li>
                        ) : null;
                      })}
                    </ul>
                  ) : (
                    <p>无下游影响</p>
                  )}
                </TabPane>
              </Tabs>
            </div>
          )}
        </Drawer>

        {/* 设置抽屉 */}
        <Drawer
          title="图谱设置"
          placement="right"
          width={400}
          open={settingsVisible}
          onClose={() => setSettingsVisible(false)}
        >
          <div>
            <h4>节点类型过滤</h4>
            <Select
              mode="multiple"
              placeholder="选择要显示的节点类型"
              style={{ width: '100%', marginBottom: 16 }}
              value={filters.nodeTypes}
              onChange={(value) => setFilters(prev => ({ ...prev, nodeTypes: value }))}
            >
              <Option value="table">Table</Option>
              <Option value="view">View</Option>
              <Option value="job">Job</Option>
              <Option value="report">Report</Option>
              <Option value="api">API</Option>
            </Select>

            <h4>业务域过滤</h4>
            <Select
              mode="multiple"
              placeholder="选择业务域"
              style={{ width: '100%', marginBottom: 16 }}
              value={filters.businessDomains}
              onChange={(value) => setFilters(prev => ({ ...prev, businessDomains: value }))}
            >
              <Option value="用户中心">用户中心</Option>
              <Option value="订单中心">订单中心</Option>
              <Option value="商品中心">商品中心</Option>
            </Select>

            <h4>数据层级过滤</h4>
            <Select
              mode="multiple"
              placeholder="选择数据层级"
              style={{ width: '100%', marginBottom: 16 }}
              value={filters.dataLayers}
              onChange={(value) => setFilters(prev => ({ ...prev, dataLayers: value }))}
            >
              <Option value="ODS">ODS</Option>
              <Option value="DWD">DWD</Option>
              <Option value="DWS">DWS</Option>
              <Option value="ADS">ADS</Option>
            </Select>

            <h4>状态过滤</h4>
            <Select
              mode="multiple"
              placeholder="选择状态"
              style={{ width: '100%', marginBottom: 16 }}
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <Option value="active">活跃</Option>
              <Option value="inactive">非活跃</Option>
              <Option value="deprecated">已废弃</Option>
            </Select>

            <h4>显示选项</h4>
            <div style={{ marginBottom: 16 }}>
              <Switch
                checked={filters.showInactive}
                onChange={(checked) => setFilters(prev => ({ ...prev, showInactive: checked }))}
              />
              <span style={{ marginLeft: 8 }}>显示非活跃节点</span>
            </div>

            <Button 
              type="primary" 
              block 
              onClick={() => {
                setFilters({
                  nodeTypes: [],
                  businessDomains: [],
                  dataLayers: [],
                  status: [],
                  showInactive: false
                });
                message.success('已重置过滤条件');
              }}
            >
              重置过滤条件
            </Button>
          </div>
        </Drawer>
      </Content>
    </Layout>
  );
};

export default LineageGraphPage;