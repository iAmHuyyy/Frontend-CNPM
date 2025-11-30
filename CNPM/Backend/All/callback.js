const jwt = require('jsonwebtoken');

const SECRET_KEY = 'hcmut_sso_secret_key';
const INTERNAL_SECRET_KEY = 'app_internal_secret_key';

let currentUser = null;
let internalToken = null;
let ssoToken = null; // lưu token gốc từ SSO

// Hàm xử lý callback từ HCMUT_SSO
async function handleSSOCallback(req, res) {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: 'Thiếu token' });
  }

  try {
    // Giải mã token từ HCMUT_SSO
    const decoded = jwt.verify(token, SECRET_KEY);

    if (!decoded.role || !['mentee', 'tutor'].includes(decoded.role)) {
      return res.status(400).json({ success: false, message: 'Role không hợp lệ trong token SSO' });
    }

    // Lưu vào session nội bộ
    currentUser = {
      id: decoded.id,
      role: decoded.role
    };

    // Lưu token SSO
    ssoToken = token;

    // Tạo token nội bộ chỉ với id + role
    internalToken = jwt.sign({ id: decoded.id, role: decoded.role }, INTERNAL_SECRET_KEY);

    console.log('User đăng nhập qua SSO:', currentUser);

    res.sendStatus(200);
  } catch (err) {
    console.error('Token không hợp lệ:', err.message);
    res.status(403).json({ success: false, message: 'Token không hợp lệ hoặc hết hạn' });
  }
}

// API để frontend app chính kiểm tra trạng thái đăng nhập
function getSSOStatus(req, res) {
  if (currentUser && internalToken && ssoToken) {
    res.json({
      success: true,
      role: currentUser.role,
      id: currentUser.id,
      ssoToken: ssoToken,
      internalToken: internalToken
    });
  } else {
    res.json({ success: false });
  }
}

// API logout để xoá session nội bộ
function logout(req, res) {
  currentUser = null;
  internalToken = null;
  ssoToken = null;
  res.json({ success: true, message: 'Đã đăng xuất' });
}

module.exports = { handleSSOCallback, getSSOStatus, logout };