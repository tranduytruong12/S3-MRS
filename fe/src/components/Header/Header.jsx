import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Select, Button, Dropdown, Avatar, message } from 'antd';
import { UserOutlined, LogoutOutlined, MenuOutlined, BulbOutlined, BulbFilled } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { setLanguage, setTheme } from '../../redux/slices/appSlice';
import { logout } from '../../redux/slices/authSlice';
import './Header.scss';
import logo from '../../assets/images/logo.png';

const Header = () => {
  const language = useSelector((state) => state.app.language);
  const theme = useSelector((state) => state.app.theme);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      dispatch(logout());
      message.success('Logged out successfully');
      navigate('/');
    } else if (key === 'user-info') {
      navigate('/user-info');
    }
  };

  const userMenuItems = [
    {
      key: 'user-info',
      icon: <UserOutlined />,
      label: 'User Info',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
    },
  ];

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    dispatch(setTheme(newTheme));
  };

  return (
    <header className="header">
      <div className="header__logo">
        <img src={logo} alt="HCMUT Logo" />
        <span className="header__title">S3-MRS</span>
      </div>

      <nav className="header__nav">
        {user && (
          <>
            <Link to="/" className="header__nav-item">Home</Link>
            <Link to="/book-room" className="header__nav-item">Book Room</Link>
            <Link to="/equipment" className="header__nav-item">Equipment</Link>
            <Link to="/user-info" className="header__nav-item">User Info</Link>
          </>
        )}
      </nav>

      <div className="header__actions">
        <Button 
          onClick={toggleTheme} 
          className="header__theme-toggle"
          type="text"
          icon={theme === 'light' ? <BulbOutlined /> : <BulbFilled />}
        >
          {theme === 'light' ? 'Dark' : 'Light'}
        </Button>

        {user ? (
          <Dropdown menu={{ items: userMenuItems, onClick: handleMenuClick }} placement="bottomRight">
            <Button className="header__user-button">
              <Avatar icon={<UserOutlined />} />
              <span className="header__user-name">{user.name}</span>
            </Button>
          </Dropdown>
        ) : (
          <Link to="/login">
            <Button type="primary" className="header__login-button">
              Login
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header; 