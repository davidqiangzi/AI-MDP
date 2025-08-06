/**
 * 头部组件
 * 包含折叠按钮、面包屑和用户信息
 */

import React from 'react';
import { Layout, Button, Breadcrumb, Dropdown, Avatar, Space } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../store';
import { toggleSidebar, selectBreadcrumbs } from '../../store/slices/uiSlice';

const { Header: AntHeader } = Layout;

/**
 * 头部组件
 */
const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const breadcrumbs = useAppSelector(selectBreadcrumbs);
  const sidebarCollapsed = useAppSelector(state => state.ui.sidebarCollapsed);

  /**
   * 切换侧边栏折叠状态
   */
  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  /**
   * 用户下拉菜单项
   */
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  /**
   * 处理用户菜单点击
   */
  const handleUserMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'profile':
        console.log('查看个人信息');
        break;
      case 'settings':
        console.log('打开设置');
        break;
      case 'logout':
        console.log('退出登录');
        break;
      default:
        break;
    }
  };

  return (
    <AntHeader
      style={{
        padding: '0 24px',
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button
          type="text"
          icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={handleToggleSidebar}
          style={{
            fontSize: '16px',
            width: 64,
            height: 64,
          }}
        />
        {breadcrumbs.length > 0 && (
          <Breadcrumb
            style={{ marginLeft: '16px' }}
            items={breadcrumbs.map(item => ({
              title: item.label,
              href: item.path,
            }))}
          />
        )}
      </div>

      <div>
        <Dropdown
          menu={{
            items: userMenuItems,
            onClick: handleUserMenuClick,
          }}
          placement="bottomRight"
          arrow
        >
          <Space style={{ cursor: 'pointer' }}>
            <Avatar icon={<UserOutlined />} />
            <span>管理员</span>
          </Space>
        </Dropdown>
      </div>
    </AntHeader>
  );
};

export default Header;