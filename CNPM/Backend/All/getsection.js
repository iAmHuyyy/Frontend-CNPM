const jwt = require('jsonwebtoken');
const sql = require('mssql');
const config = require('./../config');

const INTERNAL_SECRET_KEY = 'app_internal_secret_key';

// Hàm xử lý lấy danh sách section của tutor
async function handleGetSection(req, res) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Missing access token' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token format' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, INTERNAL_SECRET_KEY);
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
    }

    const tutorId = decoded.id;

    const pool = await sql.connect(config);

    const result = await pool.request()
      .input('tutor_id', sql.Int, tutorId)
      .query(`
        SELECT s.section_id, s.section_code, s.semester, s.created_at,
               c.course_code, c.title, c.language, c.credits
        FROM Section s
        JOIN Course c ON s.course_id = c.course_id
        WHERE s.tutor_id = @tutor_id
        ORDER BY s.created_at DESC
      `);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error in handleGetSection:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

module.exports = { handleGetSection };