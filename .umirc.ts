import { defineConfig } from 'umi';

import { routes } from './config/routes';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  mfsu: {},
  routes,
  fastRefresh: {},
});
