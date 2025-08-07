import React, { useState, useEffect } from 'react';
import {
  Layout,
  Tree,
  Input,
  Select,
  Button,
  Table,
  Tag,
  Space,
  Card,
  Row,
  Col,
  Breadcrumb,
  Pagination,
  Tooltip,
  Rate,
  message
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  EyeOutlined,
  StarOutlined,
  MoreOutlined,
  DatabaseOutlined,
  TableOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setBreadcrumbs } from '../../store/slices/uiSlice';
import type { DataNode } from 'antd/es/tree';
import './index.css';

const { Sider, Content } = Layout;
const { Search } = Input;
const { Option } = Select;

interface DataAsset {
  id: string;
  name: string;
  type: 'table' | 'view' | 'file' | 'api';
  businessDomain: string;
  database: string;
  schema?: string;
  description: string;
  owner: string;
  createTime: string;
  updateTime: string;
  healthScore: number;
  status: 'active' | 'inactive' | 'deprecated';
  tags: string[];
}

interface FilterState {
  status: string[];
  type: string[];
  businessDomain: string[];
  healthScore: [number, number];
  dateRange: [string, string] | null;
}

const DataAssetsPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['business-domains']);
  const [dataAssets, setDataAssets] = useState<DataAsset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<DataAsset[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    type: [],
    businessDomain: [],
    healthScore: [0, 100],
    dateRange: null
  });

  // 模拟分类导航树数据
  const treeData: DataNode[] = [
    {
      title: '业务域',
      key: 'business-domains',
      icon: <DatabaseOutlined />,
      children: [
        {
          title: '用户中心',
          key: 'user-center',
          children: [
            { title: '用户基础信息', key: 'user-basic' },
            { title: '用户行为数据', key: 'user-behavior' },
            { title: '用户画像', key: 'user-profile' },
            { title: '用户权限管理', key: 'user-permission' },
            { title: '用户等级体系', key: 'user-level' },
            { title: '用户标签管理', key: 'user-tags' },
            { title: '用户反馈数据', key: 'user-feedback' },
            { title: '用户社交关系', key: 'user-social' },
            { title: '用户设备信息', key: 'user-device' },
            { title: '用户安全日志', key: 'user-security' }
          ]
        },
        {
          title: '订单中心',
          key: 'order-center',
          children: [
            { title: '订单主表', key: 'order-main' },
            { title: '订单明细', key: 'order-detail' },
            { title: '支付信息', key: 'payment-info' },
            { title: '订单状态流转', key: 'order-status' },
            { title: '退款退货', key: 'order-refund' },
            { title: '订单评价', key: 'order-review' },
            { title: '订单物流', key: 'order-logistics' },
            { title: '订单优惠券', key: 'order-coupon' },
            { title: '订单发票', key: 'order-invoice' },
            { title: '订单风控', key: 'order-risk' }
          ]
        },
        {
          title: '商品中心',
          key: 'product-center',
          children: [
            { title: '商品基础信息', key: 'product-basic' },
            { title: '商品库存', key: 'product-inventory' },
            { title: '商品价格', key: 'product-price' },
            { title: '商品分类', key: 'product-category' },
            { title: '商品属性', key: 'product-attribute' },
            { title: '商品图片', key: 'product-image' },
            { title: '商品评论', key: 'product-comment' },
            { title: '商品销量统计', key: 'product-sales' },
            { title: '商品推荐', key: 'product-recommend' },
            { title: '商品供应商', key: 'product-supplier' }
          ]
        },
        {
          title: '营销中心',
          key: 'marketing-center',
          children: [
            { title: '营销活动', key: 'marketing-campaign' },
            { title: '客户分群', key: 'customer-segment' },
            { title: '优惠券管理', key: 'promotion-coupon' },
            { title: '邮件营销', key: 'email-marketing' },
            { title: '社交媒体', key: 'social-media' },
            { title: '推荐计划', key: 'referral-program' },
            { title: '内容营销', key: 'content-marketing' },
            { title: '营销归因', key: 'marketing-attribution' },
            { title: '忠诚度计划', key: 'loyalty-program' },
            { title: '营销ROI', key: 'marketing-roi' }
          ]
        },
        {
          title: '财务中心',
          key: 'finance-center',
          children: [
            { title: '财务报表', key: 'finance-report' },
            { title: '成本核算', key: 'cost-accounting' },
            { title: '预算管理', key: 'budget-management' },
            { title: '应收账款', key: 'accounts-receivable' },
            { title: '应付账款', key: 'accounts-payable' },
            { title: '现金流管理', key: 'cash-flow' },
            { title: '税务管理', key: 'tax-management' },
            { title: '资产管理', key: 'asset-management' },
            { title: '投资分析', key: 'investment-analysis' },
            { title: '风险控制', key: 'risk-control' }
          ]
        },
        {
          title: '供应链中心',
          key: 'supply-chain-center',
          children: [
            { title: '供应商管理', key: 'supplier-management' },
            { title: '采购管理', key: 'procurement-management' },
            { title: '库存管理', key: 'inventory-management' },
            { title: '物流配送', key: 'logistics-delivery' },
            { title: '仓储管理', key: 'warehouse-management' },
            { title: '质量检测', key: 'quality-inspection' },
            { title: '供应链金融', key: 'supply-chain-finance' },
            { title: '需求预测', key: 'demand-forecast' },
            { title: '供应链风险', key: 'supply-chain-risk' },
            { title: '供应链协同', key: 'supply-chain-collaboration' }
          ]
        },
        {
          title: '客服中心',
          key: 'customer-service-center',
          children: [
            { title: '工单管理', key: 'ticket-management' },
            { title: '客户咨询', key: 'customer-inquiry' },
            { title: '投诉处理', key: 'complaint-handling' },
            { title: '知识库', key: 'knowledge-base' },
            { title: '客服绩效', key: 'service-performance' },
            { title: '满意度调查', key: 'satisfaction-survey' },
            { title: '智能客服', key: 'intelligent-service' },
            { title: '客服培训', key: 'service-training' },
            { title: '服务质量', key: 'service-quality' },
            { title: '客户关怀', key: 'customer-care' }
          ]
        }
      ]
    },
    {
      title: '数据层级',
      key: 'data-layers',
      icon: <TableOutlined />,
      children: [
        {
          title: 'ODS层',
          key: 'ods',
          children: [
            { title: 'ODS用户数据', key: 'ods-user' },
            { title: 'ODS订单数据', key: 'ods-order' },
            { title: 'ODS商品数据', key: 'ods-product' },
            { title: 'ODS支付数据', key: 'ods-payment' },
            { title: 'ODS物流数据', key: 'ods-logistics' },
            { title: 'ODS营销数据', key: 'ods-marketing' },
            { title: 'ODS财务数据', key: 'ods-finance' },
            { title: 'ODS供应链数据', key: 'ods-supply' },
            { title: 'ODS客服数据', key: 'ods-service' },
            { title: 'ODS系统日志', key: 'ods-log' }
          ]
        },
        {
          title: 'DWD层',
          key: 'dwd',
          children: [
            { title: 'DWD用户明细', key: 'dwd-user' },
            { title: 'DWD订单明细', key: 'dwd-order' },
            { title: 'DWD商品明细', key: 'dwd-product' },
            { title: 'DWD支付明细', key: 'dwd-payment' },
            { title: 'DWD物流明细', key: 'dwd-logistics' },
            { title: 'DWD营销明细', key: 'dwd-marketing' },
            { title: 'DWD财务明细', key: 'dwd-finance' },
            { title: 'DWD供应链明细', key: 'dwd-supply' },
            { title: 'DWD客服明细', key: 'dwd-service' },
            { title: 'DWD行为明细', key: 'dwd-behavior' }
          ]
        },
        {
          title: 'DWS层',
          key: 'dws',
          children: [
            { title: 'DWS用户汇总', key: 'dws-user' },
            { title: 'DWS订单汇总', key: 'dws-order' },
            { title: 'DWS商品汇总', key: 'dws-product' },
            { title: 'DWS支付汇总', key: 'dws-payment' },
            { title: 'DWS物流汇总', key: 'dws-logistics' },
            { title: 'DWS营销汇总', key: 'dws-marketing' },
            { title: 'DWS财务汇总', key: 'dws-finance' },
            { title: 'DWS供应链汇总', key: 'dws-supply' },
            { title: 'DWS客服汇总', key: 'dws-service' },
            { title: 'DWS流量汇总', key: 'dws-traffic' }
          ]
        },
        {
          title: 'ADS层',
          key: 'ads',
          children: [
            { title: 'ADS用户分析', key: 'ads-user' },
            { title: 'ADS订单分析', key: 'ads-order' },
            { title: 'ADS商品分析', key: 'ads-product' },
            { title: 'ADS支付分析', key: 'ads-payment' },
            { title: 'ADS物流分析', key: 'ads-logistics' },
            { title: 'ADS营销分析', key: 'ads-marketing' },
            { title: 'ADS财务分析', key: 'ads-finance' },
            { title: 'ADS供应链分析', key: 'ads-supply' },
            { title: 'ADS客服分析', key: 'ads-service' },
            { title: 'ADS经营分析', key: 'ads-business' }
          ]
        }
      ]
    },
    {
      title: '数据类型',
      key: 'data-types',
      icon: <FileTextOutlined />,
      children: [
        { title: '数据表', key: 'table' },
        { title: '视图', key: 'view' },
        { title: '文件', key: 'file' },
        { title: 'API', key: 'api' }
      ]
    }
  ];

  // 模拟数据资产数据
  const mockDataAssets: DataAsset[] = [
    // 用户中心业务域数据 - 按三级分类重新映射 (10条)
    {
      id: '1',
      name: 'user_basic_info',
      type: 'table',
      businessDomain: '用户基础信息',
      database: 'user_db',
      schema: 'public',
      description: '用户基础信息表，包含用户ID、姓名、手机号等基本信息',
      owner: '张三',
      createTime: '2024-01-15 10:30:00',
      updateTime: '2024-01-20 14:20:00',
      healthScore: 95,
      status: 'active',
      tags: ['核心表', '用户数据', 'PII', 'user-basic', 'dwd-user', 'table']
    },
    {
      id: '2',
      name: 'user_profile',
      type: 'table',
      businessDomain: '用户画像',
      database: 'user_db',
      schema: 'public',
      description: '用户画像表，存储用户的兴趣偏好和行为特征',
      owner: '张三',
      createTime: '2024-01-10 09:15:00',
      updateTime: '2024-01-21 16:45:00',
      healthScore: 88,
      status: 'active',
      tags: ['用户画像', '机器学习', '推荐系统', 'user-profile', 'dws-user', 'table']
    },
    {
      id: '3',
      name: 'user_behavior_log',
      type: 'table',
      businessDomain: '用户行为数据',
      database: 'user_db',
      schema: 'logs',
      description: '用户行为日志表，记录用户在平台上的各种操作行为',
      owner: '李明',
      createTime: '2024-01-08 14:20:00',
      updateTime: '2024-01-22 10:30:00',
      healthScore: 92,
      status: 'active',
      tags: ['行为数据', '日志', '实时', 'user-behavior', 'ods-user', 'table']
    },
    {
      id: '4',
      name: 'user_preference',
      type: 'table',
      businessDomain: '用户基础信息',
      database: 'user_db',
      schema: 'public',
      description: '用户偏好设置表，存储用户的个性化配置信息',
      owner: '王芳',
      createTime: '2024-01-12 11:45:00',
      updateTime: '2024-01-20 15:20:00',
      healthScore: 90,
      status: 'active',
      tags: ['偏好设置', '个性化', '配置', 'user-basic', 'dwd-user', 'table']
    },
    {
      id: '5',
      name: 'user_login_history',
      type: 'table',
      businessDomain: '用户安全日志',
      database: 'user_db',
      schema: 'security',
      description: '用户登录历史表，记录用户的登录时间、IP地址等安全信息',
      owner: '赵强',
      createTime: '2024-01-05 16:30:00',
      updateTime: '2024-01-22 09:15:00',
      healthScore: 94,
      status: 'active',
      tags: ['安全', '登录记录', '审计', 'user-security', 'ods-user', 'table']
    },
    {
      id: '6',
      name: 'user_address',
      type: 'table',
      businessDomain: '用户基础信息',
      database: 'user_db',
      schema: 'public',
      description: '用户地址信息表，存储用户的收货地址和联系方式',
      owner: '陈丽',
      createTime: '2024-01-14 13:20:00',
      updateTime: '2024-01-21 11:40:00',
      healthScore: 87,
      status: 'active',
      tags: ['地址信息', 'PII', '物流', 'user-basic', 'dwd-user', 'table']
    },
    {
      id: '7',
      name: 'user_credit_score',
      type: 'table',
      businessDomain: '用户等级体系',
      database: 'user_db',
      schema: 'finance',
      description: '用户信用评分表，存储用户的信用等级和评分历史',
      owner: '孙伟',
      createTime: '2024-01-09 10:15:00',
      updateTime: '2024-01-20 14:30:00',
      healthScore: 91,
      status: 'active',
      tags: ['信用评分', '风控', '金融', 'user-level', 'ads-user', 'table']
    },
    {
      id: '8',
      name: 'user_membership',
      type: 'table',
      businessDomain: '用户等级体系',
      database: 'user_db',
      schema: 'public',
      description: '用户会员信息表，记录用户的会员等级和权益信息',
      owner: '周敏',
      createTime: '2024-01-11 15:45:00',
      updateTime: '2024-01-19 16:20:00',
      healthScore: 89,
      status: 'active',
      tags: ['会员体系', '等级', '权益', 'user-level', 'dws-user', 'table']
    },
    {
      id: '9',
      name: 'user_feedback',
      type: 'table',
      businessDomain: '用户反馈数据',
      database: 'user_db',
      schema: 'feedback',
      description: '用户反馈表，收集用户对产品和服务的意见建议',
      owner: '吴涛',
      createTime: '2024-01-13 12:30:00',
      updateTime: '2024-01-21 10:15:00',
      healthScore: 85,
      status: 'active',
      tags: ['用户反馈', '产品优化', '客服', 'user-feedback', 'ods-service', 'table']
    },
    {
      id: '10',
      name: 'user_social_relation',
      type: 'table',
      businessDomain: '用户社交关系',
      database: 'user_db',
      schema: 'social',
      description: '用户社交关系表，存储用户之间的关注、好友等社交关系',
      owner: '郑华',
      createTime: '2024-01-07 14:10:00',
      updateTime: '2024-01-20 13:25:00',
      healthScore: 86,
      status: 'active',
      tags: ['社交关系', '好友', '关注', 'user-behavior', 'dwd-user', 'table']
    },

    // 订单中心业务域数据 - 按三级分类重新映射 (10条)
    {
      id: '11',
      name: 'order_main',
      type: 'table',
      businessDomain: '订单主表',
      database: 'order_db',
      schema: 'public',
      description: '订单主表，记录订单的基本信息和状态',
      owner: '李四',
      createTime: '2024-01-10 09:15:00',
      updateTime: '2024-01-21 16:45:00',
      healthScore: 88,
      status: 'active',
      tags: ['核心表', '订单数据', 'order-main', 'ods-order', 'table']
    },
    {
      id: '12',
      name: 'order_item',
      type: 'table',
      businessDomain: '订单明细',
      database: 'order_db',
      schema: 'public',
      description: '订单明细表，记录订单中每个商品的详细信息',
      owner: '李四',
      createTime: '2024-01-10 09:20:00',
      updateTime: '2024-01-21 16:50:00',
      healthScore: 90,
      status: 'active',
      tags: ['订单明细', '商品信息', 'order-detail', 'dwd-order', 'table']
    },
    {
      id: '13',
      name: 'order_payment',
      type: 'table',
      businessDomain: '支付信息',
      database: 'order_db',
      schema: 'payment',
      description: '订单支付表，记录订单的支付方式、支付状态等信息',
      owner: '钱进',
      createTime: '2024-01-11 10:30:00',
      updateTime: '2024-01-22 08:15:00',
      healthScore: 93,
      status: 'active',
      tags: ['支付信息', '财务', '交易', 'payment-info', 'dwd-payment', 'table']
    },
    {
      id: '14',
      name: 'order_logistics',
      type: 'table',
      businessDomain: '订单物流',
      database: 'order_db',
      schema: 'logistics',
      description: '订单物流表，跟踪订单的配送状态和物流信息',
      owner: '运小二',
      createTime: '2024-01-12 14:20:00',
      updateTime: '2024-01-21 17:30:00',
      healthScore: 87,
      status: 'active',
      tags: ['物流信息', '配送', '跟踪', 'order-logistics', 'dwd-order', 'table']
    },
    {
      id: '15',
      name: 'order_refund',
      type: 'table',
      businessDomain: '退款退货',
      database: 'order_db',
      schema: 'refund',
      description: '订单退款表，记录订单的退款申请和处理流程',
      owner: '客服小王',
      createTime: '2024-01-13 11:15:00',
      updateTime: '2024-01-20 15:45:00',
      healthScore: 85,
      status: 'active',
      tags: ['退款', '售后', '客服', 'order-refund', 'dws-order', 'table']
    },
    {
      id: '16',
      name: 'order_promotion',
      type: 'table',
      businessDomain: '订单优惠券',
      database: 'order_db',
      schema: 'promotion',
      description: '订单促销表，记录订单使用的优惠券、折扣等促销信息',
      owner: '营销小李',
      createTime: '2024-01-14 16:40:00',
      updateTime: '2024-01-21 12:20:00',
      healthScore: 89,
      status: 'active',
      tags: ['促销', '优惠券', '营销', 'order-promotion', 'ads-order', 'table']
    },
    {
      id: '17',
      name: 'order_evaluation',
      type: 'table',
      businessDomain: '订单评价',
      database: 'order_db',
      schema: 'evaluation',
      description: '订单评价表，存储用户对订单商品和服务的评价信息',
      owner: '评价管理员',
      createTime: '2024-01-15 13:25:00',
      updateTime: '2024-01-20 14:10:00',
      healthScore: 91,
      status: 'active',
      tags: ['用户评价', '商品评分', '服务质量', 'order-evaluation', 'dws-order', 'table']
    },
    {
      id: '18',
      name: 'order_invoice',
      type: 'table',
      businessDomain: '订单发票',
      database: 'order_db',
      schema: 'finance',
      description: '订单发票表，管理订单的发票开具和税务信息',
      owner: '财务小张',
      createTime: '2024-01-16 09:50:00',
      updateTime: '2024-01-21 11:30:00',
      healthScore: 88,
      status: 'active',
      tags: ['发票', '税务', '财务', 'order-invoice', 'dwd-order', 'table']
    },
    {
      id: '19',
      name: 'order_status_log',
      type: 'table',
      businessDomain: '订单状态流转',
      database: 'order_db',
      schema: 'logs',
      description: '订单状态变更日志表，记录订单状态的变化历史',
      owner: '系统管理员',
      createTime: '2024-01-08 15:30:00',
      updateTime: '2024-01-22 09:45:00',
      healthScore: 94,
      status: 'active',
      tags: ['状态日志', '审计', '历史记录', 'order-status', 'ods-order', 'table']
    },
    {
      id: '20',
      name: 'order_risk_control',
      type: 'table',
      businessDomain: '订单风控',
      database: 'order_db',
      schema: 'risk',
      description: '订单风控表，记录订单的风险评估和控制措施',
      owner: '风控小赵',
      createTime: '2024-01-17 10:20:00',
      updateTime: '2024-01-21 16:15:00',
      healthScore: 92,
      status: 'active',
      tags: ['风险控制', '安全', '反欺诈', 'order-risk', 'ads-order', 'table']
    },

    // 商品中心业务域数据 - 按三级分类重新映射 (10条)
    {
      id: '21',
      name: 'product_basic_info',
      type: 'table',
      businessDomain: '商品基础信息',
      database: 'product_db',
      schema: 'public',
      description: '商品基础信息表，存储商品的基本属性和描述信息',
      owner: '王五',
      createTime: '2024-01-12 11:20:00',
      updateTime: '2024-01-19 13:30:00',
      healthScore: 92,
      status: 'active',
      tags: ['商品信息', '基础数据', '核心表', 'product-basic', 'ods-product', 'table']
    },
    {
      id: '22',
      name: 'product_inventory_view',
      type: 'view',
      businessDomain: '商品库存',
      database: 'product_db',
      description: '商品库存视图，实时展示商品库存情况',
      owner: '王五',
      createTime: '2024-01-12 11:20:00',
      updateTime: '2024-01-19 13:30:00',
      healthScore: 92,
      status: 'active',
      tags: ['视图', '库存数据', '实时', 'product-inventory', 'dwd-product', 'view']
    },
    {
      id: '23',
      name: 'product_category',
      type: 'table',
      businessDomain: '商品分类',
      database: 'product_db',
      schema: 'public',
      description: '商品分类表，定义商品的层级分类结构',
      owner: '分类管理员',
      createTime: '2024-01-09 14:15:00',
      updateTime: '2024-01-18 10:20:00',
      healthScore: 95,
      status: 'active',
      tags: ['商品分类', '层级结构', '基础数据', 'product-category', 'ods-product', 'table']
    },
    {
      id: '24',
      name: 'product_price_history',
      type: 'table',
      businessDomain: '商品价格',
      database: 'product_db',
      schema: 'pricing',
      description: '商品价格历史表，记录商品价格的变动历史',
      owner: '定价专员',
      createTime: '2024-01-11 16:30:00',
      updateTime: '2024-01-20 12:45:00',
      healthScore: 89,
      status: 'active',
      tags: ['价格历史', '定价策略', '历史数据', 'product-price', 'dwd-product', 'table']
    },
    {
      id: '25',
      name: 'product_supplier',
      type: 'table',
      businessDomain: '商品供应商',
      database: 'product_db',
      schema: 'supplier',
      description: '商品供应商表，管理商品的供应商信息和合作关系',
      owner: '采购经理',
      createTime: '2024-01-13 09:40:00',
      updateTime: '2024-01-19 15:20:00',
      healthScore: 87,
      status: 'active',
      tags: ['供应商', '采购', '合作关系', 'product-supplier', 'dwd-product', 'table']
    },
    {
      id: '26',
      name: 'product_specification',
      type: 'table',
      businessDomain: '商品属性',
      database: 'product_db',
      schema: 'public',
      description: '商品规格表，定义商品的各种规格属性和参数',
      owner: '产品经理',
      createTime: '2024-01-14 11:55:00',
      updateTime: '2024-01-20 16:40:00',
      healthScore: 90,
      status: 'active',
      tags: ['商品规格', '属性参数', '产品管理', 'product-attribute', 'ods-product', 'table']
    },
    {
      id: '27',
      name: 'product_review',
      type: 'table',
      businessDomain: '商品评论',
      database: 'product_db',
      schema: 'review',
      description: '商品评论表，存储用户对商品的评论和评分信息',
      owner: '评论管理员',
      createTime: '2024-01-15 14:20:00',
      updateTime: '2024-01-21 09:30:00',
      healthScore: 86,
      status: 'active',
      tags: ['商品评论', '用户评分', '口碑']
    },
    {
      id: '28',
      name: 'product_promotion',
      type: 'table',
      businessDomain: '商品基础信息',
      database: 'product_db',
      schema: 'promotion',
      description: '商品促销表，管理商品的促销活动和优惠信息',
      owner: '促销专员',
      createTime: '2024-01-16 13:10:00',
      updateTime: '2024-01-20 17:25:00',
      healthScore: 88,
      status: 'active',
      tags: ['商品促销', '优惠活动', '营销', 'product-basic', 'dwd-product', 'table']
    },
    {
      id: '29',
      name: 'product_sales_stats',
      type: 'table',
      businessDomain: '商品销量统计',
      database: 'product_db',
      schema: 'analytics',
      description: '商品销售统计表，汇总商品的销售数据和趋势分析',
      owner: '数据分析师',
      createTime: '2024-01-17 15:45:00',
      updateTime: '2024-01-21 14:50:00',
      healthScore: 93,
      status: 'active',
      tags: ['销售统计', '数据分析', '趋势']
    },
    {
      id: '30',
      name: 'product_quality_check',
      type: 'table',
      businessDomain: '商品基础信息',
      database: 'product_db',
      schema: 'quality',
      description: '商品质检表，记录商品的质量检测结果和标准',
      owner: '质检员',
      createTime: '2024-01-18 10:30:00',
      updateTime: '2024-01-21 11:15:00',
      healthScore: 91,
      status: 'active',
      tags: ['质量检测', '质检标准', '品控', 'product-basic', 'dws-product', 'table']
    },

    // 财务中心业务域数据 - 按三级分类重新映射 (10条)
    {
      id: '31',
      name: 'financial_account',
      type: 'table',
      businessDomain: '资产管理',
      database: 'finance_db',
      schema: 'public',
      description: '财务账户表，管理企业和用户的各类财务账户信息',
      owner: '财务总监',
      createTime: '2024-01-10 08:30:00',
      updateTime: '2024-01-21 17:20:00',
      healthScore: 96,
      status: 'active',
      tags: ['财务账户', '资金管理', '核心表', 'asset-management', 'ods-finance', 'table']
    },
    {
      id: '32',
      name: 'transaction_record',
      type: 'table',
      businessDomain: '现金流管理',
      database: 'finance_db',
      schema: 'transaction',
      description: '交易记录表，详细记录所有的资金流水和交易信息',
      owner: '会计主管',
      createTime: '2024-01-11 09:15:00',
      updateTime: '2024-01-22 08:45:00',
      healthScore: 94,
      status: 'active',
      tags: ['交易记录', '资金流水', '审计', 'cash-flow', 'ods-finance', 'table']
    },
    {
      id: '33',
      name: 'invoice_management',
      type: 'table',
      businessDomain: '税务管理',
      database: 'finance_db',
      schema: 'invoice',
      description: '发票管理表，统一管理各类发票的开具和税务信息',
      owner: '税务专员',
      createTime: '2024-01-12 10:40:00',
      updateTime: '2024-01-20 16:30:00',
      healthScore: 92,
      status: 'active',
      tags: ['发票管理', '税务', '合规', 'tax-management', 'dwd-finance', 'table']
    },
    {
      id: '34',
      name: 'budget_planning',
      type: 'table',
      businessDomain: '预算管理',
      database: 'finance_db',
      schema: 'budget',
      description: '预算规划表，制定和跟踪各部门的预算执行情况',
      owner: '预算经理',
      createTime: '2024-01-13 14:20:00',
      updateTime: '2024-01-19 13:15:00',
      healthScore: 89,
      status: 'active',
      tags: ['预算规划', '成本控制', '财务管理', 'budget-management', 'dws-finance', 'table']
    },
    {
      id: '35',
      name: 'cost_center',
      type: 'table',
      businessDomain: '成本核算',
      database: 'finance_db',
      schema: 'cost',
      description: '成本中心表，按部门和项目归集和分析成本费用',
      owner: '成本会计',
      createTime: '2024-01-14 11:30:00',
      updateTime: '2024-01-20 15:45:00',
      healthScore: 90,
      status: 'active',
      tags: ['成本中心', '费用归集', '成本分析', 'cost-accounting', 'dws-finance', 'table']
    },
    {
      id: '36',
      name: 'profit_loss_statement',
      type: 'view',
      businessDomain: '财务报表',
      database: 'finance_db',
      schema: 'report',
      description: '损益表视图，实时展示企业的收入、成本和利润情况',
      owner: '财务分析师',
      createTime: '2024-01-15 16:10:00',
      updateTime: '2024-01-21 12:30:00',
      healthScore: 95,
      status: 'active',
      tags: ['损益表', '财务报表', '利润分析', 'financial-report', 'ads-finance', 'view']
    },
    {
      id: '37',
      name: 'cash_flow',
      type: 'table',
      businessDomain: '现金流管理',
      database: 'finance_db',
      schema: 'cashflow',
      description: '现金流量表，跟踪企业的现金流入和流出情况',
      owner: '资金经理',
      createTime: '2024-01-16 09:25:00',
      updateTime: '2024-01-21 14:20:00',
      healthScore: 93,
      status: 'active',
      tags: ['现金流', '资金管理', '流动性', 'cash-flow', 'dwd-finance', 'table']
    },
    {
      id: '38',
      name: 'tax_calculation',
      type: 'table',
      businessDomain: '税务管理',
      database: 'finance_db',
      schema: 'tax',
      description: '税务计算表，计算和管理各类税费的缴纳情况',
      owner: '税务会计',
      createTime: '2024-01-17 13:50:00',
      updateTime: '2024-01-20 11:40:00',
      healthScore: 91,
      status: 'active',
      tags: ['税务计算', '税费管理', '合规', 'tax-management', 'dws-finance', 'table']
    },
    {
      id: '39',
      name: 'financial_audit',
      type: 'table',
      businessDomain: '风险控制',
      database: 'finance_db',
      schema: 'audit',
      description: '财务审计表，记录内外部审计的发现和整改情况',
      owner: '内审经理',
      createTime: '2024-01-18 15:15:00',
      updateTime: '2024-01-21 16:50:00',
      healthScore: 88,
      status: 'active',
      tags: ['财务审计', '内控', '风险管理', 'risk-control', 'ads-finance', 'table']
    },
    {
      id: '40',
      name: 'asset_depreciation',
      type: 'table',
      businessDomain: '资产管理',
      database: 'finance_db',
      schema: 'asset',
      description: '资产折旧表，管理固定资产的折旧计算和账务处理',
      owner: '资产会计',
      createTime: '2024-01-19 10:45:00',
      updateTime: '2024-01-21 13:25:00',
      healthScore: 87,
      status: 'active',
      tags: ['资产折旧', '固定资产', '会计核算', 'asset-management', 'dws-finance', 'table']
    },
    {
      id: '40_1',
      name: 'investment_portfolio',
      type: 'table',
      businessDomain: '投资分析',
      database: 'finance_db',
      schema: 'investment',
      description: '投资组合分析表，管理和分析企业的投资项目和收益情况',
      owner: '投资经理',
      createTime: '2024-01-20 09:30:00',
      updateTime: '2024-01-22 11:15:00',
      healthScore: 89,
      status: 'active',
      tags: ['投资组合', '投资收益', '风险评估', 'investment-analysis', 'ads-finance', 'table']
    },

    // 营销中心业务域数据 - 按三级分类重新映射 (10条)
    {
      id: '41',
      name: 'marketing_campaign',
      type: 'table',
      businessDomain: '营销活动',
      database: 'marketing_db',
      schema: 'public',
      description: '营销活动表，管理各类营销活动的策划和执行情况',
      owner: '营销总监',
      createTime: '2024-01-10 14:30:00',
      updateTime: '2024-01-21 10:15:00',
      healthScore: 90,
      status: 'active',
      tags: ['营销活动', '活动策划', '推广', 'marketing-campaign', 'ods-marketing', 'table']
    },
    {
      id: '42',
      name: 'customer_segment',
      type: 'table',
      businessDomain: '客户分群',
      database: 'marketing_db',
      schema: 'segment',
      description: '客户分群表，基于用户行为和属性进行客户细分',
      owner: '客户分析师',
      createTime: '2024-01-11 16:20:00',
      updateTime: '2024-01-20 14:40:00',
      healthScore: 88,
      status: 'active',
      tags: ['客户分群', '用户画像', '精准营销', 'customer-segmentation', 'dwd-marketing', 'table']
    },
    {
      id: '43',
      name: 'promotion_coupon',
      type: 'table',
      businessDomain: '优惠券管理',
      database: 'marketing_db',
      schema: 'promotion',
      description: '优惠券表，管理各类优惠券的发放和使用情况',
      owner: '促销专员',
      createTime: '2024-01-12 11:45:00',
      updateTime: '2024-01-21 15:30:00',
      healthScore: 92,
      status: 'active',
      tags: ['优惠券', '促销', '用户激励', 'coupon-management', 'dwd-marketing', 'table']
    },
    {
      id: '44',
      name: 'email_marketing',
      type: 'table',
      businessDomain: '邮件营销',
      database: 'marketing_db',
      schema: 'email',
      description: '邮件营销表，记录邮件营销活动的发送和效果数据',
      owner: '邮件营销专员',
      createTime: '2024-01-13 09:30:00',
      updateTime: '2024-01-20 16:20:00',
      healthScore: 85,
      status: 'active',
      tags: ['邮件营销', 'EDM', '营销自动化', 'email-marketing', 'dwd-marketing', 'table']
    },
    {
      id: '45',
      name: 'social_media_analytics',
      type: 'table',
      businessDomain: '社交媒体',
      database: 'marketing_db',
      schema: 'social',
      description: '社交媒体分析表，分析社交平台的营销效果和用户互动',
      owner: '社媒运营',
      createTime: '2024-01-14 13:15:00',
      updateTime: '2024-01-21 11:50:00',
      healthScore: 87,
      status: 'active',
      tags: ['社交媒体', '内容营销', '用户互动', 'social-media', 'dws-marketing', 'table']
    },
    {
      id: '46',
      name: 'referral_program',
      type: 'table',
      businessDomain: '推荐计划',
      database: 'marketing_db',
      schema: 'referral',
      description: '推荐计划表，管理用户推荐奖励和裂变营销活动',
      owner: '增长专员',
      createTime: '2024-01-15 15:40:00',
      updateTime: '2024-01-20 12:10:00',
      healthScore: 89,
      status: 'active',
      tags: ['推荐计划', '裂变营销', '用户增长', 'referral-program', 'dws-marketing', 'table']
    },
    {
      id: '47',
      name: 'content_performance',
      type: 'table',
      businessDomain: '内容营销',
      database: 'marketing_db',
      schema: 'content',
      description: '内容效果表，分析各类营销内容的表现和用户反馈',
      owner: '内容运营',
      createTime: '2024-01-16 10:25:00',
      updateTime: '2024-01-21 14:35:00',
      healthScore: 86,
      status: 'active',
      tags: ['内容营销', '效果分析', '用户反馈', 'content-marketing', 'dws-marketing', 'table']
    },
    {
      id: '48',
      name: 'marketing_attribution',
      type: 'table',
      businessDomain: '营销归因',
      database: 'marketing_db',
      schema: 'attribution',
      description: '营销归因表，分析不同营销渠道对转化的贡献度',
      owner: '数据分析师',
      createTime: '2024-01-17 12:50:00',
      updateTime: '2024-01-20 17:15:00',
      healthScore: 91,
      status: 'active',
      tags: ['营销归因', '渠道分析', '转化分析', 'marketing-attribution', 'ads-marketing', 'table']
    },
    {
      id: '49',
      name: 'loyalty_program',
      type: 'table',
      businessDomain: '忠诚度计划',
      database: 'marketing_db',
      schema: 'loyalty',
      description: '忠诚度计划表，管理用户积分和会员权益体系',
      owner: '会员运营',
      createTime: '2024-01-18 14:20:00',
      updateTime: '2024-01-21 09:40:00',
      healthScore: 93,
      status: 'active',
      tags: ['忠诚度计划', '积分体系', '会员权益', 'loyalty-program', 'dws-marketing', 'table']
    },
    {
      id: '50',
      name: 'marketing_roi',
      type: 'view',
      businessDomain: '营销ROI',
      database: 'marketing_db',
      schema: 'analytics',
      description: '营销ROI视图，实时计算各营销活动的投资回报率',
      owner: '营销分析师',
      createTime: '2024-01-19 11:30:00',
      updateTime: '2024-01-21 16:25:00',
      healthScore: 94,
      status: 'active',
      tags: ['营销ROI', '投资回报', '效果评估', 'marketing-roi', 'ads-marketing', 'view']
    },

    // ODS层数据 - 用户数据 (10条)
    {
      id: '51',
      name: 'ods_user_info_df',
      type: 'table',
      businessDomain: '用户基础信息',
      database: 'ods_db',
      schema: 'user',
      description: 'ODS层用户基础信息表，存储从业务系统同步的原始用户数据',
      owner: '数据工程师',
      createTime: '2024-01-01 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 98,
      status: 'active',
      tags: ['ODS', '用户数据', '全量同步', 'user-basic', 'ods-user', 'table']
    },
    {
      id: '52',
      name: 'ods_user_behavior_log_df',
      type: 'table',
      businessDomain: '用户行为数据',
      database: 'ods_db',
      schema: 'user',
      description: 'ODS层用户行为日志表，实时采集用户在各端的行为数据',
      owner: '数据工程师',
      createTime: '2024-01-01 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 95,
      status: 'active',
      tags: ['ODS', '行为日志', '实时采集', 'user-behavior', 'ods-user', 'table']
    },
    {
      id: '53',
      name: 'ods_user_profile_df',
      type: 'table',
      businessDomain: '用户画像',
      database: 'ods_db',
      schema: 'user',
      description: 'ODS层用户画像原始数据表，包含用户标签和属性信息',
      owner: '数据工程师',
      createTime: '2024-01-01 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 92,
      status: 'active',
      tags: ['ODS', '用户画像', '标签数据']
    },
    {
      id: '54',
      name: 'ods_user_device_df',
      type: 'table',
      businessDomain: '用户设备信息',
      database: 'ods_db',
      schema: 'user',
      description: 'ODS层用户设备信息表，记录用户使用的设备和环境信息',
      owner: '数据工程师',
      createTime: '2024-01-01 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 90,
      status: 'active',
      tags: ['ODS', '设备信息', '环境数据']
    },
    {
      id: '55',
      name: 'ods_user_permission_df',
      type: 'table',
      businessDomain: '用户权限管理',
      database: 'ods_db',
      schema: 'user',
      description: 'ODS层用户权限数据表，存储用户角色和权限配置信息',
      owner: '数据工程师',
      createTime: '2024-01-01 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 94,
      status: 'active',
      tags: ['ODS', '权限管理', '角色配置']
    },
    {
      id: '56',
      name: 'ods_user_social_df',
      type: 'table',
      businessDomain: '用户社交关系',
      database: 'ods_db',
      schema: 'user',
      description: 'ODS层用户社交关系表，记录用户之间的关注、好友等关系',
      owner: '数据工程师',
      createTime: '2024-01-01 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 88,
      status: 'active',
      tags: ['ODS', '社交关系', '关系网络']
    },
    {
      id: '57',
      name: 'ods_user_feedback_df',
      type: 'table',
      businessDomain: '用户反馈数据',
      database: 'ods_db',
      schema: 'user',
      description: 'ODS层用户反馈数据表，收集用户对产品和服务的反馈意见',
      owner: '数据工程师',
      createTime: '2024-01-01 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 91,
      status: 'active',
      tags: ['ODS', '用户反馈', '意见收集', 'user-feedback', 'ods-user', 'table']
    },
    {
      id: '58',
      name: 'ods_user_level_df',
      type: 'table',
      businessDomain: '用户等级体系',
      database: 'ods_db',
      schema: 'user',
      description: 'ODS层用户等级体系表，记录用户等级和成长值信息',
      owner: '数据工程师',
      createTime: '2024-01-01 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 93,
      status: 'active',
      tags: ['ODS', '用户等级', '成长体系']
    },
    {
      id: '59',
      name: 'ods_user_security_log_df',
      type: 'table',
      businessDomain: '用户安全日志',
      database: 'ods_db',
      schema: 'user',
      description: 'ODS层用户安全日志表，记录登录、密码修改等安全相关操作',
      owner: '数据工程师',
      createTime: '2024-01-01 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 96,
      status: 'active',
      tags: ['ODS', '安全日志', '风控数据']
    },
    {
      id: '60',
      name: 'ods_user_tags_df',
      type: 'table',
      businessDomain: '用户标签管理',
      database: 'ods_db',
      schema: 'user',
      description: 'ODS层用户标签数据表，存储用户的各类业务标签和属性',
      owner: '数据工程师',
      createTime: '2024-01-01 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 89,
      status: 'active',
      tags: ['ODS', '用户标签', '属性管理']
    },

    // DWD层数据 (10条)
    {
      id: '61',
      name: 'dwd_user_info_df',
      type: 'table',
      businessDomain: 'DWD层',
      database: 'dwd_db',
      schema: 'user',
      description: 'DWD层用户信息明细表，清洗后的用户基础信息，按天分区',
      owner: '数据开发工程师',
      createTime: '2024-01-02 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 97,
      status: 'active',
      tags: ['DWD', '用户明细', '天级分区']
    },
    {
      id: '62',
      name: 'dwd_order_info_df',
      type: 'table',
      businessDomain: 'DWD层',
      database: 'dwd_db',
      schema: 'trade',
      description: 'DWD层订单信息明细表，包含订单全生命周期状态变化',
      owner: '数据开发工程师',
      createTime: '2024-01-02 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 95,
      status: 'active',
      tags: ['DWD', '订单明细', '状态跟踪']
    },
    {
      id: '63',
      name: 'dwd_product_info_df',
      type: 'table',
      businessDomain: 'DWD层',
      database: 'dwd_db',
      schema: 'product',
      description: 'DWD层商品信息明细表，标准化的商品属性和分类信息',
      owner: '数据开发工程师',
      createTime: '2024-01-02 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 93,
      status: 'active',
      tags: ['DWD', '商品明细', '属性标准化']
    },
    {
      id: '64',
      name: 'dwd_payment_info_df',
      type: 'table',
      businessDomain: 'DWD层',
      database: 'dwd_db',
      schema: 'finance',
      description: 'DWD层支付信息明细表，清洗后的支付流水和状态信息',
      owner: '数据开发工程师',
      createTime: '2024-01-02 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 96,
      status: 'active',
      tags: ['DWD', '支付明细', '流水记录']
    },
    {
      id: '65',
      name: 'dwd_behavior_log_df',
      type: 'table',
      businessDomain: 'DWD层',
      database: 'dwd_db',
      schema: 'behavior',
      description: 'DWD层用户行为明细表，标准化的用户行为事件数据',
      owner: '数据开发工程师',
      createTime: '2024-01-02 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 94,
      status: 'active',
      tags: ['DWD', '行为明细', '事件标准化']
    },
    {
      id: '66',
      name: 'dwd_logistics_info_df',
      type: 'table',
      businessDomain: 'DWD层',
      database: 'dwd_db',
      schema: 'logistics',
      description: 'DWD层物流信息明细表，包含物流轨迹和配送状态',
      owner: '数据开发工程师',
      createTime: '2024-01-02 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 91,
      status: 'active',
      tags: ['DWD', '物流明细', '轨迹跟踪']
    },
    {
      id: '67',
      name: 'dwd_marketing_activity_df',
      type: 'table',
      businessDomain: 'DWD层',
      database: 'dwd_db',
      schema: 'marketing',
      description: 'DWD层营销活动明细表，清洗后的营销活动参与和效果数据',
      owner: '数据开发工程师',
      createTime: '2024-01-02 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 89,
      status: 'active',
      tags: ['DWD', '营销明细', '活动效果']
    },
    {
      id: '68',
      name: 'dwd_finance_flow_df',
      type: 'table',
      businessDomain: 'DWD层',
      database: 'dwd_db',
      schema: 'finance',
      description: 'DWD层财务流水明细表，标准化的财务交易和账务处理',
      owner: '数据开发工程师',
      createTime: '2024-01-02 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 98,
      status: 'active',
      tags: ['DWD', '财务明细', '交易流水']
    },
    {
      id: '69',
      name: 'dwd_supply_chain_df',
      type: 'table',
      businessDomain: 'DWD层',
      database: 'dwd_db',
      schema: 'supply',
      description: 'DWD层供应链明细表，包含采购、库存、供应商等信息',
      owner: '数据开发工程师',
      createTime: '2024-01-02 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 92,
      status: 'active',
      tags: ['DWD', '供应链明细', '库存管理']
    },
    {
      id: '70',
      name: 'dwd_service_ticket_df',
      type: 'table',
      businessDomain: 'DWD层',
      database: 'dwd_db',
      schema: 'service',
      description: 'DWD层客服工单明细表，标准化的客服处理流程和结果',
      owner: '数据开发工程师',
      createTime: '2024-01-02 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 90,
      status: 'active',
      tags: ['DWD', '客服明细', '工单处理']
    },

    // DWS层数据 (10条)
    {
      id: '71',
      name: 'dws_user_1d_df',
      type: 'table',
      businessDomain: 'DWS层',
      database: 'dws_db',
      schema: 'user',
      description: 'DWS层用户天级汇总表，包含用户日活、行为统计等指标',
      owner: '数据分析师',
      createTime: '2024-01-03 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 96,
      status: 'active',
      tags: ['DWS', '用户汇总', '天级指标']
    },
    {
      id: '72',
      name: 'dws_trade_1d_df',
      type: 'table',
      businessDomain: 'DWS层',
      database: 'dws_db',
      schema: 'trade',
      description: 'DWS层交易天级汇总表，包含GMV、订单量、转化率等核心指标',
      owner: '数据分析师',
      createTime: '2024-01-03 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 98,
      status: 'active',
      tags: ['DWS', '交易汇总', 'GMV指标']
    },
    {
      id: '73',
      name: 'dws_product_1d_df',
      type: 'table',
      businessDomain: 'DWS层',
      database: 'dws_db',
      schema: 'product',
      description: 'DWS层商品天级汇总表，包含商品销量、库存、评价等统计',
      owner: '数据分析师',
      createTime: '2024-01-03 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 94,
      status: 'active',
      tags: ['DWS', '商品汇总', '销量统计']
    },
    {
      id: '74',
      name: 'dws_payment_1d_df',
      type: 'table',
      businessDomain: 'DWS层',
      database: 'dws_db',
      schema: 'finance',
      description: 'DWS层支付天级汇总表，包含支付成功率、支付方式分布等',
      owner: '数据分析师',
      createTime: '2024-01-03 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 97,
      status: 'active',
      tags: ['DWS', '支付汇总', '成功率统计']
    },
    {
      id: '75',
      name: 'dws_traffic_1d_df',
      type: 'table',
      businessDomain: 'DWS层',
      database: 'dws_db',
      schema: 'traffic',
      description: 'DWS层流量天级汇总表，包含PV、UV、跳出率等流量指标',
      owner: '数据分析师',
      createTime: '2024-01-03 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 95,
      status: 'active',
      tags: ['DWS', '流量汇总', 'PV/UV统计']
    },
    {
      id: '76',
      name: 'dws_marketing_1d_df',
      type: 'table',
      businessDomain: 'DWS层',
      database: 'dws_db',
      schema: 'marketing',
      description: 'DWS层营销天级汇总表，包含营销活动效果和ROI统计',
      owner: '数据分析师',
      createTime: '2024-01-03 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 93,
      status: 'active',
      tags: ['DWS', '营销汇总', 'ROI统计']
    },
    {
      id: '77',
      name: 'dws_finance_1d_df',
      type: 'table',
      businessDomain: 'DWS层',
      database: 'dws_db',
      schema: 'finance',
      description: 'DWS层财务天级汇总表，包含收入、成本、利润等财务指标',
      owner: '数据分析师',
      createTime: '2024-01-03 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 99,
      status: 'active',
      tags: ['DWS', '财务汇总', '利润统计']
    },
    {
      id: '78',
      name: 'dws_supply_1d_df',
      type: 'table',
      businessDomain: 'DWS层',
      database: 'dws_db',
      schema: 'supply',
      description: 'DWS层供应链天级汇总表，包含采购、库存周转等供应链指标',
      owner: '数据分析师',
      createTime: '2024-01-03 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 91,
      status: 'active',
      tags: ['DWS', '供应链汇总', '库存周转']
    },
    {
      id: '79',
      name: 'dws_service_1d_df',
      type: 'table',
      businessDomain: 'DWS层',
      database: 'dws_db',
      schema: 'service',
      description: 'DWS层客服天级汇总表，包含工单处理效率、满意度等指标',
      owner: '数据分析师',
      createTime: '2024-01-03 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 92,
      status: 'active',
      tags: ['DWS', '客服汇总', '满意度统计']
    },
    {
      id: '80',
      name: 'dws_logistics_1d_df',
      type: 'table',
      businessDomain: 'DWS层',
      database: 'dws_db',
      schema: 'logistics',
      description: 'DWS层物流天级汇总表，包含配送时效、物流成本等指标',
      owner: '数据分析师',
      createTime: '2024-01-03 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 90,
      status: 'active',
      tags: ['DWS', '物流汇总', '时效统计']
    },

    // ADS层数据 (10条)
    {
      id: '81',
      name: 'ads_user_profile_analysis',
      type: 'table',
      businessDomain: 'ADS层',
      database: 'ads_db',
      schema: 'user',
      description: 'ADS层用户画像分析表，基于多维度数据构建的用户标签体系',
      owner: '数据科学家',
      createTime: '2024-01-04 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 95,
      status: 'active',
      tags: ['ADS', '用户画像', '标签体系']
    },
    {
      id: '82',
      name: 'ads_business_overview_report',
      type: 'table',
      businessDomain: 'ADS层',
      database: 'ads_db',
      schema: 'business',
      description: 'ADS层业务总览报表，包含核心业务指标的多维度分析',
      owner: '数据科学家',
      createTime: '2024-01-04 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 97,
      status: 'active',
      tags: ['ADS', '业务分析', '核心指标']
    },
    {
      id: '83',
      name: 'ads_product_performance_analysis',
      type: 'table',
      businessDomain: 'ADS层',
      database: 'ads_db',
      schema: 'product',
      description: 'ADS层商品表现分析表，商品销售、库存、用户反馈的综合分析',
      owner: '数据科学家',
      createTime: '2024-01-04 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 93,
      status: 'active',
      tags: ['ADS', '商品分析', '销售表现']
    },
    {
      id: '84',
      name: 'ads_marketing_roi_analysis',
      type: 'table',
      businessDomain: 'ADS层',
      database: 'ads_db',
      schema: 'marketing',
      description: 'ADS层营销ROI分析表，各营销渠道和活动的投入产出分析',
      owner: '数据科学家',
      createTime: '2024-01-04 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 96,
      status: 'active',
      tags: ['ADS', '营销分析', 'ROI计算']
    },
    {
      id: '85',
      name: 'ads_finance_profit_analysis',
      type: 'table',
      businessDomain: 'ADS层',
      database: 'ads_db',
      schema: 'finance',
      description: 'ADS层财务利润分析表，收入成本结构和盈利能力分析',
      owner: '数据科学家',
      createTime: '2024-01-04 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 98,
      status: 'active',
      tags: ['ADS', '财务分析', '盈利分析']
    },
    {
      id: '86',
      name: 'ads_supply_chain_efficiency',
      type: 'table',
      businessDomain: 'ADS层',
      database: 'ads_db',
      schema: 'supply',
      description: 'ADS层供应链效率分析表，供应链各环节的效率和成本分析',
      owner: '数据科学家',
      createTime: '2024-01-04 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 91,
      status: 'active',
      tags: ['ADS', '供应链分析', '效率优化']
    },
    {
      id: '87',
      name: 'ads_customer_service_quality',
      type: 'table',
      businessDomain: 'ADS层',
      database: 'ads_db',
      schema: 'service',
      description: 'ADS层客服质量分析表，客服效率、满意度的综合评估',
      owner: '数据科学家',
      createTime: '2024-01-04 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 89,
      status: 'active',
      tags: ['ADS', '客服分析', '质量评估']
    },
    {
      id: '88',
      name: 'ads_logistics_performance',
      type: 'table',
      businessDomain: 'ADS层',
      database: 'ads_db',
      schema: 'logistics',
      description: 'ADS层物流表现分析表，配送时效、成本、客户满意度分析',
      owner: '数据科学家',
      createTime: '2024-01-04 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 92,
      status: 'active',
      tags: ['ADS', '物流分析', '配送优化']
    },
    {
      id: '89',
      name: 'ads_payment_risk_analysis',
      type: 'table',
      businessDomain: 'ADS层',
      database: 'ads_db',
      schema: 'risk',
      description: 'ADS层支付风险分析表，支付异常、欺诈检测的风险评估',
      owner: '数据科学家',
      createTime: '2024-01-04 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 94,
      status: 'active',
      tags: ['ADS', '风险分析', '欺诈检测']
    },
    {
      id: '90',
      name: 'ads_operational_dashboard',
      type: 'table',
      businessDomain: 'ADS层',
      database: 'ads_db',
      schema: 'operation',
      description: 'ADS层运营仪表盘数据表，实时业务监控和预警指标',
      owner: '数据科学家',
      createTime: '2024-01-04 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 97,
      status: 'active',
      tags: ['ADS', '运营分析', '实时监控']
    },

    // 视图数据 (10条)
    {
      id: '91',
      name: 'v_user_360_view',
      type: 'view',
      businessDomain: '用户中心',
      database: 'analytics_db',
      schema: 'user',
      description: '用户360度视图，整合用户基础信息、行为、偏好的综合视图',
      owner: '数据分析师',
      createTime: '2024-01-05 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 94,
      status: 'active',
      tags: ['视图', '用户360', '综合视图']
    },
    {
      id: '92',
      name: 'v_order_summary_view',
      type: 'view',
      businessDomain: '订单中心',
      database: 'analytics_db',
      schema: 'trade',
      description: '订单汇总视图，实时展示订单状态、金额、商品信息',
      owner: '数据分析师',
      createTime: '2024-01-05 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 96,
      status: 'active',
      tags: ['视图', '订单汇总', '实时数据']
    },
    {
      id: '93',
      name: 'v_product_catalog_view',
      type: 'view',
      businessDomain: '商品中心',
      database: 'analytics_db',
      schema: 'product',
      description: '商品目录视图，包含商品详情、库存、价格的统一视图',
      owner: '数据分析师',
      createTime: '2024-01-05 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 92,
      status: 'active',
      tags: ['视图', '商品目录', '库存管理']
    },
    {
      id: '94',
      name: 'v_marketing_performance_view',
      type: 'view',
      businessDomain: '营销中心',
      database: 'analytics_db',
      schema: 'marketing',
      description: '营销表现视图，实时展示各营销活动的效果和ROI',
      owner: '数据分析师',
      createTime: '2024-01-05 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 93,
      status: 'active',
      tags: ['视图', '营销表现', 'ROI监控']
    },
    {
      id: '95',
      name: 'v_finance_dashboard_view',
      type: 'view',
      businessDomain: '财务中心',
      database: 'analytics_db',
      schema: 'finance',
      description: '财务仪表盘视图，实时财务指标和预算执行情况',
      owner: '数据分析师',
      createTime: '2024-01-05 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 98,
      status: 'active',
      tags: ['视图', '财务仪表盘', '预算监控']
    },
    {
      id: '96',
      name: 'v_supply_chain_monitor_view',
      type: 'view',
      businessDomain: '供应链中心',
      database: 'analytics_db',
      schema: 'supply',
      description: '供应链监控视图，实时供应链状态和异常预警',
      owner: '数据分析师',
      createTime: '2024-01-05 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 90,
      status: 'active',
      tags: ['视图', '供应链监控', '异常预警']
    },
    {
      id: '97',
      name: 'v_customer_service_kpi_view',
      type: 'view',
      businessDomain: '客服中心',
      database: 'analytics_db',
      schema: 'service',
      description: '客服KPI视图，客服团队绩效和服务质量指标',
      owner: '数据分析师',
      createTime: '2024-01-05 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 91,
      status: 'active',
      tags: ['视图', '客服KPI', '绩效监控']
    },
    {
      id: '98',
      name: 'v_real_time_metrics_view',
      type: 'view',
      businessDomain: 'ADS层',
      database: 'analytics_db',
      schema: 'realtime',
      description: '实时指标视图，核心业务指标的实时监控和展示',
      owner: '数据分析师',
      createTime: '2024-01-05 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 95,
      status: 'active',
      tags: ['视图', '实时指标', '业务监控']
    },
    {
      id: '99',
      name: 'v_data_quality_report_view',
      type: 'view',
      businessDomain: 'DWS层',
      database: 'analytics_db',
      schema: 'quality',
      description: '数据质量报告视图，各数据表的质量评分和异常统计',
      owner: '数据分析师',
      createTime: '2024-01-05 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 97,
      status: 'active',
      tags: ['视图', '数据质量', '质量监控']
    },
    {
      id: '100',
      name: 'v_business_intelligence_view',
      type: 'view',
      businessDomain: 'ADS层',
      database: 'analytics_db',
      schema: 'bi',
      description: '商业智能视图，跨业务域的综合分析和洞察',
      owner: '数据分析师',
      createTime: '2024-01-05 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 96,
      status: 'active',
      tags: ['视图', '商业智能', '综合分析']
    },

    // 文件数据 (10条)
    {
      id: '101',
      name: 'user_behavior_logs.parquet',
      type: 'file',
      businessDomain: '用户中心',
      database: 'hdfs_storage',
      schema: 'logs',
      description: '用户行为日志文件，Parquet格式存储的用户行为原始数据',
      owner: '数据工程师',
      createTime: '2024-01-06 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 93,
      status: 'active',
      tags: ['文件', 'Parquet', '行为日志']
    },
    {
      id: '102',
      name: 'order_export_data.csv',
      type: 'file',
      businessDomain: '订单中心',
      database: 'file_storage',
      schema: 'export',
      description: '订单导出数据文件，CSV格式的订单明细导出文件',
      owner: '业务分析师',
      createTime: '2024-01-06 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 89,
      status: 'active',
      tags: ['文件', 'CSV', '订单导出']
    },
    {
      id: '103',
      name: 'product_images_metadata.json',
      type: 'file',
      businessDomain: '商品中心',
      database: 'object_storage',
      schema: 'media',
      description: '商品图片元数据文件，JSON格式的商品图片信息和路径',
      owner: '产品经理',
      createTime: '2024-01-06 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 91,
      status: 'active',
      tags: ['文件', 'JSON', '图片元数据']
    },
    {
      id: '104',
      name: 'marketing_campaign_config.xml',
      type: 'file',
      businessDomain: '营销中心',
      database: 'config_storage',
      schema: 'campaign',
      description: '营销活动配置文件，XML格式的营销活动规则和参数',
      owner: '营销专员',
      createTime: '2024-01-06 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 87,
      status: 'active',
      tags: ['文件', 'XML', '活动配置']
    },
    {
      id: '105',
      name: 'financial_reports.xlsx',
      type: 'file',
      businessDomain: '财务中心',
      database: 'report_storage',
      schema: 'finance',
      description: '财务报表文件，Excel格式的月度财务报告',
      owner: '财务分析师',
      createTime: '2024-01-06 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 95,
      status: 'active',
      tags: ['文件', 'Excel', '财务报表']
    },
    {
      id: '106',
      name: 'supplier_contracts.pdf',
      type: 'file',
      businessDomain: '供应链中心',
      database: 'document_storage',
      schema: 'contracts',
      description: '供应商合同文件，PDF格式的供应商合作协议',
      owner: '采购经理',
      createTime: '2024-01-06 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 92,
      status: 'active',
      tags: ['文件', 'PDF', '供应商合同']
    },
    {
      id: '107',
      name: 'customer_feedback_audio.wav',
      type: 'file',
      businessDomain: '客服中心',
      database: 'media_storage',
      schema: 'audio',
      description: '客户反馈音频文件，WAV格式的客户通话录音',
      owner: '客服主管',
      createTime: '2024-01-06 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 88,
      status: 'active',
      tags: ['文件', 'WAV', '通话录音']
    },
    {
      id: '108',
      name: 'ml_model_weights.h5',
      type: 'file',
      businessDomain: 'ADS层',
      database: 'model_storage',
      schema: 'ml',
      description: '机器学习模型权重文件，H5格式的深度学习模型参数',
      owner: '算法工程师',
      createTime: '2024-01-06 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 94,
      status: 'active',
      tags: ['文件', 'H5', '模型权重']
    },
    {
      id: '109',
      name: 'data_dictionary.md',
      type: 'file',
      businessDomain: 'DWD层',
      database: 'doc_storage',
      schema: 'documentation',
      description: '数据字典文档，Markdown格式的数据表结构说明',
      owner: '数据架构师',
      createTime: '2024-01-06 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 96,
      status: 'active',
      tags: ['文件', 'Markdown', '数据字典']
    },
    {
      id: '110',
      name: 'etl_job_logs.txt',
      type: 'file',
      businessDomain: 'ODS层',
      database: 'log_storage',
      schema: 'etl',
      description: 'ETL作业日志文件，文本格式的数据处理作业执行日志',
      owner: '数据工程师',
      createTime: '2024-01-06 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 90,
      status: 'active',
      tags: ['文件', 'TXT', 'ETL日志']
    },

    // API数据 (10条)
    {
      id: '111',
      name: 'user_profile_api',
      type: 'api',
      businessDomain: '用户中心',
      database: 'api_gateway',
      schema: 'user',
      description: '用户画像API接口，提供用户基础信息和标签查询服务',
      owner: '后端开发工程师',
      createTime: '2024-01-07 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 95,
      status: 'active',
      tags: ['API', '用户画像', 'RESTful']
    },
    {
      id: '112',
      name: 'order_status_api',
      type: 'api',
      businessDomain: '订单中心',
      database: 'api_gateway',
      schema: 'order',
      description: '订单状态API接口，实时查询订单状态和物流信息',
      owner: '后端开发工程师',
      createTime: '2024-01-07 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 97,
      status: 'active',
      tags: ['API', '订单状态', '实时查询']
    },
    {
      id: '113',
      name: 'product_search_api',
      type: 'api',
      businessDomain: '商品中心',
      database: 'api_gateway',
      schema: 'product',
      description: '商品搜索API接口，提供商品搜索和推荐服务',
      owner: '后端开发工程师',
      createTime: '2024-01-07 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 93,
      status: 'active',
      tags: ['API', '商品搜索', '推荐算法']
    },
    {
      id: '114',
      name: 'marketing_recommendation_api',
      type: 'api',
      businessDomain: '营销中心',
      database: 'api_gateway',
      schema: 'marketing',
      description: '营销推荐API接口，基于用户画像的个性化营销推荐',
      owner: '后端开发工程师',
      createTime: '2024-01-07 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 91,
      status: 'active',
      tags: ['API', '营销推荐', '个性化']
    },
    {
      id: '115',
      name: 'payment_gateway_api',
      type: 'api',
      businessDomain: '财务中心',
      database: 'api_gateway',
      schema: 'payment',
      description: '支付网关API接口，统一的支付处理和状态查询服务',
      owner: '后端开发工程师',
      createTime: '2024-01-07 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 98,
      status: 'active',
      tags: ['API', '支付网关', '统一支付']
    },
    {
      id: '116',
      name: 'inventory_management_api',
      type: 'api',
      businessDomain: '供应链中心',
      database: 'api_gateway',
      schema: 'inventory',
      description: '库存管理API接口，实时库存查询和预警服务',
      owner: '后端开发工程师',
      createTime: '2024-01-07 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 92,
      status: 'active',
      tags: ['API', '库存管理', '实时预警']
    },
    {
      id: '117',
      name: 'customer_service_bot_api',
      type: 'api',
      businessDomain: '客服中心',
      database: 'api_gateway',
      schema: 'service',
      description: '智能客服机器人API接口，自动问答和工单处理服务',
      owner: '后端开发工程师',
      createTime: '2024-01-07 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 89,
      status: 'active',
      tags: ['API', '智能客服', '自动问答']
    },
    {
      id: '118',
      name: 'data_analytics_api',
      type: 'api',
      businessDomain: 'ADS层',
      database: 'api_gateway',
      schema: 'analytics',
      description: '数据分析API接口，提供多维度数据查询和分析服务',
      owner: '后端开发工程师',
      createTime: '2024-01-07 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 94,
      status: 'active',
      tags: ['API', '数据分析', '多维查询']
    },
    {
      id: '119',
      name: 'real_time_metrics_api',
      type: 'api',
      businessDomain: 'DWS层',
      database: 'api_gateway',
      schema: 'metrics',
      description: '实时指标API接口，核心业务指标的实时监控服务',
      owner: '后端开发工程师',
      createTime: '2024-01-07 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 96,
      status: 'active',
      tags: ['API', '实时指标', '业务监控']
    },
    {
      id: '120',
      name: 'data_quality_check_api',
      type: 'api',
      businessDomain: 'ODS层',
      database: 'api_gateway',
      schema: 'quality',
      description: '数据质量检查API接口，数据质量评估和异常检测服务',
      owner: '后端开发工程师',
      createTime: '2024-01-07 08:00:00',
      updateTime: '2024-01-22 08:00:00',
      healthScore: 93,
      status: 'active',
      tags: ['API', '数据质量', '异常检测']
    },

    // 业务域三级菜单数据补充 - 用户中心子分类 (10条)
    {
      id: '121',
      name: 'user_basic_info_detail',
      type: 'table',
      businessDomain: '用户基础信息',
      database: 'user_db',
      schema: 'basic',
      description: '用户基础信息详细表，包含用户详细的个人资料信息',
      owner: '用户中心团队',
      createTime: '2024-01-08 09:00:00',
      updateTime: '2024-01-22 09:00:00',
      healthScore: 96,
      status: 'active',
      tags: ['用户基础信息', '详细资料', '核心表']
    },
    {
      id: '122',
      name: 'user_behavior_tracking',
      type: 'table',
      businessDomain: '用户行为数据',
      database: 'user_db',
      schema: 'behavior',
      description: '用户行为跟踪表，记录用户在平台的详细行为轨迹',
      owner: '用户中心团队',
      createTime: '2024-01-08 09:00:00',
      updateTime: '2024-01-22 09:00:00',
      healthScore: 94,
      status: 'active',
      tags: ['用户行为数据', '行为轨迹', '分析']
    },
    {
      id: '123',
      name: 'user_profile_tags',
      type: 'table',
      businessDomain: '用户画像',
      database: 'user_db',
      schema: 'profile',
      description: '用户画像标签表，存储用户的各种标签和特征',
      owner: '用户中心团队',
      createTime: '2024-01-08 09:00:00',
      updateTime: '2024-01-22 09:00:00',
      healthScore: 92,
      status: 'active',
      tags: ['用户画像', '标签系统', '特征']
    },
    {
      id: '124',
      name: 'user_permission_roles',
      type: 'table',
      businessDomain: '用户权限管理',
      database: 'user_db',
      schema: 'permission',
      description: '用户权限角色表，管理用户的角色和权限分配',
      owner: '用户中心团队',
      createTime: '2024-01-08 09:00:00',
      updateTime: '2024-01-22 09:00:00',
      healthScore: 98,
      status: 'active',
      tags: ['用户权限管理', '角色分配', '安全']
    },
    {
      id: '125',
      name: 'user_level_system',
      type: 'table',
      businessDomain: '用户等级体系',
      database: 'user_db',
      schema: 'level',
      description: '用户等级体系表，记录用户的等级和成长值',
      owner: '用户中心团队',
      createTime: '2024-01-08 09:00:00',
      updateTime: '2024-01-22 09:00:00',
      healthScore: 90,
      status: 'active',
      tags: ['用户等级体系', '成长值', '激励']
    },
    {
      id: '126',
      name: 'user_tags_management',
      type: 'table',
      businessDomain: '用户标签管理',
      database: 'user_db',
      schema: 'tags',
      description: '用户标签管理表，维护用户的各种业务标签',
      owner: '用户中心团队',
      createTime: '2024-01-08 09:00:00',
      updateTime: '2024-01-22 09:00:00',
      healthScore: 93,
      status: 'active',
      tags: ['用户标签管理', '业务标签', '分类']
    },
    {
      id: '127',
      name: 'user_feedback_data',
      type: 'table',
      businessDomain: '用户反馈数据',
      database: 'user_db',
      schema: 'feedback',
      description: '用户反馈数据表，收集用户的意见和建议',
      owner: '用户中心团队',
      createTime: '2024-01-08 09:00:00',
      updateTime: '2024-01-22 09:00:00',
      healthScore: 88,
      status: 'active',
      tags: ['用户反馈数据', '意见收集', '改进']
    },
    {
      id: '128',
      name: 'user_social_relations',
      type: 'table',
      businessDomain: '用户社交关系',
      database: 'user_db',
      schema: 'social',
      description: '用户社交关系表，记录用户之间的关注和好友关系',
      owner: '用户中心团队',
      createTime: '2024-01-08 09:00:00',
      updateTime: '2024-01-22 09:00:00',
      healthScore: 85,
      status: 'active',
      tags: ['用户社交关系', '好友关系', '社交网络']
    },
    {
      id: '129',
      name: 'user_device_info',
      type: 'table',
      businessDomain: '用户设备信息',
      database: 'user_db',
      schema: 'device',
      description: '用户设备信息表，记录用户使用的设备和终端信息',
      owner: '用户中心团队',
      createTime: '2024-01-08 09:00:00',
      updateTime: '2024-01-22 09:00:00',
      healthScore: 91,
      status: 'active',
      tags: ['用户设备信息', '终端设备', '统计']
    },
    {
      id: '130',
      name: 'user_security_logs',
      type: 'table',
      businessDomain: '用户安全日志',
      database: 'user_db',
      schema: 'security',
      description: '用户安全日志表，记录用户的安全相关操作和事件',
      owner: '用户中心团队',
      createTime: '2024-01-08 09:00:00',
      updateTime: '2024-01-22 09:00:00',
      healthScore: 97,
      status: 'active',
      tags: ['用户安全日志', '安全事件', '审计']
    },

    // 业务域三级菜单数据补充 - 订单中心子分类 (10条)
    {
      id: '131',
      name: 'order_basic_info',
      type: 'table',
      businessDomain: '订单基础信息',
      database: 'order_db',
      schema: 'basic',
      description: '订单基础信息表，包含订单的基本属性和状态',
      owner: '订单中心团队',
      createTime: '2024-01-08 10:00:00',
      updateTime: '2024-01-22 10:00:00',
      healthScore: 95,
      status: 'active',
      tags: ['订单基础信息', '订单状态', '核心表']
    },
    {
      id: '132',
      name: 'order_payment_info',
      type: 'table',
      businessDomain: '订单支付信息',
      database: 'order_db',
      schema: 'payment',
      description: '订单支付信息表，记录订单的支付方式和支付状态',
      owner: '订单中心团队',
      createTime: '2024-01-08 10:00:00',
      updateTime: '2024-01-22 10:00:00',
      healthScore: 97,
      status: 'active',
      tags: ['订单支付信息', '支付方式', '支付状态']
    },
    {
      id: '133',
      name: 'order_logistics_info',
      type: 'table',
      businessDomain: '订单物流信息',
      database: 'order_db',
      schema: 'logistics',
      description: '订单物流信息表，跟踪订单的配送和物流状态',
      owner: '订单中心团队',
      createTime: '2024-01-08 10:00:00',
      updateTime: '2024-01-22 10:00:00',
      healthScore: 93,
      status: 'active',
      tags: ['订单物流信息', '配送状态', '物流跟踪']
    },
    {
      id: '134',
      name: 'order_refund_info',
      type: 'table',
      businessDomain: '订单退款信息',
      database: 'order_db',
      schema: 'refund',
      description: '订单退款信息表，管理订单的退款申请和处理流程',
      owner: '订单中心团队',
      createTime: '2024-01-08 10:00:00',
      updateTime: '2024-01-22 10:00:00',
      healthScore: 91,
      status: 'active',
      tags: ['订单退款信息', '退款申请', '退款处理']
    },
    {
      id: '135',
      name: 'order_evaluation_info',
      type: 'table',
      businessDomain: '订单评价信息',
      database: 'order_db',
      schema: 'evaluation',
      description: '订单评价信息表，收集用户对订单商品和服务的评价',
      owner: '订单中心团队',
      createTime: '2024-01-08 10:00:00',
      updateTime: '2024-01-22 10:00:00',
      healthScore: 89,
      status: 'active',
      tags: ['订单评价信息', '用户评价', '服务质量']
    },
    {
      id: '136',
      name: 'order_promotion_info',
      type: 'table',
      businessDomain: '订单促销信息',
      database: 'order_db',
      schema: 'promotion',
      description: '订单促销信息表，记录订单使用的优惠券和促销活动',
      owner: '订单中心团队',
      createTime: '2024-01-08 10:00:00',
      updateTime: '2024-01-22 10:00:00',
      healthScore: 92,
      status: 'active',
      tags: ['订单促销信息', '优惠券', '促销活动']
    },
    {
      id: '137',
      name: 'order_risk_control',
      type: 'table',
      businessDomain: '订单风控信息',
      database: 'order_db',
      schema: 'risk',
      description: '订单风控信息表，记录订单的风险评估和控制措施',
      owner: '订单中心团队',
      createTime: '2024-01-08 10:00:00',
      updateTime: '2024-01-22 10:00:00',
      healthScore: 96,
      status: 'active',
      tags: ['订单风控信息', '风险评估', '安全控制']
    },
    {
      id: '138',
      name: 'order_after_sales',
      type: 'table',
      businessDomain: '订单售后信息',
      database: 'order_db',
      schema: 'aftersales',
      description: '订单售后信息表，管理订单的售后服务和处理记录',
      owner: '订单中心团队',
      createTime: '2024-01-08 10:00:00',
      updateTime: '2024-01-22 10:00:00',
      healthScore: 88,
      status: 'active',
      tags: ['订单售后信息', '售后服务', '处理记录']
    },
    {
      id: '139',
      name: 'order_invoice_info',
      type: 'table',
      businessDomain: '订单发票信息',
      database: 'order_db',
      schema: 'invoice',
      description: '订单发票信息表，管理订单的发票申请和开具记录',
      owner: '订单中心团队',
      createTime: '2024-01-08 10:00:00',
      updateTime: '2024-01-22 10:00:00',
      healthScore: 94,
      status: 'active',
      tags: ['订单发票信息', '发票申请', '开具记录']
    },
    {
      id: '140',
      name: 'order_tracking_logs',
      type: 'table',
      businessDomain: '订单跟踪日志',
      database: 'order_db',
      schema: 'tracking',
      description: '订单跟踪日志表，记录订单状态变更的详细日志',
      owner: '订单中心团队',
      createTime: '2024-01-08 10:00:00',
      updateTime: '2024-01-22 10:00:00',
      healthScore: 90,
      status: 'active',
      tags: ['订单跟踪日志', '状态变更', '操作日志']
    },

    // 业务域三级菜单数据补充 - 商品中心子分类 (10条)
    {
      id: '141',
      name: 'product_basic_info',
      type: 'table',
      businessDomain: '商品基础信息',
      database: 'product_db',
      schema: 'basic',
      description: '商品基础信息表，包含商品的基本属性和规格',
      owner: '商品中心团队',
      createTime: '2024-01-08 11:00:00',
      updateTime: '2024-01-22 11:00:00',
      healthScore: 96,
      status: 'active',
      tags: ['商品基础信息', '商品属性', '规格参数']
    },
    {
      id: '142',
      name: 'product_category_info',
      type: 'table',
      businessDomain: '商品分类信息',
      database: 'product_db',
      schema: 'category',
      description: '商品分类信息表，管理商品的分类层级和归属关系',
      owner: '商品中心团队',
      createTime: '2024-01-08 11:00:00',
      updateTime: '2024-01-22 11:00:00',
      healthScore: 94,
      status: 'active',
      tags: ['商品分类信息', '分类层级', '归属关系']
    },
    {
      id: '143',
      name: 'product_price_info',
      type: 'table',
      businessDomain: '商品价格信息',
      database: 'product_db',
      schema: 'price',
      description: '商品价格信息表，记录商品的价格策略和变更历史',
      owner: '商品中心团队',
      createTime: '2024-01-08 11:00:00',
      updateTime: '2024-01-22 11:00:00',
      healthScore: 98,
      status: 'active',
      tags: ['商品价格信息', '价格策略', '价格历史']
    },
    {
      id: '144',
      name: 'product_inventory_info',
      type: 'table',
      businessDomain: '商品库存信息',
      database: 'product_db',
      schema: 'inventory',
      description: '商品库存信息表，实时跟踪商品的库存数量和状态',
      owner: '商品中心团队',
      createTime: '2024-01-08 11:00:00',
      updateTime: '2024-01-22 11:00:00',
      healthScore: 97,
      status: 'active',
      tags: ['商品库存信息', '库存数量', '库存状态']
    },
    {
      id: '145',
      name: 'product_brand_info',
      type: 'table',
      businessDomain: '商品品牌信息',
      database: 'product_db',
      schema: 'brand',
      description: '商品品牌信息表，管理商品的品牌归属和品牌特征',
      owner: '商品中心团队',
      createTime: '2024-01-08 11:00:00',
      updateTime: '2024-01-22 11:00:00',
      healthScore: 92,
      status: 'active',
      tags: ['商品品牌信息', '品牌归属', '品牌特征']
    },
    {
      id: '146',
      name: 'product_supplier_info',
      type: 'table',
      businessDomain: '商品供应商信息',
      database: 'product_db',
      schema: 'supplier',
      description: '商品供应商信息表，记录商品的供应商和采购关系',
      owner: '商品中心团队',
      createTime: '2024-01-08 11:00:00',
      updateTime: '2024-01-22 11:00:00',
      healthScore: 90,
      status: 'active',
      tags: ['商品供应商信息', '供应商管理', '采购关系']
    },
    {
      id: '147',
      name: 'product_sales_data',
      type: 'table',
      businessDomain: '商品销售数据',
      database: 'product_db',
      schema: 'sales',
      description: '商品销售数据表，统计商品的销售表现和趋势',
      owner: '商品中心团队',
      createTime: '2024-01-08 11:00:00',
      updateTime: '2024-01-22 11:00:00',
      healthScore: 95,
      status: 'active',
      tags: ['商品销售数据', '销售表现', '销售趋势']
    },
    {
      id: '148',
      name: 'product_review_data',
      type: 'table',
      businessDomain: '商品评价数据',
      database: 'product_db',
      schema: 'review',
      description: '商品评价数据表，收集用户对商品的评价和反馈',
      owner: '商品中心团队',
      createTime: '2024-01-08 11:00:00',
      updateTime: '2024-01-22 11:00:00',
      healthScore: 88,
      status: 'active',
      tags: ['商品评价数据', '用户评价', '商品反馈']
    },
    {
      id: '149',
      name: 'product_promotion_data',
      type: 'table',
      businessDomain: '商品促销数据',
      database: 'product_db',
      schema: 'promotion',
      description: '商品促销数据表，管理商品的促销活动和优惠信息',
      owner: '商品中心团队',
      createTime: '2024-01-08 11:00:00',
      updateTime: '2024-01-22 11:00:00',
      healthScore: 93,
      status: 'active',
      tags: ['商品促销数据', '促销活动', '优惠信息']
    },
    {
      id: '150',
      name: 'product_lifecycle_data',
      type: 'table',
      businessDomain: '商品生命周期',
      database: 'product_db',
      schema: 'lifecycle',
      description: '商品生命周期表，跟踪商品从上架到下架的全生命周期',
      owner: '商品中心团队',
      createTime: '2024-01-08 11:00:00',
      updateTime: '2024-01-22 11:00:00',
      healthScore: 91,
      status: 'active',
      tags: ['商品生命周期', '上架下架', '生命周期管理']
    },

    // 业务域三级菜单数据补充 - 营销中心子分类 (10条)
    {
      id: '151',
      name: 'marketing_campaign_info',
      type: 'table',
      businessDomain: '营销活动信息',
      database: 'marketing_db',
      schema: 'campaign',
      description: '营销活动信息表，管理各类营销活动的策划和执行',
      owner: '营销中心团队',
      createTime: '2024-01-08 12:00:00',
      updateTime: '2024-01-22 12:00:00',
      healthScore: 95,
      status: 'active',
      tags: ['营销活动信息', '活动策划', '活动执行']
    },
    {
      id: '152',
      name: 'marketing_channel_data',
      type: 'table',
      businessDomain: '营销渠道数据',
      database: 'marketing_db',
      schema: 'channel',
      description: '营销渠道数据表，分析各营销渠道的效果和转化',
      owner: '营销中心团队',
      createTime: '2024-01-08 12:00:00',
      updateTime: '2024-01-22 12:00:00',
      healthScore: 93,
      status: 'active',
      tags: ['营销渠道数据', '渠道效果', '转化分析']
    },
    {
      id: '153',
      name: 'marketing_customer_segment',
      type: 'table',
      businessDomain: '营销客户分群',
      database: 'marketing_db',
      schema: 'segment',
      description: '营销客户分群表，基于用户行为和属性进行客户分群',
      owner: '营销中心团队',
      createTime: '2024-01-08 12:00:00',
      updateTime: '2024-01-22 12:00:00',
      healthScore: 91,
      status: 'active',
      tags: ['营销客户分群', '客户分析', '精准营销']
    },
    {
      id: '154',
      name: 'marketing_content_data',
      type: 'table',
      businessDomain: '营销内容数据',
      database: 'marketing_db',
      schema: 'content',
      description: '营销内容数据表，管理营销素材和内容的效果数据',
      owner: '营销中心团队',
      createTime: '2024-01-08 12:00:00',
      updateTime: '2024-01-22 12:00:00',
      healthScore: 89,
      status: 'active',
      tags: ['营销内容数据', '营销素材', '内容效果']
    },
    {
      id: '155',
      name: 'marketing_automation_data',
      type: 'table',
      businessDomain: '营销自动化数据',
      database: 'marketing_db',
      schema: 'automation',
      description: '营销自动化数据表，记录自动化营销流程的执行情况',
      owner: '营销中心团队',
      createTime: '2024-01-08 12:00:00',
      updateTime: '2024-01-22 12:00:00',
      healthScore: 94,
      status: 'active',
      tags: ['营销自动化数据', '自动化流程', '执行监控']
    },
    {
      id: '156',
      name: 'marketing_roi_analysis',
      type: 'table',
      businessDomain: '营销ROI',
      database: 'marketing_db',
      schema: 'roi',
      description: '营销ROI分析表，计算和分析营销活动的投资回报率',
      owner: '营销中心团队',
      createTime: '2024-01-08 12:00:00',
      updateTime: '2024-01-22 12:00:00',
      healthScore: 96,
      status: 'active',
      tags: ['营销ROI分析', '投资回报', 'ROI计算', 'marketing-roi', 'ads-marketing', 'table']
    },
    {
      id: '157',
      name: 'marketing_attribution_data',
      type: 'table',
      businessDomain: '营销归因',
      database: 'marketing_db',
      schema: 'attribution',
      description: '营销归因数据表，分析用户转化路径和触点贡献',
      owner: '营销中心团队',
      createTime: '2024-01-08 12:00:00',
      updateTime: '2024-01-22 12:00:00',
      healthScore: 92,
      status: 'active',
      tags: ['营销归因数据', '转化路径', '触点分析', 'marketing-attribution', 'dws-marketing', 'table']
    },
    {
      id: '158',
      name: 'marketing_ab_test_data',
      type: 'table',
      businessDomain: '内容营销',
      database: 'marketing_db',
      schema: 'abtest',
      description: '营销AB测试数据表，记录AB测试的实验设计和结果',
      owner: '营销中心团队',
      createTime: '2024-01-08 12:00:00',
      updateTime: '2024-01-22 12:00:00',
      healthScore: 90,
      status: 'active',
      tags: ['营销AB测试数据', 'AB测试', '实验分析', 'content-marketing', 'dws-marketing', 'table']
    },
    {
      id: '159',
      name: 'marketing_lead_data',
      type: 'table',
      businessDomain: '客户分群',
      database: 'marketing_db',
      schema: 'lead',
      description: '营销线索数据表，管理和跟踪潜在客户线索',
      owner: '营销中心团队',
      createTime: '2024-01-08 12:00:00',
      updateTime: '2024-01-22 12:00:00',
      healthScore: 88,
      status: 'active',
      tags: ['营销线索数据', '潜在客户', '线索管理', 'customer-segmentation', 'dwd-marketing', 'table']
    },
    {
      id: '160',
      name: 'marketing_budget_data',
      type: 'table',
      businessDomain: '营销活动',
      database: 'marketing_db',
      schema: 'budget',
      description: '营销预算数据表，管理营销活动的预算分配和使用情况',
      owner: '营销中心团队',
      createTime: '2024-01-08 12:00:00',
      updateTime: '2024-01-22 12:00:00',
      healthScore: 97,
      status: 'active',
      tags: ['营销预算数据', '预算分配', '预算控制', 'marketing-campaign', 'dws-marketing', 'table']
    },

    // 业务域三级菜单数据补充 - 财务中心子分类 (10条)
    {
      id: '161',
      name: 'finance_account_info',
      type: 'table',
      businessDomain: '财务账户信息',
      database: 'finance_db',
      schema: 'account',
      description: '财务账户信息表，管理企业的各类财务账户',
      owner: '财务中心团队',
      createTime: '2024-01-08 13:00:00',
      updateTime: '2024-01-22 13:00:00',
      healthScore: 98,
      status: 'active',
      tags: ['财务账户信息', '账户管理', '资金管理']
    },
    {
      id: '162',
      name: 'finance_transaction_data',
      type: 'table',
      businessDomain: '财务交易数据',
      database: 'finance_db',
      schema: 'transaction',
      description: '财务交易数据表，记录所有的财务交易明细',
      owner: '财务中心团队',
      createTime: '2024-01-08 13:00:00',
      updateTime: '2024-01-22 13:00:00',
      healthScore: 96,
      status: 'active',
      tags: ['财务交易数据', '交易明细', '资金流水']
    },
    {
      id: '163',
      name: 'finance_budget_planning',
      type: 'table',
      businessDomain: '财务预算规划',
      database: 'finance_db',
      schema: 'budget',
      description: '财务预算规划表，制定和管理企业的预算计划',
      owner: '财务中心团队',
      createTime: '2024-01-08 13:00:00',
      updateTime: '2024-01-22 13:00:00',
      healthScore: 94,
      status: 'active',
      tags: ['财务预算规划', '预算计划', '财务规划']
    },
    {
      id: '164',
      name: 'finance_cost_analysis',
      type: 'table',
      businessDomain: '财务成本分析',
      database: 'finance_db',
      schema: 'cost',
      description: '财务成本分析表，分析企业的各项成本构成',
      owner: '财务中心团队',
      createTime: '2024-01-08 13:00:00',
      updateTime: '2024-01-22 13:00:00',
      healthScore: 92,
      status: 'active',
      tags: ['财务成本分析', '成本构成', '成本控制']
    },
    {
      id: '165',
      name: 'finance_revenue_tracking',
      type: 'table',
      businessDomain: '财务收入跟踪',
      database: 'finance_db',
      schema: 'revenue',
      description: '财务收入跟踪表，监控企业的收入来源和增长',
      owner: '财务中心团队',
      createTime: '2024-01-08 13:00:00',
      updateTime: '2024-01-22 13:00:00',
      healthScore: 95,
      status: 'active',
      tags: ['财务收入跟踪', '收入来源', '收入增长']
    },
    {
      id: '166',
      name: 'finance_tax_management',
      type: 'table',
      businessDomain: '财务税务管理',
      database: 'finance_db',
      schema: 'tax',
      description: '财务税务管理表，处理企业的税务申报和缴纳',
      owner: '财务中心团队',
      createTime: '2024-01-08 13:00:00',
      updateTime: '2024-01-22 13:00:00',
      healthScore: 97,
      status: 'active',
      tags: ['财务税务管理', '税务申报', '税务缴纳']
    },
    {
      id: '167',
      name: 'finance_audit_trail',
      type: 'table',
      businessDomain: '财务审计跟踪',
      database: 'finance_db',
      schema: 'audit',
      description: '财务审计跟踪表，记录财务操作的审计轨迹',
      owner: '财务中心团队',
      createTime: '2024-01-08 13:00:00',
      updateTime: '2024-01-22 13:00:00',
      healthScore: 99,
      status: 'active',
      tags: ['财务审计跟踪', '审计轨迹', '合规管理']
    },
    {
      id: '168',
      name: 'finance_risk_assessment',
      type: 'table',
      businessDomain: '财务风险评估',
      database: 'finance_db',
      schema: 'risk',
      description: '财务风险评估表，评估和监控财务风险',
      owner: '财务中心团队',
      createTime: '2024-01-08 13:00:00',
      updateTime: '2024-01-22 13:00:00',
      healthScore: 93,
      status: 'active',
      tags: ['财务风险评估', '风险监控', '风险管理']
    },
    {
      id: '169',
      name: 'finance_reporting_data',
      type: 'table',
      businessDomain: '财务报表数据',
      database: 'finance_db',
      schema: 'reporting',
      description: '财务报表数据表，生成各类财务报表和分析',
      owner: '财务中心团队',
      createTime: '2024-01-08 13:00:00',
      updateTime: '2024-01-22 13:00:00',
      healthScore: 96,
      status: 'active',
      tags: ['财务报表数据', '财务报表', '财务分析']
    },
    {
      id: '170',
      name: 'finance_cash_flow',
      type: 'table',
      businessDomain: '财务现金流',
      database: 'finance_db',
      schema: 'cashflow',
      description: '财务现金流表，管理和预测企业的现金流',
      owner: '财务中心团队',
      createTime: '2024-01-08 13:00:00',
      updateTime: '2024-01-22 13:00:00',
      healthScore: 94,
      status: 'active',
      tags: ['财务现金流', '现金管理', '流动性管理']
    },

    // 业务域三级菜单数据补充 - 供应链中心子分类 (10条)
    {
      id: '171',
      name: 'supply_vendor_info',
      type: 'table',
      businessDomain: '供应商管理',
      database: 'supply_db',
      schema: 'vendor',
      description: '供应商信息管理表，维护供应商的基本信息和资质',
      owner: '供应链中心团队',
      createTime: '2024-01-08 14:00:00',
      updateTime: '2024-01-22 14:00:00',
      healthScore: 95,
      status: 'active',
      tags: ['供应商信息管理', '供应商资质', '供应商评估', 'supplier-management', 'ods-supply', 'table']
    },
    {
      id: '172',
      name: 'supply_procurement_data',
      type: 'table',
      businessDomain: '采购管理',
      database: 'supply_db',
      schema: 'procurement',
      description: '采购管理数据表，记录采购订单和采购流程',
      owner: '供应链中心团队',
      createTime: '2024-01-08 14:00:00',
      updateTime: '2024-01-22 14:00:00',
      healthScore: 93,
      status: 'active',
      tags: ['采购管理数据', '采购订单', '采购流程', 'procurement-management', 'dwd-supply', 'table']
    },
    {
      id: '173',
      name: 'supply_inventory_tracking',
      type: 'table',
      businessDomain: '库存管理',
      database: 'supply_db',
      schema: 'inventory',
      description: '库存跟踪数据表，实时监控库存变化和库存水平',
      owner: '供应链中心团队',
      createTime: '2024-01-08 14:00:00',
      updateTime: '2024-01-22 14:00:00',
      healthScore: 97,
      status: 'active',
      tags: ['库存跟踪数据', '库存监控', '库存管理', 'inventory-management', 'dwd-supply', 'table']
    },
    {
      id: '174',
      name: 'supply_logistics_data',
      type: 'table',
      businessDomain: '物流配送',
      database: 'supply_db',
      schema: 'logistics',
      description: '物流配送数据表，管理货物的运输和配送信息',
      owner: '供应链中心团队',
      createTime: '2024-01-08 14:00:00',
      updateTime: '2024-01-22 14:00:00',
      healthScore: 91,
      status: 'active',
      tags: ['物流配送数据', '运输管理', '配送跟踪', 'logistics-delivery', 'dwd-supply', 'table']
    },
    {
      id: '175',
      name: 'supply_warehouse_data',
      type: 'table',
      businessDomain: '仓储管理',
      database: 'supply_db',
      schema: 'warehouse',
      description: '仓储管理数据表，管理仓库的存储和操作信息',
      owner: '供应链中心团队',
      createTime: '2024-01-08 14:00:00',
      updateTime: '2024-01-22 14:00:00',
      healthScore: 94,
      status: 'active',
      tags: ['仓储管理数据', '仓库管理', '存储优化', 'warehouse-management', 'dws-supply', 'table']
    },
    {
      id: '176',
      name: 'supply_quality_control',
      type: 'table',
      businessDomain: '质量检测',
      database: 'supply_db',
      schema: 'quality',
      description: '质量控制数据表，记录产品质量检测和控制信息',
      owner: '供应链中心团队',
      createTime: '2024-01-08 14:00:00',
      updateTime: '2024-01-22 14:00:00',
      healthScore: 96,
      status: 'active',
      tags: ['质量控制数据', '质量检测', '质量管理', 'quality-control', 'dws-supply', 'table']
    },
    {
      id: '177',
      name: 'supply_cost_analysis',
      type: 'table',
      businessDomain: '供应链金融',
      database: 'supply_db',
      schema: 'cost',
      description: '供应链成本分析表，分析供应链各环节的成本',
      owner: '供应链中心团队',
      createTime: '2024-01-08 14:00:00',
      updateTime: '2024-01-22 14:00:00',
      healthScore: 92,
      status: 'active',
      tags: ['供应链成本分析', '成本优化', '成本控制', 'supply-finance', 'ads-supply', 'table']
    },
    {
      id: '178',
      name: 'supply_demand_forecast',
      type: 'table',
      businessDomain: '需求预测',
      database: 'supply_db',
      schema: 'forecast',
      description: '需求预测数据表，预测市场需求和库存需求',
      owner: '供应链中心团队',
      createTime: '2024-01-08 14:00:00',
      updateTime: '2024-01-22 14:00:00',
      healthScore: 89,
      status: 'active',
      tags: ['需求预测数据', '市场预测', '库存预测', 'demand-forecast', 'ads-supply', 'table']
    },
    {
      id: '179',
      name: 'supply_risk_management',
      type: 'table',
      businessDomain: '供应链风险',
      database: 'supply_db',
      schema: 'risk',
      description: '供应链风险管理表，识别和管理供应链风险',
      owner: '供应链中心团队',
      createTime: '2024-01-08 14:00:00',
      updateTime: '2024-01-22 14:00:00',
      healthScore: 90,
      status: 'active',
      tags: ['供应链风险管理', '风险识别', '风险控制', 'supply-risk', 'ads-supply', 'table']
    },
    {
      id: '180',
      name: 'supply_performance_kpi',
      type: 'table',
      businessDomain: '供应链协同',
      database: 'supply_db',
      schema: 'kpi',
      description: '供应链绩效指标表，监控供应链的关键绩效指标',
      owner: '供应链中心团队',
      createTime: '2024-01-08 14:00:00',
      updateTime: '2024-01-22 14:00:00',
      healthScore: 95,
      status: 'active',
      tags: ['供应链绩效指标', 'KPI监控', '绩效管理', 'supply-collaboration', 'ads-supply', 'table']
    },

    // 业务域三级菜单数据补充 - 客服中心子分类 (10条)
    {
      id: '181',
      name: 'service_ticket_data',
      type: 'table',
      businessDomain: '工单管理',
      database: 'service_db',
      schema: 'ticket',
      description: '工单管理数据表，记录客户服务工单的处理流程',
      owner: '客服中心团队',
      createTime: '2024-01-08 15:00:00',
      updateTime: '2024-01-22 15:00:00',
      healthScore: 94,
      status: 'active',
      tags: ['工单管理数据', '客户服务', '工单处理', 'ticket-management', 'ods-service', 'table']
    },
    {
      id: '182',
      name: 'service_customer_feedback',
      type: 'table',
      businessDomain: '客户咨询',
      database: 'service_db',
      schema: 'feedback',
      description: '客户反馈数据表，收集和分析客户的意见和建议',
      owner: '客服中心团队',
      createTime: '2024-01-08 15:00:00',
      updateTime: '2024-01-22 15:00:00',
      healthScore: 92,
      status: 'active',
      tags: ['客户反馈数据', '意见收集', '客户满意度', 'customer-inquiry', 'dwd-service', 'table']
    },
    {
      id: '183',
      name: 'service_knowledge_base',
      type: 'table',
      businessDomain: '知识库',
      database: 'service_db',
      schema: 'knowledge',
      description: '知识库管理表，维护客服知识库和常见问题解答',
      owner: '客服中心团队',
      createTime: '2024-01-08 15:00:00',
      updateTime: '2024-01-22 15:00:00',
      healthScore: 96,
      status: 'active',
      tags: ['知识库管理', 'FAQ', '问题解答', 'knowledge-base', 'dws-service', 'table']
    },
    {
      id: '184',
      name: 'service_quality_monitor',
      type: 'table',
      businessDomain: '服务质量',
      database: 'service_db',
      schema: 'quality',
      description: '服务质量监控表，监控客服服务的质量指标',
      owner: '客服中心团队',
      createTime: '2024-01-08 15:00:00',
      updateTime: '2024-01-22 15:00:00',
      healthScore: 93,
      status: 'active',
      tags: ['服务质量监控', '质量评估', '服务标准', 'service-quality', 'dws-service', 'table']
    },
    {
      id: '185',
      name: 'service_agent_performance',
      type: 'table',
      businessDomain: '客服绩效',
      database: 'service_db',
      schema: 'performance',
      description: '客服绩效数据表，记录客服人员的工作绩效',
      owner: '客服中心团队',
      createTime: '2024-01-08 15:00:00',
      updateTime: '2024-01-22 15:00:00',
      healthScore: 91,
      status: 'active',
      tags: ['客服绩效数据', '绩效考核', '工作效率', 'service-performance', 'ads-service', 'table']
    },
    {
      id: '186',
      name: 'service_communication_log',
      type: 'table',
      businessDomain: '客户关怀',
      database: 'service_db',
      schema: 'communication',
      description: '沟通记录数据表，记录客户与客服的沟通历史',
      owner: '客服中心团队',
      createTime: '2024-01-08 15:00:00',
      updateTime: '2024-01-22 15:00:00',
      healthScore: 95,
      status: 'active',
      tags: ['沟通记录数据', '客户沟通', '服务历史', 'customer-care', 'dwd-service', 'table']
    },
    {
      id: '187',
      name: 'service_escalation_data',
      type: 'table',
      businessDomain: '投诉处理',
      database: 'service_db',
      schema: 'escalation',
      description: '问题升级数据表，管理需要升级处理的客户问题',
      owner: '客服中心团队',
      createTime: '2024-01-08 15:00:00',
      updateTime: '2024-01-22 15:00:00',
      healthScore: 89,
      status: 'active',
      tags: ['问题升级数据', '升级处理', '复杂问题', 'complaint-handling', 'dwd-service', 'table']
    },
    {
      id: '188',
      name: 'service_satisfaction_survey',
      type: 'table',
      businessDomain: '满意度调查',
      database: 'service_db',
      schema: 'survey',
      description: '满意度调研表，收集客户对服务的满意度评价',
      owner: '客服中心团队',
      createTime: '2024-01-08 15:00:00',
      updateTime: '2024-01-22 15:00:00',
      healthScore: 94,
      status: 'active',
      tags: ['满意度调研', '客户评价', '服务改进', 'satisfaction-survey', 'ads-service', 'table']
    },
    {
      id: '189',
      name: 'service_training_data',
      type: 'table',
      businessDomain: '客服培训',
      database: 'service_db',
      schema: 'training',
      description: '培训管理数据表，管理客服人员的培训记录',
      owner: '客服中心团队',
      createTime: '2024-01-08 15:00:00',
      updateTime: '2024-01-22 15:00:00',
      healthScore: 92,
      status: 'active',
      tags: ['培训管理数据', '员工培训', '技能提升', 'service-training', 'dws-service', 'table']
    },
    {
      id: '190',
      name: 'service_analytics_report',
      type: 'table',
      businessDomain: '智能客服',
      database: 'service_db',
      schema: 'analytics',
      description: '客服分析报告表，生成客服服务的统计分析报告',
      owner: '客服中心团队',
      createTime: '2024-01-08 15:00:00',
      updateTime: '2024-01-22 15:00:00',
      healthScore: 96,
      status: 'active',
      tags: ['客服分析报告', '数据分析', '服务统计', 'intelligent-service', 'ads-service', 'table']
    },

    // 数据层级二级目录数据补充 - ODS层子分类 (10条)
    {
      id: '191',
      name: 'ods_user_behavior_log',
      type: 'table',
      businessDomain: '用户中心',
      database: 'ods_db',
      schema: 'user_behavior',
      description: 'ODS层用户行为日志表，原始用户行为数据',
      owner: '数据工程团队',
      createTime: '2024-01-09 09:00:00',
      updateTime: '2024-01-23 09:00:00',
      healthScore: 88,
      status: 'active',
      tags: ['ODS层', '用户行为', '原始数据']
    },
    {
      id: '192',
      name: 'ods_order_transaction_raw',
      type: 'table',
      businessDomain: '订单中心',
      database: 'ods_db',
      schema: 'order_raw',
      description: 'ODS层订单交易原始数据表，未经处理的订单数据',
      owner: '数据工程团队',
      createTime: '2024-01-09 09:00:00',
      updateTime: '2024-01-23 09:00:00',
      healthScore: 90,
      status: 'active',
      tags: ['ODS层', '订单交易', '原始数据']
    },
    {
      id: '193',
      name: 'ods_product_catalog_source',
      type: 'table',
      businessDomain: '商品中心',
      database: 'ods_db',
      schema: 'product_source',
      description: 'ODS层商品目录源数据表，来自各个渠道的商品信息',
      owner: '数据工程团队',
      createTime: '2024-01-09 09:00:00',
      updateTime: '2024-01-23 09:00:00',
      healthScore: 87,
      status: 'active',
      tags: ['ODS层', '商品目录', '源数据']
    },
    {
      id: '194',
      name: 'ods_marketing_campaign_raw',
      type: 'table',
      businessDomain: '营销中心',
      database: 'ods_db',
      schema: 'marketing_raw',
      description: 'ODS层营销活动原始数据表，营销系统的原始数据',
      owner: '数据工程团队',
      createTime: '2024-01-09 09:00:00',
      updateTime: '2024-01-23 09:00:00',
      healthScore: 89,
      status: 'active',
      tags: ['ODS层', '营销活动', '原始数据']
    },
    {
      id: '195',
      name: 'ods_financial_transaction_log',
      type: 'table',
      businessDomain: '财务中心',
      database: 'ods_db',
      schema: 'financial_log',
      description: 'ODS层财务交易日志表，财务系统的原始交易记录',
      owner: '数据工程团队',
      createTime: '2024-01-09 09:00:00',
      updateTime: '2024-01-23 09:00:00',
      healthScore: 92,
      status: 'active',
      tags: ['ODS层', '财务交易', '日志数据']
    },
    {
      id: '196',
      name: 'ods_supply_chain_raw',
      type: 'table',
      businessDomain: '供应链中心',
      database: 'ods_db',
      schema: 'supply_raw',
      description: 'ODS层供应链原始数据表，供应链系统的原始数据',
      owner: '数据工程团队',
      createTime: '2024-01-09 09:00:00',
      updateTime: '2024-01-23 09:00:00',
      healthScore: 86,
      status: 'active',
      tags: ['ODS层', '供应链', '原始数据']
    },
    {
      id: '197',
      name: 'ods_customer_service_log',
      type: 'table',
      businessDomain: '客服中心',
      database: 'ods_db',
      schema: 'service_log',
      description: 'ODS层客服日志表，客服系统的原始日志数据',
      owner: '数据工程团队',
      createTime: '2024-01-09 09:00:00',
      updateTime: '2024-01-23 09:00:00',
      healthScore: 88,
      status: 'active',
      tags: ['ODS层', '客服日志', '原始数据']
    },
    {
      id: '198',
      name: 'ods_external_api_data',
      type: 'table',
      businessDomain: '用户中心',
      database: 'ods_db',
      schema: 'external_api',
      description: 'ODS层外部API数据表，来自第三方系统的原始数据',
      owner: '数据工程团队',
      createTime: '2024-01-09 09:00:00',
      updateTime: '2024-01-23 09:00:00',
      healthScore: 85,
      status: 'active',
      tags: ['ODS层', '外部API', '第三方数据']
    },
    {
      id: '199',
      name: 'ods_system_event_log',
      type: 'table',
      businessDomain: '订单中心',
      database: 'ods_db',
      schema: 'system_event',
      description: 'ODS层系统事件日志表，系统级别的事件记录',
      owner: '数据工程团队',
      createTime: '2024-01-09 09:00:00',
      updateTime: '2024-01-23 09:00:00',
      healthScore: 91,
      status: 'active',
      tags: ['ODS层', '系统事件', '日志记录']
    },
    {
      id: '200',
      name: 'ods_data_quality_check',
      type: 'table',
      businessDomain: '商品中心',
      database: 'ods_db',
      schema: 'quality_check',
      description: 'ODS层数据质量检查表，原始数据的质量监控',
      owner: '数据工程团队',
      createTime: '2024-01-09 09:00:00',
      updateTime: '2024-01-23 09:00:00',
      healthScore: 93,
      status: 'active',
      tags: ['ODS层', '数据质量', '质量检查']
    },

    // 数据层级二级目录数据补充 - DWD层子分类 (10条)
    {
      id: '201',
      name: 'dwd_user_profile_detail',
      type: 'table',
      businessDomain: '用户中心',
      database: 'dwd_db',
      schema: 'user_detail',
      description: 'DWD层用户画像明细表，清洗后的用户详细信息',
      owner: '数据工程团队',
      createTime: '2024-01-09 10:00:00',
      updateTime: '2024-01-23 10:00:00',
      healthScore: 92,
      status: 'active',
      tags: ['DWD层', '用户画像', '明细数据']
    },
    {
      id: '202',
      name: 'dwd_order_detail_fact',
      type: 'table',
      businessDomain: '订单中心',
      database: 'dwd_db',
      schema: 'order_detail',
      description: 'DWD层订单明细事实表，清洗后的订单详细信息',
      owner: '数据工程团队',
      createTime: '2024-01-09 10:00:00',
      updateTime: '2024-01-23 10:00:00',
      healthScore: 94,
      status: 'active',
      tags: ['DWD层', '订单明细', '事实表']
    },
    {
      id: '203',
      name: 'dwd_product_info_detail',
      type: 'table',
      businessDomain: '商品中心',
      database: 'dwd_db',
      schema: 'product_detail',
      description: 'DWD层商品信息明细表，标准化的商品详细信息',
      owner: '数据工程团队',
      createTime: '2024-01-09 10:00:00',
      updateTime: '2024-01-23 10:00:00',
      healthScore: 91,
      status: 'active',
      tags: ['DWD层', '商品信息', '明细表']
    },
    {
      id: '204',
      name: 'dwd_marketing_activity_detail',
      type: 'table',
      businessDomain: '营销中心',
      database: 'dwd_db',
      schema: 'marketing_detail',
      description: 'DWD层营销活动明细表，清洗后的营销活动数据',
      owner: '数据工程团队',
      createTime: '2024-01-09 10:00:00',
      updateTime: '2024-01-23 10:00:00',
      healthScore: 93,
      status: 'active',
      tags: ['DWD层', '营销活动', '明细数据']
    },
    {
      id: '205',
      name: 'dwd_financial_transaction_detail',
      type: 'table',
      businessDomain: '财务中心',
      database: 'dwd_db',
      schema: 'financial_detail',
      description: 'DWD层财务交易明细表，标准化的财务交易记录',
      owner: '数据工程团队',
      createTime: '2024-01-09 10:00:00',
      updateTime: '2024-01-23 10:00:00',
      healthScore: 96,
      status: 'active',
      tags: ['DWD层', '财务交易', '明细表']
    },
    {
      id: '206',
      name: 'dwd_supply_chain_detail',
      type: 'table',
      businessDomain: '供应链中心',
      database: 'dwd_db',
      schema: 'supply_detail',
      description: 'DWD层供应链明细表，清洗后的供应链操作数据',
      owner: '数据工程团队',
      createTime: '2024-01-09 10:00:00',
      updateTime: '2024-01-23 10:00:00',
      healthScore: 90,
      status: 'active',
      tags: ['DWD层', '供应链', '明细数据']
    },
    {
      id: '207',
      name: 'dwd_customer_service_detail',
      type: 'table',
      businessDomain: '客服中心',
      database: 'dwd_db',
      schema: 'service_detail',
      description: 'DWD层客服明细表，标准化的客服服务记录',
      owner: '数据工程团队',
      createTime: '2024-01-09 10:00:00',
      updateTime: '2024-01-23 10:00:00',
      healthScore: 92,
      status: 'active',
      tags: ['DWD层', '客服服务', '明细表']
    },
    {
      id: '208',
      name: 'dwd_user_behavior_detail',
      type: 'table',
      businessDomain: '用户中心',
      database: 'dwd_db',
      schema: 'behavior_detail',
      description: 'DWD层用户行为明细表，清洗后的用户行为数据',
      owner: '数据工程团队',
      createTime: '2024-01-09 10:00:00',
      updateTime: '2024-01-23 10:00:00',
      healthScore: 89,
      status: 'active',
      tags: ['DWD层', '用户行为', '行为分析']
    },
    {
      id: '209',
      name: 'dwd_payment_detail_fact',
      type: 'table',
      businessDomain: '订单中心',
      database: 'dwd_db',
      schema: 'payment_detail',
      description: 'DWD层支付明细事实表，标准化的支付交易数据',
      owner: '数据工程团队',
      createTime: '2024-01-09 10:00:00',
      updateTime: '2024-01-23 10:00:00',
      healthScore: 95,
      status: 'active',
      tags: ['DWD层', '支付明细', '事实表']
    },
    {
      id: '210',
      name: 'dwd_inventory_change_detail',
      type: 'table',
      businessDomain: '商品中心',
      database: 'dwd_db',
      schema: 'inventory_detail',
      description: 'DWD层库存变化明细表，清洗后的库存变动记录',
      owner: '数据工程团队',
      createTime: '2024-01-09 10:00:00',
      updateTime: '2024-01-23 10:00:00',
      healthScore: 93,
      status: 'active',
      tags: ['DWD层', '库存变化', '明细记录']
    },

    // 数据层级二级目录数据补充 - DWS层子分类 (10条)
    {
      id: '211',
      name: 'dws_user_behavior_summary',
      type: 'table',
      businessDomain: '用户中心',
      database: 'dws_db',
      schema: 'user_summary',
      description: 'DWS层用户行为汇总表，按天汇总的用户行为指标',
      owner: '数据工程团队',
      createTime: '2024-01-09 11:00:00',
      updateTime: '2024-01-23 11:00:00',
      healthScore: 94,
      status: 'active',
      tags: ['DWS层', '用户行为', '汇总表']
    },
    {
      id: '212',
      name: 'dws_order_daily_summary',
      type: 'table',
      businessDomain: '订单中心',
      database: 'dws_db',
      schema: 'order_summary',
      description: 'DWS层订单日汇总表，按天统计的订单业务指标',
      owner: '数据工程团队',
      createTime: '2024-01-09 11:00:00',
      updateTime: '2024-01-23 11:00:00',
      healthScore: 96,
      status: 'active',
      tags: ['DWS层', '订单汇总', '日统计']
    },
    {
      id: '213',
      name: 'dws_product_sales_summary',
      type: 'table',
      businessDomain: '商品中心',
      database: 'dws_db',
      schema: 'product_summary',
      description: 'DWS层商品销售汇总表，商品维度的销售统计数据',
      owner: '数据工程团队',
      createTime: '2024-01-09 11:00:00',
      updateTime: '2024-01-23 11:00:00',
      healthScore: 93,
      status: 'active',
      tags: ['DWS层', '商品销售', '汇总统计']
    },
    {
      id: '214',
      name: 'dws_marketing_effect_summary',
      type: 'table',
      businessDomain: '营销中心',
      database: 'dws_db',
      schema: 'marketing_summary',
      description: 'DWS层营销效果汇总表，营销活动效果的统计分析',
      owner: '数据工程团队',
      createTime: '2024-01-09 11:00:00',
      updateTime: '2024-01-23 11:00:00',
      healthScore: 95,
      status: 'active',
      tags: ['DWS层', '营销效果', '效果分析']
    },
    {
      id: '215',
      name: 'dws_financial_daily_summary',
      type: 'table',
      businessDomain: '财务中心',
      database: 'dws_db',
      schema: 'financial_summary',
      description: 'DWS层财务日汇总表，按天统计的财务核心指标',
      owner: '数据工程团队',
      createTime: '2024-01-09 11:00:00',
      updateTime: '2024-01-23 11:00:00',
      healthScore: 98,
      status: 'active',
      tags: ['DWS层', '财务汇总', '核心指标']
    },
    {
      id: '216',
      name: 'dws_supply_chain_summary',
      type: 'table',
      businessDomain: '供应链中心',
      database: 'dws_db',
      schema: 'supply_summary',
      description: 'DWS层供应链汇总表，供应链关键指标的统计汇总',
      owner: '数据工程团队',
      createTime: '2024-01-09 11:00:00',
      updateTime: '2024-01-23 11:00:00',
      healthScore: 92,
      status: 'active',
      tags: ['DWS层', '供应链', '指标汇总']
    },
    {
      id: '217',
      name: 'dws_service_quality_summary',
      type: 'table',
      businessDomain: '客服中心',
      database: 'dws_db',
      schema: 'service_summary',
      description: 'DWS层服务质量汇总表，客服服务质量的统计指标',
      owner: '数据工程团队',
      createTime: '2024-01-09 11:00:00',
      updateTime: '2024-01-23 11:00:00',
      healthScore: 94,
      status: 'active',
      tags: ['DWS层', '服务质量', '质量统计']
    },
    {
      id: '218',
      name: 'dws_user_retention_summary',
      type: 'table',
      businessDomain: '用户行为数据',
      database: 'dws_db',
      schema: 'retention_summary',
      description: 'DWS层用户留存汇总表，用户留存率的统计分析',
      owner: '数据工程团队',
      createTime: '2024-01-09 11:00:00',
      updateTime: '2024-01-23 11:00:00',
      healthScore: 91,
      status: 'active',
      tags: ['DWS层', '用户留存', '留存分析']
    },
    {
      id: '219',
      name: 'dws_payment_channel_summary',
      type: 'table',
      businessDomain: '订单中心',
      database: 'dws_db',
      schema: 'payment_summary',
      description: 'DWS层支付渠道汇总表，各支付渠道的统计数据',
      owner: '数据工程团队',
      createTime: '2024-01-09 11:00:00',
      updateTime: '2024-01-23 11:00:00',
      healthScore: 97,
      status: 'active',
      tags: ['DWS层', '支付渠道', '渠道统计']
    },
    {
      id: '220',
      name: 'dws_inventory_turnover_summary',
      type: 'table',
      businessDomain: '商品中心',
      database: 'dws_db',
      schema: 'inventory_summary',
      description: 'DWS层库存周转汇总表，库存周转率的统计分析',
      owner: '数据工程团队',
      createTime: '2024-01-09 11:00:00',
      updateTime: '2024-01-23 11:00:00',
      healthScore: 95,
      status: 'active',
      tags: ['DWS层', '库存周转', '周转分析']
    },

    // 数据层级二级目录数据补充 - ADS层子分类 (10条)
    {
      id: '221',
      name: 'ads_user_portrait_mart',
      type: 'table',
      businessDomain: '用户画像',
      database: 'ads_db',
      schema: 'user_mart',
      description: 'ADS层用户画像数据集市，面向业务的用户分析表',
      owner: '数据产品团队',
      createTime: '2024-01-09 12:00:00',
      updateTime: '2024-01-23 12:00:00',
      healthScore: 96,
      status: 'active',
      tags: ['ADS层', '用户画像', '数据集市']
    },
    {
      id: '222',
      name: 'ads_sales_dashboard_mart',
      type: 'table',
      businessDomain: '订单中心',
      database: 'ads_db',
      schema: 'sales_mart',
      description: 'ADS层销售仪表盘数据集市，支持销售分析的应用表',
      owner: '数据产品团队',
      createTime: '2024-01-09 12:00:00',
      updateTime: '2024-01-23 12:00:00',
      healthScore: 98,
      status: 'active',
      tags: ['ADS层', '销售仪表盘', '应用层']
    },
    {
      id: '223',
      name: 'ads_product_analysis_mart',
      type: 'table',
      businessDomain: '商品中心',
      database: 'ads_db',
      schema: 'product_mart',
      description: 'ADS层商品分析数据集市，商品运营分析的应用表',
      owner: '数据产品团队',
      createTime: '2024-01-09 12:00:00',
      updateTime: '2024-01-23 12:00:00',
      healthScore: 95,
      status: 'active',
      tags: ['ADS层', '商品分析', '运营分析']
    },
    {
      id: '224',
      name: 'ads_marketing_roi_mart',
      type: 'table',
      businessDomain: '营销中心',
      database: 'ads_db',
      schema: 'marketing_mart',
      description: 'ADS层营销ROI数据集市，营销投资回报率分析表',
      owner: '数据产品团队',
      createTime: '2024-01-09 12:00:00',
      updateTime: '2024-01-23 12:00:00',
      healthScore: 97,
      status: 'active',
      tags: ['ADS层', '营销ROI', 'ROI分析']
    },
    {
      id: '225',
      name: 'ads_financial_report_mart',
      type: 'table',
      businessDomain: '财务中心',
      database: 'ads_db',
      schema: 'financial_mart',
      description: 'ADS层财务报表数据集市，财务报告的应用数据表',
      owner: '数据产品团队',
      createTime: '2024-01-09 12:00:00',
      updateTime: '2024-01-23 12:00:00',
      healthScore: 99,
      status: 'active',
      tags: ['ADS层', '财务报表', '报告应用']
    },
    {
      id: '226',
      name: 'ads_supply_efficiency_mart',
      type: 'table',
      businessDomain: '供应链中心',
      database: 'ads_db',
      schema: 'supply_mart',
      description: 'ADS层供应链效率数据集市，供应链效率分析表',
      owner: '数据产品团队',
      createTime: '2024-01-09 12:00:00',
      updateTime: '2024-01-23 12:00:00',
      healthScore: 94,
      status: 'active',
      tags: ['ADS层', '供应链效率', '效率分析']
    },
    {
      id: '227',
      name: 'ads_service_satisfaction_mart',
      type: 'table',
      businessDomain: '客服中心',
      database: 'ads_db',
      schema: 'service_mart',
      description: 'ADS层服务满意度数据集市，客户满意度分析表',
      owner: '数据产品团队',
      createTime: '2024-01-09 12:00:00',
      updateTime: '2024-01-23 12:00:00',
      healthScore: 96,
      status: 'active',
      tags: ['ADS层', '服务满意度', '满意度分析']
    },
    {
      id: '228',
      name: 'ads_business_overview_mart',
      type: 'table',
      businessDomain: '用户画像',
      database: 'ads_db',
      schema: 'overview_mart',
      description: 'ADS层业务总览数据集市，高层管理驾驶舱数据表',
      owner: '数据产品团队',
      createTime: '2024-01-09 12:00:00',
      updateTime: '2024-01-23 12:00:00',
      healthScore: 98,
      status: 'active',
      tags: ['ADS层', '业务总览', '管理驾驶舱']
    },
    {
      id: '229',
      name: 'ads_customer_lifecycle_mart',
      type: 'table',
      businessDomain: '订单中心',
      database: 'ads_db',
      schema: 'lifecycle_mart',
      description: 'ADS层客户生命周期数据集市，客户价值分析表',
      owner: '数据产品团队',
      createTime: '2024-01-09 12:00:00',
      updateTime: '2024-01-23 12:00:00',
      healthScore: 97,
      status: 'active',
      tags: ['ADS层', '客户生命周期', '价值分析']
    },
    {
      id: '230',
      name: 'ads_risk_control_mart',
      type: 'table',
      businessDomain: '商品中心',
      database: 'ads_db',
      schema: 'risk_mart',
      description: 'ADS层风险控制数据集市，业务风险监控分析表',
      owner: '数据产品团队',
      createTime: '2024-01-09 12:00:00',
      updateTime: '2024-01-23 12:00:00',
      healthScore: 95,
      status: 'active',
      tags: ['ADS层', '风险控制', '风险监控']
    },

    // 数据类型补充 - 视图类型 (10条)
    {
      id: '231',
      name: 'v_user_active_summary',
      type: 'view',
      businessDomain: '用户中心',
      database: 'view_db',
      schema: 'user_view',
      description: '用户活跃度汇总视图，实时计算用户活跃指标',
      owner: '数据开发团队',
      createTime: '2024-01-10 09:00:00',
      updateTime: '2024-01-24 09:00:00',
      healthScore: 92,
      status: 'active',
      tags: ['视图', '用户活跃度', '实时计算']
    },
    {
      id: '232',
      name: 'v_order_realtime_monitor',
      type: 'view',
      businessDomain: '订单中心',
      database: 'view_db',
      schema: 'order_view',
      description: '订单实时监控视图，实时展示订单状态和趋势',
      owner: '数据开发团队',
      createTime: '2024-01-10 09:00:00',
      updateTime: '2024-01-24 09:00:00',
      healthScore: 94,
      status: 'active',
      tags: ['视图', '订单监控', '实时数据']
    },
    {
      id: '233',
      name: 'v_product_inventory_status',
      type: 'view',
      businessDomain: '商品中心',
      database: 'view_db',
      schema: 'product_view',
      description: '商品库存状态视图，实时显示商品库存情况',
      owner: '数据开发团队',
      createTime: '2024-01-10 09:00:00',
      updateTime: '2024-01-24 09:00:00',
      healthScore: 91,
      status: 'active',
      tags: ['视图', '库存状态', '商品管理']
    },
    {
      id: '234',
      name: 'v_marketing_campaign_effect',
      type: 'view',
      businessDomain: '营销中心',
      database: 'view_db',
      schema: 'marketing_view',
      description: '营销活动效果视图，实时展示营销活动的效果数据',
      owner: '数据开发团队',
      createTime: '2024-01-10 09:00:00',
      updateTime: '2024-01-24 09:00:00',
      healthScore: 93,
      status: 'active',
      tags: ['视图', '营销效果', '活动监控']
    },
    {
      id: '235',
      name: 'v_financial_realtime_report',
      type: 'view',
      businessDomain: '财务中心',
      database: 'view_db',
      schema: 'financial_view',
      description: '财务实时报表视图，实时计算财务核心指标',
      owner: '数据开发团队',
      createTime: '2024-01-10 09:00:00',
      updateTime: '2024-01-24 09:00:00',
      healthScore: 96,
      status: 'active',
      tags: ['视图', '财务报表', '实时指标']
    },
    {
      id: '236',
      name: 'v_supply_chain_monitor',
      type: 'view',
      businessDomain: '供应链中心',
      database: 'view_db',
      schema: 'supply_view',
      description: '供应链监控视图，实时监控供应链各环节状态',
      owner: '数据开发团队',
      createTime: '2024-01-10 09:00:00',
      updateTime: '2024-01-24 09:00:00',
      healthScore: 90,
      status: 'active',
      tags: ['视图', '供应链监控', '环节状态']
    },
    {
      id: '237',
      name: 'v_service_quality_dashboard',
      type: 'view',
      businessDomain: '客服中心',
      database: 'view_db',
      schema: 'service_view',
      description: '服务质量仪表盘视图，实时展示客服服务质量指标',
      owner: '数据开发团队',
      createTime: '2024-01-10 09:00:00',
      updateTime: '2024-01-24 09:00:00',
      healthScore: 92,
      status: 'active',
      tags: ['视图', '服务质量', '质量仪表盘']
    },
    {
      id: '238',
      name: 'v_user_behavior_analysis',
      type: 'view',
      businessDomain: '用户中心',
      database: 'view_db',
      schema: 'behavior_view',
      description: '用户行为分析视图，多维度分析用户行为模式',
      owner: '数据开发团队',
      createTime: '2024-01-10 09:00:00',
      updateTime: '2024-01-24 09:00:00',
      healthScore: 89,
      status: 'active',
      tags: ['视图', '行为分析', '多维分析']
    },
    {
      id: '239',
      name: 'v_sales_performance_trend',
      type: 'view',
      businessDomain: '订单中心',
      database: 'view_db',
      schema: 'sales_view',
      description: '销售业绩趋势视图，展示销售业绩的变化趋势',
      owner: '数据开发团队',
      createTime: '2024-01-10 09:00:00',
      updateTime: '2024-01-24 09:00:00',
      healthScore: 95,
      status: 'active',
      tags: ['视图', '销售业绩', '趋势分析']
    },
    {
      id: '240',
      name: 'v_product_recommendation',
      type: 'view',
      businessDomain: '商品中心',
      database: 'view_db',
      schema: 'recommendation_view',
      description: '商品推荐视图，基于算法的商品推荐结果展示',
      owner: '数据开发团队',
      createTime: '2024-01-10 09:00:00',
      updateTime: '2024-01-24 09:00:00',
      healthScore: 93,
      status: 'active',
      tags: ['视图', '商品推荐', '算法推荐']
    },

    // 数据类型补充 - API类型 (10条)
    {
      id: '241',
      name: 'api_user_profile_service',
      type: 'api',
      businessDomain: '用户中心',
      database: 'api_service',
      schema: 'user_api',
      description: '用户画像服务API，提供用户基础信息和标签数据',
      owner: 'API开发团队',
      createTime: '2024-01-10 10:00:00',
      updateTime: '2024-01-24 10:00:00',
      healthScore: 94,
      status: 'active',
      tags: ['API', '用户画像', '数据服务']
    },
    {
      id: '242',
      name: 'api_order_query_service',
      type: 'api',
      businessDomain: '订单中心',
      database: 'api_service',
      schema: 'order_api',
      description: '订单查询服务API，提供订单详情和状态查询功能',
      owner: 'API开发团队',
      createTime: '2024-01-10 10:00:00',
      updateTime: '2024-01-24 10:00:00',
      healthScore: 96,
      status: 'active',
      tags: ['API', '订单查询', '状态服务']
    },
    {
      id: '243',
      name: 'api_product_info_service',
      type: 'api',
      businessDomain: '商品中心',
      database: 'api_service',
      schema: 'product_api',
      description: '商品信息服务API，提供商品详情和库存信息',
      owner: 'API开发团队',
      createTime: '2024-01-10 10:00:00',
      updateTime: '2024-01-24 10:00:00',
      healthScore: 92,
      status: 'active',
      tags: ['API', '商品信息', '库存服务']
    },
    {
      id: '244',
      name: 'api_marketing_data_service',
      type: 'api',
      businessDomain: '营销中心',
      database: 'api_service',
      schema: 'marketing_api',
      description: '营销数据服务API，提供营销活动和效果数据',
      owner: 'API开发团队',
      createTime: '2024-01-10 10:00:00',
      updateTime: '2024-01-24 10:00:00',
      healthScore: 93,
      status: 'active',
      tags: ['API', '营销数据', '效果服务']
    },
    {
      id: '245',
      name: 'api_financial_report_service',
      type: 'api',
      businessDomain: '财务中心',
      database: 'api_service',
      schema: 'financial_api',
      description: '财务报表服务API，提供财务数据和报表查询',
      owner: 'API开发团队',
      createTime: '2024-01-10 10:00:00',
      updateTime: '2024-01-24 10:00:00',
      healthScore: 98,
      status: 'active',
      tags: ['API', '财务报表', '数据查询']
    },
    {
      id: '246',
      name: 'api_supply_chain_service',
      type: 'api',
      businessDomain: '供应链中心',
      database: 'api_service',
      schema: 'supply_api',
      description: '供应链数据服务API，提供供应链状态和指标数据',
      owner: 'API开发团队',
      createTime: '2024-01-10 10:00:00',
      updateTime: '2024-01-24 10:00:00',
      healthScore: 91,
      status: 'active',
      tags: ['API', '供应链', '状态服务']
    },
    {
      id: '247',
      name: 'api_customer_service_data',
      type: 'api',
      businessDomain: '客服中心',
      database: 'api_service',
      schema: 'service_api',
      description: '客服数据服务API，提供客服工单和质量数据',
      owner: 'API开发团队',
      createTime: '2024-01-10 10:00:00',
      updateTime: '2024-01-24 10:00:00',
      healthScore: 94,
      status: 'active',
      tags: ['API', '客服数据', '工单服务']
    },
    {
      id: '248',
      name: 'api_analytics_service',
      type: 'api',
      businessDomain: '用户中心',
      database: 'api_service',
      schema: 'analytics_api',
      description: '数据分析服务API，提供多维度数据分析功能',
      owner: 'API开发团队',
      createTime: '2024-01-10 10:00:00',
      updateTime: '2024-01-24 10:00:00',
      healthScore: 90,
      status: 'active',
      tags: ['API', '数据分析', '多维服务']
    },
    {
      id: '249',
      name: 'api_recommendation_service',
      type: 'api',
      businessDomain: '订单中心',
      database: 'api_service',
      schema: 'recommendation_api',
      description: '推荐服务API，提供个性化推荐和算法服务',
      owner: 'API开发团队',
      createTime: '2024-01-10 10:00:00',
      updateTime: '2024-01-24 10:00:00',
      healthScore: 95,
      status: 'active',
      tags: ['API', '推荐服务', '算法接口']
    },
    {
      id: '250',
      name: 'api_realtime_monitor_service',
      type: 'api',
      businessDomain: '商品中心',
      database: 'api_service',
      schema: 'monitor_api',
      description: '实时监控服务API，提供业务指标实时监控功能',
      owner: 'API开发团队',
      createTime: '2024-01-10 10:00:00',
      updateTime: '2024-01-24 10:00:00',
      healthScore: 93,
      status: 'active',
      tags: ['API', '实时监控', '指标服务']
    },

    // 数据类型补充 - 文件类型 (10条)
    {
      id: '251',
      name: 'file_user_behavior_log.csv',
      type: 'file',
      businessDomain: '用户中心',
      database: 'file_storage',
      schema: 'csv_files',
      description: '用户行为日志CSV文件，包含用户访问和操作记录',
      owner: '数据工程团队',
      createTime: '2024-01-10 11:00:00',
      updateTime: '2024-01-24 11:00:00',
      healthScore: 91,
      status: 'active',
      tags: ['文件', 'CSV格式', '用户行为']
    },
    {
      id: '252',
      name: 'file_order_export_data.xlsx',
      type: 'file',
      businessDomain: '订单中心',
      database: 'file_storage',
      schema: 'excel_files',
      description: '订单导出数据Excel文件，包含订单详细信息',
      owner: '数据工程团队',
      createTime: '2024-01-10 11:00:00',
      updateTime: '2024-01-24 11:00:00',
      healthScore: 93,
      status: 'active',
      tags: ['文件', 'Excel格式', '订单数据']
    },
    {
      id: '253',
      name: 'file_product_catalog.json',
      type: 'file',
      businessDomain: '商品中心',
      database: 'file_storage',
      schema: 'json_files',
      description: '商品目录JSON文件，结构化的商品信息数据',
      owner: '数据工程团队',
      createTime: '2024-01-10 11:00:00',
      updateTime: '2024-01-24 11:00:00',
      healthScore: 89,
      status: 'active',
      tags: ['文件', 'JSON格式', '商品目录']
    },
    {
      id: '254',
      name: 'file_marketing_report.pdf',
      type: 'file',
      businessDomain: '营销中心',
      database: 'file_storage',
      schema: 'pdf_files',
      description: '营销报告PDF文件，营销活动效果分析报告',
      owner: '数据工程团队',
      createTime: '2024-01-10 11:00:00',
      updateTime: '2024-01-24 11:00:00',
      healthScore: 94,
      status: 'active',
      tags: ['文件', 'PDF格式', '营销报告']
    },
    {
      id: '255',
      name: 'file_financial_statements.xml',
      type: 'file',
      businessDomain: '财务中心',
      database: 'file_storage',
      schema: 'xml_files',
      description: '财务报表XML文件，标准化的财务数据格式',
      owner: '数据工程团队',
      createTime: '2024-01-10 11:00:00',
      updateTime: '2024-01-24 11:00:00',
      healthScore: 96,
      status: 'active',
      tags: ['文件', 'XML格式', '财务报表']
    },
    {
      id: '256',
      name: 'file_supply_chain_data.parquet',
      type: 'file',
      businessDomain: '供应链中心',
      database: 'file_storage',
      schema: 'parquet_files',
      description: '供应链数据Parquet文件，高效的列式存储格式',
      owner: '数据工程团队',
      createTime: '2024-01-10 11:00:00',
      updateTime: '2024-01-24 11:00:00',
      healthScore: 92,
      status: 'active',
      tags: ['文件', 'Parquet格式', '供应链数据']
    },
    {
      id: '257',
      name: 'file_service_logs.txt',
      type: 'file',
      businessDomain: '客服中心',
      database: 'file_storage',
      schema: 'text_files',
      description: '客服日志文本文件，客服系统的操作日志',
      owner: '数据工程团队',
      createTime: '2024-01-10 11:00:00',
      updateTime: '2024-01-24 11:00:00',
      healthScore: 88,
      status: 'active',
      tags: ['文件', 'TXT格式', '客服日志']
    },
    {
      id: '258',
      name: 'file_user_profile_backup.avro',
      type: 'file',
      businessDomain: '用户中心',
      database: 'file_storage',
      schema: 'avro_files',
      description: '用户画像备份Avro文件，序列化的用户数据',
      owner: '数据工程团队',
      createTime: '2024-01-10 11:00:00',
      updateTime: '2024-01-24 11:00:00',
      healthScore: 90,
      status: 'active',
      tags: ['文件', 'Avro格式', '用户画像', 'user-profile', 'file']
    },
    {
      id: '259',
      name: 'file_transaction_archive.orc',
      type: 'file',
      businessDomain: '订单中心',
      database: 'file_storage',
      schema: 'orc_files',
      description: '交易归档ORC文件，优化的行列式存储格式',
      owner: '数据工程团队',
      createTime: '2024-01-10 11:00:00',
      updateTime: '2024-01-24 11:00:00',
      healthScore: 95,
      status: 'active',
      tags: ['文件', 'ORC格式', '交易归档', 'order-main', 'file']
    },
    {
      id: '260',
      name: 'file_analytics_config.yaml',
      type: 'file',
      businessDomain: '商品中心',
      database: 'file_storage',
      schema: 'config_files',
      description: '分析配置YAML文件，数据分析的配置参数',
      owner: '数据工程团队',
      createTime: '2024-01-10 11:00:00',
      updateTime: '2024-01-24 11:00:00',
      healthScore: 87,
      status: 'active',
      tags: ['文件', 'YAML格式', '配置文件', 'product-basic', 'file']
    },
    
    // 视图类型数据资产 (5条)
    {
      id: '261',
      name: 'view_user_summary',
      type: 'view',
      businessDomain: '用户中心',
      database: 'analytics_db',
      schema: 'views',
      description: '用户汇总视图，提供用户基础信息的聚合查询',
      owner: '数据分析师',
      createTime: '2024-01-15 10:00:00',
      updateTime: '2024-01-25 10:00:00',
      healthScore: 92,
      status: 'active',
      tags: ['视图', '用户汇总', '分析', 'user-profile', 'ads-user', 'view']
    },
    {
      id: '262',
      name: 'view_order_analytics',
      type: 'view',
      businessDomain: '订单中心',
      database: 'analytics_db',
      schema: 'views',
      description: '订单分析视图，提供订单趋势和统计分析',
      owner: '数据分析师',
      createTime: '2024-01-15 10:00:00',
      updateTime: '2024-01-25 10:00:00',
      healthScore: 88,
      status: 'active',
      tags: ['视图', '订单分析', '趋势', 'order-main', 'ads-order', 'view']
    },
    {
      id: '263',
      name: 'view_product_performance',
      type: 'view',
      businessDomain: '商品中心',
      database: 'analytics_db',
      schema: 'views',
      description: '商品性能视图，展示商品销售和库存情况',
      owner: '数据分析师',
      createTime: '2024-01-15 10:00:00',
      updateTime: '2024-01-25 10:00:00',
      healthScore: 90,
      status: 'active',
      tags: ['视图', '商品性能', '销售分析', 'product-sales', 'ads-product', 'view']
    },
    {
      id: '264',
      name: 'view_marketing_roi',
      type: 'view',
      businessDomain: '营销中心',
      database: 'analytics_db',
      schema: 'views',
      description: '营销ROI视图，计算营销活动的投资回报率',
      owner: '数据分析师',
      createTime: '2024-01-15 10:00:00',
      updateTime: '2024-01-25 10:00:00',
      healthScore: 94,
      status: 'active',
      tags: ['视图', '营销ROI', '投资回报', 'marketing-roi', 'ads-marketing', 'view']
    },
    {
      id: '265',
      name: 'view_finance_dashboard',
      type: 'view',
      businessDomain: '财务中心',
      database: 'analytics_db',
      schema: 'views',
      description: '财务仪表板视图，提供财务关键指标的实时展示',
      owner: '数据分析师',
      createTime: '2024-01-15 10:00:00',
      updateTime: '2024-01-25 10:00:00',
      healthScore: 96,
      status: 'active',
      tags: ['视图', '财务仪表板', '关键指标', 'finance-report', 'ads-finance', 'view']
    },
    
    // API类型数据资产 (5条)
    {
      id: '266',
      name: 'api_user_profile',
      type: 'api',
      businessDomain: '用户中心',
      database: 'api_gateway',
      schema: 'user_apis',
      description: '用户画像API，提供用户基础信息和偏好数据的接口服务',
      owner: 'API开发团队',
      createTime: '2024-01-20 09:00:00',
      updateTime: '2024-01-25 09:00:00',
      healthScore: 95,
      status: 'active',
      tags: ['API', '用户画像', '接口服务', 'user-profile', 'api']
    },
    {
      id: '267',
      name: 'api_order_status',
      type: 'api',
      businessDomain: '订单中心',
      database: 'api_gateway',
      schema: 'order_apis',
      description: '订单状态API，提供订单状态查询和更新的接口服务',
      owner: 'API开发团队',
      createTime: '2024-01-20 09:00:00',
      updateTime: '2024-01-25 09:00:00',
      healthScore: 93,
      status: 'active',
      tags: ['API', '订单状态', '查询接口', 'order-status', 'api']
    },
    {
      id: '268',
      name: 'api_product_search',
      type: 'api',
      businessDomain: '商品中心',
      database: 'api_gateway',
      schema: 'product_apis',
      description: '商品搜索API，提供商品搜索和推荐的接口服务',
      owner: 'API开发团队',
      createTime: '2024-01-20 09:00:00',
      updateTime: '2024-01-25 09:00:00',
      healthScore: 91,
      status: 'active',
      tags: ['API', '商品搜索', '推荐接口', 'product-recommend', 'api']
    },
    {
      id: '269',
      name: 'api_marketing_campaign',
      type: 'api',
      businessDomain: '营销中心',
      database: 'api_gateway',
      schema: 'marketing_apis',
      description: '营销活动API，提供营销活动管理和效果追踪的接口服务',
      owner: 'API开发团队',
      createTime: '2024-01-20 09:00:00',
      updateTime: '2024-01-25 09:00:00',
      healthScore: 89,
      status: 'active',
      tags: ['API', '营销活动', '效果追踪', 'marketing-campaign', 'api']
    },
    {
      id: '270',
      name: 'api_payment_gateway',
      type: 'api',
      businessDomain: '财务中心',
      database: 'api_gateway',
      schema: 'payment_apis',
      description: '支付网关API，提供支付处理和财务数据的接口服务',
      owner: 'API开发团队',
      createTime: '2024-01-20 09:00:00',
      updateTime: '2024-01-25 09:00:00',
      healthScore: 97,
      status: 'active',
      tags: ['API', '支付网关', '财务接口', 'finance-transaction', 'api']
    },
    
    // 补充用户中心各三级分类的数据资产
    // 用户安全相关资产
    {
      id: '271',
      name: 'user_login_security',
      type: 'table',
      businessDomain: '用户中心',
      database: 'user_db',
      schema: 'security',
      description: '用户登录安全表，记录用户登录的安全策略和验证信息',
      owner: '安全团队',
      createTime: '2024-01-25 10:00:00',
      updateTime: '2024-01-26 10:00:00',
      healthScore: 95,
      status: 'active',
      tags: ['登录安全', '验证', '安全策略', 'user-security', 'ods-user', 'table']
    },
    {
      id: '272',
      name: 'user_password_policy',
      type: 'table',
      businessDomain: '用户中心',
      database: 'user_db',
      schema: 'security',
      description: '用户密码策略表，定义密码复杂度和更新规则',
      owner: '安全团队',
      createTime: '2024-01-25 10:00:00',
      updateTime: '2024-01-26 10:00:00',
      healthScore: 93,
      status: 'active',
      tags: ['密码策略', '安全规则', '复杂度', 'user-security', 'dwd-user', 'table']
    },
    {
      id: '273',
      name: 'user_security_events',
      type: 'table',
      businessDomain: '用户中心',
      database: 'user_db',
      schema: 'security',
      description: '用户安全事件表，记录异常登录和安全威胁',
      owner: '安全团队',
      createTime: '2024-01-25 10:00:00',
      updateTime: '2024-01-26 10:00:00',
      healthScore: 91,
      status: 'active',
      tags: ['安全事件', '威胁检测', '异常登录', 'user-security', 'dws-user', 'table']
    },
    {
      id: '274',
      name: 'user_auth_tokens',
      type: 'table',
      businessDomain: '用户中心',
      database: 'user_db',
      schema: 'security',
      description: '用户认证令牌表，管理用户的访问令牌和会话',
      owner: '安全团队',
      createTime: '2024-01-25 10:00:00',
      updateTime: '2024-01-26 10:00:00',
      healthScore: 94,
      status: 'active',
      tags: ['认证令牌', '会话管理', '访问控制', 'user-security', 'ads-user', 'table']
    },
    
    // 用户等级相关资产
    {
      id: '275',
      name: 'user_level_config',
      type: 'table',
      businessDomain: '用户中心',
      database: 'user_db',
      schema: 'level',
      description: '用户等级配置表，定义各等级的权益和升级条件',
      owner: '会员运营',
      createTime: '2024-01-25 11:00:00',
      updateTime: '2024-01-26 11:00:00',
      healthScore: 92,
      status: 'active',
      tags: ['等级配置', '权益设置', '升级条件', 'user-level', 'ods-user', 'table']
    },
    {
      id: '276',
      name: 'user_level_history',
      type: 'table',
      businessDomain: '用户中心',
      database: 'user_db',
      schema: 'level',
      description: '用户等级历史表，记录用户等级变更的历史轨迹',
      owner: '会员运营',
      createTime: '2024-01-25 11:00:00',
      updateTime: '2024-01-26 11:00:00',
      healthScore: 89,
      status: 'active',
      tags: ['等级历史', '变更记录', '轨迹追踪', 'user-level', 'dwd-user', 'table']
    },
    {
      id: '277',
      name: 'user_level_benefits',
      type: 'table',
      businessDomain: '用户中心',
      database: 'user_db',
      schema: 'level',
      description: '用户等级权益表，详细记录各等级用户享有的权益',
      owner: '会员运营',
      createTime: '2024-01-25 11:00:00',
      updateTime: '2024-01-26 11:00:00',
      healthScore: 90,
      status: 'active',
      tags: ['等级权益', '会员福利', '特权管理', 'user-level', 'dws-user', 'table']
    },
    {
      id: '278',
      name: 'user_level_analytics',
      type: 'view',
      businessDomain: '用户中心',
      database: 'analytics_db',
      schema: 'views',
      description: '用户等级分析视图，提供等级分布和转化率分析',
      owner: '数据分析师',
      createTime: '2024-01-25 11:00:00',
      updateTime: '2024-01-26 11:00:00',
      healthScore: 93,
      status: 'active',
      tags: ['等级分析', '转化率', '分布统计', 'user-level', 'ads-user', 'view']
    },
    
    // 用户反馈相关资产
    {
      id: '279',
      name: 'user_feedback_categories',
      type: 'table',
      businessDomain: '用户中心',
      database: 'service_db',
      schema: 'feedback',
      description: '用户反馈分类表，定义反馈的类型和处理流程',
      owner: '客服团队',
      createTime: '2024-01-25 12:00:00',
      updateTime: '2024-01-26 12:00:00',
      healthScore: 88,
      status: 'active',
      tags: ['反馈分类', '处理流程', '类型定义', 'user-feedback', 'ods-service', 'table']
    },
    {
      id: '280',
      name: 'user_feedback_responses',
      type: 'table',
      businessDomain: '用户中心',
      database: 'service_db',
      schema: 'feedback',
      description: '用户反馈回复表，记录客服对用户反馈的回复信息',
      owner: '客服团队',
      createTime: '2024-01-25 12:00:00',
      updateTime: '2024-01-26 12:00:00',
      healthScore: 91,
      status: 'active',
      tags: ['反馈回复', '客服响应', '处理记录', 'user-feedback', 'dwd-service', 'table']
    },
    
    // 补充订单中心各三级分类的数据资产
    // 订单详情相关资产
    {
      id: '281',
      name: 'order_detail_config',
      type: 'table',
      businessDomain: '订单中心',
      database: 'order_db',
      schema: 'detail',
      description: '订单详情配置表，定义订单详情的展示规则和字段配置',
      owner: '订单团队',
      createTime: '2024-01-25 13:00:00',
      updateTime: '2024-01-26 13:00:00',
      healthScore: 90,
      status: 'active',
      tags: ['详情配置', '展示规则', '字段设置', 'order-detail', 'ods-order', 'table']
    },
    {
      id: '282',
      name: 'order_detail_history',
      type: 'table',
      businessDomain: '订单中心',
      database: 'order_db',
      schema: 'detail',
      description: '订单详情历史表，记录订单详情的变更历史',
      owner: '订单团队',
      createTime: '2024-01-25 13:00:00',
      updateTime: '2024-01-26 13:00:00',
      healthScore: 88,
      status: 'active',
      tags: ['详情历史', '变更记录', '历史追踪', 'order-detail', 'dwd-order', 'table']
    },
    {
      id: '283',
      name: 'order_detail_analytics',
      type: 'view',
      businessDomain: '订单中心',
      database: 'analytics_db',
      schema: 'views',
      description: '订单详情分析视图，提供订单详情的统计分析',
      owner: '数据分析师',
      createTime: '2024-01-25 13:00:00',
      updateTime: '2024-01-26 13:00:00',
      healthScore: 92,
      status: 'active',
      tags: ['详情分析', '统计报表', '数据洞察', 'order-detail', 'ads-order', 'view']
    },
    
    // 订单状态相关资产
    {
      id: '284',
      name: 'order_status_config',
      type: 'table',
      businessDomain: '订单中心',
      database: 'order_db',
      schema: 'status',
      description: '订单状态配置表，定义各种订单状态和流转规则',
      owner: '订单团队',
      createTime: '2024-01-25 14:00:00',
      updateTime: '2024-01-26 14:00:00',
      healthScore: 94,
      status: 'active',
      tags: ['状态配置', '流转规则', '状态定义', 'order-status', 'ods-order', 'table']
    },
    {
      id: '285',
      name: 'order_status_transitions',
      type: 'table',
      businessDomain: '订单中心',
      database: 'order_db',
      schema: 'status',
      description: '订单状态流转表，记录订单状态的流转路径和条件',
      owner: '订单团队',
      createTime: '2024-01-25 14:00:00',
      updateTime: '2024-01-26 14:00:00',
      healthScore: 91,
      status: 'active',
      tags: ['状态流转', '流转路径', '条件判断', 'order-status', 'dwd-order', 'table']
    },
    {
      id: '286',
      name: 'order_status_metrics',
      type: 'view',
      businessDomain: '订单中心',
      database: 'analytics_db',
      schema: 'views',
      description: '订单状态指标视图，提供各状态的分布和转化率分析',
      owner: '数据分析师',
      createTime: '2024-01-25 14:00:00',
      updateTime: '2024-01-26 14:00:00',
      healthScore: 93,
      status: 'active',
      tags: ['状态指标', '转化分析', '分布统计', 'order-status', 'ads-order', 'view']
    },
    
    // 订单支付相关资产
    {
      id: '287',
      name: 'order_payment_methods',
      type: 'table',
      businessDomain: '订单中心',
      database: 'payment_db',
      schema: 'methods',
      description: '订单支付方式表，定义支持的支付方式和配置',
      owner: '支付团队',
      createTime: '2024-01-25 15:00:00',
      updateTime: '2024-01-26 15:00:00',
      healthScore: 95,
      status: 'active',
      tags: ['支付方式', '支付配置', '方式管理', 'order-payment', 'ods-payment', 'table']
    },
    {
      id: '288',
      name: 'order_payment_records',
      type: 'table',
      businessDomain: '订单中心',
      database: 'payment_db',
      schema: 'records',
      description: '订单支付记录表，详细记录每笔支付的交易信息',
      owner: '支付团队',
      createTime: '2024-01-25 15:00:00',
      updateTime: '2024-01-26 15:00:00',
      healthScore: 92,
      status: 'active',
      tags: ['支付记录', '交易信息', '支付详情', 'order-payment', 'dwd-payment', 'table']
    },
    {
      id: '289',
      name: 'order_payment_analytics',
      type: 'view',
      businessDomain: '订单中心',
      database: 'analytics_db',
      schema: 'views',
      description: '订单支付分析视图，提供支付成功率和支付方式分析',
      owner: '数据分析师',
      createTime: '2024-01-25 15:00:00',
      updateTime: '2024-01-26 15:00:00',
      healthScore: 94,
      status: 'active',
      tags: ['支付分析', '成功率', '方式统计', 'order-payment', 'ads-payment', 'view']
    },
    
    // 补充商品中心各三级分类的数据资产
    // 商品销售相关资产
    {
      id: '290',
      name: 'product_sales_config',
      type: 'table',
      businessDomain: '商品中心',
      database: 'product_db',
      schema: 'sales',
      description: '商品销售配置表，定义商品的销售策略和规则',
      owner: '销售团队',
      createTime: '2024-01-25 16:00:00',
      updateTime: '2024-01-26 16:00:00',
      healthScore: 91,
      status: 'active',
      tags: ['销售配置', '销售策略', '规则设置', 'product-sales', 'ods-product', 'table']
    },
    {
      id: '291',
      name: 'product_sales_records',
      type: 'table',
      businessDomain: '商品中心',
      database: 'product_db',
      schema: 'sales',
      description: '商品销售记录表，记录商品的销售明细和交易信息',
      owner: '销售团队',
      createTime: '2024-01-25 16:00:00',
      updateTime: '2024-01-26 16:00:00',
      healthScore: 89,
      status: 'active',
      tags: ['销售记录', '交易明细', '销售数据', 'product-sales', 'dwd-product', 'table']
    },
    {
      id: '292',
      name: 'product_sales_trends',
      type: 'view',
      businessDomain: '商品中心',
      database: 'analytics_db',
      schema: 'views',
      description: '商品销售趋势视图，展示商品销售的趋势分析',
      owner: '数据分析师',
      createTime: '2024-01-25 16:00:00',
      updateTime: '2024-01-26 16:00:00',
      healthScore: 93,
      status: 'active',
      tags: ['销售趋势', '趋势分析', '销售洞察', 'product-sales', 'ads-product', 'view']
    },
    
    // 商品库存相关资产
    {
      id: '293',
      name: 'product_inventory_config',
      type: 'table',
      businessDomain: '商品中心',
      database: 'inventory_db',
      schema: 'config',
      description: '商品库存配置表，定义库存管理的规则和阈值',
      owner: '库存团队',
      createTime: '2024-01-25 17:00:00',
      updateTime: '2024-01-26 17:00:00',
      healthScore: 92,
      status: 'active',
      tags: ['库存配置', '管理规则', '阈值设置', 'product-inventory', 'ods-product', 'table']
    },
    {
      id: '294',
      name: 'product_inventory_movements',
      type: 'table',
      businessDomain: '商品中心',
      database: 'inventory_db',
      schema: 'movements',
      description: '商品库存变动表，记录库存的入库、出库等变动信息',
      owner: '库存团队',
      createTime: '2024-01-25 17:00:00',
      updateTime: '2024-01-26 17:00:00',
      healthScore: 90,
      status: 'active',
      tags: ['库存变动', '入库出库', '变动记录', 'product-inventory', 'dwd-product', 'table']
    },
    {
      id: '295',
      name: 'product_inventory_alerts',
      type: 'view',
      businessDomain: '商品中心',
      database: 'analytics_db',
      schema: 'views',
      description: '商品库存预警视图，提供库存不足和过量的预警信息',
      owner: '数据分析师',
      createTime: '2024-01-25 17:00:00',
      updateTime: '2024-01-26 17:00:00',
      healthScore: 94,
      status: 'active',
      tags: ['库存预警', '预警信息', '库存监控', 'product-inventory', 'ads-product', 'view']
    },
    
    // 商品推荐相关资产
    {
      id: '296',
      name: 'product_recommend_rules',
      type: 'table',
      businessDomain: '商品中心',
      database: 'recommend_db',
      schema: 'rules',
      description: '商品推荐规则表，定义商品推荐的算法和策略',
      owner: '推荐团队',
      createTime: '2024-01-25 18:00:00',
      updateTime: '2024-01-26 18:00:00',
      healthScore: 88,
      status: 'active',
      tags: ['推荐规则', '算法策略', '推荐配置', 'product-recommend', 'ods-product', 'table']
    },
    {
      id: '297',
      name: 'product_recommend_logs',
      type: 'table',
      businessDomain: '商品中心',
      database: 'recommend_db',
      schema: 'logs',
      description: '商品推荐日志表，记录推荐系统的执行日志和结果',
      owner: '推荐团队',
      createTime: '2024-01-25 18:00:00',
      updateTime: '2024-01-26 18:00:00',
      healthScore: 86,
      status: 'active',
      tags: ['推荐日志', '执行记录', '推荐结果', 'product-recommend', 'dwd-product', 'table']
    },
    {
      id: '298',
      name: 'product_recommend_metrics',
      type: 'view',
      businessDomain: '商品中心',
      database: 'analytics_db',
      schema: 'views',
      description: '商品推荐指标视图，提供推荐效果和点击率分析',
      owner: '数据分析师',
      createTime: '2024-01-25 18:00:00',
      updateTime: '2024-01-26 18:00:00',
      healthScore: 91,
      status: 'active',
      tags: ['推荐指标', '效果分析', '点击率', 'product-recommend', 'ads-product', 'view']
    },
    
    // 商品分类相关资产
    {
      id: '299',
      name: 'product_category_rules',
      type: 'table',
      businessDomain: '商品中心',
      database: 'category_db',
      schema: 'rules',
      description: '商品分类规则表，定义商品自动分类的规则和条件',
      owner: '分类团队',
      createTime: '2024-01-25 19:00:00',
      updateTime: '2024-01-26 19:00:00',
      healthScore: 90,
      status: 'active',
      tags: ['分类规则', '自动分类', '分类条件', 'product-category', 'ods-product', 'table']
    },
    {
      id: '300',
      name: 'product_category_mappings',
      type: 'table',
      businessDomain: '商品中心',
      database: 'category_db',
      schema: 'mappings',
      description: '商品分类映射表，记录商品与分类的对应关系',
      owner: '分类团队',
      createTime: '2024-01-25 19:00:00',
      updateTime: '2024-01-26 19:00:00',
      healthScore: 92,
      status: 'active',
      tags: ['分类映射', '对应关系', '分类管理', 'product-category', 'dwd-product', 'table']
    }
  ];

  // 表格列定义
  const columns = [
    {
      title: '资产名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string, record: DataAsset) => (
        <Space>
          {record.type === 'table' && <TableOutlined />}
          {record.type === 'view' && <EyeOutlined />}
          {record.type === 'file' && <FileTextOutlined />}
          {record.type === 'api' && <DatabaseOutlined />}
          <a onClick={() => handleViewDetail(record.id)}>{text}</a>
        </Space>
      ),
      sorter: (a: DataAsset, b: DataAsset) => a.name.localeCompare(b.name)
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => {
        const typeMap = {
          table: { color: 'blue', text: '表' },
          view: { color: 'green', text: '视图' },
          file: { color: 'orange', text: '文件' },
          api: { color: 'purple', text: 'API' }
        };
        const config = typeMap[type as keyof typeof typeMap];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
      filters: [
        { text: '表', value: 'table' },
        { text: '视图', value: 'view' },
        { text: '文件', value: 'file' },
        { text: 'API', value: 'api' }
      ],
      onFilter: (value: any, record: DataAsset) => record.type === value
    },
    {
      title: '所属业务域',
      dataIndex: 'businessDomain',
      key: 'businessDomain',
      width: 120,
      sorter: (a: DataAsset, b: DataAsset) => a.businessDomain.localeCompare(b.businessDomain)
    },
    {
      title: '数据库',
      dataIndex: 'database',
      key: 'database',
      width: 120
    },
    {
      title: '负责人',
      dataIndex: 'owner',
      key: 'owner',
      width: 100
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 150,
      sorter: (a: DataAsset, b: DataAsset) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime()
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 150,
      sorter: (a: DataAsset, b: DataAsset) => new Date(a.updateTime).getTime() - new Date(b.updateTime).getTime()
    },
    {
      title: '健康度评分',
      dataIndex: 'healthScore',
      key: 'healthScore',
      width: 120,
      render: (score: number) => (
        <Space>
          <Rate disabled value={score / 20} style={{ fontSize: 12 }} />
          <span>{score}</span>
        </Space>
      ),
      sorter: (a: DataAsset, b: DataAsset) => a.healthScore - b.healthScore
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => {
        const statusMap = {
          active: { color: 'green', text: '活跃' },
          inactive: { color: 'orange', text: '非活跃' },
          deprecated: { color: 'red', text: '已废弃' }
        };
        const config = statusMap[status as keyof typeof statusMap];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
      filters: [
        { text: '活跃', value: 'active' },
        { text: '非活跃', value: 'inactive' },
        { text: '已废弃', value: 'deprecated' }
      ],
      onFilter: (value: any, record: DataAsset) => record.status === value
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: DataAsset) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record.id)}
            />
          </Tooltip>
          <Tooltip title="收藏">
            <Button
              type="text"
              icon={<StarOutlined />}
              onClick={() => handleFavorite(record.id)}
            />
          </Tooltip>
          <Tooltip title="更多">
            <Button
              type="text"
              icon={<MoreOutlined />}
              onClick={() => handleMore(record.id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  useEffect(() => {
    dispatch(setBreadcrumbs([
      { key: 'home', label: '首页', path: '/dashboard' },
      { key: 'data-assets', label: '数据资产', path: '' }
    ]));
    
    loadDataAssets();
  }, [dispatch]);

  useEffect(() => {
    filterAssets();
  }, [dataAssets, searchText, selectedKeys, filters]);

  const loadDataAssets = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDataAssets(mockDataAssets);
      setTotal(mockDataAssets.length);
    } catch (error) {
      message.error('加载数据资产失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 筛选数据资产
   * 支持按业务域分类标签、数据类型、状态等多维度筛选
   */
  const filterAssets = () => {
    let filtered = [...dataAssets];

    // 搜索过滤
    if (searchText) {
      filtered = filtered.filter(asset => 
        asset.name.toLowerCase().includes(searchText.toLowerCase()) ||
        asset.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // 分类树过滤 - 支持业务域三级菜单标签关联
    if (selectedKeys.length > 0) {
      const selectedKey = selectedKeys[0];
      
      // 一级业务域过滤
      const primaryDomainMap: { [key: string]: string } = {
        'user-center': '用户中心',
        'order-center': '订单中心',
        'product-center': '商品中心',
        'marketing-center': '营销中心',
        'finance-center': '财务中心',
        'supply-chain-center': '供应链中心',
        'customer-service-center': '客服中心'
      };
      
      // 三级业务域子分类标签映射
      const subDomainTagMap: { [key: string]: string } = {
        // 用户中心子分类
        'user-basic': '用户基础信息',
        'user-behavior': '用户行为分析', 
        'user-profile': '用户画像数据',
        'user-permission': '用户权限管理',
        'user-level': '用户等级体系',
        'user-tags': '用户标签管理',
        'user-feedback': '用户反馈数据',
        'user-security': '用户安全日志',
        'user-social': '用户社交关系',
        'user-device': '用户设备信息',
        
        // 订单中心子分类
        'order-basic': '订单基础信息',
        'order-payment': '订单支付信息',
        'order-logistics': '订单物流信息',
        'order-after-sales': '订单售后信息',
        'order-evaluation': '订单评价信息',
        'order-promotion': '订单促销信息',
        'order-risk': '订单风控信息',
        'order-settlement': '订单结算信息',
        
        // 商品中心子分类
        'product-basic': '商品基础信息',
        'product-category': '商品分类信息',
        'product-inventory': '商品库存信息',
        'product-price': '商品价格信息',
        'product-promotion': '商品促销信息',
        'product-review': '商品评价信息',
        'product-recommendation': '商品推荐信息',
        'product-lifecycle': '商品生命周期',
        
        // 营销中心子分类
        'marketing-campaign': '营销活动信息',
        'marketing-channel': '营销渠道数据',
        'marketing-segment': '营销客户分群',
        'marketing-content': '营销内容数据',
        'marketing-effect': '营销效果数据',
        'marketing-automation': '营销自动化',
        'marketing-leads': '营销线索数据',
        'marketing-budget': '营销预算数据',
        
        // 财务中心子分类
        'finance-account': '财务账户信息',
        'finance-transaction': '财务交易数据',
        'finance-budget': '财务预算数据',
        'finance-cost': '财务成本数据',
        'finance-revenue': '财务收入数据',
        'finance-tax': '财务税务数据',
        'finance-audit': '财务审计数据',
        'finance-risk': '财务风险评估',
        'finance-reporting': '财务报表数据',
        'finance-cashflow': '财务现金流',
        
        // 供应链中心子分类
        'supply-vendor': '供应商信息管理',
        'supply-procurement': '采购管理数据',
        'supply-inventory': '库存跟踪数据',
        'supply-logistics': '物流配送数据',
        'supply-warehouse': '仓储管理数据',
        'supply-quality': '质量控制数据',
        'supply-cost': '供应链成本分析',
        'supply-forecast': '需求预测数据',
        'supply-risk': '供应链风险管理',
        'supply-performance': '供应链绩效指标',
        
        // 客服中心子分类
        'service-ticket': '工单管理数据',
        'service-feedback': '客户反馈数据',
        'service-knowledge': '知识库管理',
        'service-quality': '服务质量监控',
        'service-performance': '客服绩效数据',
        'service-communication': '沟通记录数据',
        'service-escalation': '问题升级数据',
        'service-satisfaction': '满意度调研',
        'service-training': '培训管理数据',
        'service-analysis': '客服分析报告',
        
        // 数据层级子分类
        'ods-user': 'ODS用户数据',
        'ods-order': 'ODS订单数据',
        'ods-product': 'ODS商品数据',
        'ods-payment': 'ODS支付数据',
        'ods-logistics': 'ODS物流数据',
        'ods-marketing': 'ODS营销数据',
        'ods-finance': 'ODS财务数据',
        'ods-supply': 'ODS供应链数据',
        'ods-service': 'ODS客服数据',
        'ods-external': 'ODS外部数据',
        
        'dwd-user': 'DWD用户明细',
        'dwd-order': 'DWD订单明细',
        'dwd-product': 'DWD商品明细',
        'dwd-payment': 'DWD支付明细',
        'dwd-logistics': 'DWD物流明细',
        'dwd-marketing': 'DWD营销明细',
        'dwd-finance': 'DWD财务明细',
        'dwd-supply': 'DWD供应链明细',
        'dwd-service': 'DWD客服明细',
        'dwd-traffic': 'DWD流量明细',
        
        'dws-user': 'DWS用户汇总',
        'dws-order': 'DWS订单汇总',
        'dws-product': 'DWS商品汇总',
        'dws-payment': 'DWS支付汇总',
        'dws-logistics': 'DWS物流汇总',
        'dws-marketing': 'DWS营销汇总',
        'dws-finance': 'DWS财务汇总',
        'dws-supply': 'DWS供应链汇总',
        'dws-service': 'DWS客服汇总',
        'dws-traffic': 'DWS流量汇总',
        
        'ads-user': 'ADS用户分析',
        'ads-order': 'ADS订单分析',
        'ads-product': 'ADS商品分析',
        'ads-payment': 'ADS支付分析',
        'ads-logistics': 'ADS物流分析',
        'ads-marketing': 'ADS营销分析',
        'ads-finance': 'ADS财务分析',
        'ads-supply': 'ADS供应链分析',
        'ads-service': 'ADS客服分析',
        'ads-business': 'ADS经营分析'
      };
      
      // 数据层级标签映射
      const dataLayerTagMap: { [key: string]: string[] } = {
        'ods': ['ODS层', 'ODS', '原始数据层'],
        'dwd': ['DWD层', 'DWD', '明细数据层'],
        'dws': ['DWS层', 'DWS', '汇总数据层'],
        'ads': ['ADS层', 'ADS', '应用数据层']
      };
      
      if (primaryDomainMap[selectedKey]) {
        // 一级业务域过滤
        const domain = primaryDomainMap[selectedKey];
        
        // 为供应链中心和客服中心添加特殊处理，包含其子分类资产
        if (selectedKey === 'supply-chain-center') {
          // 供应链中心：包含主业务域和所有子分类
          const supplySubDomains = [
            '供应商信息管理', '采购管理数据', '库存跟踪数据', '物流配送数据',
            '仓储管理数据', '质量控制数据', '供应链成本分析', '需求预测数据',
            '供应链风险管理', '供应链绩效指标'
          ];
          filtered = filtered.filter(asset => 
            asset.businessDomain === domain || 
            supplySubDomains.includes(asset.businessDomain)
          );
        } else if (selectedKey === 'customer-service-center') {
          // 客服中心：包含主业务域和所有子分类
          const serviceSubDomains = [
            '工单管理数据', '客户反馈数据', '知识库管理', '服务质量监控',
            '客服绩效数据', '沟通记录数据', '问题升级数据', '满意度调研',
            '培训管理数据', '客服分析报告'
          ];
          filtered = filtered.filter(asset => 
            asset.businessDomain === domain || 
            serviceSubDomains.includes(asset.businessDomain)
          );
        } else if (selectedKey === 'user-center') {
          // 用户中心：包含主业务域和所有子分类
          const userSubDomains = [
            '用户基础信息', '用户行为分析', '用户画像数据', '用户权限管理',
            '用户等级体系', '用户标签管理', '用户反馈数据', '用户安全日志',
            '用户社交关系', '用户设备信息'
          ];
          filtered = filtered.filter(asset => 
            asset.businessDomain === domain || 
            userSubDomains.includes(asset.businessDomain)
          );
        } else if (selectedKey === 'order-center') {
          // 订单中心：包含主业务域和所有子分类
          const orderSubDomains = [
            '订单基础信息', '订单支付信息', '订单物流信息', '订单售后信息',
            '订单评价信息', '订单促销信息', '订单风控信息', '订单结算信息'
          ];
          filtered = filtered.filter(asset => 
            asset.businessDomain === domain || 
            orderSubDomains.includes(asset.businessDomain)
          );
        } else if (selectedKey === 'product-center') {
          // 商品中心：包含主业务域和所有子分类
          const productSubDomains = [
            '商品基础信息', '商品分类信息', '商品库存信息', '商品价格信息',
            '商品促销信息', '商品评价信息', '商品推荐信息', '商品生命周期'
          ];
          filtered = filtered.filter(asset => 
            asset.businessDomain === domain || 
            productSubDomains.includes(asset.businessDomain)
          );
        } else if (selectedKey === 'marketing-center') {
          // 营销中心：包含主业务域和所有子分类
          const marketingSubDomains = [
            '营销活动信息', '营销渠道数据', '营销客户分群', '营销内容数据',
            '营销效果数据', '营销自动化', '营销线索数据', '营销预算数据'
          ];
          filtered = filtered.filter(asset => 
            asset.businessDomain === domain || 
            marketingSubDomains.includes(asset.businessDomain)
          );
        } else if (selectedKey === 'finance-center') {
          // 财务中心：包含主业务域和所有子分类
          const financeSubDomains = [
            '财务账户信息', '财务交易数据', '财务预算数据', '财务成本数据',
            '财务收入数据', '财务税务数据', '财务审计数据', '财务风险评估',
            '财务报表数据', '财务现金流'
          ];
          filtered = filtered.filter(asset => 
            asset.businessDomain === domain || 
            financeSubDomains.includes(asset.businessDomain)
          );
        } else {
          // 其他业务域的正常过滤
          filtered = filtered.filter(asset => asset.businessDomain === domain);
        }
      } else if (subDomainTagMap[selectedKey]) {
        // 三级业务域子分类标签过滤
        const targetTag = subDomainTagMap[selectedKey];
        filtered = filtered.filter(asset => 
          asset.businessDomain === targetTag || 
          asset.tags.some(tag => tag.includes(targetTag))
        );
      } else if (dataLayerTagMap[selectedKey]) {
        // 数据层级标签过滤
        const targetTags = dataLayerTagMap[selectedKey];
        
        // 为数据层级添加特殊处理，包含其子分类资产
        if (selectedKey === 'ods') {
          // ODS层：包含所有ODS相关的子分类
          const odsSubTags = [
            'ods-user', 'ods-order', 'ods-product', 'ods-payment', 'ods-logistics',
            'ods-marketing', 'ods-finance', 'ods-supply', 'ods-service', 'ods-external'
          ];
          filtered = filtered.filter(asset => 
            asset.tags.some(tag => targetTags.some(targetTag => tag.includes(targetTag))) ||
            asset.tags.some(tag => odsSubTags.some(subTag => tag.includes(subTag)))
          );
        } else if (selectedKey === 'dwd') {
          // DWD层：包含所有DWD相关的子分类
          const dwdSubTags = [
            'dwd-user', 'dwd-order', 'dwd-product', 'dwd-payment', 'dwd-logistics',
            'dwd-marketing', 'dwd-finance', 'dwd-supply', 'dwd-service', 'dwd-traffic'
          ];
          filtered = filtered.filter(asset => 
            asset.tags.some(tag => targetTags.some(targetTag => tag.includes(targetTag))) ||
            asset.tags.some(tag => dwdSubTags.some(subTag => tag.includes(subTag)))
          );
        } else if (selectedKey === 'dws') {
          // DWS层：包含所有DWS相关的子分类
          const dwsSubTags = [
            'dws-user', 'dws-order', 'dws-product', 'dws-payment', 'dws-logistics',
            'dws-marketing', 'dws-finance', 'dws-supply', 'dws-service', 'dws-traffic'
          ];
          filtered = filtered.filter(asset => 
            asset.tags.some(tag => targetTags.some(targetTag => tag.includes(targetTag))) ||
            asset.tags.some(tag => dwsSubTags.some(subTag => tag.includes(subTag)))
          );
        } else if (selectedKey === 'ads') {
          // ADS层：包含所有ADS相关的子分类
          const adsSubTags = [
            'ads-user', 'ads-order', 'ads-product', 'ads-payment', 'ads-logistics',
            'ads-marketing', 'ads-finance', 'ads-supply', 'ads-service', 'ads-business'
          ];
          filtered = filtered.filter(asset => 
            asset.tags.some(tag => targetTags.some(targetTag => tag.includes(targetTag))) ||
            asset.tags.some(tag => adsSubTags.some(subTag => tag.includes(subTag)))
          );
        } else {
          // 其他数据层级的正常过滤
          filtered = filtered.filter(asset => 
            asset.tags.some(tag => targetTags.some(targetTag => tag.includes(targetTag)))
          );
        }
      } else if (['table', 'view', 'file', 'api'].includes(selectedKey)) {
        // 数据类型过滤
        filtered = filtered.filter(asset => asset.type === selectedKey);
      }
    }

    // 其他筛选条件
    if (filters.status.length > 0) {
      filtered = filtered.filter(asset => filters.status.includes(asset.status));
    }
    if (filters.type.length > 0) {
      filtered = filtered.filter(asset => filters.type.includes(asset.type));
    }

    setFilteredAssets(filtered);
    setTotal(filtered.length);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  /**
   * 处理树形菜单选择事件
   * 支持三级菜单的业务域分类标签和数据资产关联
   * @param selectedKeys 选中的菜单项key数组
   */
  const handleTreeSelect = (selectedKeys: React.Key[]) => {
    const keys = selectedKeys as string[];
    setSelectedKeys(keys);
    setCurrentPage(1);
    
    // 如果选中了具体的三级菜单项，自动展开对应的父级菜单
    if (keys.length > 0) {
      const selectedKey = keys[0];
      const newExpandedKeys = [...expandedKeys];
      
      // 根据选中的key确定需要展开的父级菜单
      if (selectedKey.includes('-')) {
        const parts = selectedKey.split('-');
        if (parts.length >= 2) {
          // 展开一级菜单
          const parentKey = parts[0] + '-' + parts[1];
          if (!newExpandedKeys.includes(parentKey)) {
            newExpandedKeys.push(parentKey);
          }
          
          // 展开顶级菜单
          const topLevelKeys = ['business-domains', 'data-layers', 'data-types'];
          topLevelKeys.forEach(key => {
            if (!newExpandedKeys.includes(key)) {
              newExpandedKeys.push(key);
            }
          });
        }
      }
      
      setExpandedKeys(newExpandedKeys);
    }
  };

  const handleViewDetail = (id: string) => {
    // 跳转到详情页
    navigate(`/data-assets/detail/${id}`);
  };

  const handleFavorite = (id: string) => {
    message.success('已添加到收藏');
  };

  const handleMore = (id: string) => {
    // 显示更多操作菜单
    console.log('更多操作:', id);
  };

  const handleRefresh = () => {
    loadDataAssets();
  };

  const handleResetFilters = () => {
    setSearchText('');
    setSelectedKeys([]);
    setFilters({
      status: [],
      type: [],
      businessDomain: [],
      healthScore: [0, 100],
      dateRange: null
    });
    setCurrentPage(1);
  };

  const paginatedAssets = filteredAssets.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="data-assets-page">
      <Layout style={{ background: '#fff' }}>
        {/* 左侧分类导航树 */}
        <Sider width={280} style={{ background: '#fafafa', padding: '16px 0' }}>
          <div style={{ padding: '0 16px', marginBottom: 16 }}>
            <Search
              placeholder="搜索分类"
              allowClear
              style={{ marginBottom: 16 }}
            />
          </div>
          <Tree
            showIcon
            defaultExpandedKeys={expandedKeys}
            selectedKeys={selectedKeys}
            onSelect={handleTreeSelect}
            treeData={treeData}
            style={{ padding: '0 16px' }}
          />
        </Sider>

        {/* 右侧内容区 */}
        <Content style={{ padding: '0 24px' }}>
          {/* 搜索和筛选区 */}
          <Card style={{ marginBottom: 16 }}>
            <Row gutter={16} align="middle">
              <Col flex="auto">
                <Search
                  placeholder="搜索数据资产名称或描述"
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                  onSearch={handleSearch}
                  style={{ maxWidth: 400 }}
                />
              </Col>
              <Col>
                <Space>
                  <Select
                    mode="multiple"
                    placeholder="状态"
                    style={{ minWidth: 120 }}
                    value={filters.status}
                    onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                  >
                    <Option value="active">活跃</Option>
                    <Option value="inactive">非活跃</Option>
                    <Option value="deprecated">已废弃</Option>
                  </Select>
                  <Select
                    mode="multiple"
                    placeholder="类型"
                    style={{ minWidth: 120 }}
                    value={filters.type}
                    onChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                  >
                    <Option value="table">表</Option>
                    <Option value="view">视图</Option>
                    <Option value="file">文件</Option>
                    <Option value="api">API</Option>
                  </Select>
                  <Button icon={<FilterOutlined />}>高级筛选</Button>
                  <Button icon={<ReloadOutlined />} onClick={handleRefresh}>刷新</Button>
                  <Button onClick={handleResetFilters}>重置</Button>
                </Space>
              </Col>
            </Row>
            
            {/* 筛选条件标签 */}
            {(searchText || selectedKeys.length > 0 || filters.status.length > 0 || filters.type.length > 0) && (
              <div style={{ marginTop: 16 }}>
                <Space wrap>
                  {searchText && (
                    <Tag closable onClose={() => setSearchText('')}>
                      搜索: {searchText}
                    </Tag>
                  )}
                  {selectedKeys.map(key => (
                    <Tag key={key} closable onClose={() => setSelectedKeys([])}>
                      分类: {key}
                    </Tag>
                  ))}
                  {filters.status.map(status => (
                    <Tag key={status} closable onClose={() => 
                      setFilters(prev => ({ ...prev, status: prev.status.filter(s => s !== status) }))
                    }>
                      状态: {status}
                    </Tag>
                  ))}
                  {filters.type.map(type => (
                    <Tag key={type} closable onClose={() => 
                      setFilters(prev => ({ ...prev, type: prev.type.filter(t => t !== type) }))
                    }>
                      类型: {type}
                    </Tag>
                  ))}
                </Space>
              </div>
            )}
          </Card>

          {/* 数据资产列表 */}
          <Card>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>共找到 {total} 个数据资产</span>
              <Space>
                <span>每页显示:</span>
                <Select
                  value={pageSize}
                  onChange={setPageSize}
                  style={{ width: 80 }}
                >
                  <Option value={10}>10</Option>
                  <Option value={20}>20</Option>
                  <Option value={50}>50</Option>
                  <Option value={100}>100</Option>
                </Select>
              </Space>
            </div>
            
            <Table
              columns={columns}
              dataSource={paginatedAssets}
              rowKey="id"
              loading={loading}
              pagination={false}
              scroll={{ x: 1200 }}
              size="middle"
              rowClassName={(record, index) => index % 2 === 0 ? 'table-row-even' : 'table-row-odd'}
              onRow={(record) => ({
                onClick: () => handleViewDetail(record.id),
                style: { cursor: 'pointer' }
              })}
            />
            
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={total}
                showSizeChanger={false}
                showQuickJumper
                showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`}
                onChange={(page) => setCurrentPage(page)}
              />
            </div>
          </Card>
        </Content>
      </Layout>
    </div>
  );
};

export default DataAssetsPage;