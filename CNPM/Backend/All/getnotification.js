const jwt = require('jsonwebtoken');
const sql = require('mssql');
const config = require('./../config');

const INTERNAL_SECRET_KEY = 'app_internal_secret_key';

async function getNotifications(req, res) {
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

    const userId = decoded.id;
    const pool = await sql.connect(config);

    const result = await pool.request()
      .input('user_id', sql.Int, userId)
      .query(`
        SELECT 
          notification_id,
          description,
          created_at = ISNULL(created_at, GETDATE())
        FROM Notification
        WHERE user_id = @user_id
        ORDER BY notification_id DESC
      `);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Lỗi khi lấy notification:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

module.exports = { getNotifications };