import React, { useState } from "react";
import { Form, Input, Button, Card, message, Alert } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../redux/slices/authSlice";
import "./Login.scss";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onFinish = async (values) => {
    setLoading(true);
    setErrorMsg(""); // Clear any previous error messages

    // Static admin login (frontend only)
    if (values.username === "admin" && values.password === "admin") {
      // Create a fake token and user object
      const staticToken = "static-admin-token";
      const staticUser = {
        id: "static-admin",
        UserID: "static-admin",
        Email: "admin",
        role: "admin",
        FullName: "Administrator"
      };
      localStorage.setItem("token", staticToken);
      localStorage.setItem("user", JSON.stringify(staticUser));
      dispatch(loginSuccess({
        username: staticUser.Email,
        role: staticUser.role,
        id: staticUser.id
      }));
      message.success("Admin login successful!");
      navigate("/admin");
      setLoading(false);
      return;
    }

    // Normal user login (call backend)
    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Email: values.username, Password: values.password })
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        dispatch(loginSuccess({
          username: data.user.Email,
          role: data.user.role,
          id: data.user.id
        }));
        message.success("Login successful!");
        if (data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        setErrorMsg(data.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      setErrorMsg("Network error. Please try again later.");
    }
    setLoading(false);
  };

  return (
    <div className="login">
      <Card className="login__card">
        <h1 className="login__title">Login</h1>
        <p className="login__subtitle">
          Login to access the Smart Learning Space Management System
        </p>
        
        {errorMsg && (
          <Alert
            message="Login Error"
            description={errorMsg}
            type="error"
            showIcon
            className="login__error-alert"
            style={{ marginBottom: 16 }}
          />
        )}
        
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: "Please enter your username!" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Username (Email)"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Please enter your password!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
            >
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login; 