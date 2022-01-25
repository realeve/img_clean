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
        title: '数据监测判废',
      },
    ],
  },
];
