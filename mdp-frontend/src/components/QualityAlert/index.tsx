import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  Table,
  Modal,
  Space,
  Tag,
  Divider,
  Row,
  Col,
  Alert,
  Tooltip,
  Badge,
  Popconfirm,
  message,
  TimePicker,
  Checkbox,
  Radio,
  Slider,
  Progress
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BellOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SettingOutlined,
  NotificationOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import './index.css';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = TimePicker;

// 预警级别枚举
enum AlertLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// 预警状态枚举
enum AlertStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TRIGGERED = 'triggered',
  RESOLVED = 'resolved'
}

// 通知方式枚举
enum NotificationMethod {
  EMAIL = 'email',
  SMS = 'sms',
  WEBHOOK = 'webhook',
  SYSTEM = 'system'
}

// 预警规则接口
interface AlertRule {
  id: string;
  name: string;
  description: string;
  metric: string;
  operator: string;
  threshold: number;
  level: AlertLevel;
  status: AlertStatus;
  enabled: boolean;
  notificationMethods: NotificationMethod[];
  recipients: string[];
  cooldownPeriod: number; // 冷却期（分钟）
  activeTime?: [string, string]; // 生效时间段
  conditions?: string; // 额外条件
  createdAt: string;
  updatedAt: string;
  triggeredCount: number;
  lastTriggered?: string;
}

// 预警历史接口
interface AlertHistory {
  id: string;
  ruleId: string;
  ruleName: string;
  level: AlertLevel;
  message: string;
  value: number;
  threshold: number;
  status: 'triggered' | 'resolved';
  triggeredAt: string;
  resolvedAt?: string;
  duration?: number; // 持续时间（分钟）
}

// 通知配置接口
interface NotificationConfig {
  id: string;
  method: NotificationMethod;
  enabled: boolean;
  config: {
    email?: {
      smtp: string;
      port: number;
      username: string;
      password: string;
      from: string;
    };
    sms?: {
      provider: string;
      apiKey: string;
      template: string;
    };
    webhook?: {
      url: string;
      method: 'POST' | 'GET';
      headers: Record<string, string>;
      template: string;
    };
    system?: {
      sound: boolean;
      popup: boolean;
      badge: boolean;
    };
  };
}

interface QualityAlertProps {
  className?: string;
}

const QualityAlert: React.FC<QualityAlertProps> = ({ className }) => {
  const [form] = Form.useForm();
  const [configForm] = Form.useForm();
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [alertHistory, setAlertHistory] = useState<AlertHistory[]>([]);
  const [notificationConfigs, setNotificationConfigs] = useState<NotificationConfig[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isConfigModalVisible, setIsConfigModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [editingConfig, setEditingConfig] = useState<NotificationConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('rules');

  // 模拟数据
  useEffect(() => {
    const mockRules: AlertRule[] = [
      {
        id: '1',
        name: '数据完整性告警',
        description: '当数据完整性低于90%时触发告警',
        metric: 'completeness',
        operator: '<',
        threshold: 90,
        level: AlertLevel.HIGH,
        status: AlertStatus.ACTIVE,
        enabled: true,
        notificationMethods: [NotificationMethod.EMAIL, NotificationMethod.SYSTEM],
        recipients: ['admin@example.com', 'quality@example.com'],
        cooldownPeriod: 30,
        activeTime: ['09:00', '18:00'],
        createdAt: '2024-01-15 10:30:00',
        updatedAt: '2024-01-20 14:20:00',
        triggeredCount: 5,
        lastTriggered: '2024-01-20 14:20:00'
      },
      {
        id: '2',
        name: '数据准确性告警',
        description: '当数据准确性低于95%时触发告警',
        metric: 'accuracy',
        operator: '<',
        threshold: 95,
        level: AlertLevel.MEDIUM,
        status: AlertStatus.ACTIVE,
        enabled: true,
        notificationMethods: [NotificationMethod.EMAIL],
        recipients: ['quality@example.com'],
        cooldownPeriod: 60,
        createdAt: '2024-01-10 09:15:00',
        updatedAt: '2024-01-18 11:45:00',
        triggeredCount: 2,
        lastTriggered: '2024-01-18 11:45:00'
      }
    ];

    const mockHistory: AlertHistory[] = [
      {
        id: '1',
        ruleId: '1',
        ruleName: '数据完整性告警',
        level: AlertLevel.HIGH,
        message: '数据完整性为85%，低于阈值90%',
        value: 85,
        threshold: 90,
        status: 'resolved',
        triggeredAt: '2024-01-20 14:20:00',
        resolvedAt: '2024-01-20 15:30:00',
        duration: 70
      },
      {
        id: '2',
        ruleId: '2',
        ruleName: '数据准确性告警',
        level: AlertLevel.MEDIUM,
        message: '数据准确性为92%，低于阈值95%',
        value: 92,
        threshold: 95,
        status: 'triggered',
        triggeredAt: '2024-01-20 16:45:00'
      }
    ];

    const mockConfigs: NotificationConfig[] = [
      {
        id: '1',
        method: NotificationMethod.EMAIL,
        enabled: true,
        config: {
          email: {
            smtp: 'smtp.example.com',
            port: 587,
            username: 'noreply@example.com',
            password: '******',
            from: 'MDP质量监控 <noreply@example.com>'
          }
        }
      },
      {
        id: '2',
        method: NotificationMethod.SYSTEM,
        enabled: true,
        config: {
          system: {
            sound: true,
            popup: true,
            badge: true
          }
        }
      }
    ];

    setAlertRules(mockRules);
    setAlertHistory(mockHistory);
    setNotificationConfigs(mockConfigs);
  }, []);

  // 获取级别颜色
  const getLevelColor = (level: AlertLevel) => {
    const colors = {
      [AlertLevel.LOW]: 'blue',
      [AlertLevel.MEDIUM]: 'orange',
      [AlertLevel.HIGH]: 'red',
      [AlertLevel.CRITICAL]: 'purple'
    };
    return colors[level];
  };

  // 获取状态颜色
  const getStatusColor = (status: AlertStatus) => {
    const colors = {
      [AlertStatus.ACTIVE]: 'green',
      [AlertStatus.INACTIVE]: 'default',
      [AlertStatus.TRIGGERED]: 'red',
      [AlertStatus.RESOLVED]: 'blue'
    };
    return colors[status];
  };

  // 处理创建/编辑规则
  const handleSaveRule = async (values: any) => {
    setLoading(true);
    try {
      const ruleData: AlertRule = {
        id: editingRule?.id || Date.now().toString(),
        ...values,
        status: AlertStatus.ACTIVE,
        createdAt: editingRule?.createdAt || new Date().toLocaleString(),
        updatedAt: new Date().toLocaleString(),
        triggeredCount: editingRule?.triggeredCount || 0
      };

      if (editingRule) {
        setAlertRules(prev => prev.map(rule => rule.id === editingRule.id ? ruleData : rule));
        message.success('预警规则更新成功');
      } else {
        setAlertRules(prev => [...prev, ruleData]);
        message.success('预警规则创建成功');
      }

      setIsModalVisible(false);
      setEditingRule(null);
      form.resetFields();
    } catch (error) {
      message.error('操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理删除规则
  const handleDeleteRule = async (id: string) => {
    try {
      setAlertRules(prev => prev.filter(rule => rule.id !== id));
      message.success('预警规则删除成功');
    } catch (error) {
      message.error('删除失败，请重试');
    }
  };

  // 处理启用/禁用规则
  const handleToggleRule = async (id: string, enabled: boolean) => {
    try {
      setAlertRules(prev => prev.map(rule => 
        rule.id === id ? { ...rule, enabled, updatedAt: new Date().toLocaleString() } : rule
      ));
      message.success(`规则已${enabled ? '启用' : '禁用'}`);
    } catch (error) {
      message.error('操作失败，请重试');
    }
  };

  // 处理保存通知配置
  const handleSaveConfig = async (values: any) => {
    setLoading(true);
    try {
      const configData: NotificationConfig = {
        id: editingConfig?.id || Date.now().toString(),
        ...values
      };

      if (editingConfig) {
        setNotificationConfigs(prev => prev.map(config => 
          config.id === editingConfig.id ? configData : config
        ));
        message.success('通知配置更新成功');
      } else {
        setNotificationConfigs(prev => [...prev, configData]);
        message.success('通知配置创建成功');
      }

      setIsConfigModalVisible(false);
      setEditingConfig(null);
      configForm.resetFields();
    } catch (error) {
      message.error('操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 规则表格列定义
  const ruleColumns = [
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: AlertRule) => (
        <div>
          <div className="rule-name">{text}</div>
          <div className="rule-description">{record.description}</div>
        </div>
      )
    },
    {
      title: '监控指标',
      dataIndex: 'metric',
      key: 'metric',
      render: (metric: string) => {
        const metricNames: Record<string, string> = {
          completeness: '完整性',
          accuracy: '准确性',
          consistency: '一致性',
          timeliness: '及时性',
          validity: '有效性'
        };
        return <Tag color="blue">{metricNames[metric] || metric}</Tag>;
      }
    },
    {
      title: '阈值条件',
      key: 'condition',
      render: (record: AlertRule) => (
        <span className="threshold-condition">
          {record.operator} {record.threshold}%
        </span>
      )
    },
    {
      title: '告警级别',
      dataIndex: 'level',
      key: 'level',
      render: (level: AlertLevel) => (
        <Tag color={getLevelColor(level)}>
          {level.toUpperCase()}
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: AlertStatus, record: AlertRule) => (
        <div>
          <Tag color={getStatusColor(status)}>
            {status.toUpperCase()}
          </Tag>
          <div className="rule-stats">
            <span>触发次数: {record.triggeredCount}</span>
          </div>
        </div>
      )
    },
    {
      title: '启用状态',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean, record: AlertRule) => (
        <Switch
          checked={enabled}
          onChange={(checked) => handleToggleRule(record.id, checked)}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
      )
    },
    {
      title: '操作',
      key: 'actions',
      render: (record: AlertRule) => (
        <Space>
          <Tooltip title="编辑规则">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingRule(record);
                form.setFieldsValue(record);
                setIsModalVisible(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个预警规则吗？"
            onConfirm={() => handleDeleteRule(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除规则">
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

  // 历史记录表格列定义
  const historyColumns = [
    {
      title: '触发时间',
      dataIndex: 'triggeredAt',
      key: 'triggeredAt',
      sorter: true
    },
    {
      title: '规则名称',
      dataIndex: 'ruleName',
      key: 'ruleName'
    },
    {
      title: '告警级别',
      dataIndex: 'level',
      key: 'level',
      render: (level: AlertLevel) => (
        <Tag color={getLevelColor(level)}>
          {level.toUpperCase()}
        </Tag>
      )
    },
    {
      title: '告警信息',
      dataIndex: 'message',
      key: 'message'
    },
    {
      title: '当前值/阈值',
      key: 'values',
      render: (record: AlertHistory) => (
        <span>
          <span className={record.value < record.threshold ? 'value-danger' : 'value-normal'}>
            {record.value}%
          </span>
          {' / '}
          <span className="threshold-value">{record.threshold}%</span>
        </span>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: AlertHistory) => (
        <div>
          <Tag color={status === 'triggered' ? 'red' : 'green'}>
            {status === 'triggered' ? '已触发' : '已解决'}
          </Tag>
          {record.duration && (
            <div className="duration-info">
              持续时间: {record.duration}分钟
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className={`quality-alert ${className || ''}`}>
      {/* 统计概览 */}
      <Row gutter={16} className="alert-stats">
        <Col span={6}>
          <Card className="stat-card">
            <div className="stat-content">
              <div className="stat-icon critical">
                <ExclamationCircleOutlined />
              </div>
              <div className="stat-info">
                <div className="stat-value">{alertRules.filter(r => r.level === AlertLevel.CRITICAL).length}</div>
                <div className="stat-label">严重告警</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <div className="stat-content">
              <div className="stat-icon high">
                <WarningOutlined />
              </div>
              <div className="stat-info">
                <div className="stat-value">{alertRules.filter(r => r.level === AlertLevel.HIGH).length}</div>
                <div className="stat-label">高级告警</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <div className="stat-content">
              <div className="stat-icon active">
                <CheckCircleOutlined />
              </div>
              <div className="stat-info">
                <div className="stat-value">{alertRules.filter(r => r.enabled).length}</div>
                <div className="stat-label">活跃规则</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <div className="stat-content">
              <div className="stat-icon triggered">
                <BellOutlined />
              </div>
              <div className="stat-info">
                <div className="stat-value">{alertHistory.filter(h => h.status === 'triggered').length}</div>
                <div className="stat-label">待处理</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 主要内容区域 */}
      <Card className="main-content">
        <div className="content-header">
          <div className="tab-buttons">
            <Button
              type={activeTab === 'rules' ? 'primary' : 'default'}
              onClick={() => setActiveTab('rules')}
              icon={<SettingOutlined />}
            >
              预警规则
            </Button>
            <Button
              type={activeTab === 'history' ? 'primary' : 'default'}
              onClick={() => setActiveTab('history')}
              icon={<BellOutlined />}
            >
              告警历史
            </Button>
            <Button
              type={activeTab === 'config' ? 'primary' : 'default'}
              onClick={() => setActiveTab('config')}
              icon={<NotificationOutlined />}
            >
              通知配置
            </Button>
          </div>
          {activeTab === 'rules' && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingRule(null);
                form.resetFields();
                setIsModalVisible(true);
              }}
            >
              新建规则
            </Button>
          )}
          {activeTab === 'config' && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingConfig(null);
                configForm.resetFields();
                setIsConfigModalVisible(true);
              }}
            >
              新建配置
            </Button>
          )}
        </div>

        {/* 预警规则表格 */}
        {activeTab === 'rules' && (
          <Table
            columns={ruleColumns}
            dataSource={alertRules}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`
            }}
          />
        )}

        {/* 告警历史表格 */}
        {activeTab === 'history' && (
          <Table
            columns={historyColumns}
            dataSource={alertHistory}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`
            }}
          />
        )}

        {/* 通知配置 */}
        {activeTab === 'config' && (
          <div className="notification-configs">
            {notificationConfigs.map(config => (
              <Card key={config.id} className="config-card">
                <div className="config-header">
                  <div className="config-info">
                    <Badge
                      status={config.enabled ? 'success' : 'default'}
                      text={
                        <span className="config-title">
                          {config.method.toUpperCase()} 通知
                        </span>
                      }
                    />
                  </div>
                  <div className="config-actions">
                    <Switch
                      checked={config.enabled}
                      onChange={(checked) => {
                        setNotificationConfigs(prev => prev.map(c => 
                          c.id === config.id ? { ...c, enabled: checked } : c
                        ));
                      }}
                    />
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => {
                        setEditingConfig(config);
                        configForm.setFieldsValue(config);
                        setIsConfigModalVisible(true);
                      }}
                    />
                  </div>
                </div>
                <div className="config-details">
                  {config.method === NotificationMethod.EMAIL && config.config.email && (
                    <div>
                      <p>SMTP服务器: {config.config.email.smtp}</p>
                      <p>发送邮箱: {config.config.email.from}</p>
                    </div>
                  )}
                  {config.method === NotificationMethod.SYSTEM && config.config.system && (
                    <div>
                      <p>声音提醒: {config.config.system.sound ? '开启' : '关闭'}</p>
                      <p>弹窗提醒: {config.config.system.popup ? '开启' : '关闭'}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* 创建/编辑规则弹窗 */}
      <Modal
        title={editingRule ? '编辑预警规则' : '新建预警规则'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingRule(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
        className="rule-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveRule}
          initialValues={{
            enabled: true,
            level: AlertLevel.MEDIUM,
            operator: '<',
            cooldownPeriod: 30,
            notificationMethods: [NotificationMethod.EMAIL]
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
                name="metric"
                label="监控指标"
                rules={[{ required: true, message: '请选择监控指标' }]}
              >
                <Select placeholder="请选择监控指标">
                  <Option value="completeness">完整性</Option>
                  <Option value="accuracy">准确性</Option>
                  <Option value="consistency">一致性</Option>
                  <Option value="timeliness">及时性</Option>
                  <Option value="validity">有效性</Option>
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
                name="operator"
                label="比较操作符"
                rules={[{ required: true, message: '请选择操作符' }]}
              >
                <Select>
                  <Option value="<">小于 (&lt;)</Option>
                  <Option value="<=">小于等于 (&lt;=)</Option>
                  <Option value=">">大于 (&gt;)</Option>
                  <Option value=">=">大于等于 (&gt;=)</Option>
                  <Option value="=">等于 (=)</Option>
                  <Option value="!=">不等于 (!=)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="threshold"
                label="阈值"
                rules={[{ required: true, message: '请输入阈值' }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  precision={2}
                  addonAfter="%"
                  style={{ width: '100%' }}
                  placeholder="请输入阈值"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="level"
                label="告警级别"
                rules={[{ required: true, message: '请选择告警级别' }]}
              >
                <Select>
                  <Option value={AlertLevel.LOW}>低级</Option>
                  <Option value={AlertLevel.MEDIUM}>中级</Option>
                  <Option value={AlertLevel.HIGH}>高级</Option>
                  <Option value={AlertLevel.CRITICAL}>严重</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="notificationMethods"
                label="通知方式"
                rules={[{ required: true, message: '请选择通知方式' }]}
              >
                <Checkbox.Group>
                  <Checkbox value={NotificationMethod.EMAIL}>邮件</Checkbox>
                  <Checkbox value={NotificationMethod.SMS}>短信</Checkbox>
                  <Checkbox value={NotificationMethod.WEBHOOK}>Webhook</Checkbox>
                  <Checkbox value={NotificationMethod.SYSTEM}>系统通知</Checkbox>
                </Checkbox.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="cooldownPeriod"
                label="冷却期（分钟）"
                rules={[{ required: true, message: '请输入冷却期' }]}
              >
                <InputNumber
                  min={1}
                  max={1440}
                  style={{ width: '100%' }}
                  placeholder="请输入冷却期"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="recipients"
            label="通知接收人"
            rules={[{ required: true, message: '请输入通知接收人' }]}
          >
            <Select
              mode="tags"
              placeholder="请输入邮箱地址或手机号"
              tokenSeparators={[',', ';']}
            />
          </Form.Item>

          <Form.Item
            name="activeTime"
            label="生效时间段"
          >
            <RangePicker format="HH:mm" />
          </Form.Item>

          <Form.Item
            name="conditions"
            label="额外条件"
          >
            <TextArea rows={2} placeholder="可选：输入额外的触发条件" />
          </Form.Item>

          <Form.Item
            name="enabled"
            label="启用状态"
            valuePropName="checked"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>

          <div className="modal-actions">
            <Space>
              <Button onClick={() => {
                setIsModalVisible(false);
                setEditingRule(null);
                form.resetFields();
              }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingRule ? '更新' : '创建'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* 通知配置弹窗 */}
      <Modal
        title={editingConfig ? '编辑通知配置' : '新建通知配置'}
        open={isConfigModalVisible}
        onCancel={() => {
          setIsConfigModalVisible(false);
          setEditingConfig(null);
          configForm.resetFields();
        }}
        footer={null}
        width={600}
        className="config-modal"
      >
        <Form
          form={configForm}
          layout="vertical"
          onFinish={handleSaveConfig}
          initialValues={{
            enabled: true
          }}
        >
          <Form.Item
            name="method"
            label="通知方式"
            rules={[{ required: true, message: '请选择通知方式' }]}
          >
            <Radio.Group>
              <Radio value={NotificationMethod.EMAIL}>邮件通知</Radio>
              <Radio value={NotificationMethod.SMS}>短信通知</Radio>
              <Radio value={NotificationMethod.WEBHOOK}>Webhook</Radio>
              <Radio value={NotificationMethod.SYSTEM}>系统通知</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="enabled"
            label="启用状态"
            valuePropName="checked"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>

          <Divider>配置详情</Divider>

          <Alert
            message="配置说明"
            description="请根据选择的通知方式填写相应的配置信息。配置保存后将用于发送告警通知。"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <div className="config-placeholder">
            <p>请选择通知方式后配置相应参数</p>
          </div>

          <div className="modal-actions">
            <Space>
              <Button onClick={() => {
                setIsConfigModalVisible(false);
                setEditingConfig(null);
                configForm.resetFields();
              }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingConfig ? '更新' : '创建'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default QualityAlert;