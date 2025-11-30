// mgetcourse.js
const sql = require('mssql');
const config = require('./../config');

async function getCourseCode(req, res) {
  const sectionId = req.params.section_id;

  if (!sectionId) {
    return res.status(400).json({ success: false, message: 'Thiếu section_id' });
  }

  try {
    const pool = await sql.connect(config);

    // Truy vấn course_id từ Section
    const sectionResult = await pool.request()
      .input('section_id', sql.Int, sectionId)
      .query('SELECT course_id FROM Section WHERE section_id = @section_id');

    if (sectionResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy section' });
    }

    const courseId = sectionResult.recordset[0].course_id;

    // Truy vấn course_code từ Course
    const courseResult = await pool.request()
      .input('course_id', sql.Int, courseId)
      .query('SELECT course_code FROM Course WHERE course_id = @course_id');

    if (courseResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy học phần' });
    }

    const courseCode = courseResult.recordset[0].course_code;

    res.json({ success: true, course_code: courseCode });
  } catch (err) {
    console.error('Lỗi khi truy vấn course_code:', err);
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
}

module.exports = { getCourseCode };