const jwt = require('jsonwebtoken');
const sql = require('mssql');
const config = require('./../config');

const INTERNAL_SECRET_KEY = 'app_internal_secret_key';

async function getAllSectionsByStudent(req, res) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Missing token' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, INTERNAL_SECRET_KEY);
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
    }

    const studentId = decoded.id;
    const pool = await sql.connect(config);

    const result = await pool.request()
      .input('student_id', sql.Int, studentId)
      .query(`
        SELECT 
          u.fullname AS tutor_name,
          sec.semester,
          c.course_code,
          c.title,
          sec.section_id,
          sec.section_code,
          sec.created_at,
          e.schedule_id,
          e.enrolled_at,
          e.status
        FROM Enrollment e
        JOIN Schedule s ON e.schedule_id = s.schedule_id
        JOIN Section sec ON s.section_id = sec.section_id
        JOIN Course c ON sec.course_id = c.course_id
        JOIN Teacher t ON sec.tutor_id = t.teacher_id
        JOIN Users u ON t.teacher_id = u.user_id
        WHERE e.student_id = @student_id AND e.status = 'active'
        ORDER BY e.enrolled_at DESC
      `);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách section đã đăng ký:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

module.exports = { getAllSectionsByStudent };