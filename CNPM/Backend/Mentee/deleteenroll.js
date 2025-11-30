const jwt = require('jsonwebtoken');
const sql = require('mssql');
const config = require('./../config');

const INTERNAL_SECRET_KEY = 'app_internal_secret_key';

async function cancelEnrollment(req, res) {
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
    const { schedule_id } = req.body;

    if (!schedule_id) {
      return res.status(400).json({ error: 'Missing schedule_id' });
    }

    const pool = await sql.connect(config);

    //  Kiểm tra xem student đã đăng ký lịch này chưa
    const check = await pool.request()
      .input('student_id', sql.Int, studentId)
      .input('schedule_id', sql.Int, schedule_id)
      .query(`
        SELECT * FROM Enrollment
        WHERE student_id = @student_id AND schedule_id = @schedule_id
      `);

    if (check.recordset.length === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'Bạn chưa đăng ký lịch học này.' });
    }

    // Cập nhật trạng thái thành 'dropped'
    await pool.request()
      .input('student_id', sql.Int, studentId)
      .input('schedule_id', sql.Int, schedule_id)
      .query(`
        UPDATE Enrollment
        SET status = 'dropped'
        WHERE student_id = @student_id AND schedule_id = @schedule_id
      `);

    res.status(200).json({ message: 'Hủy đăng ký lịch học thành công' });
  } catch (err) {
    console.error('Lỗi khi hủy đăng ký lịch học:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

module.exports = { cancelEnrollment };