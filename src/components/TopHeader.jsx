import React, { useState, useEffect } from 'react';
import { Layout, Menu, Modal, Form, Input, Button, Drawer, message, Avatar, Dropdown } from 'antd';
import './TopHeader.css';
import { UserOutlined, LoginOutlined } from '@ant-design/icons'; 
import axios from 'axios';
import Cookies from 'js-cookie';

const { Header } = Layout;
const { Item } = Menu;
const { useForm } = Form;

export default function TopHeader() {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [form] = useForm();
    const [mode, setMode] = useState('signin');
    const [loggedInUser, setLoggedInUser] = useState(null); // State to hold logged in user details
    const [dropdownVisible, setDropdownVisible] = useState(false); // State to manage dropdown visibility
    const [token, setToken] = useState(Cookies.get('token') || '');

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setLoggedInUser(user.Username);
        }
    }, []); 

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleOk = () => {
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const onFinish = (values) => {
        const { username, password, email } = values;
        if (mode === 'register') {
            const postData = {
                UserName: username,
                Password: password,
                Email: email,
                IsAdmin: false
            };
    
            axios.post('https://carrentalsystem-backend.azurewebsites.net/api/Auth/register', postData)
                .then(response => {
                    console.log('Response:', response.data); 
                    message.success('Register successful, please login');
                })
                .catch(error => {
                    console.error('Error:', error);
                    message.error('Failed to register, please try again later');
                });
            handleOk();   
            return;
        }

        const postData = {
            Password: password,
            Email: email,
        };

        axios.post('https://carrentalsystem-backend.azurewebsites.net/api/Auth/login', postData)
            .then(response => {
                console.log('Response:', response.data); 
                if (response.data.Message === 'Login successful') {  
                    // 设置token                  
                    const authToken = response.data.Token;
                    Cookies.set('token', authToken, { expires: 7, path: '/' }); 
                    setToken(authToken); 
                    
                    // 保存user
                    localStorage.setItem('user',JSON.stringify(response.data.user));
                    setLoggedInUser(response.data.user.Username); 

                    message.success('Sign in successful');
                } else {
                    message.error('Failed to sign in, the email or password not correct, please try again later');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                message.error('Failed to sign in, the email or password not correct, please try again later');
            });
        
        handleOk();
    };

    const switchMode = (newMode) => {
        setMode(newMode);
        form.resetFields(); 
    };

    const showDrawer = () => {
        setIsDrawerVisible(true);
    };

    const onCloseDrawer = () => {
        setIsDrawerVisible(false);
    };

    const emailValidator = (_, value) => {

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) {
            return Promise.reject('Please enter a valid email address (e.g., example@domain.com)');
        }
        return Promise.resolve();
    };

    const passwordValidator = (_, value) => {
        if (value && value.length < 8) {
            return Promise.reject('The input must be at least 8 characters');
        }
        return Promise.resolve();
    };

    const usernameValidator = (_, value) => {
        if (value && value.length < 3) {
            return Promise.reject('The input must be at least 3 characters');
        }
        return Promise.resolve();
    };

    const handleLogout = () => {
        // 移除user
        localStorage.removeItem('user'); 
        setLoggedInUser(null); 
        // 移除token
        Cookies.remove('token'); 
        setToken('');
        message.success('Logged out successfully');
    };

    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible);
    };

    const menu = (
        <Menu>
            <Menu.Item style={{ padding: '8px 16px', borderBottom: '1px solid #f0f0f0', backgroundColor: '#fafafa' }}>
                <span style={{ fontWeight: 'bold' }}>Welcome: {loggedInUser}</span>
            </Menu.Item>
            <Menu.Item
                style={{
                    padding: '8px 16px',
                    cursor: 'pointer',
                    backgroundColor: '#fafafa',
                    color: '#f5222d',
                    fontWeight: 'bold',
                }}
                onClick={handleLogout}
            >
                Logout
            </Menu.Item>
        </Menu>

    );

    return (
        <Header className="app-header">
            <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']} className="menu">
                <Menu.Item key="1" className="menu-item">  
                    <span className="bold-italic">DriveWise Rentals</span>
                </Menu.Item>
            </Menu>

            <div className="sign-in" onClick={showDrawer} style={{ marginRight: 16 }}>
                <span>Contact us</span>
            </div>
        
            {loggedInUser ? (
                 <div style={{ textAlign: 'center' }}>
                    <Dropdown overlay={menu} trigger={['click']} visible={dropdownVisible} onVisibleChange={setDropdownVisible}>
                        <div className="user-profile" onClick={toggleDropdown} style={{ display: 'inline-block' }}>
                            <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
                        </div>
                    </Dropdown>
                 </div>
            ) : (
                <div className="sign-in" onClick={showModal}>
                    <LoginOutlined style={{ marginRight: 8 }} />
                    <span>Sign In</span>
                </div>
            )}

            <Modal
                title={null}
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                style={{ maxWidth: 400 }}
            >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                    <Button type={mode === 'signin' ? 'primary' : 'default'} onClick={() => switchMode('signin')} style={{ marginRight: 10 }}>
                        Sign In
                    </Button>
                    <Button type={mode === 'register' ? 'primary' : 'default'} onClick={() => switchMode('register')}>
                        Register
                    </Button>
                </div>
                
                <Form form={form} onFinish={onFinish}>
                    {mode === 'register' && (
                        <Form.Item name="username" rules={[
                            { required: true, message: 'Please input your username!' },
                            { validator: usernameValidator }
                        ]}>
                            <Input placeholder="Username" />
                        </Form.Item>
                    )}
                 
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Please input your email!' },
                            { validator: emailValidator }
                        ]}
                    >
                        <Input placeholder="Email" />
                    </Form.Item>

                    <Form.Item name="password" rules={[
                        { required: true, message: 'Please input your password!' },
                        { validator: passwordValidator }
                    ]}>
                        <Input.Password placeholder="Password" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            {mode === 'signin' ? 'Sign In' : 'Register'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Drawer
                title="Contact Information"
                placement="right"
                closable={true}
                onClose={onCloseDrawer}
                visible={isDrawerVisible}
                width={400}
                style={{ backdropFilter: 'blur(10px)', background: 'rgba(255, 255, 255, 0.8)' }}
            >
                <div className="contact-info">
                    <p><strong>Email:</strong> example@example.com</p>
                    <p><strong>Phone:</strong> +1234567890</p>
                    <p><strong>Address:</strong> 123 DriveWise Street, City, Country</p>
                    <p style={{ marginTop: 20, fontSize: 14 }}>For inquiries and support, please contact us via the provided information.</p>
                </div>
            </Drawer>
        </Header>
    );
}
