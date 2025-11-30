const jwt = require('jsonwebtoken');
const sql = require('mssql');
const config = require('./../config');

const INTERNAL_SECRET_KEY = 'app_internal_secret_key';

async function createContent(req, res) {
  try {
    // Lấy token từ header để xác thực tutor
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

    const { section_id, position, title, description } = req.body;

    if (!section_id || !position || !title || !description) {
      return res.status(400).json({ error: 'Bad Request', message: 'Thiếu dữ liệu bắt buộc' });
    }

    const pool = await sql.connect(config);

    // Thêm nội dung vào bảng Content
    await pool.request()
      .input('section_id', sql.Int, section_id)
      .input('position', sql.Int, position)
      .input('title', sql.NVarChar(255), title)
      .input('description', sql.NVarChar(sql.MAX), description)
      .query(`
        INSERT INTO Content (section_id, position, title, description)
        VALUES (@section_id, @position, @title, @description)
      `);

    res.status(201).json({ message: 'Tạo nội dung thành công' });
  } catch (err) {
    console.error('Lỗi khi tạo nội dung:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

module.exports = { createContent };