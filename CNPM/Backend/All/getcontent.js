const jwt = require('jsonwebtoken');
const sql = require('mssql');
const config = require('./../config');

const INTERNAL_SECRET_KEY = 'app_internal_secret_key';

async function getContentBySection(req, res) {
  try {
    // Lấy token từ header để xác thực
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

    const { section_id } = req.query;

    if (!section_id) {
      return res.status(400).json({ error: 'Bad Request', message: 'Thiếu section_id' });
    }

    const pool = await sql.connect(config);

    const result = await pool.request()
      .input('section_id', sql.Int, section_id)
      .query(`
        SELECT 
          section_id,
          position,
          title,
          description
        FROM Content
        WHERE section_id = @section_id
        ORDER BY position ASC
      `);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Lỗi khi lấy content:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

module.exports = { getContentBySection };