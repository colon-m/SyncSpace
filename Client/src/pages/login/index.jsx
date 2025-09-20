import React from "react";
import { useNavigate } from "react-router";
import {Form, Input, message, Button} from "antd";

import { useUser } from "/src/hooks/useUser";
import {login} from "../../api/login";
import './index.css';

const Login = ()=>{
    const [messageAPI,contextHolder] = message.useMessage();
    const { setUser } = useUser();
    const navigate = useNavigate();
    const handleOk = async (val) => {
        if (!val.userName || !val.password) {
            messageAPI.error("请填写所有字段!");
            return;
        }else{
            const res = await login(val);
            if (res instanceof Error) {
                messageAPI.error(res.message);
            } else {
                localStorage.setItem(`val.${val.userName}_token`, res.token);
                setUser({ userName: val.userName, avatar: `/src/assets/images/${val.userName}.png` });
                console.log("/重定向前")
                navigate('/',{ replaced:true})
            }
        }
    };
    return (
        <div className="login-container">
            {contextHolder}
            
            <Form
                className="login-form"
                onFinish={handleOk}
            >
                <h2>登录</h2>
                <Form.Item
                    name="userName"
                    style={{width: "100%"}}
                    rules={[{ required: true, message: "请输入姓名!" }]}
                >
                    <Input placeholder="姓名" />
                </Form.Item>
                <Form.Item
                    name="password"
                    style={{width: "100%"}}
                    rules={[{ required: true, message: "请输入密码!" }]}
                >
                    <Input.Password placeholder="密码" />
                </Form.Item>
                <Form.Item
                    style={{margin: 0}}
                >
                    <Button type="primary" htmlType="submit">登录</Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default Login;