import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Tag, Space, Modal, Form, Input, Button, message, Spin, Empty } from 'antd';
import { 
  AudioOutlined, 
  VideoCameraOutlined, 
  SoundOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ToolOutlined,
  LaptopOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import Header from '../../components/Header/Header';
import { getAllEquipment, borrowEquipment, returnEquipment } from '../../services/equipmentService';
import './Equipment.scss';

const { Title, Text } = Typography;

// Map equipment names to icons
const getEquipmentIcon = (name) => {
  if (name?.toLowerCase().includes('micro') || name?.toLowerCase().includes('mic'))
    return <AudioOutlined />;
  if (name?.toLowerCase().includes('máy chiếu') || name?.toLowerCase().includes('projector'))
    return <VideoCameraOutlined />;
  if (name?.toLowerCase().includes('laptop') || name?.toLowerCase().includes('máy tính'))
    return <LaptopOutlined />;
  if (name?.toLowerCase().includes('volume') || name?.toLowerCase().includes('loa'))
    return <SoundOutlined />;
  if (name?.toLowerCase().includes('bảng') || name?.toLowerCase().includes('board'))
    return <ToolOutlined />;
  return <ToolOutlined />; // Default icon
};

const Equipment = () => {
  const [equipmentData, setEquipmentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [borrowingInProgress, setBorrowingInProgress] = useState(false);
  const [returningInProgress, setReturningInProgress] = useState(false);
  const [form] = Form.useForm();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const data = await getAllEquipment();
      // Transform data to match our component structure
      const transformedData = data.map(item => ({
        id: item.MTB,
        name: item.Name,
        available: item.Status === 'Đang sử dụng' || item.Status === 'Bảo trì' || item.Status === 'Hỏng' ? 0 : item.Amount,
        total: item.Amount,
        status: item.Status,
        borrowedByCurrentUser: item.Status === 'Đang sử dụng' && user?.isAuthenticated
      }));
      setEquipmentData(transformedData);
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
      message.error('Failed to load equipment data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const showEquipmentDetails = (equipment) => {
    setSelectedEquipment(equipment);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleBorrow = async (values) => {
    setBorrowingInProgress(true);
    try {
      await borrowEquipment(selectedEquipment.id, values.purpose);
      message.success(`Successfully borrowed ${selectedEquipment.name}`);
      setIsModalVisible(false);
      form.resetFields();
      // Refresh equipment data
      fetchEquipment();
    } catch (error) {
      console.error('Error borrowing equipment:', error);
      message.error(error.response?.data?.message || 'Failed to borrow equipment. Please try again later.');
    } finally {
      setBorrowingInProgress(false);
    }
  };

  const handleReturn = async (id) => {
    setReturningInProgress(true);
    try {
      await returnEquipment(id);
      message.success('Equipment returned successfully');
      // Refresh equipment data
      fetchEquipment();
    } catch (error) {
      console.error('Error returning equipment:', error);
      message.error(error.response?.data?.message || 'Failed to return equipment. Please try again later.');
    } finally {
      setReturningInProgress(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Sẵn sàng':
        return 'success';
      case 'Đang sử dụng':
        return 'processing';
      case 'Bảo trì':
        return 'warning';
      case 'Hỏng':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Sẵn sàng':
        return 'Available';
      case 'Đang sử dụng':
        return 'In Use';
      case 'Bảo trì':
        return 'Under Maintenance';
      case 'Hỏng':
        return 'Out of Order';
      default:
        return status;
    }
  };

  return (
    <div className="equipment">
      <Header />
      <div className="equipment__content">
        <div className="equipment__header">
          <Title level={1}>Equipment Borrowing</Title>
          <Text className="equipment__subtitle">Borrow equipment for your academic needs</Text>
        </div>

        {loading ? (
          <div className="equipment__loading">
            <Spin size="large" />
            <Text>Loading equipment data...</Text>
          </div>
        ) : equipmentData.length === 0 ? (
          <Empty description="No equipment available" />
        ) : (
          <Row gutter={[24, 24]} className="equipment__list">
            {equipmentData.map(item => (
              <Col xs={24} sm={12} md={8} key={item.id}>
                <Card 
                  className={`equipment__card ${item.status === 'Hỏng' ? 'equipment__card--disabled' : ''}`}
                  onClick={() => showEquipmentDetails(item)}
                  hoverable
                >
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div className="equipment__card-header">
                      <div className="equipment__icon">
                        {getEquipmentIcon(item.name)}
                      </div>
                      <Title level={3}>{item.name}</Title>
                    </div>

                    <div className="equipment__availability">
                      <Space>
                        <Tag color={getStatusColor(item.status)}>
                          {item.available > 0 ? (
                            <CheckCircleOutlined /> 
                          ) : (
                            <CloseCircleOutlined />
                          )}
                          {getStatusText(item.status)}
                        </Tag>
                        <Text type="secondary">{item.available} of {item.total} available</Text>
                      </Space>
                    </div>

                    {item.borrowedByCurrentUser && (
                      <div className="equipment__borrowed">
                        <Tag color="blue">Borrowed by you</Tag>
                        <Button 
                          type="primary" 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReturn(item.id);
                          }}
                          loading={returningInProgress}
                        >
                          Return
                        </Button>
                      </div>
                    )}
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        <Modal
          title={`Borrow ${selectedEquipment?.name || 'Equipment'}`}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={600}
        >
          {selectedEquipment && (
            <div className="equipment__modal">
              <div className="equipment__modal-info">
                <div className="equipment__modal-header">
                  <div className="equipment__icon">
                    {getEquipmentIcon(selectedEquipment.name)}
                  </div>
                  <Title level={3}>{selectedEquipment.name}</Title>
                </div>
                <div className="equipment__availability">
                  <Space>
                    <Tag color={getStatusColor(selectedEquipment.status)}>
                      {getStatusText(selectedEquipment.status)}
                    </Tag>
                    <Text type="secondary">{selectedEquipment.available} of {selectedEquipment.total} available</Text>
                  </Space>
                </div>
              </div>

              {selectedEquipment.borrowedByCurrentUser ? (
                <div className="equipment__return-section">
                  <Text>You have already borrowed this equipment.</Text>
                  <Button 
                    type="primary" 
                    onClick={() => {
                      handleReturn(selectedEquipment.id);
                      setIsModalVisible(false);
                    }}
                    loading={returningInProgress}
                    block
                  >
                    Return Equipment
                  </Button>
                </div>
              ) : selectedEquipment.available <= 0 ? (
                <div className="equipment__unavailable">
                  <Text type="danger">This equipment is currently unavailable for borrowing.</Text>
                </div>
              ) : (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleBorrow}
                >
                  <Form.Item
                    name="purpose"
                    label="Purpose"
                    rules={[{ required: true, message: 'Please enter the purpose' }]}
                  >
                    <Input.TextArea 
                      rows={4} 
                      placeholder="Please describe the purpose of borrowing this equipment"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      block
                      loading={borrowingInProgress}
                    >
                      Borrow Equipment
                    </Button>
                  </Form.Item>
                </Form>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default Equipment; 