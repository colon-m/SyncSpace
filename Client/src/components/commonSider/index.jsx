import React,{ useEffect,useState } from "react";
import { useNavigate,useLocation } from "react-router";
import { useDispatch } from "react-redux";
import { Layout, Menu  } from 'antd';
import * as Icons from '@ant-design/icons';

import { selectTag } from "../../store/reducers/tag";
import {sideBarItems} from '../../config';

const { Sider } = Layout;

const CommonSider = ({collapsed}) =>{
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const [selectedKeys, setSelectedKeys] = useState([]);
    const items = sideBarItems.map(item => {
        const oneSide = {
            key: item.name,
            icon: React.createElement(Icons[item.icon]),
            label: item.label,
        }
        if(item.children){
            oneSide.children = item.children.map(child => ({
            key: item.name + child.name,
            icon: React.createElement(Icons[child.icon]),
            label: child.label,
            url: child.url,
        }))
        }
        return oneSide;
    });
    const handleClick = (e) => {
        let obj = {}
        const parent = items.find(item => item.key === e.keyPath[e.keyPath.length - 1]);
        obj = {
            name: parent.label,
            path: parent.key,
        };
        if(parent.children) {
            const child = parent.children.find(child => child.key === e.key);
            obj = {
                name: child.label,
                path: child.key,
            };
        }
        dispatch(selectTag(obj));
        navigate(obj.path);
    }
    useEffect(()=>{
        setSelectedKeys([location.pathname]);
    },[location.pathname])
    return(
        <Sider trigger={null} collapsible collapsed={collapsed}>
            <div className="app-name" >Plat</div>
            <Menu
                theme="dark"
                mode="inline"
                selectedKeys={selectedKeys}
                defaultSelectedKeys={['1']}
                style={{ height: '100%' }}
                items={items}
                onClick={handleClick}
            />
        </Sider>
    )
}

export default CommonSider;