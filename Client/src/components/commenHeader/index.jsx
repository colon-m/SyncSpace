import React from 'react';
import { useNavigate } from 'react-router';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Button, Layout, Avatar, Dropdown } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';

import { useUser } from '/src/hooks/useUser';
import { useTitle } from '/src/hooks/useTitle';
import "./index.css";

const { Header } = Layout;

const CommenHeader = ({colorBgContainer, collapsed, setCollapsed}) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { title } = useTitle();
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  }
  const items = [
  {
    key: '1',
    label: (
      <a target="_self">
        个人中心
      </a>
    ),
  },
  {
    key: '2',
    label: (
      <a target="_self" onClick={logout} href="">
        退出
      </a>
    ),
    icon: <LogoutOutlined />
  }
  ];
  return (
    <Header className='header-container' style={{ padding: 0, background: colorBgContainer }}>
        <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        style={{
            fontSize: '16px',
            width: 64,
            height: 64,
        }}
        />
        <div className='header-title'>{title}</div>
      <Dropdown menu={{ items }} trigger={['click']}>
          <Avatar className="avatar" src={user?.avatar} />
      </Dropdown>
    </Header>
  );
};

export default CommenHeader;
