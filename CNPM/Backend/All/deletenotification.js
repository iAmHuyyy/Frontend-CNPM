const jwt = require('jsonwebtoken');
const sql = require('mssql');
const config = require('./../config');

const INTERNAL_SECRET_KEY = 'app_internal_secret_key';

async function deleteNotification(req, res) {
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

    const userId = decoded.id; // user_id của người dùng
    const pool = await sql.connect(config);

    // Lấy notification_id từ params hoặc body
    const { notification_id } = req.params; // nếu dùng route /api/notifications/:notification_id
    if (!notification_id) {
      return res.status(400).json({ error: 'Bad Request', message: 'Thiếu notification_id' });
    }

    // Kiểm tra notification có tồn tại và thuộc về user này không
    const checkResult = await pool.request()
      .input('notification_id', sql.Int, notification_id)
      .input('user_id', sql.Int, userId)
      .query(`
        SELECT notification_id 
        FROM Notification 
        WHERE notification_id = @notification_id AND user_id = @user_id
      `);

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'Không tìm thấy thông báo hoặc không thuộc về bạn' });
    }

    // Xóa notification
    await pool.request()
      .input('notification_id', sql.Int, notification_id)
      .query(`DELETE FROM Notification WHERE notification_id = @notification_id`);

    res.status(200).json({ message: 'Xóa thông báo thành công' });
  } catch (err) {
    console.error('Lỗi khi xóa notification:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

module.exports = { deleteNotification };