// update.js
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const config = require('./../config');

const INTERNAL_SECRET_KEY = 'app_internal_secret_key';

async function updateUserInfo(req, res) {
  try {
    // Lấy token nội bộ từ header
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'Thiếu token nội bộ' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, INTERNAL_SECRET_KEY);
    } catch (err) {
      return res.status(403).json({ success: false, message: 'Token nội bộ không hợp lệ hoặc hết hạn' });
    }

    const userId = decoded.id;
    const role = decoded.role;

    // Dữ liệu từ DATACORE
    const {
      fullName,
      dob,
      gender,
      cccd,
      phone,
      emailEdu,
      emailPersonal,
      faculty,
      major,
      program,
      department,
      position,
      academicLevel,
      status
    } = req.body;

    const pool = await sql.connect(config);

    // Cập nhật bảng Users
    await pool.request()
      .input('user_id', sql.Int, userId)
      .input('fullname', sql.NVarChar(255), fullName)
      .input('edu_email', sql.VarChar(254), emailEdu)
      .input('email', sql.VarChar(254), emailPersonal)
      .input('cccd', sql.VarChar(30), cccd)
      .input('dob', sql.Date, dob)
      .input('gender', sql.NVarChar(10), gender)
      .input('role', sql.VarChar(10), role)
      .input('phone', sql.VarChar(30), phone)
      .query(`
        MERGE Users AS target
        USING (SELECT @user_id AS user_id) AS source
        ON target.user_id = source.user_id
        WHEN MATCHED THEN UPDATE SET fullname=@fullname, edu_email=@edu_email, email=@email,
            cccd=@cccd, dob=@dob, gender=@gender, role=@role, phone=@phone
        WHEN NOT MATCHED THEN INSERT (user_id, fullname, edu_email, email, cccd, dob, gender, role, phone)
        VALUES (@user_id, @fullname, @edu_email, @email, @cccd, @dob, @gender, @role, @phone);
      `);

    // Nếu là mentee -> cập nhật bảng Student
    if (role === 'mentee') {
      await pool.request()
        .input('student_id', sql.Int, userId)
        .input('faculty', sql.NVarChar(255), faculty)
        .input('major', sql.NVarChar(255), major)
        .input('program', sql.NVarChar(255), program)
        .query(`
          MERGE Student AS target
          USING (SELECT @student_id AS student_id) AS source
          ON target.student_id = source.student_id
          WHEN MATCHED THEN UPDATE SET faculty=@faculty, major=@major, program=@program
          WHEN NOT MATCHED THEN INSERT (student_id, faculty, major, program)
          VALUES (@student_id, @faculty, @major, @program);
        `);
    }

    // Nếu là tutor -> cập nhật bảng Teacher
    if (role === 'tutor') {
      await pool.request()
        .input('teacher_id', sql.Int, userId)
        .input('faculty', sql.NVarChar(255), faculty)
        .input('department', sql.NVarChar(255), department)
        .input('position', sql.NVarChar(255), position)
        .input('academicLevel', sql.NVarChar(30), academicLevel)
        .query(`
          MERGE Teacher AS target
          USING (SELECT @teacher_id AS teacher_id) AS source
          ON target.teacher_id = source.teacher_id
          WHEN MATCHED THEN UPDATE SET faculty=@faculty, department=@department, position=@position, academicLevel=@academicLevel
          WHEN NOT MATCHED THEN INSERT (teacher_id, faculty, department, position, academicLevel)
          VALUES (@teacher_id, @faculty, @department, @position, @academicLevel);
        `);
    }

    res.json({ success: true, message: 'Cập nhật thông tin thành công' });
  } catch (err) {
    console.error('Lỗi khi cập nhật thông tin:', err);
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
}

module.exports = { updateUserInfo };