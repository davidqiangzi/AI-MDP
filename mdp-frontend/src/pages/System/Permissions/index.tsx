/**
 * 系统管理 - 权限管理页面
 * 包含权限树形结构、权限分配、权限继承关系
 */

import React, { useState } from 'react';
import {
  Card,
  Tree,
  Button,
  Space,
  Input,
  Modal,
  Form,
  message,
  Popconfirm,
  Tag,
  Drawer,
  Typography,
  Row,
  Col,
  Switch,
  Select,
  Divider,
  Tooltip,
  Badge,
  Descriptions,
  List,

  Table,
  Tabs,
  Alert
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,

  ReloadOutlined,
  ExportOutlined,
  EyeOutlined,
  UserOutlined,

  ApartmentOutlined
} from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import type { ColumnsType } from 'antd/es/table';
import './index.css';

const { Title, Text } = Typography;
const { Search } = Input;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

// 数据类型定义
interface Permission {
  id: string;
  name: string;
  code: string;
  type: 'module' | 'menu' | 'button' | 'api';
  parentId?: string;
  path?: string;
  icon?: string;
  description: string;
  status: 'active' | 'inactive';
  sort: number;
  createTime: string;
  updateTime: string;
  children?: Permission[];
}

interface Role {
  id: string;
  name: string;
  code: string;
  permissions: string[];
  userCount: number;
}

interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  roles: string[];
  permissions: string[];
}

// 模拟权限数据
const mockPermissions: Permission[] = [
  {
    id: '1',
    name: '用户管理',
    code: 'user',
    type: 'module',
    icon: 'UserOutlined',
    description: '用户管理模块',
    status: 'active',
    sort: 1,
    createTime: '2023-01-01 00:00:00',
    updateTime: '2024-01-15 14:30:25',
    children: [
      {
        id: '1-1',
        name: '用户列表',
        code: 'user:list',
        type: 'menu',
        parentId: '1',
        path: '/system/users',
        description: '用户列表页面',
        status: 'active',
        sort: 1,
        createTime: '2023-01-01 00:00:00',
        updateTime: '2024-01-15 14:30:25',
        children: [
          {
            id: '1-1-1',
            name: '查看用户',
            code: 'user:read',
            type: 'button',
            parentId: '1-1',
            description: '查看用户信息',
            status: 'active',
            sort: 1,
            createTime: '2023-01-01 00:00:00',
            updateTime: '2024-01-15 14:30:25'
          },
          {
            id: '1-1-2',
            name: '新增用户',
            code: 'user:create',
            type: 'button',
            parentId: '1-1',
            description: '新增用户',
            status: 'active',
            sort: 2,
            createTime: '2023-01-01 00:00:00',
            updateTime: '2024-01-15 14:30:25'
          },
          {
            id: '1-1-3',
            name: '编辑用户',
            code: 'user:update',
            type: 'button',
            parentId: '1-1',
            description: '编辑用户信息',
            status: 'active',
            sort: 3,
            createTime: '2023-01-01 00:00:00',
            updateTime: '2024-01-15 14:30:25'
          },
          {
            id: '1-1-4',
            name: '删除用户',
            code: 'user:delete',
            type: 'button',
            parentId: '1-1',
            description: '删除用户',
            status: 'active',
            sort: 4,
            createTime: '2023-01-01 00:00:00',
            updateTime: '2024-01-15 14:30:25'
          }
        ]
      }
    ]
  },
  {
    id: '2',
    name: '角色管理',
    code: 'role',
    type: 'module',
    icon: 'TeamOutlined',
    description: '角色管理模块',
    status: 'active',
    sort: 2,
    createTime: '2023-01-01 00:00:00',
    updateTime: '2024-01-15 14:30:25',
    children: [
      {
        id: '2-1',
        name: '角色列表',
        code: 'role:list',
        type: 'menu',
        parentId: '2',
        path: '/system/roles',
        description: '角色列表页面',
        status: 'active',
        sort: 1,
        createTime: '2023-01-01 00:00:00',
        updateTime: '2024-01-15 14:30:25',
        children: [
          {
            id: '2-1-1',
            name: '查看角色',
            code: 'role:read',
            type: 'button',
            parentId: '2-1',
            description: '查看角色信息',
            status: 'active',
            sort: 1,
            createTime: '2023-01-01 00:00:00',
            updateTime: '2024-01-15 14:30:25'
          },
          {
            id: '2-1-2',
            name: '新增角色',
            code: 'role:create',
            type: 'button',
            parentId: '2-1',
            description: '新增角色',
            status: 'active',
            sort: 2,
            createTime: '2023-01-01 00:00:00',
            updateTime: '2024-01-15 14:30:25'
          },
          {
            id: '2-1-3',
            name: '编辑角色',
            code: 'role:update',
            type: 'button',
            parentId: '2-1',
            description: '编辑角色信息',
            status: 'active',
            sort: 3,
            createTime: '2023-01-01 00:00:00',
            updateTime: '2024-01-15 14:30:25'
          },
          {
            id: '2-1-4',
            name: '删除角色',
            code: 'role:delete',
            type: 'button',
            parentId: '2-1',
            description: '删除角色',
            status: 'active',
            sort: 4,
            createTime: '2023-01-01 00:00:00',
            updateTime: '2024-01-15 14:30:25'
          }
        ]
      }
    ]
  },
  {
    id: '3',
    name: '数据管理',
    code: 'data',
    type: 'module',
    icon: 'DatabaseOutlined',
    description: '数据管理模块',
    status: 'active',
    sort: 3,
    createTime: '2023-01-01 00:00:00',
    updateTime: '2024-01-15 14:30:25',
    children: [
      {
        id: '3-1',
        name: '数据查看',
        code: 'data:read',
        type: 'api',
        parentId: '3',
        description: '数据查看权限',
        status: 'active',
        sort: 1,
        createTime: '2023-01-01 00:00:00',
        updateTime: '2024-01-15 14:30:25'
      },
      {
        id: '3-2',
        name: '数据编辑',
        code: 'data:write',
        type: 'api',
        parentId: '3',
        description: '数据编辑权限',
        status: 'active',
        sort: 2,
        createTime: '2023-01-01 00:00:00',
        updateTime: '2024-01-15 14:30:25'
      }
    ]
  },
  {
    id: '4',
    name: '数据分析',
    code: 'analytics',
    type: 'module',
    icon: 'BarChartOutlined',
    description: '数据分析模块',
    status: 'active',
    sort: 4,
    createTime: '2023-01-01 00:00:00',
    updateTime: '2024-01-15 14:30:25',
    children: [
      {
        id: '4-1',
        name: '分析概览',
        code: 'analytics:overview',
        type: 'menu',
        parentId: '4',
        path: '/analytics/overview',
        description: '分析概览页面',
        status: 'active',
        sort: 1,
        createTime: '2023-01-01 00:00:00',
        updateTime: '2024-01-15 14:30:25'
      },
      {
        id: '4-2',
        name: '使用统计',
        code: 'analytics:usage',
        type: 'menu',
        parentId: '4',
        path: '/analytics/usage',
        description: '使用统计页面',
        status: 'active',
        sort: 2,
        createTime: '2023-01-01 00:00:00',
        updateTime: '2024-01-15 14:30:25'
      },
      {
        id: '4-3',
        name: '趋势分析',
        code: 'analytics:trends',
        type: 'menu',
        parentId: '4',
        path: '/analytics/trends',
        description: '趋势分析页面',
        status: 'active',
        sort: 3,
        createTime: '2023-01-01 00:00:00',
        updateTime: '2024-01-15 14:30:25'
      }
    ]
  }
];

// 模拟角色数据
const mockRoles: Role[] = [
  {
    id: '1',
    name: '系统管理员',
    code: 'admin',
    permissions: ['1', '1-1', '1-1-1', '1-1-2', '1-1-3', '1-1-4', '2', '2-1', '2-1-1', '2-1-2', '2-1-3', '2-1-4'],
    userCount: 2
  },
  {
    id: '2',
    name: '数据分析师',
    code: 'analyst',
    permissions: ['3', '3-1', '4', '4-1', '4-2', '4-3'],
    userCount: 8
  },
  {
    id: '3',
    name: '普通用户',
    code: 'user',
    permissions: ['3', '3-1', '4', '4-1'],
    userCount: 15
  }
];

// 模拟用户数据
const mockUsers: User[] = [
  {
    id: '1',
    name: '系统管理员',
    username: 'admin',
    roles: ['1'],
    permissions: ['1', '1-1', '1-1-1', '1-1-2', '1-1-3', '1-1-4', '2', '2-1', '2-1-1', '2-1-2', '2-1-3', '2-1-4']
  },
  {
    id: '2',
    name: '张三',
    username: 'zhangsan',
    roles: ['2'],
    permissions: ['3', '3-1', '4', '4-1', '4-2', '4-3']
  },
  {
    id: '3',
    name: '李四',
    username: 'lisi',
    roles: ['3'],
    permissions: ['3', '3-1', '4', '4-1']
  }
];

const PermissionManagement: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>(mockPermissions);
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(['1', '2', '3', '4']);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('tree');
  const [assignTarget, setAssignTarget] = useState<'role' | 'user'>('role');
  const [assignTargetId, setAssignTargetId] = useState<string>('');
  const [checkedPermissions, setCheckedPermissions] = useState<React.Key[]>([]);

  // 将权限数据转换为树形结构
  const convertToTreeData = (permissions: Permission[]): DataNode[] => {
    return permissions.map(permission => ({
      title: (
        <div className="permission-node">
          <div className="permission-info">
            <span className="permission-name">{permission.name}</span>
            <Tag 
                  color={
                    permission.type === 'module' ? 'blue' :
                    permission.type === 'menu' ? 'green' :
                    permission.type === 'button' ? 'orange' : 'purple'
                  }
                >
                  {permission.type === 'module' ? '模块' :
                   permission.type === 'menu' ? '菜单' :
                   permission.type === 'button' ? '按钮' : 'API'}
                </Tag>
            <Switch 
              size="small" 
              checked={permission.status === 'active'}
              onChange={(checked) => handleStatusChange(permission.id, checked ? 'active' : 'inactive')}
            />
          </div>
          <div className="permission-code">@{permission.code}</div>
        </div>
      ),
      key: permission.id,
      children: permission.children ? convertToTreeData(permission.children) : undefined
    }));
  };

  // 筛选权限数据
  const filterPermissions = (permissions: Permission[], searchText: string, type: string): Permission[] => {
    return permissions.filter(permission => {
      const matchSearch = !searchText || 
        permission.name.toLowerCase().includes(searchText.toLowerCase()) ||
        permission.code.toLowerCase().includes(searchText.toLowerCase()) ||
        permission.description.toLowerCase().includes(searchText.toLowerCase());
      
      const matchType = type === 'all' || permission.type === type;
      
      const hasMatchingChildren = permission.children && 
        filterPermissions(permission.children, searchText, type).length > 0;
      
      return (matchSearch && matchType) || hasMatchingChildren;
    }).map(permission => ({
      ...permission,
      children: permission.children ? filterPermissions(permission.children, searchText, type) : undefined
    }));
  };

  const filteredPermissions = filterPermissions(permissions, searchText, selectedType);
  const treeData = convertToTreeData(filteredPermissions);

  // 处理新增权限
  const handleAddPermission = (parentId?: string) => {
    setEditingPermission(null);
    form.resetFields();
    if (parentId) {
      form.setFieldValue('parentId', parentId);
    }
    setIsModalVisible(true);
  };

  // 处理编辑权限
  const handleEditPermission = (permission: Permission) => {
    setEditingPermission(permission);
    form.setFieldsValue({
      name: permission.name,
      code: permission.code,
      type: permission.type,
      parentId: permission.parentId,
      path: permission.path,
      icon: permission.icon,
      description: permission.description,
      status: permission.status,
      sort: permission.sort
    });
    setIsModalVisible(true);
  };

  // 处理删除权限
  const handleDeletePermission = async (permissionId: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // 递归删除权限及其子权限
      const deletePermissionRecursive = (perms: Permission[]): Permission[] => {
        return perms.filter(perm => {
          if (perm.id === permissionId) {
            return false;
          }
          if (perm.children) {
            perm.children = deletePermissionRecursive(perm.children);
          }
          return true;
        });
      };
      setPermissions(deletePermissionRecursive(permissions));
      message.success('权限删除成功');
    } catch (error) {
      message.error('删除失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理权限状态切换
  const handleStatusChange = async (permissionId: string, status: 'active' | 'inactive') => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const updatePermissionStatus = (perms: Permission[]): Permission[] => {
        return perms.map(perm => {
          if (perm.id === permissionId) {
            return { ...perm, status, updateTime: new Date().toLocaleString('zh-CN') };
          }
          if (perm.children) {
            return { ...perm, children: updatePermissionStatus(perm.children) };
          }
          return perm;
        });
      };
      setPermissions(updatePermissionStatus(permissions));
      message.success('状态更新成功');
    } catch (error) {
      message.error('状态更新失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingPermission) {
        // 编辑权限
        const updatePermission = (perms: Permission[]): Permission[] => {
          return perms.map(perm => {
            if (perm.id === editingPermission.id) {
              return { ...perm, ...values, updateTime: new Date().toLocaleString('zh-CN') };
            }
            if (perm.children) {
              return { ...perm, children: updatePermission(perm.children) };
            }
            return perm;
          });
        };
        setPermissions(updatePermission(permissions));
        message.success('权限更新成功');
      } else {
        // 新增权限
        const newPermission: Permission = {
          id: Date.now().toString(),
          ...values,
          createTime: new Date().toLocaleString('zh-CN'),
          updateTime: new Date().toLocaleString('zh-CN')
        };
        
        if (values.parentId) {
          // 添加到父权限下
          const addToParent = (perms: Permission[]): Permission[] => {
            return perms.map(perm => {
              if (perm.id === values.parentId) {
                return {
                  ...perm,
                  children: [...(perm.children || []), newPermission]
                };
              }
              if (perm.children) {
                return { ...perm, children: addToParent(perm.children) };
              }
              return perm;
            });
          };
          setPermissions(addToParent(permissions));
        } else {
          // 添加为根权限
          setPermissions([...permissions, newPermission]);
        }
        message.success('权限创建成功');
      }
      
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 查看权限详情
  const handleViewDetail = (permission: Permission) => {
    setSelectedPermission(permission);
    setIsDetailDrawerVisible(true);
  };

  // 处理权限分配
  const handleAssignPermission = () => {
    setCheckedPermissions([]);
    setIsAssignModalVisible(true);
  };

  // 处理权限分配提交
  const handleAssignSubmit = async () => {
    if (!assignTargetId) {
      message.error('请选择分配对象');
      return;
    }
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (assignTarget === 'role') {
        setRoles(roles.map(role => 
          role.id === assignTargetId ? { 
            ...role, 
            permissions: checkedPermissions as string[]
          } : role
        ));
      } else {
        setUsers(users.map(user => 
          user.id === assignTargetId ? { 
            ...user, 
            permissions: checkedPermissions as string[]
          } : user
        ));
      }
      
      message.success('权限分配成功');
      setIsAssignModalVisible(false);
    } catch (error) {
      message.error('权限分配失败');
    } finally {
      setLoading(false);
    }
  };

  // 刷新数据
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('数据刷新成功');
    }, 1000);
  };

  // 导出权限数据
  const handleExport = () => {
    message.success('权限数据导出成功');
  };

  // 获取权限路径
  const getPermissionPath = (permissionId: string, perms: Permission[] = permissions): string[] => {
    for (const perm of perms) {
      if (perm.id === permissionId) {
        return [perm.name];
      }
      if (perm.children) {
        const childPath = getPermissionPath(permissionId, perm.children);
        if (childPath.length > 0) {
          return [perm.name, ...childPath];
        }
      }
    }
    return [];
  };

  // 角色权限表格列
  const roleColumns: ColumnsType<Role> = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <div>
          <div className="role-name">{name}</div>
          <div className="role-code">@{record.code}</div>
        </div>
      )
    },
    {
      title: '权限数量',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: string[]) => (
        <Badge count={permissions.length} showZero color="blue" />
      )
    },
    {
      title: '用户数量',
      dataIndex: 'userCount',
      key: 'userCount',
      render: (count: number) => (
        <span><UserOutlined style={{ marginRight: 4 }} />{count} 人</span>
      )
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="text" 
            size="small"
            onClick={() => {
              setAssignTarget('role');
              setAssignTargetId(record.id);
              setCheckedPermissions(record.permissions);
              setIsAssignModalVisible(true);
            }}
          >
            配置权限
          </Button>
        </Space>
      )
    }
  ];

  // 用户权限表格列
  const userColumns: ColumnsType<User> = [
    {
      title: '用户信息',
      key: 'userInfo',
      render: (_, record) => (
        <div>
          <div className="user-name">{record.name}</div>
          <div className="user-username">@{record.username}</div>
        </div>
      )
    },
    {
      title: '角色',
      dataIndex: 'roles',
      key: 'roles',
      render: (roleIds: string[]) => (
        <div>
          {roleIds.map(roleId => {
            const role = roles.find(r => r.id === roleId);
            return role ? <Tag key={roleId} color="blue">{role.name}</Tag> : null;
          })}
        </div>
      )
    },
    {
      title: '权限数量',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: string[]) => (
        <Badge count={permissions.length} showZero color="green" />
      )
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="text" 
            size="small"
            onClick={() => {
              setAssignTarget('user');
              setAssignTargetId(record.id);
              setCheckedPermissions(record.permissions);
              setIsAssignModalVisible(true);
            }}
          >
            配置权限
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="permission-management">
      {/* 页面头部 */}
      <div className="page-header">
        <div className="header-content">
          <Title level={2}>权限管理</Title>
          <Text type="secondary">管理系统权限结构和权限分配</Text>
        </div>
        <div className="header-actions">
          <Space>
            <Button icon={<ExportOutlined />} onClick={handleExport}>
              导出
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
              刷新
            </Button>
            <Button icon={<ApartmentOutlined />} onClick={handleAssignPermission}>
              权限分配
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAddPermission()}>
              新增权限
            </Button>
          </Space>
        </div>
      </div>

      {/* 主要内容 */}
      <Card className="main-card">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="权限树" key="tree">
            <div className="tree-container">
              {/* 筛选区域 */}
              <div className="filter-section">
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <Search
                      placeholder="搜索权限名称、编码或描述"
                      allowClear
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <Select
                      value={selectedType}
                      onChange={setSelectedType}
                      style={{ width: '100%' }}
                      placeholder="选择权限类型"
                    >
                      <Option value="all">全部类型</Option>
                      <Option value="module">模块</Option>
                      <Option value="menu">菜单</Option>
                      <Option value="button">按钮</Option>
                      <Option value="api">API</Option>
                    </Select>
                  </Col>
                </Row>
              </div>

              <Divider />

              {/* 权限树 */}
              <div className="permission-tree">
                <Alert
                  message="权限说明"
                  description="模块权限包含菜单权限，菜单权限包含按钮权限。权限具有继承关系，上级权限包含下级权限。"
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                <Tree
                  treeData={treeData}
                  selectedKeys={selectedKeys}
                  expandedKeys={expandedKeys}
                  onSelect={setSelectedKeys}
                  onExpand={setExpandedKeys}
                  showLine={{ showLeafIcon: false }}
                  height={500}
                  titleRender={(nodeData) => {
                    return (
                      <>
                        <span>{nodeData.title as string}</span>
                        <div className="tree-node-actions">
                        <Space size="small">
                          <Tooltip title="查看详情">
                            <Button 
                              type="text" 
                              size="small"
                              icon={<EyeOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                const permission = findPermissionById(nodeData.key as string);
                                if (permission) handleViewDetail(permission);
                              }}
                            />
                          </Tooltip>
                          <Tooltip title="编辑">
                            <Button 
                              type="text" 
                              size="small"
                              icon={<EditOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                const permission = findPermissionById(nodeData.key as string);
                                if (permission) handleEditPermission(permission);
                              }}
                            />
                          </Tooltip>
                          <Tooltip title="添加子权限">
                            <Button 
                              type="text" 
                              size="small"
                              icon={<PlusOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddPermission(nodeData.key as string);
                              }}
                            />
                          </Tooltip>
                          <Popconfirm
                            title="确定要删除这个权限吗？"
                            description="删除后该权限及其子权限都将被删除"
                            onConfirm={(e) => {
                              e?.stopPropagation();
                              handleDeletePermission(nodeData.key as string);
                            }}
                            okText="确定"
                            cancelText="取消"
                          >
                            <Button 
                              type="text" 
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </Popconfirm>
                        </Space>
                         </div>
                       </>
                     );
                  }}
                />
              </div>
            </div>
          </TabPane>
          
          <TabPane tab="角色权限" key="roles">
            <Table
              columns={roleColumns}
              dataSource={roles}
              rowKey="id"
              pagination={false}
            />
          </TabPane>
          
          <TabPane tab="用户权限" key="users">
            <Table
              columns={userColumns}
              dataSource={users}
              rowKey="id"
              pagination={false}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* 新增/编辑权限弹窗 */}
      <Modal
        title={editingPermission ? '编辑权限' : '新增权限'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="权限名称"
                rules={[{ required: true, message: '请输入权限名称' }]}
              >
                <Input placeholder="请输入权限名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="code"
                label="权限编码"
                rules={[{ required: true, message: '请输入权限编码' }]}
              >
                <Input placeholder="请输入权限编码" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="权限类型"
                rules={[{ required: true, message: '请选择权限类型' }]}
              >
                <Select placeholder="请选择权限类型">
                  <Option value="module">模块</Option>
                  <Option value="menu">菜单</Option>
                  <Option value="button">按钮</Option>
                  <Option value="api">API</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sort"
                label="排序"
                rules={[{ required: true, message: '请输入排序' }]}
              >
                <Input type="number" placeholder="请输入排序" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="path"
            label="路径"
          >
            <Input placeholder="请输入路径（菜单类型必填）" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="权限描述"
            rules={[{ required: true, message: '请输入权限描述' }]}
          >
            <TextArea rows={3} placeholder="请输入权限描述" />
          </Form.Item>
          
          <Form.Item
            name="status"
            label="状态"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
          
          <Form.Item className="form-actions">
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingPermission ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 权限分配弹窗 */}
      <Modal
        title="权限分配"
        open={isAssignModalVisible}
        onCancel={() => setIsAssignModalVisible(false)}
        onOk={handleAssignSubmit}
        width={800}
        confirmLoading={loading}
      >
        <div className="assign-container">
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={12}>
              <Form.Item label="分配类型">
                <Select value={assignTarget} onChange={setAssignTarget}>
                  <Option value="role">角色</Option>
                  <Option value="user">用户</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="选择对象">
                <Select 
                  value={assignTargetId} 
                  onChange={setAssignTargetId}
                  placeholder={`请选择${assignTarget === 'role' ? '角色' : '用户'}`}
                >
                  {(assignTarget === 'role' ? roles : users).map(item => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Divider />
          
          <div className="permission-assign-tree">
            <Tree
              checkable
              checkedKeys={checkedPermissions}
              expandedKeys={expandedKeys}
              onCheck={(checked) => setCheckedPermissions(checked as React.Key[])}
              onExpand={setExpandedKeys}
              treeData={treeData}
              height={300}
            />
          </div>
        </div>
      </Modal>

      {/* 权限详情抽屉 */}
      <Drawer
        title="权限详情"
        placement="right"
        onClose={() => setIsDetailDrawerVisible(false)}
        open={isDetailDrawerVisible}
        width={500}
      >
        {selectedPermission && (
          <div className="permission-detail">
            <Descriptions title="基本信息" column={1} bordered>
              <Descriptions.Item label="权限名称">{selectedPermission.name}</Descriptions.Item>
              <Descriptions.Item label="权限编码">{selectedPermission.code}</Descriptions.Item>
              <Descriptions.Item label="权限类型">
                <Tag color={
                  selectedPermission.type === 'module' ? 'blue' :
                  selectedPermission.type === 'menu' ? 'green' :
                  selectedPermission.type === 'button' ? 'orange' : 'purple'
                }>
                  {selectedPermission.type === 'module' ? '模块' :
                   selectedPermission.type === 'menu' ? '菜单' :
                   selectedPermission.type === 'button' ? '按钮' : 'API'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="权限路径">
                {getPermissionPath(selectedPermission.id).join(' > ')}
              </Descriptions.Item>
              {selectedPermission.path && (
                <Descriptions.Item label="页面路径">{selectedPermission.path}</Descriptions.Item>
              )}
              <Descriptions.Item label="权限描述">{selectedPermission.description}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Badge 
                  status={selectedPermission.status === 'active' ? 'success' : 'error'} 
                  text={selectedPermission.status === 'active' ? '启用' : '禁用'} 
                />
              </Descriptions.Item>
              <Descriptions.Item label="排序">{selectedPermission.sort}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{selectedPermission.createTime}</Descriptions.Item>
              <Descriptions.Item label="更新时间">{selectedPermission.updateTime}</Descriptions.Item>
            </Descriptions>
            
            {selectedPermission.children && selectedPermission.children.length > 0 && (
              <>
                <Divider />
                <div className="detail-section">
                  <Title level={5}>子权限</Title>
                  <List
                    dataSource={selectedPermission.children}
                    renderItem={(child) => (
                      <List.Item>
                        <List.Item.Meta
                          title={child.name}
                          description={`@${child.code} · ${child.description}`}
                        />
                        <Tag color={
                          child.type === 'module' ? 'blue' :
                          child.type === 'menu' ? 'green' :
                          child.type === 'button' ? 'orange' : 'purple'
                        }>
                          {child.type === 'module' ? '模块' :
                           child.type === 'menu' ? '菜单' :
                           child.type === 'button' ? '按钮' : 'API'}
                        </Tag>
                      </List.Item>
                    )}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );

  // 辅助函数：根据ID查找权限
  function findPermissionById(id: string, perms: Permission[] = permissions): Permission | null {
    for (const perm of perms) {
      if (perm.id === id) {
        return perm;
      }
      if (perm.children) {
        const found = findPermissionById(id, perm.children);
        if (found) return found;
      }
    }
    return null;
  }
};

export default PermissionManagement;