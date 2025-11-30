const jwt = require('jsonwebtoken');
const sql = require('mssql');
const config = require('./../config');

const INTERNAL_SECRET_KEY = 'app_internal_secret_key';

async function handleCreateSchedule(req, res) {
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
    const { section_id, study_date, start_time, end_time, slots } = req.body;

    if (!section_id || !study_date || !start_time || !end_time || !slots) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const pool = await sql.connect(config);

    // Kiểm tra trùng giờ trong cùng ngày và section
    const conflict = await pool.request()
      .input('section_id', sql.Int, section_id)
      .input('study_date', sql.Date, study_date)
      .input('start_time', sql.VarChar(10), start_time)
      .input('end_time', sql.VarChar(10), end_time)
      .query(`
        SELECT schedule_id
        FROM Schedule
        WHERE section_id = @section_id
          AND study_date = @study_date
          AND (
              (start_time < @end_time AND end_time > @start_time)
          )
      `);

    if (conflict.recordset.length > 0) {
      return res.status(409).json({ 
        error: 'Conflict', 
        message: 'Đã có lịch học trùng giờ trong ngày này.' 
      });
    }

    // Nếu không trùng thì thêm mới
    await pool.request()
      .input('section_id', sql.Int, section_id)
      .input('tutor_id', sql.Int, tutorId)
      .input('study_date', sql.Date, study_date)
      .input('start_time', sql.VarChar(10), start_time)
      .input('end_time', sql.VarChar(10), end_time)
      .input('slots', sql.Int, slots)
      .query(`
        INSERT INTO Schedule (section_id, tutor_id, study_date, start_time, end_time, slots)
        VALUES (@section_id, @tutor_id, @study_date, @start_time, @end_time, @slots)
      `);

    res.status(201).json({ message: 'Lịch học đã được tạo thành công' });
  } catch (err) {
    console.error('Lỗi khi tạo lịch học:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

module.exports = { handleCreateSchedule };