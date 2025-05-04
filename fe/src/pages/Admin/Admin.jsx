import React, { useState, useEffect } from "react";
import { Layout, Menu, Card, Statistic, Row, Col, Tag, Button, Space, Table, Spin } from "antd";
import {
  UserOutlined,
  BookOutlined,
  SettingOutlined,
  LogoutOutlined,
  TeamOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  DashboardOutlined,
  ToolOutlined,
  FileTextOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import "./Admin.scss";

const { Header, Sider, Content } = Layout;

const Admin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedKey, setSelectedKey] = useState("dashboard");
  const [reservations, setReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    if (selectedKey === "rooms") {
      fetchAllReservations();
    }
  }, [selectedKey]);

  const fetchAllReservations = async () => {
    setLoadingReservations(true);
    try {
      const response = await fetch("http://localhost:8080/api/reservation/all");
      const data = await response.json();
      setReservations(Array.isArray(data) ? data : []);
    } catch (error) {
      setReservations([]);
    } finally {
      setLoadingReservations(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleUpdateStatus = async (reservationId, status) => {
    setActionLoading((prev) => ({ ...prev, [reservationId]: true }));
    try {
      await fetch(`http://localhost:8080/api/reservation/${reservationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      await fetchAllReservations();
    } catch (error) {
      // Optionally show error
    } finally {
      setActionLoading((prev) => ({ ...prev, [reservationId]: false }));
    }
  };

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "rooms",
      icon: <BookOutlined />,
      label: "Quản lý đặt phòng",
    },
    {
      key: "equipment",
      icon: <ToolOutlined />,
      label: "Quản lý thiết bị",
    }
  ];

  const roomData = [
    {
      key: "1",
      building: "A1",
      room: "A1.01",
      type: "Cá nhân",
      status: "Đang sử dụng",
      user: "Nguyễn Văn A",
      time: "Tiết 1-3",
    },
    {
      key: "2",
      building: "B1",
      room: "B1.02",
      type: "Nhóm",
      status: "Đang chờ xử lý",
      user: "Trần Thị B",
      time: "Tiết 4-6",
    },
    {
      key: "3",
      building: "A2",
      room: "A2.03",
      type: "Nhóm",
      status: "Đã hoàn thành",
      user: "Lê Văn C",
      time: "Tiết 7-9",
    },
  ];

  const equipmentData = [
    {
      key: "1",
      name: "Microphone",
      quantity: 2,
      status: "Đã hoàn thành",
      user: "Nguyễn Văn A",
      time: "Tiết 1-3",
    },
    {
      key: "2",
      name: "Projector",
      quantity: 1,
      status: "Đang chờ xử lý",
      user: "Trần Thị B",
      time: "Tiết 4-6",
    },
    {
      key: "3",
      name: "Laptop",
      quantity: 1,
      status: "Đang sử dụng",
      user: "Lê Văn C",
      time: "Tiết 7-9",
    },
  ];

  const reservationColumns = [
    { title: "ID", dataIndex: "ReservationID", key: "ReservationID" },
    { title: "Phòng", dataIndex: "NoRoom", key: "NoRoom" },
    { title: "Tòa", dataIndex: "Building", key: "Building" },
    { title: "Vị trí", dataIndex: "Location", key: "Location" },
    { title: "Loại phòng", dataIndex: "TypeRoom", key: "TypeRoom" },
    { title: "Ngày", dataIndex: "Date_in_week", key: "Date_in_week" },
    { title: "Tiết", dataIndex: "TimeSection", key: "TimeSection" },
    { title: "Người đặt", dataIndex: "FullName", key: "FullName" },
    { title: "Mục đích", dataIndex: "Purpose", key: "Purpose" },
    { title: "Số người", dataIndex: "NumberOfParticipants", key: "NumberOfParticipants" },
    { title: "Trạng thái", dataIndex: "Status", key: "Status", render: (status) => getStatusTag(status) },
    { title: "Tạo lúc", dataIndex: "CreatedAt", key: "CreatedAt" },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            loading={actionLoading[record.ReservationID]}
            disabled={record.Status === 'Confirmed' || record.Status === 'Completed'}
            onClick={() => handleUpdateStatus(record.ReservationID, 'Confirmed')}
          >
            Xác nhận
          </Button>
          <Button
            danger
            size="small"
            loading={actionLoading[record.ReservationID]}
            disabled={record.Status === 'Cancelled' || record.Status === 'Completed'}
            onClick={() => handleUpdateStatus(record.ReservationID, 'Cancelled')}
          >
            Hủy
          </Button>
        </Space>
      ),
    },
  ];

  const getStatusTag = (status) => {
    switch (status) {
      case "Completed":
      case "Đã hoàn thành":
        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            {status}
          </Tag>
        );
      case "Pending":
      case "Đang chờ xử lý":
        return (
          <Tag color="processing" icon={<ClockCircleOutlined />}>
            {status}
          </Tag>
        );
      case "Confirmed":
      case "Đang sử dụng":
        return (
          <Tag color="warning" icon={<SyncOutlined spin />}>
            {status}
          </Tag>
        );
      case "Cancelled":
      case "Đã hủy":
        return <Tag color="error">{status}</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const renderRoomManagement = () => (
    <Card title="Tất cả đơn đặt phòng">
      {loadingReservations ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table
          columns={reservationColumns}
          dataSource={reservations.map((r) => ({ ...r, key: r.ReservationID }))}
          scroll={{ x: true }}
        />
      )}
    </Card>
  );

  const renderDashboard = () => (
    <div className="dashboard">
      <Row gutter={[24, 24]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số phòng"
              value={25}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Phòng đang sử dụng"
              value={12}
              prefix={<SyncOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đơn đặt phòng hôm nay"
              value={8}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số người dùng"
              value={150}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title="Đơn đặt phòng gần đây">
            <Table
              columns={[
                {
                  title: 'Phòng',
                  dataIndex: 'room',
                  key: 'room',
                },
                {
                  title: 'Người dùng',
                  dataIndex: 'user',
                  key: 'user',
                },
                {
                  title: 'Thời gian',
                  dataIndex: 'time',
                  key: 'time',
                },
                {
                  title: 'Trạng thái',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => getStatusTag(status),
                }
              ]}
              dataSource={[
                {
                  key: '1',
                  room: 'A1.01',
                  user: 'Nguyễn Văn A',
                  time: 'Tiết 1-3',
                  status: 'Đang chờ xử lý'
                },
                {
                  key: '2',
                  room: 'B1.02',
                  user: 'Trần Thị B',
                  time: 'Tiết 4-6',
                  status: 'Đã xác nhận'
                },
                {
                  key: '3',
                  room: 'A2.03',
                  user: 'Lê Văn C',
                  time: 'Tiết 7-9',
                  status: 'Đang sử dụng'
                }
              ]}
              pagination={false}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Thống kê thiết bị">
            <Table
              columns={[
                {
                  title: 'Thiết bị',
                  dataIndex: 'name',
                  key: 'name',
                },
                {
                  title: 'Số lượng',
                  dataIndex: 'count',
                  key: 'count',
                },
                {
                  title: 'Trạng thái',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => getStatusTag(status),
                }
              ]}
              dataSource={[
                {
                  key: '1',
                  name: 'Projector',
                  count: '5/10',
                  status: 'Đang sử dụng'
                },
                {
                  key: '2',
                  name: 'Microphone',
                  count: '8/15',
                  status: 'Đã hoàn thành'
                },
                {
                  key: '3',
                  name: 'Laptop',
                  count: '3/5',
                  status: 'Đang chờ xử lý'
                }
              ]}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Lịch sử hoạt động">
            <Table
              columns={[
                {
                  title: 'Thời gian',
                  dataIndex: 'time',
                  key: 'time',
                },
                {
                  title: 'Hoạt động',
                  dataIndex: 'action',
                  key: 'action',
                },
                {
                  title: 'Người dùng',
                  dataIndex: 'user',
                  key: 'user',
                },
                {
                  title: 'Trạng thái',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => getStatusTag(status),
                }
              ]}
              dataSource={[
                {
                  key: '1',
                  time: '10:30 12/04/2024',
                  action: 'Đăng nhập hệ thống',
                  user: 'admin',
                  status: 'Đã hoàn thành'
                },
                {
                  key: '2',
                  time: '09:15 12/04/2024',
                  action: 'Cập nhật cài đặt phòng',
                  user: 'admin',
                  status: 'Đã hoàn thành'
                },
                {
                  key: '3',
                  time: '08:00 12/04/2024',
                  action: 'Xử lý đơn đặt phòng',
                  user: 'admin',
                  status: 'Đang xử lý'
                }
              ]}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderSystemManagement = () => (
    <div className="system-management">
      <Card title="Cài đặt hệ thống">
        <div className="settings-section">
          <h3>Cài đặt chung</h3>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button type="primary" block>Quản lý vai trò người dùng</Button>
            <Button type="primary" block>Quản lý quyền truy cập</Button>
            <Button type="primary" block>Cấu hình email</Button>
          </Space>
        </div>

        <div className="settings-section" style={{ marginTop: 24 }}>
          <h3>Bảo mật</h3>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button type="primary" block>Cấu hình xác thực</Button>
            <Button type="primary" block>Quản lý mật khẩu</Button>
            <Button type="primary" block>Backup dữ liệu</Button>
          </Space>
        </div>
      </Card>

      <Card title="Nhật ký hệ thống" style={{ marginTop: 24 }}>
        <div className="system-logs">
          <div className="log-item">
            <span className="time">10:30 12/04/2024</span>
            <span className="action">Người dùng đăng nhập</span>
            <span className="user">admin</span>
          </div>
          <div className="log-item">
            <span className="time">09:15 12/04/2024</span>
            <span className="action">Cập nhật cài đặt hệ thống</span>
            <span className="user">admin</span>
          </div>
          <div className="log-item">
            <span className="time">08:00 12/04/2024</span>
            <span className="action">Backup dữ liệu</span>
            <span className="user">system</span>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (selectedKey) {
      case "dashboard":
        return renderDashboard();
      case "rooms":
        return renderRoomManagement();
      case "system":
      case "settings":
      case "logs":
        return renderSystemManagement();
      default:
        return <div>Coming soon...</div>;
    }
  };

  return (
    <Layout className="admin-layout">
      <Sider width={250} className="admin-sider">
        <div className="admin-logo">
          <h2>Admin Panel</h2>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          className="admin-menu"
          onClick={({ key }) => setSelectedKey(key)}
        />
        <div className="admin-logout" onClick={handleLogout}>
          <LogoutOutlined />
          <span>Đăng xuất</span>
        </div>
      </Sider>
      <Layout>
        <Header className="admin-header">
          <h1>
            {selectedKey === "dashboard"
              ? "Dashboard"
              : selectedKey === "rooms"
              ? "Quản lý đặt phòng"
              : selectedKey === "system" || selectedKey === "settings" || selectedKey === "logs"
              ? "Quản lý hệ thống"
              : menuItems.find((item) => item.key === selectedKey)?.label}
          </h1>
        </Header>
        <Content className="admin-content">{renderContent()}</Content>
      </Layout>
    </Layout>
  );
};

export default Admin; 