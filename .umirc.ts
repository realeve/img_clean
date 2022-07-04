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
  // targets: {
  //   chrome: 70,
  //   firefox: false,
  //   safari: false,
  //   edge: false,
  //   ios: false,
  // },
  targets: {
    ie: 11,
    chrome: 49,
    firefox: 45,
    safari: 10,
    edge: 13,
    ios: 10,
  },
  fastRefresh: {},
});
