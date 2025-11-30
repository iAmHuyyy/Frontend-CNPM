const jwt = require('jsonwebtoken');
const sql = require('mssql');
const config = require('./../config');

const INTERNAL_SECRET_KEY = 'app_internal_secret_key';

// Hàm xử lý tạo section
async function handleCreateSection(req, res) {
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
    const { course_id, section_code, semester } = req.body;

    if (!course_id || !section_code || !semester) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const pool = await sql.connect(config);

    await pool.request()
      .input('course_id', sql.Int, course_id)
      .input('tutor_id', sql.Int, tutorId)
      .input('section_code', sql.VarChar(20), section_code)
      .input('semester', sql.VarChar(20), semester)
      .query(`
        INSERT INTO Section (course_id, tutor_id, section_code, semester)
        VALUES (@course_id, @tutor_id, @section_code, @semester)
      `);

    res.status(201).json({ success: true, message: 'Section created successfully' });
  } catch (err) {
    console.error('Error in handleCreateSection:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

module.exports = { handleCreateSection };