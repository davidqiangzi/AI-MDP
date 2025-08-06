/**
 * UI状态管理slice
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

// 面包屑项接口
interface BreadcrumbItem {
  key: string;
  label: string;
  path: string;
}

// UI状态接口
interface UIState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  breadcrumbs: BreadcrumbItem[];
  activeMenuKey: string;
}

// 初始状态
const initialState: UIState = {
  sidebarCollapsed: false,
  theme: 'light',
  breadcrumbs: [],
  activeMenuKey: 'dashboard',
};

/**
 * UI状态slice
 */
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    /**
     * 切换侧边栏折叠状态
     */
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    /**
     * 设置主题
     */
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    /**
     * 设置面包屑
     */
    setBreadcrumbs: (state, action: PayloadAction<BreadcrumbItem[]>) => {
      state.breadcrumbs = action.payload;
    },
    /**
     * 设置活动菜单项
     */
    setActiveMenuKey: (state, action: PayloadAction<string>) => {
      state.activeMenuKey = action.payload;
    },
  },
});

// 导出actions
export const { toggleSidebar, setTheme, setBreadcrumbs, setActiveMenuKey } = uiSlice.actions;

// 选择器
export const selectSidebarState = (state: RootState) => 
  state.ui.sidebarCollapsed ? 'collapsed' : 'expanded';
export const selectTheme = (state: RootState) => state.ui.theme;
export const selectBreadcrumbs = (state: RootState) => state.ui.breadcrumbs;
export const selectActiveMenuKey = (state: RootState) => state.ui.activeMenuKey;

export default uiSlice.reducer;