const jwt = require('jsonwebtoken');
const sql = require('mssql');
const config = require('./../config');

const INTERNAL_SECRET_KEY = 'app_internal_secret_key';

async function getFeedbackByTutor(req, res) {
  try {
    // Lấy token từ header
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

    const tutorId = decoded.id; // user_id của tutor
    const pool = await sql.connect(config);

    // Kiểm tra role
    const roleResult = await pool.request()
      .input('user_id', sql.Int, tutorId)
      .query(`SELECT role FROM Users WHERE user_id = @user_id`);

    if (roleResult.recordset.length === 0 || roleResult.recordset[0].role !== 'tutor') {
      return res.status(403).json({ error: 'Forbidden', message: 'Không phải tutor' });
    }

    // Lấy section_id từ query hoặc body
    const sectionId = req.query.section_id || req.body.section_id;
    if (!sectionId) {
      return res.status(400).json({ error: 'Bad Request', message: 'Thiếu section_id' });
    }

    // Lấy feedback cho section mà tutor phụ trách
    const result = await pool.request()
      .input('tutor_id', sql.Int, tutorId)
      .input('section_id', sql.Int, sectionId)
      .query(`
        SELECT 
          f.feedback_id,
          f.description,
          f.created_at,
          u.fullname,
          u.user_id AS student_id
        FROM Feedback f
        JOIN Student st ON f.student_id = st.student_id
        JOIN Users u ON st.student_id = u.user_id
        JOIN Section s ON f.section_id = s.section_id
        WHERE s.tutor_id = @tutor_id AND s.section_id = @section_id
        ORDER BY f.created_at DESC
      `);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Lỗi khi lấy feedback:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

module.exports = { getFeedbackByTutor };