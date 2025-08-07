/**
 * 侧边栏组件
 * 包含导航菜单
 */

import React from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  DatabaseOutlined,
  ShareAltOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
  SettingOutlined,
  TableOutlined,
  FieldStringOutlined,
  TagsOutlined,
  NodeIndexOutlined,
  FundProjectionScreenOutlined,
  SearchOutlined,
  FileTextOutlined,
  MonitorOutlined,
  LineChartOutlined,
  UserOutlined,
  TeamOutlined,
  SafetyOutlined,
  AuditOutlined,
  ControlOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { setActiveMenuKey } from '../../store/slices/uiSlice';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

/**
 * 侧边栏组件
 */
const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const activeMenuKey = useAppSelector(state => state.ui.activeMenuKey);

  // 菜单项配置
  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '数据概览',
      path: '/dashboard',
    },
    {
      key: 'data-assets',
      icon: <DatabaseOutlined />,
      label: '数据资产',
      path: '/data-assets',
    },
    {
      key: 'data-management',
      icon: <DatabaseOutlined />,
      label: '数据管理',
      children: [
        {
          key: 'data-catalog',
          icon: <TableOutlined />,
          label: '数据目录',
          path: '/data-catalog',
        },
        {
            key: 'field-management',
            icon: <FieldStringOutlined />,
            label: '字段管理',
            path: '/field-management',
          },
        {
          key: 'metadata',
          icon: <TagsOutlined />,
          label: '元数据',
          path: '/metadata',
        },
      ],
    },
    {
      key: 'lineage',
      icon: <ShareAltOutlined />,
      label: '数据血缘',
      children: [
        {
          key: 'lineage-graph',
          icon: <NodeIndexOutlined />,
          label: '血缘图谱',
          path: '/lineage/graph',
        },
        {
          key: 'lineage-analysis',
          icon: <FundProjectionScreenOutlined />,
          label: '影响分析',
          path: '/lineage/analysis',
        },
        {
          key: 'lineage-tracking',
          icon: <SearchOutlined />,
          label: '血缘追踪',
          path: '/lineage/tracking',
        },
      ],
    },
    {
      key: 'quality',
      icon: <CheckCircleOutlined />,
      label: '数据质量',
      children: [
        {
          key: 'quality-rules',
          icon: <FileTextOutlined />,
          label: '质量规则',
          path: '/quality/rules',
        },
        {
          key: 'quality-reports',
          icon: <BarChartOutlined />,
          label: '质量报告',
          path: '/quality/reports',
        },
        {
          key: 'quality-monitoring',
          icon: <MonitorOutlined />,
          label: '质量监控',
          path: '/quality/monitoring',
        },
        {
          key: 'quality-metrics',
          icon: <LineChartOutlined />,
          label: '质量指标',
          path: '/quality/metrics',
        },
      ],
    },
    {
      key: 'analytics',
      icon: <BarChartOutlined />,
      label: '数据分析',
      children: [
        {
          key: 'analytics-overview',
          icon: <DashboardOutlined />,
          label: '分析概览',
          path: '/analytics/overview',
        },
        {
          key: 'analytics-usage',
          icon: <LineChartOutlined />,
          label: '使用统计',
          path: '/analytics/usage',
        },
        {
          key: 'analytics-trends',
          icon: <BarChartOutlined />,
          label: '趋势分析',
          path: '/analytics/trends',
        },
      ],
    },
    {
      key: 'system',
      icon: <SettingOutlined />,
      label: '系统管理',
      children: [
        {
          key: 'system-users',
          icon: <UserOutlined />,
          label: '用户管理',
          path: '/system/users',
        },
        {
          key: 'system-roles',
          icon: <TeamOutlined />,
          label: '角色管理',
          path: '/system/roles',
        },
        {
          key: 'system-permissions',
          icon: <SafetyOutlined />,
          label: '权限管理',
          path: '/system/permissions',
        },
        {
          key: 'system-logs',
          icon: <AuditOutlined />,
          label: '系统日志',
          path: '/system/logs',
        },
        {
          key: 'system-settings',
          icon: <ControlOutlined />,
          label: '系统设置',
          path: '/system/settings',
        },
      ],
    },
  ];

  /**
   * 处理菜单点击事件
   */
  const handleMenuClick = ({ key }: { key: string }) => {
    // 查找对应的菜单项
    const findMenuItem = (items: any[], targetKey: string): any => {
      for (const item of items) {
        if (item.key === targetKey) {
          return item;
        }
        if (item.children) {
          const found = findMenuItem(item.children, targetKey);
          if (found) return found;
        }
      }
      return null;
    };

    const menuItem = findMenuItem(menuItems, key);
    if (menuItem && menuItem.path) {
      dispatch(setActiveMenuKey(key));
      navigate(menuItem.path);
    }
  };

  /**
   * 根据当前路径获取选中的菜单项
   */
  const getSelectedKeys = () => {
    const path = location.pathname;
    
    // 特殊处理：当访问 /data-assets 时，选中父级菜单而不是子菜单
    if (path === '/data-assets') {
      return ['data-assets'];
    }
    
    const findKeyByPath = (items: any[], targetPath: string): string | null => {
      for (const item of items) {
        if (item.path === targetPath) {
          return item.key;
        }
        if (item.children) {
          const found = findKeyByPath(item.children, targetPath);
          if (found) return found;
        }
      }
      return null;
    };

    const selectedKey = findKeyByPath(menuItems, path);
    return selectedKey ? [selectedKey] : [activeMenuKey];
  };

  /**
   * 获取展开的菜单项
   */
  const getOpenKeys = () => {
    const path = location.pathname;
    const openKeys: string[] = [];
    
    if (path.startsWith('/data-catalog') || path.startsWith('/data-table') || path.startsWith('/metadata') || path.startsWith('/field-management')) {
      openKeys.push('data-management');
    } else if (path.startsWith('/lineage')) {
      openKeys.push('lineage');
    } else if (path.startsWith('/quality')) {
      openKeys.push('quality');
    } else if (path.startsWith('/analytics')) {
      openKeys.push('analytics');
    } else if (path.startsWith('/system')) {
      openKeys.push('system');
    }
    
    return openKeys;
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={256}
      collapsedWidth={80}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1000,
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.15)',
      }}
    >
      <div
        style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: collapsed ? '16px' : '18px',
          fontWeight: 'bold',
          borderBottom: '1px solid #303030',
          background: '#001529',
          transition: 'all 0.2s',
        }}
      >
        {collapsed ? 'MDP' : '元数据管理平台'}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={getSelectedKeys()}
        defaultOpenKeys={getOpenKeys()}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ borderRight: 0 }}
      />
    </Sider>
  );
};

export default Sidebar;