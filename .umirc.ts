import { defineConfig } from 'umi';

import { routes } from './config/routes';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  hash: true,
  exportStatic: { htmlSuffix: false },
  mfsu: {},
  routes,
  targets: {
    chrome: 70,
    firefox: false,
    safari: false,
    edge: false,
    ios: false,
  },
  fastRefresh: {},
});
