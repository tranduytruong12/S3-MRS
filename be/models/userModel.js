const db = require('../config/db');

const User = {
  findAll: async () => {
    try {
      const [rows] = await db.query('SELECT UserID, FullName, Email, PhoneNumber, DateOfBirth, Sex, Active, NoActive FROM USERS');
      return rows;
    } catch (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }
  },

  findById: async (userId) => {
    try {
      console.log('Finding user by ID:', userId);
      
      // Get user basic info
      const [users] = await db.query(
        'SELECT UserID, FullName, Email, Password, PhoneNumber, DateOfBirth, Sex, Active, NoActive FROM USERS WHERE UserID = ?',
        [userId]
      );
      
      const user = users[0] || null;
      console.log('User basic info:', user);
      
      if (!user) return null;

      // Let's get student info using a simpler, more direct query
      try {
        const [mssv] = await db.query('SELECT MSSV FROM STUDENT WHERE UserID = ?', [userId]);
        console.log('MSSV check result:', mssv);
        
        if (mssv && mssv.length > 0) {
          console.log('This is a student account. MSSV:', mssv[0].MSSV);
          
          // Now get all student details
          const [studentDetails] = await db.query(
            `SELECT * FROM STUDENT WHERE UserID = ?`,
            [userId]
          );
          
          console.log('Full student details:', studentDetails[0]);
          
          if (studentDetails && studentDetails.length > 0) {
            return {
              ...user,
              ...studentDetails[0],
              role: 'student'
            };
          }
        }
      } catch (studentErr) {
        console.error('Error fetching student data:', studentErr);
        // Continue execution even if student check fails
      }
      
      // Check if admin
      try {
        const [admins] = await db.query('SELECT MSNV_Admin, Salary FROM ADMIN WHERE UserID = ?', [userId]);
        if (admins && admins.length > 0) {
          console.log('This is an admin account');
          return {
            ...user,
            ...admins[0],
            role: 'admin'
          };
        }
      } catch (adminErr) {
        console.error('Error fetching admin data:', adminErr);
      }
      
      // Check if staff
      try {
        const [staff] = await db.query('SELECT MSNV_Staff, Salary FROM STAFF WHERE UserID = ?', [userId]);
        if (staff && staff.length > 0) {
          console.log('This is a staff account');
          return {
            ...user,
            ...staff[0],
            role: 'staff'
          };
        }
      } catch (staffErr) {
        console.error('Error fetching staff data:', staffErr);
      }
      
      // If we reached here, just return the user with a default role
      return { ...user, role: 'unknown' };
    } catch (error) {
      console.error(`Error fetching user by ID ${userId}:`, error);
      throw new Error(`Error fetching user by ID: ${error.message}`);
    }
  },

  findByEmail: async (email) => {
    try {
      const [rows] = await db.query(
        'SELECT * FROM USERS WHERE Email = ?',
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error fetching user by email: ${error.message}`);
    }
  },


  create: async (userData) => {
    const {
      FullName, Email, Password, PhoneNumber, DateOfBirth, Sex, role,
      MSSV, MSNV_Admin, MSNV_Staff,
      Department_Class, Date_Start_SignUp, Student_NoRoom, Student_Location, Student_Building,
      Salary
    } = userData;
  
    try {
      // Tìm max UserID hiện tại
      const [maxResult] = await db.query('SELECT MAX(UserID) AS maxId FROM USERS');
      const userId = (maxResult[0].maxId || 0) + 1;
  
      // Lưu người dùng
      await db.query(
        'INSERT INTO USERS (UserID, FullName, Email, Password, PhoneNumber, DateOfBirth, Sex, Active, NoActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, FullName, Email, Password, PhoneNumber, DateOfBirth, Sex, 'T', 'F']
      );
  
      // Thêm vào bảng STUDENT nếu là student
      if (role === 'student' && MSSV) {
        await db.query(
          `INSERT INTO STUDENT (UserID, MSSV, Department_Class, FullName, Date_Start_SignUp, Student_NoRoom, Student_Location, Student_Building)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, MSSV, Department_Class || null, FullName, Date_Start_SignUp || null, Student_NoRoom || null, Student_Location || null, Student_Building || null]
        );
      }
  
      // Thêm vào bảng ADMIN nếu là admin
      else if (role === 'admin' && MSNV_Admin) {
        await db.query(
          `INSERT INTO ADMIN (UserID, MSNV_Admin, Salary)
           VALUES (?, ?, ?)`,
          [userId, MSNV_Admin, Salary || null]
        );
      }
  
      // Thêm vào bảng STAFF nếu là staff
      else if (role === 'staff' && MSNV_Staff) {
        await db.query(
          `INSERT INTO STAFF (UserID, MSNV_Staff, Salary)
           VALUES (?, ?, ?)`,
          [userId, MSNV_Staff, Salary || null]
        );
      }
  
      return {
        UserID: userId, FullName, Email, PhoneNumber, DateOfBirth, Sex,
        Active: 'T', NoActive: 'F'
      };
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  },


  update: async (userId, updateData) => {
    const { FullName, Email, Password, PhoneNumber, DateOfBirth, Sex } = updateData;
    try {
      const updateFields = {};
      if (FullName) updateFields.FullName = FullName;
      if (Email) updateFields.Email = Email;
      if (PhoneNumber) updateFields.PhoneNumber = PhoneNumber;
      if (DateOfBirth) updateFields.DateOfBirth = DateOfBirth;
      if (Sex) updateFields.Sex = Sex;

      // Nếu mật khẩu được thay đổi, thì lưu mật khẩu thô mới
      if (Password) {
        updateFields.Password = Password;
      }

      if (Object.keys(updateFields).length === 0) {
        return null;
      }

      const setClause = Object.keys(updateFields)
        .map((key) => `${key} = ?`)
        .join(', ');
      const values = Object.values(updateFields);

      await db.query(
        `UPDATE USERS SET ${setClause} WHERE UserID = ?`,
        [...values, userId]
      );

      return await User.findById(userId);
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  },

  delete: async (userId) => {
    try {
      // Xác định vai trò của người dùng
      const role = await User.getRole(userId);
  
      // Xóa dữ liệu trong bảng role tương ứng
      if (role === 'student') {
        await db.query('DELETE FROM STUDENT WHERE UserID = ?', [userId]);
      } else if (role === 'admin') {
        await db.query('DELETE FROM ADMIN WHERE UserID = ?', [userId]);
      } else if (role === 'staff') {
        await db.query('DELETE FROM STAFF WHERE UserID = ?', [userId]);
      }
  
      // Xóa người dùng trong bảng USERS
      await db.query('DELETE FROM USERS WHERE UserID = ?', [userId]);
  
      return true;
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  },


  comparePassword: async (candidatePassword, storedPassword) => {
    try {
      // So sánh mật khẩu thô
      return candidatePassword === storedPassword;
    } catch (error) {
      throw new Error(`Password comparison error: ${error.message}`);
    }
  },


  getRole: async (userId) => {
    try {
      const [student] = await db.query('SELECT * FROM STUDENT WHERE UserID = ?', [userId]);
      if (student.length > 0) return 'student';

      const [admin] = await db.query('SELECT * FROM ADMIN WHERE UserID = ?', [userId]);
      if (admin.length > 0) return 'admin';

      const [staff] = await db.query('SELECT * FROM STAFF WHERE UserID = ?', [userId]);
      if (staff.length > 0) return 'staff';

    } catch (error) {
      throw new Error(`Error checking role: ${error.message}`);
    }
  },


  saveResetPasswordToken: async (userId, token, expires) => {
    try {
      await db.query(
        'UPDATE USERS SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE UserID = ?',
        [token, expires, userId]
      );
    } catch (error) {
      throw new Error(`Error saving reset password token: ${error.message}`);
    }
  },


  findByResetPasswordToken: async (token) => {
    try {
      const [rows] = await db.query(
        'SELECT * FROM USERS WHERE resetPasswordToken = ? AND resetPasswordExpires > NOW()',
        [token]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error finding user by reset token: ${error.message}`);
    }
  },

  getMSSVByUserID: async (userId) => {
    try {
      const [rows] = await db.query(
        `SELECT MSSV FROM STUDENT WHERE UserID = ?`,
        [userId]
      );
      return rows[0]?.MSSV || null;
    } catch (error) {
      throw new Error(`Error fetching MSSV by UserID: ${error.message}`);
    }
  },
};

module.exports = { User };
