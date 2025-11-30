CREATE DATABASE CNPM;
GO
USE CNPM;
GO
-- ========================
-- 1. USERS TABLE
-- ========================
CREATE TABLE Users (
    user_id INT NOT NULL PRIMARY KEY,
    fullname NVARCHAR(255) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    edu_email VARCHAR(254) NOT NULL UNIQUE,
    cccd VARCHAR(30) NOT NULL UNIQUE,
    dob DATE,
    gender NVARCHAR(10) NOT NULL,
    role VARCHAR(10) NOT NULL,
    phone VARCHAR(30) NOT NULL UNIQUE,
    created_at DATE DEFAULT GETDATE(),
    CONSTRAINT CK_Gender CHECK (gender IN (N'Nam', N'Nữ')),
    CONSTRAINT CK_Role CHECK (role IN ('mentee', 'tutor'))
);
GO

-- ========================
-- 2. STUDENT TABLE
-- ========================
CREATE TABLE Student (
    student_id INT PRIMARY KEY,
    faculty NVARCHAR(255),
    major NVARCHAR(255),
    program NVARCHAR(255) DEFAULT 'Đại học chính quy',
    CONSTRAINT FK_Student_Users FOREIGN KEY (student_id) REFERENCES Users(user_id)
);
GO

-- ========================
-- 3. TEACHER TABLE
-- ========================
CREATE TABLE Teacher (
    teacher_id INT PRIMARY KEY,
    faculty NVARCHAR(255),
    department NVARCHAR(255),
    position NVARCHAR(255) DEFAULT 'Giảng viên chính',
    academicLevel NVARCHAR(30),
    CONSTRAINT FK_Teacher_Users FOREIGN KEY (teacher_id) REFERENCES Users(user_id)
);
GO

-- ========================
-- 4. COURSE TABLE
-- ========================
CREATE TABLE Course (
    course_id INT IDENTITY(1,1) PRIMARY KEY,
    course_code VARCHAR(20) UNIQUE NOT NULL,
    title NVARCHAR(80),
    credits INT CHECK (credits >= 0),
    language VARCHAR(10),
    price_vnd INT CHECK (price_vnd >= 0)
);
GO

INSERT INTO Course (course_code, title, credits, language, price_vnd) VALUES
('CS101', N'Nhập môn Khoa học Máy tính', 3, 'VN', 2000000),
('CS102', N'Cấu trúc dữ liệu', 3, 'VN', 2200000),
('CS103', N'Thuật toán nâng cao', 4, 'VN', 2500000),
('CS104', N'Lập trình hướng đối tượng', 3, 'EN', 2300000),
('CS105', N'Cơ sở dữ liệu', 3, 'VN', 2100000),
('CS106', N'Mạng máy tính', 3, 'EN', 2400000),
('CS107', N'Hệ điều hành', 4, 'VN', 2600000),
('CS108', N'Phân tích thiết kế hệ thống', 3, 'VN', 2000000),
('CS109', N'Công nghệ phần mềm', 3, 'EN', 2700000),
('CS110', N'Trí tuệ nhân tạo', 4, 'EN', 3000000);
GO

-- ========================
-- 5. SECTION TABLE
-- ========================
CREATE TABLE Section (
    section_id INT IDENTITY(1,1) PRIMARY KEY,
    course_id INT NOT NULL,
    tutor_id INT NOT NULL,
    section_code VARCHAR(20) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    created_at DATE DEFAULT GETDATE(),
    CONSTRAINT FK_Section_Course FOREIGN KEY (course_id) REFERENCES Course(course_id),
    CONSTRAINT FK_Section_Teacher FOREIGN KEY (tutor_id) REFERENCES Teacher(teacher_id)
);
GO

INSERT INTO Section (course_id, tutor_id, section_code, semester)
VALUES
(1, 2, 'L01', 'HK251'),
(2, 2, 'L02', 'HK251'),
(3, 2, 'L03', 'HK251'),
(4, 2, 'L04', 'HK251'),
(5, 2, 'L01', 'HK252'),
(6, 2, 'L02', 'HK252'),
(7, 2, 'L03', 'HK252'),
(8, 2, 'L04', 'HK252');
GO

-- ========================
-- 6. SCHEDULE TABLE
-- ========================
CREATE TABLE Schedule (
    schedule_id INT IDENTITY(1,1) PRIMARY KEY,
    section_id INT NOT NULL,
    tutor_id INT NOT NULL,
    study_date DATE NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    slots INT CHECK (slots > 0), 
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (section_id) REFERENCES Section(section_id),
    FOREIGN KEY (tutor_id) REFERENCES Users(user_id)
);
GO

INSERT INTO Schedule (section_id, tutor_id, study_date, start_time, end_time, slots)
VALUES
(1, 2, '2025-01-10', '08:00', '10:00', 30),
(2, 2, '2025-01-12', '10:00', '12:00', 25),
(3, 2, '2025-01-15', '13:00', '15:00', 20),
(4, 2, '2025-01-18', '15:00', '17:00', 35),
(5, 2, '2025-02-05', '08:00', '10:00', 40),
(6, 2, '2025-02-07', '10:00', '12:00', 28),
(7, 2, '2025-02-10', '13:00', '15:00', 32),
(8, 2, '2025-02-12', '15:00', '17:00', 36);
GO

-- ========================
-- 8. ENROLLMENT TABLE (N-N: STUDENT <-> SECTION)
-- ========================
CREATE TABLE Enrollment (
    student_id INT NOT NULL,
    schedule_id INT NOT NULL,
    enrolled_at DATETIME DEFAULT GETDATE(),
    status VARCHAR(10) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'dropped', 'completed')),
    PRIMARY KEY (student_id, schedule_id),
    CONSTRAINT FK_Enroll_Student FOREIGN KEY (student_id) REFERENCES Student(student_id),
    CONSTRAINT FK_Enroll_Schedule FOREIGN KEY (schedule_id) REFERENCES Schedule(schedule_id)
);
GO

-- ========================
-- 9. CONTENT TABLE
-- ========================
CREATE TABLE Content (
    section_id INT NOT NULL,
    position INT NOT NULL,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    PRIMARY KEY (section_id, position),
    CONSTRAINT FK_Content_Section FOREIGN KEY (section_id) REFERENCES Section(section_id)
);
GO

INSERT INTO Content (section_id, position, title, description)
VALUES
(1, 1, N'Giới thiệu môn học', N'Tổng quan về cơ khí và ứng dụng'),
(1, 2, N'Nguyên lý cơ bản', N'Các định luật cơ học cơ sở'),
(2, 1, N'Vật liệu cơ khí', N'Tìm hiểu các loại vật liệu sử dụng'),
(2, 2, N'Thí nghiệm vật liệu', N'Ứng dụng thực tế trong phòng thí nghiệm'),
(3, 1, N'Động lực học', N'Khái niệm và bài toán động lực học'),
(3, 2, N'Bài tập nhóm', N'Phân tích chuyển động của hệ thống'),
(4, 1, N'Cơ học chất rắn', N'Ứng suất và biến dạng'),
(4, 2, N'Ứng dụng thực tế', N'Ví dụ trong xây dựng và sản xuất');
GO

-- ========================
-- 10. FEEDBACK TABLE
-- ========================
CREATE TABLE Feedback (
    feedback_id INT IDENTITY(1,1) PRIMARY KEY,
    student_id INT NOT NULL,
    section_id INT NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Feedback_Section FOREIGN KEY (section_id) REFERENCES Section(section_id),
    CONSTRAINT FK_Feedback_Student FOREIGN KEY (student_id) REFERENCES Student(student_id)
);
GO

-- ========================
-- 11. NOTIFICATION TABLE
-- ========================
CREATE TABLE Notification (
    notification_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Notification_Users FOREIGN KEY (user_id) REFERENCES Users(user_id)
);
GO
















