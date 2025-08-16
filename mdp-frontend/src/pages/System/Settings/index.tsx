/**
 * 系统管理 - 系统设置页面
 * 包含系统参数配置、基础设置、通知设置、安全设置
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  message,

  Select,
  InputNumber,
  Typography,
  Row,
  Col,
  Tabs,
  Divider,
  Alert,
  Upload,

  Modal,
  Checkbox,
  Radio,
  ColorPicker,
  Tag,
  List
} from 'antd';
import {
  SaveOutlined,
  ReloadOutlined,
  SettingOutlined,
  BellOutlined,
  SecurityScanOutlined,
  GlobalOutlined,
  UploadOutlined,
  DeleteOutlined,
  PlusOutlined,

  EyeOutlined,
  EyeInvisibleOutlined,
  MailOutlined,

} from '@ant-design/icons';
import type { UploadProps } from 'antd';

import './index.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Group: CheckboxGroup } = Checkbox;
const { Group: RadioGroup } = Radio;

// 数据类型定义
interface SystemConfig {
  // 基础设置
  systemName: string;
  systemLogo: string;
  systemDescription: string;
  systemVersion: string;
  companyName: string;
  companyLogo: string;
  contactEmail: string;
  contactPhone: string;
  timezone: string;
  language: string;
  dateFormat: string;
  timeFormat: string;
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  
  // 安全设置
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expirationDays: number;
  };
  sessionTimeout: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  enableTwoFactor: boolean;
  enableCaptcha: boolean;
  ipWhitelist: string[];
  
  // 通知设置
  emailNotifications: {
    enabled: boolean;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    smtpSsl: boolean;
    fromEmail: string;
    fromName: string;
  };
  smsNotifications: {
    enabled: boolean;
    provider: string;
    apiKey: string;
    apiSecret: string;
  };
  webhookNotifications: {
    enabled: boolean;
    urls: string[];
  };
  notificationTypes: string[];
  
  // 系统参数
  maxFileSize: number;
  allowedFileTypes: string[];
  dataRetentionDays: number;
  backupEnabled: boolean;
  backupSchedule: string;
  maintenanceMode: boolean;
  debugMode: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  cacheEnabled: boolean;
  cacheTtl: number;
}

// 模拟系统配置数据
const mockConfig: SystemConfig = {
  systemName: '元数据管理平台',
  systemLogo: '',
  systemDescription: '企业级元数据管理平台，提供数据资产管理、数据血缘分析、数据质量监控等功能',
  systemVersion: '1.0.0',
  companyName: '某某科技有限公司',
  companyLogo: '',
  contactEmail: 'admin@example.com',
  contactPhone: '400-123-4567',
  timezone: 'Asia/Shanghai',
  language: 'zh-CN',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: 'HH:mm:ss',
  theme: 'light',
  primaryColor: '#1890ff',
  
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    expirationDays: 90
  },
  sessionTimeout: 30,
  maxLoginAttempts: 5,
  lockoutDuration: 15,
  enableTwoFactor: false,
  enableCaptcha: true,
  ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
  
  emailNotifications: {
    enabled: true,
    smtpHost: 'smtp.example.com',
    smtpPort: 587,
    smtpUser: 'noreply@example.com',
    smtpPassword: '',
    smtpSsl: true,
    fromEmail: 'noreply@example.com',
    fromName: '元数据管理平台'
  },
  smsNotifications: {
    enabled: false,
    provider: 'aliyun',
    apiKey: '',
    apiSecret: ''
  },
  webhookNotifications: {
    enabled: false,
    urls: []
  },
  notificationTypes: ['system_alert', 'user_login', 'data_quality', 'backup_complete'],
  
  maxFileSize: 100,
  allowedFileTypes: ['.xlsx', '.csv', '.json', '.xml', '.pdf'],
  dataRetentionDays: 365,
  backupEnabled: true,
  backupSchedule: '0 2 * * *',
  maintenanceMode: false,
  debugMode: false,
  logLevel: 'info',
  cacheEnabled: true,
  cacheTtl: 3600
};

const SystemSettings: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig>(mockConfig);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [form] = Form.useForm();

  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [newIpAddress, setNewIpAddress] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');

  useEffect(() => {
    form.setFieldsValue(config);
  }, [config, form]);

  // 保存配置
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // 模拟保存
      setTimeout(() => {
        setConfig({ ...config, ...values });
        setLoading(false);
        message.success('系统设置保存成功');
      }, 1000);
    } catch (error) {
      message.error('请检查表单输入');
    }
  };

  // 重置配置
  const handleReset = () => {
    Modal.confirm({
      title: '确认重置',
      content: '确定要重置所有设置到默认值吗？此操作不可撤销。',
      onOk: () => {
        form.setFieldsValue(mockConfig);
        setConfig(mockConfig);
        message.success('设置已重置');
      }
    });
  };

  // 测试邮件发送
  const handleTestEmail = () => {
    setTestEmailLoading(true);
    setTimeout(() => {
      setTestEmailLoading(false);
      message.success('测试邮件发送成功');
    }, 2000);
  };

  // 添加IP地址
  const handleAddIpAddress = () => {
    if (newIpAddress && !config.ipWhitelist.includes(newIpAddress)) {
      const updatedConfig = {
        ...config,
        ipWhitelist: [...config.ipWhitelist, newIpAddress]
      };
      setConfig(updatedConfig);
      form.setFieldValue(['ipWhitelist'], updatedConfig.ipWhitelist);
      setNewIpAddress('');
      message.success('IP地址添加成功');
    }
  };

  // 删除IP地址
  const handleRemoveIpAddress = (ip: string) => {
    const updatedConfig = {
      ...config,
      ipWhitelist: config.ipWhitelist.filter(item => item !== ip)
    };
    setConfig(updatedConfig);
    form.setFieldValue(['ipWhitelist'], updatedConfig.ipWhitelist);
    message.success('IP地址删除成功');
  };

  // 添加Webhook URL
  const handleAddWebhookUrl = () => {
    if (newWebhookUrl && !config.webhookNotifications.urls.includes(newWebhookUrl)) {
      const updatedConfig = {
        ...config,
        webhookNotifications: {
          ...config.webhookNotifications,
          urls: [...config.webhookNotifications.urls, newWebhookUrl]
        }
      };
      setConfig(updatedConfig);
      form.setFieldValue(['webhookNotifications', 'urls'], updatedConfig.webhookNotifications.urls);
      setNewWebhookUrl('');
      message.success('Webhook URL添加成功');
    }
  };

  // 删除Webhook URL
  const handleRemoveWebhookUrl = (url: string) => {
    const updatedConfig = {
      ...config,
      webhookNotifications: {
        ...config.webhookNotifications,
        urls: config.webhookNotifications.urls.filter(item => item !== url)
      }
    };
    setConfig(updatedConfig);
    form.setFieldValue(['webhookNotifications', 'urls'], updatedConfig.webhookNotifications.urls);
    message.success('Webhook URL删除成功');
  };

  // 文件上传配置
  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/upload',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 文件上传成功`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 文件上传失败`);
      }
    },
  };

  return (
    <div className="system-settings">
      {/* 页面头部 */}
      <div className="page-header">
        <div className="header-content">
          <Title level={2}>系统设置</Title>
          <Text type="secondary">配置系统参数、安全策略和通知设置</Text>
        </div>
        <div className="header-actions">
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
            <Button 
              type="primary" 
              icon={<SaveOutlined />} 
              onClick={handleSave}
              loading={loading}
            >
              保存设置
            </Button>
          </Space>
        </div>
      </div>

      {/* 设置内容 */}
      <Card className="settings-card">
        <Form
          form={form}
          layout="vertical"
          initialValues={config}
          onValuesChange={(changedValues, allValues) => {
            setConfig({ ...config, ...allValues });
          }}
        >
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            type="card"
            className="settings-tabs"
          >
            {/* 基础设置 */}
            <TabPane 
              tab={
                <span>
                  <GlobalOutlined />
                  基础设置
                </span>
              } 
              key="basic"
            >
              <div className="tab-content">
                <Title level={4}>系统信息</Title>
                <Row gutter={[24, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="系统名称"
                      name="systemName"
                      rules={[{ required: true, message: '请输入系统名称' }]}
                    >
                      <Input placeholder="请输入系统名称" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="系统版本"
                      name="systemVersion"
                      rules={[{ required: true, message: '请输入系统版本' }]}
                    >
                      <Input placeholder="请输入系统版本" />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item
                      label="系统描述"
                      name="systemDescription"
                    >
                      <TextArea rows={3} placeholder="请输入系统描述" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="系统Logo">
                      <Upload {...uploadProps}>
                        <Button icon={<UploadOutlined />}>上传Logo</Button>
                      </Upload>
                    </Form.Item>
                  </Col>
                </Row>

                <Divider />

                <Title level={4}>公司信息</Title>
                <Row gutter={[24, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="公司名称"
                      name="companyName"
                      rules={[{ required: true, message: '请输入公司名称' }]}
                    >
                      <Input placeholder="请输入公司名称" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="联系邮箱"
                      name="contactEmail"
                      rules={[
                        { required: true, message: '请输入联系邮箱' },
                        { type: 'email', message: '请输入有效的邮箱地址' }
                      ]}
                    >
                      <Input placeholder="请输入联系邮箱" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="联系电话"
                      name="contactPhone"
                    >
                      <Input placeholder="请输入联系电话" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="公司Logo">
                      <Upload {...uploadProps}>
                        <Button icon={<UploadOutlined />}>上传Logo</Button>
                      </Upload>
                    </Form.Item>
                  </Col>
                </Row>

                <Divider />

                <Title level={4}>区域设置</Title>
                <Row gutter={[24, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="时区"
                      name="timezone"
                      rules={[{ required: true, message: '请选择时区' }]}
                    >
                      <Select placeholder="请选择时区">
                        <Option value="Asia/Shanghai">Asia/Shanghai (UTC+8)</Option>
                        <Option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</Option>
                        <Option value="Europe/London">Europe/London (UTC+0)</Option>
                        <Option value="America/New_York">America/New_York (UTC-5)</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="语言"
                      name="language"
                      rules={[{ required: true, message: '请选择语言' }]}
                    >
                      <Select placeholder="请选择语言">
                        <Option value="zh-CN">简体中文</Option>
                        <Option value="zh-TW">繁体中文</Option>
                        <Option value="en-US">English</Option>
                        <Option value="ja-JP">日本語</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="日期格式"
                      name="dateFormat"
                    >
                      <Select placeholder="请选择日期格式">
                        <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                        <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                        <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                        <Option value="YYYY年MM月DD日">YYYY年MM月DD日</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="时间格式"
                      name="timeFormat"
                    >
                      <Select placeholder="请选择时间格式">
                        <Option value="HH:mm:ss">24小时制 (HH:mm:ss)</Option>
                        <Option value="hh:mm:ss A">12小时制 (hh:mm:ss A)</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Divider />

                <Title level={4}>界面设置</Title>
                <Row gutter={[24, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="主题模式"
                      name="theme"
                    >
                      <RadioGroup>
                        <Radio value="light">浅色模式</Radio>
                        <Radio value="dark">深色模式</Radio>
                        <Radio value="auto">跟随系统</Radio>
                      </RadioGroup>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="主题色"
                      name="primaryColor"
                    >
                      <ColorPicker showText />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </TabPane>

            {/* 安全设置 */}
            <TabPane 
              tab={
                <span>
                  <SecurityScanOutlined />
                  安全设置
                </span>
              } 
              key="security"
            >
              <div className="tab-content">
                <Title level={4}>密码策略</Title>
                <Row gutter={[24, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="最小长度"
                      name={['passwordPolicy', 'minLength']}
                      rules={[{ required: true, message: '请输入最小长度' }]}
                    >
                      <InputNumber min={6} max={32} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="密码有效期（天）"
                      name={['passwordPolicy', 'expirationDays']}
                    >
                      <InputNumber min={0} max={365} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item label="密码复杂度要求">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Form.Item name={['passwordPolicy', 'requireUppercase']} valuePropName="checked" noStyle>
                          <Checkbox>必须包含大写字母</Checkbox>
                        </Form.Item>
                        <Form.Item name={['passwordPolicy', 'requireLowercase']} valuePropName="checked" noStyle>
                          <Checkbox>必须包含小写字母</Checkbox>
                        </Form.Item>
                        <Form.Item name={['passwordPolicy', 'requireNumbers']} valuePropName="checked" noStyle>
                          <Checkbox>必须包含数字</Checkbox>
                        </Form.Item>
                        <Form.Item name={['passwordPolicy', 'requireSpecialChars']} valuePropName="checked" noStyle>
                          <Checkbox>必须包含特殊字符</Checkbox>
                        </Form.Item>
                      </Space>
                    </Form.Item>
                  </Col>
                </Row>

                <Divider />

                <Title level={4}>会话安全</Title>
                <Row gutter={[24, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="会话超时时间（分钟）"
                      name="sessionTimeout"
                      rules={[{ required: true, message: '请输入会话超时时间' }]}
                    >
                      <InputNumber min={5} max={1440} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="最大登录尝试次数"
                      name="maxLoginAttempts"
                      rules={[{ required: true, message: '请输入最大登录尝试次数' }]}
                    >
                      <InputNumber min={3} max={10} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="账户锁定时间（分钟）"
                      name="lockoutDuration"
                      rules={[{ required: true, message: '请输入账户锁定时间' }]}
                    >
                      <InputNumber min={5} max={1440} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="安全功能">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Form.Item name="enableTwoFactor" valuePropName="checked" noStyle>
                          <Checkbox>启用双因子认证</Checkbox>
                        </Form.Item>
                        <Form.Item name="enableCaptcha" valuePropName="checked" noStyle>
                          <Checkbox>启用验证码</Checkbox>
                        </Form.Item>
                      </Space>
                    </Form.Item>
                  </Col>
                </Row>

                <Divider />

                <Title level={4}>IP白名单</Title>
                <div className="ip-whitelist-section">
                  <div className="add-ip-form">
                    <Space.Compact style={{ width: '100%' }}>
                      <Input
                        placeholder="请输入IP地址或网段，如：192.168.1.100 或 192.168.1.0/24"
                        value={newIpAddress}
                        onChange={(e) => setNewIpAddress(e.target.value)}
                        onPressEnter={handleAddIpAddress}
                      />
                      <Button type="primary" icon={<PlusOutlined />} onClick={handleAddIpAddress}>
                        添加
                      </Button>
                    </Space.Compact>
                  </div>
                  <div className="ip-list">
                    {config.ipWhitelist.map((ip, index) => (
                      <Tag
                        key={index}
                        closable
                        onClose={() => handleRemoveIpAddress(ip)}
                        style={{ marginBottom: 8 }}
                      >
                        {ip}
                      </Tag>
                    ))}
                  </div>
                </div>
              </div>
            </TabPane>

            {/* 通知设置 */}
            <TabPane 
              tab={
                <span>
                  <BellOutlined />
                  通知设置
                </span>
              } 
              key="notification"
            >
              <div className="tab-content">
                <Title level={4}>邮件通知</Title>
                <Row gutter={[24, 16]}>
                  <Col xs={24}>
                    <Form.Item name={['emailNotifications', 'enabled']} valuePropName="checked">
                      <Checkbox>启用邮件通知</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="SMTP服务器"
                      name={['emailNotifications', 'smtpHost']}
                    >
                      <Input placeholder="请输入SMTP服务器地址" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="SMTP端口"
                      name={['emailNotifications', 'smtpPort']}
                    >
                      <InputNumber min={1} max={65535} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="SMTP用户名"
                      name={['emailNotifications', 'smtpUser']}
                    >
                      <Input placeholder="请输入SMTP用户名" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="SMTP密码"
                      name={['emailNotifications', 'smtpPassword']}
                    >
                      <Input.Password 
                        placeholder="请输入SMTP密码"
                        iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="发件人邮箱"
                      name={['emailNotifications', 'fromEmail']}
                    >
                      <Input placeholder="请输入发件人邮箱" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="发件人名称"
                      name={['emailNotifications', 'fromName']}
                    >
                      <Input placeholder="请输入发件人名称" />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item name={['emailNotifications', 'smtpSsl']} valuePropName="checked">
                      <Checkbox>启用SSL/TLS加密</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Space>
                      <Button 
                        icon={<MailOutlined />} 
                        onClick={handleTestEmail}
                        loading={testEmailLoading}
                      >
                        发送测试邮件
                      </Button>
                    </Space>
                  </Col>
                </Row>

                <Divider />

                <Title level={4}>短信通知</Title>
                <Row gutter={[24, 16]}>
                  <Col xs={24}>
                    <Form.Item name={['smsNotifications', 'enabled']} valuePropName="checked">
                      <Checkbox>启用短信通知</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="短信服务商"
                      name={['smsNotifications', 'provider']}
                    >
                      <Select placeholder="请选择短信服务商">
                        <Option value="aliyun">阿里云短信</Option>
                        <Option value="tencent">腾讯云短信</Option>
                        <Option value="huawei">华为云短信</Option>
                        <Option value="custom">自定义</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="API Key"
                      name={['smsNotifications', 'apiKey']}
                    >
                      <Input placeholder="请输入API Key" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="API Secret"
                      name={['smsNotifications', 'apiSecret']}
                    >
                      <Input.Password placeholder="请输入API Secret" />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider />

                <Title level={4}>Webhook通知</Title>
                <Row gutter={[24, 16]}>
                  <Col xs={24}>
                    <Form.Item name={['webhookNotifications', 'enabled']} valuePropName="checked">
                      <Checkbox>启用Webhook通知</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <div className="webhook-urls-section">
                      <div className="add-webhook-form">
                        <Space.Compact style={{ width: '100%' }}>
                          <Input
                            placeholder="请输入Webhook URL"
                            value={newWebhookUrl}
                            onChange={(e) => setNewWebhookUrl(e.target.value)}
                            onPressEnter={handleAddWebhookUrl}
                          />
                          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddWebhookUrl}>
                            添加
                          </Button>
                        </Space.Compact>
                      </div>
                      <List
                        size="small"
                        dataSource={config.webhookNotifications.urls}
                        renderItem={(url, index) => (
                          <List.Item
                            actions={[
                              <Button 
                                type="text" 
                                danger 
                                icon={<DeleteOutlined />} 
                                onClick={() => handleRemoveWebhookUrl(url)}
                                size="small"
                              />
                            ]}
                          >
                            <Text code>{url}</Text>
                          </List.Item>
                        )}
                      />
                    </div>
                  </Col>
                </Row>

                <Divider />

                <Title level={4}>通知类型</Title>
                <Form.Item name="notificationTypes">
                  <CheckboxGroup>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12} md={6}>
                        <Checkbox value="system_alert">系统告警</Checkbox>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Checkbox value="user_login">用户登录</Checkbox>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Checkbox value="data_quality">数据质量</Checkbox>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Checkbox value="backup_complete">备份完成</Checkbox>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Checkbox value="system_maintenance">系统维护</Checkbox>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Checkbox value="security_event">安全事件</Checkbox>
                      </Col>
                    </Row>
                  </CheckboxGroup>
                </Form.Item>
              </div>
            </TabPane>

            {/* 系统参数 */}
            <TabPane 
              tab={
                <span>
                  <SettingOutlined />
                  系统参数
                </span>
              } 
              key="system"
            >
              <div className="tab-content">
                <Title level={4}>文件管理</Title>
                <Row gutter={[24, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="最大文件大小（MB）"
                      name="maxFileSize"
                      rules={[{ required: true, message: '请输入最大文件大小' }]}
                    >
                      <InputNumber min={1} max={1024} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="数据保留天数"
                      name="dataRetentionDays"
                      rules={[{ required: true, message: '请输入数据保留天数' }]}
                    >
                      <InputNumber min={1} max={3650} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item
                      label="允许的文件类型"
                      name="allowedFileTypes"
                    >
                      <Select
                        mode="tags"
                        style={{ width: '100%' }}
                        placeholder="请选择或输入文件类型"
                        options={[
                          { value: '.xlsx', label: '.xlsx' },
                          { value: '.csv', label: '.csv' },
                          { value: '.json', label: '.json' },
                          { value: '.xml', label: '.xml' },
                          { value: '.pdf', label: '.pdf' },
                          { value: '.txt', label: '.txt' },
                          { value: '.doc', label: '.doc' },
                          { value: '.docx', label: '.docx' }
                        ]}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider />

                <Title level={4}>备份设置</Title>
                <Row gutter={[24, 16]}>
                  <Col xs={24}>
                    <Form.Item name="backupEnabled" valuePropName="checked">
                      <Checkbox>启用自动备份</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="备份计划（Cron表达式）"
                      name="backupSchedule"
                      extra="例如：0 2 * * * 表示每天凌晨2点执行备份"
                    >
                      <Input placeholder="请输入Cron表达式" />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider />

                <Title level={4}>系统模式</Title>
                <Row gutter={[24, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item label="系统状态">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Form.Item name="maintenanceMode" valuePropName="checked" noStyle>
                          <Checkbox>维护模式</Checkbox>
                        </Form.Item>
                        <Form.Item name="debugMode" valuePropName="checked" noStyle>
                          <Checkbox>调试模式</Checkbox>
                        </Form.Item>
                      </Space>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="日志级别"
                      name="logLevel"
                    >
                      <Select placeholder="请选择日志级别">
                        <Option value="error">ERROR - 仅错误</Option>
                        <Option value="warn">WARN - 警告及以上</Option>
                        <Option value="info">INFO - 信息及以上</Option>
                        <Option value="debug">DEBUG - 所有日志</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Divider />

                <Title level={4}>缓存设置</Title>
                <Row gutter={[24, 16]}>
                  <Col xs={24}>
                    <Form.Item name="cacheEnabled" valuePropName="checked">
                      <Checkbox>启用缓存</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="缓存过期时间（秒）"
                      name="cacheTtl"
                      rules={[{ required: true, message: '请输入缓存过期时间' }]}
                    >
                      <InputNumber min={60} max={86400} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>

                {/* 系统状态提示 */}
                <Alert
                  message="系统状态提示"
                  description={
                    <div>
                      <p>• 维护模式：启用后，普通用户将无法访问系统，仅管理员可以登录</p>
                      <p>• 调试模式：启用后，系统将输出详细的调试信息，建议仅在开发环境使用</p>
                      <p>• 缓存设置：合理的缓存配置可以显著提升系统性能</p>
                    </div>
                  }
                  type="info"
                  showIcon
                  style={{ marginTop: 24 }}
                />
              </div>
            </TabPane>
          </Tabs>
        </Form>
      </Card>
    </div>
  );
};

export default SystemSettings;