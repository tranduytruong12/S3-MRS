import React from 'react';
import { Typography, Card, Row, Col, Divider } from 'antd';
import Header from '../../components/Header/Header';
import './AboutSystem.scss';

const { Title, Paragraph } = Typography;

const AboutSystem = () => {
  return (
    <div className="about-system">
      <Header />
      <div className="about-system__header">
        <Title level={1}>Smart Study Space Management and Reservation System (S3-MRS)</Title>
        <Title level={3}>Ho Chi Minh City University of Technology – VNU (HCMUT)</Title>
      </div>

      <div className="about-system__content">
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card className="about-system__card">
              <Title level={2}>System Overview</Title>
              <Paragraph>
                In the context of a modern university, the demand for self-study, research and group study
                spaces among students is increasing. To meet this demand, the Ho Chi Minh City University
                of Technology – VNU (HCMUT) has established Smart Study Spaces in various buildings on
                campus. The goal is to enhance students' learning experiences by enabling them to easily
                find and effectively use study spaces. At the same time, the system contributes to smart
                resource management, optimizing the use of study spaces and equipment, and promoting
                the modernization of the educational environment through the integration of IoT technology
                and smart management solutions, creating a competitive advantage in education.
              </Paragraph>
            </Card>

            <Card className="about-system__card">
              <Title level={2}>Smart Study Spaces</Title>
              <Paragraph>
                In addition to building modern self-study spaces, HCMUT is also implementing a Smart
                Study Space Management and Reservation System. These spaces are designed to meet the
                diverse learning needs of students, including individual study, group study, and one-on-one
                mentoring sessions. Depending on the requirements, the self-study spaces will provide
                essential equipment such as:
              </Paragraph>
              <ul>
                <li>Lighting and power outlets</li>
                <li>Projectors and whiteboards</li>
                <li>Interactive screens</li>
                <li>Online meeting devices</li>
                <li>Air conditioning systems</li>
              </ul>
            </Card>

            <Card className="about-system__card">
              <Title level={2}>System Features</Title>
              <Paragraph>
                Students can easily access the system via web and mobile apps to make flexible
                reservations and receive reminder notifications when their study time is approaching or
                when the status of the study spaces changes. The university management can monitor the
                usage of each study space and gather reports on the system's activities. IT staff will ensure
                that the centralized authentication system operates smoothly and securely protects user
                information, while the technical team will maintain the sensors and devices in the self-study
                spaces.
              </Paragraph>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card className="about-system__card">
              <Title level={2}>Technical Implementation</Title>
              <Paragraph>
                The system will be developed on web and mobile app platforms, allowing users to easily
                access it from anywhere and conveniently use services related to study spaces. User
                authentication will be conducted through HCMUT's centralized authentication system,
                HCMUT_SSO, ensuring security and accurate access control.
              </Paragraph>
              <Divider />
              <Title level={3}>IoT Integration</Title>
              <Paragraph>
                The system is required to integrate IoT technologies to support the criteria for
                smart study spaces. Specifically:
              </Paragraph>
              <ul>
                <li>Monitor and update space status via state sensors</li>
                <li>QR code check-in and space unlocking</li>
                <li>Automatic control of lights and air conditioning</li>
                <li>Automatic release of unused reserved spaces</li>
              </ul>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AboutSystem; 