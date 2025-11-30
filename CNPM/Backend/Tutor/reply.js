const sql = require('mssql');
const jwt = require('jsonwebtoken');
const config = require('./../config');

const SECRET_KEY = 'app_internal_secret_key';

async function replyFeedback(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  const { section_id, user_id, description } = req.body;

  if (!token || !section_id || !user_id || !description) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin đầu vào' });
  }

  try {
    // Xác thực token
    jwt.verify(token, SECRET_KEY);

    const pool = await sql.connect(config);

    // Truy vấn thông tin học phần
    const sectionQuery = await pool.request()
      .input('section_id', sql.Int, section_id)
      .query(`
        SELECT s.section_code, c.course_code, c.title
        FROM Section s
        JOIN Course c ON s.course_id = c.course_id
        WHERE s.section_id = @section_id
      `);

    if (sectionQuery.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy học phần' });
    }

    const { course_code, title, section_code } = sectionQuery.recordset[0];

    // Tạo nội dung thông báo
    const fullMessage = `Giảng viên của môn học ${course_code}-${title}, ${section_code} đã phản hồi feedback của bạn với nội dung: ${description}`;

    // Ghi vào bảng Notification
    await pool.request()
      .input('user_id', sql.Int, user_id)
      .input('description', sql.NVarChar(sql.MAX), fullMessage)
      .query(`
        INSERT INTO Notification (user_id, description)
        VALUES (@user_id, @description)
      `);

    res.json({ success: true, message: 'Đã tạo thông báo phản hồi thành công' });
  } catch (err) {
    console.error('Lỗi khi tạo thông báo:', err);
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
}

module.exports = { replyFeedback };