import Footer from './Footer';
import './index.less';
import { Layout, Menu } from 'antd';
import { menu as menuData } from './menu';
import { HomeOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;

const LayoutWrapper = ({ children }: { children?: React.ReactNode }) => {
  return (
    <Layout className="layout">
      <Header>
        <div className="logo">图像核查数据标记</div>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['/home']}
          style={{ width: '100%' }}
        >
          {menuData.map((item) => {
            return (
              <Menu.Item key={item.key} icon={<HomeOutlined />}>
                {item.title}
              </Menu.Item>
            );
          })}
        </Menu>
      </Header>
      <Content style={{ padding: '0 50px' }}>{children}</Content>
      <Footer />
    </Layout>
  );
};

export default LayoutWrapper;
