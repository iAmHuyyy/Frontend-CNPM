document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.getElementById("courseTableBody");
  const subjectFilter = document.getElementById("subjectFilter");
  const languageFilter = document.getElementById("languageFilter");
  const filterBtn = document.getElementById("filterBtn");

  let allCourses = [];

  async function fetchCourses() {
    try {
      const res = await fetch("http://localhost:3000/api/courses");
      const data = await res.json();
      allCourses = data;
      renderCourses(data);
      populateSubjectFilter(data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách khóa học:", err);
    }
  }

  function populateSubjectFilter(courses) {
    const codes = [...new Set(courses.map(c => c.course_code))];
    codes.forEach(code => {
      const option = document.createElement("option");
      option.value = code;
      option.textContent = code;
      subjectFilter.appendChild(option);
    });
  }

  function renderCourses(courses) {
    tableBody.innerHTML = "";
    courses.forEach(course => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${course.course_code}</td>
        <td>${course.title}</td>
        <td>${course.credits}</td>
        <td>${course.language}</td>
        <td><button class="register-btn" data-id="${course.course_id}">Tạo lớp học</button></td>
      `;

      tableBody.appendChild(row);
    });

  // Gắn sự kiện click cho từng nút sau khi render
  const buttons = document.querySelectorAll(".register-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const courseId = btn.getAttribute("data-id");
      localStorage.setItem("selectedCourseId", courseId);
      window.location.href = "createsection.html";
    });
  });
  }

  filterBtn.addEventListener("click", () => {
    const subjectVal = subjectFilter.value;
    const languageVal = languageFilter.value;

    const filtered = allCourses.filter(course => {
      const subjectMatch = subjectVal ? course.course_code === subjectVal : true;
      const languageMatch = languageVal ? course.language === languageVal : true;
      return subjectMatch && languageMatch;
    });

    renderCourses(filtered);
  });

  fetchCourses();
});