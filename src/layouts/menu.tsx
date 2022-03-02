import { HomeOutlined, EyeOutlined } from '@ant-design/icons';
export const menu = [
  {
    title: '首页',
    key: '/',
    icon: <HomeOutlined />,
  },
  {
    title: '二次审核',
    key: '/main/result',
    icon: <EyeOutlined />,
  },
  {
    title: '困难样本',
    key: '/main/result_difficult',
    icon: <EyeOutlined />,
  },
  {
    title: '数据监测',
    key: '/monitor',
    icon: <EyeOutlined />,
  },
  {
    title: '实物审核',
    icon: <EyeOutlined />,
    key: 'real',
    data: [
      {
        title: '实物审核',
        key: '/monitor/analysis',
        icon: <EyeOutlined />,
      },
      {
        title: '实物审核结果',
        key: '/monitor/analysis/result',
        icon: <EyeOutlined />,
      },
    ],
  },
  {
    title: '缺陷类型分类',
    icon: <EyeOutlined />,
    key: 'img_class',
    data: [
      {
        title: '类型标记',
        key: '/img_class/label',
        icon: <EyeOutlined />,
      },
      {
        title: '标记审核',
        key: '/img_class/result',
        icon: <EyeOutlined />,
      },
    ],
  },
];
