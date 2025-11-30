document.addEventListener("DOMContentLoaded", () => {
  const createBtn = document.getElementById("createBtn");

  createBtn.addEventListener("click", async () => {
    const sectionCode = document.getElementById("sectionCode").value.trim();
    const semester = document.getElementById("semester").value.trim();
    const courseId = localStorage.getItem("selectedCourseId");
    const token = localStorage.getItem("token");

    if (!sectionCode || !semester || !courseId || !token) {
      alert("Vui lòng nhập đầy đủ thông tin và đảm bảo đã đăng nhập.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/createsection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          course_id: parseInt(courseId),
          section_code: sectionCode,
          semester: semester
        })
      });

      const result = await res.json();

      if (res.ok) {
        alert("Tạo section thành công!");
        // Optionally redirect or clear form
      } else {
        alert("Lỗi: " + result.message);
      }
    } catch (err) {
      console.error("Lỗi khi tạo section:", err);
      alert("Đã xảy ra lỗi khi gửi yêu cầu.");
    }
  });
});