/**
 * 系统管理 - 角色管理页面
 * 包含角色列表、角色创建编辑、角色权限配置
 */

import React, { useState } from 'react';
import {
  Card,
  Table,
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
  Tree,
  Divider,
  Tooltip,
  Badge,
  Descriptions,
  List,
  Avatar
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,

  TeamOutlined,
  KeyOutlined,
  ReloadOutlined,
  ExportOutlined,
  EyeOutlined,
  UserOutlined,
  SettingOutlined,
  SafetyOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { DataNode } from 'antd/es/tree';
import './index.css';

const { Title, Text } = Typography;
const { Search } = Input;
const { TextArea } = Input;

// 数据类型定义
interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  permissions: string[];
  userCount: number;
  status: 'active' | 'inactive';
  createTime: string;
  updateTime: string;
  isSystem: boolean;
}

// interface Permission {
//   id: string;
//   name: string;
//   code: string;
//   type: 'menu' | 'button' | 'api';
//   parentId?: string;
//   children?: Permission[];
// }

interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  department: string;
}

// 模拟角色数据
const mockRoles: Role[] = [
  {
    id: '1',
    name: '系统管理员',
    code: 'admin',
    description: '拥有系统所有权限，可以管理用户、角色和系统设置',
    permissions: ['user:read', 'user:write', 'role:read', 'role:write', 'system:read', 'system:write'],
    userCount: 2,
    status: 'active',
    createTime: '2023-01-01 00:00:00',
    updateTime: '2024-01-15 14:30:25',
    isSystem: true
  },
  {
    id: '2',
    name: '数据分析师',
    code: 'analyst',
    description: '可以查看和分析数据，生成报告',
    permissions: ['data:read', 'report:read', 'report:write', 'analytics:read'],
    userCount: 8,
    status: 'active',
    createTime: '2023-03-15 09:30:00',
    updateTime: '2024-01-10 16:45:12',
    isSystem: false
  },
  {
    id: '3',
    name: '财务人员',
    code: 'finance',
    description: '可以访问财务相关数据和功能',
    permissions: ['finance:read', 'finance:write', 'report:read'],
    userCount: 5,
    status: 'active',
    createTime: '2023-05-20 14:15:30',
    updateTime: '2024-01-08 11:20:45',
    isSystem: false
  },
  {
    id: '4',
    name: '销售人员',
    code: 'sales',
    description: '可以访问销售数据和客户信息',
    permissions: ['sales:read', 'customer:read', 'report:read'],
    userCount: 12,
    status: 'active',
    createTime: '2023-07-10 16:45:00',
    updateTime: '2024-01-05 09:15:30',
    isSystem: false
  },
  {
    id: '5',
    name: '访客',
    code: 'guest',
    description: '只能查看基础信息，权限受限',
    permissions: ['basic:read'],
    userCount: 3,
    status: 'inactive',
    createTime: '2023-09-05 10:20:45',
    updateTime: '2023-12-20 15:30:00',
    isSystem: false
  }
];

// 模拟权限树数据
const mockPermissions: DataNode[] = [
  {
    title: '用户管理',
    key: 'user',
    icon: <UserOutlined />,
    children: [
      { title: '查看用户', key: 'user:read' },
      { title: '新增用户', key: 'user:create' },
      { title: '编辑用户', key: 'user:update' },
      { title: '删除用户', key: 'user:delete' },
      { title: '用户权限', key: 'user:permission' }
    ]
  },
  {
    title: '角色管理',
    key: 'role',
    icon: <TeamOutlined />,
    children: [
      { title: '查看角色', key: 'role:read' },
      { title: '新增角色', key: 'role:create' },
      { title: '编辑角色', key: 'role:update' },
      { title: '删除角色', key: 'role:delete' },
      { title: '角色权限', key: 'role:permission' }
    ]
  },
  {
    title: '数据管理',
    key: 'data',
    icon: <DatabaseOutlined />,
    children: [
      { title: '数据查看', key: 'data:read' },
      { title: '数据编辑', key: 'data:write' },
      { title: '数据导入', key: 'data:import' },
      { title: '数据导出', key: 'data:export' },
      { title: '数据删除', key: 'data:delete' }
    ]
  },
  {
    title: '数据分析',
    key: 'analytics',
    icon: <BarChartOutlined />,
    children: [
      { title: '查看分析', key: 'analytics:read' },
      { title: '创建分析', key: 'analytics:create' },
      { title: '编辑分析', key: 'analytics:update' },
      { title: '删除分析', key: 'analytics:delete' }
    ]
  },
  {
    title: '报告管理',
    key: 'report',
    icon: <FileTextOutlined />,
    children: [
      { title: '查看报告', key: 'report:read' },
      { title: '创建报告', key: 'report:create' },
      { title: '编辑报告', key: 'report:update' },
      { title: '删除报告', key: 'report:delete' },
      { title: '导出报告', key: 'report:export' }
    ]
  },
  {
    title: '财务管理',
    key: 'finance',
    icon: <SafetyOutlined />,
    children: [
      { title: '财务查看', key: 'finance:read' },
      { title: '财务编辑', key: 'finance:write' },
      { title: '财务审核', key: 'finance:audit' }
    ]
  },
  {
    title: '销售管理',
    key: 'sales',
    icon: <BarChartOutlined />,
    children: [
      { title: '销售查看', key: 'sales:read' },
      { title: '销售编辑', key: 'sales:write' },
      { title: '客户管理', key: 'customer:read' }
    ]
  },
  {
    title: '系统设置',
    key: 'system',
    icon: <SettingOutlined />,
    children: [
      { title: '系统查看', key: 'system:read' },
      { title: '系统配置', key: 'system:write' },
      { title: '系统日志', key: 'system:log' },
      { title: '系统监控', key: 'system:monitor' }
    ]
  },
  {
    title: '基础权限',
    key: 'basic',
    icon: <KeyOutlined />,
    children: [
      { title: '基础查看', key: 'basic:read' },
      { title: '个人设置', key: 'basic:profile' }
    ]
  }
];

// 模拟用户数据
const mockRoleUsers: { [key: string]: User[] } = {
  '1': [
    { id: '1', name: '系统管理员', username: 'admin', department: '技术部' },
    { id: '2', name: '超级管理员', username: 'superadmin', department: '技术部' }
  ],
  '2': [
    { id: '3', name: '张三', username: 'zhangsan', department: '数据分析部' },
    { id: '4', name: '李四', username: 'lisi', department: '数据分析部' },
    { id: '5', name: '王五', username: 'wangwu', department: '数据分析部' }
  ]
};

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPermissionModalVisible, setIsPermissionModalVisible] = useState(false);
  const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [form] = Form.useForm();
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(['user', 'role', 'data', 'analytics', 'report']);

  // 筛选角色数据
  const filteredRoles = roles.filter(role => {
    const matchSearch = !searchText || 
      role.name.toLowerCase().includes(searchText.toLowerCase()) ||
      role.code.toLowerCase().includes(searchText.toLowerCase()) ||
      role.description.toLowerCase().includes(searchText.toLowerCase());
    
    const matchStatus = selectedStatus === 'all' || role.status === selectedStatus;
    
    return matchSearch && matchStatus;
  });

  // 处理新增角色
  const handleAddRole = () => {
    setEditingRole(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 处理编辑角色
  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    form.setFieldsValue({
      name: role.name,
      code: role.code,
      description: role.description,
      status: role.status
    });
    setIsModalVisible(true);
  };

  // 处理删除角色
  const handleDeleteRole = async (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (role?.isSystem) {
      message.error('系统角色不能删除');
      return;
    }
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRoles(roles.filter(role => role.id !== roleId));
      message.success('角色删除成功');
    } catch (error) {
      message.error('删除失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理角色状态切换
  const handleStatusChange = async (roleId: string, status: 'active' | 'inactive') => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setRoles(roles.map(role => 
        role.id === roleId ? { ...role, status, updateTime: new Date().toLocaleString('zh-CN') } : role
      ));
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
      
      if (editingRole) {
        // 编辑角色
        setRoles(roles.map(role => 
          role.id === editingRole.id ? { 
            ...role, 
            ...values, 
            updateTime: new Date().toLocaleString('zh-CN')
          } : role
        ));
        message.success('角色更新成功');
      } else {
        // 新增角色
        const newRole: Role = {
          id: Date.now().toString(),
          ...values,
          permissions: [],
          userCount: 0,
          createTime: new Date().toLocaleString('zh-CN'),
          updateTime: new Date().toLocaleString('zh-CN'),
          isSystem: false
        };
        setRoles([...roles, newRole]);
        message.success('角色创建成功');
      }
      
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理权限配置
  const handlePermissionConfig = (role: Role) => {
    setSelectedRole(role);
    setCheckedKeys(role.permissions);
    setIsPermissionModalVisible(true);
  };

  // 处理权限配置提交
  const handlePermissionSubmit = async () => {
    if (!selectedRole) return;
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setRoles(roles.map(role => 
        role.id === selectedRole.id ? { 
          ...role, 
          permissions: checkedKeys as string[],
          updateTime: new Date().toLocaleString('zh-CN')
        } : role
      ));
      message.success('权限配置成功');
      setIsPermissionModalVisible(false);
    } catch (error) {
      message.error('权限配置失败');
    } finally {
      setLoading(false);
    }
  };

  // 查看角色详情
  const handleViewDetail = (role: Role) => {
    setSelectedRole(role);
    setIsDetailDrawerVisible(true);
  };

  // 刷新数据
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('数据刷新成功');
    }, 1000);
  };

  // 导出角色数据
  const handleExport = () => {
    message.success('角色数据导出成功');
  };

  // 获取权限名称
  const getPermissionName = (permissionKey: string): string => {
    const findPermission = (nodes: DataNode[]): string | null => {
      for (const node of nodes) {
        if (node.key === permissionKey) {
          return node.title as string;
        }
        if (node.children) {
          const found = findPermission(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findPermission(mockPermissions) || permissionKey;
  };

  // 表格列定义
  const columns: ColumnsType<Role> = [
    {
      title: '角色信息',
      key: 'roleInfo',
      width: 250,
      render: (_, record) => (
        <div className="role-info">
          <div className="role-header">
            <div className="role-name">
              {record.name}
              {record.isSystem && (
                <Tag color="red" style={{ marginLeft: 8 }}>系统</Tag>
              )}
            </div>
            <div className="role-code">@{record.code}</div>
          </div>
          <div className="role-description">{record.description}</div>
        </div>
      )
    },
    {
      title: '权限数量',
      dataIndex: 'permissions',
      key: 'permissions',
      width: 120,
      render: (permissions: string[]) => (
        <div className="permission-count">
          <Badge count={permissions.length} showZero color="blue" />
          <span style={{ marginLeft: 8 }}>个权限</span>
        </div>
      )
    },
    {
      title: '用户数量',
      dataIndex: 'userCount',
      key: 'userCount',
      width: 120,
      render: (count: number) => (
        <div className="user-count">
          <UserOutlined style={{ marginRight: 4, color: '#1890ff' }} />
          <span>{count} 人</span>
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string, record) => (
        <Switch
          checked={status === 'active'}
          onChange={(checked) => handleStatusChange(record.id, checked ? 'active' : 'inactive')}
          disabled={record.isSystem}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
      )
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 150,
      render: (time: string) => (
        <Tooltip title={time}>
          <span>{time.split(' ')[0]}</span>
        </Tooltip>
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
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
              onClick={() => handleEditRole(record)}
              disabled={record.isSystem}
            />
          </Tooltip>
          <Tooltip title="权限配置">
            <Button 
              type="text" 
              icon={<KeyOutlined />} 
              onClick={() => handlePermissionConfig(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个角色吗？"
            description="删除后该角色下的用户将失去相应权限"
            onConfirm={() => handleDeleteRole(record.id)}
            okText="确定"
            cancelText="取消"
            disabled={record.isSystem}
          >
            <Tooltip title={record.isSystem ? '系统角色不能删除' : '删除'}>
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />}
                disabled={record.isSystem}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="role-management">
      {/* 页面头部 */}
      <div className="page-header">
        <div className="header-content">
          <Title level={2}>角色管理</Title>
          <Text type="secondary">管理系统角色和权限配置</Text>
        </div>
        <div className="header-actions">
          <Space>
            <Button icon={<ExportOutlined />} onClick={handleExport}>
              导出
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
              刷新
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRole}>
              新增角色
            </Button>
          </Space>
        </div>
      </div>

      {/* 筛选区域 */}
      <Card className="filter-card">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Search
              placeholder="搜索角色名称、编码或描述"
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Button.Group>
              <Button 
                type={selectedStatus === 'all' ? 'primary' : 'default'}
                onClick={() => setSelectedStatus('all')}
              >
                全部
              </Button>
              <Button 
                type={selectedStatus === 'active' ? 'primary' : 'default'}
                onClick={() => setSelectedStatus('active')}
              >
                启用
              </Button>
              <Button 
                type={selectedStatus === 'inactive' ? 'primary' : 'default'}
                onClick={() => setSelectedStatus('inactive')}
              >
                禁用
              </Button>
            </Button.Group>
          </Col>
        </Row>
      </Card>

      {/* 角色列表 */}
      <Card className="table-card">
        <Table
          columns={columns}
          dataSource={filteredRoles}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredRoles.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 新增/编辑角色弹窗 */}
      <Modal
        title={editingRole ? '编辑角色' : '新增角色'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
        className="role-modal"
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
                label="角色名称"
                rules={[{ required: true, message: '请输入角色名称' }]}
              >
                <Input placeholder="请输入角色名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="code"
                label="角色编码"
                rules={[{ required: true, message: '请输入角色编码' }]}
              >
                <Input placeholder="请输入角色编码" disabled={!!editingRole} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="description"
            label="角色描述"
            rules={[{ required: true, message: '请输入角色描述' }]}
          >
            <TextArea rows={3} placeholder="请输入角色描述" />
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
                {editingRole ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 权限配置弹窗 */}
      <Modal
        title="权限配置"
        open={isPermissionModalVisible}
        onCancel={() => setIsPermissionModalVisible(false)}
        onOk={handlePermissionSubmit}
        width={800}
        confirmLoading={loading}
      >
        {selectedRole && (
          <div>
            <div className="role-info-header">
              <TeamOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              <strong>{selectedRole.name}</strong>
              <span style={{ marginLeft: 8, color: '#8c8c8c' }}>@{selectedRole.code}</span>
            </div>
            <Divider />
            <div className="permission-tree-container">
              <Tree
                checkable
                checkedKeys={checkedKeys}
                expandedKeys={expandedKeys}
                onCheck={(checked) => setCheckedKeys(checked as React.Key[])}
                onExpand={(expanded) => setExpandedKeys(expanded)}
                treeData={mockPermissions}
                showIcon
                height={400}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* 角色详情抽屉 */}
      <Drawer
        title="角色详情"
        placement="right"
        onClose={() => setIsDetailDrawerVisible(false)}
        open={isDetailDrawerVisible}
        width={500}
      >
        {selectedRole && (
          <div className="role-detail">
            <div className="detail-section">
              <Descriptions title="基本信息" column={1} bordered>
                <Descriptions.Item label="角色名称">
                  {selectedRole.name}
                  {selectedRole.isSystem && (
                    <Tag color="red" style={{ marginLeft: 8 }}>系统角色</Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="角色编码">{selectedRole.code}</Descriptions.Item>
                <Descriptions.Item label="角色描述">{selectedRole.description}</Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Badge 
                    status={selectedRole.status === 'active' ? 'success' : 'error'} 
                    text={selectedRole.status === 'active' ? '启用' : '禁用'} 
                  />
                </Descriptions.Item>
                <Descriptions.Item label="用户数量">{selectedRole.userCount} 人</Descriptions.Item>
                <Descriptions.Item label="权限数量">{selectedRole.permissions.length} 个</Descriptions.Item>
                <Descriptions.Item label="创建时间">{selectedRole.createTime}</Descriptions.Item>
                <Descriptions.Item label="更新时间">{selectedRole.updateTime}</Descriptions.Item>
              </Descriptions>
            </div>
            
            <Divider />
            
            <div className="detail-section">
              <Title level={5}>权限列表</Title>
              <div className="permissions-list">
                {selectedRole.permissions.length > 0 ? (
                  selectedRole.permissions.map(permission => (
                    <Tag key={permission} color="blue" style={{ marginBottom: 8 }}>
                      {getPermissionName(permission)}
                    </Tag>
                  ))
                ) : (
                  <Text type="secondary">暂无权限</Text>
                )}
              </div>
            </div>
            
            <Divider />
            
            <div className="detail-section">
              <Title level={5}>关联用户</Title>
              <List
                dataSource={mockRoleUsers[selectedRole.id] || []}
                renderItem={(user) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={user.name}
                      description={`@${user.username} · ${user.department}`}
                    />
                  </List.Item>
                )}
                locale={{ emptyText: '暂无关联用户' }}
              />
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default RoleManagement;