const sql = require('mssql');
const config = require('./../config');

async function getAllCourse(req, res) {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM Course');
    return res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error in getAllCourse:', err);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { getAllCourse };