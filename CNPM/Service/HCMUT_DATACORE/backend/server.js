const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = 5000;

// Secret key
const SECRET_KEY = 'hcmut_sso_secret_key';

app.use(cors());
app.use(express.json());

// Hard-code dữ liệu chi tiết ở HCMUT_DATACORE
const datacoreProfiles = {
  1: {
    id: 1,
    fullName: 'Nguyễn Văn An',
    dob: '2006-01-15',
    gender: 'Nam',
    cccd: '012345678901',
    phone: '0901234567',
    emailEdu: 'a.nguyen@hcmut.edu.vn',
    emailPersonal: 'nguyenvana@gmail.com',
    faculty: 'Cơ khí',
    major: 'Kỹ thuật Cơ khí',
    program: 'Đại học chính quy',
    status: 'Đang học'
  },
  2: {
    id: 2,
    fullName: 'Trần Thị Bình',
    dob: '1999-05-20',
    gender: 'Nữ',
    cccd: '098765432109',
    phone: '0912345678',
    emailEdu: 'b.tran@hcmut.edu.vn',
    emailPersonal: 'tranthib@gmail.com',
    faculty: 'Công nghệ thông tin',
    department: 'Khoa học Máy tính',
    position: 'Giảng viên chính',
    academicLevel: 'Thạc sĩ',
    status: 'Đang giảng dạy'
  },
  3: {
    id: 3,
    fullName: 'Lê Minh Cường',
    dob: '2005-03-12',
    gender: 'Nam',
    cccd: '123456789012',
    phone: '0902345678',
    emailEdu: 'c.le@hcmut.edu.vn',
    emailPersonal: 'leminhc@gmail.com',
    faculty: 'Điện',
    major: 'Kỹ thuật Điện',
    program: 'Đại học chính quy',
    status: 'Đang học'
  },
  4: {
    id: 4,
    fullName: 'Phạm Thị Dung',
    dob: '2004-07-25',
    gender: 'Nữ',
    cccd: '234567890123',
    phone: '0903456789',
    emailEdu: 'd.pham@hcmut.edu.vn',
    emailPersonal: 'phamthid@gmail.com',
    faculty: 'Hóa',
    major: 'Kỹ thuật Hóa học',
    program: 'Đại học chính quy',
    status: 'Đang học'
  },
  5: {
    id: 5,
    fullName: 'Nguyễn Quốc Em',
    dob: '1985-11-02',
    gender: 'Nam',
    cccd: '345678901234',
    phone: '0914567890',
    emailEdu: 'e.nguyen@hcmut.edu.vn',
    emailPersonal: 'nguyenquoce@gmail.com',
    faculty: 'Công nghệ thông tin',
    department: 'Hệ thống thông tin',
    position: 'Giảng viên',
    academicLevel: 'Tiến sĩ',
    status: 'Đang giảng dạy'
  },
  6: {
    id: 6,
    fullName: 'Trần Văn Phúc',
    dob: '2003-09-18',
    gender: 'Nam',
    cccd: '456789012345',
    phone: '0905678901',
    emailEdu: 'f.tran@hcmut.edu.vn',
    emailPersonal: 'tranvanf@gmail.com',
    faculty: 'Xây dựng',
    major: 'Kỹ thuật Xây dựng',
    program: 'Đại học chính quy',
    status: 'Đang học'
  },
  7: {
    id: 7,
    fullName: 'Hoàng Thị Giang',
    dob: '1990-02-14',
    gender: 'Nữ',
    cccd: '567890123456',
    phone: '0916789012',
    emailEdu: 'g.hoang@hcmut.edu.vn',
    emailPersonal: 'hoangthig@gmail.com',
    faculty: 'Cơ khí',
    department: 'Chế tạo máy',
    position: 'Giảng viên',
    academicLevel: 'Thạc sĩ',
    status: 'Đang giảng dạy'
  },
  8: {
    id: 8,
    fullName: 'Đặng Văn Hùng',
    dob: '2002-12-05',
    gender: 'Nam',
    cccd: '678901234567',
    phone: '0907890123',
    emailEdu: 'h.dang@hcmut.edu.vn',
    emailPersonal: 'dangvanh@gmail.com',
    faculty: 'Điện tử',
    major: 'Kỹ thuật Điện tử',
    program: 'Đại học chính quy',
    status: 'Đang học'
  },
  9: {
    id: 9,
    fullName: 'Bùi Trần Nhật',
    dob: '1988-06-30',
    gender: 'Nam',
    cccd: '789012345678',
    phone: '0918901234',
    emailEdu: 'j.bui@hcmut.edu.vn',
    emailPersonal: 'buitranj@gmail.com',
    faculty: 'Công nghệ thông tin',
    department: 'Khoa học dữ liệu',
    position: 'Giảng viên',
    academicLevel: 'Tiến sĩ',
    status: 'Đang giảng dạy'
  },
  10: {
    id: 10,
    fullName: 'Nguyễn Thị Kim',
    dob: '2001-04-22',
    gender: 'Nữ',
    cccd: '890123456789',
    phone: '0909012345',
    emailEdu: 'k.nguyen@hcmut.edu.vn',
    emailPersonal: 'nguyenthik@gmail.com',
    faculty: 'Môi trường',
    major: 'Kỹ thuật Môi trường',
    program: 'Đại học chính quy',
    status: 'Đang học'
  },
  11: {
    id: 11,
    fullName: 'Đoàn Văn Lợi',
    dob: '1982-08-11',
    gender: 'Nam',
    cccd: '901234567890',
    phone: '0910123456',
    emailEdu: 'l.doan@hcmut.edu.vn',
    emailPersonal: 'doanvanl@gmail.com',
    faculty: 'Cơ khí',
    department: 'Nhiệt lạnh',
    position: 'Giảng viên chính',
    academicLevel: 'Thạc sĩ',
    status: 'Đang giảng dạy'
  },
  12: {
    id: 12,
    fullName: 'Trương Thị Mai',
    dob: '2000-10-09',
    gender: 'Nữ',
    cccd: '012345678912',
    phone: '0901123456',
    emailEdu: 'm.truong@hcmut.edu.vn',
    emailPersonal: 'truongthim@gmail.com',
    faculty: 'Quản lý công nghiệp',
    major: 'Quản lý công nghiệp',
    program: 'Đại học chính quy',
    status: 'Đang học'
  }
};

// API: Lấy thông tin chi tiết
app.get('/api/info', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Thiếu token' });

  try {
    // Giải mã token
    const decoded = jwt.verify(token, SECRET_KEY);
    const userId = decoded.id;

    const profile = datacoreProfiles[userId];
    if (!profile) {
      return res.status(404).json({ error: 'Không tìm thấy dữ liệu trong DATACORE' });
    }

    res.json(profile);
  } catch (err) {
    res.status(403).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
  }
});

app.listen(PORT, () => {
  console.log(`HCMUT_DATACORE đang chạy tại http://localhost:${PORT}`);
});