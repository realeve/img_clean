export const systemName = '图像核查数据清洗';
export const routes = [
  {
    path: '/',
    component: '@/layouts/',
    routes: [
      { path: '/', component: '@/pages/index', title: '数据标记' },
      {
        path: '/main/result',
        component: '@/pages/index/result',
        title: '标记结果',
      },
      {
        path: '/main/result_difficult',
        component: '@/pages/index/result_difficult',
        title: '困难样本',
      },
      {
        path: '/monitor',
        component: '@/pages/monitor/index',
        title: '数据监测',
      },
      {
        path: '/monitor/judge',
        component: '@/pages/monitor/judge',
        title: '数据监测判废',
      },
      {
        path: '/monitor/checklist',
        component: '@/pages/monitor/checklist',
        title: 'AI判废补充剔废单',
      },
      {
        path: '/monitor/analysis',
        component: '@/pages/monitor/analysis',
        title: '实物审核',
      },
      {
        path: '/monitor/analysis/result',
        component: '@/pages/monitor/analysis_result',
        title: '实物审核',
      },
      {
        path: '/img_class/label',
        component: '@/pages/img_class/label',
        title: '缺陷类型分类标记',
      },

      {
        path: '/img_class/labelAI',
        component: '@/pages/img_class/labelAI',
        title: '缺陷类型分类标记确认',
      },

      {
        path: '/img_class/result',
        component: '@/pages/img_class/result',
        title: '分类标记审核',
      },
      {
        path: '/img_class/demo',
        component: '@/pages/img_class/demo',
        title: '分类结果示例',
      },
    ],
  },
];
