-- 1. Tạo cơ sở dữ liệu
CREATE DATABASE IF NOT EXISTS SMART_LIBRARY_CNPM;
USE SMART_LIBRARY_CNPM;
SET foreign_key_checks = 0;
CREATE TABLE USERS (
    UserID INT PRIMARY KEY,
    FullName VARCHAR(50) NOT NULL,
    Email VARCHAR(100) NOT NULL,
    Password VARCHAR(100) NOT NULL,
    PhoneNumber VARCHAR(15),
    DateOfBirth DATE,
    Sex CHAR(1) CHECK (Sex IN ('M', 'F')),
    Active CHAR(1) CHECK (Active IN ('T', 'F')),
    NoActive CHAR(1) CHECK (NoActive IN ('T', 'F'))
);
CREATE TABLE STUDENT (
    UserID INT,
    MSSV INT,
    UNIQUE(MSSV),
    Department_Class VARCHAR(50),
    FullName VARCHAR(50),
    Date_Start_SignUp DATE,
    Student_NoRoom INT,
    Student_Location VARCHAR(10),
    Student_Building VARCHAR(10),
    PRIMARY KEY(UserID, MSSV),
    FOREIGN KEY (UserID) REFERENCES USERS(UserID) ON DELETE CASCADE,
    FOREIGN KEY (Student_NoRoom, Student_Location, Student_Building)
        REFERENCES SPACE_ROOM(NoRoom, Location, Building) ON DELETE SET NULL
);
CREATE TABLE ADMIN (
    UserID INT,
    MSNV_Admin INT,
    Salary DECIMAL(10,2),
    PRIMARY KEY(UserID, MSNV_Admin),
    UNIQUE(MSNV_Admin),
    FOREIGN KEY (UserID) REFERENCES USERS(UserID) ON DELETE CASCADE
);
CREATE TABLE STAFF (
    UserID INT,
    MSNV_Staff INT ,
    Salary DECIMAL(10,2),
    PRIMARY KEY(UserID, MSNV_Staff),
	UNIQUE(MSNV_Staff),
    FOREIGN KEY (UserID) REFERENCES USERS(UserID) ON DELETE CASCADE
);
CREATE TABLE SPACE_ROOM (
    NoRoom INT ,
    TypeRoom VARCHAR(50),
    Amount INT,
    QRCheckIn VARCHAR(100),
    QRCheckOut VARCHAR(100),
    Emptys INT,
    NoEmpty INT,
    MSNV_Admin_Room INT,
    Location VARCHAR(50),
    Building VARCHAR(50),
    PRIMARY KEY(NoRoom,Location,Building),
    FOREIGN KEY (MSNV_Admin_Room) REFERENCES ADMIN(MSNV_Admin) ON DELETE SET NULL
);

-- New ROOM_STATUS table to track room availability by time section
CREATE TABLE ROOM_STATUS (
    StatusID INT AUTO_INCREMENT PRIMARY KEY,
    NoRoom INT,
    Location VARCHAR(50),
    Building VARCHAR(50),
    TimeSection INT CHECK (TimeSection BETWEEN 1 AND 5),
    Status ENUM('available', 'occupied', 'processing') DEFAULT 'available',
    Date_in_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') DEFAULT 'monday',
    UNIQUE KEY(NoRoom, Location, Building, TimeSection, Date_in_week),
    FOREIGN KEY (NoRoom, Location, Building) 
        REFERENCES SPACE_ROOM(NoRoom, Location, Building) ON DELETE CASCADE
);

-- Create RESERVATION table to track room bookings
CREATE TABLE RESERVATION (
    ReservationID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    NoRoom INT NOT NULL,
    Location VARCHAR(50) NOT NULL,
    Building VARCHAR(50) NOT NULL,
    Date_in_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday') NOT NULL,
    TimeSection INT NOT NULL CHECK (TimeSection BETWEEN 1 AND 5),
    Purpose TEXT,
    NumberOfParticipants INT NOT NULL,
    Notes TEXT,
    Status ENUM('Pending', 'Confirmed', 'Completed', 'Cancelled') DEFAULT 'Pending',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES USERS(UserID) ON DELETE CASCADE,
    FOREIGN KEY (NoRoom, Location, Building) REFERENCES SPACE_ROOM(NoRoom, Location, Building) ON DELETE CASCADE
);

-- Create new EQUIPMENT table with simpler structure
CREATE TABLE EQUIPMENT (
    MTB INT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Amount INT NOT NULL DEFAULT 1,
    Status ENUM('Sẵn sàng', 'Đang sử dụng', 'Bảo trì', 'Hỏng') DEFAULT 'Sẵn sàng'
);

CREATE TABLE NOTIFICATION (
    STT INT PRIMARY KEY,
    Statistical VARCHAR(100),
    Content TEXT,
    Date_s DATE,
    Read_s CHAR(1),
    News CHAR(1),
    Notification_Before_Time DATETIME,
    MSSV_Notification INT,
    MSNV_Admin_Notification INT,
    FOREIGN KEY (MSSV_Notification) REFERENCES STUDENT(MSSV) ON DELETE CASCADE,
    FOREIGN KEY (MSNV_Admin_Notification) REFERENCES ADMIN(MSNV_Admin) ON DELETE CASCADE
);
CREATE TABLE REPORT (
    STT INT PRIMARY KEY,
    Report_Date DATE,
    Content TEXT,
    Date_Sent DATE,
    Amount INT,
    MSNV_Staff_Report INT,
    FOREIGN KEY (MSNV_Staff_Report) REFERENCES STAFF(MSNV_Staff) ON DELETE CASCADE
);
SET foreign_key_checks = 1;
SET foreign_key_checks = 0;
INSERT INTO USERS (UserID, FullName, Email, Password, PhoneNumber, DateOfBirth, Sex, Active, NoActive)
VALUES
(1, 'Nguyen Van A', 'a@hcmut.edu.vn', 'passA', '0123456789', '2002-01-01', 'M', 'T', 'F'),
(2, 'Tran Thi B', 'b@hcmut.edu.vn', 'passB', '0123456790', '2001-03-15', 'F', 'T', 'F'),
(3, 'Le Van C', 'c@hcmut.edu.vn', 'passC', '0123456791', '2003-06-30', 'M', 'F', 'T'),
(4, 'Pham Thi D', 'd@hcmut.edu.vn', 'passD', '0123456792', '2000-12-12', 'F', 'T', 'F'),
(5, 'Hoang Van E', 'e@hcmut.edu.vn', 'passE', '0123456793', '2002-05-09', 'M', 'T', 'F'),
(6, 'Nguyen Van F', 'f@hcmut.edu.vn', 'passF', '0123456794', '2001-08-21', 'M', 'F', 'T'),
(7, 'Tran Thi G', 'g@hcmut.edu.vn', 'passG', '0123456795', '2002-11-01', 'F', 'T', 'F'),
(8, 'Le Van H', 'h@hcmut.edu.vn', 'passH', '0123456796', '2001-02-18', 'M', 'T', 'F'),
(9, 'Pham Thi I', 'i@hcmut.edu.vn', 'passI', '0123456797', '2000-10-10', 'F', 'T', 'F'),
(10,'Hoang Van J', 'j@hcmut.edu.vn', 'passJ', '0123456798', '2003-07-07', 'M', 'T', 'F');
INSERT INTO STUDENT (UserID, MSSV, Department_Class, FullName, Date_Start_SignUp, Student_NoRoom, Student_Location, Student_Building)
VALUES
(1, 2010001, 'CTTT-K22', 'Nguyen Van A', '2022-09-01', 101, 'KhuA', 'A1'),
(2, 2010002, 'CLC-K23', 'Tran Thi B', '2022-09-01', 102, 'KhuA', 'A1'),
(3, 2010003, 'CS-K21', 'Le Van C', '2021-09-01', 103, 'KhuA', 'A2'),
(4, 2010004, 'CTTT-K22', 'Pham Thi D', '2022-09-01', 101, 'KhuA', 'A1'),
(5, 2010005, 'CLC-K24', 'Hoang Van E', '2023-09-01', 104, 'KhuB', 'B1'),
(6, 2010006, 'CS-K20', 'Nguyen Van F', '2020-09-01', 102, 'KhuA', 'A1'),
(7, 2010007, 'CTTT-K21', 'Tran Thi G', '2021-09-01', 105, 'KhuB', 'B1'),
(8, 2010008, 'CS-K23', 'Le Van H', '2022-09-01', 106, 'KhuC', 'C1'),
(9, 2010009, 'CS-K22', 'Pham Thi I', '2022-09-01', 106, 'KhuC', 'C1'),
(10,2010010, 'CS-K24', 'Hoang Van J', '2023-09-01', 104, 'KhuB', 'B1');
INSERT INTO STAFF (UserID, MSNV_Staff, Salary)
VALUES
(6, 40001, 8000000.00),
(7, 40002, 9000000.00);
INSERT INTO SPACE_ROOM (NoRoom, TypeRoom, Amount, QRCheckIn, QRCheckOut, Emptys, NoEmpty, MSNV_Admin_Room, Location, Building)
VALUES
(101, 'Phòng nhóm', 8, 'QRin101', 'QRout101', 2, 6, 30001, 'KhuA', 'A1'),
(102, 'Phòng cá nhân', 4, 'QRin102', 'QRout102', 1, 3, 30001, 'KhuA', 'A1'),
(103, 'Phòng nhóm', 10, 'QRin103', 'QRout103', 5, 5, 30001, 'KhuA', 'A2'),
(104, 'Phòng hội thảo', 15, 'QRin104', 'QRout104', 3, 12, 30002, 'KhuB', 'B1'),
(105, 'Phòng nhóm', 6, 'QRin105', 'QRout105', 2, 4, 30002, 'KhuB', 'B1'),
(106, 'Phòng cá nhân', 2, 'QRin106', 'QRout106', 0, 2, 30002, 'KhuC', 'C1');

-- Insert sample data for ROOM_STATUS with time sections and room availability
-- For each day of the week (Monday to Friday)
-- Time Section 1: 7:00 - 8:50
-- Time Section 2: 9:00 - 10:50
-- Time Section 3: 11:00 - 12:50
-- Time Section 4: 13:00 - 14:50
-- Time Section 5: 15:00 - 16:50

-- Monday data
INSERT INTO ROOM_STATUS (NoRoom, Location, Building, TimeSection, Status, Date_in_week)
VALUES
-- Room 101, KhuA, A1
(101, 'KhuA', 'A1', 1, 'available', 'monday'),
(101, 'KhuA', 'A1', 2, 'occupied', 'monday'),
(101, 'KhuA', 'A1', 3, 'available', 'monday'),
(101, 'KhuA', 'A1', 4, 'occupied', 'monday'),
(101, 'KhuA', 'A1', 5, 'available', 'monday'),

-- Room 102, KhuA, A1
(102, 'KhuA', 'A1', 1, 'occupied', 'monday'),
(102, 'KhuA', 'A1', 2, 'available', 'monday'),
(102, 'KhuA', 'A1', 3, 'available', 'monday'),
(102, 'KhuA', 'A1', 4, 'occupied', 'monday'),
(102, 'KhuA', 'A1', 5, 'occupied', 'monday'),

-- Room 103, KhuA, A2
(103, 'KhuA', 'A2', 1, 'occupied', 'monday'),
(103, 'KhuA', 'A2', 2, 'occupied', 'monday'),
(103, 'KhuA', 'A2', 3, 'available', 'monday'),
(103, 'KhuA', 'A2', 4, 'available', 'monday'),
(103, 'KhuA', 'A2', 5, 'available', 'monday'),

-- Room 104, KhuB, B1
(104, 'KhuB', 'B1', 1, 'available', 'monday'),
(104, 'KhuB', 'B1', 2, 'available', 'monday'),
(104, 'KhuB', 'B1', 3, 'occupied', 'monday'),
(104, 'KhuB', 'B1', 4, 'occupied', 'monday'),
(104, 'KhuB', 'B1', 5, 'occupied', 'monday'),

-- Room 105, KhuB, B1
(105, 'KhuB', 'B1', 1, 'available', 'monday'),
(105, 'KhuB', 'B1', 2, 'available', 'monday'),
(105, 'KhuB', 'B1', 3, 'available', 'monday'),
(105, 'KhuB', 'B1', 4, 'occupied', 'monday'),
(105, 'KhuB', 'B1', 5, 'available', 'monday'),

-- Room 106, KhuC, C1
(106, 'KhuC', 'C1', 1, 'occupied', 'monday'),
(106, 'KhuC', 'C1', 2, 'occupied', 'monday'),
(106, 'KhuC', 'C1', 3, 'occupied', 'monday'),
(106, 'KhuC', 'C1', 4, 'available', 'monday'),
(106, 'KhuC', 'C1', 5, 'available', 'monday');

-- Tuesday data
INSERT INTO ROOM_STATUS (NoRoom, Location, Building, TimeSection, Status, Date_in_week)
VALUES
-- Room 101, KhuA, A1
(101, 'KhuA', 'A1', 1, 'available', 'tuesday'),
(101, 'KhuA', 'A1', 2, 'occupied', 'tuesday'),
(101, 'KhuA', 'A1', 3, 'available', 'tuesday'),
(101, 'KhuA', 'A1', 4, 'occupied', 'tuesday'),
(101, 'KhuA', 'A1', 5, 'available', 'tuesday'),

-- Room 102, KhuA, A1
(102, 'KhuA', 'A1', 1, 'occupied', 'tuesday'),
(102, 'KhuA', 'A1', 2, 'available', 'tuesday'),
(102, 'KhuA', 'A1', 3, 'available', 'tuesday'),
(102, 'KhuA', 'A1', 4, 'occupied', 'tuesday'),
(102, 'KhuA', 'A1', 5, 'occupied', 'tuesday'),

-- Room 103, KhuA, A2
(103, 'KhuA', 'A2', 1, 'occupied', 'tuesday'),
(103, 'KhuA', 'A2', 2, 'occupied', 'tuesday'),
(103, 'KhuA', 'A2', 3, 'available', 'tuesday'),
(103, 'KhuA', 'A2', 4, 'available', 'tuesday'),
(103, 'KhuA', 'A2', 5, 'available', 'tuesday'),

-- Room 104, KhuB, B1
(104, 'KhuB', 'B1', 1, 'available', 'tuesday'),
(104, 'KhuB', 'B1', 2, 'available', 'tuesday'),
(104, 'KhuB', 'B1', 3, 'occupied', 'tuesday'),
(104, 'KhuB', 'B1', 4, 'occupied', 'tuesday'),
(104, 'KhuB', 'B1', 5, 'occupied', 'tuesday'),

-- Room 105, KhuB, B1
(105, 'KhuB', 'B1', 1, 'available', 'tuesday'),
(105, 'KhuB', 'B1', 2, 'available', 'tuesday'),
(105, 'KhuB', 'B1', 3, 'available', 'tuesday'),
(105, 'KhuB', 'B1', 4, 'occupied', 'tuesday'),
(105, 'KhuB', 'B1', 5, 'available', 'tuesday'),

-- Room 106, KhuC, C1
(106, 'KhuC', 'C1', 1, 'occupied', 'tuesday'),
(106, 'KhuC', 'C1', 2, 'occupied', 'tuesday'),
(106, 'KhuC', 'C1', 3, 'occupied', 'tuesday'),
(106, 'KhuC', 'C1', 4, 'available', 'tuesday'),
(106, 'KhuC', 'C1', 5, 'available', 'tuesday');

-- Wednesday data
INSERT INTO ROOM_STATUS (NoRoom, Location, Building, TimeSection, Status, Date_in_week)
VALUES
-- Room 101, KhuA, A1
(101, 'KhuA', 'A1', 1, 'available', 'wednesday'),
(101, 'KhuA', 'A1', 2, 'occupied', 'wednesday'),
(101, 'KhuA', 'A1', 3, 'available', 'wednesday'),
(101, 'KhuA', 'A1', 4, 'occupied', 'wednesday'),
(101, 'KhuA', 'A1', 5, 'available', 'wednesday'),

-- Room 102, KhuA, A1
(102, 'KhuA', 'A1', 1, 'occupied', 'wednesday'),
(102, 'KhuA', 'A1', 2, 'available', 'wednesday'),
(102, 'KhuA', 'A1', 3, 'available', 'wednesday'),
(102, 'KhuA', 'A1', 4, 'occupied', 'wednesday'),
(102, 'KhuA', 'A1', 5, 'occupied', 'wednesday'),

-- Room 103, KhuA, A2
(103, 'KhuA', 'A2', 1, 'occupied', 'wednesday'),
(103, 'KhuA', 'A2', 2, 'occupied', 'wednesday'),
(103, 'KhuA', 'A2', 3, 'available', 'wednesday'),
(103, 'KhuA', 'A2', 4, 'available', 'wednesday'),
(103, 'KhuA', 'A2', 5, 'available', 'wednesday'),

-- Room 104, KhuB, B1
(104, 'KhuB', 'B1', 1, 'available', 'wednesday'),
(104, 'KhuB', 'B1', 2, 'available', 'wednesday'),
(104, 'KhuB', 'B1', 3, 'occupied', 'wednesday'),
(104, 'KhuB', 'B1', 4, 'occupied', 'wednesday'),
(104, 'KhuB', 'B1', 5, 'occupied', 'wednesday'),

-- Room 105, KhuB, B1
(105, 'KhuB', 'B1', 1, 'available', 'wednesday'),
(105, 'KhuB', 'B1', 2, 'available', 'wednesday'),
(105, 'KhuB', 'B1', 3, 'available', 'wednesday'),
(105, 'KhuB', 'B1', 4, 'occupied', 'wednesday'),
(105, 'KhuB', 'B1', 5, 'available', 'wednesday'),

-- Room 106, KhuC, C1
(106, 'KhuC', 'C1', 1, 'occupied', 'wednesday'),
(106, 'KhuC', 'C1', 2, 'occupied', 'wednesday'),
(106, 'KhuC', 'C1', 3, 'occupied', 'wednesday'),
(106, 'KhuC', 'C1', 4, 'available', 'wednesday'),
(106, 'KhuC', 'C1', 5, 'available', 'wednesday');

-- Thursday data
INSERT INTO ROOM_STATUS (NoRoom, Location, Building, TimeSection, Status, Date_in_week)
VALUES
-- Room 101, KhuA, A1
(101, 'KhuA', 'A1', 1, 'available', 'thursday'),
(101, 'KhuA', 'A1', 2, 'occupied', 'thursday'),
(101, 'KhuA', 'A1', 3, 'available', 'thursday'),
(101, 'KhuA', 'A1', 4, 'occupied', 'thursday'),
(101, 'KhuA', 'A1', 5, 'available', 'thursday'),

-- Room 102, KhuA, A1
(102, 'KhuA', 'A1', 1, 'occupied', 'thursday'),
(102, 'KhuA', 'A1', 2, 'available', 'thursday'),
(102, 'KhuA', 'A1', 3, 'available', 'thursday'),
(102, 'KhuA', 'A1', 4, 'occupied', 'thursday'),
(102, 'KhuA', 'A1', 5, 'occupied', 'thursday'),

-- Room 103, KhuA, A2
(103, 'KhuA', 'A2', 1, 'occupied', 'thursday'),
(103, 'KhuA', 'A2', 2, 'occupied', 'thursday'),
(103, 'KhuA', 'A2', 3, 'available', 'thursday'),
(103, 'KhuA', 'A2', 4, 'available', 'thursday'),
(103, 'KhuA', 'A2', 5, 'available', 'thursday'),

-- Room 104, KhuB, B1
(104, 'KhuB', 'B1', 1, 'available', 'thursday'),
(104, 'KhuB', 'B1', 2, 'available', 'thursday'),
(104, 'KhuB', 'B1', 3, 'occupied', 'thursday'),
(104, 'KhuB', 'B1', 4, 'occupied', 'thursday'),
(104, 'KhuB', 'B1', 5, 'occupied', 'thursday'),

-- Room 105, KhuB, B1
(105, 'KhuB', 'B1', 1, 'available', 'thursday'),
(105, 'KhuB', 'B1', 2, 'available', 'thursday'),
(105, 'KhuB', 'B1', 3, 'available', 'thursday'),
(105, 'KhuB', 'B1', 4, 'occupied', 'thursday'),
(105, 'KhuB', 'B1', 5, 'available', 'thursday'),

-- Room 106, KhuC, C1
(106, 'KhuC', 'C1', 1, 'occupied', 'thursday'),
(106, 'KhuC', 'C1', 2, 'occupied', 'thursday'),
(106, 'KhuC', 'C1', 3, 'occupied', 'thursday'),
(106, 'KhuC', 'C1', 4, 'available', 'thursday'),
(106, 'KhuC', 'C1', 5, 'available', 'thursday');

-- Friday data
INSERT INTO ROOM_STATUS (NoRoom, Location, Building, TimeSection, Status, Date_in_week)
VALUES
-- Room 101, KhuA, A1
(101, 'KhuA', 'A1', 1, 'available', 'friday'),
(101, 'KhuA', 'A1', 2, 'occupied', 'friday'),
(101, 'KhuA', 'A1', 3, 'available', 'friday'),
(101, 'KhuA', 'A1', 4, 'occupied', 'friday'),
(101, 'KhuA', 'A1', 5, 'available', 'friday'),

-- Room 102, KhuA, A1
(102, 'KhuA', 'A1', 1, 'occupied', 'friday'),
(102, 'KhuA', 'A1', 2, 'available', 'friday'),
(102, 'KhuA', 'A1', 3, 'available', 'friday'),
(102, 'KhuA', 'A1', 4, 'occupied', 'friday'),
(102, 'KhuA', 'A1', 5, 'occupied', 'friday'),

-- Room 103, KhuA, A2
(103, 'KhuA', 'A2', 1, 'occupied', 'friday'),
(103, 'KhuA', 'A2', 2, 'occupied', 'friday'),
(103, 'KhuA', 'A2', 3, 'available', 'friday'),
(103, 'KhuA', 'A2', 4, 'available', 'friday'),
(103, 'KhuA', 'A2', 5, 'available', 'friday'),

-- Room 104, KhuB, B1
(104, 'KhuB', 'B1', 1, 'available', 'friday'),
(104, 'KhuB', 'B1', 2, 'available', 'friday'),
(104, 'KhuB', 'B1', 3, 'occupied', 'friday'),
(104, 'KhuB', 'B1', 4, 'occupied', 'friday'),
(104, 'KhuB', 'B1', 5, 'occupied', 'friday'),

-- Room 105, KhuB, B1
(105, 'KhuB', 'B1', 1, 'available', 'friday'),
(105, 'KhuB', 'B1', 2, 'available', 'friday'),
(105, 'KhuB', 'B1', 3, 'available', 'friday'),
(105, 'KhuB', 'B1', 4, 'occupied', 'friday'),
(105, 'KhuB', 'B1', 5, 'available', 'friday'),

-- Room 106, KhuC, C1
(106, 'KhuC', 'C1', 1, 'occupied', 'friday'),
(106, 'KhuC', 'C1', 2, 'occupied', 'friday'),
(106, 'KhuC', 'C1', 3, 'occupied', 'friday'),
(106, 'KhuC', 'C1', 4, 'available', 'friday'),
(106, 'KhuC', 'C1', 5, 'available', 'friday');

-- Insert sample equipment data
INSERT INTO EQUIPMENT (MTB, Name, Amount, Status) VALUES 
(501, 'Máy chiếu', 5, 'Sẵn sàng'),
(502, 'Micro không dây', 10, 'Sẵn sàng'),
(503, 'Laptop Dell XPS', 3, 'Sẵn sàng'),
(504, 'Bảng flipchart', 8, 'Sẵn sàng'),
(505, 'Loa bluetooth', 6, 'Sẵn sàng'),
(506, 'Adapter HDMI', 15, 'Sẵn sàng'),
(507, 'Màn hình phụ', 4, 'Sẵn sàng'),
(508, 'Tripod camera', 5, 'Sẵn sàng'),
(509, 'Thiết bị ghi âm', 7, 'Sẵn sàng');

-- Set some equipment as being used or under maintenance for testing
UPDATE EQUIPMENT SET Status = 'Bảo trì' WHERE MTB = 505;
UPDATE EQUIPMENT SET Status = 'Hỏng' WHERE MTB = 509; 

INSERT INTO NOTIFICATION (STT, Statistical, Content, Date_s, Read_s, News, Notification_Before_Time, MSSV_Notification, MSNV_Admin_Notification)
VALUES
(1, 'Thông báo thiết bị', 'Bảo trì máy chiếu phòng 101', '2025-04-10', 'F', 'T', '2025-04-09 09:00:00', 2010001, 30001),
(2, 'Nhắc lịch', 'Bạn có lịch học tại phòng 104', '2025-04-12', 'T', 'T', '2025-04-11 08:00:00', 2010005, 30002);
INSERT INTO REPORT (STT, Report_Date, Content, Date_Sent, Amount, MSNV_Staff_Report)
VALUES
(1, '2025-04-10', 'Máy chiếu phòng 103 bị lỗi nguồn', '2025-04-11', 1, 40001),
(2, '2025-04-12', 'Laptop không khởi động được', '2025-04-13', 2, 40002);
DELIMITER //
SET foreign_key_checks = 1;
CREATE TRIGGER update_equipment_status_after_return
BEFORE UPDATE ON EQUIPMENT
FOR EACH ROW
BEGIN
    IF NEW.TimeEnd < NOW() THEN
        SET NEW.Status = 'Còn trống ';
    END IF;
END;//
DELIMITER ;

-- Trigger: Tự động cập nhật trạng thái phòng khi số lượng chỗ trống thay đổi
DELIMITER //
CREATE TRIGGER auto_update_room_status
AFTER UPDATE ON SPACE_ROOM
FOR EACH ROW
BEGIN 
	DECLARE total INT;
    SET total = NEW.Emptys + NEW.NoEmpty;
    IF NEW.Emptys = total THEN
		-- Phòng trống hoàn toàn
        UPDATE SPACE_ROOM SET TypeRoom = CONCAT(NEW.TypeRoom,'(Trống hoàn toàn )')
        WHERE NoRoom = NEW.NoRoom AND Location = NEW.Location AND Building = NEW.Building;
	END IF;
END;//
DELIMITER ;

-- Trigger: Auto-update room status when a booking is made
DELIMITER //
CREATE TRIGGER update_room_status_on_booking
AFTER INSERT ON RESERVATION
FOR EACH ROW
BEGIN
    DECLARE start_section INT;
    DECLARE end_section INT;
    DECLARE current_section INT;
    
    -- Calculate which time section the booking falls into
    -- Time sections: 1 (7:00-8:50), 2 (9:00-10:50), 3 (11:00-12:50), 4 (13:00-14:50), 5 (15:00-16:50)
    
    SET start_section = CASE
        WHEN HOUR(NEW.StartTime) < 9 THEN 1
        WHEN HOUR(NEW.StartTime) < 11 THEN 2
        WHEN HOUR(NEW.StartTime) < 13 THEN 3
        WHEN HOUR(NEW.StartTime) < 15 THEN 4
        ELSE 5
    END;
    
    SET end_section = CASE
        WHEN HOUR(NEW.EndTime) < 9 THEN 1
        WHEN HOUR(NEW.EndTime) < 11 THEN 2
        WHEN HOUR(NEW.EndTime) < 13 THEN 3
        WHEN HOUR(NEW.EndTime) < 15 THEN 4
        ELSE 5
    END;
    
    -- Update each affected time section
    SET current_section = start_section;
    WHILE current_section <= end_section DO
        -- Check if status entry exists for this date
        IF (SELECT COUNT(*) FROM ROOM_STATUS 
            WHERE NoRoom = NEW.NoRoom 
            AND Location = NEW.Location 
            AND Building = NEW.Building 
            AND TimeSection = current_section
            AND Date_in_week = DATE_FORMAT(NEW.StartTime, '%W')) = 0 THEN
            
            -- Insert new status if it doesn't exist
            INSERT INTO ROOM_STATUS (NoRoom, Location, Building, TimeSection, Status, Date_in_week)
            VALUES (NEW.NoRoom, NEW.Location, NEW.Building, current_section, 'occupied', DATE_FORMAT(NEW.StartTime, '%W'));
        ELSE
            -- Update existing status
            UPDATE ROOM_STATUS 
            SET Status = 'occupied'
            WHERE NoRoom = NEW.NoRoom 
            AND Location = NEW.Location 
            AND Building = NEW.Building 
            AND TimeSection = current_section
            AND Date_in_week = DATE_FORMAT(NEW.StartTime, '%W');
        END IF;
        
        SET current_section = current_section + 1;
    END WHILE;
END;//
DELIMITER ;

-- Stored ProceDure: Báo cáo tình trạng thiết bị ( có bao nhiêu đang được sử dụng, bảo trì)
DELIMITER //
CREATE PROCEDURE Equipment_Status_Report()
BEGIN 
	SELECT Status, COUNT(*) AS Total from Equipment Group by Status;
END;// 
DELIMITER ;

-- Stored Procedure: Get room availability by date and section
DELIMITER //
CREATE PROCEDURE Get_Room_Availability_By_Section(IN p_date DATE, IN p_section INT)
BEGIN
    SELECT sr.NoRoom, sr.Location, sr.Building, sr.TypeRoom, 
           COALESCE(rs.Status, 'available') AS Status
    FROM SPACE_ROOM sr
    LEFT JOIN ROOM_STATUS rs ON sr.NoRoom = rs.NoRoom 
        AND sr.Location = rs.Location 
        AND sr.Building = rs.Building
        AND rs.TimeSection = p_section
        AND rs.Date_in_week = p_date
    ORDER BY sr.Location, sr.Building, sr.NoRoom;
END;//
DELIMITER ;





