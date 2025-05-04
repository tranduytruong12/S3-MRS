# SMART_LIBRARY_CNPM

Backend cho hệ thống quản lý thư viện thông minh HCMUT_SSPS.

## Cấu trúc dự án
- `config/`: Cấu hình kết nối MySQL.
- `controllers/`: Xử lý logic API.
- `models/`: Logic truy vấn cơ sở dữ liệu.
- `routes/`: Định nghĩa các tuyến API.
- `middleware/`: Middleware (xác thực, lỗi).
- `.env`: Biến môi trường.
- `app.js`: File chính khởi động server.

## Yêu cầu
- Node.js
- MySQL

## Cài đặt


# API user_report

1. AUTH ROUTE 

login: đăng nhập
register: đăng kí
me: xem thông tin chính mình
change-password: đổi mật khẩu
profile: cập nhập thông tin chính mình
forgot-password:quên mật khẩu

curl -X POST http://localhost:8080/api/auth/login \
-H "Content-Type: application/json" \
-d "{\"Email\": \"a@hcmut.edu.vn\", \"Password\": \"passA\"}"
curl -X POST http://localhost:8080/api/auth/register -H "Content-Type: application/json" -d "{\"FullName\":\"John Doe\",\"Email\":\"phuc.hoang1052004@hcmut.edu.vn\",\"Password\":\"password123\",\"PhoneNumber\":\"123456789\",\"DateOfBirth\":\"1990-01-01\",\"Sex\":\"M\",\"role\":\"staff\",\"MSNV_Staff\":\"123456\"}"
curl -X GET http://localhost:8080/api/auth/me -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiRW1haWwiOiJhQGhjbXV0LmVkdS52biIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NjAwNDU3MiwiZXhwIjoxNzQ2MDkwOTcyfQ.VOZE09X6EnGLy_JQ90Ugy-Gi11HVvc64zxZ6FMJSk_M"
curl -X PUT http://localhost:8080/api/auth/change-password -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsIkVtYWlsIjoicGh1Yy5ob2FuZzEwNTIwMDRAaGNtdXQuZWR1LnZuIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3NDYwMTc5NDcsImV4cCI6MTc0NjEwNDM0N30.mTf1KmkAsJpDOzyIFvKdK8t-x1fH_tmZAjPg7NbC07M" -d "{\"currentPassword\":\"password123\",\"newPassword\":\"phuc123\"}"
curl -X PUT http://localhost:8080/api/auth/profile -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsIkVtYWlsIjoicGh1Yy5ob2FuZzEwNTIwMDRAaGNtdXQuZWR1LnZuIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3NDYwMTg0MDgsImV4cCI6MTc0NjEwNDgwOH0.VVWxs-_ZgaCCDeKoIWcL0WZIHq-7GUTp5C_0580thXE" -d "{\"FullName\":\"John Doe\",\"Email\":\"johndoe@example.com\",\"PhoneNumber\":\"123456789\",\"DateOfBirth\":\"1990-01-01\",\"Sex\":\"M\"}"
curl -X POST http://localhost:8080/api/auth/forgot-password -H "Content-Type: application/json" -d "{\"Email\":\"phuc.hoang1052004@hcmut.edu.vn\"}"



2. USER ROUTE (FOR ADMIN ONLY)


GET /1: xem thông tin user 1 (GET /:xem thông tin toàn bộ)
PUT /11: Sửa thông tin user 11
DELETE /11: xoá user 11

curl -X GET http://localhost:8080/api/users/1 -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsIkVtYWlsIjoiam9obmRvZUBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NjAxODY3OCwiZXhwIjoxNzQ2MTA1MDc4fQ.kZ3hDiQPz7j8t4CMmDvBpwqeVtC-MQwtRRzeMtfSWJM"
curl -X PUT http://localhost:8080/api/users/11 -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsIkVtYWlsIjoiam9obmRvZUBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NjAxODk4NywiZXhwIjoxNzQ2MTA1Mzg3fQ.pRClsa50xZCaDNeDC8Buz6FtTMGUorgV-W3T0TfWrPU" -d "{\"FullName\":\"John Doe\",\"Email\":\"johndew@example.com\",\"Password\":\"newPassword123\",\"PhoneNumber\":\"123456789\",\"DateOfBirth\":\"1990-01-01\",\"Sex\":\"M\"}"
curl -X DELETE http://localhost:8080/api/users/11 -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiRW1haWwiOiJhQGhjbXV0LmVkdS52biIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NjAxNjI5OCwiZXhwIjoxNzQ2MTAyNjk4fQ.NY9qNMI631GfuYzZ6tS7vK335dgIW-hevkmyb7KTUCA"


REPORTS ROUTE (FOR ADMIN ONLY)

curl -X POST http://localhost:8080/api/reports/generate -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiRW1haWwiOiJhQGhjbXV0LmVkdS52biIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NjAyMjEyNCwiZXhwIjoxNzQ2MTA4NTI0fQ.YYc0yCf5czIwZbuqjr3SvZoeIBRVbsJ1ZcqVLR2IeXM" -d "{\"Report_Date\":\"2025-04-30\",\"Content\":\"Report content here\",\"Date_Sent\":\"2025-04-30\",\"Amount\":100,\"MSNV_Staff_Report\":123456}"
curl -X GET http://localhost:8080/api/reports/view -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiRW1haWwiOiJhQGhjbXV0LmVkdS52biIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NjAyMjEyNCwiZXhwIjoxNzQ2MTA4NTI0fQ.YYc0yCf5czIwZbuqjr3SvZoeIBRVbsJ1ZcqVLR2IeXM"
curl -X PUT http://localhost:8080/api/reports/update/1 -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiRW1haWwiOiJhQGhjbXV0LmVkdS52biIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NjAyMjEyNCwiZXhwIjoxNzQ2MTA4NTI0fQ.YYc0yCf5czIwZbuqjr3SvZoeIBRVbsJ1ZcqVLR2IeXM" -d "{\"Content\":\"Updated report content\",\"Amount\":200}"
curl -X DELETE http://localhost:8080/api/reports/delete/1 -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiRW1haWwiOiJhQGhjbXV0LmVkdS52biIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NjAyMjEyNCwiZXhwIjoxNzQ2MTA4NTI0fQ.YYc0yCf5czIwZbuqjr3SvZoeIBRVbsJ1ZcqVLR2IeXM"


Ghi chú:

CÁC ROUTE ĐANG ĐƯỢC TEST Ở node server.js 
CHƯA CÓ forgot-password do chưa lưu được reset token vào database
# Get all notifications
curl -X GET http://localhost:8080/api/notifications -H "Authorization: Bearer <your_token>"

# Get a specific notification by ID
curl -X GET http://localhost:8080/api/notifications/1 -H "Authorization: Bearer <your_token>"

# Create a new notification
curl -X POST http://localhost:8080/api/notifications -H "Content-Type: application/json" -H "Authorization: Bearer <your_token>" -d "{
  \"Statistical\": \"Thông báo thiết bị\",
  \"Content\": \"Bảo trì máy chiếu phòng 101\",
  \"Date_s\": \"2025-04-10\",
  \"Read_s\": \"F\",
  \"News\": \"T\",
  \"Notification_Before_Time\": \"2025-04-09 09:00:00\",
  \"MSSV_Notification\": 2010001,
  \"MSNV_Admin_Notification\": 30001
}"



VD:
curl -X POST http://localhost:8080/api/equipment -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsIkVtYWlsIjoicGh1Yy5ob2FuZzEwNTIwMDRAaGNtdXQuZWR1LnZuIiwicm9sZSI6InN0YWZmIiwiaWF0IjoxNzQ2MjE5Mzg5LCJleHAiOjE3NDYzMDU3ODl9.jifboirr2N6UQeThuI9_ninkzaC9VuuPARPCp3dV4kc" -H "Content-Type: application/json" -d "{\"MTB\":505,\"Name_s\":\"Máy in\",\"Amount\":1,\"TimeStart\":\"2025-05-01 08:00:00\",\"TimeEnd\":\"2025-05-01 10:00:00\",\"Status\":\"Tốt\",\"MSSV_Equipment\":2010001,\"MSNV_Staff_Equipment\":40001}"
# Update a notification by ID
curl -X PUT http://localhost:8080/api/notifications/1 -H "Content-Type: application/json" -H "Authorization: Bearer <your_token>" -d "{
  \"Content\": \"Updated notification content\",
  \"Read_s\": \"T\"
}"

# Delete a notification by ID
curl -X DELETE http://localhost:8080/api/notifications/1 -H "Authorization: Bearer <your_token>"
# Get all equipment
curl -X GET http://localhost:8080/api/equipment -H "Authorization: Bearer <your_token>"

# Get a specific equipment by ID
curl -X GET http://localhost:8080/api/equipment/501 -H "Authorization: Bearer <your_token>"

# Create a new equipment
curl -X POST http://localhost:8080/api/equipment -H "Content-Type: application/json" -H "Authorization: Bearer <your_token>" -d "{
  \"MTB\": 505,
  \"Name_s\": \"Máy in\",
  \"Amount\": 1,
  \"TimeStart\": \"2025-05-01 08:00:00\",
  \"TimeEnd\": \"2025-05-01 10:00:00\",
  \"Status\": \"Tốt\",
  \"MSSV_Equipment\": 2010002,
  \"MSNV_Staff_Equipment\": 40001
}"

# Update equipment by ID
curl -X PUT http://localhost:8080/api/equipment/501 -H "Content-Type: application/json" -H "Authorization: Bearer <your_token>" -d "{
  \"Status\": \"Bảo trì\"
}"

# Delete equipment by ID
curl -X DELETE http://localhost:8080/api/equipment/501 -H "Authorization: Bearer <your_token>"
