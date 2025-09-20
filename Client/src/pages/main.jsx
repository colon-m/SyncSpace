import React, { useState } from 'react';
import { Outlet } from "react-router";
import { Layout, theme } from 'antd';

import CommonSider from '../components/commonSider';
import CommenHeader from '../components/commenHeader';
import CommonTags from '../components/commenTags';
import Auth from '../router/auth';

const { Content } = Layout;

const Main = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (

    <Auth>
      <Layout className="main-container">
          <CommonSider collapsed={collapsed} />
          <Layout>
            <CommenHeader colorBgContainer={colorBgContainer}  collapsed={collapsed} setCollapsed={setCollapsed} />
            <CommonTags />
          <Content
            style={{
              margin: '24px 16px',
              padding: 24,
              marginTop: 0,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Auth>
  );
};

export default Main;
