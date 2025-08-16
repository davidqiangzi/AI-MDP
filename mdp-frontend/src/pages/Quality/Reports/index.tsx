/**
 * 质量报告页面
 * 包含报告模板、生成配置、历史报告、订阅设置等功能
 */

import React, { useState, useEffect } from 'react';
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
  Switch,
  DatePicker,
  TimePicker,
  Checkbox,
  Radio,
  Progress,
  Tabs,
  List,
  Avatar,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  SendOutlined,
  SettingOutlined,
  FileTextOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  MailOutlined,
  BellOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import './index.css';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

// 质量报告数据类型
interface QualityReport {
  id: string;
  name: string;
  description: string;
  template: string;
  status: 'generating' | 'completed' | 'failed' | 'scheduled';
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  creator: string;
  createTime: string;
  generateTime?: string;
  fileSize?: string;
  downloadCount: number;
  recipients: string[];
  nextRunTime?: string;
}

// 报告模板数据类型
interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'standard' | 'custom';
  sections: string[];
  creator: string;
  createTime: string;
  usageCount: number;
}

// 订阅配置数据类型
interface ReportSubscription {
  id: string;
  reportName: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  recipients: string[];
  status: 'active' | 'inactive';
  creator: string;
  createTime: string;
  lastSentTime?: string;
}

// 模拟数据
const mockReports: QualityReport[] = [
  {
    id: '1',
    name: '用户数据质量日报',
    description: '用户表数据质量检查日报，包含完整性、准确性等指标',
    template: '标准日报模板',
    status: 'completed',
    type: 'daily',
    creator: '张三',
    createTime: '2024-01-25 09:00:00',
    generateTime: '2024-01-25 09:15:00',
    fileSize: '2.3MB',
    downloadCount: 15,
    recipients: ['admin@company.com', 'data@company.com'],
    nextRunTime: '2024-01-26 09:00:00',
  },
  {
    id: '2',
    name: '订单数据质量周报',
    description: '订单相关表数据质量检查周报',
    template: '自定义周报模板',
    status: 'generating',
    type: 'weekly',
    creator: '李四',
    createTime: '2024-01-22 10:00:00',
    downloadCount: 0,
    recipients: ['manager@company.com'],
    nextRunTime: '2024-01-29 10:00:00',
  },
];

const mockTemplates: ReportTemplate[] = [
  {
    id: '1',
    name: '标准日报模板',
    description: '包含基础数据质量指标的标准日报模板',
    type: 'standard',
    sections: ['数据概览', '质量指标', '异常数据', '趋势分析'],
    creator: '系统',
    createTime: '2024-01-01 00:00:00',
    usageCount: 25,
  },
  {
    id: '2',
    name: '自定义周报模板',
    description: '自定义的周报模板，包含详细的质量分析',
    type: 'custom',
    sections: ['执行摘要', '详细指标', '问题分析', '改进建议', '附录'],
    creator: '李四',
    createTime: '2024-01-15 14:30:00',
    usageCount: 8,
  },
];

const mockSubscriptions: ReportSubscription[] = [
  {
    id: '1',
    reportName: '用户数据质量日报',
    frequency: 'daily',
    time: '09:00',
    recipients: ['admin@company.com', 'data@company.com'],
    status: 'active',
    creator: '张三',
    createTime: '2024-01-20 15:00:00',
    lastSentTime: '2024-01-25 09:00:00',
  },
  {
    id: '2',
    reportName: '订单数据质量周报',
    frequency: 'weekly',
    time: '10:00',
    recipients: ['manager@company.com'],
    status: 'active',
    creator: '李四',
    createTime: '2024-01-18 11:00:00',
    lastSentTime: '2024-01-22 10:00:00',
  },
];

/**
 * 质量报告页面组件
 */
const QualityReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('reports');
  const [reports, setReports] = useState<QualityReport[]>(mockReports);
  const [templates, setTemplates] = useState<ReportTemplate[]>(mockTemplates);
  const [subscriptions, setSubscriptions] = useState<ReportSubscription[]>(mockSubscriptions);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [viewingItem, setViewingItem] = useState<any>(null);
  const [form] = Form.useForm();

  // 报告状态选项
  const reportStatuses = [
    { value: 'generating', label: '生成中', color: 'processing' },
    { value: 'completed', label: '已完成', color: 'success' },
    { value: 'failed', label: '失败', color: 'error' },
    { value: 'scheduled', label: '已调度', color: 'default' },
  ];

  // 报告类型选项
  const reportTypes = [
    { value: 'daily', label: '日报', color: 'blue' },
    { value: 'weekly', label: '周报', color: 'green' },
    { value: 'monthly', label: '月报', color: 'orange' },
    { value: 'custom', label: '自定义', color: 'purple' },
  ];

  // 频率选项
  const frequencyOptions = [
    { value: 'daily', label: '每日' },
    { value: 'weekly', label: '每周' },
    { value: 'monthly', label: '每月' },
  ];

  // 报告列表表格列配置
  const reportColumns: ColumnsType<QualityReport> = [
    {
      title: '报告名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
      render: (text: string, record: QualityReport) => (
        <Tooltip title={record.description}>
          <Button type="link" onClick={() => handleViewReport(record)}>
            {text}
          </Button>
        </Tooltip>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const typeConfig = reportTypes.find(t => t.value === type);
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
        const statusConfig = reportStatuses.find(s => s.value === status);
        return (
          <Tag color={statusConfig?.color}>
            {statusConfig?.label}
          </Tag>
        );
      },
    },
    {
      title: '模板',
      dataIndex: 'template',
      key: 'template',
      width: 150,
      ellipsis: true,
    },
    {
      title: '文件大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
      width: 100,
      render: (size?: string) => size || '-',
    },
    {
      title: '下载次数',
      dataIndex: 'downloadCount',
      key: 'downloadCount',
      width: 100,
    },
    {
      title: '生成时间',
      dataIndex: 'generateTime',
      key: 'generateTime',
      width: 150,
      render: (time?: string) => time || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewReport(record)}
            />
          </Tooltip>
          {record.status === 'completed' && (
            <Tooltip title="下载">
              <Button
                type="text"
                icon={<DownloadOutlined />}
                onClick={() => handleDownloadReport(record)}
              />
            </Tooltip>
          )}
          <Tooltip title="发送">
            <Button
              type="text"
              icon={<SendOutlined />}
              onClick={() => handleSendReport(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditReport(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="确定要删除这个报告吗？"
              onConfirm={() => handleDeleteReport(record.id)}
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

  // 模板列表表格列配置
  const templateColumns: ColumnsType<ReportTemplate> = [
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <Tag color={type === 'standard' ? 'blue' : 'green'}>
          {type === 'standard' ? '标准' : '自定义'}
        </Tag>
      ),
    },
    {
      title: '包含章节',
      dataIndex: 'sections',
      key: 'sections',
      width: 250,
      render: (sections: string[]) => (
        <div>
          {sections.slice(0, 2).map(section => (
            <Tag key={section} style={{ marginBottom: 4 }}>
              {section}
            </Tag>
          ))}
          {sections.length > 2 && (
            <Tag>+{sections.length - 2}个</Tag>
          )}
        </div>
      ),
    },
    {
      title: '使用次数',
      dataIndex: 'usageCount',
      key: 'usageCount',
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 150,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewTemplate(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditTemplate(record)}
            />
          </Tooltip>
          {record.type === 'custom' && (
            <Tooltip title="删除">
              <Popconfirm
                title="确定要删除这个模板吗？"
                onConfirm={() => handleDeleteTemplate(record.id)}
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
          )}
        </Space>
      ),
    },
  ];

  // 订阅列表表格列配置
  const subscriptionColumns: ColumnsType<ReportSubscription> = [
    {
      title: '报告名称',
      dataIndex: 'reportName',
      key: 'reportName',
      width: 200,
      ellipsis: true,
    },
    {
      title: '频率',
      dataIndex: 'frequency',
      key: 'frequency',
      width: 100,
      render: (frequency: string) => {
        const freqConfig = frequencyOptions.find(f => f.value === frequency);
        return <Tag>{freqConfig?.label}</Tag>;
      },
    },
    {
      title: '发送时间',
      dataIndex: 'time',
      key: 'time',
      width: 100,
    },
    {
      title: '接收人',
      dataIndex: 'recipients',
      key: 'recipients',
      width: 200,
      render: (recipients: string[]) => (
        <div>
          {recipients.slice(0, 2).map(email => (
            <Tag key={email} icon={<MailOutlined />} style={{ marginBottom: 4 }}>
              {email}
            </Tag>
          ))}
          {recipients.length > 2 && (
            <Tag>+{recipients.length - 2}个</Tag>
          )}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status === 'active' ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '最后发送',
      dataIndex: 'lastSentTime',
      key: 'lastSentTime',
      width: 150,
      render: (time?: string) => time || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditSubscription(record)}
            />
          </Tooltip>
          <Tooltip title={record.status === 'active' ? '禁用' : '启用'}>
            <Switch
              size="small"
              checked={record.status === 'active'}
              onChange={(checked) => handleToggleSubscription(record.id, checked)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="确定要删除这个订阅吗？"
              onConfirm={() => handleDeleteSubscription(record.id)}
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
  const getFilteredData = () => {
    let data: any[] = [];
    if (activeTab === 'reports') {
      data = reports;
    } else if (activeTab === 'templates') {
      data = templates;
    } else {
      data = subscriptions;
    }

    return data.filter(item => {
      const matchSearch = !searchText || 
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchText.toLowerCase()));
      
      if (activeTab === 'reports') {
        const matchStatus = !selectedStatus || item.status === selectedStatus;
        const matchType = !selectedType || item.type === selectedType;
        return matchSearch && matchStatus && matchType;
      }
      
      return matchSearch;
    });
  };

  // 处理新建
  const handleCreate = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 处理编辑报告
  const handleEditReport = (report: QualityReport) => {
    setEditingItem(report);
    form.setFieldsValue(report);
    setIsModalVisible(true);
  };

  // 处理编辑模板
  const handleEditTemplate = (template: ReportTemplate) => {
    setEditingItem(template);
    form.setFieldsValue(template);
    setIsModalVisible(true);
  };

  // 处理编辑订阅
  const handleEditSubscription = (subscription: ReportSubscription) => {
    setEditingItem(subscription);
    form.setFieldsValue({
      ...subscription,
      time: dayjs(subscription.time, 'HH:mm'),
    });
    setIsModalVisible(true);
  };

  // 处理查看报告详情
  const handleViewReport = (report: QualityReport) => {
    setViewingItem(report);
    setIsDetailVisible(true);
  };

  // 处理查看模板详情
  const handleViewTemplate = (template: ReportTemplate) => {
    setViewingItem(template);
    setIsDetailVisible(true);
  };

  // 处理下载报告
  const handleDownloadReport = (report: QualityReport) => {
    message.success(`开始下载报告: ${report.name}`);
    // 这里应该调用实际的下载API
  };

  // 处理发送报告
  const handleSendReport = (report: QualityReport) => {
    message.success(`报告已发送: ${report.name}`);
    // 这里应该调用实际的发送API
  };

  // 处理删除
  const handleDeleteReport = (id: string) => {
    setReports(reports.filter(r => r.id !== id));
    message.success('报告删除成功');
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    message.success('模板删除成功');
  };

  const handleDeleteSubscription = (id: string) => {
    setSubscriptions(subscriptions.filter(s => s.id !== id));
    message.success('订阅删除成功');
  };

  // 处理订阅启用/禁用
  const handleToggleSubscription = (id: string, checked: boolean) => {
    const updatedSubscriptions = subscriptions.map(s => 
      s.id === id ? { ...s, status: (checked ? 'active' : 'inactive') as ReportSubscription['status'] } : s
    );
    setSubscriptions(updatedSubscriptions);
    message.success(`订阅已${checked ? '启用' : '禁用'}`);
  };

  // 处理保存
  const handleSave = async (values: any) => {
    try {
      setLoading(true);
      
      if (activeTab === 'reports') {
        if (editingItem) {
          const updatedReports = reports.map(r => 
            r.id === editingItem.id ? { ...r, ...values } : r
          );
          setReports(updatedReports);
          message.success('报告更新成功');
        } else {
          const newReport: QualityReport = {
            ...values,
            id: Date.now().toString(),
            creator: '当前用户',
            createTime: new Date().toLocaleString(),
            downloadCount: 0,
            status: 'scheduled',
          };
          setReports([newReport, ...reports]);
          message.success('报告创建成功');
        }
      } else if (activeTab === 'templates') {
        if (editingItem) {
          const updatedTemplates = templates.map(t => 
            t.id === editingItem.id ? { ...t, ...values } : t
          );
          setTemplates(updatedTemplates);
          message.success('模板更新成功');
        } else {
          const newTemplate: ReportTemplate = {
            ...values,
            id: Date.now().toString(),
            creator: '当前用户',
            createTime: new Date().toLocaleString(),
            usageCount: 0,
            type: 'custom',
          };
          setTemplates([newTemplate, ...templates]);
          message.success('模板创建成功');
        }
      } else {
        const processedValues = {
          ...values,
          time: values.time.format('HH:mm'),
        };
        
        if (editingItem) {
          const updatedSubscriptions = subscriptions.map(s => 
            s.id === editingItem.id ? { ...s, ...processedValues } : s
          );
          setSubscriptions(updatedSubscriptions);
          message.success('订阅更新成功');
        } else {
          const newSubscription: ReportSubscription = {
            ...processedValues,
            id: Date.now().toString(),
            creator: '当前用户',
            createTime: new Date().toLocaleString(),
            status: 'active',
          };
          setSubscriptions([newSubscription, ...subscriptions]);
          message.success('订阅创建成功');
        }
      }
      
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 渲染表单内容
  const renderFormContent = () => {
    if (activeTab === 'reports') {
      return (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="报告名称"
                rules={[{ required: true, message: '请输入报告名称' }]}
              >
                <Input placeholder="请输入报告名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="报告类型"
                rules={[{ required: true, message: '请选择报告类型' }]}
              >
                <Select placeholder="请选择报告类型">
                  {reportTypes.map(type => (
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
            label="报告描述"
            rules={[{ required: true, message: '请输入报告描述' }]}
          >
            <TextArea rows={3} placeholder="请输入报告描述" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="template"
                label="报告模板"
                rules={[{ required: true, message: '请选择报告模板' }]}
              >
                <Select placeholder="请选择报告模板">
                  {templates.map(template => (
                    <Option key={template.id} value={template.name}>
                      {template.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="recipients"
                label="接收人邮箱"
                rules={[{ required: true, message: '请输入接收人邮箱' }]}
              >
                <Select
                  mode="tags"
                  placeholder="请输入邮箱地址，支持多个"
                  tokenSeparators={[',', ';']}
                />
              </Form.Item>
            </Col>
          </Row>
        </>
      );
    } else if (activeTab === 'templates') {
      return (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="模板名称"
                rules={[{ required: true, message: '请输入模板名称' }]}
              >
                <Input placeholder="请输入模板名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="模板类型"
                rules={[{ required: true, message: '请选择模板类型' }]}
              >
                <Radio.Group>
                  <Radio value="standard">标准模板</Radio>
                  <Radio value="custom">自定义模板</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="description"
            label="模板描述"
            rules={[{ required: true, message: '请输入模板描述' }]}
          >
            <TextArea rows={3} placeholder="请输入模板描述" />
          </Form.Item>
          
          <Form.Item
            name="sections"
            label="包含章节"
            rules={[{ required: true, message: '请选择包含的章节' }]}
          >
            <Checkbox.Group>
              <Row>
                <Col span={8}><Checkbox value="数据概览">数据概览</Checkbox></Col>
                <Col span={8}><Checkbox value="质量指标">质量指标</Checkbox></Col>
                <Col span={8}><Checkbox value="异常数据">异常数据</Checkbox></Col>
                <Col span={8}><Checkbox value="趋势分析">趋势分析</Checkbox></Col>
                <Col span={8}><Checkbox value="执行摘要">执行摘要</Checkbox></Col>
                <Col span={8}><Checkbox value="详细指标">详细指标</Checkbox></Col>
                <Col span={8}><Checkbox value="问题分析">问题分析</Checkbox></Col>
                <Col span={8}><Checkbox value="改进建议">改进建议</Checkbox></Col>
                <Col span={8}><Checkbox value="附录">附录</Checkbox></Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>
        </>
      );
    } else {
      return (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="reportName"
                label="报告名称"
                rules={[{ required: true, message: '请选择报告' }]}
              >
                <Select placeholder="请选择报告">
                  {reports.map(report => (
                    <Option key={report.id} value={report.name}>
                      {report.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="frequency"
                label="发送频率"
                rules={[{ required: true, message: '请选择发送频率' }]}
              >
                <Select placeholder="请选择发送频率">
                  {frequencyOptions.map(freq => (
                    <Option key={freq.value} value={freq.value}>
                      {freq.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="time"
                label="发送时间"
                rules={[{ required: true, message: '请选择发送时间' }]}
              >
                <TimePicker
                  format="HH:mm"
                  placeholder="请选择时间"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Radio.Group>
                  <Radio value="active">启用</Radio>
                  <Radio value="inactive">禁用</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="recipients"
            label="接收人邮箱"
            rules={[{ required: true, message: '请输入接收人邮箱' }]}
          >
            <Select
              mode="tags"
              placeholder="请输入邮箱地址，支持多个"
              tokenSeparators={[',', ';']}
            />
          </Form.Item>
        </>
      );
    }
  };

  return (
    <div className="quality-reports-page">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        className="reports-tabs"
      >
        <TabPane
          tab={
            <span>
              <FileTextOutlined />
              报告列表
            </span>
          }
          key="reports"
        >
          {/* 报告列表页面头部 */}
          <Card className="reports-header" bodyStyle={{ padding: '16px 24px' }}>
            <Row justify="space-between" align="middle">
              <Col>
                <Space size="middle">
                  <Search
                    placeholder="搜索报告名称或描述"
                    allowClear
                    style={{ width: 300 }}
                    onSearch={handleSearch}
                  />
                  <Select
                    placeholder="状态"
                    allowClear
                    style={{ width: 120 }}
                    value={selectedStatus}
                    onChange={setSelectedStatus}
                  >
                    {reportStatuses.map(status => (
                      <Option key={status.value} value={status.value}>
                        {status.label}
                      </Option>
                    ))}
                  </Select>
                  <Select
                    placeholder="类型"
                    allowClear
                    style={{ width: 100 }}
                    value={selectedType}
                    onChange={setSelectedType}
                  >
                    {reportTypes.map(type => (
                      <Option key={type.value} value={type.value}>
                        {type.label}
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
                    onClick={handleCreate}
                  >
                    新建报告
                  </Button>
                  <Button icon={<DownloadOutlined />}>
                    批量下载
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* 报告列表 */}
          <Card>
            <Table
              columns={reportColumns}
              dataSource={getFilteredData()}
              rowKey="id"
              loading={loading}
              scroll={{ x: 1200 }}
              pagination={{
                total: getFilteredData().length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
              }}
            />
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <SettingOutlined />
              报告模板
            </span>
          }
          key="templates"
        >
          {/* 模板列表页面头部 */}
          <Card className="reports-header" bodyStyle={{ padding: '16px 24px' }}>
            <Row justify="space-between" align="middle">
              <Col>
                <Search
                  placeholder="搜索模板名称或描述"
                  allowClear
                  style={{ width: 300 }}
                  onSearch={handleSearch}
                />
              </Col>
              <Col>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreate}
                >
                  新建模板
                </Button>
              </Col>
            </Row>
          </Card>

          {/* 模板列表 */}
          <Card>
            <Table
              columns={templateColumns}
              dataSource={getFilteredData()}
              rowKey="id"
              loading={loading}
              pagination={{
                total: getFilteredData().length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
              }}
            />
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <BellOutlined />
              订阅设置
            </span>
          }
          key="subscriptions"
        >
          {/* 订阅列表页面头部 */}
          <Card className="reports-header" bodyStyle={{ padding: '16px 24px' }}>
            <Row justify="space-between" align="middle">
              <Col>
                <Search
                  placeholder="搜索订阅名称"
                  allowClear
                  style={{ width: 300 }}
                  onSearch={handleSearch}
                />
              </Col>
              <Col>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreate}
                >
                  新建订阅
                </Button>
              </Col>
            </Row>
          </Card>

          {/* 订阅列表 */}
          <Card>
            <Table
              columns={subscriptionColumns}
              dataSource={getFilteredData()}
              rowKey="id"
              loading={loading}
              pagination={{
                total: getFilteredData().length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
              }}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* 新建/编辑弹窗 */}
      <Modal
        title={`${editingItem ? '编辑' : '新建'}${activeTab === 'reports' ? '报告' : activeTab === 'templates' ? '模板' : '订阅'}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          {renderFormContent()}
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingItem ? '更新' : '创建'}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情抽屉 */}
      <Drawer
        title={`${activeTab === 'reports' ? '报告' : '模板'}详情`}
        placement="right"
        width={600}
        open={isDetailVisible}
        onClose={() => setIsDetailVisible(false)}
      >
        {viewingItem && activeTab === 'reports' && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="报告名称">
              {viewingItem.name}
            </Descriptions.Item>
            <Descriptions.Item label="报告描述">
              {viewingItem.description}
            </Descriptions.Item>
            <Descriptions.Item label="报告类型">
              <Tag color={reportTypes.find(t => t.value === viewingItem.type)?.color}>
                {reportTypes.find(t => t.value === viewingItem.type)?.label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={reportStatuses.find(s => s.value === viewingItem.status)?.color}>
                {reportStatuses.find(s => s.value === viewingItem.status)?.label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="使用模板">
              {viewingItem.template}
            </Descriptions.Item>
            <Descriptions.Item label="文件大小">
              {viewingItem.fileSize || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="下载次数">
              {viewingItem.downloadCount}
            </Descriptions.Item>
            <Descriptions.Item label="接收人">
              {viewingItem.recipients.map((email: string) => (
                <Tag key={email} icon={<MailOutlined />} style={{ marginBottom: 4 }}>
                  {email}
                </Tag>
              ))}
            </Descriptions.Item>
            <Descriptions.Item label="创建人">
              {viewingItem.creator}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {viewingItem.createTime}
            </Descriptions.Item>
            <Descriptions.Item label="生成时间">
              {viewingItem.generateTime || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="下次运行">
              {viewingItem.nextRunTime || '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
        
        {viewingItem && activeTab === 'templates' && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="模板名称">
              {viewingItem.name}
            </Descriptions.Item>
            <Descriptions.Item label="模板描述">
              {viewingItem.description}
            </Descriptions.Item>
            <Descriptions.Item label="模板类型">
              <Tag color={viewingItem.type === 'standard' ? 'blue' : 'green'}>
                {viewingItem.type === 'standard' ? '标准' : '自定义'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="包含章节">
              {viewingItem.sections.map((section: string) => (
                <Tag key={section} style={{ marginBottom: 4 }}>
                  {section}
                </Tag>
              ))}
            </Descriptions.Item>
            <Descriptions.Item label="使用次数">
              {viewingItem.usageCount}
            </Descriptions.Item>
            <Descriptions.Item label="创建人">
              {viewingItem.creator}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {viewingItem.createTime}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};

export default QualityReportsPage;