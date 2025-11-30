const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 8888;

app.use(cors());
app.use(bodyParser.json());

const SECRET_KEY = 'hcmut_sso_secret_key';

// Dữ liệu tài liệu hardcode theo course_code
const documents = {
  'CS101': `Tài liệu Nhập môn Khoa học Máy tính:
- Giới thiệu tổng quan về ngành Khoa học Máy tính.
- Lịch sử phát triển và ứng dụng trong thực tế.
- Các khái niệm cơ bản: phần cứng, phần mềm, hệ điều hành.
- Bài tập thực hành nhập môn.
- Link tải tài liệu: http://library.hcmut.edu.vn/docs/cs101.pdf
- Link video khóa học miễn phí: http://library.hcmut.edu.vn/video/cs101
- Link mượn sách liên quan: http://library.hcmut.edu.vn/book/borrow/cs101`,

  'CS102': `Tài liệu Cấu trúc dữ liệu:
- Các cấu trúc dữ liệu cơ bản: mảng, danh sách liên kết, ngăn xếp, hàng đợi.
- Cây nhị phân, cây cân bằng, đồ thị.
- Phân tích độ phức tạp và ứng dụng.
- Bài tập lập trình minh họa.
- Link tải tài liệu: http://library.hcmut.edu.vn/docs/cs102.pdf
- Link video khóa học miễn phí: http://library.hcmut.edu.vn/video/cs102
- Link mượn sách liên quan: http://library.hcmut.edu.vn/book/borrow/cs102`,

  'CS103': `Tài liệu Thuật toán nâng cao:
- Các thuật toán tìm kiếm và sắp xếp nâng cao.
- Thuật toán quy hoạch động, tham lam, chia để trị.
- Bài toán NP-Complete và các phương pháp xấp xỉ.
- Bài tập nâng cao kèm lời giải.
- Link tải tài liệu: http://library.hcmut.edu.vn/docs/cs103.pdf
- Link video khóa học miễn phí: http://library.hcmut.edu.vn/video/cs103
- Link mượn sách liên quan: http://library.hcmut.edu.vn/book/borrow/cs103`,

  'CS104': `Tài liệu Lập trình hướng đối tượng:
- Khái niệm class, object, kế thừa, đa hình.
- Thiết kế phần mềm theo mô hình OOP.
- Thực hành với Java/C++.
- Bài tập đồ án nhỏ.
- Link tải tài liệu: http://library.hcmut.edu.vn/docs/cs104.pdf
- Link video khóa học miễn phí: http://library.hcmut.edu.vn/video/cs104
- Link mượn sách liên quan: http://library.hcmut.edu.vn/book/borrow/cs104`,

  'CS105': `Tài liệu Cơ sở dữ liệu:
- Mô hình quan hệ và SQL cơ bản.
- Thiết kế cơ sở dữ liệu, chuẩn hóa.
- Quản lý giao dịch và tối ưu truy vấn.
- Bài tập thực hành với MySQL.
- Link tải tài liệu: http://library.hcmut.edu.vn/docs/cs105.pdf
- Link video khóa học miễn phí: http://library.hcmut.edu.vn/video/cs105
- Link mượn sách liên quan: http://library.hcmut.edu.vn/book/borrow/cs105`,

  'CS106': `Tài liệu Mạng máy tính:
- Kiến trúc mạng, mô hình OSI và TCP/IP.
- Các giao thức mạng phổ biến.
- Bảo mật mạng và ứng dụng thực tế.
- Bài tập mô phỏng mạng.
- Link tải tài liệu: http://library.hcmut.edu.vn/docs/cs106.pdf
- Link video khóa học miễn phí: http://library.hcmut.edu.vn/video/cs106
- Link mượn sách liên quan: http://library.hcmut.edu.vn/book/borrow/cs106`,

  'CS107': `Tài liệu Hệ điều hành:
- Quản lý tiến trình, bộ nhớ, hệ thống file.
- Lập lịch CPU và đồng bộ hóa.
- Bảo mật và quản lý tài nguyên.
- Bài tập thực hành với Linux.
- Link tải tài liệu: http://library.hcmut.edu.vn/docs/cs107.pdf
- Link video khóa học miễn phí: http://library.hcmut.edu.vn/video/cs107
- Link mượn sách liên quan: http://library.hcmut.edu.vn/book/borrow/cs107`,

  'CS108': `Tài liệu Phân tích thiết kế hệ thống:
- Quy trình phát triển phần mềm.
- Phân tích yêu cầu, thiết kế hệ thống.
- UML và các sơ đồ thiết kế.
- Bài tập case study.
- Link tải tài liệu: http://library.hcmut.edu.vn/docs/cs108.pdf
- Link video khóa học miễn phí: http://library.hcmut.edu.vn/video/cs108
- Link mượn sách liên quan: http://library.hcmut.edu.vn/book/borrow/cs108`,

  'CS109': `Tài liệu Công nghệ phần mềm:
- Nguyên lý phát triển phần mềm.
- Các mô hình phát triển: Waterfall, Agile, Scrum.
- Quản lý dự án phần mềm.
- Bài tập nhóm thực hành.
- Link tải tài liệu: http://library.hcmut.edu.vn/docs/cs109.pdf
- Link video khóa học miễn phí: http://library.hcmut.edu.vn/video/cs109
- Link mượn sách liên quan: http://library.hcmut.edu.vn/book/borrow/cs109`,

  'CS110': `Tài liệu Trí tuệ nhân tạo:
- Giới thiệu AI và các ứng dụng.
- Machine Learning, Deep Learning cơ bản.
- Xử lý ngôn ngữ tự nhiên, thị giác máy tính.
- Bài tập thực hành với Python.
- Link tải tài liệu: http://library.hcmut.edu.vn/docs/cs110.pdf
- Link video khóa học miễn phí: http://library.hcmut.edu.vn/video/cs1010
- Link mượn sách liên quan: http://library.hcmut.edu.vn/book/borrow/cs1010`
};

// API nhận yêu cầu tài liệu
app.post('/api/library/document', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const { course_code } = req.body;

  if (!token || !course_code) {
    return res.status(400).json({ success: false, message: 'Thiếu token hoặc course_code' });
  }

  try {
    // Xác thực token từ HCMUT_SSO
    const decoded = jwt.verify(token, SECRET_KEY);

    // Trả về tài liệu tương ứng
    const content = documents[course_code];
    if (!content) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài liệu cho học phần này' });
    }

    res.json({ success: true, course_code, content });
  } catch (err) {
    console.error('Token không hợp lệ:', err.message);
    res.status(403).json({ success: false, message: 'Token không hợp lệ hoặc hết hạn' });
  }
});

app.listen(PORT, () => {
  console.log(`HCMUT_LIBRARY server đang chạy tại http://localhost:${PORT}`);
});