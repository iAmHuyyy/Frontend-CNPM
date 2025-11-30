document.addEventListener("DOMContentLoaded", () => {
  const accessToken = localStorage.getItem("token");

  if (!accessToken) {
    alert("Bạn chưa đăng nhập.");
    return;
  }

  let allCourses = [];

  function renderCourses(courses) {
    const grid = document.getElementById("course-grid");
    grid.innerHTML = "";

    if (!courses || courses.length === 0) {
      grid.innerHTML = "<p>Không có khóa học nào được tìm thấy.</p>";
      return;
    }

    courses.forEach((course, index) => {
      // div lớn
      const card = document.createElement("div");
      card.className = "course-card";

      // div nhỏ ở trên: ảnh nền
      const bgIndex = (index % 4) + 1;
      const backgroundDiv = document.createElement("div");
      backgroundDiv.className = "card-background";
      backgroundDiv.style.backgroundImage = `url('../../Asset/image/E${bgIndex}.png')`;

      // div nhỏ ở dưới: thông tin
      const infoDiv = document.createElement("div");
      infoDiv.className = "card-info";
      infoDiv.innerHTML = `
        <h3>${course.semester}</h3>
        <p><strong>${course.course_code} - ${course.title}</strong></p>
        <p>${course.tutor_name}</p>
      `;

      // ghép lại
      card.appendChild(backgroundDiv);
      card.appendChild(infoDiv);
      grid.appendChild(card);

      // ✅ xử lý click: lưu section_id và chuyển trang
      card.addEventListener("click", () => {
        localStorage.setItem("selectedSectionId", course.section_id);
        window.location.href = "content.html";
      });
    });
  }

  // gọi API mới để lấy danh sách section đã đăng ký
  fetch("http://localhost:3000/api/sections/enrolled", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  })
    .then(res => res.json())
    .then(data => {
      allCourses = data || [];
      renderCourses(allCourses);
    })
    .catch(err => {
      console.error("Lỗi khi lấy danh sách section:", err);
      alert("Không thể tải danh sách section.");
    });

  // lọc môn học
  document.getElementById("search-btn").addEventListener("click", () => {
    const selected = document.getElementById("subject-filter").value;
    const filtered = selected
      ? allCourses.filter(c => c.course_code === selected)
      : allCourses;
    renderCourses(filtered);
  });
});