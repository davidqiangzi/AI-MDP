/**
 * 数据概览页面
 * 显示系统整体数据统计和图表
 */

import React, { useEffect } from 'react';
import { Row, Col, Card, Statistic, Progress, Table, Tag } from 'antd';
import {
  DatabaseOutlined,
  TableOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { useAppDispatch } from '../../store';
import { setBreadcrumbs } from '../../store/slices/uiSlice';

/**
 * 数据概览页面组件
 */
const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // 设置面包屑
    dispatch(setBreadcrumbs([
      { key: 'dashboard', label: '数据概览', path: '/dashboard' }
    ]));
  }, [dispatch]);

  // 模拟数据
  const statsData = {
    totalTables: 1248,
    totalFields: 15632,
    qualityScore: 85.6,
    activeConnections: 24,
  };

  // 最近数据表
  const recentTables = [
    {
      key: '1',
      name: 'user_profile',
      database: 'user_db',
      lastUpdated: '2024-01-15 14:30:00',
      status: 'active',
      qualityScore: 92,
    },
    {
      key: '2',
      name: 'order_details',
      database: 'order_db',
      lastUpdated: '2024-01-15 13:45:00',
      status: 'active',
      qualityScore: 88,
    },
    {
      key: '3',
      name: 'product_catalog',
      database: 'product_db',
      lastUpdated: '2024-01-15 12:20:00',
      status: 'warning',
      qualityScore: 76,
    },
    {
      key: '4',
      name: 'payment_records',
      database: 'finance_db',
      lastUpdated: '2024-01-15 11:15:00',
      status: 'active',
      qualityScore: 94,
    },
  ];

  const tableColumns = [
    {
      title: '表名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '数据库',
      dataIndex: 'database',
      key: 'database',
    },
    {
      title: '最后更新',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'active' ? 'green' : 'orange';
        const text = status === 'active' ? '正常' : '警告';
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '质量评分',
      dataIndex: 'qualityScore',
      key: 'qualityScore',
      render: (score: number) => (
        <Progress
          percent={score}
          size="small"
          status={score >= 90 ? 'success' : score >= 80 ? 'normal' : 'exception'}
        />
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>数据概览</h1>
      
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="数据表总数"
              value={statsData.totalTables}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#3f8600' }}
              suffix={<ArrowUpOutlined style={{ fontSize: '12px' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="字段总数"
              value={statsData.totalFields}
              prefix={<TableOutlined />}
              valueStyle={{ color: '#1890ff' }}
              suffix={<ArrowUpOutlined style={{ fontSize: '12px' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="数据质量评分"
              value={statsData.qualityScore}
              precision={1}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
              suffix={<ArrowDownOutlined style={{ fontSize: '12px' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活跃连接数"
              value={statsData.activeConnections}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 数据质量概览 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="数据质量分布" variant="borderless">
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <Progress
                    type="circle"
                    percent={75}
                    format={() => '优秀'}
                    strokeColor="#52c41a"
                  />
                  <div style={{ marginTop: '8px' }}>优秀 (≥90分)</div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <Progress
                    type="circle"
                    percent={20}
                    format={() => '良好'}
                    strokeColor="#1890ff"
                  />
                  <div style={{ marginTop: '8px' }}>良好 (80-89分)</div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <Progress
                    type="circle"
                    percent={5}
                    format={() => '待改进'}
                    strokeColor="#ff4d4f"
                  />
                  <div style={{ marginTop: '8px' }}>待改进 (&lt;80分)</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="系统健康状态" variant="borderless">
            <div style={{ padding: '20px 0' }}>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>CPU 使用率</span>
                  <span>45%</span>
                </div>
                <Progress percent={45} strokeColor="#52c41a" />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>内存使用率</span>
                  <span>68%</span>
                </div>
                <Progress percent={68} strokeColor="#1890ff" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>存储使用率</span>
                  <span>82%</span>
                </div>
                <Progress percent={82} strokeColor="#faad14" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 最近更新的数据表 */}
      <Card title="最近更新的数据表" variant="borderless">
        <Table
          columns={tableColumns}
          dataSource={recentTables}
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default Dashboard;