// profile.js
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const config = require('./../config');

const INTERNAL_SECRET_KEY = 'app_internal_secret_key';

// Hàm định dạng ngày sinh thành YYYY-MM-DD
function formatDateOnly(dateObj) {
  if (!dateObj) return null;
  try {
    return new Date(dateObj).toISOString().split('T')[0];
  } catch {
    return dateObj;
  }
}

// Hàm xử lý lấy profile từ DB
async function handleProfile(req, res) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Missing access token' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token format' });
    }

    // Giải mã token
    let decoded;
    try {
      decoded = jwt.verify(token, INTERNAL_SECRET_KEY);
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
    }

    const userId = decoded.id;

    // Kết nối DB
    const pool = await sql.connect(config);

    // Lấy thông tin user
    const userResult = await pool.request()
      .input('user_id', sql.Int, userId)
      .query(`SELECT * FROM Users WHERE user_id = @user_id`);

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'Profile not found' });
    }

    const user = userResult.recordset[0];

    // Chuẩn hóa dữ liệu user
    let profile = {
      user_id: user.user_id,
      fullname: user.fullname,
      dob: formatDateOnly(user.dob),
      gender: user.gender,
      cccd: user.cccd,
      phone: user.phone,
      edu_email: user.edu_email,
      email: user.email,
      role: user.role
    };

    // Nếu là mentee thì lấy thêm thông tin từ Student
    if (user.role === 'mentee') {
      const studentResult = await pool.request()
        .input('student_id', sql.Int, userId)
        .query(`SELECT faculty, major, program FROM Student WHERE student_id = @student_id`);

      if (studentResult.recordset.length > 0) {
        profile = { ...profile, ...studentResult.recordset[0] };
      }
    }

    // Nếu là tutor thì lấy thêm thông tin từ Teacher
    if (user.role === 'tutor') {
      const teacherResult = await pool.request()
        .input('teacher_id', sql.Int, userId)
        .query(`SELECT faculty, department, position, academicLevel FROM Teacher WHERE teacher_id = @teacher_id`);

      if (teacherResult.recordset.length > 0) {
        profile = { ...profile, ...teacherResult.recordset[0] };
      }
    }

    res.status(200).json(profile);
  } catch (err) {
    console.error('Error in handleProfile:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { handleProfile };