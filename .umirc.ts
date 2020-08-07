import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  base: '/frontend/',
  publicPath: '/frontend/',
  history: {
    type: 'hash',
  },
  routes: [
    {
      path: '/',
      component: '@/layouts/index',
      routes: [
        { path: '/test', component: '@/pages/test' },
        { path: '/pie', component: '@/pages/component/pie' },

        { path: '/task', component: '@/pages/task/index' },
        { path: '/task/create_edit', component: '@/pages/task/create_edit' },

        { path: '/script', component: '@/pages/script/index' },
        {
          path: '/script/create_edit',
          component: '@/pages/script/create_edit',
        },
      ],
    },
  ],
});
