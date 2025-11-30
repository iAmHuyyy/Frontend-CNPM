document.addEventListener("DOMContentLoaded", async () => {
  const sectionId = localStorage.getItem("selectedSectionId");
  const ssoToken = localStorage.getItem("ssoToken");
  const documentBox = document.getElementById("document-content");

  if (!sectionId || !ssoToken) {
    documentBox.innerHTML = "<p>Không tìm thấy thông tin đăng nhập hoặc học phần.</p>";
    return;
  }

  try {
    // Gọi API nội bộ để lấy course_code từ section_id
    const courseRes = await fetch(`http://localhost:3000/api/section/${sectionId}/course-code`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    const courseData = await courseRes.json();
    if (!courseData.success || !courseData.course_code) {
      documentBox.innerHTML = "<p>Không tìm thấy mã học phần tương ứng.</p>";
      return;
    }

    const courseCode = courseData.course_code;

    // Gửi yêu cầu đến HCMUT_LIBRARY để lấy tài liệu
    const libraryRes = await fetch("http://localhost:8888/api/library/document", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ssoToken}`
      },
      body: JSON.stringify({ course_code: courseCode })
    });

    const docData = await libraryRes.json();
    if (!docData.success || !docData.content) {
      documentBox.innerHTML = "<p>Không có tài liệu cho học phần này.</p>";
      return;
    }

    // Xử lý và hiển thị tài liệu
    const lines = docData.content.split('\n');

    const formatted = lines.map(line => {
      if (line.includes('http')) {
        const parts = line.split(': ');
        const label = parts[0].replace('-', '').trim();
        const url = parts[1];
        return `<p><strong>${label}:</strong> <a href="${url}" target="_blank">${url}</a></p>`;
      }

      if (line.startsWith('Tài liệu')) {
        return `<h2>${line}</h2>`;
      }

      return `<p>• ${line.replace('-', '').trim()}</p>`;
    }).join('');

    documentBox.innerHTML = formatted;
  } catch (err) {
    console.error("Lỗi khi tải tài liệu:", err);
    documentBox.innerHTML = "<p>Đã xảy ra lỗi khi tải tài liệu.</p>";
  }
});