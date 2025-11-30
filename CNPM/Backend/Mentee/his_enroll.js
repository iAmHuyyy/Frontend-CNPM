const jwt = require('jsonwebtoken');
const sql = require('mssql');
const config = require('./../config');

const INTERNAL_SECRET_KEY = 'app_internal_secret_key';

async function getEnrolledSections(req, res) {
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
          e.schedule_id,
          e.enrolled_at,
          e.status,
          s.study_date,
          s.start_time,
          s.end_time,
          s.slots,
          sec.section_code,
          sec.semester,
          c.course_code,
          c.title,
          u.fullname AS tutor_name
        FROM Enrollment e
        JOIN Schedule s ON e.schedule_id = s.schedule_id
        JOIN Section sec ON s.section_id = sec.section_id
        JOIN Course c ON sec.course_id = c.course_id
        JOIN Users u ON s.tutor_id = u.user_id
        WHERE e.student_id = @student_id
        ORDER BY e.enrolled_at DESC
      `);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách lịch đã đăng ký:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

module.exports = { getEnrolledSections };