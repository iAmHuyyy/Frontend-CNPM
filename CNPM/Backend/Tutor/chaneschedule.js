const jwt = require('jsonwebtoken');
const sql = require('mssql');
const config = require('./../config');

const INTERNAL_SECRET_KEY = 'app_internal_secret_key';

async function handleChangeSchedule(req, res) {
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
    const { schedule_id, study_date, start_time, end_time, slots } = req.body;

    if (!schedule_id || !study_date || !start_time || !end_time || !slots) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const pool = await sql.connect(config);

    // Kiểm tra trùng lịch với các lịch khác (loại trừ chính schedule_id đang sửa)
    const conflict = await pool.request()
      .input('tutor_id', sql.Int, tutorId)
      .input('study_date', sql.Date, study_date)
      .input('start_time', sql.VarChar(10), start_time)
      .input('end_time', sql.VarChar(10), end_time)
      .input('schedule_id', sql.Int, schedule_id)
      .query(`
        SELECT schedule_id
        FROM Schedule
        WHERE tutor_id = @tutor_id
          AND study_date = @study_date
          AND schedule_id != @schedule_id
          AND (
              (start_time < @end_time AND end_time > @start_time)
          )
      `);

    if (conflict.recordset.length > 0) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Lịch mới bị trùng giờ với lịch khác trong cùng ngày.'
      });
    }

    // Cập nhật lịch
    await pool.request()
      .input('schedule_id', sql.Int, schedule_id)
      .input('study_date', sql.Date, study_date)
      .input('start_time', sql.VarChar(10), start_time)
      .input('end_time', sql.VarChar(10), end_time)
      .input('slots', sql.Int, slots)
      .query(`
        UPDATE Schedule
        SET study_date = @study_date,
            start_time = @start_time,
            end_time = @end_time,
            slots = @slots
        WHERE schedule_id = @schedule_id
      `);

    res.status(200).json({ message: 'Lịch học đã được cập nhật thành công' });
  } catch (err) {
    console.error('Lỗi khi cập nhật lịch học:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

module.exports = { handleChangeSchedule };