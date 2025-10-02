import { defineConfig } from '@umijs/max';
import { codeInspectorPlugin } from 'code-inspector-plugin';

export default defineConfig({
  base: '/docker-compose-builder/dist/',
  publicPath: '/docker-compose-builder/dist/',
  chainWebpack(memo) {
    memo.plugin('code-inspector-plugin').use(
      codeInspectorPlugin({
        bundler: 'webpack',
      }),
    );
  },
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: '@umijs/max',
    layout: 'top',
    navTheme: 'light',
    contentWidth: 'Fluid',
    fixedHeader: true,
    headerHeight: 64,
    splitMenus: false,
  },
  routes: [
    {
      name: 'X6 图编辑引擎',
      path: '/',
      component: './X6Demo',
      menuRender: false,
      menuHeaderRender: false,
      hideInMenu: true,
      headerRender: false,
    },
  ],
  npmClient: 'pnpm',
});
