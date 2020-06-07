import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    {
      path: '/',
      component: '@/layouts/index',
      routes:[
        {path: '/test', component: '@/pages/test'},
        {path: '/task', component: '@/pages/task/index'},
        {path: '/script', component: '@/pages/script/index'},
        {path: '/script/create_edit', component: '@/pages/script/create_edit'}
      ] },
  ],
});
