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
];
