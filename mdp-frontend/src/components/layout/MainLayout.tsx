/**
 * 主布局组件
 * 包含侧边栏、头部和内容区域
 */

import React from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAppSelector } from '../../store';
import { selectSidebarState } from '../../store/slices/uiSlice';

const { Content } = Layout;

/**
 * 主布局组件
 */
const MainLayout: React.FC = () => {
  const sidebarState = useAppSelector(selectSidebarState);
  const isCollapsed = sidebarState === 'collapsed';
  const sidebarWidth = isCollapsed ? 80 : 256;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={isCollapsed} />
      <Layout
        style={{
          marginLeft: sidebarWidth,
          transition: 'margin-left 0.2s',
        }}
      >
        <Header />
        <Content
          style={{
            margin: '16px',
            padding: '24px',
            background: '#f0f2f5',
            minHeight: 'calc(100vh - 112px)',
            overflow: 'auto',
          }}
        >
          <div
            style={{
              background: '#fff',
              padding: '24px',
              borderRadius: '8px',
              minHeight: '100%',
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;