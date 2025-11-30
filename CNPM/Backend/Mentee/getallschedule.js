const jwt = require('jsonwebtoken');
const sql = require('mssql');
const config = require('./../config');

const INTERNAL_SECRET_KEY = 'app_internal_secret_key';

async function getAllSchedule(req, res) {
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
          s.schedule_id,
          s.section_id,
          s.tutor_id,
          s.study_date,
          s.start_time,
          s.end_time,
          s.slots,
          s.created_at,
          sec.section_code,
          sec.semester,
          c.course_code,
          c.title,
          u.fullname AS tutor_name
        FROM Schedule s
        JOIN Section sec ON s.section_id = sec.section_id
        JOIN Course c ON sec.course_id = c.course_id
        JOIN Users u ON s.tutor_id = u.user_id
        WHERE s.schedule_id NOT IN (
          SELECT schedule_id FROM Enrollment WHERE student_id = @student_id AND status = 'active'
        )
        ORDER BY s.study_date, s.start_time
      `);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách schedule chưa đăng ký:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

module.exports = { getAllSchedule };