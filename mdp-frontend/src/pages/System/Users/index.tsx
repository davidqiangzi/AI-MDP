/**
 * 系统管理 - 用户管理页面
 * 包含用户列表、新增编辑用户、用户状态管理、权限分配
 */

import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  Modal,
  Form,
  message,
  Popconfirm,
  Tag,
  Avatar,
  Drawer,
  Typography,
  Row,
  Col,

  Transfer,
  Divider,
  Tooltip,
  Badge
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,

  UserOutlined,
  MailOutlined,
  PhoneOutlined,

  KeyOutlined,
  ReloadOutlined,
  ExportOutlined,
  ImportOutlined,
  EyeOutlined,
  LockOutlined,
  UnlockOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TransferDirection } from 'antd/es/transfer';
import './index.css';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

// 数据类型定义
interface User {
  id: string;
  username: string;
  realName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  roles: string[];
  status: 'active' | 'inactive' | 'locked';
  lastLogin: string;
  createTime: string;
  avatar?: string;
}

interface Role {
  key: string;
  title: string;
  description: string;
}

interface Department {
  value: string;
  label: string;
}

// 模拟数据
const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    realName: '系统管理员',
    email: 'admin@company.com',
    phone: '13800138000',
    department: '技术部',
    position: '系统管理员',
    roles: ['admin', 'user'],
    status: 'active',
    lastLogin: '2024-01-15 14:30:25',
    createTime: '2023-01-01 00:00:00'
  },
  {
    id: '2',
    username: 'zhangsan',
    realName: '张三',
    email: 'zhangsan@company.com',
    phone: '13800138001',
    department: '数据分析部',
    position: '数据分析师',
    roles: ['analyst', 'user'],
    status: 'active',
    lastLogin: '2024-01-15 16:45:12',
    createTime: '2023-03-15 09:30:00'
  },
  {
    id: '3',
    username: 'lisi',
    realName: '李四',
    email: 'lisi@company.com',
    phone: '13800138002',
    department: '财务部',
    position: '财务专员',
    roles: ['finance', 'user'],
    status: 'inactive',
    lastLogin: '2024-01-10 11:20:45',
    createTime: '2023-05-20 14:15:30'
  },
  {
    id: '4',
    username: 'wangwu',
    realName: '王五',
    email: 'wangwu@company.com',
    phone: '13800138003',
    department: '销售部',
    position: '销售经理',
    roles: ['sales', 'user'],
    status: 'locked',
    lastLogin: '2024-01-05 09:15:30',
    createTime: '2023-07-10 16:45:00'
  },
  {
    id: '5',
    username: 'zhaoliu',
    realName: '赵六',
    email: 'zhaoliu@company.com',
    phone: '13800138004',
    department: '人力资源部',
    position: 'HR专员',
    roles: ['hr', 'user'],
    status: 'active',
    lastLogin: '2024-01-14 17:30:15',
    createTime: '2023-09-05 10:20:45'
  }
];

const mockRoles: Role[] = [
  { key: 'admin', title: '系统管理员', description: '拥有系统所有权限' },
  { key: 'analyst', title: '数据分析师', description: '数据查看和分析权限' },
  { key: 'finance', title: '财务人员', description: '财务数据访问权限' },
  { key: 'sales', title: '销售人员', description: '销售数据访问权限' },
  { key: 'hr', title: 'HR人员', description: '人力资源管理权限' },
  { key: 'user', title: '普通用户', description: '基础功能使用权限' }
];

const mockDepartments: Department[] = [
  { value: '技术部', label: '技术部' },
  { value: '数据分析部', label: '数据分析部' },
  { value: '财务部', label: '财务部' },
  { value: '销售部', label: '销售部' },
  { value: '人力资源部', label: '人力资源部' },
  { value: '运营部', label: '运营部' }
];

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
  const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [roleForm] = Form.useForm();
  const [targetKeys, setTargetKeys] = useState<string[]>([]);

  // 筛选用户数据
  const filteredUsers = users.filter(user => {
    const matchSearch = !searchText || 
      user.realName.toLowerCase().includes(searchText.toLowerCase()) ||
      user.username.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase()) ||
      user.department.toLowerCase().includes(searchText.toLowerCase());
    
    const matchDepartment = selectedDepartment === 'all' || user.department === selectedDepartment;
    const matchStatus = selectedStatus === 'all' || user.status === selectedStatus;
    
    return matchSearch && matchDepartment && matchStatus;
  });

  // 处理新增用户
  const handleAddUser = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 处理编辑用户
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      ...user,
      createTime: undefined // 创建时间不可编辑
    });
    setIsModalVisible(true);
  };

  // 处理删除用户
  const handleDeleteUser = async (userId: string) => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUsers(users.filter(user => user.id !== userId));
      message.success('用户删除成功');
    } catch (error) {
      message.error('删除失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理用户状态切换
  const handleStatusChange = async (userId: string, status: 'active' | 'inactive' | 'locked') => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status } : user
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
      
      if (editingUser) {
        // 编辑用户
        setUsers(users.map(user => 
          user.id === editingUser.id ? { ...user, ...values } : user
        ));
        message.success('用户更新成功');
      } else {
        // 新增用户
        const newUser: User = {
          id: Date.now().toString(),
          ...values,
          roles: ['user'], // 默认角色
          status: 'active',
          lastLogin: '-',
          createTime: new Date().toLocaleString('zh-CN')
        };
        setUsers([...users, newUser]);
        message.success('用户创建成功');
      }
      
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理角色分配
  const handleRoleAssignment = (user: User) => {
    setSelectedUser(user);
    setTargetKeys(user.roles);
    roleForm.setFieldsValue({ userId: user.id });
    setIsRoleModalVisible(true);
  };

  // 处理角色分配提交
  const handleRoleSubmit = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setUsers(users.map(user => 
        user.id === selectedUser.id ? { ...user, roles: targetKeys } : user
      ));
      message.success('角色分配成功');
      setIsRoleModalVisible(false);
    } catch (error) {
      message.error('角色分配失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理穿梭框变化
  const handleTransferChange = (newTargetKeys: React.Key[], direction: TransferDirection, moveKeys: React.Key[]) => {
    setTargetKeys(newTargetKeys as string[]);
  };

  // 查看用户详情
  const handleViewDetail = (user: User) => {
    setSelectedUser(user);
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

  // 导出用户数据
  const handleExport = () => {
    message.success('用户数据导出成功');
  };

  // 导入用户数据
  const handleImport = () => {
    message.success('用户数据导入成功');
  };

  // 表格列定义
  const columns: ColumnsType<User> = [
    {
      title: '用户信息',
      key: 'userInfo',
      width: 200,
      render: (_, record) => (
        <div className="user-info">
          <Avatar 
            size={40} 
            icon={<UserOutlined />} 
            src={record.avatar}
            style={{ marginRight: 12 }}
          />
          <div className="user-details">
            <div className="user-name">{record.realName}</div>
            <div className="user-username">@{record.username}</div>
          </div>
        </div>
      )
    },
    {
      title: '联系方式',
      key: 'contact',
      width: 200,
      render: (_, record) => (
        <div className="contact-info">
          <div className="contact-item">
            <MailOutlined style={{ marginRight: 6, color: '#1890ff' }} />
            <span>{record.email}</span>
          </div>
          <div className="contact-item">
            <PhoneOutlined style={{ marginRight: 6, color: '#52c41a' }} />
            <span>{record.phone}</span>
          </div>
        </div>
      )
    },
    {
      title: '部门职位',
      key: 'department',
      width: 150,
      render: (_, record) => (
        <div className="dept-info">
          <div className="dept-name">{record.department}</div>
          <div className="position">{record.position}</div>
        </div>
      )
    },
    {
      title: '角色',
      dataIndex: 'roles',
      key: 'roles',
      width: 150,
      render: (roles: string[]) => (
        <div className="roles-container">
          {roles.map(role => {
            const roleInfo = mockRoles.find(r => r.key === role);
            return (
              <Tag key={role} color="blue" style={{ marginBottom: 4 }}>
                {roleInfo?.title || role}
              </Tag>
            );
          })}
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusConfig = {
          active: { color: 'success', text: '正常' },
          inactive: { color: 'warning', text: '禁用' },
          locked: { color: 'error', text: '锁定' }
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Badge status={config.color as any} text={config.text} />;
      }
    },
    {
      title: '最后登录',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 150,
      render: (time: string) => (
        <Tooltip title={time}>
          <span>{time === '-' ? '从未登录' : time.split(' ')[0]}</span>
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
              onClick={() => handleEditUser(record)}
            />
          </Tooltip>
          <Tooltip title="角色分配">
            <Button 
              type="text" 
              icon={<KeyOutlined />} 
              onClick={() => handleRoleAssignment(record)}
            />
          </Tooltip>
          {record.status === 'active' ? (
            <Tooltip title="禁用">
              <Button 
                type="text" 
                icon={<LockOutlined />} 
                onClick={() => handleStatusChange(record.id, 'inactive')}
              />
            </Tooltip>
          ) : (
            <Tooltip title="启用">
              <Button 
                type="text" 
                icon={<UnlockOutlined />} 
                onClick={() => handleStatusChange(record.id, 'active')}
              />
            </Tooltip>
          )}
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDeleteUser(record.id)}
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

  return (
    <div className="user-management">
      {/* 页面头部 */}
      <div className="page-header">
        <div className="header-content">
          <Title level={2}>用户管理</Title>
          <Text type="secondary">管理系统用户账户、权限和状态</Text>
        </div>
        <div className="header-actions">
          <Space>
            <Button icon={<ImportOutlined />} onClick={handleImport}>
              导入
            </Button>
            <Button icon={<ExportOutlined />} onClick={handleExport}>
              导出
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
              刷新
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddUser}>
              新增用户
            </Button>
          </Space>
        </div>
      </div>

      {/* 筛选区域 */}
      <Card className="filter-card">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Search
              placeholder="搜索用户名、姓名、邮箱或部门"
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="选择部门"
              value={selectedDepartment}
              onChange={setSelectedDepartment}
              style={{ width: '100%' }}
            >
              <Option value="all">全部部门</Option>
              {mockDepartments.map(dept => (
                <Option key={dept.value} value={dept.value}>{dept.label}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="选择状态"
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: '100%' }}
            >
              <Option value="all">全部状态</Option>
              <Option value="active">正常</Option>
              <Option value="inactive">禁用</Option>
              <Option value="locked">锁定</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* 用户列表 */}
      <Card className="table-card">
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredUsers.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 新增/编辑用户弹窗 */}
      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
        className="user-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input placeholder="请输入用户名" disabled={!!editingUser} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="realName"
                label="真实姓名"
                rules={[{ required: true, message: '请输入真实姓名' }]}
              >
                <Input placeholder="请输入真实姓名" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="手机号"
                rules={[{ required: true, message: '请输入手机号' }]}
              >
                <Input placeholder="请输入手机号" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="department"
                label="部门"
                rules={[{ required: true, message: '请选择部门' }]}
              >
                <Select placeholder="请选择部门">
                  {mockDepartments.map(dept => (
                    <Option key={dept.value} value={dept.value}>{dept.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="position"
                label="职位"
                rules={[{ required: true, message: '请输入职位' }]}
              >
                <Input placeholder="请输入职位" />
              </Form.Item>
            </Col>
          </Row>
          
          {!editingUser && (
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}
          
          <Form.Item className="form-actions">
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingUser ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 角色分配弹窗 */}
      <Modal
        title="角色分配"
        open={isRoleModalVisible}
        onCancel={() => setIsRoleModalVisible(false)}
        onOk={handleRoleSubmit}
        width={600}
        confirmLoading={loading}
      >
        {selectedUser && (
          <div>
            <div className="user-info-header">
              <Avatar icon={<UserOutlined />} style={{ marginRight: 12 }} />
              <div>
                <div><strong>{selectedUser.realName}</strong></div>
                <div className="text-secondary">@{selectedUser.username}</div>
              </div>
            </div>
            <Divider />
            <Transfer
              dataSource={mockRoles}
              titles={['可选角色', '已分配角色']}
              targetKeys={targetKeys}
              onChange={handleTransferChange}
              render={item => `${item.title} - ${item.description}`}
              style={{ marginBottom: 16 }}
            />
          </div>
        )}
      </Modal>

      {/* 用户详情抽屉 */}
      <Drawer
        title="用户详情"
        placement="right"
        onClose={() => setIsDetailDrawerVisible(false)}
        open={isDetailDrawerVisible}
        width={400}
      >
        {selectedUser && (
          <div className="user-detail">
            <div className="detail-section">
              <div className="section-header">
                <Avatar size={64} icon={<UserOutlined />} src={selectedUser.avatar} />
                <div className="user-basic-info">
                  <Title level={4}>{selectedUser.realName}</Title>
                  <Text type="secondary">@{selectedUser.username}</Text>
                </div>
              </div>
            </div>
            
            <Divider />
            
            <div className="detail-section">
              <Title level={5}>基本信息</Title>
              <div className="info-item">
                <Text strong>邮箱：</Text>
                <Text>{selectedUser.email}</Text>
              </div>
              <div className="info-item">
                <Text strong>手机：</Text>
                <Text>{selectedUser.phone}</Text>
              </div>
              <div className="info-item">
                <Text strong>部门：</Text>
                <Text>{selectedUser.department}</Text>
              </div>
              <div className="info-item">
                <Text strong>职位：</Text>
                <Text>{selectedUser.position}</Text>
              </div>
            </div>
            
            <Divider />
            
            <div className="detail-section">
              <Title level={5}>角色权限</Title>
              <div className="roles-list">
                {selectedUser.roles.map(role => {
                  const roleInfo = mockRoles.find(r => r.key === role);
                  return (
                    <div key={role} className="role-item">
                      <Tag color="blue">{roleInfo?.title || role}</Tag>
                      <Text type="secondary">{roleInfo?.description}</Text>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <Divider />
            
            <div className="detail-section">
              <Title level={5}>账户状态</Title>
              <div className="info-item">
                <Text strong>状态：</Text>
                <Badge 
                  status={selectedUser.status === 'active' ? 'success' : selectedUser.status === 'inactive' ? 'warning' : 'error'} 
                  text={selectedUser.status === 'active' ? '正常' : selectedUser.status === 'inactive' ? '禁用' : '锁定'} 
                />
              </div>
              <div className="info-item">
                <Text strong>最后登录：</Text>
                <Text>{selectedUser.lastLogin}</Text>
              </div>
              <div className="info-item">
                <Text strong>创建时间：</Text>
                <Text>{selectedUser.createTime}</Text>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default UserManagement;