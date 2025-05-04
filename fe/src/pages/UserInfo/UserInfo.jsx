import React, { useState, useEffect } from "react";
import { Form, Input, Select, DatePicker, Button, Card, Tabs, Tag, Modal, Divider, Typography, Row, Col, message } from "antd";
import { 
  UserOutlined, 
  IdcardOutlined, 
  BankOutlined, 
  HomeOutlined, 
  HistoryOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  SyncOutlined,
  KeyOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  ClockCircleFilled,
  QrcodeOutlined,
  InfoCircleOutlined,
  ToolOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Header from "../../components/Header/Header";
import "./UserInfo.scss";
import dayjs from 'dayjs';

const { Option } = Select;
const { Title, Text } = Typography;

const UserInfo = () => {
  const [form] = Form.useForm();
  const [disabled, setDisabled] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [roomBookings, setRoomBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const recentRoomHistory = [];
  const recentEquipmentHistory = [];

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token);
      
      if (!token) {
        console.log('No token found, user not logged in');
        return;
      }
      
      try {
        console.log('Fetching user info with token:', token.substring(0, 15) + '...');
        const res = await fetch('http://localhost:8080/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) {
          console.error('Error response:', res.status, res.statusText);
          message.error(`API Error: ${res.status} ${res.statusText}`);
          return;
        }
        
        const data = await res.json();
        console.log('User info API response:', data);
        
        if (data.success && data.user) {
          console.log('Student specific fields:', {
            MSSV: data.user.MSSV,
            Department_Class: data.user.Department_Class,
            Date_Start_SignUp: data.user.Date_Start_SignUp,
            Student_NoRoom: data.user.Student_NoRoom,
            Student_Location: data.user.Student_Location,
            Student_Building: data.user.Student_Building
          });
          
          setUserData(data.user);
          console.log('Setting form values with:', data.user);
          
          // Update form with all available fields
          form.setFieldsValue({
            name: data.user.FullName || '',
            email: data.user.Email || '',
            phoneNumber: data.user.PhoneNumber || '',
            studentId: data.user.MSSV || data.user.UserID || '',
            dateStartSignUp: data.user.Date_Start_SignUp ? dayjs(data.user.Date_Start_SignUp) : undefined,
            studentNoRoom: data.user.Student_NoRoom || '',
            studentLocation: data.user.Student_Location || '',
            studentBuilding: data.user.Student_Building || '',
            faculty: data.user.Department_Class || '',
            gender: data.user.Sex === 'M' ? 'male' : 'female',
            birthday: data.user.DateOfBirth ? dayjs(data.user.DateOfBirth) : undefined,
            role: data.user.role || ''
          });
        } else {
          console.error('API returned success:false or missing user data');
          message.error('Không thể lấy thông tin người dùng');
        }
      } catch (err) {
        console.error('Error fetching user info:', err);
        message.error('Lỗi khi lấy thông tin người dùng');
      }
    };
    
    fetchUserInfo();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          message.error('Vui lòng đăng nhập để xem lịch sử đăng ký');
          return;
        }

        const response = await fetch('http://localhost:8080/api/bookings/user', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched bookings:', data); // Debug log
        
        if (data.success && data.bookings) {
          // Sort bookings by date and time
          const sortedBookings = data.bookings.sort((a, b) => {
            // First sort by day of week
            const dayOrder = { 'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4, 'friday': 5 };
            const dayCompare = dayOrder[a.Date_in_week.toLowerCase()] - dayOrder[b.Date_in_week.toLowerCase()];
            
            // If same day, sort by time section
            if (dayCompare === 0) {
              return a.TimeSection - b.TimeSection;
            }
            
            return dayCompare;
          });
          
          setRoomBookings(sortedBookings);
        } else {
          console.error('Invalid data format:', data);
          message.error('Dữ liệu không hợp lệ');
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        message.error('Không thể tải lịch sử đăng ký');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const onFinish = (values) => {
    console.log('Success:', values);
    setDisabled(true);
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 'Pending':
        return (
          <Tag 
            color="processing"
            icon={<ClockCircleOutlined />}
          >
            Đang chờ
          </Tag>
        );
      case 'Confirmed':
        return (
          <Tag 
            color="success"
            icon={<CheckCircleOutlined />}
          >
            Đã xác nhận
          </Tag>
        );
      case 'Completed':
        return (
          <Tag 
            color="blue"
            icon={<CheckCircleOutlined />}
          >
            Đã hoàn thành
          </Tag>
        );
      case 'Cancelled':
        return (
          <Tag 
            color="error"
            icon={<CloseCircleOutlined />}
          >
            Đã hủy
          </Tag>
        );
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const handleBookingClick = (item, type) => {
    setSelectedBooking({...item, type});
    setBookingModalVisible(true);
  };

  const renderHistoryList = (bookings) => {
    if (loading) {
      return <div className="user-info__loading">Đang tải...</div>;
    }

    if (!bookings || bookings.length === 0) {
      return <p>Bạn chưa có lịch sử đăng ký phòng học</p>;
    }

    return (
      <div className="user-info__history-list">
        {bookings.map((booking) => (
          <div 
            key={booking.ReservationID}
            className="user-info__history-item" 
            onClick={() => handleBookingClick(booking, 'room')}
          >
            <div className="user-info__history-date">
              {(() => {
                const dayMap = {
                  'monday': 'Thứ 2',
                  'tuesday': 'Thứ 3',
                  'wednesday': 'Thứ 4',
                  'thursday': 'Thứ 5',
                  'friday': 'Thứ 6'
                };
                return dayMap[booking.Date_in_week.toLowerCase()] || booking.Date_in_week;
              })()}
            </div>
            <div className="user-info__history-details">
              <span className="user-info__history-building">{booking.Building}</span>
              <span className="user-info__history-room">{booking.NoRoom}</span>
            </div>
            {getStatusTag(booking.Status)}
          </div>
        ))}
      </div>
    );
  };

  const renderBookingDetails = () => {
    if (!selectedBooking) return null;
    
    const isRoom = selectedBooking.type === 'room';
    const isPending = selectedBooking.Status === "Pending";
    const isCancelled = selectedBooking.Status === "Cancelled";
    
    return (
      <div className="booking-details">
        <div className="booking-details__header">
          <Title level={4}>{isRoom ? 'Chi tiết đặt phòng' : 'Chi tiết mượn thiết bị'}</Title>
          <Tag className="booking-details__id">{selectedBooking.ReservationID}</Tag>
        </div>
        
        <Divider />
        
        <Row gutter={[16, 24]}>
          <Col span={24}>
            <div className="booking-details__status">
              {getStatusTag(selectedBooking.Status)}
            </div>
          </Col>
          
          {isRoom ? (
            <>
              <Col span={12}>
                <div className="booking-details__item">
                  <div className="booking-details__label">
                    <EnvironmentOutlined /> Phòng
                  </div>
                  <div className="booking-details__value">
                    {selectedBooking.NoRoom} ({selectedBooking.Location}, {selectedBooking.Building})
                  </div>
                </div>
              </Col>
            </>
          ) : (
            <Col span={12}>
              <div className="booking-details__item">
                <div className="booking-details__label">
                  <ToolOutlined /> Thiết bị
                </div>
                <div className="booking-details__value">
                  {selectedBooking.equipment} (x{selectedBooking.quantity})
                </div>
              </div>
            </Col>
          )}
          
          <Col span={12}>
            <div className="booking-details__item">
              <div className="booking-details__label">
                <CalendarOutlined /> Ngày
              </div>
              <div className="booking-details__value">
                {(() => {
                  const dayMap = {
                    'monday': 'Thứ 2',
                    'tuesday': 'Thứ 3',
                    'wednesday': 'Thứ 4',
                    'thursday': 'Thứ 5',
                    'friday': 'Thứ 6'
                  };
                  return dayMap[selectedBooking.Date_in_week.toLowerCase()] || selectedBooking.Date_in_week;
                })()}
              </div>
            </div>
          </Col>
          
          <Col span={12}>
            <div className="booking-details__item">
              <div className="booking-details__label">
                <ClockCircleFilled /> Tiết học
              </div>
              <div className="booking-details__value">
                {selectedBooking.TimeSection}
              </div>
            </div>
          </Col>
          
          <Col span={12}>
            <div className="booking-details__item">
              <div className="booking-details__label">
                <UserOutlined /> Số người
              </div>
              <div className="booking-details__value">
                {selectedBooking.NumberOfParticipants}
              </div>
            </div>
          </Col>
          
          <Col span={24}>
            <div className="booking-details__item">
              <div className="booking-details__label">
                <InfoCircleOutlined /> Mục đích
              </div>
              <div className="booking-details__value purpose">
                {selectedBooking.Purpose}
              </div>
            </div>
          </Col>
          
          <Col span={24}>
            <Divider orientation="left">Thông tin truy cập</Divider>
          </Col>
          
          <Col span={12}>
            <div className="booking-details__item">
              <div className="booking-details__label">
                <KeyOutlined /> Mật khẩu
              </div>
              <div className="booking-details__value password">
                {isPending ? (
                  <Text type="secondary">Vui lòng chờ admin xác nhận đơn đặt phòng</Text>
                ) : isCancelled ? (
                  <Text type="secondary">Đơn đặt phòng đã bị hủy</Text>
                ) : (
                  '010203'
                )}
              </div>
            </div>
          </Col>
          
          <Col span={24}>
            <div className="booking-details__qr">
              <div className="booking-details__qr-title">
                <QrcodeOutlined /> QR Code Check-in/out
              </div>
              <div className="booking-details__qr-image">
                {isPending ? (
                  <div className="booking-details__qr-placeholder">
                    <Text type="secondary">Vui lòng chờ admin xác nhận đơn đặt phòng</Text>
                  </div>
                ) : isCancelled ? (
                  <div className="booking-details__qr-placeholder">
                    <Text type="secondary">Đơn đặt phòng đã bị hủy</Text>
                  </div>
                ) : (
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`CHECKIN-${selectedBooking.ReservationID}`)}`}
                    alt="QR Code" 
                  />
                )}
              </div>
              {!isPending && !isCancelled && (
                <Text type="secondary">Sử dụng QR code này để check-in và check-out</Text>
              )}
            </div>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <div className="user-info">
      <Header />
      <div className="user-info__content">
        <Card 
          title="Thông tin cá nhân" 
          className="user-info__card"
          headStyle={{ backgroundColor: 'var(--primary-color)', color: 'white' }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            disabled={disabled}
            initialValues={{}}
          >
            <Form.Item
              name="name"
              label="Họ và tên"
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
            >
              <Input prefix={<UserOutlined />} />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
            >
              <Input disabled />
            </Form.Item>

            <Form.Item
              name="phoneNumber"
              label="Số điện thoại"
            >
              <Input disabled />
            </Form.Item>

            <Form.Item
              name="studentId"
              label="Mã số sinh viên"
              rules={[{ required: true, message: 'Vui lòng nhập mã số sinh viên' }]}
            >
              <Input prefix={<IdcardOutlined />} disabled />
            </Form.Item>


            <Form.Item
              name="dateStartSignUp"
              label="Ngày đăng ký"
            >
              <DatePicker style={{ width: '100%' }} disabled />
            </Form.Item>

            <Form.Item
              name="studentNoRoom"
              label="Số phòng"
            >
              <Input disabled />
            </Form.Item>

            <Form.Item
              name="studentLocation"
              label="Khu vực"
            >
              <Input disabled />
            </Form.Item>

            <Form.Item
              name="studentBuilding"
              label="Tòa nhà"
            >
              <Input disabled />
            </Form.Item>

            <Form.Item
              name="faculty"
              label="Khoa"
              rules={[{ required: true, message: 'Vui lòng chọn khoa' }]}
            >
              <Select allowClear>
                <Option value="cntt">Công nghệ thông tin</Option>
                <Option value="dtvt">Điện tử viễn thông</Option>
                <Option value="khmt">Khoa học máy tính</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="gender"
              label="Giới tính"
              rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
            >
              <Select allowClear>
                <Option value="male">Nam</Option>
                <Option value="female">Nữ</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="birthday"
              label="Ngày sinh"
              rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            {!disabled && (
              <Form.Item>
                <div className="user-info__actions">
                  <Button type="primary" htmlType="submit">
                    Xác nhận
                  </Button>
                  <Button onClick={() => setDisabled(true)}>
                    Hủy
                  </Button>
                </div>
              </Form.Item>
            )}
          </Form>

          {disabled && (
            <Button 
              type="primary" 
              onClick={() => setDisabled(false)}
              className="user-info__edit-button"
            >
              Chỉnh sửa thông tin
            </Button>
          )}
        </Card>

        <Card 
          title="Lịch sử đăng ký gần đây" 
          className="user-info__card user-info__history"
          headStyle={{ backgroundColor: 'var(--primary-color)', color: 'white' }}
        >
          <Tabs
            defaultActiveKey="1"
            items={[
              {
                key: '1',
                label: 'Phòng học',
                children: renderHistoryList(roomBookings),
              },
              {
                key: '2',
                label: 'Thiết bị',
                children: (
                  <div className="user-info__history-list">
                    <p>Bạn chưa có lịch sử đăng ký thiết bị</p>
                  </div>
                ),
              }
            ]}
          />
        </Card>
      </div>

      <Modal
        open={bookingModalVisible}
        onCancel={() => setBookingModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setBookingModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={600}
        className="booking-details-modal"
        title={null}
      >
        {renderBookingDetails()}
      </Modal>
    </div>
  );
};

export default UserInfo; 