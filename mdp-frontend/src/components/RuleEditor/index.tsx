/**
 * 可视化规则编辑器组件
 * 支持拖拽式规则构建和可视化编辑
 */

import React, { useState, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Select,
  Input,
  InputNumber,
  Form,
  Tree,
  Divider,
  Tag,
  Tooltip,
  Modal,
  message,
  Alert,
  Collapse,
  Switch,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  CopyOutlined,
  SaveOutlined,
  PlayCircleOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  BranchesOutlined,
  FilterOutlined,
  FunctionOutlined,
  DatabaseOutlined,
  TableOutlined,
  FieldNumberOutlined,
  FieldStringOutlined,
  FieldTimeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import './index.css';

const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse;

// 规则条件类型
interface RuleCondition {
  id: string;
  field: string;
  operator: string;
  value: any;
  dataType: 'string' | 'number' | 'date' | 'boolean';
  logic?: 'AND' | 'OR';
}

// 规则组类型
interface RuleGroup {
  id: string;
  logic: 'AND' | 'OR';
  conditions: (RuleCondition | RuleGroup)[];
}

// 规则定义类型
interface RuleDefinition {
  id?: string;
  name: string;
  description: string;
  category: string;
  severity: 'high' | 'medium' | 'low';
  enabled: boolean;
  ruleGroup: RuleGroup;
  actions: RuleAction[];
}

// 规则动作类型
interface RuleAction {
  id: string;
  type: 'alert' | 'block' | 'log' | 'transform';
  config: Record<string, any>;
}

// 字段定义类型
interface FieldDefinition {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  label: string;
  description?: string;
}

// 操作符定义
const OPERATORS = {
  string: [
    { value: 'equals', label: '等于' },
    { value: 'not_equals', label: '不等于' },
    { value: 'contains', label: '包含' },
    { value: 'not_contains', label: '不包含' },
    { value: 'starts_with', label: '开始于' },
    { value: 'ends_with', label: '结束于' },
    { value: 'is_empty', label: '为空' },
    { value: 'is_not_empty', label: '不为空' },
    { value: 'regex', label: '正则匹配' },
  ],
  number: [
    { value: 'equals', label: '等于' },
    { value: 'not_equals', label: '不等于' },
    { value: 'greater_than', label: '大于' },
    { value: 'greater_than_or_equal', label: '大于等于' },
    { value: 'less_than', label: '小于' },
    { value: 'less_than_or_equal', label: '小于等于' },
    { value: 'between', label: '介于' },
    { value: 'not_between', label: '不介于' },
    { value: 'is_null', label: '为空' },
    { value: 'is_not_null', label: '不为空' },
  ],
  date: [
    { value: 'equals', label: '等于' },
    { value: 'not_equals', label: '不等于' },
    { value: 'after', label: '晚于' },
    { value: 'before', label: '早于' },
    { value: 'between', label: '介于' },
    { value: 'is_null', label: '为空' },
    { value: 'is_not_null', label: '不为空' },
  ],
  boolean: [
    { value: 'is_true', label: '为真' },
    { value: 'is_false', label: '为假' },
    { value: 'is_null', label: '为空' },
    { value: 'is_not_null', label: '不为空' },
  ],
};

// 模拟字段定义
const mockFields: FieldDefinition[] = [
  { name: 'id', type: 'number', label: 'ID', description: '主键ID' },
  { name: 'name', type: 'string', label: '姓名', description: '用户姓名' },
  { name: 'email', type: 'string', label: '邮箱', description: '用户邮箱' },
  { name: 'age', type: 'number', label: '年龄', description: '用户年龄' },
  { name: 'created_at', type: 'date', label: '创建时间', description: '记录创建时间' },
  { name: 'is_active', type: 'boolean', label: '是否激活', description: '用户状态' },
  { name: 'phone', type: 'string', label: '电话', description: '联系电话' },
  { name: 'salary', type: 'number', label: '薪资', description: '员工薪资' },
];

interface RuleEditorProps {
  value?: RuleDefinition;
  onChange?: (rule: RuleDefinition) => void;
  onSave?: (rule: RuleDefinition) => void;
  onTest?: (rule: RuleDefinition) => void;
  fields?: FieldDefinition[];
  readonly?: boolean;
}

/**
 * 可视化规则编辑器组件
 */
const RuleEditor: React.FC<RuleEditorProps> = ({
  value,
  onChange,
  onSave,
  onTest,
  fields = mockFields,
  readonly = false,
}) => {
  const [form] = Form.useForm();
  const [rule, setRule] = useState<RuleDefinition>(
    value || {
      name: '',
      description: '',
      category: 'completeness',
      severity: 'medium',
      enabled: true,
      ruleGroup: {
        id: 'root',
        logic: 'AND',
        conditions: [],
      },
      actions: [],
    }
  );
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [isTestModalVisible, setIsTestModalVisible] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // 获取字段图标
  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'string':
        return <FieldStringOutlined />;
      case 'number':
        return <FieldNumberOutlined />;
      case 'date':
        return <FieldTimeOutlined />;
      case 'boolean':
        return <CheckCircleOutlined />;
      default:
        return <FieldStringOutlined />;
    }
  };

  // 生成唯一ID
  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  // 添加条件
  const addCondition = useCallback((groupId: string) => {
    const newCondition: RuleCondition = {
      id: generateId(),
      field: '',
      operator: '',
      value: '',
      dataType: 'string',
    };

    const updateGroup = (group: RuleGroup): RuleGroup => {
      if (group.id === groupId) {
        return {
          ...group,
          conditions: [...group.conditions, newCondition],
        };
      }
      return {
        ...group,
        conditions: group.conditions.map(condition => 
          'logic' in condition ? updateGroup(condition as RuleGroup) : condition
        ),
      };
    };

    const updatedRule = {
      ...rule,
      ruleGroup: updateGroup(rule.ruleGroup),
    };
    setRule(updatedRule);
    onChange?.(updatedRule);
  }, [rule, onChange]);

  // 添加组
  const addGroup = useCallback((parentGroupId: string) => {
    const newGroup: RuleGroup = {
      id: generateId(),
      logic: 'AND',
      conditions: [],
    };

    const updateGroup = (group: RuleGroup): RuleGroup => {
      if (group.id === parentGroupId) {
        return {
          ...group,
          conditions: [...group.conditions, newGroup],
        };
      }
      return {
        ...group,
        conditions: group.conditions.map(condition => 
          'logic' in condition ? updateGroup(condition as RuleGroup) : condition
        ),
      };
    };

    const updatedRule = {
      ...rule,
      ruleGroup: updateGroup(rule.ruleGroup),
    };
    setRule(updatedRule);
    onChange?.(updatedRule);
  }, [rule, onChange]);

  // 删除条件或组
  const removeItem = useCallback((itemId: string) => {
    const removeFromGroup = (group: RuleGroup): RuleGroup => {
      return {
        ...group,
        conditions: group.conditions
          .filter(condition => 
            'logic' in condition ? condition.id !== itemId : condition.id !== itemId
          )
          .map(condition => 
            'logic' in condition ? removeFromGroup(condition as RuleGroup) : condition
          ),
      };
    };

    const updatedRule = {
      ...rule,
      ruleGroup: removeFromGroup(rule.ruleGroup),
    };
    setRule(updatedRule);
    onChange?.(updatedRule);
  }, [rule, onChange]);

  // 更新条件
  const updateCondition = useCallback((conditionId: string, updates: Partial<RuleCondition>) => {
    const updateInGroup = (group: RuleGroup): RuleGroup => {
      return {
        ...group,
        conditions: group.conditions.map(condition => {
          if ('logic' in condition) {
            return updateInGroup(condition as RuleGroup);
          } else if (condition.id === conditionId) {
            return { ...condition, ...updates };
          }
          return condition;
        }),
      };
    };

    const updatedRule = {
      ...rule,
      ruleGroup: updateInGroup(rule.ruleGroup),
    };
    setRule(updatedRule);
    onChange?.(updatedRule);
  }, [rule, onChange]);

  // 更新组逻辑
  const updateGroupLogic = useCallback((groupId: string, logic: 'AND' | 'OR') => {
    const updateGroup = (group: RuleGroup): RuleGroup => {
      if (group.id === groupId) {
        return { ...group, logic };
      }
      return {
        ...group,
        conditions: group.conditions.map(condition => 
          'logic' in condition ? updateGroup(condition as RuleGroup) : condition
        ),
      };
    };

    const updatedRule = {
      ...rule,
      ruleGroup: updateGroup(rule.ruleGroup),
    };
    setRule(updatedRule);
    onChange?.(updatedRule);
  }, [rule, onChange]);

  // 渲染条件
  const renderCondition = (condition: RuleCondition, groupId: string) => {
    const field = fields.find(f => f.name === condition.field);
    const operators = field ? OPERATORS[field.type] : [];
    const isSelected = selectedCondition === condition.id;

    return (
      <div
        key={condition.id}
        className={`rule-condition ${isSelected ? 'selected' : ''}`}
        onClick={() => setSelectedCondition(condition.id)}
      >
        <Row gutter={8} align="middle">
          <Col flex="120px">
            <Select
              value={condition.field}
              placeholder="选择字段"
              style={{ width: '100%' }}
              size="small"
              disabled={readonly}
              onChange={(value) => {
                const selectedField = fields.find(f => f.name === value);
                updateCondition(condition.id, {
                  field: value,
                  dataType: selectedField?.type || 'string',
                  operator: '',
                  value: '',
                });
              }}
            >
              {fields.map(field => (
                <Option key={field.name} value={field.name}>
                  <Space>
                    {getFieldIcon(field.type)}
                    {field.label}
                  </Space>
                </Option>
              ))}
            </Select>
          </Col>
          
          <Col flex="100px">
            <Select
              value={condition.operator}
              placeholder="操作符"
              style={{ width: '100%' }}
              size="small"
              disabled={readonly || !condition.field}
              onChange={(value) => updateCondition(condition.id, { operator: value })}
            >
              {operators.map(op => (
                <Option key={op.value} value={op.value}>
                  {op.label}
                </Option>
              ))}
            </Select>
          </Col>
          
          <Col flex="auto">
            {condition.dataType === 'number' ? (
              <InputNumber
                value={condition.value}
                placeholder="输入数值"
                style={{ width: '100%' }}
                size="small"
                disabled={readonly}
                onChange={(value) => updateCondition(condition.id, { value })}
              />
            ) : condition.dataType === 'boolean' ? (
              <Select
                value={condition.value}
                placeholder="选择值"
                style={{ width: '100%' }}
                size="small"
                disabled={readonly}
                onChange={(value) => updateCondition(condition.id, { value })}
              >
                <Option value={true}>是</Option>
                <Option value={false}>否</Option>
              </Select>
            ) : (
              <Input
                value={condition.value}
                placeholder="输入值"
                size="small"
                disabled={readonly}
                onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
              />
            )}
          </Col>
          
          {!readonly && (
            <Col>
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  removeItem(condition.id);
                }}
              />
            </Col>
          )}
        </Row>
      </div>
    );
  };

  // 渲染组
  const renderGroup = (group: RuleGroup, level: number = 0) => {
    return (
      <div key={group.id} className={`rule-group level-${level}`}>
        <div className="group-header">
          <Space>
            <Select
              value={group.logic}
              size="small"
              style={{ width: 80 }}
              disabled={readonly}
              onChange={(value) => updateGroupLogic(group.id, value)}
            >
              <Option value="AND">AND</Option>
              <Option value="OR">OR</Option>
            </Select>
            
            {!readonly && (
              <>
                <Button
                  type="text"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => addCondition(group.id)}
                >
                  条件
                </Button>
                <Button
                  type="text"
                  size="small"
                  icon={<BranchesOutlined />}
                  onClick={() => addGroup(group.id)}
                >
                  组
                </Button>
                {group.id !== 'root' && (
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => removeItem(group.id)}
                  />
                )}
              </>
            )}
          </Space>
        </div>
        
        <div className="group-content">
          {group.conditions.map((condition, index) => (
            <div key={condition.id}>
              {index > 0 && (
                <div className="logic-connector">
                  <Tag color={group.logic === 'AND' ? 'blue' : 'orange'}>
                    {group.logic}
                  </Tag>
                </div>
              )}
              {'logic' in condition
                ? renderGroup(condition as RuleGroup, level + 1)
                : renderCondition(condition, group.id)
              }
            </div>
          ))}
          
          {group.conditions.length === 0 && (
            <div className="empty-group">
              <Alert
                message="暂无条件"
                description="点击上方按钮添加条件或条件组"
                type="info"
                showIcon
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  // 测试规则
  const handleTest = () => {
    if (!rule.name) {
      message.error('请先填写规则名称');
      return;
    }
    
    // 模拟测试结果
    const mockResult = {
      success: true,
      matchedRecords: 156,
      totalRecords: 1000,
      matchRate: 15.6,
      sampleData: [
        { id: 1, name: 'John Doe', email: 'john@example.com', age: 25 },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 30 },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35 },
      ],
    };
    
    setTestResult(mockResult);
    setIsTestModalVisible(true);
    onTest?.(rule);
  };

  // 保存规则
  const handleSave = () => {
    if (!rule.name) {
      message.error('请填写规则名称');
      return;
    }
    
    if (rule.ruleGroup.conditions.length === 0) {
      message.error('请至少添加一个条件');
      return;
    }
    
    onSave?.(rule);
    message.success('规则保存成功');
  };

  return (
    <div className="rule-editor">
      {/* 规则基本信息 */}
      <Card title="规则信息" size="small" className="rule-info-card">
        <Form form={form} layout="vertical" size="small">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="规则名称" required>
                <Input
                  value={rule.name}
                  placeholder="请输入规则名称"
                  disabled={readonly}
                  onChange={(e) => {
                    const updatedRule = { ...rule, name: e.target.value };
                    setRule(updatedRule);
                    onChange?.(updatedRule);
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="规则类别">
                <Select
                  value={rule.category}
                  style={{ width: '100%' }}
                  disabled={readonly}
                  onChange={(value) => {
                    const updatedRule = { ...rule, category: value };
                    setRule(updatedRule);
                    onChange?.(updatedRule);
                  }}
                >
                  <Option value="completeness">完整性</Option>
                  <Option value="accuracy">准确性</Option>
                  <Option value="consistency">一致性</Option>
                  <Option value="validity">有效性</Option>
                  <Option value="uniqueness">唯一性</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="严重程度">
                <Select
                  value={rule.severity}
                  style={{ width: '100%' }}
                  disabled={readonly}
                  onChange={(value) => {
                    const updatedRule = { ...rule, severity: value };
                    setRule(updatedRule);
                    onChange?.(updatedRule);
                  }}
                >
                  <Option value="high">高</Option>
                  <Option value="medium">中</Option>
                  <Option value="low">低</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="启用状态">
                <Switch
                  checked={rule.enabled}
                  disabled={readonly}
                  onChange={(checked) => {
                    const updatedRule = { ...rule, enabled: checked };
                    setRule(updatedRule);
                    onChange?.(updatedRule);
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item label="规则描述">
            <TextArea
              value={rule.description}
              placeholder="请输入规则描述"
              rows={3}
              disabled={readonly}
              onChange={(e) => {
                const updatedRule = { ...rule, description: e.target.value };
                setRule(updatedRule);
                onChange?.(updatedRule);
              }}
            />
          </Form.Item>
        </Form>
      </Card>

      {/* 规则条件编辑器 */}
      <Card
        title={
          <Space>
            <FilterOutlined />
            规则条件
            <Tooltip title="使用可视化编辑器构建规则条件">
              <QuestionCircleOutlined style={{ color: '#999' }} />
            </Tooltip>
          </Space>
        }
        size="small"
        className="rule-conditions-card"
      >
        <div className="rule-builder">
          {renderGroup(rule.ruleGroup)}
        </div>
      </Card>

      {/* 操作按钮 */}
      {!readonly && (
        <div className="rule-actions">
          <Space>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
            >
              保存规则
            </Button>
            <Button
              icon={<PlayCircleOutlined />}
              onClick={handleTest}
            >
              测试规则
            </Button>
          </Space>
        </div>
      )}

      {/* 测试结果弹窗 */}
      <Modal
        title="规则测试结果"
        open={isTestModalVisible}
        onCancel={() => setIsTestModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsTestModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {testResult && (
          <div className="test-result">
            <Row gutter={16}>
              <Col span={8}>
                <Card size="small">
                  <div className="result-stat">
                    <div className="stat-value">{testResult.matchedRecords}</div>
                    <div className="stat-label">匹配记录数</div>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <div className="result-stat">
                    <div className="stat-value">{testResult.totalRecords}</div>
                    <div className="stat-label">总记录数</div>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <div className="result-stat">
                    <div className="stat-value">{testResult.matchRate}%</div>
                    <div className="stat-label">匹配率</div>
                  </div>
                </Card>
              </Col>
            </Row>
            
            <Divider>样本数据</Divider>
            
            <div className="sample-data">
              {testResult.sampleData.map((record: any, index: number) => (
                <div key={index} className="sample-record">
                  <pre>{JSON.stringify(record, null, 2)}</pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RuleEditor;