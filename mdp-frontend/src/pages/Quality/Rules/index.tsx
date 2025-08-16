/**
 * 质量规则页面
 * 包含规则列表、创建编辑、批量操作、详情弹窗等功能
 */

import React, { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Modal,
  Form,
  Card,
  Row,
  Col,
  Tooltip,
  Popconfirm,
  message,
  Drawer,
  Descriptions,
  InputNumber,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CopyOutlined,
  DownloadOutlined,
  ExportOutlined,
  ReloadOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import './index.css';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

// 质量规则数据类型
interface QualityRule {
  id: string;
  name: string;
  description: string;
  type: 'completeness' | 'accuracy' | 'consistency' | 'validity' | 'uniqueness';
  status: 'active' | 'inactive' | 'draft';
  severity: 'high' | 'medium' | 'low';
  dataSource: string;
  table: string;
  field: string;
  condition: string;
  threshold: number;
  creator: string;
  createTime: string;
  updateTime: string;
  lastRunTime?: string;
  passRate?: number;
}

// 模拟数据
const mockRules: QualityRule[] = [
  {
    id: '1',
    name: '用户邮箱格式验证',
    description: '验证用户表中邮箱字段的格式是否正确',
    type: 'validity',
    status: 'active',
    severity: 'high',
    dataSource: 'MySQL-用户数据库',
    table: 'users',
    field: 'email',
    condition: 'REGEXP_LIKE(email, \'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\')',
    threshold: 95,
    creator: '张三',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-20 14:20:00',
    lastRunTime: '2024-01-25 09:15:00',
    passRate: 98.5,
  },
  {
    id: '2',
    name: '订单金额完整性检查',
    description: '检查订单表中金额字段是否存在空值',
    type: 'completeness',
    status: 'active',
    severity: 'high',
    dataSource: 'MySQL-订单数据库',
    table: 'orders',
    field: 'amount',
    condition: 'amount IS NOT NULL AND amount > 0',
    threshold: 100,
    creator: '李四',
    createTime: '2024-01-10 16:45:00',
    updateTime: '2024-01-22 11:30:00',
    lastRunTime: '2024-01-25 08:00:00',
    passRate: 99.8,
  },
];

/**
 * 质量规则页面组件
 */
const QualityRulesPage: React.FC = () => {
  const [rules, setRules] = useState<QualityRule[]>(mockRules);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [editingRule, setEditingRule] = useState<QualityRule | null>(null);
  const [viewingRule, setViewingRule] = useState<QualityRule | null>(null);
  const [form] = Form.useForm();

  // 规则类型选项
  const ruleTypes = [
    { value: 'completeness', label: '完整性', color: 'blue' },
    { value: 'accuracy', label: '准确性', color: 'green' },
    { value: 'consistency', label: '一致性', color: 'orange' },
    { value: 'validity', label: '有效性', color: 'purple' },
    { value: 'uniqueness', label: '唯一性', color: 'cyan' },
  ];

  // 规则状态选项
  const ruleStatuses = [
    { value: 'active', label: '启用', color: 'success' },
    { value: 'inactive', label: '禁用', color: 'default' },
    { value: 'draft', label: '草稿', color: 'warning' },
  ];

  // 严重程度选项
  const severityOptions = [
    { value: 'high', label: '高', color: 'error' },
    { value: 'medium', label: '中', color: 'warning' },
    { value: 'low', label: '低', color: 'success' },
  ];

  // 表格列配置
  const columns: ColumnsType<QualityRule> = [
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
      render: (text: string, record: QualityRule) => (
        <Tooltip title={record.description}>
          <Button type="link" onClick={() => handleViewRule(record)}>
            {text}
          </Button>
        </Tooltip>
      ),
    },
    {
      title: '规则类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => {
        const typeConfig = ruleTypes.find(t => t.value === type);
        return (
          <Tag color={typeConfig?.color}>
            {typeConfig?.label}
          </Tag>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusConfig = ruleStatuses.find(s => s.value === status);
        return (
          <Tag color={statusConfig?.color}>
            {statusConfig?.label}
          </Tag>
        );
      },
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (severity: string) => {
        const severityConfig = severityOptions.find(s => s.value === severity);
        return (
          <Tag color={severityConfig?.color}>
            {severityConfig?.label}
          </Tag>
        );
      },
    },
    {
      title: '数据源',
      dataIndex: 'dataSource',
      key: 'dataSource',
      width: 150,
      ellipsis: true,
    },
    {
      title: '表/字段',
      key: 'tableField',
      width: 150,
      render: (_, record) => `${record.table}.${record.field}`,
      ellipsis: true,
    },
    {
      title: '通过率',
      dataIndex: 'passRate',
      key: 'passRate',
      width: 100,
      render: (rate?: number) => {
        if (rate === undefined) return '-';
        const color = rate >= 95 ? 'success' : rate >= 80 ? 'warning' : 'error';
        return <Tag color={color}>{rate}%</Tag>;
      },
    },
    {
      title: '最后运行',
      dataIndex: 'lastRunTime',
      key: 'lastRunTime',
      width: 150,
      render: (time?: string) => time || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewRule(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditRule(record)}
            />
          </Tooltip>
          <Tooltip title={record.status === 'active' ? '暂停' : '启用'}>
            <Button
              type="text"
              icon={record.status === 'active' ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={() => handleToggleStatus(record)}
            />
          </Tooltip>
          <Tooltip title="复制">
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={() => handleCopyRule(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="确定要删除这个规则吗？"
              onConfirm={() => handleDeleteRule(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  // 处理筛选
  const filteredRules = rules.filter(rule => {
    const matchSearch = !searchText || 
      rule.name.toLowerCase().includes(searchText.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchText.toLowerCase());
    const matchType = !selectedType || rule.type === selectedType;
    const matchStatus = !selectedStatus || rule.status === selectedStatus;
    return matchSearch && matchType && matchStatus;
  });

  // 处理新建规则
  const handleCreateRule = () => {
    setEditingRule(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 处理编辑规则
  const handleEditRule = (rule: QualityRule) => {
    setEditingRule(rule);
    form.setFieldsValue(rule);
    setIsModalVisible(true);
  };

  // 处理查看规则详情
  const handleViewRule = (rule: QualityRule) => {
    setViewingRule(rule);
    setIsDetailVisible(true);
  };

  // 处理保存规则
  const handleSaveRule = async (values: any) => {
    try {
      setLoading(true);
      
      if (editingRule) {
        // 更新规则
        const updatedRules = rules.map(rule => 
          rule.id === editingRule.id 
            ? { ...rule, ...values, updateTime: new Date().toLocaleString() }
            : rule
        );
        setRules(updatedRules);
        message.success('规则更新成功');
      } else {
        // 新建规则
        const newRule: QualityRule = {
          ...values,
          id: Date.now().toString(),
          creator: '当前用户',
          createTime: new Date().toLocaleString(),
          updateTime: new Date().toLocaleString(),
        };
        setRules([newRule, ...rules]);
        message.success('规则创建成功');
      }
      
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理删除规则
  const handleDeleteRule = (id: string) => {
    const updatedRules = rules.filter(rule => rule.id !== id);
    setRules(updatedRules);
    message.success('规则删除成功');
  };

  // 处理切换状态
  const handleToggleStatus = (rule: QualityRule) => {
    const newStatus: QualityRule['status'] = rule.status === 'active' ? 'inactive' : 'active';
    const updatedRules = rules.map(r => 
      r.id === rule.id 
        ? { ...r, status: newStatus, updateTime: new Date().toLocaleString() }
        : r
    );
    setRules(updatedRules);
    message.success(`规则已${newStatus === 'active' ? '启用' : '暂停'}`);
  };

  // 处理复制规则
  const handleCopyRule = (rule: QualityRule) => {
    const copiedRule: QualityRule = {
      ...rule,
      id: Date.now().toString(),
      name: `${rule.name}_副本`,
      status: 'draft',
      creator: '当前用户',
      createTime: new Date().toLocaleString(),
      updateTime: new Date().toLocaleString(),
      lastRunTime: undefined,
      passRate: undefined,
    };
    setRules([copiedRule, ...rules]);
    message.success('规则复制成功');
  };

  // 处理批量删除
  const handleBatchDelete = () => {
    const updatedRules = rules.filter(rule => !selectedRowKeys.includes(rule.id));
    setRules(updatedRules);
    setSelectedRowKeys([]);
    message.success(`已删除 ${selectedRowKeys.length} 个规则`);
  };

  // 处理批量启用/禁用
  const handleBatchToggle = (status: QualityRule['status']) => {
    const updatedRules = rules.map(rule => 
      selectedRowKeys.includes(rule.id)
        ? { ...rule, status, updateTime: new Date().toLocaleString() }
        : rule
    );
    setRules(updatedRules);
    setSelectedRowKeys([]);
    message.success(`已${status === 'active' ? '启用' : '禁用'} ${selectedRowKeys.length} 个规则`);
  };

  return (
    <div className="quality-rules-page">
      {/* 页面头部 */}
      <Card className="rules-header" bodyStyle={{ padding: '16px 24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space size="middle">
              <Search
                placeholder="搜索规则名称或描述"
                allowClear
                style={{ width: 300 }}
                onSearch={handleSearch}
              />
              <Select
                placeholder="规则类型"
                allowClear
                style={{ width: 120 }}
                value={selectedType}
                onChange={setSelectedType}
              >
                {ruleTypes.map(type => (
                  <Option key={type.value} value={type.value}>
                    {type.label}
                  </Option>
                ))}
              </Select>
              <Select
                placeholder="状态"
                allowClear
                style={{ width: 100 }}
                value={selectedStatus}
                onChange={setSelectedStatus}
              >
                {ruleStatuses.map(status => (
                  <Option key={status.value} value={status.value}>
                    {status.label}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateRule}
              >
                新建规则
              </Button>
              <Button icon={<DownloadOutlined />}>
                导出
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 批量操作栏 */}
      {selectedRowKeys.length > 0 && (
        <Card className="batch-actions" bodyStyle={{ padding: '12px 24px' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <span>已选择 {selectedRowKeys.length} 项</span>
            </Col>
            <Col>
              <Space>
                <Button
                  size="small"
                  onClick={() => handleBatchToggle('active')}
                >
                  批量启用
                </Button>
                <Button
                  size="small"
                  onClick={() => handleBatchToggle('inactive')}
                >
                  批量禁用
                </Button>
                <Popconfirm
                  title={`确定要删除选中的 ${selectedRowKeys.length} 个规则吗？`}
                  onConfirm={handleBatchDelete}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button size="small" danger>
                    批量删除
                  </Button>
                </Popconfirm>
              </Space>
            </Col>
          </Row>
        </Card>
      )}

      {/* 规则列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredRules}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            total: filteredRules.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
        />
      </Card>

      {/* 新建/编辑规则弹窗 */}
      <Modal
        title={editingRule ? '编辑规则' : '新建规则'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveRule}
          initialValues={{
            status: 'draft',
            severity: 'medium',
            threshold: 95,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="规则名称"
                rules={[{ required: true, message: '请输入规则名称' }]}
              >
                <Input placeholder="请输入规则名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="规则类型"
                rules={[{ required: true, message: '请选择规则类型' }]}
              >
                <Select placeholder="请选择规则类型">
                  {ruleTypes.map(type => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="description"
            label="规则描述"
            rules={[{ required: true, message: '请输入规则描述' }]}
          >
            <TextArea rows={3} placeholder="请输入规则描述" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="dataSource"
                label="数据源"
                rules={[{ required: true, message: '请输入数据源' }]}
              >
                <Input placeholder="请输入数据源" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="table"
                label="表名"
                rules={[{ required: true, message: '请输入表名' }]}
              >
                <Input placeholder="请输入表名" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="field"
                label="字段名"
                rules={[{ required: true, message: '请输入字段名' }]}
              >
                <Input placeholder="请输入字段名" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="condition"
            label="规则条件"
            rules={[{ required: true, message: '请输入规则条件' }]}
          >
            <TextArea rows={3} placeholder="请输入SQL条件表达式" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="threshold"
                label="阈值(%)"
                rules={[{ required: true, message: '请输入阈值' }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  style={{ width: '100%' }}
                  placeholder="请输入阈值"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="severity"
                label="严重程度"
                rules={[{ required: true, message: '请选择严重程度' }]}
              >
                <Select placeholder="请选择严重程度">
                  {severityOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  {ruleStatuses.map(status => (
                    <Option key={status.value} value={status.value}>
                      {status.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingRule ? '更新' : '创建'}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 规则详情抽屉 */}
      <Drawer
        title="规则详情"
        placement="right"
        width={600}
        open={isDetailVisible}
        onClose={() => setIsDetailVisible(false)}
      >
        {viewingRule && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="规则名称">
              {viewingRule.name}
            </Descriptions.Item>
            <Descriptions.Item label="规则描述">
              {viewingRule.description}
            </Descriptions.Item>
            <Descriptions.Item label="规则类型">
              <Tag color={ruleTypes.find(t => t.value === viewingRule.type)?.color}>
                {ruleTypes.find(t => t.value === viewingRule.type)?.label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={ruleStatuses.find(s => s.value === viewingRule.status)?.color}>
                {ruleStatuses.find(s => s.value === viewingRule.status)?.label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="严重程度">
              <Tag color={severityOptions.find(s => s.value === viewingRule.severity)?.color}>
                {severityOptions.find(s => s.value === viewingRule.severity)?.label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="数据源">
              {viewingRule.dataSource}
            </Descriptions.Item>
            <Descriptions.Item label="表名">
              {viewingRule.table}
            </Descriptions.Item>
            <Descriptions.Item label="字段名">
              {viewingRule.field}
            </Descriptions.Item>
            <Descriptions.Item label="规则条件">
              <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                {viewingRule.condition}
              </pre>
            </Descriptions.Item>
            <Descriptions.Item label="阈值">
              {viewingRule.threshold}%
            </Descriptions.Item>
            <Descriptions.Item label="通过率">
              {viewingRule.passRate ? (
                <Tag color={viewingRule.passRate >= 95 ? 'success' : viewingRule.passRate >= 80 ? 'warning' : 'error'}>
                  {viewingRule.passRate}%
                </Tag>
              ) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="创建人">
              {viewingRule.creator}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {viewingRule.createTime}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {viewingRule.updateTime}
            </Descriptions.Item>
            <Descriptions.Item label="最后运行时间">
              {viewingRule.lastRunTime || '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};

export default QualityRulesPage;