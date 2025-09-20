import { useState, useEffect } from 'react';
import {Button, Form, Input, Table, Popconfirm, Modal, InputNumber, DatePicker, Select,message} from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs'

import { useTitle } from '/src/hooks/useTitle';
import { getUserList,createUser,updateUser,deleteUser } from '../../api/user';
import "./index.css";

const User = () => {
    const [messageAPI,contextHolder] = message.useMessage();
    const [userList, setUserList] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formsearch] = Form.useForm();
    const [userForm] = Form.useForm();
    const { setTitle } = useTitle();
    const columns = [
        {
            key: 'name',
            title: '姓名',
            dataIndex: 'name',
        },
        {
            key: 'birth',
            title: '出生日期',
            dataIndex: 'birth',
        },
        {
            key: 'age',
            title: '年龄',
            dataIndex: 'age',
        },
        {
            key: 'addr',
            title: '地址',
            dataIndex: 'addr',
        },
        {
            key: 'sex',
            title: '性别',
            dataIndex: 'sex',
        },
        {
            key: 'operation',
            title: '操作',
            render: (_, record) => (
                <>
                    <Button type="link" onClick={() => handleClick("edit", record)}>编辑</Button>
                     <Popconfirm
                        title="删除用户"
                        description="确定要删除此用户吗？"
                        onConfirm={() => handleDelete( record)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <DeleteOutlined />
                    </Popconfirm>
                </>
            ),
        }
    ];
    const setUsersState = () =>{
        getUserList().then(res => {
            const list = res.list.map((item) => ({
                    key: item.id,
                    name: item.name,
                    birth: item.birth,
                    age: item.age,
                    addr: item.addr,
                    sex: item.sex ? '男' : '女',
            }));
            setUserList(list);
        });
    }
    const handleClick = (action, record) => {
        setIsModalOpen(true);
        if( action ==='add' ){
            setIsEdit(false);
        }else if( action === 'edit' ){
            setIsEdit(true);
            userForm.setFieldsValue(
                {
                    ...record,
                    birth: dayjs(record.birth),
                });
        }
    };
    const handleSearch = () => {
        const values = formsearch.getFieldsValue().keyword;
        const arr = userList.filter(item => item.name.includes(values) || item.addr.includes(values));
        setUserList(arr);
    };
    const handleDelete = ({key}) => {
        deleteUser({ id: key }).then(() => {
            setUsersState();
        });
    };
    const onFinish = (values) => {
        console.log('Success:', values);
    }
    const handleOk = () => {
        userForm.validateFields().then(() => {
            const user = {
                ...userForm.getFieldValue(),
                birth: userForm.getFieldValue('birth').format('YYYY-MM-DD'),
            }
            if(isEdit){
                user.id = userForm.getFieldValue('key');
                updateUser(user).then(() => {
                    userForm.resetFields();
                    setUsersState();
                    setIsModalOpen(false);
                });
            }else{
                createUser(user).then(() => {
                    userForm.resetFields();
                    setUsersState();
                    setIsModalOpen(false);
                });
            }

        }).catch((err) => {
            messageAPI.error("Validation failed:", err);
            return
        });
        
    };
    const handleCancel = () => {
        setIsModalOpen(false);
        userForm.resetFields();
    };
    useEffect(() => {
        setUsersState();
        setTitle("用户管理");
    },[])
    return (
        <div>
            {contextHolder}
            <div className='header'>
                <Button type='primary' onClick={() => handleClick("add")}>新增</Button>
                <Form
                    form={formsearch}
                    layout="inline"
                    onFinish={onFinish}
                    autoComplete="off"
                    >
                    <Form.Item
                        name="keyword"
                        rules={[{ required: true }, { type: 'string', max: 6 }]}
                        style={{display: "flex"}}
                        >
                        <Input placeholder="请输入关键字" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" onClick={() => handleSearch()}>查询</Button>
                    </Form.Item>
                </Form>
            </div>
            {userList.length > 0 && <Table dataSource={userList} columns={columns} />}
            <Modal
                title={isEdit ? "编辑用户" : "新增用户"}
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalOpen}
                onOk={handleOk}
                okText="确定"
                onCancel={handleCancel}
                cancelText="取消"
            >
                <Form
                    form={userForm}
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 20 }}
                    labelAlign='left'
                    // initialValues={{ remember: true }}
                    autoComplete="off"
                >
                    <Form.Item
                    label="姓名"
                    name="name"
                    rules={[{ required: true, message: '请输入姓名!' }]}
                    >
                        <Input placeholder='请输入姓名'/>
                    </Form.Item>

                    <Form.Item
                    label="性别"
                    name="sex"
                    initialValue={1}
                    rules={[{ required: true, message: '请输入性别!' }]}
                    >
                        <Select 
                            options={[
                                { label: '男', value: 1 },
                                { label: '女', value: 0 },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                    label="年纪"
                    name="age"
                    rules={[{ required: true, message: '请输入年纪!' }]}
                    >
                        <InputNumber placeholder='请输入年纪'/>
                    </Form.Item>

                    <Form.Item
                    name="birth"
                    label="出生日期"
                    rules={[{ required: true, message: '请输入出生日期!' }]}
                    >
                        <DatePicker placeholder='请选择出生日期'/>
                    </Form.Item>

                    <Form.Item
                    name="addr"
                    label="地址"
                    rules={[{ required: true, message: '请输入地址!' }]}
                    >
                        <Input placeholder='请输入地址'/>
                    </Form.Item>
                    {isEdit && <Form.Item
                    name="key"
                    hidden
                    >
                        <Input />
                    </Form.Item>}
                </Form>
            </Modal>

        </div>
    )
}

export default User;
