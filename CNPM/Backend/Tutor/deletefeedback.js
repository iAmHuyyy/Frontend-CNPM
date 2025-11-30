const jwt = require('jsonwebtoken');
const sql = require('mssql');
const config = require('./../config');

const INTERNAL_SECRET_KEY = 'app_internal_secret_key';

async function deleteFeedback(req, res) {
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

    const tutorId = decoded.id;
    const pool = await sql.connect(config);

    // Lấy feedback_id từ params
    const { feedback_id } = req.params;
    if (!feedback_id) {
      return res.status(400).json({ error: 'Bad Request', message: 'Thiếu feedback_id' });
    }

    // Kiểm tra role
    const roleResult = await pool.request()
      .input('user_id', sql.Int, tutorId)
      .query(`SELECT role FROM Users WHERE user_id = @user_id`);

    if (roleResult.recordset.length === 0 || roleResult.recordset[0].role !== 'tutor') {
      return res.status(403).json({ error: 'Forbidden', message: 'Không phải tutor' });
    }

    // Kiểm tra feedback có tồn tại và thuộc về section mà tutor phụ trách
    const checkResult = await pool.request()
      .input('feedback_id', sql.Int, feedback_id)
      .input('tutor_id', sql.Int, tutorId)
      .query(`
        SELECT f.feedback_id
        FROM Feedback f
        JOIN Section s ON f.section_id = s.section_id
        WHERE f.feedback_id = @feedback_id AND s.tutor_id = @tutor_id
      `);

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'Không tìm thấy feedback hoặc không thuộc section của bạn' });
    }

    // Xóa feedback
    await pool.request()
      .input('feedback_id', sql.Int, feedback_id)
      .query(`DELETE FROM Feedback WHERE feedback_id = @feedback_id`);

    res.status(200).json({ message: 'Xóa feedback thành công' });
  } catch (err) {
    console.error('Lỗi khi xóa feedback:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

module.exports = { deleteFeedback };