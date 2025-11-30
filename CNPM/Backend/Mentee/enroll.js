const jwt = require('jsonwebtoken');
const sql = require('mssql');
const config = require('./../config');

const INTERNAL_SECRET_KEY = 'app_internal_secret_key';

async function handleEnroll(req, res) {
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

    // Lấy slots từ Schedule
    const scheduleCheck = await pool.request()
      .input('schedule_id', sql.Int, schedule_id)
      .query(`SELECT slots FROM Schedule WHERE schedule_id = @schedule_id`);

    if (scheduleCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'Lịch học không tồn tại' });
    }

    const maxSlots = scheduleCheck.recordset[0].slots;

    // Đếm số student đang active trong lịch này
    const activeCountRes = await pool.request()
      .input('schedule_id', sql.Int, schedule_id)
      .query(`
        SELECT COUNT(*) AS activeCount
        FROM Enrollment
        WHERE schedule_id = @schedule_id AND status = 'active'
      `);

    const activeCount = activeCountRes.recordset[0].activeCount;

    if (activeCount >= maxSlots) {
      return res.status(409).json({ error: 'Conflict', message: 'Lịch học đã đủ số lượng slots' });
    }

    // Kiểm tra xem student đã đăng ký lịch này chưa
    const existCheck = await pool.request()
      .input('schedule_id', sql.Int, schedule_id)
      .input('student_id', sql.Int, studentId)
      .query(`
        SELECT status FROM Enrollment
        WHERE schedule_id = @schedule_id AND student_id = @student_id
      `);

    if (existCheck.recordset.length > 0) {
      const currentStatus = existCheck.recordset[0].status;
      if (currentStatus === 'dropped') {
        // Nếu đã đăng ký nhưng dropped → chuyển sang active
        await pool.request()
          .input('schedule_id', sql.Int, schedule_id)
          .input('student_id', sql.Int, studentId)
          .query(`
            UPDATE Enrollment
            SET status = 'active', enrolled_at = GETDATE()
            WHERE schedule_id = @schedule_id AND student_id = @student_id
          `);

        return res.status(200).json({ message: 'Đăng ký lại lịch học thành công' });
      } else {
        return res.status(409).json({ error: 'Conflict', message: 'Bạn đã đăng ký lịch này rồi' });
      }
    }

    // Thêm mới vào bảng Enrollment
    await pool.request()
      .input('schedule_id', sql.Int, schedule_id)
      .input('student_id', sql.Int, studentId)
      .query(`
        INSERT INTO Enrollment (schedule_id, student_id, enrolled_at, status)
        VALUES (@schedule_id, @student_id, GETDATE(), 'active')
      `);

    res.status(201).json({ message: 'Đăng ký lịch học thành công' });
  } catch (err) {
    console.error('Lỗi khi đăng ký lịch học:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

module.exports = { handleEnroll };