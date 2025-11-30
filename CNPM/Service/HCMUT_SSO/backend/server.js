const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = 4000;

const SECRET_KEY = 'hcmut_sso_secret_key';

app.use(cors());
app.use(express.json());

// Hard-code dữ liệu hồ sơ ở HCMUT_SSO: chỉ lưu những dữ liệu xác thực và phân quyền cơ bản username, password, role
const profiles = {
  1: {
    id: 1,
    username: 'nguyenvana',
    password: '321',
    role: 'mentee'
  },
  2: {
    id: 2,
    username: 'tranthib',
    password: '123',
    role: 'tutor'
  },
  3: {
    id: 3,
    username: 'leminhc',
    password: 'abc',
    role: 'mentee'
  },
  4: {
    id: 4,
    username: 'phamthid',
    password: 'cba',
    role: 'mentee'
  },
  5: {
    id: 5,
    username: 'nguyenquoce',
    password: 'def',
    role: 'tutor'
  },
  6: {
    id: 6,
    username: 'tranvanf',
    password: 'fed',
    role: 'mentee'
  },
  7: {
    id: 7,
    username: 'hoangthig',
    password: 'password1',
    role: 'tutor'
  },
  8: {
    id: 8,
    username: 'dangvanh',
    password: 'password2',
    role: 'mentee'
  },
  9: {
    id: 9,
    username: 'buitranj',
    password: 'password3',
    role: 'tutor'
  },
  10: {
    id: 10,
    username: 'nguyenthik',
    password: 'password4',
    role: 'mentee'
  },
  11: {
    id: 11,
    username: 'doanvanl',
    password: 'password5',
    role: 'tutor'
  },
  12: {
    id: 12,
    username: 'truongthim',
    password: 'password6',
    role: 'mentee'
  }
};

// API: Đăng nhập và tạo token
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const user = Object.values(profiles).find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ success: false, message: 'Sai tài khoản hoặc mật khẩu' });
  }

  // Loại bỏ password khỏi payload
  const { password: __, ...safeUser } = user;

  // Tạo JWT token chỉ chứa id và role
  const token = jwt.sign(safeUser, SECRET_KEY);

  res.json({
    success: true,
    message: 'Đăng nhập thành công',
    token,
    user: safeUser
  });
});

// API: Xác thực token từ app chính
app.get('/api/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Thiếu token' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.json({ valid: true, user: decoded });
  } catch (err) {
    res.status(403).json({ valid: false, error: 'Token không hợp lệ hoặc đã hết hạn' });
  }
});

// API: thông tin xác thực theo ID (chỉ trả về username và role)
app.get('/api/profile/:id', (req, res) => {
  const id = req.params.id;
  const profile = profiles[id];
  if (profile) {
    const { password: __, ...safeProfile } = profile;
    res.json(safeProfile);
  } else {
    res.status(404).json({ error: 'Không tìm thấy hồ sơ' });
  }
});

app.listen(PORT, () => {
  console.log(`HCMUT_SSO đang chạy tại http://localhost:${PORT}`);
});