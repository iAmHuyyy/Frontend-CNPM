const jwt = require('jsonwebtoken');
const sql = require('mssql');
const config = require('./../config');

const INTERNAL_SECRET_KEY = 'app_internal_secret_key';

async function handleDeleteSchedule(req, res) {
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
    const { schedule_id } = req.body;

    if (!schedule_id) {
      return res.status(400).json({ error: 'Missing schedule_id' });
    }

    const pool = await sql.connect(config);

    // Kiểm tra xem lịch có tồn tại và thuộc về tutor này không
    const check = await pool.request()
      .input('schedule_id', sql.Int, schedule_id)
      .input('tutor_id', sql.Int, tutorId)
      .query(`
        SELECT schedule_id
        FROM Schedule
        WHERE schedule_id = @schedule_id AND tutor_id = @tutor_id
      `);

    if (check.recordset.length === 0) {
      return res.status(403).json({ error: 'Forbidden', message: 'Không có quyền xóa lịch này hoặc lịch không tồn tại.' });
    }

    // Xóa lịch
    await pool.request()
      .input('schedule_id', sql.Int, schedule_id)
      .query(`
        DELETE FROM Schedule WHERE schedule_id = @schedule_id
      `);

    res.status(200).json({ message: 'Lịch học đã được xóa thành công' });
  } catch (err) {
    console.error('Lỗi khi xóa lịch học:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

module.exports = { handleDeleteSchedule };