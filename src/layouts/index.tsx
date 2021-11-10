import Footer from './Footer';
import './index.less';
import { Layout, Menu, BackTop } from 'antd';
import { menu as menuData } from './menu';
import { Link } from 'umi';

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
              <Menu.Item key={item.key} icon={item.icon}>
                <Link to={item.key}>{item.title}</Link>
              </Menu.Item>
            );
          })}
        </Menu>
      </Header>
      <Content style={{ padding: '0 20px' }}>{children}</Content>
      <Footer />
      <BackTop />
    </Layout>
  );
};

export default LayoutWrapper;
