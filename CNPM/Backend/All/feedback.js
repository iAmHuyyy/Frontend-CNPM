const jwt = require('jsonwebtoken');
const sql = require('mssql');
const config = require('./../config');

const INTERNAL_SECRET_KEY = 'app_internal_secret_key';

async function createFeedback(req, res) {
  try {
    // Xác thực token
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
    const pool = await sql.connect(config);

    // Lấy dữ liệu từ body
    const { section_id, description } = req.body;
    if (!section_id || !description) {
      return res.status(400).json({ error: 'Bad Request', message: 'Thiếu dữ liệu bắt buộc' });
    }

    // Lấy thông tin học sinh
    const studentResult = await pool.request()
      .input('student_id', sql.Int, studentId)
      .query(`
        SELECT u.fullname
        FROM Student s
        JOIN Users u ON s.student_id = u.user_id
        WHERE s.student_id = @student_id
      `);

    if (studentResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'Không tìm thấy học sinh' });
    }

    const fullname = studentResult.recordset[0].fullname;

    // Lấy thông tin section và tutor
    const sectionResult = await pool.request()
      .input('section_id', sql.Int, section_id)
      .query(`
        SELECT sec.section_code, sec.tutor_id, c.course_code, c.title
        FROM Section sec
        JOIN Course c ON sec.course_id = c.course_id
        WHERE sec.section_id = @section_id
      `);

    if (sectionResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'Không tìm thấy section' });
    }

    const { section_code, tutor_id, course_code, title } = sectionResult.recordset[0];

    // Tạo feedback
    await pool.request()
      .input('student_id', sql.Int, studentId)
      .input('section_id', sql.Int, section_id)
      .input('description', sql.NVarChar(sql.MAX), description)
      .query(`
        INSERT INTO Feedback (student_id, section_id, description)
        VALUES (@student_id, @section_id, @description)
      `);

    // Tạo notification cho tutor
    const notifyText = `Học sinh: ${fullname}, mssv: ${studentId}, vừa feedback về khóa học: ${course_code} - ${title}, ${section_code} của bạn`;

    await pool.request()
      .input('user_id', sql.Int, tutor_id)
      .input('description', sql.NVarChar(sql.MAX), notifyText)
      .query(`
        INSERT INTO Notification (user_id, description)
        VALUES (@user_id, @description)
      `);

    res.status(201).json({ message: 'Gửi feedback thành công và đã thông báo cho giảng viên.' });
  } catch (err) {
    console.error('Lỗi khi gửi feedback:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

module.exports = { createFeedback };