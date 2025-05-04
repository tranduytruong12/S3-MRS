import React from 'react';
import { Button, Card, Row, Col, Statistic } from 'antd';
import { CalendarOutlined, SearchOutlined, ToolOutlined, ClockCircleOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './Hero.scss';

const Hero = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);

  const handleReservation = () => {
    if (isAuthenticated) {
      navigate('/book-room');
    } else {
      navigate('/login');
    }
  };

  return (
    <section className="hero">
      <div className="hero__content">
        <h1 className="hero__title">
          Smart Learning Space Management System
        </h1>
        <p className="hero__description">
          Efficiently manage and book study spaces at HCMUT. Access modern facilities,
          equipment, and create the perfect environment for your learning journey.
        </p>

          <Card className="hero__action-card">
            <Button 
              type="primary" 
              size="large" 
              block 
              icon={<CalendarOutlined />}
              onClick={handleReservation}
            >
              RESERVATION NOW!
            </Button>
          </Card>
      </div>

      <Row gutter={[24, 24]} className="hero__stats">
        <Col xs={24} sm={12} md={6}>
          <Card className="hero__stat-card">
            <Statistic
              title="Available Rooms"
              value={12}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="hero__stat-card">
            <Statistic
              title="Current Users"
              value={156}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="hero__stat-card">
            <Statistic
              title="Peak Hours"
              value="9AM - 5PM"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="hero__stat-card">
            <Statistic
              title="Equipment Available"
              value={45}
              prefix={<ToolOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </section>
  );
};

export default Hero; 