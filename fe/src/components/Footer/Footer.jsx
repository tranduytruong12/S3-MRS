import React from 'react';
import { Link } from 'react-router-dom';
import { FacebookOutlined, InstagramOutlined, LinkedinOutlined } from '@ant-design/icons';
import './Footer.scss';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__content">
        <div className="footer__section">
          <h3>HCMUT Smart Learning Space</h3>
          <p>Ho Chi Minh City University of Technology</p>
          <p>268 Ly Thuong Kiet Street, District 10</p>
          <p>Ho Chi Minh City, Vietnam</p>
        </div>

        <div className="footer__section">
          <h3>Resources</h3>
          <ul>
            <li><Link to="/about-system">About the System</Link></li>
          </ul>
        </div>

        <div className="footer__section">
          <h3>Connect With Us</h3>
          <div className="footer__social">
            <a href="https://facebook.com/hcmut" target="_blank" rel="noopener noreferrer">
              <FacebookOutlined />
            </a>
            <a href="https://instagram.com/hcmut" target="_blank" rel="noopener noreferrer">
              <InstagramOutlined />
            </a>
            <a href="https://linkedin.com/school/hcmut" target="_blank" rel="noopener noreferrer">
              <LinkedinOutlined />
            </a>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <p>&copy; {new Date().getFullYear()} HCMUT Smart Learning Space Management System. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer; 