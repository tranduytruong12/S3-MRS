const mysql = require('mysql2');
require('dotenv').config();

// Tạo connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'SMART_LIBRARY_CNPM',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// // Kiểm tra kết nối và sử dụng connection pool
// pool.getConnection((err, connection) => {
//     if (err) {
//         console.error('Error connecting to MySQL:', err.stack);
//         return;
//     }
//     console.log('Connected to MySQL');
//     // Giải phóng kết nối lại vào pool
//     connection.release();
// });

// Sử dụng Promises để dễ dàng làm việc với async/await
module.exports = pool.promise();
