const jwt = require('jsonwebtoken');
const sql = require('mssql');
const config = require('./../config');

const INTERNAL_SECRET_KEY = 'app_internal_secret_key';

async function getScheduleByTutor(req, res) {
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

    const tutorId = decoded.id;

    const pool = await sql.connect(config);

    const result = await pool.request()
      .input('tutor_id', sql.Int, tutorId)
      .query(`
        SELECT 
          s.schedule_id,
          s.section_id,
          s.study_date,
          s.start_time,
          s.end_time,
          s.slots,
          s.created_at,
          sec.section_code,
          sec.semester,
          c.course_code,
          c.title
        FROM Schedule s
        JOIN Section sec ON s.section_id = sec.section_id
        JOIN Course c ON sec.course_id = c.course_id
        WHERE s.tutor_id = @tutor_id
        ORDER BY s.study_date, s.start_time
      `);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Lỗi khi lấy schedule của tutor:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

module.exports = { getScheduleByTutor };