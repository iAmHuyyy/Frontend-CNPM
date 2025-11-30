document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.getElementById("scheduleTableBody");
  const subjectFilter = document.getElementById("subjectFilter");
  const filterBtn = document.getElementById("filterBtn");
  const token = localStorage.getItem("token");

  let allSchedules = [];

  if (!token) {
    alert("Vui lòng đăng nhập để xem lịch sử.");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/schedule/tutor", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const schedules = await res.json();

    if (!res.ok) {
      alert("Lỗi: " + (schedules.message || "Không thể tải lịch dạy."));
      return;
    }

    allSchedules = schedules;
    renderSchedule(schedules);
    populateSubjectFilter(schedules);
  } catch (err) {
    console.error("Lỗi khi tải lịch dạy:", err);
    alert("Đã xảy ra lỗi khi tải lịch dạy.");
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function renderSchedule(data) {
    tableBody.innerHTML = "";
    data.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${item.course_code} - ${item.title}</td>
        <td>${item.slots}</td>
        <td>${formatDate(item.study_date)}</td>
        <td>${item.start_time} - ${item.end_time}</td>
        <td>${item.semester}</td>
        <td><button class="change-btn" data-id="${item.schedule_id}">Hủy / Đổi</button></td>
    `;
    tableBody.appendChild(row);
    });

    // Gắn sự kiện click cho nút "Hủy / Đổi"
    const changeButtons = document.querySelectorAll(".change-btn");
    changeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const scheduleId = btn.getAttribute("data-id");
        localStorage.setItem("selectedScheduleId", scheduleId);
        window.location.href = "chaneschedule.html";
    });
    });
  }

  function populateSubjectFilter(data) {
    const codes = [...new Set(data.map(item => item.course_code))];
    codes.forEach(code => {
      const option = document.createElement("option");
      option.value = code;
      option.textContent = code;
      subjectFilter.appendChild(option);
    });
  }

  filterBtn.addEventListener("click", () => {
    const selectedCode = subjectFilter.value;
    const filtered = selectedCode
      ? allSchedules.filter(item => item.course_code === selectedCode)
      : allSchedules;
    renderSchedule(filtered);
  });
});