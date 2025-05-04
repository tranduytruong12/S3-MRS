const { User } = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { sendPasswordResetEmail } = require('../utils/email');
const { Console } = require('console');

const login = async (req, res) => {
  try {
    const { Email, Password } = req.body;

    // Static admin login
    if (Email === 'admin' && Password === 'admin') {
      const token = jwt.sign(
        { id: 'static-admin', UserID: 'static-admin', Email: 'admin', role: 'admin' },
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '1d' }
      );
      return res.status(200).json({
        success: true,
        message: 'Đăng nhập admin thành công',
        token,
        user: {
          id: 'static-admin',
          UserID: 'static-admin',
          Email: 'admin',
          role: 'admin',
          FullName: 'Administrator'
        }
      });
    }

    if (!Email || !Password) {
      return res.status(400).json({
        success: false,
        message: 'Email và mật khẩu là bắt buộc',
      });
    }
    
    console.log('Login attempt with email:', Email);
    
    const user = await User.findByEmail(Email);
    console.log('User found:', user);  // In ra user tìm được từ DB
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng',
      });
    }

    const isMatch = await User.comparePassword(Password, user.Password);
    console.log('Password match:', isMatch);  // In ra kết quả so sánh mật khẩu
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng',
      });
    }

    const role = await User.getRole(user.UserID);
    console.log('User role:', role);  // In ra role của người dùng
    
    // Create a token with both id and UserID for backward compatibility
    const token = jwt.sign(
      { 
        id: user.UserID, 
        UserID: user.UserID,  // Add explicit UserID
        Email: user.Email, 
        role 
      },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );

    // Get full user details to send to client
    const fullUserData = await User.findById(user.UserID);
    console.log('Full user data for login response:', fullUserData);

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.UserID,
        UserID: user.UserID,  // Add explicit UserID 
        Email: user.Email,
        role,
        FullName: user.FullName,
        ...(fullUserData || {})  // Include additional user details if available
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi đăng nhập',
      error: error.message,
    });
  }
};


const register = async (req, res) => {
  try {
    const { FullName, Email, Password, PhoneNumber, DateOfBirth, Sex, role,
      MSSV, MSNV_Admin, MSNV_Staff,
      Department_Class, Date_Start_SignUp, Student_NoRoom, Student_Location, Student_Building,
      Salary } = req.body;

    console.log(req.body);
    const existingUser = await User.findByEmail(Email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email đã tồn tại',
      });
    }

    const user = await User.create({
      FullName,
      Email,
      Password,
      PhoneNumber,
      DateOfBirth,
      Sex,
      role,
      MSSV,
      MSNV_Admin,
      MSNV_Staff,
      Department_Class,
      Date_Start_SignUp,
      Student_NoRoom,
      Student_Location,
      Student_Building,
      Salary
    });

    const userRole = await User.getRole(user.UserID);
    const token = jwt.sign(
      { id: user.UserID, Email: user.Email, role: userRole },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      token,
      user: {
        id: user.UserID,
        Email: user.Email,
        role: userRole,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi đăng ký',
      error: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { Email } = req.body;

    if (!Email) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp địa chỉ email',
      });
    }

    const user = await User.findByEmail(Email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản với email này',
      });
    }

    const resetToken = jwt.sign(
      { id: user.UserID },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '15m' }
    );

    const expires = new Date(Date.now() + 15 * 60 * 1000);
    await User.saveResetPasswordToken(user.UserID, resetToken, expires);

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    const emailSent = await sendPasswordResetEmail(user.Email, resetUrl, user.FullName);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Không thể gửi email đặt lại mật khẩu',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi xử lý yêu cầu',
      error: error.message,
    });
  }
};

const validateResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findByResetPasswordToken(token);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token hợp lệ',
    });
  } catch (error) {
    console.error('Validate token error:', error);
    res.status(400).json({
      success: false,
      message: 'Token không hợp lệ hoặc đã hết hạn',
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { Password } = req.body;

    if (!Password) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới là bắt buộc',
      });
    }

    const user = await User.findByResetPasswordToken(token);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn',
      });
    }

    await User.update(user.UserID, { Password });

    res.status(200).json({
      success: true,
      message: 'Mật khẩu đã được đặt lại thành công',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi đặt lại mật khẩu',
      error: error.message,
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    console.log('getCurrentUser request from user:', req.user.UserID);
    
    const user = await User.findById(req.user.UserID);
    console.log('User data retrieved:', user ? 'success' : 'not found');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // We don't need to fetch role separately anymore as it's already included in the user object
    // from the enhanced findById method
    
    console.log('Sending complete user data with role');
    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

const verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.UserID);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Người dùng không tồn tại',
      });
    }

    const role = await User.getRole(user.UserID);
    res.json({
      success: true,
      user: { ...user, role },
    });
  } catch (error) {
    console.error('Lỗi xác thực token:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xác thực',
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.UserID);
    console.log('User found:', user);  // In ra user tìm được từ DB
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }
    console.log('Current Password:', currentPassword);  // In ra mật khẩu hiện tại
    console.log('New Password:', newPassword);  // In ra mật khẩu mới
    console.log('Stored Password:', user.Password);  // In ra mật khẩu đã lưu trong DB
    const isMatch = await User.comparePassword(currentPassword, user.Password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu hiện tại không đúng',
      });
    }

    await User.update(req.user.UserID, { Password: newPassword });

    res.status(200).json({
      success: true,
      message: 'Mật khẩu đã được cập nhật thành công',
    });
  } catch (error) {
    console.error('Error in changePassword:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi thay đổi mật khẩu',
      error: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.UserID;
    const { FullName, Email, PhoneNumber, DateOfBirth, Sex } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    if (Email && Email !== user.Email) {
      const existingUser = await User.findByEmail(Email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email này đã được sử dụng bởi tài khoản khác',
        });
      }
    }

    const updatedUser = await User.update(userId, {
      FullName,
      Email,
      PhoneNumber,
      DateOfBirth,
      Sex,
    });

    if (!updatedUser) {
      return res.status(400).json({
        success: false,
        message: 'Không có thông tin nào được cập nhật',
      });
    }

    const role = await User.getRole(userId);
    res.status(200).json({
      success: true,
      message: 'Thông tin cá nhân đã được cập nhật',
      user: { ...updatedUser, role },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi cập nhật thông tin cá nhân',
      error: error.message,
    });
  }
};

module.exports = {
  login,
  register,
  forgotPassword,
  validateResetToken,
  resetPassword,
  getCurrentUser,
  verifyToken,
  changePassword,
  updateProfile,
};