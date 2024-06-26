import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spin, Alert, Input, Button, Modal, DatePicker, Form, InputNumber, message } from 'antd';
import axios from 'axios';
import toyota2 from '../images/toyota2.jpg';
import bannerImage from '../images/content_banner.jpg';
import moment from 'moment';
import Cookies from 'js-cookie';
import axiosInstance from '../utils/AxiosInstance';  // 导入自定义的Axios实例


const { Search } = Input;

export default function ContentSection() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        axios.get('https://carrentalsystem-backend.azurewebsites.net/api/Cars/all')
            .then((res) => {
                const availableProducts = res.data.filter(product => product.Available_Now === true);
                setProducts(availableProducts);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching cars:', error);
                setError('Failed to fetch data. Please try again later.');
                setLoading(false);
            });
    }, []);

    const handleSearch = (value) => {
        setSearchTerm(value);
    };

    const filteredProducts = products.filter((product) => {
        return product.Make.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.Model.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (loading) {
        return <Spin size="large" />;
    }

    if (error) {
        return <Alert message={error} type="error" />;
    }

    const handleBook = (productId) => {
        const userStr = localStorage.getItem('user');
        if(!userStr){
          message.error('please login first!');
          return;
        }
        const product = products.find(p => p.Id === productId);
        showModal(product);
    };

    const showModal = (product) => {
        setSelectedProduct(product);
        setIsModalVisible(true);
        form.setFieldsValue({
            carMake: product.Make,
            carModel: product.Model,
            startDate: null, 
            endDate: null, 
            fee: 0,
        });
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleConfirmBooking = (values) => {

        console.log('Booking confirmed with the following details:', values);
        const {id, carMake, carModel, startDate, endDate, fee } = values;
        const userStr = localStorage.getItem('user');
        const user = JSON.parse(userStr);
        const postData = {
            "CarId": id,
            "UserId": user.Id,
            "StartDate": startDate,
            "EndDate": endDate,
            "Fee": fee,
            "CarMake": carMake,
            "CarModel": carModel,
            "Status": 0
        };
        axiosInstance.post('/api/Rentals', postData)
        .then((response) => {
          console.log('Rent successful:', response.data);
          message.success('Rent successful, we will contact you shortly.');
        })
        .catch((error) => {
          console.error('Rent failed:', error);
        });

        handleCancel();
    };

    const calculateFee = (pricePerDay, startDate, endDate) => {
        if (!startDate || !endDate) return 0;

        const date1Str = startDate.format('YYYY-MM-DD');
        const date2Str = endDate.format('YYYY-MM-DD');

        const date1 = new Date(date1Str);
        const date2 = new Date(date2Str);
        const timeDiff = date2.getTime() - date1.getTime();
        
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return daysDiff * pricePerDay;
    };

    const disabledStartDate = (current) => {

        return current && current < moment().startOf('day');
    };

    const disabledEndDate = (current) => {
        const startDate = form.getFieldValue('startDate');

        return current && current <= moment(startDate).startOf('day');
    };

    const handleStartDateChange = (startDate) => {

        const endDate = form.getFieldValue('endDate');     
        const pricePerDay = selectedProduct?.Price_Per_Day || 0;
        const fee = calculateFee(pricePerDay, startDate, endDate);
        form.setFieldsValue({ fee: fee.toFixed(2) });

        if (moment(startDate).isSameOrAfter(moment(endDate))) {
            form.setFieldsValue({ endDate: null });
        }
    };

    const handleEndDateChange = (endDate) => {
   
        const startDate = form.getFieldValue('startDate');
        const pricePerDay = selectedProduct?.Price_Per_Day || 0;
        const fee = calculateFee(pricePerDay, startDate, endDate);
        form.setFieldsValue({ fee: fee.toFixed(2) });
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <div>
            <div style={{ height: '650px', marginBottom: '20px', marginTop: '1px', overflow: 'hidden' }}>
                <img src={bannerImage} alt="Banner" style={{ width: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white', zIndex: '10' }}>
                    <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '5px' }}>NEW ZEALAND CAR HIRE & DRIVING YOUR HOLIDAYS</h1>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '0px', marginBottom: '10px' }}>TAKEPAHI WAHINE MOTUHAKE AOTEAROA & TE TAUTU O Ō KIRIHIMETE</h2>
                    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                        <Search placeholder="Search cars..." enterButton onSearch={handleSearch} style={{ width: '100%', height: '80px' }} />
                    </div>
                </div>
            </div>
    
            <div style={{ padding: '20px' }}>
                <Row gutter={16}>
                    {filteredProducts.map((product, index) => (
                        <Col span={6} key={product.Id}>
                            <Card
                                hoverable
                                style={{ maxWidth: '100%', marginBottom: '20px' }}
                                cover={<img alt={product.Make} src={toyota2} style={{ width: '100%', height: 'auto', objectFit: 'cover' }} />}
                            >
                                <div style={{ padding: '5px 15px' }}>
                                    <Card.Meta
                                        title={product.Make}
                                        description={<>
                                            <p style={{ fontSize: '14px', margin: '0 0 8px 0' }}>{product.Model}</p>
                                            <p style={{ fontSize: '16px', color: 'red', fontWeight: 'bold', margin: '0' }}>$ {product.Price_Per_Day} NZD/day</p>
                                        </>}
                                    />
                                </div>
                                <Button
                                    type="primary"
                                    style={{ position: 'absolute', bottom: '13px', right: '10px', fontSize: '16px', padding: '10px 20px' }}
                                    onClick={() => handleBook(product.Id)}
                                >
                                    Book
                                </Button>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>

            <Modal
                title="Booking Details"
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={[
                    <Button key="cancel" onClick={handleCancel}>
                        Cancel
                    </Button>,
                    <Button key="confirm" type="primary" onClick={() => form.submit()} >
                        Confirm Booking
                    </Button>
                ]}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleConfirmBooking}
                    onFinishFailed={onFinishFailed}
                    initialValues={{
                        id: selectedProduct?.Id,
                        carMake: selectedProduct?.Make,
                        carModel: selectedProduct?.Model,
                        startDate: null, 
                        endDate: null, 
                        fee: 0, 
                        userName: 'string'
                    }}
                    onValuesChange={(changedValues, allValues) => {
                        if ('startDate' in changedValues) {
                            handleStartDateChange(changedValues.startDate);
                        }
                        if ('endDate' in changedValues) {
                            handleEndDateChange(changedValues.endDate);
                        }
                    }}
                >
                    <Form.Item name="id" hidden={true}>
                        <Input type="hidden" />
                    </Form.Item>
                    <Form.Item name="carMake" label="Car Make">
                        <Input disabled />
                    </Form.Item>
                    <Form.Item name="carModel" label="Car Model">
                        <Input disabled /> 
                    </Form.Item>
                    <Form.Item
                        name="startDate"
                        label="Start Date"
                        rules={[
                            {
                                required: true,
                                message: 'Please select a start date!'
                            }
                        ]}
                    >
                        <DatePicker format="YYYY-MM-DD" disabledDate={disabledStartDate} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        name="endDate"
                        label="End Date"
                        rules={[
                            {
                                required: true,
                                message: 'Please select an end date!'
                            },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('startDate') < value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject('End date must be after start date!');
                                },
                            }),
                        ]}
                    >
                        <DatePicker format="YYYY-MM-DD" disabledDate={disabledEndDate} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="fee" label="Fee">
                        <InputNumber disabled={true} style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
